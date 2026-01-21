'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MeusIngressosPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [eventos, setEventos] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
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
        setEventos([]);
        setLoading(false);
        return;
      }

      const pedidosIds = pedidos.map(p => p.id);

      // Buscar ingressos para contar
      const { data: ingressosData, error: ingressosError } = await supabase
        .from('ingressos_vendidos')
        .select('pedido_id, evento_id')
        .in('pedido_id', pedidosIds);

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

      // Montar lista de eventos com informações
      const eventosCompletos = eventosData.map(evento => {
        // Buscar pedido deste evento
        const pedidoDoEvento = pedidos.find(p => p.evento_id === evento.id);
        const sessao = sessoes?.find(s => s.id === pedidoDoEvento?.sessao_id);
        
        // Contar ingressos deste evento
        const totalIngressos = ingressosData.filter(ing => ing.evento_id === evento.id).length;
        
        return {
          ...evento,
          data: sessao?.data,
          hora: sessao?.hora,
          totalIngressos
        };
      });

      setEventos(eventosCompletos);

    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      alert('Erro ao carregar eventos: ' + error.message);
    } finally {
      setLoading(false);
    }
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
        ) : (
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
                ✅ <strong>Eventos com ingressos:</strong> {eventos.length}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {eventos.map((evento) => (
                <Link 
                  key={evento.id}
                  href={`/meus-ingressos/${evento.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div 
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                    }}
                  >
                    {/* Imagem do Evento */}
                    <div style={{
                      width: '100%',
                      height: '200px',
                      backgroundColor: '#e0e0e0',
                      backgroundImage: evento.imagem ? `url(${evento.imagem})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {!evento.imagem && (
                        <div style={{ fontSize: '60px' }}>🎭</div>
                      )}
                    </div>

                    {/* Informações */}
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ 
                        color: '#5d34a4', 
                        margin: '0 0 10px 0', 
                        fontSize: '20px',
                        fontWeight: '600'
                      }}>
                        {evento.nome}
                      </h3>
                      
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                        📅 {evento.data && new Date(evento.data).toLocaleDateString('pt-BR')}
                      </div>

                      <div style={{
                        marginTop: '15px',
                        padding: '10px',
                        backgroundColor: '#f0e6ff',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#5d34a4'
                      }}>
                        {evento.totalIngressos} {evento.totalIngressos === 1 ? 'ingresso' : 'ingressos'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
