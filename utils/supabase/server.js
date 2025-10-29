// utils/supabase/server.js
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// EXPORTA A FUNÇÃO CORRETA USANDO AS VARIÁVEIS PÚBLICAS
export const createClient = () => {
  const cookieStore = cookies();

  // OBRIGA O CLIENTE DO SERVIDOR A USAR AS CHAVES PÚBLICAS 
  // QUE JÁ ESTÃO CONFIGURADAS NO VERCEL.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // A função 'set' pode ser chamada em Server Components, que não têm acesso a cookies.
            // Isso não é crítico, apenas ignoramos.
          }
        },
        remove: (name, options) => {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Ignorado, igual ao set.
          }
        },
      },
    }
  );
};
