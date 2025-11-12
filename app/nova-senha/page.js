'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function NovaSenhaContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    verificarToken();
  }, []);

  const verificarToken = async () => {
    try {
      console.log('🔍 Verificando tokens de recuperação...');
      console.log('📋 URL completa:', window.location.href);
      
      // Pega o hash da URL (tudo depois do #)
      const hash = window.location.hash;
      console.log('📋 Hash:', hash);
      
      if (!hash) {
        console.log('❌ Nenhum hash encontrado');
        setError('Link inválido ou expirado. Solicite um novo link de recuperação.');
        setTokenValido(false);
        setVerificando(false);
        return;
      }

      // Extrai os parâmetros do hash
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const type = params.get('type');

      console.log('🔑 Type:', type);
      console.log('🔑 Access token:', access_token ? 'Encontrado' : 'Não encontrado');
      console.log('🔑 Refresh token:', refresh_token ? 'Encontrado' : 'Não encontrado');

      if (!access_token) {
        console.log('❌ Token de acesso não encontrado');
        setError('Link inválido ou expirado. Solicite um novo link.');
        setTokenValido(false);
        setVerificando(false);
        return;
      }

      // Estabelece a sessão com os tokens do link
      console.log('✅ Estabelecendo sessão com tokens...');
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token: refresh_token || ''
      });

      if (sessionError) {
        console.error('❌ Erro ao estabelecer sessão:', sessionError);
        setError('Link inválido ou expirado. Solicite um novo link de recuperação.');
        setTokenValido(false);
      } else {
        console.log('✅ Sessão estabelecida com sucesso!', data);
        setTokenValido(true);
      }

    } catch (err) {
      console.error('💥 Erro ao processar token:', err);
      setError('Erro ao processar link. Tente novamente.');
      setTokenValido(false);
    } finally {
      setVerificando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      console.log('💾 Atualizando senha...');

      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('❌ Erro ao atualizar:', updateError);
        setError('Erro ao atualizar senha: ' + updateError.message);
      } else {
        console.log('✅ Senha atualizada com sucesso!', data);
        setMessage('✅ Senha atualizada com sucesso! Redirecionando para o login...');
        
        // Faz logout para garantir que o usuário faça login com a nova senha
        await supabase.auth.signOut();
        
        setTimeout(() => {
          router.push('/login?message=Senha%20alterada%20com%20sucesso');
        }, 2000);
      }
    } catch (err) {
      console.error('💥 Erro inesperado:', err);
      setError('Erro inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading enquanto verifica o token
  if (verificando) {
    return (
      <div style={{ 
        fontFamily: 'sans-serif', 
        backgroundColor: '#f4f4f4', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
          <h2 style={{ color: '#5d34a4', marginBottom: '10px' }}>Verificando link...</h2>
          <p style={{ color: '#666' }}>Aguarde um momento</p>
        </div>
      </div>
    );
  }

  // Se o token é inválido, mostra erro
  if (!tokenValido) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
        <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '40px' }}>
          <h1 style={{ margin: '0' }}>Golden Ingressos</h1>
        </header>

        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{ color: '#e74c3c', marginBottom: '15px' }}>Link Inválido</h2>
            <p style={{ color: '#666', marginBottom: '25px' }}>{error}</p>
            <Link 
              href="/esqueci-senha"
              style={{
                display: 'inline-block',
                backgroundColor: '#5d34a4',
                color: 'white',
                padding: '12px 25px',
                borderRadius: '5px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Solicitar Novo Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Formulário para criar nova senha
  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '40px' }}>
        <h1 style={{ margin: '0' }}>Golden Ingressos</h1>
      </header>

      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', color: '#5d34a4', marginBottom: '10px' }}>🔐 Nova Senha</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '25px', fontSize: '14px' }}>
            Digite sua nova senha abaixo
          </p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Nova Senha:
              </label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength="6"
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '2px solid #ddd', 
                  borderRadius: '5px',
                  boxSizing: 'border-box',
                  fontSize: '16px',
                  backgroundColor: loading ? '#f5f5f5' : 'white'
                }} 
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Confirmar Senha:
              </label>
              <input 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength="6"
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '2px solid #ddd', 
                  borderRadius: '5px',
                  boxSizing: 'border-box',
                  fontSize: '16px',
                  backgroundColor: loading ? '#f5f5f5' : 'white'
                }} 
                placeholder="Digite a senha novamente"
              />
            </div>

            {error && (
              <div style={{ 
                padding: '12px', 
                borderRadius: '5px', 
                backgroundColor: '#ffebee', 
                color: '#c62828',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
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
                fontSize: '14px',
                fontWeight: 'bold'
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
              {loading ? '⏳ Salvando...' : '💾 Salvar Nova Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NovaSenhaPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        fontFamily: 'sans-serif', 
        backgroundColor: '#f4f4f4', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <h2>Carregando...</h2>
      </div>
    }>
      <NovaSenhaContent />
    </Suspense>
  );
}
