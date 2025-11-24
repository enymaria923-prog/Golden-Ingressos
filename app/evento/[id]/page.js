'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

export default function EventoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [evento, setEvento] = useState(null);
  const [sessoes, setSessoes] = useState([]);
  const [setoresData, setSetoresData] = useState([]);
  const [cupomCodigo, setCupomCodigo] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState(null);
  const [cupomError, setCupomError] = useState('');
  const [carrinhoItens, setCarrinhoItens] = useState({});
  const [loading, setLoading] = useState(true);
  const [sessaoSelecionada, setSessaoSelecionada] = useState(null);
  const [temCupons, setTemCupons] = useState(false);
  const [aplicandoCupom, setAplicandoCupom] = useState(false);

  useEffect(() => {
    carregarEvento();
  }, [params.id]);

  const carregarEvento = async () => {
    try {
      setLoading(true);

      const { data: eventoData, error: eventoError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', params.id)
        .single();

      if (eventoError) throw eventoError;
      setEvento(eventoData);

      const { data: cuponsData } = await supabase
        .from('cupons')
        .select('id')
        .eq('evento_id', params.id)
        .eq('ativo', true)
        .gte('data_validade', new Date().toISOString())
        .limit(1);

      setTemCupons(cuponsData && cuponsData.length > 0);

      const { data: sessoesData } = await supabase
        .from('sessoes')
        .select('*')
        .eq('evento_id', params.id)
        .order('data', { ascending: true })
        .order('hora', { ascending: true });

      setSessoes(sessoesData || []);

      if (sessoesData && sessoesData.length > 0) {
        setSessaoSelecionada(sessoesData[0].id);
        await carregarIngressos(params.id, sessoesData[0].id);
      } else {
        await carregarIngressos(params.id, null);
      }

    } catch (error) {
      console.error('Erro ao carregar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarIngressos = async (eventoId, sessaoId) => {
    try {
      let querySetores = supabase
        .from('setores')
        .select('*')
        .eq('eventos_id', eventoId);

      if (sessaoId) {
        querySetores = querySetores.eq('sessao_id', sessaoId);
      } else {
        querySetores = querySetores.is('sessao_id', null);
      }

      const { data: setores } = await querySetores;

      const setoresCompletos = await Promise.all(
        (setores || []).map(async (setor) => {
          const { data: lotes } = await supabase
            .from('lotes')
            .select('*')
            .eq('setor', setor.nome)
            .eq('ativo', true)
            .lte('data_inicio', new Date().toISOString())
            .gte('data_fim', new Date().toISOString());

          if (lotes && lotes.length > 0) {
            const lotesComIngressos = await Promise.all(
              lotes.map(async (lote) => {
                const { data: ingressos } = await supabase
                  .from('ingressos')
                  .select('*')
                  .eq('evento_id', eventoId)
                  .eq('lote_id', lote.id)
                  .eq('setor', setor.nome);

                const disponiveis = lote.quantidade_total - lote.quantidade_vendida;
                const porcentagemRestante = (disponiveis / lote.quantidade_total) * 100;

                return {
                  ...lote,
                  ingressos: ingressos || [],
                  disponiveis,
                  porcentagemRestante,
                  estaEsgotado: disponiveis === 0,
                  saoUltimos: porcentagemRestante <= 15 && porcentagemRestante > 0
                };
              })
            );

            return {
              ...setor,
              temLotes: true,
              lotes: lotesComIngressos
            };
          } else {
            const { data: ingressos } = await supabase
              .from('ingressos')
              .select('*')
              .eq('evento_id', eventoId)
              .eq('setor', setor.nome)
              .is('lote_id', null);

            const totalVendidos = ingressos?.reduce((sum, ing) => sum + (ing.vendidos || 0), 0) || 0;
            const capacidade = setor.capacidade_definida || 0;
            const disponiveis = capacidade - totalVendidos;
            const porcentagemRestante = capacidade > 0 ? (disponiveis / capacidade) * 100 : 0;

            return {
              ...setor,
              temLotes: false,
              ingressos: ingressos || [],
              disponiveis,
              porcentagemRestante,
              estaEsgotado: disponiveis === 0,
              saoUltimos: porcentagemRestante <= 15 && porcentagemRestante > 0
            };
          }
        })
      );

      setSetoresData(setoresCompletos);
    } catch (error) {
      console.error('Erro ao carregar ingressos:', error);
    }
  };

  const aplicarCupom = async () => {
    if (!cupomCodigo.trim()) {
      setCupomError('Digite um código de cupom');
      return;
    }

    setAplicandoCupom(true);
    setCupomError('');

    try {
      const { data: cupom, error: cupomError } = await supabase
        .from('cupons')
        .select('*')
        .eq('evento_id', params.id)
        .eq('codigo', cupomCodigo.trim().toUpperCase())
        .eq('ativo', true)
        .gte('data_validade', new Date().toISOString())
        .single();

      if (cupomError || !cupom) {
        setCupomError('Cupom inválido ou expirado');
        setAplicandoCupom(false);
        return;
      }

      const usosDisponiveis = cupom.quantidade_total - cupom.quantidade_usada;
      if (usosDisponiveis <= 0) {
        setCupomError('Este cupom já atingiu o limite de usos');
        setAplicandoCupom(false);
        return;
      }

      const { data: precosIngressos } = await supabase
        .from('cupom_ingresso_preco')
        .select('*')
        .eq('cupom_id', cupom.id);

      setCupomAplicado({
        ...cupom,
        precosIngressos: precosIngressos || []
      });

      await carregarIngressos(params.id, sessaoSelecionada);

    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      setCupomError('Erro ao aplicar cupom');
    } finally {
      setAplicandoCupom(false);
    }
  };

  const removerCupom = () => {
    setCupomAplicado(null);
    setCupomCodigo('');
    setCupomError('');
    carregarIngressos(params.id, sessaoSelecionada);
  };

  const calcularPrecoComCupom = (ingresso, loteId = null) => {
    if (!cupomAplicado) return null;

    const precoComCupom = cupomAplicado.precosIngressos.find(
      p => p.setor === ingresso.setor && 
           p.tipo_ingresso === ingresso.tipo &&
           (loteId ? p.lote_id === loteId : true)
    );

    return precoComCupom?.preco_com_cupom || null;
  };

  const calcularTaxaServico = (preco) => {
    if (!evento) return 0;
    const taxaCliente = evento.taxacliente || 0;
    return (preco * taxaCliente) / 100;
  };

  const alterarQuantidade = (ingressoId, acao, loteId = null) => {
    const chave = loteId ? `${ingressoId}-${loteId}` : ingressoId;
    const quantidadeAtual = carrinhoItens[chave] || 0;

    if (acao === 'add') {
      setCarrinhoItens({
        ...carrinhoItens,
        [chave]: quantidadeAtual + 1
      });
    } else if (acao === 'remove' && quantidadeAtual > 0) {
      const novoCarrinho = { ...carrinhoItens };
      if (quantidadeAtual === 1) {
        delete novoCarrinho[chave];
      } else {
        novoCarrinho[chave] = quantidadeAtual - 1;
      }
      setCarrinhoItens(novoCarrinho);
    }
  };

  const getTotalItensCarrinho = () => {
    return Object.values(carrinhoItens).reduce((sum, qtd) => sum + qtd, 0);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatarHora = (hora) => {
    return hora?.substring(0, 5) || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando evento...</p>
        </div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Evento não encontrado</h2>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Voltar para home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header com Imagem */}
      <div className="relative w-full bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-[400px]">
            {evento.imagem_url ? (
              <Image
                src={evento.imagem_url}
                alt={evento.nome}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <span className="text-white text-6xl">🎉</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informações do Evento */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{evento.nome}</h1>
          
          <div className="flex flex-col gap-3 text-gray-700 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <span className="text-lg">
                {formatarData(evento.data)} • {formatarHora(evento.hora)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📍</span>
              <span className="text-lg">{evento.local}</span>
            </div>
            {evento.categoria && (
              <div className="flex items-center gap-2">
                <span className="text-xl">🏷️</span>
                <span className="text-lg">{evento.categoria}</span>
              </div>
            )}
          </div>

          {/* Parcelamento */}
          {evento.preco && (
            <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              💳 Parcele em até 12x
            </div>
          )}
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* Coluna Esquerda - Descrição */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Descrição do evento</h2>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {evento.descricao}
              </div>
            </div>

            {/* Seletor de Sessões */}
            {sessoes.length > 1 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Selecione a sessão</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sessoes.map((sessao) => (
                    <button
                      key={sessao.id}
                      onClick={() => {
                        setSessaoSelecionada(sessao.id);
                        carregarIngressos(params.id, sessao.id);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        sessaoSelecionada === sessao.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📅</span>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatarData(sessao.data)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatarHora(sessao.hora)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coluna Direita - Ingressos */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Ingressos</h2>

              {/* Campo de Cupom */}
              {temCupons && (
                <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                  {!cupomAplicado ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tem um cupom de desconto?
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cupomCodigo}
                          onChange={(e) => setCupomCodigo(e.target.value.toUpperCase())}
                          placeholder="Digite o código"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                        />
                        <button
                          onClick={aplicarCupom}
                          disabled={aplicandoCupom}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
                        >
                          {aplicandoCupom ? '...' : 'Aplicar'}
                        </button>
                      </div>
                      {cupomError && (
                        <p className="mt-2 text-xs text-red-600">{cupomError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✅</span>
                        <div>
                          <div className="text-sm font-medium text-green-900">
                            Cupom aplicado!
                          </div>
                          <div className="text-xs text-green-700">
                            {cupomAplicado.codigo}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={removerCupom}
                        className="text-green-700 hover:text-green-900"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Lista de Ingressos */}
              <div className="space-y-4">
                {setoresData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🎫</div>
                    <p className="text-sm">Nenhum ingresso disponível</p>
                  </div>
                ) : (
                  setoresData.map((setor) => (
                    <div key={setor.id}>
                      {setor.temLotes ? (
                        setor.lotes.map((lote) => (
                          <div key={lote.id} className="mb-4">
                            {lote.ingressos.map((ingresso) => {
                              const precoOriginal = parseFloat(ingresso.valor || 0);
                              const precoComCupom = calcularPrecoComCupom(ingresso, lote.id);
                              const precoFinal = precoComCupom || precoOriginal;
                              const taxa = calcularTaxaServico(precoFinal);
                              const precoTotal = precoFinal + taxa;
                              const quantidade = carrinhoItens[`${ingresso.id}-${lote.id}`] || 0;

                              if (lote.estaEsgotado) {
                                return (
                                  <div key={ingresso.id} className="bg-white rounded-lg border border-gray-200 p-4 opacity-60">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <div className="font-semibold text-gray-900">{ingresso.tipo}</div>
                                        <div className="text-sm text-gray-500">{setor.nome} • {lote.nome}</div>
                                      </div>
                                      <div className="text-red-600 text-sm font-medium">Esgotado</div>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div key={ingresso.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                      <div className="font-semibold text-gray-900 mb-1">{ingresso.tipo}</div>
                                      <div className="text-xs text-gray-500 mb-2">{setor.nome} • {lote.nome}</div>
                                      
                                      {lote.saoUltimos && (
                                        <div className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium mb-2">
                                          ⚠️ Últimos ingressos!
                                        </div>
                                      )}

                                      <div className="mt-2">
                                        {precoComCupom && (
                                          <div className="text-sm text-gray-400 line-through">
                                            R$ {precoOriginal.toFixed(2)}
                                          </div>
                                        )}
                                        <div className="text-lg font-bold text-gray-900">
                                          R$ {precoFinal.toFixed(2)}
                                          {taxa > 0 && (
                                            <span className="text-xs font-normal text-gray-500">
                                              {' '}(+ R$ {taxa.toFixed(2)} taxa)
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-green-600 font-medium">
                                          em até 12x R$ {(precoTotal / 12).toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <span className="text-sm text-gray-600">Quantidade</span>
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => alterarQuantidade(ingresso.id, 'remove', lote.id)}
                                        disabled={quantidade === 0}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                      >
                                        <span className="text-lg">−</span>
                                      </button>
                                      <span className="w-8 text-center font-semibold text-gray-900">
                                        {quantidade}
                                      </span>
                                      <button
                                        onClick={() => alterarQuantidade(ingresso.id, 'add', lote.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 text-white"
                                      >
                                        <span className="text-lg">+</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))
                      ) : (
                        setor.ingressos.map((ingresso) => {
                          const precoOriginal = parseFloat(ingresso.valor || 0);
                          const precoComCupom = calcularPrecoComCupom(ingresso);
                          const precoFinal = precoComCupom || precoOriginal;
                          const taxa = calcularTaxaServico(precoFinal);
                          const precoTotal = precoFinal + taxa;
                          const quantidade = carrinhoItens[ingresso.id] || 0;

                          if (setor.estaEsgotado) {
                            return (
                              <div key={ingresso.id} className="bg-white rounded-lg border border-gray-200 p-4 opacity-60 mb-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-semibold text-gray-900">{ingresso.tipo}</div>
                                    <div className="text-sm text-gray-500">{setor.nome}</div>
                                  </div>
                                  <div className="text-red-600 text-sm font-medium">Esgotado</div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={ingresso.id} className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 mb-1">{ingresso.tipo}</div>
                                  <div className="text-xs text-gray-500 mb-2">{setor.nome}</div>
                                  
                                  {setor.saoUltimos && (
                                    <div className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium mb-2">
                                      ⚠️ Últimos ingressos!
                                    </div>
                                  )}

                                  <div className="mt-2">
                                    {precoComCupom && (
                                      <div className="text-sm text-gray-400 line-through">
                                        R$ {precoOriginal.toFixed(2)}
                                      </div>
                                    )}
                                    <div className="text-lg font-bold text-gray-900">
                                      R$ {precoFinal.toFixed(2)}
                                      {taxa > 0 && (
                                        <span className="text-xs font-normal text-gray-500">
                                          {' '}(+ R$ {taxa.toFixed(2)} taxa)
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-green-600 font-medium">
                                      em até 12x R$ {(precoTotal / 12).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span className="text-sm text-gray-600">Quantidade</span>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => alterarQuantidade(ingresso.id, 'remove')}
                                    disabled={quantidade === 0}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <span className="text-lg">−</span>
                                  </button>
                                  <span className="w-8 text-center font-semibold text-gray-900">
                                    {quantidade}
                                  </span>
                                  <button
                                    onClick={() => alterarQuantidade(ingresso.id, 'add')}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 text-white"
                                  >
                                    <span className="text-lg">+</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Botão Comprar */}
              {getTotalItensCarrinho() > 0 && (
                <button
                  onClick={() => router.push(`/checkout/${params.id}`)}
                  className="w-full mt-6 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-lg"
                >
                  Selecione um Ingresso
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
