import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Variáveis de ambiente do Supabase não encontradas');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export { supabase };
export default supabase;
