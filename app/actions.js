// app/actions.js - O Backend (Atualizado para Supabase)

"use server"; // <-- Isso é importante

// 1. Importa o "cérebro" do Supabase (com o caminho CORRETO)
import { createClient } from '../utils/supabase/server'; 
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Esta é a função que o formulário chama
export async function criarEvento(formData) {
  
  // 2. Cria o cliente Supabase
  const supabase = createClient();

  // 3. Pega os dados do formulário
  const dadosDoFormulario = {
    nome: formData.get('nome'),
    categoria: formData.get('categoria'),
    data: formData.get('data'),
    hora: formData.get('hora'),
    local: formData.get('local'),
    preco: formData.get('preco'),
    descricao: formData.get('descricao'),
    // NOTA: user_id e image_url virão quando fizermos o Login/Upload
  };

  // 4. Tenta salvar no banco de dados
  const { error } = await supabase
    .from('eventos') // Seleciona a tabela 'eventos'
    .insert([dadosDoFormulario]); // Insere os dados

  if (error) {
    // Se der erro, mostra no console (visível no Vercel Logs)
    console.error("Erro ao salvar evento:", error);
    // Em um site real, retornaríamos uma mensagem de erro para o usuário
    return;
  }

  // 5. Se deu certo:
  
  // Limpa o cache da Home Page (para o novo evento aparecer)
  revalidatePath('/'); 
  
  // Redireciona o usuário de volta para a Home Page
  redirect('/'); 
}
