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
    
    // Conecta ao Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis do Supabase não configuradas');
    }
    
    // Usa Service Role Key para criar/buscar usuário
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verifica se usuário já existe pelo email
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Erro ao listar usuários:', listError);
      throw listError;
    }
    
    const existingUser = existingUsers.users.find(u => u.email === decoded.email);
    
    let user;
    
    if (existingUser) {
      console.log('Usuário já existe:', existingUser.id);
      user = existingUser;
    } else {
      // Cria novo usuário no Supabase Auth
      console.log('Criando novo usuário...');
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: decoded.email,
        email_confirm: true,
        user_metadata: {
          nome: decoded.name,
          foto_perfil: decoded.picture,
          google_id: decoded.sub,
          tipo_usuario: 'comum'
        }
      });
      
      if (createError) {
        console.error('Erro ao criar usuário:', createError);
        throw createError;
      }
      
      user = newUser.user;
      console.log('Novo usuário criado:', user.id);
    }
    
    // Cria sessão para o usuário
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email
    });
    
    if (sessionError) {
      console.error('Erro ao criar sessão:', sessionError);
    }
    
    // Cria resposta com cookie
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nome: decoded.name,
        foto: decoded.picture
      }
    });
    
    // Define cookie de sessão
    response.cookies.set('user_session', JSON.stringify({
      userId: user.id,
      email: user.email,
      nome: decoded.name,
      foto: decoded.picture
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
        details: error.message
      },
      { status: 500 }
    );
  }
}
