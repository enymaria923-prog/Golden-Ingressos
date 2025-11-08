// app/criar-conta-produtor/page.js
'use client';

import { signupProdutor } from '../actions-auth';
import Link from 'next/link';
import { useState } from 'react';

export default function CriarContaProdutorPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signupProdutor(formData);
      if (result.success) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setError(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
        
        {/* Cabeçalho */}
        <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '40px' }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para a Home</Link>
          <h1 style={{ margin: '0' }}>Golden Ingressos - Área do Produtor</h1>
        </header>

        {/* Mensagem de Sucesso */}
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            
            <div style={{ fontSize: '48px', color: '#2ecc71', marginBottom: '20px' }}>✓</div>
            
            <h2 style={{ color: '#5d34a4', marginBottom: '20px' }}>Cadastro Realizado com Sucesso!</h2>
            
            <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px', marginBottom: '30px', textAlign: 'left' }}>
              <h3 style={{ color: '#2d5016', marginTop: '0' }}>📧 Verificação de Email Necessária</h3>
              <p style={{ color: '#2d5016', marginBottom: '10px' }}>
                <strong>Enviamos um email de verificação para o endereço informado.</strong>
              </p>
              <p style={{ color: '#2d5016', margin: '0' }}>
                Para ativar sua conta de produtor, você precisa:
              </p>
              <ol style={{ color: '#2d5016', paddingLeft: '20px', margin: '15px 0 0 0' }}>
                <li>Acessar sua caixa de entrada</li>
                <li>Localizar o email da Golden Ingressos</li>
                <li>Clicar no link de verificação</li>
                <li>Fazer login com suas credenciais</li>
              </ol>
            </div>

            <p style={{ color: '#666', marginBottom: '30px' }}>
              Após a verificação do email, sua conta estará totalmente ativa e você poderá acessar a Área do Produtor.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '300px', margin: '0 auto' }}>
              <Link 
                href="/area-produtor" 
                style={{ 
                  backgroundColor: '#f1c40f', 
                  color: 'black', 
                  padding: '15px', 
                  fontWeight: 'bold', 
                  border: 'none', 
                  borderRadius: '5px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontSize: '16px'
                }}
              >
                Ir para Área do Produtor
              </Link>
              
              <Link 
                href="/login" 
                style={{ 
                  backgroundColor: '#3498db', 
                  color: 'white', 
                  padding: '15px', 
                  fontWeight: 'bold', 
                  border: 'none', 
                  borderRadius: '5px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontSize: '16px'
                }}
              >
                Fazer Login
              </Link>
              
              <Link 
                href="/" 
                style={{ 
                  backgroundColor: '#95a5a6', 
                  color: 'white', 
                  padding: '15px', 
                  fontWeight: 'bold', 
                  border: 'none', 
                  borderRadius: '5px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontSize: '16px'
                }}
              >
                Voltar para Home
              </Link>
            </div>

            <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
              <p style={{ margin: '0', color: '#856404', fontSize: '14px' }}>
                <strong>Dica:</strong> Se não encontrar o email de verificação, verifique sua pasta de spam/lixo eletrônico.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '40px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para a Home</Link>
        <h1 style={{ margin: '0' }}>Golden Ingressos - Área do Produtor</h1>
      </header>

      {/* Container principal */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Formulário de Cadastro do Produtor */}
        <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', color: '#5d34a4', marginBottom: '25px' }}>Criar Conta de Produtor</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
            Cadastre-se como produtor para criar e gerenciar seus eventos na plataforma
          </p>
          
          {/* Informação sobre verificação de email */}
          <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #bbdefb' }}>
            <p style={{ margin: '0', color: '#1565c0', fontSize: '14px' }}>
              <strong>⚠️ Atenção:</strong> Após o cadastro, você receberá um email de verificação. 
              Sua conta só estará ativa após confirmar o email.
            </p>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div style={{ backgroundColor: '#ffebee', padding: '15px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #ffcdd2' }}>
              <p style={{ margin: '0', color: '#c62828', fontSize: '14px' }}>
                <strong>Erro:</strong> {error}
              </p>
            </div>
          )}
          
          <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* Dados Pessoais */}
            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
              <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>Dados Pessoais</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="nome_completo" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Nome Completo: *
                </label>
                <input 
                  id="nome_completo" 
                  name="nome_completo" 
                  type="text" 
                  required 
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
                <label htmlFor="nome_empresa" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Nome da empresa / Nome fantasia (se tiver):
                </label>
                <input 
                  id="nome_empresa" 
                  name="nome_empresa" 
                  type="text" 
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    boxSizing: 'border-box'
                  }} 
                  placeholder="Nome da sua empresa ou marca"
                />
              </div>
            </div>

            {/* Recebimento via PIX */}
            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
              <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>Recebimento via PIX</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="chave_pix" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Chave PIX: *
                </label>
                <input 
                  id="chave_pix" 
                  name="chave_pix" 
                  type="text" 
                  required 
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    boxSizing: 'border-box'
                  }} 
                  placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
                />
              </div>

              <div>
                <label htmlFor="tipo_chave_pix" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Tipo da Chave PIX: *
                </label>
                <select 
                  id="tipo_chave_pix" 
                  name="tipo_chave_pix" 
                  required 
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Selecione o tipo</option>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">Email</option>
                  <option value="telefone">Telefone</option>
                  <option value="aleatoria">Chave Aleatória</option>
                </select>
              </div>
            </div>

            {/* Recebimento via Conta Corrente */}
            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
              <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>Recebimento via Conta Corrente</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="dados_bancarios" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Dados Bancários (Banco, Agência, Conta):
                </label>
                <textarea 
                  id="dados_bancarios" 
                  name="dados_bancarios" 
                  rows="3"
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }} 
                  placeholder="Ex: Banco do Brasil, Agência 1234, Conta 56789-0"
                />
              </div>
            </div>

            {/* Preferência */}
            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
              <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>Preferência</h3>
              
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                  Forma de Pagamento de Preferência: *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="radio" name="forma_pagamento" value="apenas_pix" required />
                    Apenas PIX
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="radio" name="forma_pagamento" value="apenas_transferencia" />
                    Apenas Transferência
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="radio" name="forma_pagamento" value="ambos" />
                    Ambos (PIX e Transferência)
                  </label>
                </div>
              </div>
            </div>

            {/* Email e Senha */}
            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
              <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>Dados de Acesso</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Email: *
                </label>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
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

              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Senha: *
                </label>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
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
                  Confirmar Senha: *
                </label>
                <input 
                  id="confirm_password" 
                  name="confirm_password" 
                  type="password" 
                  required 
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
            </div>

            {/* Checkboxes de confirmação */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <input type="checkbox" required style={{ marginTop: '3px' }} />
                <span>
                  Sei que posso editar todas as informações a qualquer momento pela área do produtor
                </span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <input type="checkbox" required style={{ marginTop: '3px' }} />
                <span>
                  Concordo com os <Link href="/termos-de-uso" style={{ color: '#5d34a4', fontWeight: 'bold' }}>Termos de Uso</Link>
                </span>
              </label>
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
              {isLoading ? 'Cadastrando...' : 'Criar Conta de Produtor'}
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
            
            <p style={{ color: '#666' }}>
              É um usuário comum?{' '}
              <Link 
                href="/criar-conta" 
                style={{ 
                  color: '#5d34a4', 
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Criar conta comum
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
