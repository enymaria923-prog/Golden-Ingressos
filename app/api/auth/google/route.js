import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    
    console.log('Dados do Google:', decoded);
    
    const googleUser = {
      email: decoded.email,
      nome: decoded.name,
      foto: decoded.picture,
      google_id: decoded.sub
    };
    
    // Conecta ao Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variáveis do Supabase não configuradas');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verifica se usuário existe
    const { data: existingUser, error: fetchError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', googleUser.email)
      .maybeSingle();
    
    console.log('Usuário existente:', existingUser);
    
    let userId;
    
    if (existingUser) {
      // Usuário já existe
      userId = existingUser.id;
      console.log('Usuário já cadastrado, ID:', userId);
    } else {
      // Cria novo usuário
      console.log('Criando novo usuário...');
      const { data: newUser, error: insertError } = await supabase
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
      
      if (insertError) {
        console.error('Erro ao criar usuário:', insertError);
        throw insertError;
      }
      
      userId = newUser.id;
      console.log('Novo usuário criado, ID:', userId);
    }
    
    // Cria resposta com cookie
    const response = NextResponse.json({ 
      success: true,
      user: googleUser,
      userId: userId
    });
    
    // Define cookie de sessão
    response.cookies.set('user_session', JSON.stringify({
      userId: userId,
      email: googleUser.email,
      nome: googleUser.nome,
      foto: googleUser.foto
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/'
    });
    
    console.log('Login bem-sucedido!');
    return response;
    
  } catch (error) {
    console.error('Erro completo no login:', error);
    return NextResponse.json(
      { 
        error: 'Erro no login com Google', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
