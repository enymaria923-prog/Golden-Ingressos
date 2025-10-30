// app/evento/[id]/page.js - VERSÃO COM CONTROLE DE QUANTIDADE
import { createClient } from '../../../utils/supabase/server';
import Link from 'next/link';

export default async function EventoDetalhe(props) {
  const supabase = createClient();
  
  try {
    // CORREÇÃO: Acessar params corretamente no Next.js 14
    const { id } = await props.params;
    console.log('🔍 Buscando evento com ID:', id);

    if (!id) {
      throw new Error('ID não fornecido');
    }

    // BUSCAR EVENTO NO BANCO
    const { data: evento, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('id', parseInt(id)) // Garantir que é número
      .single();

    // SE NÃO ENCONTRAR O EVENTO
    if (error || !evento) {
      console.error('❌ Evento não encontrado:', error);
      return (
        <div style={{ 
          fontFamily: 'sans-serif', 
          padding: '50px 20px', 
          textAlign: 'center',
          backgroundColor: '#f4f4f4',
          minHeight: '100vh'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '40px', 
            borderRadius: '8px',
            maxWidth: '500px',
            margin: '0 auto',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ color: '#5d34a4', marginBottom: '20px' }}>Evento Não Encontrado</h1>
            <p style={{ marginBottom: '30px', color: '#666' }}>
              O evento que você está procurando não existe ou foi removido.
            </p>
            <Link href="/" style={{
              backgroundColor: '#f1c40f',
              color: 'black',
              padding: '12px 25px',
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}>
              Voltar para a Home
            </Link>
          </div>
        </div>
      );
    }

    // BUSCAR OS INGRESSOS DESTE EVENTO
    const { data: ingressos } = await supabase
      .from('ingressos')
      .select('*')
      .eq('evento_id', parseInt(id));

    console.log('✅ Evento encontrado:', evento.nome);

    // FORMATAR DATA
    const dataFormatada = new Date(evento.data).toLocaleDateString('pt-BR');
    
    return (
      <div style={{ 
        fontFamily: 'sans-serif', 
        backgroundColor: '#f4f4f4',
        minHeight: '100vh',
        padding: '20px'
      }}>
        
        {/* CABEÇALHO */}
        <header style={{ 
          backgroundColor: '#5d34a4', 
          color: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', display: 'inline-block', marginBottom: '10px' }}>
            &larr; Voltar para a Home
          </Link>
          <h1 style={{ margin: 0, textAlign: 'center' }}>Detalhes do Evento</h1>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '30px', 
          maxWidth: '1200px', 
          margin: '0 auto' 
        }}>
          
          {/* IMAGEM DO EVENTO */}
          <div style={{ flex: '1 1 400px' }}>
            <img 
              src={evento.imagem_url} 
              alt={evento.nome}
              style={{ 
                width: '100%', 
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>

          {/* DETALHES DO EVENTO */}
          <div style={{ 
            flex: '1 1 400px', 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ color: '#5d34a4', marginTop: 0 }}>{evento.nome}</h1>
            
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ color: '#333', marginBottom: '10px' }}>Descrição do Evento</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                {evento.descricao || 'Este evento não possui descrição.'}
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px',
              marginBottom: '25px'
            }}>
              <div>
                <strong>Categoria:</strong>
                <p style={{ margin: '5px 0', color: '#666' }}>{evento.categoria}</p>
              </div>
              <div>
                <strong>Data:</strong>
                <p style={{ margin: '5px 0', color: '#666' }}>{dataFormatada}</p>
              </div>
              <div>
                <strong>Hora:</strong>
                <p style={{ margin: '5px 0', color: '#666' }}>{evento.hora}</p>
              </div>
              <div>
                <strong>Local:</strong>
                <p style={{ margin: '5px 0', color: '#666' }}>{evento.local}</p>
              </div>
            </div>

            {/* TIPOS DE INGRESSOS COM QUANTIDADE */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#333', marginBottom: '15px' }}>Tipos de Ingresso Disponíveis</h3>
              {ingressos && ingressos.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {ingressos.map((ingresso, index) => {
                    const disponiveis = (ingresso.quantidade || 0) - (ingresso.vendidos || 0);
                    const esgotado = disponiveis <= 0;
                    
                    return (
                      <div key={index} style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '15px',
                        alignItems: 'center',
                        padding: '15px',
                        backgroundColor: esgotado ? '#fff3cd' : '#f8f9fa',
                        borderRadius: '5px',
                        border: `1px solid ${esgotado ? '#ffeaa7' : '#e9ecef'}`
                      }}>
                        <div>
                          <strong style={{ display: 'block', marginBottom: '5px' }}>{ingresso.tipo}</strong>
                          <span style={{ 
                            backgroundColor: esgotado ? '#dc3545' : '#f1c40f', 
                            color: 'white', 
                            padding: '5px 10px', 
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '0.9em'
                          }}>
                            R$ {ingresso.valor}
                          </span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.9em', color: '#666' }}>Disponíveis</div>
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: esgotado ? '#dc3545' : '#28a745',
                            fontSize: esgotado ? '0.9em' : '1em'
                          }}>
                            {esgotado ? 'ESGOTADO' : disponiveis}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.9em', color: '#666' }}>Vendidos</div>
                          <div style={{ fontWeight: 'bold', color: '#6c757d' }}>
                            {ingresso.vendidos || 0}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                  Nenhum ingresso disponível no momento.
                </p>
              )}
            </div>

            {/* BOTÃO DE COMPRA (SIMULAÇÃO) */}
            <button 
              style={{
                backgroundColor: '#f1c40f',
                color: 'black',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px',
                width: '100%'
              }}
              onClick={() => alert('Funcionalidade de compra em desenvolvimento!')}
            >
              Comprar Ingresso
            </button>

            <p style={{ 
              textAlign: 'center', 
              marginTop: '10px', 
              color: '#666', 
              fontSize: '0.9em',
              fontStyle: 'italic'
            }}>
              * Funcionalidade de compra em desenvolvimento
            </p>

            {/* RESUMO DO EVENTO */}
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#e9ecef',
              borderRadius: '5px',
              textAlign: 'center'
            }}>
              <strong>Resumo do Evento:</strong>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>Total de Ingressos</div>
                  <div style={{ fontWeight: 'bold', color: '#5d34a4' }}>
                    {evento.total_ingressos || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>Ingressos Vendidos</div>
                  <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                    {evento.ingressos_vendidos || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>Disponíveis</div>
                  <div style={{ fontWeight: 'bold', color: '#f1c40f' }}>
                    {(evento.total_ingressos || 0) - (evento.ingressos_vendidos || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('💥 Erro crítico:', error);
    return (
      <div style={{ 
        fontFamily: 'sans-serif', 
        padding: '50px 20px', 
        textAlign: 'center',
        backgroundColor: '#f4f4f4',
        minHeight: '100vh'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '8px',
          maxWidth: '500px',
          margin: '0 auto',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#5d34a4', marginBottom: '20px' }}>Erro ao Carregar</h1>
          <p style={{ marginBottom: '30px', color: '#666' }}>
            Ocorreu um erro ao carregar os detalhes do evento.
          </p>
          <Link href="/" style={{
            backgroundColor: '#f1c40f',
            color: 'black',
            padding: '12px 25px',
            textDecoration: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            display: 'inline-block'
          }}>
            Voltar para a Home
          </Link>
        </div>
      </div>
    );
  }
}
