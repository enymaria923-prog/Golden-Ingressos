import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Variáveis de ambiente do Supabase não encontradas');
}

// Função para criar cliente
export function createClient() {
  return supabaseCreateClient(supabaseUrl || '', supabaseKey || '');
}

// Instância default
const supabase = supabaseCreateClient(supabaseUrl || '', supabaseKey || '');

export { supabase };
export default supabase;
