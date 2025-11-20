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
  const [setores, setSetores] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [ingressos, setIngressos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModalSessao, setMostrarModalSessao] = useState(false);
  const [mostrarModalIngressos, setMostrarModalIngressos] = useState(false);

  useEffect(() => {
    carregarTodosDados();
  }, [eventoId]);

  const carregarTodosDados = async () => {
    try {
      // 1. CARREGAR EVENTO
      const { data: eventoData, error: eventoError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      if (eventoError) throw eventoError;
      console.log('📅 Evento:', eventoData);
      setEvento(eventoData);

      // 2. CARREGAR SETORES
      const { data: setoresData } = await supabase
        .from('setores')
        .select('*')
        .eq('eventos_id', eventoId);
      
      console.log('🏟️ Setores:', setoresData);
      setSetores(setoresData || []);

      // 3. CARREGAR LOTES
      const { data: lotesData } = await supabase
        .from('lotes')
        .select('*')
        .eq('evento_id', eventoId);
      
      console.log('🎫 Lotes:', lotesData);
      setLotes(lotesData || []);

      // 4. CARREGAR INGRESSOS
      const { data: ingressosData } = await supabase
        .from('ingressos')
        .select('*')
        .eq('evento_id', eventoId);
      
      console.log('🎟️ Ingressos:', ingressosData);
      setIngressos(ingressosData || []);

      // 5. CARREGAR PRODUTOS
      const { data: produtosData } = await supabase
        .from('produtos')
        .select('*')
        .eq('evento_id', eventoId);
      
      console.log('🛍️ Produtos:', produtosData);
      setProdutos(produtosData || []);

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      alert('Erro ao carregar evento');
      router.push('/produtor');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotaisIngressos = () => {
    const total = ingressos.reduce((sum, ing) => sum + (ing.quantidade || 0), 0);
    const vendidos = ingressos.reduce((sum, ing) => sum + (ing.vendidos || 0), 0);
    const disponiveis = total - vendidos;
    
    return { total, vendidos, disponiveis };
  };

  const calcularTotaisProdutos = () => {
    const total = produtos.reduce((sum, prod) => sum + (prod.quantidade_disponivel || 0), 0);
    const vendidos = produtos.reduce((sum, prod) => sum + (prod.quantidade_vendida || 0), 0);
    const disponiveis = total - vendidos;
    
    return { total, vendidos, disponiveis };
  };

  const calcularReceitaTotal = () => {
    // Receita de ingressos
    const receitaIngressos = ingressos.reduce((sum, ing) => {
      const preco = parseFloat(ing.valor) || 0;
      const vendidos = ing.vendidos || 0;
      return sum + (preco * vendidos);
    }, 0);

    // Receita de produtos
    const receitaProdutos = produtos.reduce((sum, prod) => {
      const preco = parseFloat(prod.preco) || 0;
      const vendidos = prod.quantidade_vendida || 0;
      return sum + (preco * vendidos);
    }, 0);

    return receitaIngressos + receitaProdutos;
  };

  const calcularBonusGolden = () => {
    if (!evento) return 0;
    const receitaTotal = calcularReceitaTotal();
    const taxaCliente = parseFloat(evento.TaxaCliente) || 0;
    const taxaProdutor = parseFloat(evento.TaxaProdutor) || 0;
    
    // Se taxaProdutor for positiva, é bônus
    if (taxaProdutor > 0) {
      return receitaTotal * (taxaProdutor / 100);
    }
    
    // Se for negativa, desconta
    if (taxaProdutor < 0) {
      return receitaTotal * (taxaProdutor / 100);
    }
    
    return 0;
  };

  const getNomePlano = (taxaCliente, taxaProdutor) => {
    const tc = parseFloat(taxaCliente) || 0;
    const tp = parseFloat(taxaProdutor) || 0;
    
    if (tc === 18.5) return '💎 Premium (18,5% taxa + 6,5% bônus)';
    if (tc === 15) return '✅ Padrão (15% taxa + 5% bônus)';
    if (tc === 10) return '💙 Econômico (10% taxa + 3% bônus)';
    if (tc === 8) return '🚀 Competitivo (8% taxa, sem bônus)';
    if (tc === 0 && tp === -8) return '💜 Absorção Total (0% cliente, você paga 8%)';
    return `Taxa ${tc}%`;
  };

  const agruparIngressosPorSetor = () => {
    const grupos = {};
    
    ingressos.forEach(ing => {
      if (!grupos[ing.setor]) {
        grupos[ing.setor] = {
          nome: ing.setor,
          lotes: {},
          semLote: []
        };
      }
      
      if (ing.lote_id) {
        const lote = lotes.find(l => l.id === ing.lote_id);
        const nomeLotenull = lote ? lote.nome : `Lote ${ing.lote_id}`;
        
        if (!grupos[ing.setor].lotes[nomeLote]) {
          grupos[ing.setor].lotes[nomeLote] = [];
        }
        grupos[ing.setor].lotes[nomeLote].push(ing);
      } else {
        grupos[ing.setor].semLote.push(ing);
      }
    });
    
    return grupos;
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px', textAlign: 'center', paddingTop: '100px' }}>
        <h2>🔄 Carregando dados do evento...</h2>
      </div>
    );
  }

  if (!evento) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px', textAlign: 'center', paddingTop: '100px' }}>
        <h2>⚠️ Evento não encontrado</h2>
        <Link href="/produtor" style={{ color: '#5d34a4', textDecoration: 'underline' }}>Voltar</Link>
      </div>
    );
  }

  const totaisIngressos = calcularTotaisIngressos();
  const totaisProdutos = calcularTotaisProdutos();
  const receitaTotal = calcularReceitaTotal();
  const bonusGolden = calcularBonusGolden();
  const totalReceber = receitaTotal + bonusGolden;
  const eventoPassado = new Date(evento.data) < new Date();
  const setoresAgrupados = agruparIngressosPorSetor();

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      {/* HEADER */}
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

        {/* INFORMAÇÕES GERAIS */}
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
                {getNomePlano(evento.TaxaCliente, evento.TaxaProdutor)}
              </div>
              
              <div>
                <strong>💰 Taxa do Cliente:</strong><br />
                {evento.TaxaCliente}% sobre o valor
              </div>
              
              <div>
                <strong>✨ Seu Bônus/Desconto:</strong><br />
                {evento.TaxaProdutor > 0 && `+${evento.TaxaProdutor}% de bônus`}
                {evento.TaxaProdutor < 0 && `${evento.TaxaProdutor}% (você paga)`}
                {evento.TaxaProdutor == 0 && 'Sem bônus/desconto'}
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

        {/* CARDS DE ESTATÍSTICAS */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '20px', 
          marginBottom: '25px' 
        }}>
          
          {/* INGRESSOS */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '25px', 
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#5d34a4' }}>🎟️ Ingressos</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e67e22' }}>
                  {totaisIngressos.disponiveis}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                  Disponíveis
                </div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60' }}>
                  {totaisIngressos.vendidos}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                  Vendidos
                </div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3498db' }}>
                  {totaisIngressos.total}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                  Total
                </div>
              </div>
            </div>
          </div>

          {/* PRODUTOS */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '25px', 
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#5d34a4' }}>🛍️ Produtos</h3>
            
            {produtos.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e67e22' }}>
                    {totaisProdutos.disponiveis}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                    Disponíveis
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60' }}>
                    {totaisProdutos.vendidos}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                    Vendidos
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3498db' }}>
                    {totaisProdutos.total}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                    Total
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: '#bdc3c7' }}>
                <p style={{ margin: 0 }}>Nenhum produto cadastrado</p>
              </div>
            )}
          </div>
        </div>

        {/* RECEITA TOTAL */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 20px 0' }}>💰 Faturamento Total</h2>
          
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
            R$ {totalReceber.toFixed(2)}
          </div>
          
          <div style={{ fontSize: '16px', opacity: 0.9 }}>
            Receita: R$ {receitaTotal.toFixed(2)} 
            {bonusGolden !== 0 && (
              <span> | Bônus/Taxa: {bonusGolden > 0 ? '+' : ''}R$ {bonusGolden.toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* DETALHAMENTO POR SETOR */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0 }}>🏟️ Detalhamento por Setor</h2>
          
          {Object.keys(setoresAgrupados).length > 0 ? (
            Object.values(setoresAgrupados).map((setor, idx) => (
              <div key={idx} style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ color: '#5d34a4', marginTop: 0 }}>📍 {setor.nome}</h3>
                
                {/* INGRESSOS SEM LOTE */}
                {setor.semLote.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>Ingressos:</h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {setor.semLote.map((ing, i) => (
                        <div key={i} style={{ 
                          padding: '15px', 
                          backgroundColor: 'white', 
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <strong>{ing.tipo}</strong>
                            <div style={{ fontSize: '14px', color: '#666' }}>R$ {parseFloat(ing.valor).toFixed(2)}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                              <span style={{ color: '#e67e22', fontWeight: 'bold' }}>{(ing.quantidade || 0) - (ing.vendidos || 0)}</span> disponíveis | 
                              <span style={{ color: '#27ae60', fontWeight: 'bold' }}> {ing.vendidos || 0}</span> vendidos | 
                              <span style={{ color: '#3498db', fontWeight: 'bold' }}> {ing.quantidade || 0}</span> total
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* INGRESSOS POR LOTE */}
                {Object.keys(setor.lotes).map((nomeLote, loteIdx) => (
                  <div key={loteIdx} style={{ marginBottom: '15px' }}>
                    <h4 style={{ color: '#9b59b6', fontSize: '15px', marginBottom: '10px' }}>🎫 {nomeLote}</h4>
                    <div style={{ display: 'grid', gap: '10px', paddingLeft: '15px' }}>
                      {setor.lotes[nomeLote].map((ing, i) => (
                        <div key={i} style={{ 
                          padding: '15px', 
                          backgroundColor: 'white', 
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderLeft: '3px solid #9b59b6'
                        }}>
                          <div>
                            <strong>{ing.tipo}</strong>
                            <div style={{ fontSize: '14px', color: '#666' }}>R$ {parseFloat(ing.valor).toFixed(2)}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                              <span style={{ color: '#e67e22', fontWeight: 'bold' }}>{(ing.quantidade || 0) - (ing.vendidos || 0)}</span> disponíveis | 
                              <span style={{ color: '#27ae60', fontWeight: 'bold' }}> {ing.vendidos || 0}</span> vendidos | 
                              <span style={{ color: '#3498db', fontWeight: 'bold' }}> {ing.quantidade || 0}</span> total
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: '#95a5a6', border: '2px dashed #ddd', borderRadius: '8px' }}>
              <p>Nenhum ingresso encontrado</p>
            </div>
          )}
        </div>

        {/* DETALHAMENTO DE PRODUTOS */}
        {produtos.length > 0 && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
            <h2 style={{ color: '#5d34a4', marginTop: 0 }}>🛍️ Detalhamento de Produtos</h2>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {produtos.map((prod, idx) => (
                <div key={idx} style={{ 
                  padding: '20px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {prod.imagem_url && (
                        <img 
                          src={prod.imagem_url} 
                          alt={prod.nome}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      )}
                      <div>
                        <strong style={{ fontSize: '16px' }}>{prod.nome}</strong>
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '3px' }}>
                          R$ {parseFloat(prod.preco).toFixed(2)}
                          {prod.tamanho && ` | Tamanho: ${prod.tamanho}`}
                        </div>
                        {prod.descricao && (
                          <div style={{ fontSize: '13px', color: '#999', marginTop: '5px' }}>
                            {prod.descricao}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
                      <span style={{ color: '#e67e22', fontWeight: 'bold' }}>
                        {(prod.quantidade_disponivel || 0) - (prod.quantidade_vendida || 0)}
                      </span> disponíveis | 
                      <span style={{ color: '#27ae60', fontWeight: 'bold' }}> {prod.quantidade_vendida || 0}</span> vendidos | 
                      <span style={{ color: '#3498db', fontWeight: 'bold' }}> {prod.quantidade_disponivel || 0}</span> total
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#27ae60', marginTop: '5px' }}>
                      Receita: R$ {((prod.quantidade_vendida || 0) * parseFloat(prod.preco)).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTÕES DE AÇÃO */}
        {!eventoPassado && (
          <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
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
                cursor: 'pointer'
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
                cursor: 'pointer'
              }}
            >
              🎬 Abrir Nova Sessão
            </button>
          </div>
        )}

        {/* IMAGEM DO EVENTO */}
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
