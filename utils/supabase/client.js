'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificação das variáveis
console.log('Supabase URL presente:', !!supabaseUrl);
console.log('Supabase Key presente:', !!supabaseKey);

let supabaseInstance;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  
  // Client mock para evitar erros
  supabaseInstance = {
    from: (table) => ({
      select: () => Promise.resolve({ data: null, error: new Error('Supabase não configurado') }),
      insert: () => Promise.resolve({ error: new Error('Supabase não configurado') }),
      update: () => Promise.resolve({ error: new Error('Supabase não configurado') }),
      delete: () => Promise.resolve({ error: new Error('Supabase não configurado') })
    })
  };
} else {
  // Client real do Supabase
  supabaseInstance = createClient(supabaseUrl, supabaseKey);
}

export const supabase = supabaseInstance;
