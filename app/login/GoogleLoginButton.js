'use client';
import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

export default function GoogleLoginButton() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Login realizado:', data);
        // A sessão já foi criada no servidor pelos cookies do Supabase!
        window.location.replace('/');
      } else {
        setError(data.error || 'Erro no login');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao conectar: ' + error.message);
      setLoading(false);
    }
  };

  const handleError = () => {
    setError('Falha no login. Tente novamente.');
  };

  return (
    <div>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="filled_blue"
          size="large"
          text="continue_with"
          width="100%"
          disabled={loading}
        />
      </div>
      
      {loading && (
        <p style={{ textAlign: 'center', marginTop: '10px', color: '#5d34a4', fontWeight: 'bold' }}>
          ✓ Autenticando com Google...
        </p>
      )}
      
      {error && (
        <p style={{ textAlign: 'center', marginTop: '10px', color: '#e74c3c', fontSize: '14px' }}>
          {error}
        </p>
      )}
    </div>
  );
}
