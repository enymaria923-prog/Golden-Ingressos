import { createBrowserClient } from '@supabase/ssr'

// CORREÇÃO:
// Em vez de criar a instância aqui, nós exportamos a FUNÇÃO
// que cria a instância. Isso corrige o erro "is not a function".
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
