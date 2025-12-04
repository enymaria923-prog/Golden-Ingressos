'use client';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

export default function GoogleLoginButton() {
  const router = useRouter();

  const handleSuccess = async (credentialResponse) => {
    try {
      // Envia o token para seu backend processar
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login com Google bem-sucedido:', data);
        router.push('/'); // Redireciona para a home após login
      } else {
        console.error('Erro no login com Google');
      }
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
    }
  };

  const handleError = () => {
    console.error('Falha no login com Google');
  };

  return (
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
  );
}
