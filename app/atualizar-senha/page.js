'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function AtualizarSenhaContent() {
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 Página atualizar-senha carregada');
    console.log('📋 URL completa:', window.location.href);
    console.log('📋 Search:', window.location.search);
    console.log('📋 Hash:', window.location.hash);

    // Aguarda um pouco para garantir que a página carregou
    const timer = setTimeout(() => {
      const currentUrl = window.location.href;
      
      // Substitui atualizar-senha por nova-senha mantendo TUDO
      if (currentUrl.includes('/atualizar-senha')) {
        const newUrl = currentUrl.replace('/atualizar-senha', '/nova-senha');
        console.log('✅ Redirecionando para:', newUrl);
        window.location.replace(newUrl);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

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
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
        <h2 style={{ color: '#5d34a4', marginBottom: '10px' }}>Redirecionando...</h2>
        <p style={{ color: '#666' }}>Você será redirecionado para criar sua nova senha</p>
      </div>
    </div>
  );
}

export default function AtualizarSenhaPage() {
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
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#5d34a4' }}>Carregando...</h2>
        </div>
      </div>
    }>
      <AtualizarSenhaContent />
    </Suspense>
  );
}
