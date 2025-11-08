// app/actions-auth.js
// O "Backend" do Login, Cadastro e Logout

"use server";

import { createClient } from '../utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// --- FUNÇÃO DE LOGIN ---
export async function login(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Erro no login:", error);
    return redirect('/login?message=Erro ao tentar logar');
  }

  revalidatePath('/');
  return redirect('/');
}

// --- FUNÇÃO DE CADASTRO (SIGNUP) ---
export async function signup(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Erro no cadastro:", error);
    return redirect('/login?message=Erro ao tentar criar conta');
  }

  revalidatePath('/');
  return redirect('/');
}

// --- FUNÇÃO DE LOGOUT (SAIR) ---
export async function logout() {
  const supabase = createClient();
  
  await supabase.auth.signOut();
  
  revalidatePath('/');
  return redirect('/');
}
// Adicione esta função ao arquivo actions-auth.js existente

export async function signupProdutor(formData) {
  const supabase = createClient();
  
  const email = formData.get('email');
  const password = formData.get('password');
  const nome_completo = formData.get('nome_completo');
  const nome_empresa = formData.get('nome_empresa');
  const chave_pix = formData.get('chave_pix');
  const tipo_chave_pix = formData.get('tipo_chave_pix');
  const dados_bancarios = formData.get('dados_bancarios');
  const forma_pagamento = formData.get('forma_pagamento');

  // Verificar se as senhas coincidem
  const confirm_password = formData.get('confirm_password');
  if (password !== confirm_password) {
    throw new Error('As senhas não coincidem');
  }

  try {
    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'produtor',
          nome_completo,
        },
      },
    });

    if (authError) {
      throw authError;
    }

    // Inserir dados na tabela 'produtores'
    const { error: profileError } = await supabase
      .from('produtores')
      .insert([
        {
          id: authData.user.id,
          nome_completo,
          nome_empresa,
          chave_pix,
          tipo_chave_pix,
          dados_bancarios,
          forma_pagamento,
          created_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      throw profileError;
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Erro no cadastro:', error);
    throw error;
  }
}
