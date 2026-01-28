'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '../../../../utils/supabase/client';
import Link from 'next/link';

// Componente de Visualizações
function VisualizacoesEvento({ eventoId }) {
  const supabase = createClient();
  const [visualizacoes, setVisualizacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarVisualizacoes();
  }, [eventoId]);

  const carregarVisualizacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('visualizacoes_evento')
        .select('*')
        .eq('evento_id', eventoId)
        .order('data_hora', { ascending: false });

      if (error) throw error;
      setVisualizacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar visualizações:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = () => {
    const total = visualizacoes.length;
    const porOrigem = {};
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    let visualizacoesHoje = 0;

    visualizacoes.forEach(vis => {
      const origem = vis.origem || 'Desconhecido';
      porOrigem[origem] = (porOrigem[origem] || 0) + 1;

      const dataVis = new Date(vis.data_hora);
      dataVis.setHours(0, 0, 0, 0);
      if (dataVis.getTime() === hoje.getTime()) {
        visualizacoesHoje++;
      }
    });

    const origens = Object.entries(porOrigem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { total, origens, visualizacoesHoje };
  };

  const getIconeOrigem = (origem) => {
    if (origem.includes('Instagram')) return '📱';
    if (origem.includes('Facebook')) return '📘';
    if (origem.includes('Twitter')) return '🐦';
    if (origem.includes('WhatsApp')) return '💬';
    if (origem.includes('Google')) return '🔍';
    if (origem.includes('YouTube')) return '📺';
    if (origem.includes('LinkedIn')) return '💼';
    if (origem.includes('direto') || origem.includes('Direto')) return '🔗';
    return '🌐';
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '25px', textAlign: 'center' }}>
        <p>Carregando estatísticas...</p>
      </div>
    );
  }

  const stats = calcularEstatisticas();

  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
      <h2 style={{ color: '#5d34a4', marginTop: 0, marginBottom: '20px' }}>📊 Visualizações da Página do Evento</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1976d2' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '14px', color: '#555', marginTop: '5px' }}>
            Total de Visualizações
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#e8f5e9', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#388e3c' }}>
            {stats.visualizacoesHoje}
          </div>
          <div style={{ fontSize: '14px', color: '#555', marginTop: '5px' }}>
            Visualizações Hoje
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#fff3e0', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f57c00' }}>
            {stats.origens.length}
          </div>
          <div style={{ fontSize: '14px', color: '#555', marginTop: '5px' }}>
            Fontes de Tráfego
          </div>
        </div>
      </div>

      {stats.origens.length > 0 && (
        <div>
          <h3 style={{ color: '#5d34a4', fontSize: '18px', marginBottom: '15px' }}>
            🔥 Top 5 Fontes de Visualizações
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '12px' 
          }}>
            {stats.origens.map(([origem, quantidade], index) => {
              const percentual = ((quantidade / stats.total) * 100).toFixed(1);
              return (
                <div key={index} style={{ 
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <div style={{ fontSize: '32px' }}>
                    {getIconeOrigem(origem)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
                      {origem}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      <strong style={{ color: '#27ae60', fontSize: '18px' }}>{quantidade}</strong> visualizações ({percentual}%)
                    </div>
                    <div style={{ 
                      marginTop: '8px',
                      height: '6px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${percentual}%`,
                        height: '100%',
                        backgroundColor: '#27ae60',
                        transition: 'width 0.3s'
                      }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stats.total === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#95a5a6'
        }}>
          <p style={{ fontSize: '48px', margin: '0 0 15px 0' }}>👀</p>
          <p style={{ margin: 0, fontSize: '16px' }}>Ainda não há visualizações registradas</p>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>Compartilhe o link do seu evento nas redes sociais!</p>
        </div>
      )}
    </div>
  );
}

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
  const [ingressosVendidos, setIngressosVendidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEvento();
  }, [eventoId]);

  // Função para calcular taxa de gateway por compra
  const calcularTaxaPagamento = (valorTotal, formaPagamento, parcelas) => {
    const forma = (formaPagamento || 'pix').toLowerCase();
    const numParcelas = parseInt(parcelas) || 1;
    
    if (forma === 'pix' || forma === 'cortesia') {
      return 1.99;
    } else if (forma === 'boleto') {
      return 3.49;
    } else if (forma === 'cartao_debito') {
      return 0.35 + (valorTotal * 0.0189);
    } else if (forma === 'cartao_credito') {
      if (numParcelas === 1) {
        return 0.49 + (valorTotal * 0.0299);
      } else if (numParcelas >= 2 && numParcelas <= 6) {
        return 0.49 + (valorTotal * 0.0349);
      } else if (numParcelas >= 7 && numParcelas <= 12) {
        return 0.49 + (valorTotal * 0.0399);
      } else {
        return 0.49 + (valorTotal * 0.0429);
      }
    }
    
    return 1.99;
  };

  const carregarEvento = async () => {
    try {
      const { data: eventoData, error: eventoError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      if (eventoError) throw eventoError;
      setEvento(eventoData);

      // BUSCAR INGRESSOS VENDIDOS (incluindo cortesias)
      const { data: ingressosVendidosData } = await supabase
        .from('ingressos_vendidos')
        .select('*')
        .eq('evento_id', eventoId);

      setIngressosVendidos(ingressosVendidosData || []);

      // BUSCAR TODAS AS SESSÕES
      const { data: sessoesData, error: sessoesError } = await supabase
        .from('sessoes')
        .select('*')
        .eq('evento_id', eventoId)
        .order('is_original', { ascending: false })
        .order('created_at', { ascending: true });

      if (sessoesError) {
        console.error('Erro ao buscar sessões:', sessoesError);
      }

      setSessoes(sessoesData || []);

      // BUSCAR TODOS OS SETORES DO EVENTO
      const { data: setoresData, error: setoresError } = await supabase
        .from('setores')
        .select('*')
        .eq('eventos_id', eventoId);

      if (setoresError) {
        console.error('Erro ao buscar setores:', setoresError);
      }

      // BUSCAR TODOS OS INGRESSOS DO EVENTO
      const { data: ingressosData, error: ingressosError } = await supabase
        .from('ingressos')
        .select('*')
        .eq('evento_id', eventoId);

      if (ingressosError) throw ingressosError;

      // BUSCAR TODOS OS LOTES
      const { data: lotesData } = await supabase
        .from('lotes')
        .select('*')
        .eq('evento_id', eventoId);

      // PROCESSAR INGRESSOS POR SESSÃO
      const setoresPorSessaoTemp = {};

      // Inicializar objeto para cada sessão
      (sessoesData || []).forEach(sessao => {
        setoresPorSessaoTemp[sessao.id] = [];
      });

      // Criar um mapa de setores por sessão primeiro
      const setoresPorSessaoMap = {};
      setoresData?.forEach(setor => {
        if (!setor.sessao_id) return;
        
        if (!setoresPorSessaoMap[setor.sessao_id]) {
          setoresPorSessaoMap[setor.sessao_id] = [];
        }
        setoresPorSessaoMap[setor.sessao_id].push(setor);
      });

      // Para cada sessão, inicializar seus setores
      Object.keys(setoresPorSessaoMap).forEach(sessaoId => {
        setoresPorSessaoTemp[sessaoId] = setoresPorSessaoMap[sessaoId].map(setor => ({
          nome: setor.nome,
          capacidadeDefinida: setor.capacidade_definida || null,
          capacidadeCalculada: setor.capacidade_calculada || null,
          lotes: [],
          tiposSemLote: []
        }));
      });

      // Agora processar os ingressos
      ingressosData?.forEach(ingresso => {
        const setorDoIngresso = setoresData?.find(s => s.nome === ingresso.setor);
        
        if (!setorDoIngresso || !setorDoIngresso.sessao_id) {
          console.log('Ingresso sem setor ou sessão:', ingresso);
          return;
        }

        const sessaoId = setorDoIngresso.sessao_id;

        if (!setoresPorSessaoTemp[sessaoId]) {
          console.log('Sessão não encontrada:', sessaoId);
          return;
        }

        const setor = setoresPorSessaoTemp[sessaoId].find(s => s.nome === ingresso.setor);
        
        if (!setor) {
          console.log('Setor não encontrado na sessão:', ingresso.setor, sessaoId);
          return;
        }

        const quantidade = parseInt(ingresso.quantidade) || 0;
        const vendidos = parseInt(ingresso.vendidos) || 0;
        const cortesias = parseInt(ingresso.cortesias) || 0;
        const ocupados = vendidos + cortesias;
        const disponiveis = quantidade > 0 ? Math.max(0, quantidade - ocupados) : 0;
        const preco = parseFloat(ingresso.valor) || 0;

        const tipoObj = {
          id: ingresso.id,
          nome: ingresso.tipo,
          preco: preco,
          quantidade: quantidade,
          vendidos: vendidos,
          cortesias: cortesias,
          disponiveis: disponiveis,
          bilheteria: vendidos * preco
        };

        if (ingresso.lote_id) {
          let lote = setor.lotes.find(l => l.id === ingresso.lote_id);
          
          if (!lote) {
            const loteInfo = lotesData?.find(l => l.id === ingresso.lote_id);
            lote = {
              id: ingresso.lote_id,
              nome: loteInfo?.nome || 'Lote sem nome',
              tipos: []
            };
            setor.lotes.push(lote);
          }
          
          lote.tipos.push(tipoObj);
        } else {
          setor.tiposSemLote.push(tipoObj);
        }
      });

      setSetoresPorSessao(setoresPorSessaoTemp);

      // BUSCA CUPONS COM DETALHAMENTO COMPLETO
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

      // Carregar produtos
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

  // Calcula totais de um setor (COM CORTESIAS)
  const calcularTotaisSetor = (setor) => {
    let vendidos = 0, cortesias = 0, bilheteria = 0;
    let totalCalculado = 0;

    setor.lotes.forEach(lote => {
      lote.tipos.forEach(tipo => {
        vendidos += tipo.vendidos;
        cortesias += tipo.cortesias;
        bilheteria += tipo.bilheteria;
        totalCalculado += tipo.quantidade;
      });
    });

    setor.tiposSemLote.forEach(tipo => {
      vendidos += tipo.vendidos;
      cortesias += tipo.cortesias;
      bilheteria += tipo.bilheteria;
      totalCalculado += tipo.quantidade;
    });

    const total = setor.capacidadeDefinida && setor.capacidadeDefinida > 0
      ? setor.capacidadeDefinida
      : totalCalculado;

    const ocupados = vendidos + cortesias;
    const disponiveis = Math.max(0, total - ocupados);
    const controladoPorSetor = setor.capacidadeDefinida && setor.capacidadeDefinida > 0;

    return { vendidos, cortesias, disponiveis, total, bilheteria, controladoPorSetor };
  };

  // Calcula totais de um lote (COM CORTESIAS)
  const calcularTotaisLote = (lote) => {
    let vendidos = 0, cortesias = 0, disponiveis = 0, total = 0, bilheteria = 0;

    lote.tipos.forEach(tipo => {
      vendidos += tipo.vendidos;
      cortesias += tipo.cortesias;
      disponiveis += tipo.disponiveis;
      total += tipo.quantidade;
      bilheteria += tipo.bilheteria;
    });

    return { vendidos, cortesias, disponiveis, total, bilheteria };
  };

  // Calcula totais de ingressos considerando TODAS as sessões (COM CORTESIAS)
  const calcularTotaisIngressos = () => {
    let totalDisponibilizado = 0, totalVendido = 0, totalCortesias = 0;

    Object.values(setoresPorSessao).forEach(setoresDetalhados => {
      setoresDetalhados.forEach(setor => {
        const totaisSetor = calcularTotaisSetor(setor);
        totalDisponibilizado += totaisSetor.total;
        totalVendido += totaisSetor.vendidos;
        totalCortesias += totaisSetor.cortesias;
      });
    });

    return {
      total: totalDisponibilizado,
      vendidos: totalVendido,
      cortesias: totalCortesias,
      disponiveis: Math.max(0, totalDisponibilizado - totalVendido - totalCortesias)
    };
  };

  // Calcula totais de uma sessão específica (COM CORTESIAS)
  const calcularTotaisSessao = (sessaoId) => {
    let totalDisponibilizado = 0, totalVendido = 0, totalCortesias = 0, totalBilheteria = 0;

    const setoresDetalhados = setoresPorSessao[sessaoId] || [];
    
    setoresDetalhados.forEach(setor => {
      const totaisSetor = calcularTotaisSetor(setor);
      totalDisponibilizado += totaisSetor.total;
      totalVendido += totaisSetor.vendidos;
      totalCortesias += totaisSetor.cortesias;
      totalBilheteria += totaisSetor.bilheteria;
    });

    return {
      total: totalDisponibilizado,
      vendidos: totalVendido,
      cortesias: totalCortesias,
      disponiveis: Math.max(0, totalDisponibilizado - totalVendido - totalCortesias),
      bilheteria: totalBilheteria
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

  // NOVA FUNÇÃO: Calcular estatísticas de vendas por forma de pagamento
  const calcularEstatisticasVendas = () => {
    const porFormaPagamento = {};
    const pedidosProcessados = new Set();
    let totalBruto = 0;
    let totalTaxasGateway = 0;
    let totalComCupom = 0;
    let totalSemCupom = 0;

    ingressosVendidos.forEach(ingresso => {
      if (ingresso.tipo_pagamento === 'cortesia') return; // Ignora cortesias

      const formaPagamento = ingresso.tipo_pagamento || 'pix';
      
      if (!porFormaPagamento[formaPagamento]) {
        porFormaPagamento[formaPagamento] = {
          quantidade: 0,
          valorBruto: 0,
          valorLiquido: 0,
          taxasGateway: 0,
          comCupom: 0,
          semCupom: 0
        };
      }

      porFormaPagamento[formaPagamento].quantidade += 1;
      const valor = parseFloat(ingresso.valor) || 0;
      totalBruto += valor;

      // Verifica se tem cupom
      if (ingresso.cupom_usado) {
        porFormaPagamento[formaPagamento].comCupom += 1;
        totalComCupom += 1;
      } else {
        porFormaPagamento[formaPagamento].semCupom += 1;
        totalSemCupom += 1;
      }

      // Calcula taxa por pedido (não por ingresso)
      if (!pedidosProcessados.has(ingresso.pedido_id)) {
        // Buscar todos os ingressos deste pedido
        const ingressosDoPedido = ingressosVendidos.filter(i => 
          i.pedido_id === ingresso.pedido_id && i.tipo_pagamento !== 'cortesia'
        );
        
        const valorTotalPedido = ingressosDoPedido.reduce((sum, i) => sum + (parseFloat(i.valor) || 0), 0);
        const taxa = calcularTaxaPagamento(valorTotalPedido, formaPagamento, ingresso.parcelas);
        
        porFormaPagamento[formaPagamento].taxasGateway += taxa;
        totalTaxasGateway += taxa;
        
        pedidosProcessados.add(ingresso.pedido_id);
      }

      porFormaPagamento[formaPagamento].valorBruto += valor;
    });

    // Calcula valor líquido
    Object.keys(porFormaPagamento).forEach(forma => {
      porFormaPagamento[forma].valorLiquido = 
        porFormaPagamento[forma].valorBruto - porFormaPagamento[forma].taxasGateway;
    });

    const totalLiquido = totalBruto - totalTaxasGateway;

    return {
      porFormaPagamento,
      totalBruto,
      totalTaxasGateway,
      totalLiquido,
      totalComCupom,
      totalSemCupom
    };
  };

  const calcularBonusGolden = () => {
    if (!evento) return 0;
    const taxaCliente = evento.TaxaCliente || 0;
    const stats = calcularEstatisticasVendas();
    
    let percentualBonus = 0;
    if (taxaCliente === 18.5) percentualBonus = 6.5;
    else if (taxaCliente === 15) percentualBonus = 5;
    else if (taxaCliente === 10) percentualBonus = 3;
    else if (taxaCliente === 8) percentualBonus = 0;
    else if (taxaCliente === 0) percentualBonus = 0;
    
    return stats.totalBruto * (percentualBonus / 100);
  };

  const getNomePlano = (taxa) => {
    if (taxa === 18.5) return 'Plano Premium (18.5% taxa, +6.5% bônus)';
    if (taxa === 15) return 'Plano Padrão (15% taxa, +5% bônus)';
    if (taxa === 10) return 'Plano Econômico (10% taxa, +3% bônus)';
    if (taxa === 8) return 'Plano Competitivo (8% taxa, sem bônus)';
    if (taxa === 0) return 'Absorção Total (0% cliente, -8% produtor)';
    return `Taxa de ${taxa}%`;
  };

  const getNomeFormaPagamento = (forma) => {
    if (forma === 'pix') return '📱 PIX';
    if (forma === 'boleto') return '📄 Boleto';
    if (forma === 'cartao_debito') return '💳 Débito';
    if (forma === 'cartao_credito') return '💳 Crédito';
    return forma;
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
  const statsVendas = calcularEstatisticasVendas();
  const bonusGolden = calcularBonusGolden();
  const totalReceber = statsVendas.totalLiquido + bonusGolden;
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

        {/* Cards de informações */}
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
                <strong>🎬 Sessões:</strong><br />
                <span style={{ 
                  padding: '5px 12px', 
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2'
                }}>
                  {sessoes.length} {sessoes.length === 1 ? 'sessão' : 'sessões'}
                </span>
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

        {/* Cards de totais gerais */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '15px', 
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
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f39c12' }}>
              {totaisIngressos.cortesias}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '5px' }}>
              Cortesias Emitidas
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
            {sessoes.length > 1 && (
              <div style={{ fontSize: '11px', color: '#999', marginTop: '3px' }}>
                ({sessoes.length} sessões)
              </div>
            )}
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
              Líquido + Bônus
            </div>
          </div>
        </div>

        {/* PAINEL DE ESTATÍSTICAS DE VENDAS */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0, marginBottom: '20px' }}>💰 Análise Financeira Detalhada</h2>
          
          {/* Resumo Geral */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '15px',
            marginBottom: '25px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2980b9' }}>R$ {statsVendas.totalBruto.toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Valor Bruto</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>- R$ {statsVendas.totalTaxasGateway.toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Taxas Gateway</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>R$ {statsVendas.totalLiquido.toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Valor Líquido</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9b59b6' }}>+ R$ {bonusGolden.toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Bônus Golden</div>
            </div>
          </div>

          {/* Por Forma de Pagamento */}
          <h3 style={{ color: '#5d34a4', fontSize: '18px', marginBottom: '15px' }}>📊 Vendas por Forma de Pagamento</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '15px',
            marginBottom: '25px'
          }}>
            {Object.entries(statsVendas.porFormaPagamento).map(([forma, stats]) => (
              <div key={forma} style={{
                padding: '20px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                backgroundColor: '#fff'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '15px', color: '#2c3e50' }}>
                  {getNomeFormaPagamento(forma)}
                </div>
                <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
                  <div>🎫 Quantidade: <strong>{stats.quantidade}</strong></div>
                  <div>💵 Valor Bruto: <strong style={{ color: '#2980b9' }}>R$ {stats.valorBruto.toFixed(2)}</strong></div>
                  <div>💸 Taxas Gateway: <strong style={{ color: '#e74c3c' }}>R$ {stats.taxasGateway.toFixed(2)}</strong></div>
                  <div>💰 Valor Líquido: <strong style={{ color: '#27ae60' }}>R$ {stats.valorLiquido.toFixed(2)}</strong></div>
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e0e0e0' }}>
                    <div>🎟️ Com Cupom: <strong>{stats.comCupom}</strong></div>
                    <div>🎫 Sem Cupom: <strong>{stats.semCupom}</strong></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo Cupons */}
          <div style={{
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffc107'
          }}>
            <strong>📋 Resumo de Cupons:</strong> {statsVendas.totalComCupom} ingressos vendidos com cupom | {statsVendas.totalSemCupom} sem cupom
          </div>
        </div>

        {!eventoPassado && (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px', 
            marginBottom: '25px' 
          }}>
            <Link 
              href={`/produtor/evento/${eventoId}/adicionar-ingressos`}
              style={{
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

            <Link 
              href={`/produtor/evento/${eventoId}/emitir-cortesias`}
              style={{
                backgroundColor: '#27ae60',
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
              🎁 Emitir Cortesias
            </Link>
          </div>
        )}

        {/* DETALHAMENTO DE INGRESSOS POR SESSÃO */}
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
              const setoresDetalhados = setoresPorSessao[sessao.id] || [];
              const totaisSessao = calcularTotaisSessao(sessao.id);
              
              return (
                <div key={sessaoIndex} style={{ 
                  marginBottom: '30px',
                  border: '3px solid #9b59b6',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: '#f9f7fb'
                }}>
                  {/* Cabeçalho da Sessão */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '20px',
                    paddingBottom: '15px',
                    borderBottom: '2px solid #9b59b6'
                  }}>
                    <h3 style={{ 
                      color: '#9b59b6', 
                      margin: 0,
                      fontSize: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      🎬 {sessao.numero ? `Sessão ${sessao.numero}` : 'Sessão Principal'}
                      {sessao.is_original && (
                        <span style={{ 
                          fontSize: '12px', 
                          padding: '4px 10px',
                          backgroundColor: '#f1c40f',
                          color: '#000',
                          borderRadius: '12px',
                          fontWeight: 'normal'
                        }}>
                          Original
                        </span>
                      )}
                    </h3>
                    <div style={{ textAlign: 'right', fontSize: '13px', color: '#666' }}>
                      📅 {new Date(sessao.data).toLocaleDateString('pt-BR')} às {sessao.hora}
                    </div>
                  </div>

                  {/* Totais da Sessão */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '10px',
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#e8d5f2',
                    borderRadius: '8px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>{totaisSessao.vendidos}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Vendidos</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f39c12' }}>{totaisSessao.cortesias}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Cortesias</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e67e22' }}>{totaisSessao.disponiveis}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Disponíveis</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>{totaisSessao.total}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Total</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#9b59b6' }}>R$ {totaisSessao.bilheteria.toFixed(2)}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Bilheteria</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>
                        R$ {(totaisSessao.bilheteria * (evento.TaxaCliente === 18.5 ? 0.065 : evento.TaxaCliente === 15 ? 0.05 : evento.TaxaCliente === 10 ? 0.03 : 0)).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Bônus Golden</div>
                    </div>
                  </div>

                  {/* Setores da Sessão */}
                  {setoresDetalhados.length === 0 ? (
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
                    setoresDetalhados.map((setor, setorIndex) => {
                      const totaisSetor = calcularTotaisSetor(setor);
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
                                fontSize: '12px', 
                                marginLeft: '10px',
                                padding: '4px 10px',
                                backgroundColor: '#e8f4f8',
                                color: '#2196f3',
                                borderRadius: '12px',
                                fontWeight: 'normal'
                              }}>
                                📊 Controlado por Setor
                              </span>
                            )}
                          </h4>

                          {/* TOTAIS DO SETOR */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: controladoPorSetor ? 'repeat(6, 1fr)' : 'repeat(4, 1fr)',
                            gap: '10px',
                            marginBottom: '20px',
                            padding: '15px',
                            backgroundColor: '#e8f4f8',
                            borderRadius: '8px'
                          }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#27ae60' }}>{totaisSetor.vendidos}</div>
                              <div style={{ fontSize: '11px', color: '#666' }}>Vendidos</div>
                            </div>
                            
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f39c12' }}>{totaisSetor.cortesias}</div>
                              <div style={{ fontSize: '11px', color: '#666' }}>Cortesias</div>
                            </div>
                            
                            {controladoPorSetor && (
                              <>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e67e22' }}>{totaisSetor.disponiveis}</div>
                                  <div style={{ fontSize: '11px', color: '#666' }}>Disponíveis</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3498db' }}>{totaisSetor.total}</div>
                                  <div style={{ fontSize: '11px', color: '#666' }}>Total</div>
                                </div>
                              </>
                            )}
                            
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#9b59b6' }}>R$ {totaisSetor.bilheteria.toFixed(2)}</div>
                              <div style={{ fontSize: '11px', color: '#666' }}>Bilheteria</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#27ae60' }}>
                                R$ {(totaisSetor.bilheteria * (evento.TaxaCliente === 18.5 ? 0.065 : evento.TaxaCliente === 15 ? 0.05 : evento.TaxaCliente === 10 ? 0.03 : 0)).toFixed(2)}
                              </div>
                              <div style={{ fontSize: '11px', color: '#666' }}>Bônus Golden</div>
                            </div>
                          </div>

                          {/* Lotes dentro do setor */}
                          {setor.lotes.map((lote, loteIndex) => {
                            const totaisLote = calcularTotaisLote(lote);
                            
                            return (
                              <div key={loteIndex} style={{ 
                                marginBottom: '20px',
                                backgroundColor: '#f8f9fa',
                                padding: '15px',
                                borderRadius: '8px',
                                border: '1px solid #d0d0d0'
                              }}>
                                <h5 style={{ 
                                  color: '#2980b9', 
                                  margin: '0 0 12px 0',
                                  fontSize: '16px'
                                }}>
                                  📦 {lote.nome}
                                </h5>

                                {/* TOTAIS DO LOTE */}
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: controladoPorSetor ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)',
                                  gap: '8px',
                                  marginBottom: '15px',
                                  padding: '12px',
                                  backgroundColor: '#f0f8ff',
                                  borderRadius: '6px'
                                }}>
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>{totaisLote.vendidos}</div>
                                    <div style={{ fontSize: '10px', color: '#666' }}>Vendidos</div>
                                  </div>
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f39c12' }}>{totaisLote.cortesias}</div>
                                    <div style={{ fontSize: '10px', color: '#666' }}>Cortesias</div>
                                  </div>
                                  {!controladoPorSetor && (
                                    <>
                                      <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e67e22' }}>{totaisLote.disponiveis}</div>
                                        <div style={{ fontSize: '10px', color: '#666' }}>Disponíveis</div>
                                      </div>
                                      <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3498db' }}>{totaisLote.total}</div>
                                        <div style={{ fontSize: '10px', color: '#666' }}>Total</div>
                                      </div>
                                    </>
                                  )}
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#9b59b6' }}>R$ {totaisLote.bilheteria.toFixed(2)}</div>
                                    <div style={{ fontSize: '10px', color: '#666' }}>Bilheteria</div>
                                  </div>
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#27ae60' }}>
                                      R$ {(totaisLote.bilheteria * (evento.TaxaCliente === 18.5 ? 0.065 : evento.TaxaCliente === 15 ? 0.05 : evento.TaxaCliente === 10 ? 0.03 : 0)).toFixed(2)}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#666' }}>Bônus Golden</div>
                                  </div>
                                </div>

                                <div style={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                                  gap: '12px' 
                                }}>
                                  {lote.tipos.map((tipo, tipoIndex) => (
                                    <div key={tipoIndex} style={{ 
                                      backgroundColor: 'white',
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
                                        <div>🎁 Cortesias: <strong style={{ color: '#f39c12' }}>{tipo.cortesias}</strong></div>
                                        {!controladoPorSetor && (
                                          <>
                                            <div>📊 Disponíveis: <strong style={{ color: '#e67e22' }}>{tipo.disponiveis}</strong></div>
                                            <div>📈 Total: <strong style={{ color: '#3498db' }}>{tipo.quantidade}</strong></div>
                                          </>
                                        )}
                                        <div>💵 Bilheteria: <strong style={{ color: '#9b59b6' }}>R$ {tipo.bilheteria.toFixed(2)}</strong></div>
                                        <div>💎 Bônus Golden: <strong style={{ color: '#27ae60' }}>R$ {(tipo.bilheteria * (evento.TaxaCliente === 18.5 ? 0.065 : evento.TaxaCliente === 15 ? 0.05 : evento.TaxaCliente === 10 ? 0.03 : 0)).toFixed(2)}</strong></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}

                          {/* Tipos sem lote */}
                          {setor.tiposSemLote.length > 0 && (
                            <div style={{ 
                              backgroundColor: '#f8f9fa',
                              padding: '15px',
                              borderRadius: '8px',
                              border: '1px solid #d0d0d0'
                            }}>
                              <h5 style={{ 
                                color: '#16a085', 
                                margin: '0 0 12px 0',
                                fontSize: '16px'
                              }}>
                                🎟️ Ingressos do Setor
                              </h5>

                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                                gap: '12px' 
                              }}>
                                {setor.tiposSemLote.map((tipo, tipoIndex) => (
                                  <div key={tipoIndex} style={{ 
                                    backgroundColor: 'white',
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
                                      <div>🎁 Cortesias: <strong style={{ color: '#f39c12' }}>{tipo.cortesias}</strong></div>
                                      {!controladoPorSetor && (
                                        <>
                                          <div>📊 Disponíveis: <strong style={{ color: '#e67e22' }}>{tipo.disponiveis}</strong></div>
                                          <div>📈 Total: <strong style={{ color: '#3498db' }}>{tipo.quantidade}</strong></div>
                                        </>
                                      )}
                                      <div>💵 Bilheteria: <strong style={{ color: '#9b59b6' }}>R$ {tipo.bilheteria.toFixed(2)}</strong></div>
                                      <div>💎 Bônus Golden: <strong style={{ color: '#27ae60' }}>R$ {(tipo.bilheteria * (evento.TaxaCliente === 18.5 ? 0.065 : evento.TaxaCliente === 15 ? 0.05 : evento.TaxaCliente === 10 ? 0.03 : 0)).toFixed(2)}</strong></div>
                                    </div>
                                  </div>
                                ))}
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

        {/* PAINEL DE VISUALIZAÇÕES */}
        <VisualizacoesEvento eventoId={eventoId} />

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
