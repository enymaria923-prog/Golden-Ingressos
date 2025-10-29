// utils/supabase/server.js
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Este cliente é usado em Server Components e Server Actions.
export const createClient = () => {
  const cookieStore = cookies();

  // Garante que o cliente do servidor use as variáveis públicas 
  // para evitar problemas de permissão se a Service Role Key falhar.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => {
          try {
            // Tenta definir cookies no lado do servidor
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Este erro é esperado em Server Components estáticos, não é crítico.
          }
        },
        remove: (name, options) => {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Este erro é esperado em Server Components estáticos, não é crítico.
          }
        },
      },
    }
  );
};
