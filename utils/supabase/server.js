// utils/supabase/server.js
// CÓDIGO SUPER LIMPO - CORREÇÃO FINAL

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

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
            // Lida com erros
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, '', ...options })
          } catch (error) {
            // Lida com erros
          }
        },
      },
    }
  )
}
