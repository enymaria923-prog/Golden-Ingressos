'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import Link from 'next/link';

export default function EventosPassadosPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    filtrarEventos();
  }, [busca, eventos]);

  const carregarDados = async () => {
    try {
      const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData) {
        router.push('/login');
        return;
      }
      
      setUser(userData);

      const dataHoje = new Date().toISOString().split('T')[0];
      const { data: eventosPass, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('user_id', userData.id)
        .lt('data', dataHoje)
        .order('data', { ascending: false });

      if (error) throw error;

      setEventos(eventosPass || []);
      setEventosFiltrados(eventosPass || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar eventos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filtrarEventos = () => {
    if (!busca.trim()) {
      setEventosFiltrados(eventos);
      return;
    }

    const buscaLower = busca.toLowerCase();
    const filtrados = eventos.filter(evento => 
      evento.nome?.toLowerCase().includes(buscaLower) ||
      evento.local?.toLowerCase().includes(buscaLower) ||
      evento.endereco?.toLowerCase().includes(buscaLower)
    );

    setEventosFiltrados(filtrados);
  };

  const calcularBonusGolden = (evento) => {
    const taxaCliente = evento.TaxaCliente || 0;
    const ingressosVendidos = evento.ingressos_vendidos || 0;
    const precoMedio = evento.preco_medio || 0;
    
    const valorTotal = ingressosVendidos * precoMedio;
    
    let percentualBonus = 0;
    if (taxaCliente === 15) percentualBonus = 5;
    else if (taxaCliente === 10) percentualBonus = 3;
    else if (taxaCliente === 8) percentualBonus = 0;
    
    return valorTotal * (percentualBonus / 100);
  };

  const calcularDadosEvento = (evento) => {
    const ingressosVendidos = evento.ingressos_vendidos || 0;
    const ingressosDisponiveis = (evento.total_ingressos || 0) - ingressosVendidos;
    const precoMedio = evento.preco_medio || 0;
    const valorTotalIngressos = ingressosVendidos * precoMedio;
    const bonusGolden = calcularBonusGolden(evento);
    const totalReceber = valorTotalIngressos + bonusGolden;

    return {
      ingressosVendidos,
      ingressosDisponiveis,
      valorTotalIngressos,
      bonusGolden,
      totalReceber
    };
  };

  const extrairCidade = (endereco) => {
    if (!endereco) return 'Não informado';
    
    // Tenta extrair cidade do formato "Rua X, 123 - Bairro - Cidade/Estado"
    const partes = endereco.split('-');
    if (partes.length >= 2) {
      const ultimaParte = partes[partes.length - 1].trim();
      return ultimaParte.split('/')[0].trim();
    }
    
    return endereco.split(',')[0].trim();
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px', textAlign: 'center', paddingTop: '100px' }}>
        <h2>Carregando...</h2>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#9b59b6', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '20px' }}>
        <Link href="/produtor" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para Área do Produtor</Link>
        <h1 style={{ margin: '0' }}>📊 Eventos Passados</h1>
        <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Histórico completo dos seus eventos realizados</p>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Barra de Pesquisa */}
        <div style={{ marginBottom: '25px' }}>
          <input
            type="text"
            placeholder="🔍 Buscar por nome do evento, local ou cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              width: '100%',
              padding: '15px 20px',
              fontSize: '16px',
              border: '2px solid #ddd',
              borderRadius: '10px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#9b59b6'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
          <p style={{ marginTop: '10px', color: '#7f8c8d', fontSize: '14px' }}>
            Mostrando {eventosFiltrados.length} de {eventos.length} eventos
          </p>
        </div>

        {/* Tabela de Eventos */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '25px', borderBottom: '2px solid #f0f0f0' }}>
            <h2 style={{ color: '#9b59b6', margin: 0 }}>Histórico de Eventos</h2>
          </div>

          {eventosFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
              <h3 style={{ color: '#7f8c8d', marginBottom: '10px' }}>
                {busca ? 'Nenhum evento encontrado' : 'Nenhum evento passado'}
              </h3>
              <p style={{ color: '#95a5a6', marginBottom: '30px' }}>
                {busca ? 'Tente outro termo de busca' : 'Você ainda não tem eventos finalizados'}
              </p>
              {busca && (
                <button 
                  onClick={() => setBusca('')}
                  style={{
                    backgroundColor: '#9b59b6',
                    color: 'white',
                    padding: '12px 25px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Limpar Busca
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Nome do Evento</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Cidade</th>
                    <th style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: '#495057' }}>Ingressos Vendidos</th>
                    <th style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: '#495057' }}>Ingressos Disponíveis</th>
                    <th style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#495057' }}>Total Ingressos</th>
                    <th style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#495057' }}>Bônus Golden</th>
                    <th style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#495057' }}>Total Recebido</th>
                  </tr>
                </thead>
                <tbody>
                  {eventosFiltrados.map((evento) => {
                    const dados = calcularDadosEvento(evento);
                    return (
                      <tr 
                        key={evento.id}
                        onClick={() => router.push(`/produtor/evento/${evento.id}`)}
                        style={{ 
                          borderBottom: '1px solid #e9ecef',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <td style={{ padding: '20px' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
                              {evento.nome}
                            </div>
                            <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
                              📅 {new Date(evento.data).toLocaleDateString('pt-BR')} às {evento.hora}
                            </div>
                            <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
                              📍 {evento.local}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '20px', color: '#7f8c8d' }}>
                          {extrairCidade(evento.endereco)}
                        </td>
                        <td style={{ padding: '20px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>
                          {dados.ingressosVendidos}
                        </td>
                        <td style={{ padding: '20px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#95a5a6' }}>
                          {dados.ingressosDisponiveis}
                        </td>
                        <td style={{ padding: '20px', textAlign: 'right', fontSize: '16px', fontWeight: 'bold', color: '#2980b9' }}>
                          R$ {dados.valorTotalIngressos.toFixed(2)}
                        </td>
                        <td style={{ padding: '20px', textAlign: 'right', fontSize: '16px', fontWeight: 'bold', color: '#9b59b6' }}>
                          R$ {dados.bonusGolden.toFixed(2)}
                        </td>
                        <td style={{ padding: '20px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: '#16a085' }}>
                          R$ {dados.totalReceber.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Estatísticas Totais */}
        {eventosFiltrados.length > 0 && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '25px', 
            borderRadius: '12px', 
            marginTop: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ color: '#9b59b6', marginBottom: '20px' }}>📊 Totalizadores</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' }}>
                  {eventosFiltrados.length}
                </div>
                <div style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '5px' }}>
                  Total de Eventos
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60' }}>
                  {eventosFiltrados.reduce((sum, e) => sum + (e.ingressos_vendidos || 0), 0)}
                </div>
                <div style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '5px' }}>
                  Ingressos Vendidos
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2980b9' }}>
                  R$ {eventosFiltrados.reduce((sum, e) => {
                    const dados = calcularDadosEvento(e);
                    return sum + dados.valorTotalIngressos;
                  }, 0).toFixed(2)}
                </div>
                <div style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '5px' }}>
                  Total em Ingressos
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a085' }}>
                  R$ {eventosFiltrados.reduce((sum, e) => {
                    const dados = calcularDadosEvento(e);
                    return sum + dados.totalReceber;
                  }, 0).toFixed(2)}
                </div>
                <div style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '5px' }}>
                  Total Recebido
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
