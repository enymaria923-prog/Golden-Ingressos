import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request) {
  try {
    const { credential } = await request.json();
    
    // Decodifica o token JWT do Google
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    
    const googleUser = {
      email: decoded.email,
      nome: decoded.name,
      foto: decoded.picture,
      google_id: decoded.sub
    };
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verifica se usuário existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', googleUser.email)
      .single();
    
    let userId;
    
    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Cria novo usuário
      const { data: newUser } = await supabase
        .from('usuarios')
        .insert([
          {
            email: googleUser.email,
            nome: googleUser.nome,
            foto_perfil: googleUser.foto,
            google_id: googleUser.google_id,
            tipo_usuario: 'comum'
          }
        ])
        .select()
        .single();
      
      userId = newUser.id;
    }
    
    const response = NextResponse.json({ 
      success: true,
      user: googleUser,
      userId: userId
    });
    
    // Cookie de sessão
    response.cookies.set('user_session', JSON.stringify({
      userId: userId,
      email: googleUser.email,
      nome: googleUser.nome
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });
    
    return response;
    
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro no login', details: error.message },
      { status: 500 }
    );
  }
}
