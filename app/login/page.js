// app/login/page.js
import { login } from '../actions-auth';
import GoogleLoginButton from './GoogleLoginButton';

export default function LoginPage() {
  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '40px' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para a Home</a>
        <h1 style={{ margin: '0' }}>Golden Ingressos</h1>
      </header>

      {/* Container principal */}
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        
        {/* Formulário de Login */}
        <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', color: '#5d34a4', marginBottom: '25px' }}>Entrar na sua conta</h2>
          
          {/* Botão de Login com Google */}
          <GoogleLoginButton />
          
          {/* Divisor */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
            <span style={{ padding: '0 10px', color: '#999', fontSize: '14px' }}>ou</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
          </div>

          <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
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
              <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Senha:</label>
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
                placeholder="Sua senha"
              />
            </div>
            
            <button 
              type="submit"
              style={{ 
                backgroundColor: '#5d34a4', 
                color: 'white', 
                padding: '15px', 
                fontWeight: 'bold', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                marginTop: '10px'
              }}
            >
              Entrar
            </button>
          </form>

          {/* Links de apoio */}
          <div style={{ marginTop: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <a 
              href="/criar-conta" 
              style={{ 
                color: '#5d34a4', 
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Criar conta
            </a>
            
            <a 
              href="/criar-conta-produtor" 
              style={{ 
                color: '#5d34a4', 
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Criar conta (Produtor)
            </a>
            
            <a 
              href="/esqueci-senha" 
              style={{ 
                color: '#e74c3c', 
                textDecoration: 'none'
              }}
            >
              Esqueci minha senha
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
