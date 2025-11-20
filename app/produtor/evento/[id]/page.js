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
  const [setoresDetalhados, setSetoresDetalhados] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModalSessao, setMostrarModalSessao] = useState(false);
  const [mostrarModalIngressos, setMostrarModalIngressos] = useState(false);

  useEffect(() => {
    carregarEvento();
  }, [eventoId]);

  const carregarEvento = async () => {
    try {
      // 1. Carrega dados do evento
      const { data: eventoData, error: eventoError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      if (eventoError) throw eventoError;
      
      console.log('📊 Dados do evento:', eventoData);
      setEvento(eventoData);

      // 2. Carrega TODOS os ingressos do evento
      const { data: ingressosData, error: ingressosError } = await supabase
        .from('ingressos')
        .select('*')
        .eq('evento_id', eventoId);

      if (ingressosError) throw ingressosError;
      console.log('🎫 Ingressos carregados:', ingressosData);

      // 3. Carrega lotes (se houver)
      const { data: lotesData } = await supabase
        .from('lotes')
        .select('*')
        .eq('evento_id', eventoId);

      console.log('📦 Lotes carregados:', lotesData);

      // 4. Organiza dados por setores
      const setoresMap = new Map();

      ingressosData?.forEach(ingresso => {
        const setorNome = ingresso.setor;
        
        if (!setoresMap.has(setorNome)) {
          setoresMap.set(setorNome, {
            nome: setorNome,
            lotes: new Map(),
            tiposSemLote: []
          });
        }

        const setor = setoresMap.get(setorNome);

        if (ingresso.lote_id) {
          // Ingresso pertence a um lote
          if (!setor.lotes.has(ingresso.lote_id)) {
            const loteInfo = lotesData?.find(l => l.id === ingresso.lote_id);
            setor.lotes.set(ingresso.lote_id, {
              id: ingresso.lote_id,
              nome: loteInfo?.nome || 'Lote sem nome',
              tipos: []
            });
          }
          
          setor.lotes.get(ingresso.lote_id).tipos.push({
            id: ingresso.id,
            nome: ingresso.tipo,
            preco: parseFloat(ingresso.valor),
            quantidade: ingresso.quantidade,
            vendidos: ingresso.vendidos || 0
          });
        } else {
          // Ingresso sem lote
          setor.tiposSemLote.push({
            id: ingresso.id,
            nome: ingresso.tipo,
            preco: parseFloat(ingresso.valor),
            quantidade: ingresso.quantidade,
            vendidos: ingresso.vendidos || 0
          });
        }
      });

      // Converte para array
      const setoresArray = Array.from(setoresMap.values()).map(setor => ({
        nome: setor.nome,
        lotes: Array.from(setor.lotes.values()),
        tiposSemLote: setor.tiposSemLote
      }));

      console.log('🏟️ Setores organizados:', setoresArray);
      setSetoresDetalhados(setoresArray);

      // 5. Carrega produtos
      const { data: produtosData } = await supabase
        .from('produtos')
        .select('*')
        .eq('evento_id', eventoId);

      console.log('🛍️ Produtos carregados:', produtosData);
      setProdutos(produtosData || []);

    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      alert('Erro ao carregar evento');
      router.push('/produtor');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotaisIngressos = () => {
    let totalDisponibilizado = 0;
    let totalVendido = 0;

    setoresDetalhados.forEach(setor => {
      setor.lotes.forEach(lote => {
        lote.tipos.forEach(tipo => {
          totalDisponibilizado += tipo.quantidade;
          totalVendido += tipo.vendidos;
        });
      });

      setor.tiposSemLote.forEach(tipo => {
        totalDisponibilizado += tipo.quantidade;
        totalVendido += tipo.vendidos;
      });
    });

    return {
      total: totalDisponibilizado,
      vendidos: totalVendido,
      disponiveis: totalDisponibilizado - totalVendido
    };
  };

  const calcularTotaisProdutos = () => {
    let totalDisponibilizado = 0;
    let totalVendido = 0;

    produtos.forEach(produto => {
      const qtdTotal = produto.quantidade_disponivel + (produto.quantidade_vendida || 0);
      totalDisponibilizado += qtdTotal;
      totalVendido += produto.quantidade_vendida || 0;
    });

    return {
      total: totalDisponibilizado,
      vendidos: totalVendido,
      disponiveis: totalDisponibilizado - totalVendido
    };
  };

  const calcularValorTotalVendas = () => {
    let valorIngressos = 0;
    let valorProdutos = 0;

    setoresDetalhados.forEach(setor => {
      setor.lotes.forEach(lote => {
        lote.tipos.forEach(tipo => {
          valorIngressos += tipo.vendidos * tipo.preco;
        });
      });

      setor.tiposSemLote.forEach(tipo => {
        valorIngressos += tipo.vendidos * tipo.preco;
      });
    });

    produtos.forEach(produto => {
      valorProdutos += (produto.quantidade_vendida || 0) * produto.preco;
    });

    return { valorIngressos, valorProdutos, total: valorIngressos + valorProdutos };
  };

  const calcularBonusGolden = () => {
    if (!evento) return 0;
    const taxaCliente = evento.TaxaCliente || 0;
    const { valorIngressos } = calcularValorTotalVendas();
    
    let percentualBonus = 0;
    if (taxaCliente === 18.5) percentualBonus = 6.5;
    else if (taxaCliente === 15) percentualBonus = 5;
    else if (taxaCliente === 10) percentualBonus = 3;
    else if (taxaCliente === 8) percentualBonus = 0;
    else if (taxaCliente === 0) percentualBonus = -8; // Absorção
    
    return valorIngressos * (percentualBonus / 100);
  };

  const getNomePlano = (taxa) => {
    if (taxa === 18.5) return 'Plano Premium (18.5% taxa, +6.5% bônus)';
    if (taxa === 15) return 'Plano Padrão (15% taxa, +5% bônus)';
    if (taxa === 10) return 'Plano Econômico (10% taxa, +3% bônus)';
    if (taxa === 8) return 'Plano Competitivo (8% taxa, sem bônus)';
    if (taxa === 0) return 'Absorção Total (0% cliente, -8% produtor)';
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

  const totaisIngressos = calcularTotaisIngressos();
  const totaisProdutos = calcularTotaisProdutos();
  const valores = calcularValorTotalVendas();
  const bonusGolden = calcularBonusGolden();
  const totalReceber = valores.total + bonusGolden;
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
                <strong>✨ Seu Bônus/Desconto:</strong><br />
                {evento.TaxaCliente === 18.5 ? '+6.5%' : 
                 evento.TaxaCliente === 15 ? '+5%' : 
                 evento.TaxaCliente === 10 ? '+3%' : 
                 evento.TaxaCliente === 0 ? '-8%' : '0%'} sobre vendas
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
              {totaisIngressos.vendidos}
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
              {totaisIngressos.disponiveis}
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
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3498db' }}>
              {totaisIngressos.total}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '5px' }}>
              Total Disponibilizado
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
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              R$ {totalReceber.toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '5px' }}>
              Total a Receber
            </div>
            <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '5px' }}>
              Vendas: R$ {valores.total.toFixed(2)}
              {bonusGolden !== 0 && ` ${bonusGolden > 0 ? '+' : ''}Bônus: R$ ${bonusGolden.toFixed(2)}`}
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

        {/* DETALHAMENTO DE INGRESSOS */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0, marginBottom: '20px' }}>🎫 Detalhamento de Ingressos</h2>
          
          {setoresDetalhados.length === 0 ? (
            <div style={{ 
              padding: '30px', 
              textAlign: 'center', 
              color: '#95a5a6',
              border: '2px dashed #ddd',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '48px', margin: '0 0 15px 0' }}>🎫</p>
              <p style={{ margin: 0, fontSize: '16px' }}>Nenhum ingresso cadastrado ainda</p>
            </div>
          ) : (
            setoresDetalhados.map((setor, setorIndex) => (
              <div key={setorIndex} style={{ 
                marginBottom: '25px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                padding: '20px',
                backgroundColor: '#fafafa'
              }}>
                <h3 style={{ 
                  color: '#5d34a4', 
                  margin: '0 0 15px 0',
                  fontSize: '20px',
                  borderBottom: '2px solid #5d34a4',
                  paddingBottom: '10px'
                }}>
                  🏟️ Setor: {setor.nome}
                </h3>

                {/* Lotes dentro do setor */}
                {setor.lotes.map((lote, loteIndex) => (
                  <div key={loteIndex} style={{ 
                    marginBottom: '20px',
                    backgroundColor: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #d0d0d0'
                  }}>
                    <h4 style={{ 
                      color: '#2980b9', 
                      margin: '0 0 12px 0',
                      fontSize: '16px'
                    }}>
                      📦 {lote.nome}
                    </h4>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                      gap: '12px' 
                    }}>
                      {lote.tipos.map((tipo, tipoIndex) => (
                        <div>📈 Total: <strong style={{ color: '#3498db' }}>{totalProduto}</strong></div>
                      {produto.tamanho && (
                        <div>📏 Tamanho: <strong>{produto.tamanho}</strong></div>
                      )}
                      {produto.tipo_produto && (
                        <div>🏷️ Tipo: <strong>{produto.tipo_produto}</strong></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

      {/* Modal - Adicionar Ingressos */}
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

      {/* Modal - Nova Sessão */}
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
} key={tipoIndex} style={{ 
                          backgroundColor: '#f8f9fa',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid #e0e0e0'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                            {tipo.nome}
                          </div>
                          <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                            <div>💰 Preço: <strong>R$ {tipo.preco.toFixed(2)}</strong></div>
                            <div>✅ Vendidos: <strong style={{ color: '#27ae60' }}>{tipo.vendidos}</strong></div>
                            <div>📊 Disponíveis: <strong style={{ color: '#e67e22' }}>{tipo.quantidade - tipo.vendidos}</strong></div>
                            <div>📈 Total: <strong style={{ color: '#3498db' }}>{tipo.quantidade}</strong></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Tipos sem lote */}
                {setor.tiposSemLote.length > 0 && (
                  <div style={{ 
                    backgroundColor: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #d0d0d0'
                  }}>
                    <h4 style={{ 
                      color: '#16a085', 
                      margin: '0 0 12px 0',
                      fontSize: '16px'
                    }}>
                      🎟️ Ingressos do Setor
                    </h4>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                      gap: '12px' 
                    }}>
                      {setor.tiposSemLote.map((tipo, tipoIndex) => (
                        <div key={tipoIndex} style={{ 
                          backgroundColor: '#f8f9fa',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid #e0e0e0'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                            {tipo.nome}
                          </div>
                          <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                            <div>💰 Preço: <strong>R$ {tipo.preco.toFixed(2)}</strong></div>
                            <div>✅ Vendidos: <strong style={{ color: '#27ae60' }}>{tipo.vendidos}</strong></div>
                            <div>📊 Disponíveis: <strong style={{ color: '#e67e22' }}>{tipo.quantidade - tipo.vendidos}</strong></div>
                            <div>📈 Total: <strong style={{ color: '#3498db' }}>{tipo.quantidade}</strong></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* DETALHAMENTO DE PRODUTOS */}
        {produtos.length > 0 && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
            <h2 style={{ color: '#5d34a4', marginTop: 0, marginBottom: '20px' }}>🛍️ Produtos Adicionais</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ 
                backgroundColor: '#e8f5e9', 
                padding: '15px', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                  {totaisProdutos.vendidos}
                </div>
                <div style={{ fontSize: '13px', color: '#555', marginTop: '5px' }}>
                  Produtos Vendidos
                </div>
              </div>

              <div style={{ 
                backgroundColor: '#fff3e0', 
                padding: '15px', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e67e22' }}>
                  {totaisProdutos.disponiveis}
                </div>
                <div style={{ fontSize: '13px', color: '#555', marginTop: '5px' }}>
                  Produtos Disponíveis
                </div>
              </div>

              <div style={{ 
                backgroundColor: '#e3f2fd', 
                padding: '15px', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
                  {totaisProdutos.total}
                </div>
                <div style={{ fontSize: '13px', color: '#555', marginTop: '5px' }}>
                  Total Disponibilizado
                </div>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '15px' 
            }}>
              {produtos.map((produto, index) => {
                const totalProduto = produto.quantidade_disponivel + (produto.quantidade_vendida || 0);
                return (
                  <div key={index} style={{ 
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}>
                    {produto.imagem_url && (
                      <img 
                        src={produto.imagem_url} 
                        alt={produto.nome}
                        style={{ 
                          width: '100%', 
                          height: '150px', 
                          objectFit: 'cover', 
                          borderRadius: '6px',
                          marginBottom: '10px'
                        }}
                      />
                    )}
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333', fontSize: '15px' }}>
                      {produto.nome}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                      <div>💰 Preço: <strong>R$ {produto.preco.toFixed(2)}</strong></div>
                      <div>✅ Vendidos: <strong style={{ color: '#27ae60' }}>{produto.quantidade_vendida || 0}</strong></div>
                      <div>📊 Disponíveis: <strong style={{ color: '#e67e22' }}>{produto.quantidade_disponivel}</strong></div>
                      <div
