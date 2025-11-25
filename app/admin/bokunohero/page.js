'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import Link from 'next/link';
import '../../publicar-evento/PublicarEvento.css';
import './admin.css';

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [eventos, setEventos] = useState([]);
  const [produtores, setProdutores] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('pendentes');
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaProdutor, setBuscaProdutor] = useState('');
  const [eventoExpandido, setEventoExpandido] = useState(null);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    setIsAuthenticated(loggedIn);
    if (loggedIn) {
      carregarEventos();
    }
  }, []);

  const carregarEventos = async () => {
    setCarregando(true);
    try {
      const { data: eventosData, error } = await supabase
        .from('eventos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setEventos(eventosData || []);
      
      // Buscar dados dos produtores
      const userIds = [...new Set(eventosData.map(e => e.user_id).filter(Boolean))];
      const produtoresData = {};
      
      for (const userId of userIds) {
        const { data: produtorData, error: produtorError } = await supabase
          .from('produtores')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (produtorData) {
          produtoresData[userId] = produtorData;
        } else {
          console.log('Produtor não encontrado para id:', userId, produtorError);
        }
      }
      
      setProdutores(produtoresData);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      alert(`Erro ao carregar eventos: ${error.message}`);
    } finally {
      setCarregando(false);
    }
  };

  const eventoJaAconteceu = (evento) => {
    const agora = new Date();
    const dataEvento = new Date(`${evento.data}T${evento.hora}`);
    const umaHoraDepois = new Date(dataEvento.getTime() + 60 * 60 * 1000);
    return agora > umaHoraDepois;
  };

  const filtrarEventos = () => {
    let resultado = [...eventos];
    
    // Filtro por aba
    if (abaAtiva === 'pendentes') {
      resultado = resultado.filter(e => e.status === 'pendente' || !e.status);
    } else if (abaAtiva === 'aprovados') {
      resultado = resultado.filter(e => e.status === 'aprovado' && !eventoJaAconteceu(e));
    } else if (abaAtiva === 'passados') {
      resultado = resultado.filter(e => e.status === 'aprovado' && eventoJaAconteceu(e));
    } else if (abaAtiva === 'rejeitados') {
      resultado = resultado.filter(e => e.status === 'rejeitado');
    }
    
    // Filtro por nome
    if (buscaNome.trim()) {
      resultado = resultado.filter(e => 
        e.nome?.toLowerCase().includes(buscaNome.toLowerCase())
      );
    }
    
    // Filtro por produtor
    if (buscaProdutor.trim()) {
      resultado = resultado.filter(e => {
        const produtor = produtores[e.user_id];
        return e.user_id?.toLowerCase().includes(buscaProdutor.toLowerCase()) ||
               e.produtor_nome?.toLowerCase().includes(buscaProdutor.toLowerCase()) ||
               produtor?.nome_completo?.toLowerCase().includes(buscaProdutor.toLowerCase());
      });
    }
    
    return resultado;
  };

  const calcularEstatisticas = (evento) => {
    const ingressosVendidos = evento.ingressos_vendidos || 0;
    const precoMedio = evento.preco_medio || 0;
    const taxaCliente = evento.TaxaCliente || 15;
    const taxaProdutor = evento.TaxaProdutor || 5;
    
    const faturamentoBruto = ingressosVendidos * precoMedio;
    const taxasTotal = faturamentoBruto * (taxaCliente / 100);
    const pagamentoProdutor = faturamentoBruto + (faturamentoBruto * (taxaProdutor / 100));
    const lucroPlataforma = taxasTotal - (faturamentoBruto * (taxaProdutor / 100));
    
    return {
      ingressosVendidos,
      faturamentoBruto: faturamentoBruto.toFixed(2),
      taxasTotal: taxasTotal.toFixed(2),
      pagamentoProdutor: pagamentoProdutor.toFixed(2),
      lucroPlataforma: lucroPlataforma.toFixed(2),
      taxaCliente,
      taxaProdutor
    };
  };

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

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    setIsAuthenticated(false);
  };

  const limparFiltros = () => {
    setBuscaNome('');
    setBuscaProdutor('');
  };

  const eventosFiltrados = filtrarEventos();
  const pendentesCount = eventos.filter(e => e.status === 'pendente' || !e.status).length;
  const aprovadosCount = eventos.filter(e => e.status === 'aprovado' && !eventoJaAconteceu(e)).length;
  const passadosCount = eventos.filter(e => e.status === 'aprovado' && eventoJaAconteceu(e)).length;
  const rejeitadosCount = eventos.filter(e => e.status === 'rejeitado').length;

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

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Área de Moderação</h1>
        <div className="admin-stats">
          <span className="stat-pendente">Pendentes: {pendentesCount}</span>
          <span className="stat-aprovado">Aprovados: {aprovadosCount}</span>
          <span className="stat-passado">Passados: {passadosCount}</span>
          <span className="stat-rejeitado">Rejeitados: {rejeitadosCount}</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">Sair</button>
      </header>

      <div className="admin-action-bar">
        <button onClick={carregarEventos} className="btn-recargar">
          🔄 Recarregar
        </button>
      </div>

      {/* ABAS DE NAVEGAÇÃO */}
      <div className="abas-container">
        <button 
          className={`aba ${abaAtiva === 'pendentes' ? 'aba-ativa' : ''}`}
          onClick={() => setAbaAtiva('pendentes')}
        >
          ⏳ Pendentes ({pendentesCount})
        </button>
        <button 
          className={`aba ${abaAtiva === 'aprovados' ? 'aba-ativa' : ''}`}
          onClick={() => setAbaAtiva('aprovados')}
        >
          ✅ Aprovados Futuros ({aprovadosCount})
        </button>
        <button 
          className={`aba ${abaAtiva === 'passados' ? 'aba-ativa' : ''}`}
          onClick={() => setAbaAtiva('passados')}
        >
          📅 Aprovados Passados ({passadosCount})
        </button>
        <button 
          className={`aba ${abaAtiva === 'rejeitados' ? 'aba-ativa' : ''}`}
          onClick={() => setAbaAtiva('rejeitados')}
        >
          ❌ Rejeitados ({rejeitadosCount})
        </button>
      </div>

      {/* FILTROS */}
      <div className="filtros-container">
        <h2>🔍 Filtros de Busca</h2>
        
        <div className="filtros-grid">
          <div className="filtro-group">
            <label>🎭 Buscar por Nome do Evento:</label>
            <input
              type="text"
              placeholder="Digite o nome do evento..."
              value={buscaNome}
              onChange={(e) => setBuscaNome(e.target.value)}
              className="filtro-input"
            />
          </div>

          <div className="filtro-group">
            <label>👤 Buscar por Produtor:</label>
            <input
              type="text"
              placeholder="Digite o ID ou nome do produtor..."
              value={buscaProdutor}
              onChange={(e) => setBuscaProdutor(e.target.value)}
              className="filtro-input"
            />
          </div>

          <button onClick={limparFiltros} className="btn-limpar-filtros">
            🧹 Limpar Filtros
          </button>
        </div>

        <p className="filtro-resultado">
          Mostrando {eventosFiltrados.length} de {eventos.length} eventos
        </p>
      </div>

      {/* LISTA DE EVENTOS */}
      {carregando ? (
        <div className="admin-loading">Carregando eventos...</div>
      ) : (
        <div className="eventos-list">
          {eventosFiltrados.length === 0 ? (
            <p className="no-events">Nenhum evento encontrado nesta categoria.</p>
          ) : (
            eventosFiltrados.map(evento => {
              const stats = calcularEstatisticas(evento);
              const produtor = produtores[evento.user_id];
              const isExpanded = eventoExpandido === evento.id;
              
              return (
                <div key={evento.id} className={`evento-card status-${evento.status || 'pendente'}`}>
                  <div className="card-header">
                    <h3>{evento.nome}</h3>
                    <span className={`badge-status status-${evento.status || 'pendente'}`}>
                      {evento.status || 'pendente'}
                    </span>
                  </div>
                  
                  <div className="card-info">
                    <p><strong>📅 Data:</strong> {evento.data} às {evento.hora}</p>
                    <p><strong>📍 Local:</strong> {evento.local}</p>
                    <p><strong>👤 Produtor:</strong> {produtor?.nome_completo || evento.produtor_nome || evento.user_id}</p>
                    <p><strong>🆔 ID do Evento:</strong> {evento.id}</p>
                  </div>

                  <button 
                    onClick={() => setEventoExpandido(isExpanded ? null : evento.id)}
                    className="btn-toggle-stats"
                  >
                    {isExpanded ? '▲ Ocultar Estatísticas' : '▼ Ver Estatísticas'}
                  </button>

                  {isExpanded && (
                    <div className="estatisticas-evento">
                      <h4>📊 Estatísticas Financeiras</h4>
                      <div className="stats-grid">
                        <div className="stat-item">
                          <span className="stat-label">🎟️ Ingressos Vendidos:</span>
                          <span className="stat-value">{stats.ingressosVendidos}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">💰 Faturamento Bruto:</span>
                          <span className="stat-value">R$ {stats.faturamentoBruto}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">📈 Taxas Total ({stats.taxaCliente}%):</span>
                          <span className="stat-value">R$ {stats.taxasTotal}</span>
                        </div>
                        <div className="stat-item highlight">
                          <span className="stat-label">💵 Pagar ao Produtor (+{stats.taxaProdutor}%):</span>
                          <span className="stat-value">R$ {stats.pagamentoProdutor}</span>
                        </div>
                        <div className="stat-item success">
                          <span className="stat-label">✨ Lucro da Plataforma:</span>
                          <span className="stat-value">R$ {stats.lucroPlataforma}</span>
                        </div>
                      </div>
                      
                      <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>💳 Dados do Produtor</h4>
                      <div className="produtor-dados">
                        {produtor ? (
                          <>
                            <p><strong>Nome Completo:</strong> {produtor.nome_completo || 'Não informado'}</p>
                            <p><strong>Empresa:</strong> {produtor.nome_empresa || 'Não informado'}</p>
                            <p><strong>Email:</strong> {produtor.email || evento.produtor_email || 'Não informado'}</p>
                            
                            <h5 style={{ marginTop: '15px', marginBottom: '10px' }}>💸 Forma de Pagamento Preferida:</h5>
                            <p><strong>Preferência:</strong> {produtor.forma_pagamento === 'apenas_pix' ? 'Apenas PIX' : produtor.forma_pagamento === 'apenas_transferencia' ? 'Apenas Transferência' : produtor.forma_pagamento === 'ambos' ? 'Ambos (PIX e Transferência)' : 'Não informado'}</p>
                            
                            <div style={{ background: '#e8f5e9', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                              <p style={{ margin: 0 }}><strong>🔑 Chave PIX:</strong> {produtor.chave_pix || 'Não informado'}</p>
                              <p style={{ margin: '5px 0 0 0' }}><strong>Tipo:</strong> {produtor.tipo_chave_pix ? produtor.tipo_chave_pix.toUpperCase() : 'Não informado'}</p>
                            </div>
                            
                            <div style={{ background: '#e3f2fd', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                              <p style={{ margin: 0 }}><strong>🏦 Dados Bancários:</strong></p>
                              <p style={{ margin: '5px 0 0 0', whiteSpace: 'pre-wrap' }}>{produtor.dados_bancarios || 'Não informado'}</p>
                            </div>
                          </>
                        ) : (
                          <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '5px' }}>
                            <p style={{ margin: 0 }}><strong>⚠️ Dados do produtor não encontrados no sistema</strong></p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>User ID: {evento.user_id}</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Email: {evento.produtor_email || 'Não informado'}</p>
                          </div>
                        )}
                      </div>
                      
                      <p className="taxa-info">
                        <small>📋 Plano escolhido: Taxa Cliente {stats.taxaCliente}% | Taxa Produtor {stats.taxaProdutor}%</small>
                      </p>
                    </div>
                  )}

                  <div className="evento-actions">
                    <button 
                      onClick={() => router.push(`/admin/bokunohero/edit/${evento.id}`)} 
                      className="btn-editar"
                      title="Editar evento"
                    >
                      ✏️ Editar
                    </button>
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
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
