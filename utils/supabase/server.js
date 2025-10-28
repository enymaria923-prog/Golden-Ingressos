// utils/supabase/server.js
// CÓDIGO OFICIAL E CORRIGIDO

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  // Cria o cliente Supabase usando as chaves secretas
  // que o Vercel injetou automaticamente (process.env)
  // Este cliente é para Server Components e Server Actions
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
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
            // Isto pode ser ignorado se tiver um middleware a atualizar as sessões.
          }
        },
        remove(name, options) {
          try {
            // AQUI ESTAVA O ERRO. AGORA ESTÁ CORRETO:
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // O 'remove' foi chamado a partir de um Server Component.
            // Isto pode ser ignorado se tiver um middleware a atualizar as sessões.
          }
        },
      },
    }
  )
}
