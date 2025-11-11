'use client';

import { useState } from 'react';
import { createClient } from '../../utils/supabase/client';
import Link from 'next/link';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email || !email.includes('@')) {
      setError('Por favor, digite um email válido');
      setLoading(false);
      return;
    }

    try {
      console.log('📧 Enviando email de recuperação para:', email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      });

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        setError('Erro ao enviar email: ' + error.message);
      } else {
        console.log('✅ Email enviado com sucesso!');
        setMessage('✅ Email de recuperação enviado! Verifique sua caixa de entrada e pasta de spam.');
        setEmail(''); // Limpa o campo
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

        <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', color: '#5d34a4', marginBottom: '15px' }}>Recuperar Senha</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '25px', fontSize: '14px' }}>
            Digite seu email para receber um link de redefinição de senha.
          </p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
              <input 
                id="email" 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  boxSizing: 'border-box',
                  fontSize: '16px'
                }} 
                placeholder="seu@email.com"
              />
            </div>

            {error && (
              <div style={{ 
                padding: '12px', 
                borderRadius: '5px', 
                backgroundColor: '#ffebee', 
                color: '#c62828',
                textAlign: 'center',
                fontSize: '14px'
              }}>
                ❌ {error}
              </div>
            )}

            {message && (
              <div style={{ 
                padding: '12px', 
                borderRadius: '5px', 
                backgroundColor: '#e8f5e8', 
                color: '#2e7d32',
                textAlign: 'center',
                fontSize: '14px'
              }}>
                {message}
              </div>
            )}
            
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
                transition: 'all 0.3s'
              }}
            >
              {loading ? '⏳ Enviando...' : '📧 Enviar Link de Redefinição'}
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

          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '5px',
            fontSize: '13px',
            color: '#1565c0'
          }}>
            <strong>💡 Dica:</strong> Se não encontrar o email, verifique sua pasta de spam.
          </div>
        </div>

      </div>
    </div>
  );
}
