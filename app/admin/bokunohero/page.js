'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import Link from 'next/link';
import './admin.css';

// ===================================================================
// ETAPA 1: Tela de Login (Sem alterações)
// ===================================================================
function LoginForm({ onLoginSuccess, setLoginError, loginError }) {
  const [password, setPassword] = useState('');
  
  const handleLogin = (e) => {
    e.preventDefault();
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
// NOVO Card de Estatísticas (Sem alterações)
// ===================================================================
function EventoCardEstatisticas({ evento, aprovar, rejeitar }) {
  // Dados de Taxas (usando as colunas TaxaCliente e TaxaProdutor)
  const taxaCliente = evento.TaxaCliente || 15; 
  const taxaProdutor = evento.TaxaProdutor || 5; 
  
  // Assumindo que o ingresso é um valor único (Simplificação: sem setores)
  const precoIngresso = evento.preco || 50; 
  const ingressosVendidos = 100; // SIMULAÇÃO: Precisa ser buscado da tabela de ingressos
  
  // ********** CÁLCULOS FINANCEIROS (SIMULAÇÃO) **********
  const faturamentoIngressos = precoIngresso * ingressosVendidos; 
  const valorTaxaCliente = (faturamentoIngressos * taxaCliente) / 100; 
  const faturamentoTotal = faturamentoIngressos + valorTaxaCliente; 
  const valorTaxaProdutor = (faturamentoIngressos * taxaProdutor) / 100; 
  const valorPagoProdutor = faturamentoIngressos + valorTaxaProdutor; 
  const taxaPlataformaLiquida = valorTaxaCliente - valorTaxaProdutor;
  // *****************************************

  return (
    <div key={evento.id} className="evento-card admin-card-estatisticas">
      <div className="card-header">
        <h3>{evento.nome} ({evento.id})</h3>
        <p><strong>Status:</strong> <span className={`status-${evento.status}`}>{evento.status || 'pendente'}</span></p>
      </div>
      
      <div className="card-info">
        <p><strong>Publicação:</strong> {new Date(evento.created_at).toLocaleDateString('pt-BR')}</p>
        <p><strong>Data Evento:</strong> {evento.data} às {evento.hora}</p>
        <p><strong>Local:</strong> {evento.local}</p>
        <p><strong>Produtor (ID):</strong> {evento.user_id}</p>
      </div>

      <hr/>

      <div className="card-faturamento">
        <h4>Resumo Financeiro (Simulação)</h4>
        <p>🎟️ Ingressos Vendidos: <strong>{ingressosVendidos}</strong></p>
        <p>💰 Faturamento Total (com taxas): <strong>R$ {faturamentoTotal.toFixed(2)}</strong></p>
        <p>💵 Faturamento em Ingressos (Bruto): <strong>R$ {faturamentoIngressos.toFixed(2)}</strong></p>
        <p>📈 Taxa Plataforma (Líquida): <strong>R$ {taxaPlataformaLiquida.toFixed(2)}</strong></p>
        <p>💸 **Pagar ao Produtor (Bruto):** <strong>R$ {valorPagoProdutor.toFixed(2)}</strong></p>
      </div>

      <div className="evento-actions">
        <Link href={`/admin/bokunohero/edit/${evento.id}`} legacyBehavior>
          <a className="btn-editar">✏️ Editar Evento</a>
        </Link>
        <Link href={`/admin/bokunohero/detalhes/${evento.id}`} legacyBehavior>
          <a className="btn-detalhes">👁️ Detalhes Financeiros</a>
        </Link>

        <button 
          onClick={() => aprovar(evento.id)} 
          className="btn-aprovar"
          disabled={evento.status === 'aprovado'}
        >
          ✅ Aprovar
        </button>
        <button 
          onClick={() => rejeitar(evento.id)} 
          className="btn-rejeitar"
          disabled={evento.status === 'rejeitado'}
        >
          ❌ Rejeitar
        </button>
      </div>
    </div>
  );
}

// ===================================================================
// ETAPA 2: Conteúdo do Admin (Sem alterações significativas na lógica interna)
// ===================================================================
function AdminContent() {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]); 
  const [carregando, setCarregando] = useState(true);
  
  const [filtroProdutor, setFiltroProdutor] = useState('');
  const [filtroDataRange, setFiltroDataRange] = useState(null); 

  const supabase = createClient();
  
  const carregarEventos = async (dataFiltro = null) => {
    setCarregando(true);
    let query = supabase.from('eventos')
      .select('*')
      .not('status', 'eq', 'rejeitado')
      .order('created_at', { ascending: false }); 

    // Lógica para filtrar por data
    if (dataFiltro) {
        const hoje = new Date();
        const hojeISO = hoje.toISOString().split('T')[0];
        
        if (dataFiltro === 'proximos_5_dias') {
          const cincoDiasFrente = new Date();
          cincoDiasFrente.setDate(hoje.getDate() + 5);
          query = query
            .gte('data', hojeISO)
            .lte('data', cincoDiasFrente.toISOString().split('T')[0]);
        }
        else if (dataFiltro === 'ultimos_5_dias') {
          const cincoDiasAtras = new Date();
          cincoDiasAtras.setDate(hoje.getDate() - 5);
          query = query
            .gte('data', cincoDiasAtras.toISOString().split('T')[0])
            .lte('data', hojeISO);
        }
    }
    
    try {
      const { data: eventosData, error } = await query;
      if (error) throw error;
      setEventos(eventosData || []);
      setEventosFiltrados(eventosData || []); 
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      alert('Erro: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarEventos();
  }, []);
  
  // Filtro de Produtor (Front-end)
  useEffect(() => {
      let tempEventos = eventos;
      if (filtroProdutor) {
          tempEventos = tempEventos.filter(e => e.user_id && e.user_id.includes(filtroProdutor));
      }
      setEventosFiltrados(tempEventos);
  }, [filtroProdutor, eventos]);
  
  // Funções de Moderação (Aprovar / Rejeitar)
  const aprovarEvento = async (eventoId) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .update({ status: 'aprovado' })
        .eq('id', eventoId);
      if (error) throw error;
      alert('Evento aprovado!');
      carregarEventos(filtroDataRange); // Recarrega a lista mantendo o filtro de data
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
      carregarEventos(filtroDataRange); // Recarrega a lista mantendo o filtro de data
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    window.location.reload(); 
  };
  
  const handleFiltroDataRapida = (tipo) => {
    setFiltroDataRange(tipo);
    carregarEventos(tipo); 
  };

  if (carregando) {
    return <div className="admin-loading">Carregando eventos...</div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Área de Moderação (Super Admin)</h1>
        <div className="admin-stats">
          <span>Pendentes: {eventos.filter(e => e.status === 'pendente' || !e.status).length}</span>
          <span>Aprovados: {eventos.filter(e => e.status === 'aprovado').length}</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">Sair</button>
      </header>

      <div className="admin-action-bar">
        <button onClick={() => carregarEventos(filtroDataRange)} className="btn-recargar">
          Recarregar Eventos
        </button>
        <Link href="/admin/rejeitados" legacyBehavior>
          <a className="btn-rejeitados">Ver Rejeitados</a>
        </Link>
      </div>

      <div className="admin-filtros">
        <h3>Filtros de Busca</h3>
        <div className="form-group">
          <label>ID do Produtor:</label>
          <input
            type="text"
            value={filtroProdutor}
            onChange={(e) => setFiltroProdutor(e.target.value)}
            placeholder="Pesquisar por ID do Produtor (user_id)"
          />
        </div>
        <div className="form-group">
          <label>Filtros Rápidos de Data:</label>
          <button onClick={() => handleFiltroDataRapida(null)} className={!filtroDataRange ? 'active' : ''}>Todos</button>
          <button onClick={() => handleFiltroDataRapida('ultimos_5_dias')} className={filtroDataRange === 'ultimos_5_dias' ? 'active' : ''}>Últimos 5 Dias</button>
          <button onClick={() => handleFiltroDataRapida('proximos_5_dias')} className={filtroDataRange === 'proximos_5_dias' ? 'active' : ''}>Próximos 5 Dias</button>
        </div>
      </div>

      <div className="eventos-list eventos-estatisticas">
        {eventosFiltrados.length === 0 ? (
          <p className="no-events">Nenhum evento encontrado com os filtros atuais.</p>
        ) : (
          eventosFiltrados.map(evento => (
            <EventoCardEstatisticas 
              key={evento.id} 
              evento={evento} 
              aprovar={aprovarEvento} 
              rejeitar={rejeitarEvento} 
            />
          ))
        )}
      </div>
    </div>
  );
}

// ===================================================================
// COMPONENTE PRINCIPAL: Decide se mostra o Login ou o Conteúdo
// CORREÇÃO: Adicionado 'isLoading' e verificação de 'window'
// ===================================================================
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Estado de loading para verificar a sessão

  useEffect(() => {
    // CORREÇÃO: 
    // Acessa o sessionStorage SÓ DEPOIS que o componente montar no navegador.
    // Isso impede o erro "sessionStorage is not defined" durante o build do Vercel.
    if (typeof window !== 'undefined') {
      const loggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
      setIsAuthenticated(loggedIn);
    }
    setIsLoading(false); // Termina a verificação
  }, []); // O array vazio [] garante que isso só rode UMA VEZ no cliente.

  // Mostra um loading enquanto verifica o sessionStorage
  if (isLoading) {
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
