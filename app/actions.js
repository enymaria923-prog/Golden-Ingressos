// app/actions.js
// AÇÃO DO SERVIDOR: LÓGICA DE UPLOAD E INSERÇÃO DE DADOS CORRIGIDA

'use server';

import { createClient } from '../utils/supabase/server'; 
import { revalidatePath } from 'next/cache'; 
import { redirect } from 'next/navigation'; 

// Função PRINCIPAL: Responsável por processar o formulário de novo evento
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

  // 2. EXTRAIR OS DADOS DO FORMULÁRIO (Incluindo a imagem)
  const nome = formData.get('nome');
  const capaFile = formData.get('capa');  
  const categoria = formData.get('categoria');
  const data = formData.get('data');
  const hora = formData.get('hora');
  const local = formData.get('local');
  const preco = formData.get('preco');
  const descricao = formData.get('descricao');
  
  let imagem_url = null;

  // 3. FAZER O UPLOAD DA IMAGEM PARA O SUPABASE STORAGE
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
  
  // 4. INSERIR OS DADOS NA TABELA 'eventos'
  const { error: insertError } = await supabase
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
        preco,
        descricao,
      },
    ]);

  if (insertError) {
    console.error('Erro ao inserir evento:', insertError);
    return { error: 'Falha ao publicar o evento: ' + insertError.message };
  }
  
  // 5. FINALIZAÇÃO: Recarrega a Home e redireciona para lá
  revalidatePath('/');  
  redirect('/');
}
