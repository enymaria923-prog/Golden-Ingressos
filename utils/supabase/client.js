'use client';

import { createClient } from '@supabase/supabase-js';

// Corrigi o nome do pacote (supabase.js -> supabase-js)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Adicione validação para evitar erros em build
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
