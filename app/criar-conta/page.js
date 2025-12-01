'use client';

import { useState } from 'react';
import { signup } from '../actions-auth';
import Link from 'next/link';

export default function CriarContaPage() {
  const [cadastroSucesso, setCadastroSucesso] = useState(false);
  const [emailCadastrado, setEmailCadastrado] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErro('');
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    
    // Validação de senhas
    if (password !== confirmPassword) {
      setErro('As senhas não coincidem!');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres!');
      setIsLoading(false);
      return;
    }
    
    try {
      // Usa a mesma função signup que o código original
      const result = await signup(formData);
      
      if (result?.error) {
        setErro(result.error);
      } else {
        // Sucesso - mostrar página de confirmação
        setEmailCadastrado(email);
        setCadastroSucesso(true);
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setErro(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Página de Sucesso - Verificação de Email
  if (cadastroSucesso) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
        
        {/* Cabeçalho */}
        <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '40px' }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para a Home</Link>
          <h1 style={{ margin: '0' }}>Golden Ingressos</h1>
        </header>

        {/* Container principal */}
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            
            {/* Ícone de Sucesso */}
            <div style={{ fontSize: '64px', color: '#2ecc71', textAlign: 'center', marginBottom: '20px' }}>
              ✓
            </div>

            <h2 style={{ textAlign: 'center', color: '#2ecc71', marginBottom: '10px' }}>
              Cadastro Realizado com Sucesso!
            </h2>
            
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '16px' }}>
              Falta apenas um passo para ativar sua conta
            </p>

            {/* Box de Informação sobre Verificação */}
            <div style={{ 
              backgroundColor: '#e8f5e8', 
              padding: '25px', 
              borderRadius: '8px', 
              marginBottom: '25px',
              border: '2px solid #2ecc71'
            }}>
              <h3 style={{ color: '#2d5016', marginTop: '0', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📧 Verificação de Email Necessária
              </h3>
              
              <p style={{ color: '#2d5016', marginBottom: '15px', lineHeight: '1.6' }}>
                <strong>O Supabase enviou um email de verificação para:</strong>
                <br />
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{emailCadastrado}</span>
              </p>
              
              <p style={{ color: '#2d5016', marginBottom: '15px', lineHeight: '1.6' }}>
                Para ativar sua conta, siga estes passos:
              </p>
              
              <ol style={{ color: '#2d5016', paddingLeft: '20px', margin: '0', lineHeight: '1.8' }}>
                <li>Acesse sua caixa de entrada de email</li>
                <li>Procure por um email do <strong>Supabase</strong> (remetente: noreply@mail.app.supabase.io)</li>
                <li>Abra o email e clique no botão <strong>"Confirm your mail"</strong></li>
                <li>Após confirmar, retorne aqui e faça login para comprar ingressos</li>
              </ol>
            </div>

            {/* Aviso sobre Spam */}
            <div style={{ 
              backgroundColor: '#fff3cd', 
              padding: '15px', 
              borderRadius: '5px', 
              marginBottom: '25px',
              border: '1px solid #ffc107'
            }}>
              <p style={{ margin: '0', color: '#856404', fontSize: '14px', lineHeight: '1.6' }}>
                <strong>💡 Dica:</strong> Se não encontrar o email de verificação do Supabase na sua caixa de entrada, 
                verifique a pasta de <strong>spam/lixo eletrônico</strong>. Às vezes, emails automáticos podem ir para lá.
              </p>
            </div>

            {/* Informação Adicional */}
            <div style={{ 
              backgroundColor: '#e3f2fd', 
              padding: '15px', 
              borderRadius: '5px', 
              marginBottom: '30px',
              border: '1px solid #2196f3'
            }}>
              <p style={{ margin: '0', color: '#1565c0', fontSize: '14px', lineHeight: '1.6' }}>
                <strong>ℹ️ Importante:</strong> Sua conta só estará completamente ativa após você confirmar 
                o email através do link enviado pelo Supabase. Sem essa confirmação, você não conseguirá fazer login.
              </p>
            </div>

            {/* Botões de Ação */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                href="/login"
                style={{ 
                  textAlign: 'center', 
                  textDecoration: 'none',
                  backgroundColor: '#2ecc71',
                  color: '#fff',
                  padding: '15px',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  display: 'block'
                }}
              >
                Já confirmei meu email - Fazer Login
              </Link>

              <Link
                href="/"
                style={{ 
                  textAlign: 'center', 
                  textDecoration: 'none',
                  backgroundColor: '#95a5a6',
                  color: '#fff',
                  padding: '15px',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  display: 'block'
                }}
              >
                Voltar para Home
              </Link>
            </div>

            {/* Informação sobre Reenvio */}
            <p style={{ textAlign: 'center', color: '#666', fontSize: '13px', marginTop: '25px', lineHeight: '1.6' }}>
              Não recebeu o email? Aguarde alguns minutos e verifique sua pasta de spam.
              <br />
              Se necessário, você pode tentar criar a conta novamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Formulário de Cadastro
  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '40px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para a Home</Link>
        <h1 style={{ margin: '0' }}>Golden Ingressos</h1>
      </header>

      {/* Container principal */}
      <div style={{ maxWidth: '450px', margin: '0 auto' }}>

        {/* Formulário de Cadastro */}
        <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', color: '#5d34a4', marginBottom: '25px' }}>Criar Nova Conta</h2>
          
          {/* Aviso sobre verificação de email */}
          <div style={{ 
            backgroundColor: '#e3f2fd', 
            padding: '15px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            border: '1px solid #2196f3'
          }}>
            <p style={{ margin: '0', color: '#1565c0', fontSize: '14px', lineHeight: '1.6' }}>
              <strong>⚠️ Atenção:</strong> Após o cadastro, o Supabase enviará um email de verificação.
              Você precisará confirmar seu email clicando em "Confirm your mail" antes de fazer login.
            </p>
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div style={{ 
              backgroundColor: '#ffebee', 
              padding: '15px', 
              borderRadius: '5px', 
              marginBottom: '20px',
              border: '1px solid #ffcdd2'
            }}>
              <p style={{ margin: '0', color: '#c62828', fontSize: '14px' }}>
                <strong>Erro:</strong> {erro}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label htmlFor="nome_completo" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Nome Completo:
              </label>
              <input 
                id="nome_completo" 
                name="nome_completo" 
                type="text" 
                required 
                disabled={isLoading}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }} 
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Email:
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                disabled={isLoading}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }} 
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Senha:
              </label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                disabled={isLoading}
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
              <label htmlFor="confirm_password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Confirmar Senha:
              </label>
              <input 
                id="confirm_password" 
                name="confirm_password" 
                type="password" 
                required 
                disabled={isLoading}
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

            <div style={{ fontSize: '14px', color: '#666', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
              <strong>Importante:</strong> Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade.
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              style={{ 
                backgroundColor: isLoading ? '#95a5a6' : '#f1c40f', 
                color: 'black', 
                padding: '15px', 
                fontWeight: 'bold', 
                border: 'none', 
                borderRadius: '5px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                marginTop: '10px'
              }}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          {/* Links de apoio */}
          <div style={{ marginTop: '25px', textAlign: 'center' }}>
            <p style={{ color: '#666', marginBottom: '15px' }}>
              Já tem uma conta?{' '}
              <Link 
                href="/login" 
                style={{ 
                  color: '#5d34a4', 
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Fazer login
              </Link>
            </p>
            
            <p style={{ color: '#666', marginBottom: '15px' }}>
              É produtor?{' '}
              <Link 
                href="/criar-conta-produtor" 
                style={{ 
                  color: '#5d34a4', 
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Criar conta de produtor
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
