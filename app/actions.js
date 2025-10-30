// app/actions.js - VERSÃO CORRIGIDA SEM ERRO DE REDIRECT
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
  
  // 3. EXTRAIR INGRESSOS
  const quantidadeIngressos = parseInt(formData.get('quantidade_ingressos')) || 1;
  const ingressos = [];
  
  for (let i = 0; i < quantidadeIngressos; i++) {
    const tipo = formData.get(`ingresso_tipo_${i}`);
    const valor = formData.get(`ingresso_valor_${i}`);
    if (tipo && valor) {
      ingressos.push({ tipo, valor });
    }
  }
  
  if (ingressos.length === 0) {
    return { error: 'Adicione pelo menos um tipo de ingresso.' };
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
    user_id: user_id
  }));

  await supabase
    .from('ingressos')
    .insert(ingressosParaInserir);

  // 7. SUCESSO - Retornar sucesso em vez de redirect
  revalidatePath('/');
  return { success: true, message: 'Evento publicado com sucesso!' };
}
