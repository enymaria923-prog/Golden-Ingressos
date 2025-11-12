'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AtualizarSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verifica se há parâmetros na URL (query params)
    const hasQueryParams = searchParams.get('token') || 
                          searchParams.get('type') || 
                          searchParams.get('access_token');
    
    // Verifica se há hash na URL
    const hasHash = window.location.hash;

    console.log('🔍 Verificando redirecionamento...');
    console.log('📋 Query params:', hasQueryParams ? 'Encontrados' : 'Não encontrados');
    console.log('📋 Hash:', hasHash ? 'Encontrado' : 'Não encontrado');

    // Se tem query params OU hash, redireciona para nova-senha
    if (hasQueryParams || hasHash) {
      console.log('✅ Redirecionando para /nova-senha');
      
      // Redireciona mantendo os parâmetros e o hash
      const fullUrl = window.location.href;
      const newUrl = fullUrl.replace('/atualizar-senha', '/nova-senha');
      
      window.location.href = newUrl;
    } else {
      console.log('❌ Nenhum token encontrado, usuário acessou diretamente');
      // Opcional: redirecionar para página de erro ou esqueci-senha
      setTimeout(() => {
        router.push('/esqueci-senha');
      }, 3000);
    }
  }, [searchParams, router]);

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
        <p style={{ color: '#666' }}>Aguarde um momento</p>
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
