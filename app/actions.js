// app/actions.js - O Backend (Atualizado para Supabase)

"use server"; // <-- Isso continua igual

// 1. Importa o "cérebro" do Supabase que criamos
import { createClient } from '@/utils/supabase/server'; 
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Esta é a função que o formulário chama
export async function criarEvento(formData) {
  
  // 2. Cria o cliente Supabase
  const supabase = createClient();

  // 3. Pega os dados do formulário (igual a antes)
  const dadosDoFormulario = {
    nome: formData.get('nome'),
    categoria: formData.get('categoria'),
    data: formData.get('data'),
    hora: formData.get('hora'),
    local: formData.get('local'),
    preco: formData.get('preco'),
    descricao: formData.get('descricao'),
    // NOTA: Ainda falta o ID do vendedor e a URL da imagem.
    // Vamos adicionar isso quando fizermos o Login e o Upload.
  };

  // 4. Tenta salvar no banco de dados (sintaxe do Supabase)
  const { error } = await supabase
    .from('eventos') // Seleciona a tabela 'eventos'
    .insert([dadosDoFormulario]); // Insere os dados

  if (error) {
    // Se der erro, mostra no console (visível no Vercel Logs)
    console.error("Erro ao salvar evento:", error);
    return;
  }

  // 5. Se deu certo (igual a antes):
  revalidatePath('/'); 
  redirect('/'); 
}
