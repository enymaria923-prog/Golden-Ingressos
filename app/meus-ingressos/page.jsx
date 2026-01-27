'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MeusIngressosPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [ingressos, setIngressos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    carregarIngressos();
  }, []);

  const carregarIngressos = async () => {
    try {
      setLoading(true);

      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
     
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Buscar pedidos pagos do usuário
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select('id, evento_id, sessao_id, status')
        .eq('user_id', user.id)
        .eq('status', 'PAGO');

      if (pedidosError) throw pedidosError;

      if (!pedidos || pedidos.length === 0) {
        setIngressos([]);
        setEventos([]);
        setLoading(false);
        return;
      }

      const pedidosIds = pedidos.map(p => p.id);

      // Buscar ingressos
      const { data: ingressosData, error: ingressosError } = await supabase
        .from('ingressos_vendidos')
        .select('*')
        .in('pedido_id', pedidosIds)
        .order('created_at', { ascending: false });

      if (ingressosError) throw ingressosError;

      // Buscar informações dos eventos
      const eventosIds = [...new Set(pedidos.map(p => p.evento_id))];
      const sessoesIds = [...new Set(pedidos.map(p => p.sessao_id))];

      const { data: eventosData } = await supabase
        .from('eventos')
        .select('id, nome, local, imagem')
        .in('id', eventosIds);

      const { data: sessoes } = await supabase
        .from('sessoes')
        .select('id, data, hora')
        .in('id', sessoesIds);

      // Combinar dados
      const ingressosCompletos = ingressosData.map(ingresso => {
        const pedido = pedidos.find(p => p.id === ingresso.pedido_id);
        const evento = eventosData?.find(e => e.id === pedido.evento_id);
        const sessao = sessoes?.find(s => s.id === pedido.sessao_id);

        return {
          ...ingresso,
          evento,
          sessao
        };
      });

      // Agrupar ingressos por evento
      const eventosComIngressos = eventosData.map(evento => {
        const ingressosDoEvento = ingressosCompletos.filter(i => i.evento?.id === evento.id);
        const sessaoDoEvento = ingressosDoEvento[0]?.sessao;
        
        return {
          ...evento,
          sessao: sessaoDoEvento,
          totalIngressos: ingressosDoEvento.length
        };
      });

      setIngressos(ingressosCompletos);
      setEventos(eventosComIngressos);

    } catch (error) {
      console.error('Erro ao carregar ingressos:', error);
      alert('Erro ao carregar ingressos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const gerarQRCodeURL = (texto) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(texto)}`;
  };

  const ingressosDoEventoSelecionado = eventoSelecionado 
    ? ingressos.filter(i => i.evento?.id === eventoSelecionado.id)
    : [];

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando seus ingressos...</h2>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', paddingBottom: '40px' }}>
     
      {/* Header */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px 30px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>
          ← Voltar
        </Link>
        <h1 style={{ margin: '10px 0 0 0', fontSize: '28px' }}>🎫 Meus Ingressos</h1>
      </header>

      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
       
        {eventos.length === 0 ? (
          // Nenhum ingresso
          <div style={{
            backgroundColor: 'white',
            padding: '60px 40px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎫</div>
            <h2 style={{ color: '#333', marginBottom: '10px' }}>Nenhum ingresso encontrado</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              Você ainda não comprou nenhum ingresso. Explore os eventos disponíveis!
            </p>
            <Link href="/">
              <button style={{
                padding: '15px 30px',
                backgroundColor: '#5d34a4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                🔍 Explorar Eventos
              </button>
            </Link>
          </div>
        ) : eventoSelecionado === null ? (
          // Lista de eventos
          <div>
            <div style={{
              backgroundColor: '#d4edda',
              padding: '15px 20px',
              borderRadius: '8px',
              marginBottom: '30px',
              border: '1px solid #c3e6cb'
            }}>
              <p style={{ margin: 0, color: '#155724', fontSize: '14px' }}>
                ✅ <strong>Eventos com Ingressos:</strong> {eventos.length} evento(s)
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {eventos.map((evento) => (
                <div 
                  key={evento.id} 
                  onClick={() => setEventoSelecionado(evento)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Imagem do Evento */}
                  <div style={{ 
                    width: '100%', 
                    height: '200px', 
                    overflow: 'hidden',
                    backgroundColor: '#e0e0e0'
                  }}>
                    {evento.imagem ? (
                      <img 
                        src={evento.imagem} 
                        alt={evento.nome}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '60px'
                      }}>
                        🎭
                      </div>
                    )}
                  </div>

                  {/* Informações do Evento */}
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ 
                      margin: '0 0 10px 0', 
                      fontSize: '20px', 
                      color: '#5d34a4',
                      fontWeight: 'bold'
                    }}>
                      {evento.nome}
                    </h3>
                    
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#666',
                      marginBottom: '15px'
                    }}>
                      📅 {evento.sessao?.data && new Date(evento.sessao.data).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 15px',
                      backgroundColor: '#f0e6ff',
                      borderRadius: '8px'
                    }}>
                      <span style={{ fontSize: '14px', color: '#5d34a4', fontWeight: '600' }}>
                        🎫 {evento.totalIngressos} ingresso{evento.totalIngressos > 1 ? 's' : ''}
                      </span>
                      <span style={{ fontSize: '14px', color: '#5d34a4', fontWeight: 'bold' }}>
                        Ver →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Exibir ingressos do evento selecionado
          <div>
            <button
              onClick={() => setEventoSelecionado(null)}
              style={{
                marginBottom: '20px',
                padding: '10px 20px',
                backgroundColor: 'white',
                color: '#5d34a4',
                border: '2px solid #5d34a4',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ← Voltar para Eventos
            </button>

            <div style={{ display: 'grid', gap: '30px' }}>
              {ingressosDoEventoSelecionado.map((ingresso, index) => (
                <div key={ingresso.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  padding: '30px',
                  border: ingresso.validado ? '3px solid #dc3545' : '3px solid #27ae60'
                }}>
                  
                  {/* Título do Evento */}
                  <h2 style={{
                    color: '#5d34a4',
                    margin: '0 0 30px 0',
                    fontSize: '24px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    {ingresso.evento?.nome}
                  </h2>

                  {/* QR Code */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '30px'
                  }}>
                    <div style={{
                      width: '300px',
                      height: '300px',
                      backgroundColor: 'white',
                      padding: '15px',
                      borderRadius: '12px',
                      border: '3px solid #5d34a4',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                      <img
                        src={gerarQRCodeURL(ingresso.qr_code)}
                        alt="QR Code do Ingresso"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>

                  {/* Status do Ingresso */}
                  <div style={{ 
                    textAlign: 'center',
                    marginBottom: '30px'
                  }}>
                    {ingresso.validado ? (
                      <div style={{
                        display: 'inline-block',
                        padding: '12px 30px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        ❌ JÁ UTILIZADO
                      </div>
                    ) : (
                      <div style={{
                        display: 'inline-block',
                        padding: '12px 30px',
                        backgroundColor: '#27ae60',
                        color: 'white',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        ✅ VÁLIDO
                      </div>
                    )}
                  </div>

                  {/* Informações do Ingresso */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: ingresso.assento ? 'repeat(2, 1fr)' : '1fr',
                    gap: '20px',
                    marginBottom: '30px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px', fontWeight: '600' }}>
                        TIPO DE INGRESSO
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                        {ingresso.tipo_ingresso}
                      </div>
                    </div>

                    {ingresso.assento && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px', fontWeight: '600' }}>
                          ASSENTO
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                          {ingresso.assento}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Data, Hora e Local */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '15px',
                    padding: '20px',
                    backgroundColor: '#f0e6ff',
                    borderRadius: '8px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                        📅 DATA
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#5d34a4' }}>
                        {ingresso.sessao?.data && new Date(ingresso.sessao.data).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                        🕐 HORÁRIO
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#5d34a4' }}>
                        {ingresso.sessao?.hora}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                        📍 LOCAL
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#5d34a4' }}>
                        {ingresso.evento?.local}
                      </div>
                    </div>
                  </div>

                  {ingresso.validado && (
                    <div style={{
                      marginTop: '20px',
                      padding: '15px',
                      backgroundColor: '#f8d7da',
                      borderRadius: '8px',
                      border: '1px solid #f5c6cb',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '14px', color: '#721c24' }}>
                        <strong>⚠️ Ingresso utilizado</strong><br />
                        Validado em: {new Date(ingresso.validado_em).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  )}

                  <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '8px',
                    border: '1px solid #ffc107',
                    fontSize: '13px',
                    color: '#856404',
                    textAlign: 'center'
                  }}>
                    💡 <strong>Importante:</strong> Apresente este QR Code na entrada do evento.
                    Cada ingresso só pode ser validado uma vez.
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
