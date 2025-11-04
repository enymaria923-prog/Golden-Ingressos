// Remova 'use client' - não é necessário em arquivos utils
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificação simples
if (!supabaseUrl || !supabaseKey) {
  console.warn('Variáveis de ambiente do Supabase não encontradas');
}

// Criação direta do cliente
const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export default supabase;
