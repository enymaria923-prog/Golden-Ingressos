'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
// ===================================================================
// CORREÇÃO NA MARRA: 
// Importando o 'createBrowserClient' e IGNORANDO o 'utils/supabase/client.js'
import { createBrowserClient } from '@supabase/ssr';
// ===================================================================
import Link from 'next/link';
import './admin.css';

// ===================================================================
// CORREÇÃO NA MARRA: 
// Colocando as chaves direto aqui para matar o erro 'undefined'
// Usei as chaves que você me mandou.
// ===================================================================
const supabase_url = 'https://ubqlygisnqigiqkzbamd.supabase.co';
const supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicWx5Z2lzbnFpZ2lxa3piYW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODI4NzgsImV4cCI6MjA3NzI1ODg3OH0.yXfhMk9intqcQs3xYBX2PcZzoPJp0iMy9RtHDMJpL7o';
const supabase = createBrowserClient(supabase_url, supabase_key);
// ===================================================================


// ===================================================================
// ETAPA 1: Tela de Login (Mantida)
// ===================================================================
function LoginForm({ onLoginSuccess, setLoginError, loginError }) {
  const [password, setPassword] = useState('');
  
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'valtinho') {
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
// Card de Estatísticas (Mantido)
// ===================================================================
function EventoCardEstatisticas({ evento, aprovar, rejeitar }) {
  const taxaCliente = evento.TaxaCliente || 15; 
  const taxaProdutor = evento.TaxaProdutor || 5; 
  const precoIngresso = evento.preco || 50; 
  const ingressosVendidos = 100; // SIMULAÇÃO
  
  const faturamentoIngressos = precoIngresso * ingressosVendidos; 
  const valorTaxaCliente = (faturamentoIngressos * taxaCliente) / 100; 
  const faturamentoTotal = faturamentoIngressos + valorTaxaCliente; 
  const valorTaxaProdutor = (faturamentoIngressos * taxaProdutor) / 100; 
  const valorPagoProdutor = faturamentoIngressos + valorTaxaProdutor; 
  const taxaPlataformaLiquida = valorTaxaCliente - valorTaxaProdutor;

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
// Conteúdo do Admin (Sem 'alert' e usando o 'supabase' criado acima)
// ===================================================================
function AdminContent() {
  const [eventos, setEventos] = useState([]); // A lista COMPLETA vinda do BD
  const [eventosFiltrados, setEventosFiltrados] = useState([]); // A lista que o usuário VÊ
  const [carregando, setCarregando] = useState(true);
  
  const [filtroProdutor, setFiltroProdutor] = useState('');
  const [filtroDataRange, setFiltroDataRange] = useState(null); 

  // USA a instância 'supabase' criada na marra acima

  const carregarEventos = async () => {
    setCarregando(true);
    try {
      console.log('Buscando eventos (pendentes e aprovados)...');
      
      let { data: eventosData, error } = await supabase
        .from('eventos')
        .select('*')
        .not('status', 'eq', 'rejeitado') 
        .order('created_at', { ascending: false }); 

      if (error) throw error;
      
      console.log('Eventos recebidos do BD:', eventosData);
      setEventos(eventosData || []); 
      setEventosFiltrados(eventosData || []); 

    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setCarregando(false); 
    }
  };

  useEffect(() => {
    carregarEventos();
  }, []);
  
  useEffect(() => {
    let tempEventos = [...eventos]; 
    
    if (filtroProdutor) {
      tempEventos = tempEventos.filter(e => e.user_id && e.user_id.includes(filtroProdutor));
    }

    if (filtroDataRange) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); 

      if (filtroDataRange === 'proximos_5_dias') {
        const cincoDiasFrente = new Date(hoje);
        cincoDiasFrente.setDate(hoje.getDate() + 5);
        tempEventos = tempEventos.filter(e => {
          const dataEvento = new Date(e.data);
          return dataEvento >= hoje && dataEvento <= cincoDiasFrente;
        });
      } 
      else if (filtroDataRange === 'ultimos_5_dias') {
        const cincoDiasAtras = new Date(hoje);
        cincoDiasAtras.setDate(hoje.getDate() - 5);
        tempEventos = tempEventos.filter(e => {
          const dataEvento = new Date(e.data);
          return dataEvento >= cincoDiasAtras && dataEvento <= hoje;
        });
      }
    }
    
    setEventosFiltrados(tempEventos);
  }, [filtroProdutor, filtroDataRange, eventos]);
  
  const aprovarEvento = async (eventoId) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .update({ status: 'aprovado' })
        .eq('id', eventoId);
      if (error) throw error;
      console.log('Evento aprovado!');
      carregarEventos(); 
    } catch (error) {
      console.error('Erro ao aprovar:', error.message);
    }
  };

  const rejeitarEvento = async (eventoId) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .update({ status: 'rejeitado' })
        .eq('id', eventoId);
      if (error) throw error;
      console.log('Evento rejeitado!');
      carregarEventos(); 
    } catch (error) {
      console.error('Erro ao rejeitar:', error.message);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    window.location.reload(); 
  };
  
  const handleFiltroDataRapida = (tipo) => {
    setFiltroDataRange(tipo); 
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
        <button onClick={carregarEventos} className="btn-recargar">
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
// COMPONENTE PRINCIPAL (Mantido)
// ===================================================================
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
      setIsAuthenticated(loggedIn);
    }
    setIsLoading(false); 
  }, []); 

  if (isLoading) {
    return <div className="admin-loading">Verificando sessão...</div>;
  }
  
  if (isAuthenticated) {
    return (
      <Suspense fallback={<div className="admin-loading">Carregando...</div>}>
        <AdminContent />
      </Suspense>
    );
  }

  return <LoginForm 
            onLoginSuccess={setIsAuthenticated} 
            setLoginError={setLoginError}
            loginError={loginError} 
          />;
}

