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

      const { data: eventos } = await supabase
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
        const evento = eventos?.find(e => e.id === pedido?.evento_id);
        const sessao = sessoes?.find(s => s.id === pedido?.sessao_id);

        return {
          ...ingresso,
          evento,
          sessao
        };
      });

      setIngressos(ingressosCompletos);

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

  // Agrupar ingressos por evento
  const agruparPorEvento = () => {
    const grupos = {};
    
    ingressos.forEach(ingresso => {
      const eventoId = ingresso.evento?.id;
      if (!grupos[eventoId]) {
        grupos[eventoId] = {
          evento: ingresso.evento,
          sessao: ingresso.sessao,
          ingressos: []
        };
      }
      grupos[eventoId].ingressos.push(ingresso);
    });
    
    return Object.values(grupos);
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando seus ingressos...</h2>
      </div>
    );
  }

  const gruposDeEventos = agruparPorEvento();

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
       
        {ingressos.length === 0 ? (
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
        ) : (
          // Lista de ingressos agrupados por evento
          <div>
            <div style={{
              backgroundColor: '#d4edda',
              padding: '15px 20px',
              borderRadius: '8px',
              marginBottom: '30px',
              border: '1px solid #c3e6cb'
            }}>
              <p style={{ margin: 0, color: '#155724', fontSize: '14px' }}>
                ✅ <strong>Total de ingressos:</strong> {ingressos.length} ingresso(s)
              </p>
            </div>

            {gruposDeEventos.map((grupo, grupoIndex) => (
              <div key={grupoIndex} style={{ marginBottom: '50px' }}>
                
                {/* Cabeçalho do Evento */}
                <div style={{
                  backgroundColor: '#5d34a4',
                  color: 'white',
                  padding: '20px 30px',
                  borderRadius: '12px 12px 0 0',
                  marginBottom: '0'
                }}>
                  <h2 style={{ 
                    margin: '0', 
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    🎭 {grupo.evento?.nome || 'Evento'}
                  </h2>
                </div>

                {/* Container dos ingressos */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '0 0 12px 12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}>
                  {grupo.ingressos.map((ingresso, index) => (
                    <div 
                      key={ingresso.id} 
                      style={{
                        padding: '30px',
                        borderBottom: index < grupo.ingressos.length - 1 ? '2px dashed #e0e0e0' : 'none',
                        borderLeft: ingresso.validado ? '5px solid #dc3545' : '5px solid #27ae60'
                      }}
                    >
                      
                      {/* Título do Evento */}
                      <h3 style={{
                        color: '#5d34a4',
                        margin: '0 0 15px 0',
                        fontSize: '22px',
                        fontWeight: 'bold'
                      }}>
                        {ingresso.evento?.nome}
                      </h3>

                      {/* Data e Hora */}
                      <div style={{ 
                        fontSize: '16px', 
                        color: '#666',
                        marginBottom: '10px',
                        fontWeight: '500'
                      }}>
                        📅 {ingresso.sessao?.data && new Date(ingresso.sessao.data).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} • 🕐 {ingresso.sessao?.hora}
                      </div>

                      {/* Local */}
                      <div style={{ 
                        fontSize: '16px', 
                        color: '#666',
                        marginBottom: '25px',
                        fontWeight: '500'
                      }}>
                        📍 {ingresso.evento?.local}
                      </div>

                      {/* Foto do Evento e QR Code lado a lado */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '30px',
                        marginBottom: '25px',
                        alignItems: 'center'
                      }}>
                        
                        {/* Foto do Evento */}
                        <div style={{
                          width: '100%',
                          height: '300px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          backgroundColor: '#e0e0e0',
                          border: '3px solid #5d34a4'
                        }}>
                          {ingresso.evento?.imagem ? (
                            <img 
                              src={ingresso.evento.imagem} 
                              alt={ingresso.evento.nome}
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
                              fontSize: '80px'
                            }}>
                              🎭
                            </div>
                          )}
                        </div>

                        {/* QR Code */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
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
                          
                          {/* Status */}
                          <div style={{ marginTop: '15px' }}>
                            {ingresso.validado ? (
                              <div style={{
                                padding: '10px 25px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                fontSize: '14px'
                              }}>
                                ❌ JÁ UTILIZADO
                              </div>
                            ) : (
                              <div style={{
                                padding: '10px 25px',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                fontSize: '14px'
                              }}>
                                ✅ VÁLIDO
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Informações do Ingresso */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: ingresso.assento ? 'repeat(2, 1fr)' : '1fr',
                        gap: '20px',
                        padding: '20px',
                        backgroundColor: '#f0e6ff',
                        borderRadius: '8px',
                        marginBottom: ingresso.validado ? '20px' : '0'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                            TIPO DE INGRESSO
                          </div>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#5d34a4' }}>
                            {ingresso.tipo_ingresso}
                          </div>
                        </div>

                        {ingresso.assento && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>
                              ASSENTO
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#5d34a4' }}>
                              {ingresso.assento}
                            </div>
                          </div>
                        )}
                      </div>

                      {ingresso.validado && (
                        <div style={{
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
                    </div>
                  ))}
                  
                  {/* Aviso importante no final do grupo */}
                  <div style={{
                    padding: '20px 30px',
                    backgroundColor: '#fff3cd',
                    borderTop: '2px dashed #ffc107',
                    fontSize: '13px',
                    color: '#856404',
                    textAlign: 'center'
                  }}>
                    💡 <strong>Importante:</strong> Apresente o QR Code na entrada do evento.
                    Cada ingresso só pode ser validado uma vez.
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
