// utils/supabase/server.js
// Este é o "tradutor" principal que roda no servidor

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  // Cria o cliente Supabase usando as chaves secretas
  // que o Vercel injetou automaticamente (process.env)
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
            // Lida com erros se os cookies forem definidos em Server Actions
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, '', ...options })
          } catch (error) {
            // Lida com erros se os cookies forem removidos em Server Actions
          }
        },
      },
    }
  )
}
