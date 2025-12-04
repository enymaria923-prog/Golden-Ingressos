import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';

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
    console.log('Google user:', decoded);
    
    // Usa o Supabase Admin para criar/buscar usuário
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Verifica se usuário existe
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    let user = existingUsers.users.find(u => u.email === decoded.email);
    
    // Se não existe, cria o usuário
    if (!user) {
      const senhaTemporaria = decoded.sub + '_' + Math.random().toString(36).substring(7);
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: decoded.email,
        password: senhaTemporaria,
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
    }
    
    // Cria sessão usando o Supabase do servidor
    const supabase = createClient();
    
    // Faz "login" com senha temporária
    const senhaParaLogin = decoded.sub + '_google';
    
    // Atualiza a senha do usuário para uma senha conhecida
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: senhaParaLogin
    });
    
    // Faz login com a senha
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: senhaParaLogin
    });
    
    if (signInError) {
      throw new Error(`Erro ao fazer login: ${signInError.message}`);
    }
    
    console.log('✅ Sessão criada com sucesso!');
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nome: decoded.name,
        foto: decoded.picture
      }
    });
    
  } catch (error) {
    console.error('Erro completo:', error);
    return NextResponse.json(
      { error: 'Erro no login', details: error.message },
      { status: 500 }
    );
  }
}
