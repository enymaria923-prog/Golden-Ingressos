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
    console.log('Google user:', decoded);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Verifica se usuário existe
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    let user = existingUsers.users.find(u => u.email === decoded.email);
    
    // Se não existe, cria o usuário
    if (!user) {
      const senhaTemporaria = decoded.sub + '_' + Math.random().toString(36).substring(7);
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
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
    
    // Gera link de login mágico (Magic Link) para criar sessão
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
    });
    
    if (linkError) {
      throw new Error(`Erro ao gerar link: ${linkError.message}`);
    }
    
    console.log('✅ Link de acesso gerado');
    
    // Retorna as informações necessárias para o frontend criar a sessão
    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nome: decoded.name,
        foto: decoded.picture
      },
      accessToken: linkData.properties.hashed_token,
      refreshToken: linkData.properties.refresh_token
    });
    
  } catch (error) {
    console.error('Erro completo:', error);
    return NextResponse.json(
      { error: 'Erro no login', details: error.message },
      { status: 500 }
    );
  }
}
