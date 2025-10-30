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
