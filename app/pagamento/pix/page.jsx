'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
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
        const evento = eventos?.find(e => e.id === pedido.evento_id);
        const sessao = sessoes?.find(s => s.id === pedido.sessao_id);

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
          // Lista de ingressos
          <div>
            <div style={{ 
              backgroundColor: '#d4edda', 
              padding: '15px 20px', 
              borderRadius: '8px',
              marginBottom: '30px',
              border: '1px solid #c3e6cb'
            }}>
              <p style={{ margin: 0, color: '#155724', fontSize: '14px' }}>
                ✅ <strong>Ingressos Confirmados:</strong> {ingressos.length} ingresso(s)
              </p>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              {ingressos.map((ingresso, index) => (
                <div key={ingresso.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: '300px 1fr',
                  border: ingresso.status === 'USADO' ? '3px solid #dc3545' : ingresso.status === 'CANCELADO' ? '3px solid #6c757d' : '3px solid #27ae60'
                }}>
                  
                  {/* QR Code */}
                  <div style={{
                    padding: '30px',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: '1px solid #e0e0e0'
                  }}>
                    <div style={{
                      width: '250px',
                      height: '250px',
                      backgroundColor: 'white',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '2px solid #5d34a4'
                    }}>
                      <img 
                        src={gerarQRCodeURL(ingresso.qr_code)} 
                        alt="QR Code do Ingresso"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                    
                    {ingresso.status === 'USADO' ? (
                      <div style={{
                        marginTop: '15px',
                        padding: '10px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        ❌ JÁ UTILIZADO
                      </div>
                    ) : ingresso.status === 'CANCELADO' ? (
                      <div style={{
                        marginTop: '15px',
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        🚫 CANCELADO
                      </div>
                    ) : (
                      <div style={{
                        marginTop: '15px',
                        padding: '10px 20px',
                        backgroundColor: '#27ae60',
                        color: 'white',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        ✅ VÁLIDO
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div style={{ padding: '30px' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <h2 style={{ 
                        color: '#5d34a4', 
                        margin: '0 0 10px 0', 
                        fontSize: '24px' 
                      }}>
                        {ingresso.evento?.nome}
                      </h2>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Ingresso #{index + 1}
                      </div>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                          Tipo de Ingresso
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                          {ingresso.tipo_ingresso}
                        </div>
                      </div>

                      {ingresso.assento && (
                        <div>
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                            Assento
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                            {ingresso.assento}
                          </div>
                        </div>
                      )}

                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                          📅 Data
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                          {ingresso.sessao?.data && new Date(ingresso.sessao.data).toLocaleDateString('pt-BR')}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                          🕐 Horário
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                          {ingresso.sessao?.hora}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                          📍 Local
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                          {ingresso.evento?.local}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                          💰 Valor
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#27ae60' }}>
                          R$ {parseFloat(ingresso.valor).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {ingresso.status === 'USADO' && (
                      <div style={{
                        padding: '15px',
                        backgroundColor: '#f8d7da',
                        borderRadius: '8px',
                        border: '1px solid #f5c6cb',
                        marginTop: '20px'
                      }}>
                        <div style={{ fontSize: '14px', color: '#721c24' }}>
                          <strong>⚠️ Ingresso utilizado</strong><br />
                          Usado em: {new Date(ingresso.data_compra).toLocaleString('pt-BR')}
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
                      color: '#856404'
                    }}>
                      💡 <strong>Importante:</strong> Apresente este QR Code na entrada do evento. 
                      Cada ingresso só pode ser validado uma vez.
                    </div>
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
