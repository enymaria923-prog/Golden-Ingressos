import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificação simples
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Variáveis de ambiente do Supabase não encontradas');
}

// Criação do cliente
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Exporta também como default pra compatibilidade
export default supabase;
