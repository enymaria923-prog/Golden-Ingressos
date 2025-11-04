'use client';
// IMPORTS CORRETOS - APENAS 3 níveis
import SetorManager from '../../publicar-evento/components/SetorManager';
import CategoriaSelector from '../../publicar-evento/components/CategoriaSelector';
import SelecionarTaxa from '../../publicar-evento/components/SelecionarTaxa';
import '../../publicar-evento/PublicarEvento.css';
import client from '../../utils/supabase/client';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // VERIFICA LOGIN AO CARREGAR
  useEffect(() => {
    const loggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    setIsAuthenticated(loggedIn);
    if (loggedIn) {
      carregarEventos();
    }
  }, []);

  // CARREGA EVENTOS - FUNÇÃO SIMPLES
const carregarEventos = async () => {
  setCarregando(true);
  try {
    console.log('🔄 Buscando eventos...');
    
    // VERIFICA SE O SUPABASE ESTÁ DEFINIDO
    if (!supabase) {
      console.error('❌ Supabase não está definido');
      throw new Error('Supabase não está configurado');
    }

    console.log('🔍 Supabase instance:', supabase);
    
    // BUSCA SIMPLES - TODOS OS EVENTOS
    const { data: eventosData, error } = await supabase
      .from('eventos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro do Supabase:', error);
      throw error;
    }
    
    console.log('✅ Eventos carregados:', eventosData);
    setEventos(eventosData || []); 
    setEventosFiltrados(eventosData || []); 

  } catch (error) {
    console.error('💥 Erro ao carregar eventos:', error);
    alert(`Erro ao carregar eventos: ${error.message}`);
  } finally {
    setCarregando(false); 
  }
};

  // LOGIN
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'valtinho') {
      sessionStorage.setItem('admin_logged_in', 'true');
      setIsAuthenticated(true);
      carregarEventos();
    } else {
      setLoginError('Senha incorreta!');
    }
  };

  // APROVAR EVENTO
  const aprovarEvento = async (id) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .update({ status: 'aprovado' })
        .eq('id', id);
      
      if (error) throw error;
      alert('✅ Evento aprovado!');
      carregarEventos();
    } catch (error) {
      alert('❌ Erro ao aprovar: ' + error.message);
    }
  };

  // REJEITAR EVENTO
  const rejeitarEvento = async (id) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .update({ status: 'rejeitado' })
        .eq('id', id);
      
      if (error) throw error;
      alert('❌ Evento rejeitado!');
      carregarEventos();
    } catch (error) {
      alert('❌ Erro ao rejeitar: ' + error.message);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    setIsAuthenticated(false);
  };

  // CALCULAR ESTATÍSTICAS
  const pendentesCount = eventos.filter(e => e.status === 'pendente' || !e.status).length;
  const aprovadosCount = eventos.filter(e => e.status === 'aprovado').length;

  // SE NÃO ESTIVER LOGADO
  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <form onSubmit={handleLogin} className="admin-login-form">
          <h1>Moderação</h1>
          <p>Por favor, insira a senha de administrador.</p>
          <div className="form-group">
            <label>Senha:</label>
            <input
              type="password"
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

  // SE ESTIVER LOGADO
  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Área de Moderação</h1>
        <div className="admin-stats">
          <span>Pendentes: {pendentesCount}</span>
          <span>Aprovados: {aprovadosCount}</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">Sair</button>
      </header>

      <div className="admin-action-bar">
        <button onClick={carregarEventos} className="btn-recargar">
          🔄 Recarregar Eventos
        </button>
      </div>

      {carregando ? (
        <div className="admin-loading">Carregando eventos...</div>
      ) : (
        <div className="eventos-list">
          {eventos.length === 0 ? (
            <p className="no-events">Nenhum evento encontrado.</p>
          ) : (
            eventos.map(evento => (
              <div key={evento.id} className="evento-card">
                <div className="card-header">
                  <h3>{evento.nome} ({evento.id})</h3>
                  <p><strong>Status:</strong> <span className={`status-${evento.status}`}>{evento.status || 'pendente'}</span></p>
                </div>
                
                <div className="card-info">
                  <p><strong>Data:</strong> {evento.data} às {evento.hora}</p>
                  <p><strong>Local:</strong> {evento.local}</p>
                  <p><strong>Produtor:</strong> {evento.user_id}</p>
                </div>

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
      )}
    </div>
  );
}
