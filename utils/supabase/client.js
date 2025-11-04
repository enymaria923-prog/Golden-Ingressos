'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificação das variáveis
console.log('Supabase URL presente:', !!supabaseUrl);
console.log('Supabase Key presente:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  
  // Client mock para evitar erros
  const mockClient = {
    from: (table) => ({
      select: () => Promise.resolve({ data: null, error: new Error('Supabase não configurado') }),
      insert: () => Promise.resolve({ error: new Error('Supabase não configurado') }),
      update: () => Promise.resolve({ error: new Error('Supabase não configurado') }),
      delete: () => Promise.resolve({ error: new Error('Supabase não configurado') })
    })
  };
  
  export const supabase = mockClient;
} else {
  // Client real do Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);
  export { supabase };
}
