'use client';

import { createClient } from '@supabase/supabase-js'; // Nome correto do pacote

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificação para debug
console.log('Supabase URL:', supabaseUrl ? 'Presente' : 'Faltando');
console.log('Supabase Key:', supabaseKey ? 'Presente' : 'Faltando');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente do Supabase não encontradas');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
