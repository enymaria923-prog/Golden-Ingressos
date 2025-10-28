// app/actions.js - O Backend (Server Action)

"use server"; // <-- Mágico! Diz ao Next.js que isso roda SÓ no servidor.

import { sql } from '@vercel/postgres'; // <-- Importa o "tradutor" que instalamos
import { revalidatePath } from 'next/cache'; // <-- Ferramenta para atualizar a Home
import { redirect } from 'next/navigation'; // <-- Ferramenta para redirecionar o usuário

// Esta é a função que o formulário chama
export async function criarEvento(formData) {
  
  // 1. Pega os dados do formulário
  const nome = formData.get('nome');
  const categoria = formData.get('categoria');
  const data = formData.get('data');
  const hora = formData.get('hora');
  const local = formData.get('local');
  const preco = formData.get('preco');
  const descricao = formData.get('descricao');

  // 2. Tenta salvar no banco de dados
  try {
    await sql`
      INSERT INTO eventos (nome, data, hora, local, descricao, preco, categoria)
      VALUES (${nome}, ${data}, ${hora}, ${local}, ${descricao}, ${preco}, ${categoria})
    `;
  } catch (error) {
    // Se der erro, mostra no console (visível no Vercel Logs)
    console.error("Erro ao salvar evento:", error);
    // Poderíamos retornar uma mensagem de erro aqui
    return;
  }

  // 3. Se deu certo:
  
  // Limpa o cache da Home Page (para o novo evento aparecer)
  revalidatePath('/'); 
  
  // Redireciona o usuário de volta para a Home Page
  redirect('/'); 
}
