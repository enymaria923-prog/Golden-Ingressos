'use client';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GoogleLoginButton() {
  const router = useRouter();
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

      if (response.ok) {
        console.log('Login realizado:', data);
        window.location.href = '/';
      } else {
        setError(data.error || 'Erro no login');
      }
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao conectar');
    } finally {
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
        />
      </div>
      
      {loading && (
        <p style={{ textAlign: 'center', marginTop: '10px', color: '#5d34a4' }}>
          Processando...
        </p>
      )}
      
      {error && (
        <p style={{ textAlign: 'center', marginTop: '10px', color: '#e74c3c' }}>
          {error}
        </p>
      )}
    </div>
  );
}
