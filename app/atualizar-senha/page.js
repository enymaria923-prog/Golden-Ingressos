// app/atualizar-senha/page.js

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AtualizarSenhaPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Verificar se há um token de recuperação na URL
  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    if (token && type === 'recovery') {
      // O Supabase automaticamente detecta o token e permite a redefinição
      console.log('Token de recuperação detectado');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError('Erro ao atualizar a senha: ' + error.message);
      } else {
        setMessage('Senha atualizada com sucesso! Redirecionando...');
        setTimeout(() => {
          router.push('/login?message=Senha alterada com sucesso');
        }, 2000);
      }
    } catch (err) {
      setError('Erro inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '40px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para a Home</Link>
        <h1 style={{ margin: '0' }}>Golden Ingressos</h1>
      </header>

      <div style={{ maxWidth: '400px', margin: '0 auto' }}>

        <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', color: '#5d34a4', marginBottom: '25px' }}>Nova Senha</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '25px' }}>
            Digite sua nova senha abaixo.
          </p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nova Senha:</label>
              <input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }} 
                placeholder="Mínimo 6 caracteres"
                minLength="6"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Confirmar Nova Senha:</label>
              <input 
                id="confirmPassword" 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }} 
                placeholder="Digite a senha novamente"
                minLength="6"
              />
            </div>

            {error && (
              <div style={{ 
                padding: '10px', 
                borderRadius: '5px', 
                backgroundColor: '#ffebee', 
                color: '#c62828',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {message && (
              <div style={{ 
                padding: '10px', 
                borderRadius: '5px', 
                backgroundColor: '#e8f5e8', 
                color: '#2e7d32',
                textAlign: 'center'
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
                fontSize: '16px'
              }}
            >
              {loading ? 'Atualizando...' : 'Atualizar Senha'}
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

      </div>
    </div>
  );
}
