import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { credential } = await request.json();
    
    // Decodifica o token do Google
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    
    console.log('Dados do Google:', decoded);
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Tenta fazer login com o email do Google
    // Se não existir, o Supabase vai retornar erro
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: decoded.email,
      password: decoded.sub // Usa o ID do Google como senha temporária
    });
    
    // Se deu erro, significa que o usuário não existe
    if (signInError) {
      console.log('Usuário não existe, criando...');
      
      // Cria o usuário no Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: decoded.email,
        password: decoded.sub, // Senha = Google ID
        options: {
          data: {
            nome: decoded.name,
            foto_perfil: decoded.picture,
            google_id: decoded.sub,
            email_confirmed: true
          }
        }
      });
      
      if (signUpError) {
        console.error('Erro ao criar usuário:', signUpError);
        throw signUpError;
      }
      
      console.log('Usuário criado:', signUpData);
      
      // Agora faz login com o usuário recém-criado
      const { data: newAuthData, error: newSignInError } = await supabase.auth.signInWithPassword({
        email: decoded.email,
        password: decoded.sub
      });
      
      if (newSignInError) {
        throw newSignInError;
      }
      
      return NextResponse.json({ 
        success: true,
        user: newAuthData.user,
        session: newAuthData.session
      });
    }
    
    console.log('Login bem-sucedido:', authData);
    
    return NextResponse.json({ 
      success: true,
      user: authData.user,
      session: authData.session
    });
    
  } catch (error) {
    console.error('Erro completo:', error);
    return NextResponse.json(
      { error: 'Erro no login', details: error.message },
      { status: 500 }
    );
  }
}
