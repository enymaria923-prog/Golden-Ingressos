// app/esqueci-senha/page.js

import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function EsqueciSenhaPage({ searchParams }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  // Se o usuário já estiver logado, redireciona para a home
  if (user) {
    redirect('/');
  }

  async function resetPassword(formData) {
    'use server';

    const email = formData.get('email');
    const supabase = createClient();

    // URL para onde o usuário será redirecionado após clicar no link de reset
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/atualizar-senha`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    if (error) {
      console.error('Erro ao enviar email de redefinição:', error);
      redirect('/esqueci-senha?error=Erro ao enviar email de redefinição');
    }

    redirect('/esqueci-senha?success=Email de redefinição enviado com sucesso. Verifique sua caixa de entrada.');
  }

  const error = searchParams.error;
  const success = searchParams.success;

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '40px' }}>
        <Link href="/login" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para o Login</Link>
        <h1 style={{ margin: '0' }}>Golden Ingressos</h1>
      </header>

      <div style={{ maxWidth: '400px', margin: '0 auto' }}>

        {/* Mensagens */}
        {error && (
          <div style={{ 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #ffcdd2'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            color: '#2e7d32', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #c8e6c9'
          }}>
            {success}
          </div>
        )}

        <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', color: '#5d34a4', marginBottom: '25px' }}>Recuperar Senha</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '25px' }}>
            Digite seu email para receber um link de redefinição de senha.
          </p>
          
          <form action={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }} 
                placeholder="seu@email.com"
              />
            </div>
            
            <button 
              type="submit"
              style={{ 
                backgroundColor: '#5d34a4', 
                color: 'white', 
                padding: '15px', 
                fontWeight: 'bold', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Enviar Link de Redefinição
            </button>
          </form>

          <div style={{ marginTop: '25px', textAlign: 'center' }}>
            <Link 
              href="/login" 
              style={{ 
                color: '#5d34a4', 
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Voltar para o Login
            </Link>
          </div>
        </div>

        {/* Informações adicionais */}
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
          <p style={{ margin: '0', color: '#1565c0', fontSize: '14px' }}>
            <strong>Dica:</strong> Se não encontrar o email, verifique sua pasta de spam.
          </p>
        </div>

      </div>
    </div>
  );
}
