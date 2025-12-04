'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    // Verifica se voltou do redirect do Google
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ Login com Google bem-sucedido!');
        window.location.href = '/';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        throw error;
      }
      
      // O Supabase vai redirecionar automaticamente para o Google
      console.log('🔄 Redirecionando para Google...');
      
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao fazer login com Google');
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s'
          }}
        >
          {loading ? (
            <>🔄 Autenticando...</>
          ) : (
            <>
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fillRule="evenodd">
                  <path d="M17.6 9.2l-.1-1.8H9v3.4h4.8C13.6 12 13 13 12 13.6v2.2h3a8.8 8.8 0 0 0 2.6-6.6z" fill="#4285F4"/>
                  <path d="M9 18c2.4 0 4.5-.8 6-2.2l-3-2.2a5.4 5.4 0 0 1-8-2.9H1V13a9 9 0 0 0 8 5z" fill="#34A853"/>
                  <path d="M4 10.7a5.4 5.4 0 0 1 0-3.4V5H1a9 9 0 0 0 0 8l3-2.3z" fill="#FBBC05"/>
                  <path d="M9 3.6c1.3 0 2.5.4 3.4 1.3L15 2.3A9 9 0 0 0 1 5l3 2.4a5.4 5.4 0 0 1 5-3.7z" fill="#EA4335"/>
                </g>
              </svg>
              Continuar com Google
            </>
          )}
        </button>
      </div>
      
      {error && (
        <p style={{ textAlign: 'center', marginTop: '10px', color: '#e74c3c', fontSize: '14px' }}>
          {error}
        </p>
      )}
    </div>
  );
}
