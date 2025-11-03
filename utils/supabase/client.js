'use client'; // <-- ADICIONA ISSO PARA CORRIGIR O BUILD DO VERCEL

import { createBrowserClient } from '@supabase/ssr';

// ===================================================================
// CORREÇÃO: 
// Voltamos a criar a instância 'supabase' aqui e exportar ELA
// (Isso corrige o 'publicar-evento' e o 'bokunohero')
// ===================================================================
// No arquivo: utils/supabase/client.js
// CORRIJA a linha 10 - está "ANNU_KEY" mas deveria ser "ANON_KEY"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // ← CORRIGIDO
});
export { supabase };
