import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Variáveis de ambiente do Supabase não encontradas');
}

// Função para criar cliente que lê cookies do navegador
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}

// Instância default (compatibilidade com código antigo)
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export { supabase };
export default supabase;
