// app/actions.js
'use server';

import { createClient } from './utils/supabase/server';
import { revalidatePath } from 'next/cache'; // Usado para forçar a Home a atualizar
import { redirect } from 'next/navigation'; // Usado para redirecionar após o sucesso

// Função PRINCIPAL: Responsável por processar o formulário de novo evento
export async function criarEvento(formData) {
  
  const supabase = createClient();
  
  // 1. OBRIGATÓRIO: Obter o ID do usuário (produtor) logado
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    // Se não estiver logado, redireciona (isso não deveria acontecer, pois a página está protegida)
    redirect('/login');
    return;
  }
  const user_id = userData.user.id;

  // 2. EXTRAIR OS DADOS DO FORMULÁRIO (Incluindo a imagem)
  const nome = formData.get('nome');
  // NOVO: A imagem é recebida como um objeto File
  const capaFile = formData.get('capa'); 
  const categoria = formData.get('categoria');
  const data = formData.get('data');
  const hora = formData.get('hora');
  const local = formData.get('local');
  const preco = formData.get('preco');
  const descricao = formData.get('descricao');
  
  // Variável para guardar o URL da imagem
  let imagem_url = null;

  // 3. FAZER O UPLOAD DA IMAGEM PARA O SUPABASE STORAGE
  if (capaFile && capaFile.size > 0) {
    // Gerar um nome de arquivo único (ex: "IDdoUsuario_NomeDoEvento_timestamp.jpg")
    const fileExtension = capaFile.name.split('.').pop();
    const fileName = `${user_id}_${Date.now()}.${fileExtension}`;

    // Tentar fazer o upload para o bucket 'imagens_eventos'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('imagens_eventos') // O nome do bucket que criamos
      .upload(fileName, capaFile, {
        cacheControl: '3600',
        upsert: false // Não substitui
      });

    if (uploadError) {
      console.error('Erro no upload da imagem:', uploadError);
      // Se falhar o upload, podemos continuar sem a imagem ou retornar um erro.
      // Por enquanto, vamos retornar um erro simples:
      return { error: 'Falha ao fazer upload da imagem.' };
    }

    // Se o upload foi um sucesso, obter o URL público
    const { data: publicUrlData } = supabase.storage
      .from('imagens_eventos')
      .getPublicUrl(fileName); // O fileName é o caminho dentro do bucket

    imagem_url = publicUrlData.publicUrl;
  }
  
  // 4. INSERIR OS DADOS NA TABELA 'eventos'
  const { error: insertError } = await supabase
    .from('eventos')
    .insert([
      {
        nome,
        // CRÍTICO: Incluímos o URL da imagem e o ID do produtor
        imagem_url: imagem_url, 
        user_id: user_id,
        // Fim dos novos campos
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
    return { error: 'Falha ao publicar o evento.' };
  }
  
  // 5. FINALIZAÇÃO: Recarrega a Home e redireciona para lá
  revalidatePath('/'); 
  redirect('/');
}
