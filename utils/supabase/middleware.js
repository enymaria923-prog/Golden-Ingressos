import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, // CORRIGIDO: era "MEXT_PUBLIC"
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // CORRIGIDO: era "MEXT_PUBLIC" e "ANOW_KEY"
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // IMPORTANTE: Atualizar a sessão
  const { data: { user } } = await supabase.auth.getUser()

  // Se não há usuário e a rota é protegida, redirecionar
  if (!user && request.nextUrl.pathname.startsWith('/publicar-evento')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}
