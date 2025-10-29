// app/actions.js - VERSÃO CORRIGIDA PARA MÚLTIPLOS INGRESSOS
'use server';

import { createClient } from '../utils/supabase/server'; 
import { revalidatePath } from 'next/cache'; 
import { redirect } from 'next/navigation'; 

export async function criarEvento(formData) {
  
  const supabase = createClient();
  
  // 1. OBRIGATÓRIO: Obter o ID do usuário (produtor) logado
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    console.error('Usuário não logado, redirecionando.');
    redirect('/login');
    return;
  }
  const user_id = userData.user.id;

  // 2. EXTRAIR OS DADOS DO FORMULÁRIO
  const nome = formData.get('nome');
  const capaFile = formData.get('capa');  
  const categoria = formData.get('categoria');
  const data = formData.get('data');
  const hora = formData.get('hora');
  const local = formData.get('local');
  const descricao = formData.get('descricao');
  
  // 3. EXTRAIR MÚLTIPLOS INGRESSOS
  const quantidadeIngressos = parseInt(formData.get('quantidade_ingressos')) || 1;
  const ingressos = [];
  
  for (let i = 0; i < quantidadeIngressos; i++) {
    const tipo = formData.get(`ingresso_tipo_${i}`);
    const valor = formData.get(`ingresso_valor_${i}`);
    
    if (tipo && valor) {
      ingressos.push({ tipo, valor });
    }
  }
  
  // Verificar se temos pelo menos um ingresso
  if (ingressos.length === 0) {
    return { error: 'É necessário adicionar pelo menos um tipo de ingresso.' };
  }

  let imagem_url = null;

  // 4. FAZER O UPLOAD DA IMAGEM PARA O SUPABASE STORAGE
  if (capaFile && capaFile.size > 0) {
    try {
      const fileExtension = capaFile.name.split('.').pop();
      const fileName = `${user_id}_${Date.now()}.${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('imagens_eventos') 
        .upload(fileName, capaFile, {
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) {
        console.error('Erro no upload da imagem:', uploadError);
        return { error: 'Falha ao fazer upload da imagem: ' + uploadError.message };
      }

      const { data: publicUrlData } = supabase.storage
        .from('imagens_eventos')
        .getPublicUrl(fileName); 

      imagem_url = publicUrlData.publicUrl;
      
    } catch (e) {
      console.error('Erro de exceção no upload:', e);
      return { error: 'Ocorreu uma exceção inesperada durante o upload.' };
    }
  }
  
  // 5. INSERIR O EVENTO NA TABELA 'eventos'
  const { data: eventoInserido, error: insertError } = await supabase
    .from('eventos')
    .insert([
      {
        nome,
        imagem_url: imagem_url,  
        user_id: user_id,
        categoria,
        data,
        hora,
        local,
        descricao,
        preco: ingressos[0].valor, // Mantemos o primeiro preço para compatibilidade
      },
    ])
    .select()
    .single();

  if (insertError) {
    console.error('Erro ao inserir evento:', insertError);
    return { error: 'Falha ao publicar o evento: ' + insertError.message };
  }

  // 6. INSERIR OS MÚLTIPLOS INGRESSOS NA TABELA 'ingressos'
  const ingressosParaInserir = ingressos.map(ingresso => ({
    evento_id: eventoInserido.id,
    tipo: ingresso.tipo,
    valor: ingresso.valor,
    user_id: user_id
  }));

  const { error: ingressosError } = await supabase
    .from('ingressos')
    .insert(ingressosParaInserir);

  if (ingressosError) {
    console.error('Erro ao inserir ingressos:', ingressosError);
    // Não vamos falhar completamente se der erro nos ingressos, mas logamos
  }
  
  // 7. FINALIZAÇÃO: Recarrega a Home e redireciona
  revalidatePath('/');  
  redirect('/');
}
