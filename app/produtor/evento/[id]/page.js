'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client';
import Link from 'next/link';

export default function EventoDetalhesPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const eventoId = params.id;
  
  const [evento, setEvento] = useState(null);
  const [dadosIngressos, setDadosIngressos] = useState({
    total_ingressos: 0,
    ingressos_vendidos: 0,
    preco_medio: 0
  });
  const [loading, setLoading] = useState(true);
  const [mostrarModalSessao, setMostrarModalSessao] = useState(false);
  const [mostrarModalIngressos, setMostrarModalIngressos] = useState(false);

  useEffect(() => {
    carregarEvento();
  }, [eventoId]);

  const carregarEvento = async () => {
    try {
      // Carrega evento
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      if (error) throw error;
      setEvento(data);

      // Busca dados dos ingressos
      const dadosIngs = await buscarDadosIngressos(eventoId);
      setDadosIngressos(dadosIngs);

    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      alert('Erro ao carregar evento');
      router.push('/produtor');
    } finally {
      setLoading(false);
    }
  };

  const buscarDadosIngressos = async (eventoId) => {
    try {
      // Busca todos os ingressos do evento
      const { data: ingressos } = await supabase
        .from('ingressos')
        .select('preco, status')
        .eq('evento_id', eventoId);

      console.log('📊 Ingressos encontrados:', ingressos);

      if (!ingressos || ingressos.length === 0) {
        return {
          total_ingressos: 0,
          ingressos_vendidos: 0,
          preco_medio: 0
        };
      }

      // Calcula totais
      const totalIngressos = ingressos.length;
      const ingressosVendidos = ingressos.filter(i => i.status === 'vendido').length;
      
      // Calcula preço médio
      const somaPrecos = ingressos.reduce((sum, i) => sum + (parseFloat(i.preco) || 0), 0);
      const precoMedio = totalIngressos > 0 ? somaPrecos / totalIngressos : 0;

      console.log('📈 Estatísticas:', {
        totalIngressos,
        ingressosVendidos,
        precoMedio
      });

      return {
        total_ingressos: totalIngressos,
        ingressos_vendidos: ingressosVendidos,
        preco_medio: precoMedio
      };

    } catch (error) {
      console.error('Erro ao buscar ingressos:', error);
      return {
        total_ingressos: 0,
        ingressos_vendidos: 0,
        preco_medio: 0
      };
    }
  };

  const calcularBonusGolden = () => {
    if (!evento) return 0;
    const taxaCliente = evento.TaxaCliente || 0;
    const ingressosVendidos = dadosIngressos.ingressos_vendidos || 0;
    const precoMedio = dadosIngressos.preco_medio || 0;
    const valorTotal = ingressosVendidos * precoMedio;
    
    let percentualBonus = 0;
    if (taxaCliente === 15) percentualBonus = 5;
    else if (taxaCliente === 10) percentualBonus = 3;
    else if (taxaCliente === 8) percentualBonus = 0;
    
    return valorTotal * (percentualBonus / 100);
  };

  const getNomePlano = (taxa) => {
    if (taxa === 15) return 'Plano Padrão (15% taxa, +5% bônus)';
    if (taxa === 10) return 'Plano Intermediário (10% taxa, +3% bônus)';
    if (taxa === 8) return 'Plano Econômico (8% taxa, sem bônus)';
    return `Taxa de ${taxa}%`;
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px', textAlign: 'center', paddingTop: '100px' }}>
        <h2>Carregando...</h2>
      </div>
    );
  }

  if (!evento) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px', textAlign: 'center', paddingTop: '100px' }}>
        <h2>Evento não encontrado</h2>
        <Link href="/produtor" style={{ color: '#5d34a4', textDecoration: 'underline' }}>Voltar</Link>
      </div>
    );
  }

  const ingressosVendidos = dadosIngressos.ingressos_vendidos || 0;
  const totalIngressos = dadosIngressos.total_ingressos || 0;
  const ingressosDisponiveis = Math.max(0, totalIngressos - ingressosVendidos);
  const precoMedio = dadosIngressos.preco_medio || 0;
  const valorTotalIngressos = ingressosVendidos * precoMedio;
  const bonusGolden = calcularBonusGolden();
  const totalReceber = valorTotalIngressos + bonusGolden;
  const eventoPassado = new Date(evento.data) < new Date();

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      <header style={{ 
        backgroundColor: eventoPassado ? '#95a5a6' : '#5d34a4', 
        color: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <Link href="/produtor" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar</Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 10px 0' }}>{evento.nome}</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {eventoPassado ? '📊 Relatório de Evento Finalizado' : '🎯 Gerenciar Evento Ativo'}
          </p>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '20px', 
          marginBottom: '25px' 
        }}>
          
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#5d34a4', marginTop: 0 }}>📋 Informações do Evento</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <strong>📅 Data e Hora:</strong><br />
                {new Date(evento.data).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} às {evento.hora}
              </div>
              
              <div>
                <strong>📍 Local:</strong><br />
                {evento.local}
              </div>
              
              {evento.endereco && (
                <div>
                  <strong>🗺️ Endereço:</strong><br />
                  {evento.endereco}
                </div>
              )}
              
              <div>
                <strong>🎭 Categoria:</strong><br />
                {evento.categoria || 'Não especificada'}
              </div>
              
              <div>
                <strong>💺 Tipo de Evento:</strong><br />
                {evento.tem_lugar_marcado ? 'Com lugar marcado' : 'Sem lugar marcado'}
              </div>
              
              <div>
                <strong>📊 Status:</strong><br />
                <span style={{ 
                  padding: '5px 12px', 
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: evento.status === 'aprovado' ? '#d4edda' : evento.status === 'rejeitado' ? '#f8d7da' : '#fff3cd',
                  color: evento.status === 'aprovado' ? '#155724' : evento.status === 'rejeitado' ? '#721c24' : '#856404'
                }}>
                  {evento.status || 'pendente'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#5d34a4', marginTop: 0 }}>💳 Plano e Taxas</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                borderLeft: '4px solid #5d34a4'
              }}>
                <strong>📦 Plano Escolhido:</strong><br />
                {getNomePlano(evento.TaxaCliente)}
              </div>
              
              <div>
                <strong>💰 Taxa do Cliente:</strong><br />
                {evento.TaxaCliente}% sobre o valor do ingresso
              </div>
              
              <div>
                <strong>✨ Seu Bônus:</strong><br />
                {evento.TaxaCliente === 15 ? '5%' : evento.TaxaCliente === 10 ? '3%' : '0%'} sobre vendas
              </div>
              
              {evento.descricao && (
                <div>
                  <strong>📝 Descrição:</strong><br />
                  <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                    {evento.descricao}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px', 
          marginBottom: '25px' 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '10px', 
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#27ae60' }}>
              {ingressosVendidos}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '5px' }}>
              Ingressos Vendidos
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '10px', 
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e67e22' }}>
              {ingressosDisponiveis}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '5px' }}>
              Ingressos Disponíveis
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '10px', 
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2980b9' }}>
              R$ {valorTotalIngressos.toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '5px' }}>
              Total em Ingressos
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '10px', 
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
              R$ {totalReceber.toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '5px' }}>
              Total a Receber
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
              (Ingressos + Bônus R$ {bonusGolden.toFixed(2)})
            </div>
          </div>
        </div>

        {!eventoPassado && (
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            marginBottom: '25px' 
          }}>
            <button
              onClick={() => setMostrarModalIngressos(true)}
              style={{
                flex: 1,
                backgroundColor: '#f1c40f',
                color: 'black',
                padding: '15px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              ➕ Adicionar Mais Ingressos
            </button>
            
            <button
              onClick={() => setMostrarModalSessao(true)}
              style={{
                flex: 1,
                backgroundColor: '#9b59b6',
                color: 'white',
                padding: '15px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              🎬 Abrir Nova Sessão
            </button>
          </div>
        )}

        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0 }}>🎫 Detalhamento de Ingressos</h2>
          
          <div style={{ 
            padding: '30px', 
            textAlign: 'center', 
            color: '#95a5a6',
            border: '2px dashed #ddd',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '48px', margin: '0 0 15px 0' }}>🚧</p>
            <p style={{ margin: 0, fontSize: '16px' }}>
              Detalhamento por setores e tipos de ingressos em desenvolvimento
            </p>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#bdc3c7' }}>
              Em breve você poderá ver vendas por cada setor e tipo de ingresso
            </p>
          </div>
        </div>

        {evento.imagem_url && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#5d34a4', marginTop: 0 }}>🖼️ Imagem do Evento</h2>
            <img 
              src={evento.imagem_url} 
              alt={evento.nome}
              style={{ 
                width: '100%', 
                maxWidth: '600px', 
                height: 'auto',
                borderRadius: '8px',
                display: 'block',
                margin: '0 auto'
              }}
            />
          </div>
        )}

      </div>

      {/* Modais (sem alteração) */}
      {mostrarModalIngressos && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%'
          }}>
            <h2 style={{ color: '#5d34a4', marginTop: 0 }}>➕ Adicionar Mais Ingressos</h2>
            
            <div style={{ 
              padding: '30px', 
              textAlign: 'center', 
              color: '#95a5a6',
              border: '2px dashed #ddd',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '48px', margin: '0 0 15px 0' }}>🚧</p>
              <p>Funcionalidade em desenvolvimento</p>
            </div>
            
            <button
              onClick={() => setMostrarModalIngressos(false)}
              style={{
                width: '100%',
                backgroundColor: '#95a5a6',
                color: 'white',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {mostrarModalSessao && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%'
          }}>
            <h2 style={{ color: '#9b59b6', marginTop: 0 }}>🎬 Abrir Nova Sessão</h2>
            
            <div style={{ 
              padding: '30px', 
              textAlign: 'center', 
              color: '#95a5a6',
              border: '2px dashed #ddd',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '48px', margin: '0 0 15px 0' }}>🚧</p>
              <p>Funcionalidade em desenvolvimento</p>
            </div>
            
            <button
              onClick={() => setMostrarModalSessao(false)}
              style={{
                width: '100%',
                backgroundColor: '#95a5a6',
                color: 'white',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
