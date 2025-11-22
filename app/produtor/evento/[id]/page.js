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
  const [sessoes, setSessoes] = useState([]);
  const [setoresPorSessao, setSetoresPorSessao] = useState({});
  const [produtos, setProdutos] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEvento();
  }, [eventoId]);

  const carregarEvento = async () => {
    try {
      const { data: eventoData, error: eventoError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      if (eventoError) throw eventoError;
      setEvento(eventoData);

      // BUSCAR TODAS AS SESSÕES DO EVENTO
      const { data: sessoesData, error: sessoesError } = await supabase
        .from('sessoes')
        .select('*')
        .eq('evento_id', eventoId)
        .order('data', { ascending: true })
        .order('hora', { ascending: true });

      if (sessoesError) throw sessoesError;
      setSessoes(sessoesData || []);

      // Para cada sessão, buscar setores e ingressos
      const setoresPorSessaoTemp = {};

      for (const sessao of sessoesData || []) {
        const { data: setoresData, error: setoresError } = await supabase
          .from('setores')
          .select('*')
          .eq('sessao_id', sessao.id);

        if (setoresError) {
          console.error('Erro ao buscar setores da sessão:', setoresError);
          continue;
        }

        const { data: ingressosData, error: ingressosError } = await supabase
          .from('ingressos')
          .select('*')
          .in('setor_id', setoresData?.map(s => s.id) || []);

        if (ingressosError) {
          console.error('Erro ao buscar ingressos:', ingressosError);
        }

        const { data: lotesData } = await supabase
          .from('lotes')
          .select('*')
          .eq('evento_id', eventoId);

        const setoresMap = new Map();

        ingressosData?.forEach(ingresso => {
          const setorInfo = setoresData?.find(s => s.id === ingresso.setor_id);
          const setorNome = setorInfo?.nome || 'Sem setor';
          
          if (!setoresMap.has(setorNome)) {
            setoresMap.set(setorNome, {
              nome: setorNome,
              capacidadeDefinida: setorInfo?.capacidade_definida || null,
              capacidadeCalculada: setorInfo?.capacidade_calculada || null,
              lotes: new Map(),
              tiposSemLote: []
            });
          }

          const setor = setoresMap.get(setorNome);
          const quantidade = parseInt(ingresso.quantidade) || 0;
          const vendidos = parseInt(ingresso.vendidos) || 0;
          const disponiveis = quantidade > 0 ? (quantidade - vendidos) : 0;
          const preco = parseFloat(ingresso.valor) || 0;

          const tipoObj = {
            id: ingresso.id,
            nome: ingresso.tipo,
            preco: preco,
            quantidade: quantidade,
            vendidos: vendidos,
            disponiveis: disponiveis,
            bilheteria: vendidos * preco
          };

          if (ingresso.lote_id) {
            if (!setor.lotes.has(ingresso.lote_id)) {
              const loteInfo = lotesData?.find(l => l.id === ingresso.lote_id);
              setor.lotes.set(ingresso.lote_id, {
                id: ingresso.lote_id,
                nome: loteInfo?.nome || 'Lote sem nome',
                tipos: []
              });
            }
            setor.lotes.get(ingresso.lote_id).tipos.push(tipoObj);
          } else {
            setor.tiposSemLote.push(tipoObj);
          }
        });

        const setoresArray = Array.from(setoresMap.values()).map(setor => ({
          nome: setor.nome,
          capacidadeDefinida: setor.capacidadeDefinida,
          capacidadeCalculada: setor.capacidadeCalculada,
          lotes: Array.from(setor.lotes.values()),
          tiposSemLote: setor.tiposSemLote
        }));

        setoresPorSessaoTemp[sessao.id] = setoresArray;
      }

      setSetoresPorSessao(setoresPorSessaoTemp);

      // BUSCAR CUPONS
      const { data: cuponsData } = await supabase
        .from('cupons')
        .select('*')
        .eq('evento_id', eventoId);

      const cuponsDetalhados = await Promise.all(
        (cuponsData || []).map(async (cupom) => {
          const { data: usosData } = await supabase
            .from('cupons_usados')
            .select('*, comprador_email, comprador_nome')
            .eq('cupom_id', cupom.id);

          const { data: cuponsIngressosData } = await supabase
            .from('cupons_ingressos')
            .select('*, ingressos(*)')
            .eq('cupom_id', cupom.id);

          const { data: cuponsProdutosData } = await supabase
            .from('cupons_produtos')
            .select('*, produtos(*)')
            .eq('cupom_id', cupom.id);

          return {
            ...cupom,
            usos: usosData || [],
            ingressosVinculados: cuponsIngressosData || [],
            produtosVinculados: cuponsProdutosData || []
          };
        })
      );

      setCupons(cuponsDetalhados);

      // BUSCAR PRODUTOS
      const { data: produtosData } = await supabase
        .from('produtos')
        .select('*')
        .eq('evento_id', eventoId);

      setProdutos(produtosData || []);

    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      alert('Erro ao carregar evento');
      router.push('/produtor');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotaisSetor = (setor) => {
    let vendidos = 0, bilheteria = 0;
    let totalCalculado = 0;

    setor.lotes.forEach(lote => {
      lote.tipos.forEach(tipo => {
        vendidos += tipo.vendidos;
        bilheteria += tipo.bilheteria;
        totalCalculado += tipo.quantidade;
      });
    });

    setor.tiposSemLote.forEach(tipo => {
      vendidos += tipo.vendidos;
      bilheteria += tipo.bilheteria;
      totalCalculado += tipo.quantidade;
    });

    const total = setor.capacidadeDefinida && setor.capacidadeDefinida > 0
      ? setor.capacidadeDefinida
      : totalCalculado;

    const disponiveis = total - vendidos;
    const controladoPorSetor = setor.capacidadeDefinida && setor.capacidadeDefinida > 0;

    return { vendidos, disponiveis, total, bilheteria, controladoPorSetor };
  };

  const calcularTotaisLote = (lote) => {
    let vendidos = 0, disponiveis = 0, total = 0, bilheteria = 0;

    lote.tipos.forEach(tipo => {
      vendidos += tipo.vendidos;
      disponiveis += tipo.disponiveis;
      total += tipo.quantidade;
      bilheteria += tipo.bilheteria;
    });

    return { vendidos, disponiveis, total, bilheteria };
  };

  const calcularGanhoTaxas = (bilheteria) => {
    if (!evento) return 0;
    const taxaCliente = evento.TaxaCliente || 0;
    let percentualBonus = 0;
    
    if (taxaCliente === 18.5) percentualBonus = 6.5;
    else if (taxaCliente === 15) percentualBonus = 5;
    else if (taxaCliente === 10) percentualBonus = 3;
    else if (taxaCliente === 8) percentualBonus = 0;
    else if (taxaCliente === 0) percentualBonus = -8;
    
    return bilheteria * (percentualBonus / 100);
  };

  // CALCULA TOTAIS SOMANDO TODAS AS SESSÕES
  const calcularTotaisIngressos = () => {
    let totalDisponibilizado = 0, totalVendido = 0;

    Object.values(setoresPorSessao).forEach(setores => {
      setores.forEach(setor => {
        const totaisSetor = calcularTotaisSetor(setor);
        totalDisponibilizado += totaisSetor.total;
        totalVendido += totaisSetor.vendidos;
      });
    });

    return {
      total: totalDisponibilizado,
      vendidos: totalVendido,
      disponiveis: totalDisponibilizado - totalVendido
    };
  };

  const calcularTotaisProdutos = () => {
    let totalDisponibilizado = 0, totalVendido = 0;

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

  const calcularTotaisCupons = () => {
    let totalUsados = 0;
    cupons.forEach(cupom => {
      totalUsados += cupom.quantidade_usada || 0;
    });
    return totalUsados;
  };

  const calcularValorTotalVendas = () => {
    let valorIngressos = 0, valorProdutos = 0;

    Object.values(setoresPorSessao).forEach(setores => {
      setores.forEach(setor => {
        setor.lotes.forEach(lote => {
          lote.tipos.forEach(tipo => {
            valorIngressos += tipo.vendidos * tipo.preco;
          });
        });

        setor.tiposSemLote.forEach(tipo => {
          valorIngressos += tipo.vendidos * tipo.preco;
        });
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
    else if (taxaCliente === 0) percentualBonus = -8;
    
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
  const totaisCupons = calcularTotaisCupons();
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
            {sessoes.length > 1 && ` • ${sessoes.length} Sessões`}
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

        {/* Cards de totais GERAIS (soma de todas sessões) */}
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
            <Link 
              href={`/produtor/evento/${eventoId}/adicionar-ingressos`}
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
                textDecoration: 'none',
                display: 'block',
                textAlign: 'center'
              }}
            >
              ➕ Adicionar Mais Ingressos
            </Link>
            
            <Link 
              href={`/produtor/evento/${eventoId}/nova-sessao`}
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
                textDecoration: 'none',
                display: 'block',
                textAlign: 'center'
              }}
            >
              🎬 Gerenciar Sessões
            </Link>
          </div>
        )}

        {/* DETALHAMENTO POR SESSÃO */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0, marginBottom: '20px' }}>🎫 Detalhamento de Ingressos</h2>
          
          {sessoes.length === 0 ? (
            <div style={{ 
              padding: '30px', 
              textAlign: 'center', 
              color: '#95a5a6',
              border: '2px dashed #ddd',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '48px', margin: '0 0 15px 0' }}>🎫</p>
              <p style={{ margin: 0, fontSize: '16px' }}>Nenhuma sessão cadastrada ainda</p>
            </div>
          ) : (
            sessoes.map((sessao, sessaoIndex) => {
              const setoresDaSessao = setoresPorSessao[sessao.id] || [];
              
              return (
                <div key={sessaoIndex} style={{ 
                  marginBottom: '30px',
                  border: '3px solid #9b59b6',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: '#f9f7fb'
                }}>
                  <h3 style={{ 
                    color: '#9b59b6', 
                    margin: '0 0 20px 0',
                    fontSize: '22px',
                    borderBottom: '3px solid #9b59b6',
                    paddingBottom: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>
                      🎬 Sessão {sessao.numero}
                      {sessao.is_original && (
                        <span style={{ 
                          fontSize: '12px', 
                          marginLeft: '10px',
                          padding: '4px 10px',
                          backgroundColor: '#ffd700',
                          color: '#333',
                          borderRadius: '12px',
                          fontWeight: 'bold'
                        }}>
                          ⭐ Original
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 'normal' }}>
                      📅 {new Date(sessao.data).toLocaleDateString('pt-BR')} às {sessao.hora}
                    </span>
                  </h3>

                  {setoresDaSessao.length === 0 ? (
                    <div style={{ 
                      padding: '20px', 
                      textAlign: 'center', 
                      color: '#95a5a6',
                      border: '2px dashed #ddd',
                      borderRadius: '8px',
                      backgroundColor: 'white'
                    }}>
                      <p style={{ margin: 0, fontSize: '14px' }}>Nenhum ingresso cadastrado nesta sessão</p>
                    </div>
                  ) : (
                    setoresDaSessao.map((setor, setorIndex) => {
                      const totaisSetor = calcularTotaisSetor(setor);
                      const ganhoTaxasSetor = calcularGanhoTaxas(totaisSetor.bilheteria);
                      const controladoPorSetor = totaisSetor.controladoPorSetor;
                      
                      return (
                        <div key={setorIndex} style={{ 
                          marginBottom: '20px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '10px',
                          padding: '20px',
                          backgroundColor: 'white'
                        }}>
                          <h4 style={{ 
                            color: '#5d34a4', 
                            margin: '0 0 15px 0',
                            fontSize: '18px',
                            borderBottom: '2px solid #5d34a4',
                            paddingBottom: '10px'
                          }}>
                            🏟️ Setor: {setor.nome}
                            {controladoPorSetor && (
                              <span style={{ 
                                fontSize: '11px', 
                                marginLeft: '10px',
                                padding: '3px 8px',
                                backgroundColor: '#e8f4f8',
                                color: '#2196f3',
                                borderRadius: '10px',
                                fontWeight: 'normal'
                              }}>
                                📊 Controlado por Setor
                              </span>
                            )}
                          </h4>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: controladoPorSetor ? 'repeat(5, 1fr)' : 'repeat(3, 1fr)',
                            gap: '10px',
                            marginBottom: '15px',
                            padding: '12px',
                            backgroundColor: '#e8f4f8',
                            borderRadius: '8px'
                          }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>{totaisSetor.vendidos}</div>
                              <div style={{ fontSize: '11px', color: '#666' }}>Vendidos</div>
                            </div>
                            
                            {controladoPorSetor && (
                              <>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e67e22' }}>{totaisSetor.disponiveis}</div>
                                  <div style={{ fontSize: '11px', color: '#666' }}>Disponíveis</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3498db' }}>{totaisSetor.total}</div>
                                  <div style={{ fontSize: '11px', color: '#666' }}>Total</div>
                                </div>
                              </>
                            )}
                            
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#9b59b6' }}>R$ {totaisSetor.bilheteria.toFixed(2)}</div>
                              <div style={{ fontSize: '11px', color: '#666' }}>Bilheteria</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '16px', fontWeight: 'bold', color: ganhoTaxasSetor >= 0 ? '#27ae60' : '#e74c3c' }}>
                                R$ {ganhoTaxasSetor.toFixed(2)}
                              </div>
                              <div style={{ fontSize: '11px', color: '#666' }}>Ganho Taxas</div>
                            </div>
                          </div>

                          {setor.lotes.map((lote, loteIndex) => {
                            const totaisLote = calcularTotaisLote(lote);
                            const ganhoTaxasLote = calcularGanhoTaxas(totaisLote.bilheteria);
                            
                            return (
                              <div key={loteIndex} style={{ 
                                marginBottom: '15px',
                                backgroundColor: '#fafafa',
                                padding: '15px',
                                borderRadius: '8px',
                                border: '1px solid #d0d0d0'
                              }}>
                                <h5 style={{ 
                                  color: '#2980b9', 
                                  margin: '0 0 12px 0',
                                  fontSize: '15px'
                                }}>
                                  📦 {lote.nome}
                                </h5>

                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(5, 1fr)',
                                  gap: '8px',
                                  marginBottom: '15px',
                                  padding: '10px',
                                  backgroundColor: '#f0f8ff',
                                  borderRadius: '6px'
                                }}>
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#27ae60' }}>{totaisLote.vendidos}</div>
                                    <div style={{ fontSize: '10px', color: '#666' }}>Vendidos</div>
                                  </div>
                                  {!controladoPorSetor && (
                                    <>
                                      <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#e67e22' }}>{totaisLote.disponiveis}</div>
                                        <div style={{ fontSize: '10px', color: '#666' }}>Disponíveis</div>
                                      </div>
                                      <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#3498db' }}>{totaisLote.total}</div>
                                        <div style={{ fontSize: '10px', color: '#666' }}>Total</div>
                                      </div>
                                    </>
                                  )}
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#9b59b6' }}>R$ {totaisLote.bilheteria.toFixed(2)}</div>
                                    <div style={{ fontSize: '10px', color: '#666' }}>Bilheteria</div>
                                  </div>
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: ganhoTaxasLote >= 0 ? '#27ae60' : '#e74c3c' }}>
                                      R$ {ganhoTaxasLote.toFixed(2)}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#666' }}>Ganho Taxas</div>
                                  </div>
                                </div>

                                <div style={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', 
                                  gap: '10px' 
                                }}>
                                  {lote.tipos.map((tipo, tipoIndex) => {
                                    const ganhoTaxasTipo = calcularGanhoTaxas(tipo.bilheteria);
                                    
                                    return (
                                      <div key={tipoIndex} style={{ 
                                        backgroundColor: 'white',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid #e0e0e0'
                                      }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#333', fontSize: '13px' }}>
                                          {tipo.nome}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
                                          <div>💰 Preço: <strong>R$ {tipo.preco.toFixed(2)}</strong></div>
                                          <div>✅ Vendidos: <strong style={{ color: '#27ae60' }}>{tipo.vendidos}</strong></div>
                                          {!controladoPorSetor && (
                                            <>
                                              <div>📊 Disponíveis: <strong style={{ color: '#e67e22' }}>{tipo.disponiveis}</strong></div>
                                              <div>📈 Total: <strong style={{ color: '#3498db' }}>{tipo.quantidade}</strong></div>
                                            </>
                                          )}
                                          <div>💵 Bilheteria: <strong style={{ color: '#9b59b6' }}>R$ {tipo.bilheteria.toFixed(2)}</strong></div>
                                          <div>💎 Ganho: <strong style={{ color: ganhoTaxasTipo >= 0 ? '#27ae60' : '#e74c3c' }}>R$ {ganhoTaxasTipo.toFixed(2)}</strong></div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}

                          {setor.tiposSemLote.length > 0 && (
                            <div style={{ 
                              backgroundColor: '#fafafa',
                              padding: '15px',
                              borderRadius: '8px',
                              border: '1px solid #d0d0d0'
                            }}>
                              <h5 style={{ 
                                color: '#16a085', 
                                margin: '0 0 12px 0',
                                fontSize: '15px'
                              }}>
                                🎟️ Ingressos do Setor
                              </h5>

                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', 
                                gap: '10px' 
                              }}>
                                {setor.tiposSemLote.map((tipo, tipoIndex) => {
                                  const ganhoTaxasTipo = calcularGanhoTaxas(tipo.bilheteria);
                                  
                                  return (
                                    <div key={tipoIndex} style={{ 
                                      backgroundColor: 'white',
                                      padding: '10px',
                                      borderRadius: '6px',
                                      border: '1px solid #e0e0e0'
                                    }}>
                                      <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#333', fontSize: '13px' }}>
                                        {tipo.nome}
                                      </div>
                                      <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
                                        <div>💰 Preço: <strong>R$ {tipo.preco.toFixed(2)}</strong></div>
                                        <div>✅ Vendidos: <strong style={{ color: '#27ae60' }}>{tipo.vendidos}</strong></div>
                                        {!controladoPorSetor && (
                                          <>
                                            <div>📊 Disponíveis: <strong style={{ color: '#e67e22' }}>{tipo.disponiveis}</strong></div>
                                            <div>📈 Total: <strong style={{ color: '#3498db' }}>{tipo.quantidade}</strong></div>
                                          </>
                                        )}
                                        <div>💵 Bilheteria: <strong style={{ color: '#9b59b6' }}>R$ {tipo.bilheteria.toFixed(2)}</strong></div>
                                        <div>💎 Ganho: <strong style={{ color: ganhoTaxasTipo >= 0 ? '#27ae60' : '#e74c3c' }}>R$ {ganhoTaxasTipo.toFixed(2)}</strong></div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* CUPONS */}
        {cupons.length > 0 && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
            <h2 style={{ color: '#5d34a4', marginTop: 0, marginBottom: '20px' }}>🎟️ Cupons de Desconto</h2>
            
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                {totaisCupons}
              </div>
              <div style={{ fontSize: '13px', color: '#555', marginTop: '5px' }}>
                Total de Usos de Cupons
              </div>
            </div>

            {cupons.map((cupom, index) => {
              const totalEconomizado = cupom.usos.reduce((sum, uso) => sum + (parseFloat(uso.valor_desconto) || 0), 0);
              const totalArrecadado = cupom.usos.reduce((sum, uso) => sum + (parseFloat(uso.valor_final) || 0), 0);
              
              return (
                <div key={index} style={{ 
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ fontWeight: 'bold', color: '#5d34a4', fontSize: '20px' }}>
                      🎫 {cupom.codigo}
                    </div>
                    <div style={{ 
                      padding: '6px 15px', 
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      backgroundColor: cupom.ativo ? '#d4edda' : '#f8d7da',
                      color: cupom.ativo ? '#155724' : '#721c24'
                    }}>
                      {cupom.ativo ? '✅ Ativo' : '❌ Inativo'}
                    </div>
                  </div>

                  {cupom.descricao && (
                    <div style={{ marginBottom: '15px', fontStyle: 'italic', color: '#666', fontSize: '14px' }}>
                      "{cupom.descricao}"
                    </div>
                  )}

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '12px',
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: 'white',
                    borderRadius: '8px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#27ae60' }}>
                        {cupom.usos.length}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>Usuários</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3498db' }}>
                        {cupom.quantidade_usada || 0}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>Total Usos</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#e74c3c' }}>
                        R$ {totalEconomizado.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>Economizado</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#9b59b6' }}>
                        R$ {totalArrecadado.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>Arrecadado</div>
                    </div>
                  </div>

                  {cupom.ingressosVinculados.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <h4 style={{ color: '#2980b9', margin: '0 0 10px 0', fontSize: '15px' }}>
                        🎫 Ingressos com Desconto
                      </h4>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                        gap: '10px' 
                      }}>
                        {cupom.ingressosVinculados.map((ci, idx) => (
                          <div key={idx} style={{ 
                            backgroundColor: 'white',
                            padding: '10px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            border: '1px solid #d0d0d0'
                          }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                              {ci.ingressos?.tipo || 'Ingresso'}
                            </div>
                            <div style={{ color: '#666' }}>
                              <span style={{ textDecoration: 'line-through' }}>
                                R$ {parseFloat(ci.ingressos?.valor || 0).toFixed(2)}
                              </span>
                              {' → '}
                              <strong style={{ color: '#27ae60' }}>
                                R$ {parseFloat(ci.preco_com_cupom).toFixed(2)}
                              </strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cupom.produtosVinculados.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <h4 style={{ color: '#16a085', margin: '0 0 10px 0', fontSize: '15px' }}>
                        🛍️ Produtos com Desconto
                      </h4>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                        gap: '10px' 
                      }}>
                        {cupom.produtosVinculados.map((cp, idx) => (
                          <div key={idx} style={{ 
                            backgroundColor: 'white',
                            padding: '10px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            border: '1px solid #d0d0d0'
                          }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                              {cp.produtos?.nome || 'Produto'}
                            </div>
                            <div style={{ color: '#666' }}>
                              <span style={{ textDecoration: 'line-through' }}>
                                R$ {parseFloat(cp.produtos?.preco || 0).toFixed(2)}
                              </span>
                              {' → '}
                              <strong style={{ color: '#27ae60' }}>
                                R$ {parseFloat(cp.preco_com_cupom).toFixed(2)}
                              </strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#fff3e0', 
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    {cupom.quantidade_total && (
                      <div>📊 Limite: <strong>{cupom.quantidade_total} usos</strong></div>
                    )}
                    {cupom.data_validade_inicio && (
                      <div>📅 Válido de: <strong>{new Date(cupom.data_validade_inicio).toLocaleDateString('pt-BR')}</strong></div>
                    )}
                    {cupom.data_validade_fim && (
                      <div>📅 Válido até: <strong>{new Date(cupom.data_validade_fim).toLocaleDateString('pt-BR')}</strong></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PRODUTOS */}
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
    </div>
  );
}
