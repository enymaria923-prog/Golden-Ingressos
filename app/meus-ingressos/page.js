// app/meus-ingressos/page.js
import { createClient } from '../../utils/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function MeusIngressosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Buscar ingressos confirmados (pagamento aprovado)
  const { data: ingressosConfirmados, error: errorConfirmados } = await supabase
    .from('ingressos')
    .select(`
      *,
      eventos (*)
    `)
    .eq('user_id', user.id)
    .eq('status', 'confirmado')
    .order('created_at', { ascending: false });

  // Buscar ingressos pendentes (compra iniciada mas não finalizada)
  const { data: ingressosPendentes, error: errorPendentes } = await supabase
    .from('ingressos')
    .select(`
      *,
      eventos (*)
    `)
    .eq('user_id', user.id)
    .in('status', ['pendente', 'aguardando_pagamento', 'processando'])
    .order('created_at', { ascending: false });

  return (
    <div style={{ 
      fontFamily: 'sans-serif', 
      backgroundColor: '#f4f4f4', 
      minHeight: '100vh', 
      padding: '20px' 
    }}>
      <header style={{ 
        backgroundColor: '#5d34a4', 
        color: 'white', 
        padding: '20px', 
        marginBottom: '30px', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link href="/">
          <button style={{
            backgroundColor: 'white',
            color: '#5d34a4',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            ← Voltar
          </button>
        </Link>
        <h1 style={{ margin: 0 }}>🎫 Meus Ingressos</h1>
        <div style={{ width: '100px' }}></div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Seção de Ingressos Confirmados */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '8px', 
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            color: '#27ae60', 
            margin: '0 0 20px 0',
            fontSize: '22px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ✅ Ingressos Confirmados
            {ingressosConfirmados && ingressosConfirmados.length > 0 && (
              <span style={{ 
                backgroundColor: '#27ae60', 
                color: 'white', 
                padding: '5px 12px', 
                borderRadius: '20px', 
                fontSize: '14px' 
              }}>
                {ingressosConfirmados.length}
              </span>
            )}
          </h2>

          {errorConfirmados ? (
            <div style={{ 
              backgroundColor: '#fee', 
              padding: '15px', 
              borderRadius: '5px', 
              color: '#c00' 
            }}>
              Erro ao carregar ingressos confirmados.
            </div>
          ) : ingressosConfirmados && ingressosConfirmados.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {ingressosConfirmados.map((ingresso) => (
                <div key={ingresso.id} style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  border: '2px solid #27ae60',
                  position: 'relative'
                }}>
                  <div style={{ 
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    ✓ CONFIRMADO
                  </div>

                  <h3 style={{ margin: '0 0 15px 0', color: '#5d34a4', paddingRight: '120px' }}>
                    {ingresso.eventos?.nome || 'Evento não encontrado'}
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                    <p style={{ margin: 0 }}>
                      <strong>📅 Data do Evento:</strong><br/>
                      {ingresso.eventos?.data ? new Date(ingresso.eventos.data).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Data não disponível'}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>🔢 Código do Ingresso:</strong><br/>
                      <code style={{ 
                        backgroundColor: '#e0e0e0', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}>
                        {ingresso.codigo_ingresso || 'N/A'}
                      </code>
                    </p>
                  </div>

                  {ingresso.eventos && (
                    <Link 
                      href={`/evento/${ingresso.eventos.id}`}
                      style={{ 
                        display: 'inline-block',
                        backgroundColor: '#5d34a4',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >
                      Ver Detalhes do Evento →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '30px',
              color: '#666'
            }}>
              <p>Você ainda não possui ingressos confirmados.</p>
            </div>
          )}
        </div>

        {/* Seção de Compras Pendentes */}
        {ingressosPendentes && ingressosPendentes.length > 0 && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '25px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              color: '#f39c12', 
              margin: '0 0 20px 0',
              fontSize: '22px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              ⏳ Compras Pendentes
              <span style={{ 
                backgroundColor: '#f39c12', 
                color: 'white', 
                padding: '5px 12px', 
                borderRadius: '20px', 
                fontSize: '14px' 
              }}>
                {ingressosPendentes.length}
              </span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {ingressosPendentes.map((ingresso) => (
                <div key={ingresso.id} style={{ 
                  backgroundColor: '#fff9e6', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  border: '2px solid #f39c12',
                  position: 'relative'
                }}>
                  <div style={{ 
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    backgroundColor: '#f39c12',
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    ⏳ PENDENTE
                  </div>

                  <h3 style={{ margin: '0 0 15px 0', color: '#5d34a4', paddingRight: '120px' }}>
                    {ingresso.eventos?.nome || 'Evento não encontrado'}
                  </h3>
                  
                  <p style={{ margin: '0 0 15px 0', color: '#856404' }}>
                    <strong>⚠️ Atenção:</strong> Esta compra não foi finalizada. Complete o pagamento para garantir seu ingresso.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                    <p style={{ margin: 0 }}>
                      <strong>📅 Data do Evento:</strong><br/>
                      {ingresso.eventos?.data ? new Date(ingresso.eventos.data).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Status:</strong><br/>
                      {ingresso.status}
                    </p>
                  </div>

                  {ingresso.eventos && (
                    <Link 
                      href={`/evento/${ingresso.eventos.id}`}
                      style={{ 
                        display: 'inline-block',
                        backgroundColor: '#f39c12',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >
                      Finalizar Compra →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem quando não há nenhum ingresso */}
        {(!ingressosConfirmados || ingressosConfirmados.length === 0) && 
         (!ingressosPendentes || ingressosPendentes.length === 0) && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '50px 30px', 
            borderRadius: '8px', 
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎫</div>
            <h3 style={{ color: '#5d34a4', margin: '0 0 15px 0' }}>
              Nenhum ingresso encontrado
            </h3>
            <p style={{ color: '#666', marginBottom: '25px', fontSize: '16px' }}>
              Você ainda não comprou nenhum ingresso. Explore os eventos disponíveis!
            </p>
            <Link 
              href="/" 
              style={{ 
                display: 'inline-block',
                backgroundColor: '#f1c40f', 
                color: 'black', 
                padding: '15px 35px', 
                borderRadius: '5px', 
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              🎉 Explorar Eventos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
