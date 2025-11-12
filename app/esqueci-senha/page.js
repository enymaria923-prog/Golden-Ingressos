'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Verifica se usuário já está logado
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      router.push('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('Por favor, digite seu email');
      setLoading(false);
      return;
    }

    try {
      console.log('📧 Enviando email de recuperação para:', email);

      // URL para onde o usuário será redirecionado (direto para nova-senha)
      const redirectTo = `${window.location.origin}/nova-senha`;
      
      console.log('🔗 URL de redirecionamento:', redirectTo);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (resetError) {
        console.error('❌ Erro ao enviar email:', resetError);
        setError('Erro ao enviar email: ' + resetError.message);
      } else {
        console.log('✅ Email enviado com sucesso!');
        setSuccess('✅ Email de redefinição enviado com sucesso! Verifique sua caixa de entrada.');
        setEmail('');
      }
    } catch (err) {
      console.error('💥 Erro inesperado:', err);
      setError('Erro inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '40px' }}>
        <Link href="/login" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para o Login</Link>
        <h1 style={{ margin: '0' }}>Golden Ingressos</h1>
      </header>

      <div style={{ maxWidth: '400px', margin: '0 auto' }}>

        {error && (
          <div style={{ 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #ffcdd2',
            textAlign: 'center'
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            color: '#2e7d32', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #c8e6c9',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', color: '#5d34a4', marginBottom: '25px' }}>Recuperar Senha</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '25px' }}>
            Digite seu email para receber um link de redefinição de senha.
          </p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  boxSizing: 'border-box',
                  backgroundColor: loading ? '#f5f5f5' : 'white',
                  cursor: loading ? 'not-allowed' : 'text'
                }} 
                placeholder="seu@email.com"
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              style={{ 
                backgroundColor: loading ? '#95a5a6' : '#5d34a4', 
                color: 'white', 
                padding: '15px', 
                fontWeight: 'bold', 
                border: 'none', 
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                transition: 'background-color 0.3s'
              }}
            >
              {loading ? '📧 Enviando...' : 'Enviar Link de Redefinição'}
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

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
          <p style={{ margin: '0', color: '#1565c0', fontSize: '14px' }}>
            <strong>Dica:</strong> Se não encontrar o email, verifique sua pasta de spam.
          </p>
        </div>

      </div>
    </div>
  );
}
