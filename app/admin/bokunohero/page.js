'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation'; // Não precisamos mais do useSearchParams
import { createClient } from '../../../utils/supabase/client';
import Link from 'next/link'; // Importamos o Link para a futura página
import './admin.css';

// ===================================================================
// ETAPA 1: Tela de Login
// ===================================================================
function LoginForm({ onLoginSuccess, setLoginError, loginError }) {
  const [password, setPassword] = useState('');
  const router = useRouter(); // Usamos o router para o caso de acesso negado

  const handleLogin = (e) => {
    e.preventDefault();
    // Esta é a senha que você definiu
    if (password === 'valtinho') {
      // Salva no sessionStorage para manter o login
      sessionStorage.setItem('admin_logged_in', 'true');
      onLoginSuccess(true);
      setLoginError('');
    } else {
      setLoginError('Senha incorreta!');
    }
  };

  return (
    <div className="admin-login-container">
      <form onSubmit={handleLogin} className="admin-login-form">
        <h1>Moderação</h1>
        <p>Por favor, insira a senha de administrador.</p>
        <div className="form-group">
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />
        </div>
        {loginError && <p className="login-error">{loginError}</p>}
        <button type="submit" className="btn-submit-login">Entrar</button>
      </form>
    </div>
  );
}

// ===================================================================
// ETAPA 2: Conteúdo do Admin (O que você já tinha, mas protegido)
// ===================================================================
function AdminContent() {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    setCarregando(true);
    try {
      console.log('Buscando eventos pendentes/aprovados...');
      
      // ===================================================================
      // MUDANÇA (Problema B): 
      // Não buscamos mais eventos 'rejeitados' nesta tela.
      // Usamos .not() para excluir.
      // ===================================================================
      const { data: eventosData, error } = await supabase
        .from('eventos')
        .select('*')
        .not('status', 'eq', 'rejeitado') // <-- SÓ PEGA NÃO-REJEITADOS
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Eventos encontrados:', eventosData);
      setEventos(eventosData || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      alert('Erro: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const aprovarEvento = async (eventoId) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .update({ status: 'aprovado' })
        .eq('id', eventoId);
      if (error) throw error;
      alert('Evento aprovado!');
      carregarEventos(); // Recarrega a lista
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const rejeitarEvento = async (eventoId) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .update({ status: 'rejeitado' })
        .eq('id', eventoId);
      if (error) throw error;
      alert('Evento rejeitado!');
      carregarEventos(); // Recarrega (o evento vai sumir desta lista)
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    window.location.reload(); // Recarrega a página (vai voltar para o login)
  };

  if (carregando) {
    return <div className="admin-loading">Carregando eventos...</div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Área de Moderação</h1>
        <div className="admin-stats">
          {/* Filtro atualizado para 'pendente' ou nulo */}
          <span>Pendentes: {eventos.filter(e => e.status === 'pendente' || !e.status).length}</span>
          <span>Aprovados: {eventos.filter(e => e.status === 'aprovado').length}</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">Sair</button>
      </header>

      {/* Botões de Ação */}
      <div className="admin-action-bar">
        <button onClick={carregarEventos} className="btn-recargar">
          Recarregar Eventos
        </button>
        {/* =================================================================== */}
        {/* LINK (Problema B): Link para a página que criaremos na Etapa 2 */}
        {/* =================================================================== */}
        <Link href="/admin/rejeitados" legacyBehavior>
          <a className="btn-rejeitados">Ver Eventos Rejeitados</a>
        </Link>
      </div>


      <div className="eventos-list">
        {eventos.length === 0 ? (
          <p className="no-events">Nenhum evento pendente ou aprovado.</p>
        ) : (
          eventos.map(evento => (
            <div key={evento.id} className="evento-card">
              <h3>{evento.nome}</h3>
              {/* Usando a coluna 'nome' (baseado no último erro) */}
              <p><strong>Data:</strong> {evento.data} {evento.hora}</p>
              <p><strong>Local:</strong> {evento.local}</p> 
              <p><strong>Status:</strong> {evento.status || 'pendente'}</p>
              
              <div className="evento-actions">
                <button 
                  onClick={() => aprovarEvento(evento.id)} 
                  className="btn-aprovar"
                  disabled={evento.status === 'aprovado'}
                >
                  ✅ Aprovar
                </button>
                <button 
                  onClick={() => rejeitarEvento(evento.id)} 
                  className="btn-rejeitar"
                  disabled={evento.status === 'rejeitado'}
                >
                  ❌ Rejeitar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ===================================================================
// COMPONENTE PRINCIPAL: Decide se mostra o Login ou o Conteúdo
// ===================================================================
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    // Verifica se já está logado no sessionStorage quando a página carrega
    const loggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    setIsAuthenticated(loggedIn);
    setIsLoadingSession(false); // Termina a verificação
  }, []);

  // Mostra um loading enquanto verifica o sessionStorage
  if (isLoadingSession) {
    return <div className="admin-loading">Verificando sessão...</div>;
  }
  
  // Se estiver autenticado, mostra o conteúdo do admin
  if (isAuthenticated) {
    return (
      <Suspense fallback={<div className="admin-loading">Carregando...</div>}>
        <AdminContent />
      </Suspense>
    );
  }

  // Se não estiver autenticado, mostra o formulário de login
  return <LoginForm 
            onLoginSuccess={setIsAuthenticated} 
            setLoginError={setLoginError}
            loginError={loginError} 
          />;
}
