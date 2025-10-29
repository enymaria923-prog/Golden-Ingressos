// app/login/page.js

// Importa as *novas* ações de login/cadastro que vamos criar
import { login, signup } from '../actions-auth';

export default function LoginPage() {
  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para a Home</a>
        <h1 style={{ margin: '0' }}>Golden Ingressos - Área do Produtor</h1>
      </header>

      {/* Container com dois formulários */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', maxWidth: '1000px', margin: '40px auto' }}>

        {/* Formulário de Login */}
        <div style={{ flex: 1, padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
          <h2>Entrar (Login)</h2>
          <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label htmlFor="email">Email:</label>
            <input id="email" name="email" type="email" required style={{ padding: '10px' }} />
            <label htmlFor="password">Senha:</label>
            <input id="password" name="password" type="password" required style={{ padding: '10px' }} />
            <button 
              type="submit"
              style={{ backgroundColor: '#5d34a4', color: 'white', padding: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
            >
              Entrar
            </button>
          </form>
        </div>

        {/* Formulário de Cadastro */}
        <div style={{ flex: 1, padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
          <h2>Criar Nova Conta (Cadastro)</h2>
          <form action={signup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label htmlFor="email-signup">Email:</label>
            <input id="email-signup" name="email" type="email" required style={{ padding: '10px' }} />
            <label htmlFor="password-signup">Senha:</label>
            <input id="password-signup" name="password" type="password" required style={{ padding: '10px' }} />
            <button 
              type="submit"
              style={{ backgroundColor: '#f1c40f', color: 'black', padding: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
            >
              Criar Conta
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
