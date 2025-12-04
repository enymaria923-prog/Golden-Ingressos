import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { credential } = await request.json();
    
    // Aqui você vai verificar o token com o Google
    // Por enquanto vou deixar um exemplo básico
    
    // Decodifica o JWT do Google (você vai precisar de uma lib como jose ou jwt-decode)
    // const decoded = jwt.decode(credential);
    
    // TODO: Salvar usuário no banco, criar sessão, etc
    
    return NextResponse.json({ 
      success: true,
      message: 'Login com Google realizado!' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro no login com Google' },
      { status: 500 }
    );
  }
}
