// utils/supabase/server.js
// CÓDIGO OFICIAL E CORRIGIDO COM A CHAVE CERTA

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  // Cria o cliente Supabase usando as chaves secretas
  // que o Vercel injetou automaticamente (process.env)
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    // AQUI ESTAVA O ERRO. A CHAVE CORRETA É A ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // O 'set' foi chamado a partir de um Server Component.
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // O 'remove' foi chamado a partir de um Server Component.
          }
        },
      },
    }
  )
}
