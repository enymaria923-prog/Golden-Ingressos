// app/actions-perfil.js
// O "Backend" que salva o Perfil do Produtor

"use server"; // <-- Mágico! Diz ao Next.js que isso roda SÓ no servidor.

import { createClient } from '../utils/supabase/server'; // O "cérebro" que já corrigimos
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// --- FUNÇÃO DE ATUALIZAR O PERFIL ---
export async function atualizarPerfil(formData) {
  
  const supabase = createClient();

  // 1. Pega o usuário logado (para saber QUEM estamos a atualizar)
  const { data: { user } } = await supabase.auth.getUser();

  // Se, por algum motivo, o usuário não estiver logado, manda-o para o Login.
  if (!user) {
    return redirect('/login?message=Você precisa estar logado para salvar seu perfil.');
  }

  // 2. Pega todos os dados do formulário
  const dadosDoPerfil = {
    // O 'id' é a chave mais importante.
    // Ele "liga" este perfil ao usuário logado.
    id: user.id, 
    
    nome_completo: formData.get('nome_completo'),
    chave_pix: formData.get('chave_pix'),
    tipo_chave_pix: formData.get('tipo_chave_pix'),
    banco_conta_corrente: formData.get('banco_conta_corrente'),
    preferencia_pagamento: formData.get('preferencia_pagamento'),
  };

  // 3. Salva no banco de dados usando "upsert"
  // "Upsert" = Se o perfil (com esse 'id') já existe, ATUALIZE (UPDATE).
  //           Se não existe, CRIE (INSERT).
  // É perfeito para páginas de perfil.
  const { error } = await supabase
    .from('perfis')
    .upsert(dadosDoPerfil); // Usa .upsert() em vez de .insert()

  if (error) {
    console.error("Erro ao salvar perfil:", error);
    return redirect('/perfil?message=Erro ao salvar o perfil.');
  }

  // 4. Se deu certo:
  
  // Limpa o cache da página /perfil (para o usuário ver os dados novos)
  revalidatePath('/perfil'); 
  
  // Redireciona o usuário de volta para o perfil com msg de sucesso
  return redirect('/perfil?message=Perfil salvo com sucesso!');
}
