'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MapaAssentos from '../../../components/MapaAssentos';
import { getTeatroConfig } from '../../../utils/teatros-config';

export default function EventoPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [evento, setEvento] = useState(null);
  const [sessoes, setSessoes] = useState([]);
  const [sessaoSelecionada, setSessaoSelecionada] = useState(null);
  const [ingressosPorSessao, setIngressosPorSessao] = useState({});
  const [produtos, setProdutos] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [imagensDescricao, setImagensDescricao] = useState([]);
  const [codigoCupom, setCodigoCupom] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState(null);
  const [mensagemCupom, setMensagemCupom] = useState('');
  const [carrinho, setCarrinho] = useState({});

  // Estados específicos para lugar marcado
  const [assentosSelecionados, setAssentosSelecionados] = useState([]);
  const [setorSelecionadoMapa, setSetorSelecionadoMapa] = useState(null);
  const [etapaAtual, setEtapaAtual] = useState('inicial');
  const [tiposIngressoPorAssento, setTiposIngressoPorAssento] = useState({});

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const { data: eventoData, error: eventoError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', id)
        .single();

      if (eventoError || !eventoData) {
        console.error('Evento não encontrado');
        return;
      }

      setEvento(eventoData);

      const { data: sessoesData } = await supabase
        .from('sessoes')
        .select('*')
        .eq('evento_id', id)
        .order('numero', { ascending: true });

      setSessoes(sessoesData || []);
      
      if (sessoesData && sessoesData.length > 0) {
        setSessaoSelecionada(sessoesData[0].id);
      }

      const { data: todosIngressos } = await supabase
        .from('ingressos')
        .select('*')
        .eq('evento_id', id);

      const { data: setoresData } = await supabase
        .from('setores')
        .select('*')
        .eq('eventos_id', id);

      const { data: lotesData } = await supabase
        .from('lotes')
        .select('*')
        .eq('evento_id', id);

      const ingressosProcessados = (todosIngressos || []).map(ingresso => {
        let quantidadeDisponivel = 0;
        let origem = '';

        if (ingresso.quantidade && parseInt(ingresso.quantidade) > 0) {
          const qtdTotal = parseInt(ingresso.quantidade) || 0;
          const qtdVendida = parseInt(ingresso.vendidos) || 0;
          quantidadeDisponivel = qtdTotal - qtdVendida;
          origem = 'INGRESSO';
        }
        else if (ingresso.lote_id) {
          const lote = lotesData?.find(l => l.id === ingresso.lote_id);
          if (lote && lote.quantidade_total && parseInt(lote.quantidade_total) > 0) {
            const qtdTotal = parseInt(lote.quantidade_total) || 0;
            const qtdVendida = parseInt(lote.quantidade_vendida) || 0;
            quantidadeDisponivel = qtdTotal - qtdVendida;
            origem = `LOTE ${ingresso.lote_id}`;
          }
        }
        
        if (quantidadeDisponivel === 0 || origem === '') {
          const setor = setoresData?.find(s => 
            s.nome === ingresso.setor && s.sessao_id === ingresso.sessao_id
          );
          
          if (setor && (setor.capacidade_definida || setor.capacidade_calculada)) {
            const qtdTotal = parseInt(setor.capacidade_definida) || parseInt(setor.capacidade_calculada) || 0;
            const ingressosDoSetor = (todosIngressos || []).filter(i => 
              i.setor === ingresso.setor && 
              i.sessao_id === ingresso.sessao_id &&
              (!i.quantidade || parseInt(i.quantidade) === 0) &&
              (!i.lote_id || !lotesData?.find(l => l.id === i.lote_id && l.quantidade_total > 0))
            );
            const qtdVendida = ingressosDoSetor.reduce((sum, i) => sum + (parseInt(i.vendidos) || 0), 0);
            
            quantidadeDisponivel = qtdTotal - qtdVendida;
            origem = `SETOR ${ingresso.setor}`;
          }
        }

        return {
          ...ingresso,
          quantidade_disponivel_calculada: Math.max(0, quantidadeDisponivel),
          origem_quantidade: origem
        };
      });

      const ingressosPorSessaoTemp = {};
      (sessoesData || []).forEach(sessao => {
        ingressosPorSessaoTemp[sessao.id] = [];
      });

      ingressosProcessados.forEach(ingresso => {
        if (ingressosPorSessaoTemp[ingresso.sessao_id]) {
          ingressosPorSessaoTemp[ingresso.sessao_id].push(ingresso);
        }
      });

      setIngressosPorSessao(ingressosPorSessaoTemp);

      const { data: cuponsData } = await supabase
        .from('cupons')
        .select('*')
        .eq('evento_id', id)
        .eq('ativo', true);

      setCupons(cuponsData || []);

      const { data: produtosData } = await supabase
        .from('produtos')
        .select('*')
        .eq('evento_id', id)
        .eq('ativo', true)
        .order('id', { ascending: true });

      setProdutos(produtosData || []);

      const { data: imagensData } = await supabase
        .from('eventos_imagens_descricao')
        .select('*')
        .eq('evento_id', id)
        .order('ordem', { ascending: true});

      setImagensDescricao(imagensData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarCupom = async () => {
    if (!codigoCupom.trim()) {
      setMensagemCupom('❌ Digite um código de cupom');
      return;
    }

    const cupomEncontrado = cupons.find(c => 
      c.codigo.toUpperCase() === codigoCupom.toUpperCase().trim()
    );

    if (!cupomEncontrado) {
      setMensagemCupom('❌ Cupom inválido');
      setCupomAplicado(null);
      return;
    }

    const hoje = new Date();
    if (cupomEncontrado.data_validade_inicio) {
      const inicio = new Date(cupomEncontrado.data_validade_inicio);
      if (hoje < inicio) {
        setMensagemCupom('❌ Este cupom ainda não está válido');
        setCupomAplicado(null);
        return;
      }
    }

    if (cupomEncontrado.data_validade_fim) {
      const fim = new Date(cupomEncontrado.data_validade_fim);
      if (hoje > fim) {
        setMensagemCupom('❌ Este cupom expirou');
        setCupomAplicado(null);
        return;
      }
    }

    if (cupomEncontrado.quantidade_total && cupomEncontrado.quantidade_usada >= cupomEncontrado.quantidade_total) {
      setMensagemCupom('❌ Este cupom atingiu o limite de usos');
      setCupomAplicado(null);
      return;
    }

    setCupomAplicado(cupomEncontrado);
    setMensagemCupom(`✅ Cupom "${cupomEncontrado.codigo}" aplicado com sucesso!`);
  };

  const removerCupom = () => {
    setCupomAplicado(null);
    setCodigoCupom('');
    setMensagemCupom('');
  };

  const calcularPrecoComCupom = (precoOriginal) => {
    if (!cupomAplicado) return precoOriginal;

    if (cupomAplicado.tipo_desconto === 'percentual') {
      const desconto = precoOriginal * (cupomAplicado.valor_desconto / 100);
      return precoOriginal - desconto;
    } else {
      return Math.max(0, precoOriginal - cupomAplicado.valor_desconto);
    }
  };

  const atualizarCarrinho = (ingressoId, quantidade) => {
    setCarrinho(prev => {
      const novo = { ...prev };
      if (quantidade > 0) {
        novo[ingressoId] = quantidade;
      } else {
        delete novo[ingressoId];
      }
      return novo;
    });
  };

  const calcularTotalCarrinho = () => {
    const ingressosDaSessao = ingressosPorSessao[sessaoSelecionada] || [];
    let total = 0;
    
    Object.entries(carrinho).forEach(([ingressoId, quantidade]) => {
      const ingresso = ingressosDaSessao.find(i => i.id === ingressoId);
      if (ingresso) {
        const precoBase = parseFloat(ingresso.valor);
        const precoComCupom = calcularPrecoComCupom(precoBase);
        const taxaCliente = evento?.TaxaCliente || 15;
        const valorComTaxa = precoComCupom * (1 + taxaCliente / 100);
        total += valorComTaxa * quantidade;
      }
    });
    
    return total;
  };

  const finalizarCompra = () => {
    const itens = Object.entries(carrinho).map(([ingressoId, quantidade]) => ({
      ingressoId,
      quantidade
    }));

    const params = new URLSearchParams({
      evento_id: evento.id,
      sessao_id: sessaoSelecionada,
      itens: JSON.stringify(itens)
    });

    if (cupomAplicado) {
      params.append('cupom_id', cupomAplicado.id);
    }

    router.push(`/checkout?${params.toString()}`);
  };

  const iniciarFluxoLugarMarcado = () => {
    if (sessoes.length > 1) {
      setEtapaAtual('escolher_sessao');
    } else {
      setEtapaAtual('escolher_setor');
    }
  };

  const selecionarSessaoMapa = (sessaoId) => {
    setSessaoSelecionada(sessaoId);
    setEtapaAtual('escolher_setor');
    setAssentosSelecionados([]);
    setSetorSelecionadoMapa(null);
    setTiposIngressoPorAssento({});
  };

  const escolherSetorMapa = (setor) => {
    setSetorSelecionadoMapa(setor);
    setEtapaAtual('selecionar_assentos');
    setAssentosSelecionados([]);
    setTiposIngressoPorAssento({});
  };

  const toggleAssentoSelecionado = (assento) => {
    setAssentosSelecionados(prev => {
      const jaExiste = prev.find(a => 
        a.setor === assento.setor && a.fileira === assento.fileira && a.numero === assento.numero
      );
      
      if (jaExiste) {
        const novosAssentos = prev.filter(a => 
          !(a.setor === assento.setor && a.fileira === assento.fileira && a.numero === assento.numero)
        );
        const key = `${assento.setor}-${assento.fileira}-${assento.numero}`;
        setTiposIngressoPorAssento(tipos => {
          const novos = { ...tipos };
          delete novos[key];
          return novos;
        });
        return novosAssentos;
      } else {
        return [...prev, assento];
      }
    });
  };

  const definirTipoIngressoAssento = (assento, tipoIngressoId) => {
    const key = `${assento.setor}-${assento.fileira}-${assento.numero}`;
    setTiposIngressoPorAssento(prev => ({
      ...prev,
      [key]: tipoIngressoId
    }));
  };

  const finalizarCompraLugarMarcado = () => {
    const itens = assentosSelecionados.map(assento => {
      const key = `${assento.setor}-${assento.fileira}-${assento.numero}`;
      return {
        assento: `${assento.fileira}${assento.numero}`,
        setor: assento.setor,
        ingressoId: tiposIngressoPorAssento[key]
      };
    });

    const params = new URLSearchParams({
      evento_id: evento.id,
      sessao_id: sessaoSelecionada,
      lugar_marcado: 'true',
      itens: JSON.stringify(itens)
    });

    if (cupomAplicado) {
      params.append('cupom_id', cupomAplicado.id);
    }

    router.push(`/checkout?${params.toString()}`);
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando...</h2>
      </div>
    );
  }

  if (!evento) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>⚠️ Evento não encontrado</h2>
        <Link href="/">
          <button style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}>
            Voltar para Home
          </button>
        </Link>
      </div>
    );
  }

  const ingressosDaSessao = ingressosPorSessao[sessaoSelecionada] || [];
  const teatroConfig = evento.tem_lugar_marcado && evento.id_evento ? getTeatroConfig(evento.id_evento) : null;
  const temLugarMarcadoSemMapa = evento.tem_lugar_marcado && !evento.id_evento;

  const setoresOrganizados = {};
  ingressosDaSessao.forEach(ingresso => {
    const setorNome = ingresso.setor || 'Sem Setor';
    
    if (!setoresOrganizados[setorNome]) {
      setoresOrganizados[setorNome] = {
        lotes: {},
        semLote: []
      };
    }

    if (ingresso.lote_id) {
      const loteKey = `lote_${ingresso.lote_id}`;
      if (!setoresOrganizados[setorNome].lotes[loteKey]) {
        setoresOrganizados[setorNome].lotes[loteKey] = {
          id: ingresso.lote_id,
          ingressos: []
        };
      }
      setoresOrganizados[setorNome].lotes[loteKey].ingressos.push(ingresso);
    } else {
      setoresOrganizados[setorNome].semLote.push(ingresso);
    }
  });

  const precoMaisBaixo = ingressosDaSessao.length > 0
    ? Math.min(...ingressosDaSessao.map(i => {
        const precoBase = parseFloat(i.valor);
        const precoComCupom = calcularPrecoComCupom(precoBase);
        const taxaCliente = evento.TaxaCliente || 15;
        return precoComCupom * (1 + taxaCliente / 100);
      }))
    : 0;

  const totalItensCarrinho = Object.values(carrinho).reduce((sum, qtd) => sum + qtd, 0);
  const setoresDisponiveis = [...new Set(ingressosDaSessao.map(i => i.setor))].filter(Boolean);

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', paddingBottom: '40px' }}>
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '15px 30px', marginBottom: '0' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>
          &larr; Voltar para Home
        </Link>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <img 
            src={evento.imagem_url || 'https://placehold.co/1200x500/5d34a4/ffffff?text=EVENTO'} 
            alt={evento.nome}
            style={{ 
              width: '100%', 
              maxWidth: '1200px',
              height: '400px',
              objectFit: 'cover',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}
          />
        </div>

        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '42px', 
          color: '#2c3e50', 
          marginTop: '30px',
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          {evento.nome}
        </h1>

        <div style={{ 
          textAlign: 'center', 
          fontSize: '20px', 
          color: '#5d34a4',
          fontWeight: '600',
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          flexWrap: 'wrap'
        }}>
          <span>📅 {new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
          <span>🕐 {evento.hora}</span>
          {sessoes.length > 1 && <span>🎬 {sessoes.length} sessões disponíveis</span>}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '30px',
          marginBottom: '40px'
        }}>
          
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#5d34a4', marginTop: 0, fontSize: '28px', marginBottom: '20px' }}>
              📋 Sobre o Evento
            </h2>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#555', whiteSpace: 'pre-wrap' }}>
              {evento.descricao || 'Descrição não disponível.'}
            </p>

            {imagensDescricao.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                {imagensDescricao.map((img, index) => (
                  <div key={index} style={{ marginBottom: '30px' }}>
                    {img.texto_antes && (
                      <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#555', marginBottom: '15px', whiteSpace: 'pre-wrap' }}>
                        {img.texto_antes}
                      </p>
                    )}
                    <img 
                      src={img.imagem_url} 
                      alt={`Imagem ${index + 1}`}
                      style={{ 
                        width: '100%', 
                        maxHeight: '500px', 
                        objectFit: 'contain',
                        borderRadius: '8px',
                        marginBottom: '15px'
                      }}
                    />
                    {img.texto_depois && (
                      <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#555', whiteSpace: 'pre-wrap' }}>
                        {img.texto_depois}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '25px' }}>
              <span style={{ 
                backgroundColor: '#e8f4f8', 
                color: '#2980b9', 
                padding: '8px 16px', 
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'inline-block'
              }}>
                🎭 {evento.categoria}
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#5d34a4', marginTop: 0, fontSize: '22px', marginBottom: '20px' }}>
              📍 Local
            </h3>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '8px' }}>
              {evento.local || 'A definir'}
            </p>
            {evento.cidade && (
              <p style={{ fontSize: '15px', color: '#666', marginBottom: '8px' }}>
                📍 {evento.cidade}
              </p>
            )}
            {evento.endereco && (
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                {evento.endereco}
              </p>
            )}

            <div style={{ marginTop: '25px', paddingTop: '25px', borderTop: '1px solid #eee' }}>
              <p style={{ margin: '10px 0', color: '#555' }}>
                {evento.tem_lugar_marcado ? '🪑 Evento com lugar marcado' : '🎫 Entrada livre (sem lugar marcado)'}
              </p>
            </div>

            {evento.mostrar_produtor && evento.produtor_nome && (
              <div style={{ marginTop: '25px', paddingTop: '25px', borderTop: '1px solid #eee' }}>
                <h4 style={{ color: '#5d34a4', fontSize: '16px', marginBottom: '10px' }}>
                  Produtor
                </h4>
                <p style={{ margin: '5px 0', color: '#555', fontSize: '14px' }}>
                  <strong>{evento.produtor_nome}</strong>
                </p>
                {evento.produtor_email && (
                  <p style={{ margin: '5px 0', color: '#666', fontSize: '13px' }}>
                    📧 {evento.produtor_email}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {cupons.length > 0 && (
          <div style={{ 
            backgroundColor: cupomAplicado ? '#d4edda' : '#fff3cd', 
            padding: '25px', 
            borderRadius: '12px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
            marginBottom: '40px',
            border: cupomAplicado ? '2px solid #28a745' : '2px solid #ffc107'
          }}>
            <h3 style={{ color: cupomAplicado ? '#155724' : '#856404', marginTop: 0, fontSize: '22px', marginBottom: '15px', textAlign: 'center' }}>
              {cupomAplicado ? '✅ Cupom Aplicado!' : '🎟️ Tem um cupom de desconto?'}
            </h3>
            
            {cupomAplicado ? (
              <div>
                <p style={{ textAlign: 'center', color: '#155724', marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>
                  Cupom: {cupomAplicado.codigo} - {cupomAplicado.tipo_desconto === 'percentual' ? `${cupomAplicado.valor_desconto}% OFF` : `R$ ${cupomAplicado.valor_desconto} OFF`}
                </p>
                {cupomAplicado.descricao && (
                  <p style={{ textAlign: 'center', color: '#155724', marginBottom: '15px', fontSize: '14px' }}>
                    {cupomAplicado.descricao}
                  </p>
                )}
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={removerCupom}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '10px 25px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Remover Cupom
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p style={{ textAlign: 'center', color: '#856404', marginBottom: '20px', fontSize: '14px' }}>
                  Digite seu código de cupom para ganhar desconto nos ingressos!
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '10px',
                  maxWidth: '500px',
                  margin: '0 auto',
                  marginBottom: '15px'
                }}>
                  <input
                    type="text"
                    placeholder="Digite o código do cupom"
                    value={codigoCupom}
                    onChange={(e) => setCodigoCupom(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && aplicarCupom()}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      border: '2px solid #ffc107',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      backgroundColor: 'white'
                    }}
                  />
                  <button
                    onClick={aplicarCupom}
                    style={{
                      backgroundColor: '#f39c12',
                      color: 'white',
                      border: 'none',
                      padding: '12px 30px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    Aplicar
                  </button>
                </div>
                {mensagemCupom && (
                  <p style={{ 
                    textAlign: 'center', 
                    color: mensagemCupom.includes('✅') ? '#155724' : '#721c24',
                    marginTop: '10px', 
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {mensagemCupom}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {temLugarMarcadoSemMapa && (
          <div style={{ 
            backgroundColor: '#fff3cd', 
            padding: '30px', 
            borderRadius: '12px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
            marginBottom: '40px',
            border: '2px solid #ffc107',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#856404', marginTop: 0, fontSize: '24px', marginBottom: '15px' }}>
              ⚠️ Mapa de Assentos em Preparação
            </h3>
            <p style={{ fontSize: '16px', color: '#856404', marginBottom: '10px' }}>
              Este evento terá lugares marcados no <strong>{evento.nome_teatro_personalizado || evento.local}</strong>.
            </p>
            <p style={{ fontSize: '14px', color: '#856404' }}>
              O mapa interativo de assentos estará disponível em breve. Por enquanto, você pode comprar ingressos por quantidade abaixo.
            </p>
          </div>
        )}

        {evento.tem_lugar_marcado && teatroConfig ? (
<div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
<h2 style={{ color: '#5d34a4', marginTop: 0, fontSize: '32px', marginBottom: '10px', textAlign: 'center' }}>
🪑 Ingressos
</h2>
<p style={{ textAlign: 'center', color: '#666', fontSize: '16px', marginBottom: '30px' }}>
A partir de <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
R$ {precoMaisBaixo.toFixed(2)}
</span>
{cupomAplicado && <span style={{ color: '#28a745', marginLeft: '10px' }}>✅ Com desconto aplicado!</span>}
</p>
{etapaAtual === 'inicial' && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={iniciarFluxoLugarMarcado}
              style={{
                padding: '25px 80px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.backgroundColor = '#229954';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = '#27ae60';
              }}
            >
              🎫 Comprar Ingressos
            </button>
          </div>
        )}

        {etapaAtual === 'escolher_sessao' && sessoes.length > 1 && (
          <div>
            <h3 style={{ color: '#5d34a4', fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>
              Passo 1: Escolha a Sessão
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {sessoes.map(sessao => (
                <button
                  key={sessao.id}
                  onClick={() => selecionarSessaoMapa(sessao.id)}
                  style={{
                    padding: '20px',
                    border: '2px solid #5d34a4',
                    borderRadius: '10px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#5d34a4'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f0e6ff'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <div style={{ fontSize: '18px', marginBottom: '8px' }}>
                    🎬 Sessão {sessao.numero}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    📅 {new Date(sessao.data).toLocaleDateString('pt-BR')}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    🕐 {sessao.hora}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {etapaAtual === 'escolher_setor' && (
          <div>
            <h3 style={{ color: '#5d34a4', fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>
              {sessoes.length > 1 ? 'Passo 2: Escolha o Setor' : 'Passo 1: Escolha o Setor'}
            </h3>
            {sessoes.length > 1 && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                  onClick={() => setEtapaAtual('escolher_sessao')}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ← Voltar às Sessões
                </button>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {setoresDisponiveis.map(setor => (
                <button
                  key={setor}
                  onClick={() => escolherSetorMapa(setor)}
                  style={{
                    padding: '30px',
                    border: '2px solid #5d34a4',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#5d34a4',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f0e6ff'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  🎪 {setor}
                </button>
              ))}
            </div>
          </div>
        )}

        {etapaAtual === 'selecionar_assentos' && (
          <div>
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
              <h3 style={{ color: '#5d34a4', fontSize: '24px', marginBottom: '10px' }}>
                {sessoes.length > 1 ? 'Passo 3: Selecione os Assentos no Mapa' : 'Passo 2: Selecione os Assentos no Mapa'}
              </h3>
              <p style={{ color: '#666', fontSize: '16px' }}>
                Setor: <strong>{setorSelecionadoMapa}</strong> | 
                Assentos selecionados: <strong>{assentosSelecionados.length}</strong>
              </p>
              <button
                onClick={() => {
                  setEtapaAtual('escolher_setor');
                  setSetorSelecionadoMapa(null);
                  setAssentosSelecionados([]);
                }}
                style={{
                  marginTop: '10px',
                  padding: '10px 20px',
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ← Voltar aos Setores
              </button>
            </div>

            <MapaAssentos 
              eventoId={evento.id}
              teatroConfig={teatroConfig}
              sessaoId={sessaoSelecionada}
              setorFiltro={setorSelecionadoMapa}
              assentosSelecionados={assentosSelecionados}
              onToggleAssento={toggleAssentoSelecionado}
            />

            {assentosSelecionados.length > 0 && (
              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button
                  onClick={() => setEtapaAtual('escolher_ingressos')}
                  style={{
                    padding: '18px 60px',
                    backgroundColor: '#f1c40f',
                    color: '#000',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(241, 196, 15, 0.3)'
                  }}
                >
                  Continuar com {assentosSelecionados.length} {assentosSelecionados.length === 1 ? 'assento' : 'assentos'} →
                </button>
              </div>
            )}
          </div>
        )}

        {etapaAtual === 'escolher_ingressos' && (
          <div>
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
              <h3 style={{ color: '#5d34a4', fontSize: '24px', marginBottom: '10px' }}>
                {sessoes.length > 1 ? 'Passo 4: Escolha o Tipo de Ingresso' : 'Passo 3: Escolha o Tipo de Ingresso'}
              </h3>
              <button
                onClick={() => setEtapaAtual('selecionar_assentos')}
                style={{
                  marginTop: '10px',
                  padding: '10px 20px',
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ← Voltar ao Mapa
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {assentosSelecionados.map((assento) => {
                const key = `${assento.setor}-${assento.fileira}-${assento.numero}`;
                const tipoSelecionado = tiposIngressoPorAssento[key];
                const ingressosDoSetor = ingressosDaSessao.filter(i => i.setor === assento.setor);

                return (
                  <div key={key} style={{ 
                    padding: '25px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '10px',
                    border: tipoSelecionado ? '2px solid #27ae60' : '2px solid #ddd'
                  }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#2c3e50' }}>
                      🪑 Assento {assento.fileira}{assento.numero} - {assento.setor}
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                      {ingressosDoSetor.map(ingresso => {
                        const precoBase = parseFloat(ingresso.valor);
                        const precoComCupom = calcularPrecoComCupom(precoBase);
                        const temDesconto = precoComCupom < precoBase;
                        const taxaCliente = evento.TaxaCliente || 15;
                        const valorTaxa = precoComCupom * (taxaCliente / 100);
                        const valorTotal = precoComCupom + valorTaxa;
                        const estaSelecionado = tipoSelecionado === ingresso.id;

                        return (
                          <button
                            key={ingresso.id}
                            onClick={() => definirTipoIngressoAssento(assento, ingresso.id)}
                            style={{
                              padding: '20px',
                              border: estaSelecionado ? '3px solid #27ae60' : '2px solid #ddd',
                              borderRadius: '10px',
                              backgroundColor: estaSelecionado ? '#d4edda' : 'white',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.3s'
                            }}
                          >
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '8px' }}>
                              {ingresso.tipo}
                              {temDesconto && <span style={{ color: '#28a745', fontSize: '12px', marginLeft: '8px' }}>🎟️ DESCONTO</span>}
                            </div>
                            {temDesconto && (
                              <div style={{ fontSize: '13px', color: '#999', textDecoration: 'line-through', marginBottom: '5px' }}>
                                R$ {precoBase.toFixed(2)}
                              </div>
                            )}
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                              R$ {precoComCupom.toFixed(2)} + R$ {valorTaxa.toFixed(2)} (taxa)
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: temDesconto ? '#28a745' : '#27ae60' }}>
                              R$ {valorTotal.toFixed(2)}
                            </div>
                            {estaSelecionado && (
                              <div style={{ marginTop: '10px', color: '#27ae60', fontSize: '14px', fontWeight: 'bold' }}>
                                ✅ Selecionado
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {assentosSelecionados.length > 0 && 
             assentosSelecionados.every(a => {
               const key = `${a.setor}-${a.fileira}-${a.numero}`;
               return tiposIngressoPorAssento[key];
             }) && (
              <div style={{ 
                marginTop: '30px', 
                padding: '25px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '12px',
                border: '3px solid #5d34a4'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#5d34a4', fontSize: '24px' }}>
                      🛒 Resumo da Compra
                    </h3>
                    <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                      {assentosSelecionados.length} {assentosSelecionados.length === 1 ? 'assento selecionado' : 'assentos selecionados'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', color: '#666', marginBottom: '5px' }}>
                      Total:
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#27ae60' }}>
                      R$ {assentosSelecionados.reduce((total, assento) => {
                        const key = `${assento.setor}-${assento.fileira}-${assento.numero}`;
                        const ingressoId = tiposIngressoPorAssento[key];
                        if (!ingressoId) return total;
                        
                        const ingresso = ingressosDaSessao.find(i => i.id === ingressoId);
                        if (!ingresso) return total;
                        
                        const precoBase = parseFloat(ingresso.valor);
                        const precoComCupom = calcularPrecoComCupom(precoBase);
                        const taxaCliente = evento.TaxaCliente || 15;
                        const valorTotal = precoComCupom * (1 + taxaCliente / 100);
                        return total + valorTotal;
                      }, 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={finalizarCompraLugarMarcado}
                  style={{
                    width: '100%',
                    backgroundColor: '#f1c40f',
                    color: '#000',
                    border: 'none',
                    padding: '18px',
                    borderRadius: '10px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 10px rgba(241, 196, 15, 0.3)'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                  🎫 Finalizar Compra
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          backgroundColor: '#e8f8f5', 
          borderRadius: '8px',
          border: '1px solid #27ae60'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
              <div style={{ fontSize: '14px', color: '#27ae60', fontWeight: '600' }}>Entrada garantida</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔒</div>
              <div style={{ fontSize: '14px', color: '#27ae60', fontWeight: '600' }}>Pagamento seguro</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>💬</div>
              <div style={{ fontSize: '14px', color: '#27ae60', fontWeight: '600' }}>Suporte 24h</div>
            </div>
          </div>
        </div>
      </div>
    ) : !evento.tem_lugar_marcado || temLugarMarcadoSemMapa ? (
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
        <h2 style={{ color: '#5d34a4', marginTop: 0, fontSize: '32px', marginBottom: '10px', textAlign: 'center' }}>
          🎫 Ingressos
        </h2>
        <p style={{ textAlign: 'center', color: '#666', fontSize: '16px', marginBottom: '30px' }}>
          A partir de <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
            R$ {precoMaisBaixo.toFixed(2)}
          </span>
          {cupomAplicado && <span style={{ color: '#28a745', marginLeft: '10px' }}>✅ Com desconto aplicado!</span>}
        </p>

        {sessoes.length > 1 && (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '25px', 
            borderRadius: '12px', 
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#5d34a4', marginTop: 0, fontSize: '22px', marginBottom: '20px', textAlign: 'center' }}>
              🎬 Escolha a Sessão
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {sessoes.map(sessao => (
                <button
                  key={sessao.id}
                  onClick={() => {
                    setSessaoSelecionada(sessao.id);
                    setCarrinho({});
                  }}
                  style={{
                    padding: '15px',
                    border: sessaoSelecionada === sessao.id ? '3px solid #5d34a4' : '2px solid #e0e0e0',
                    borderRadius: '10px',
                    backgroundColor: sessaoSelecionada === sessao.id ? '#f0e6ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    fontWeight: sessaoSelecionada === sessao.id ? 'bold' : 'normal'
                  }}
                >
                  <div style={{ fontSize: '16px', color: '#2c3e50', marginBottom: '5px' }}>
                    Sessão {sessao.numero}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    📅 {new Date(sessao.data).toLocaleDateString('pt-BR')}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    🕐 {sessao.hora}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {Object.keys(setoresOrganizados).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p style={{ fontSize: '18px' }}>⚠️ Nenhum ingresso disponível no momento</p>
          </div>
        ) : (
          Object.entries(setoresOrganizados).map(([setorNome, setorData]) => {
            let totalDisponibilizado = 0;

            [...setorData.semLote, ...Object.values(setorData.lotes).flatMap(l => l.ingressos)].forEach(ing => {
              totalDisponibilizado += (ing.quantidade_disponivel_calculada || 0);
            });

            const disponiveis = totalDisponibilizado;
            const ultimos = totalDisponibilizado <= 15 && totalDisponibilizado > 0;
            const esgotado = totalDisponibilizado === 0;

            return (
              <div key={setorNome} style={{ 
                marginBottom: '35px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  backgroundColor: '#5d34a4', 
                  color: 'white', 
                  padding: '15px 25px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <span>🎪 {setorNome}</span>
                  <span style={{ fontSize: '14px', fontWeight: 'normal' }}>
                    {esgotado ? (
                      <span style={{ backgroundColor: '#dc3545', padding: '5px 12px', borderRadius: '15px' }}>
                        ❌ Esgotado
                      </span>
                    ) : ultimos ? (
                      <span style={{ backgroundColor: '#ffc107', color: '#000', padding: '5px 12px', borderRadius: '15px' }}>
                        🔥 Últimos {disponiveis} ingressos!
                      </span>
                    ) : (
                      <span>{disponiveis} disponíveis</span>
                    )}
                  </span>
                </div>

                <div style={{ padding: '25px' }}>
                  {Object.entries(setorData.lotes).map(([loteKey, loteData]) => (
                    <div key={loteKey} style={{ marginBottom: '20px' }}>
                      <div style={{ 
                        backgroundColor: '#f8f9fa', 
                        padding: '12px 20px', 
                        borderRadius: '8px',
                        marginBottom: '15px',
                        borderLeft: '4px solid #9b59b6'
                      }}>
                        <span style={{ fontWeight: 'bold', color: '#8e44ad', fontSize: '16px' }}>
                          📦 Lote {loteData.id}
                        </span>
                      </div>

                      {loteData.ingressos.map(ingresso => {
                        const ingressosDisponiveis = ingresso.quantidade_disponivel_calculada || 0;
                        const precoBase = parseFloat(ingresso.valor);
                        const precoComCupom = calcularPrecoComCupom(precoBase);
                        const temDesconto = precoComCupom < precoBase;
                        const taxaCliente = evento.TaxaCliente || 15;
                        const valorTaxa = precoComCupom * (taxaCliente / 100);
                        const valorTotal = precoComCupom + valorTaxa;
                        const quantidadeNoCarrinho = carrinho[ingresso.id] || 0;

                        return (
                          <div key={ingresso.id} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '20px',
                            backgroundColor: temDesconto ? '#d4edda' : '#fafafa',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            border: temDesconto ? '2px solid #28a745' : '1px solid #e0e0e0',
                            flexWrap: 'wrap',
                            gap: '15px'
                          }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <h4 style={{ margin: 0, fontSize: '18px', color: '#2c3e50', marginBottom: '5px' }}>
                                {ingresso.tipo}
                                {temDesconto && <span style={{ color: '#28a745', marginLeft: '10px', fontSize: '14px' }}>🎟️ COM DESCONTO</span>}
                              </h4>
                              <p style={{ margin: 0, fontSize: '13px', color: ingressosDisponiveis > 0 ? '#999' : '#dc3545' }}>
                                {ingressosDisponiveis > 0 
                                  ? `${ingressosDisponiveis} disponíveis` 
                                  : '❌ Esgotado'}
                              </p>
                            </div>
                            
                            <div style={{ textAlign: 'right', marginRight: '20px' }}>
                              {temDesconto && (
                                <div style={{ fontSize: '13px', color: '#999', textDecoration: 'line-through', marginBottom: '3px' }}>
                                  R$ {precoBase.toFixed(2)}
                                </div>
                              )}
                              <div style={{ fontSize: '14px', color: '#666', marginBottom: '3px' }}>
                                R$ {precoComCupom.toFixed(2)} + R$ {valorTaxa.toFixed(2)} (taxa)
                              </div>
                              <div style={{ fontSize: '22px', fontWeight: 'bold', color: temDesconto ? '#28a745' : '#27ae60' }}>
                                R$ {valorTotal.toFixed(2)}
                              </div>
                            </div>

                            {ingressosDisponiveis > 0 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <select
                                  value={quantidadeNoCarrinho}
                                  onChange={(e) => atualizarCarrinho(ingresso.id, parseInt(e.target.value))}
                                  style={{
                                    padding: '10px 15px',
                                    border: '2px solid #5d34a4',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    backgroundColor: 'white'
                                  }}
                                >
                                  <option value="0">0</option>
                                  {[...Array(Math.min(10, ingressosDisponiveis))].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <button disabled style={{
                                backgroundColor: '#ccc',
                                color: '#666',
                                border: 'none',
                                padding: '12px 30px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'not-allowed'
                              }}>
                                Esgotado
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {setorData.semLote.length > 0 && (
                    <div>
                      {setorData.semLote.map(ingresso => {
                        const ingressosDisponiveis = ingresso.quantidade_disponivel_calculada || 0;
                        const precoBase = parseFloat(ingresso.valor);
                        const precoComCupom = calcularPrecoComCupom(precoBase);
                        const temDesconto = precoComCupom < precoBase;
                        const taxaCliente = evento.TaxaCliente || 15;
                        const valorTaxa = precoComCupom * (taxaCliente / 100);
                        const valorTotal = precoComCupom + valorTaxa;
                        const quantidadeNoCarrinho = carrinho[ingresso.id] || 0; 
return (
                          <div key={ingresso.id} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '20px',
                            backgroundColor: temDesconto ? '#d4edda' : '#fafafa',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            border: temDesconto ? '2px solid #28a745' : '1px solid #e0e0e0',
                            flexWrap: 'wrap',
                            gap: '15px'
                          }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <h4 style={{ margin: 0, fontSize: '18px', color: '#2c3e50', marginBottom: '5px' }}>
                                {ingresso.tipo}
                                {temDesconto && <span style={{ color: '#28a745', marginLeft: '10px', fontSize: '14px' }}>🎟️ COM DESCONTO</span>}
                              </h4>
                              <p style={{ margin: 0, fontSize: '13px', color: ingressosDisponiveis > 0 ? '#999' : '#dc3545' }}>
                                {ingressosDisponiveis > 0
                                  ? `${ingressosDisponiveis} disponíveis`
                                  : '❌ Esgotado'}
                              </p>
                            </div>

                            <div style={{ textAlign: 'right', marginRight: '20px' }}>
                              {temDesconto && (
                                <div style={{ fontSize: '13px', color: '#999', textDecoration: 'line-through', marginBottom: '3px' }}>
                                  R$ {precoBase.toFixed(2)}
                                </div>
                              )}
                              <div style={{ fontSize: '14px', color: '#666', marginBottom: '3px' }}>
                                R$ {precoComCupom.toFixed(2)} + R$ {valorTaxa.toFixed(2)} (taxa)
                              </div>
                              <div style={{ fontSize: '22px', fontWeight: 'bold', color: temDesconto ? '#28a745' : '#27ae60' }}>
                                R$ {valorTotal.toFixed(2)}
                              </div>
                            </div>

                            {ingressosDisponiveis > 0 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <select
                                  value={quantidadeNoCarrinho}
                                  onChange={(e) => atualizarCarrinho(ingresso.id, parseInt(e.target.value))}
                                  style={{
                                    padding: '10px 15px',
                                    border: '2px solid #5d34a4',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    backgroundColor: 'white'
                                  }}
                                >
                                  <option value="0">0</option>
                                  {[...Array(Math.min(10, ingressosDisponiveis))].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <button disabled style={{
                                backgroundColor: '#ccc',
                                color: '#666',
                                border: 'none',
                                padding: '12px 30px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'not-allowed'
                              }}>
                                Esgotado
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {totalItensCarrinho > 0 && (
          <div style={{ 
            marginTop: '30px', 
            padding: '25px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '12px',
            border: '3px solid #5d34a4'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#5d34a4', fontSize: '24px' }}>
                  🛒 Seu Carrinho
                </h3>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                  {totalItensCarrinho} {totalItensCarrinho === 1 ? 'ingresso selecionado' : 'ingressos selecionados'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', color: '#666', marginBottom: '5px' }}>
                  Total:
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#27ae60' }}>
                  R$ {calcularTotalCarrinho().toFixed(2)}
                </div>
              </div>
            </div>

            <button
              onClick={finalizarCompra}
              style={{
                width: '100%',
                backgroundColor: '#f1c40f',
                color: '#000',
                border: 'none',
                padding: '18px',
                borderRadius: '10px',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 10px rgba(241, 196, 15, 0.3)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              🎫 Finalizar Compra
            </button>
          </div>
        )}

        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          backgroundColor: '#e8f8f5', 
          borderRadius: '8px',
          border: '1px solid #27ae60'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
              <div style={{ fontSize: '14px', color: '#27ae60', fontWeight: '600' }}>Entrada garantida</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔒</div>
              <div style={{ fontSize: '14px', color: '#27ae60', fontWeight: '600' }}>Pagamento seguro</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>💬</div>
              <div style={{ fontSize: '14px', color: '#27ae60', fontWeight: '600' }}>Suporte 24h</div>
            </div>
          </div>
        </div>
      </div>
    ) : null}

    {produtos && produtos.length > 0 && (
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#5d34a4', marginTop: 0, fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>
          🛍️ Produtos do Evento
        </h2>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '25px' 
        }}>
          {produtos.map(produto => {
            const quantidadeTotal = (produto.quantidade_disponivel || 0) + (produto.quantidade_vendida || 0);
            const quantidadeDisponivel = produto.quantidade_disponivel || 0;
            const percentualDisponivel = quantidadeTotal > 0 ? (quantidadeDisponivel / quantidadeTotal) * 100 : 0;
            const ultimos = percentualDisponivel <= 15 && percentualDisponivel > 0;
            const esgotado = quantidadeDisponivel === 0;

            return (
              <div key={produto.id} style={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: '10px', 
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s',
                backgroundColor: 'white',
                position: 'relative'
              }}>
                {ultimos && !esgotado && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: '#ffc107',
                    color: '#000',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    zIndex: 1
                  }}>
                    🔥 Últimos!
                  </div>
                )}

                {esgotado && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    zIndex: 1
                  }}>
                    ❌ Esgotado
                  </div>
                )}

                <div style={{ 
                  width: '100%', 
                  height: '200px', 
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {produto.imagem_url ? (
                    <img 
                      src={produto.imagem_url} 
                      alt={produto.nome}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '48px' }}>📦</span>
                  )}
                </div>

                <div style={{ padding: '20px' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#2c3e50' }}>
                    {produto.nome}
                  </h3>
                  
                  {produto.descricao && (
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px', lineHeight: '1.5' }}>
                      {produto.descricao}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#27ae60' }}>
                      R$ {parseFloat(produto.preco).toFixed(2)}
                    </span>
                    {produto.tamanho && (
                      <span style={{ 
                        backgroundColor: '#e8f4f8', 
                        color: '#2980b9', 
                        padding: '4px 12px', 
                        borderRadius: '15px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        Tamanho: {produto.tamanho}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '13px', color: '#999', marginBottom: '15px' }}>
                    {esgotado 
                      ? '❌ Esgotado' 
                      : ultimos 
                        ? `🔥 Últimos ${quantidadeDisponivel} disponíveis!`
                        : `${quantidadeDisponivel} disponíveis`}
                  </p>

                  {quantidadeDisponivel > 0 ? (
                    <Link href={`/checkout?evento_id=${evento.id}&produto_id=${produto.id}`}>
                      <button style={{
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '8px',
                        width: '100%',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}>
                        Adicionar ao Carrinho
                      </button>
                    </Link>
                  ) : (
                    <button disabled style={{
                      backgroundColor: '#ccc',
                      color: '#666',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      width: '100%',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      cursor: 'not-allowed'
                    }}>
                      Esgotado
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
</div>
);
}
