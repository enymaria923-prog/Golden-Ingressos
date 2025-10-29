// app/actions-auth.js
// O "Backend" do Login e Cadastro

"use server"; // <-- Mágico! Diz ao Next.js que isso roda SÓ no servidor.

import { createClient } from '../utils/supabase/server'; // <-- O "cérebro" que já corrigimos
import { redirect } from 'next/navigation';

// --- FUNÇÃO DE LOGIN ---
export async function login(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const supabase = createClient();

  // Chama a função de login do Supabase
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Erro no login:", error);
    // Em um site real, mostraríamos um erro na tela.
    // Por enquanto, vamos redirecionar de volta para a pág. de login com erro
    return redirect('/login?message=Erro ao tentar logar');
  }

  // Se o login deu certo, redireciona para a Home
  return redirect('/');
}

// --- FUNÇÃO DE CADASTRO (SIGNUP) ---
export async function signup(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const supabase = createClient();

  // Chama a função de cadastro do Supabase
  const { error } = await supabase.auth.signUp({
    email,
    password,
    // 'options' é onde poderíamos colocar 'nome', 'sobrenome', etc.
    // Por enquanto, só email e senha.
  });

  if (error) {
    console.error("Erro no cadastro:", error);
    // Em um site real, mostraríamos um erro na tela.
    return redirect('/login?message=Erro ao tentar criar conta');
  }

  // Se o cadastro deu certo, redireciona para a Home
  // O Supabase vai enviar um email de confirmação.
  return redirect('/');
}
