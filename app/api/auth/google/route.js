import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    console.log('✅ Dados do Google recebidos:', decoded.email);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente não configuradas');
    }
    
    // Cliente Admin do Supabase
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Cliente normal para fazer login
    const supabaseClient = createClient(
      supabaseUrl, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Verifica se usuário existe
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    let user = existingUsers.users.find(u => u.email === decoded.email);
    
    // Senha padrão para usuários do Google
    const senhaGoogle = `google_${decoded.sub}`;
    
    if (!user) {
      // Cria novo usuário
      console.log('📝 Criando novo usuário...');
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: decoded.email,
        password: senhaGoogle,
        email_confirm: true,
        user_metadata: {
          nome: decoded.name,
          foto_perfil: decoded.picture,
          google_id: decoded.sub,
          login_tipo: 'google'
        }
      });
      
      if (createError) {
        throw new Error(`Erro ao criar usuário: ${createError.message}`);
      }
      
      user = newUser.user;
      console.log('✅ Novo usuário criado:', user.id);
    } else {
      console.log('✅ Usuário já existe:', user.id);
      
      // Atualiza a senha para garantir que seja a mesma
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: senhaGoogle
      });
    }
    
    // Faz login com o cliente normal (isso cria os cookies!)
    const { data: sessionData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: user.email,
      password: senhaGoogle
    });
    
    if (signInError) {
      throw new Error(`Erro ao fazer login: ${signInError.message}`);
    }
    
    console.log('✅ Sessão criada com sucesso!');
    
    // Configura os cookies no response
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nome: decoded.name,
        foto: decoded.picture
      }
    });
    
    // Copia os cookies de autenticação do Supabase
    if (sessionData.session) {
      response.cookies.set('sb-access-token', sessionData.session.access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 dias
      });
      
      response.cookies.set('sb-refresh-token', sessionData.session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 dias
      });
    }
    
    return response;
    
  } catch (error) {
    console.error('❌ Erro completo:', error);
    return NextResponse.json(
      { error: 'Erro no login', details: error.message },
      { status: 500 }
    );
  }
}
