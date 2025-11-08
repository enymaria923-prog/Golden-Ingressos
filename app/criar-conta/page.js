// app/criar-conta/page.js

import { signup } from '../actions-auth';
import Link from 'next/link';

export default function CriarContaPage() {
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
          
          <form action={signup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label htmlFor="nome_completo" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Nome Completo:
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
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Email:
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
            
            <div>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Senha:
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
                Confirmar Senha:
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

            <div style={{ fontSize: '14px', color: '#666', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
              <strong>Importante:</strong> Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade.
            </div>
            
            <button 
              type="submit"
              style={{ 
                backgroundColor: '#f1c40f', 
                color: 'black', 
                padding: '15px', 
                fontWeight: 'bold', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                marginTop: '10px'
              }}
            >
              Criar Conta
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
