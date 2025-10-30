// app/actions.js - VERSÃO COM DOIS MODOS DE CONTROLE
'use server';

import { createClient } from '../utils/supabase/server'; 
import { revalidatePath } from 'next/cache'; 
import { redirect } from 'next/navigation'; 

export async function criarEvento(formData) {
  console.log('=== INICIANDO CRIAÇÃO DE EVENTO ===');
  
  const supabase = createClient();

  // 1. VERIFICAR USUÁRIO
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: 'Usuário não logado. Faça login primeiro.' };
  }
  const user_id = userData.user.id;

  // 2. EXTRAIR DADOS
  const nome = formData.get('nome');
  const capaFile = formData.get('capa');  
  const categoria = formData.get('categoria');
  const data = formData.get('data');
  const hora = formData.get('hora');
  const local = formData.get('local');
  const descricao = formData.get('descricao');
  const controleQuantidade = formData.get('controleQuantidade');
  const quantidadeTotal = formData.get('quantidadeTotal');
  
  // 3. EXTRAIR INGRESSOS
  const quantidadeIngressos = parseInt(formData.get('quantidade_ingressos')) || 1;
  const ingressos = [];
  let totalIngressosEvento = 0;
  
  for (let i = 0; i < quantidadeIngressos; i++) {
    const tipo = formData.get(`ingresso_tipo_${i}`);
    const valor = formData.get(`ingresso_valor_${i}`);
    let quantidade = 0;

    if (controleQuantidade === 'porTipo') {
      quantidade = parseInt(formData.get(`ingresso_quantidade_${i}`)) || 0;
    } else if (controleQuantidade === 'total') {
      // No modo total, a quantidade por tipo é ilimitada (até o total), então não usamos o campo de quantidade por tipo.
      // Vamos definir uma quantidade muito alta para cada tipo, mas o controle será pelo total.
      // Na prática, não armazenamos a quantidade por tipo, mas sim o total do evento.
      quantidade = 999999; // Simboliza ilimitado por tipo, mas o total é controlado.
    }
    
    if (tipo && valor) {
      ingressos.push({ tipo, valor, quantidade });
      if (controleQuantidade === 'porTipo') {
        totalIngressosEvento += quantidade;
      }
    }
  }
  
  if (ingressos.length === 0) {
    return { error: 'Adicione pelo menos um tipo de ingresso.' };
  }

  // No modo total, usamos a quantidadeTotal fornecida
  if (controleQuantidade === 'total') {
    totalIngressosEvento = parseInt(quantidadeTotal) || 0;
    if (totalIngressosEvento <= 0) {
      return { error: 'A quantidade total deve ser maior que zero.' };
    }
  }

  // 4. UPLOAD DE IMAGEM (OPCIONAL)
  let imagem_url = 'https://placehold.co/600x400/5d34a4/ffffff?text=Evento+Sem+Imagem';
  
  if (capaFile && capaFile.size > 0) {
    try {
      const fileExtension = capaFile.name.split('.').pop();
      const fileName = `${user_id}_${Date.now()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from('imagens_eventos') 
        .upload(fileName, capaFile);

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('imagens_eventos')
          .getPublicUrl(fileName);
        imagem_url = publicUrlData.publicUrl;
      }
    } catch (e) {
      console.log('Erro no upload, usando imagem padrão');
    }
  }

  // 5. INSERIR EVENTO
  const eventoData = {
    nome,
    imagem_url: imagem_url,
    user_id: user_id,
    categoria,
    data,
    hora,
    local,
    descricao,
    preco: ingressos[0].valor,
    total_ingressos: totalIngressosEvento,
    ingressos_vendidos: 0,
    controle_quantidade: controleQuantidade // Salvar o modo de controle
  };

  const { data: eventoInserido, error: insertError } = await supabase
    .from('eventos')
    .insert([eventoData])
    .select()
    .single();

  if (insertError) {
    console.error('Erro ao inserir evento:', insertError);
    return { error: 'Falha ao publicar: ' + insertError.message };
  }

  // 6. INSERIR INGRESSOS
  const ingressosParaInserir = ingressos.map(ingresso => ({
    evento_id: eventoInserido.id,
    tipo: ingresso.tipo,
    valor: ingresso.valor,
    quantidade: ingresso.quantidade,
    vendidos: 0,
    user_id: user_id
  }));

  const { error: ingressosError } = await supabase
    .from('ingressos')
    .insert(ingressosParaInserir);

  if (ingressosError) {
    console.error('Erro ao inserir ingressos:', ingressosError);
    // Continua mesmo com erro nos ingressos
  }

  // 7. SUCESSO
  revalidatePath('/');
  return { success: true, message: 'Evento publicado com sucesso!' };
}
