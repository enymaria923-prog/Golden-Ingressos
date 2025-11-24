'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Tag, 
  AlertCircle, 
  CheckCircle,
  Ticket,
  X,
  Plus,
  Minus,
  ChevronDown,
  Info
} from 'lucide-react';

export default function EventoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  
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

      // Carregar dados do evento
      const { data: eventoData, error: eventoError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', params.id)
        .single();

      if (eventoError) throw eventoError;
      setEvento(eventoData);

      // Verificar se tem cupons ativos
      const { data: cuponsData } = await supabase
        .from('cupons')
        .select('id')
        .eq('evento_id', params.id)
        .eq('ativo', true)
        .gte('data_validade', new Date().toISOString())
        .limit(1);

      setTemCupons(cuponsData && cuponsData.length > 0);

      // Carregar sessões (se houver)
      const { data: sessoesData } = await supabase
        .from('sessoes')
        .select('*')
        .eq('evento_id', params.id)
        .order('data', { ascending: true })
        .order('hora', { ascending: true });

      setSessoes(sessoesData || []);

      // Se tem sessões, selecionar a primeira
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
      // Carregar setores
      let querySetores = supabase
        .from('setores')
        .select('*')
        .eq('eventos_id', eventoId);

      if (sessaoId) {
        querySetores = querySetores.eq('sessao_id', sessaoId);
      } else {
        querySetores = querySetores.is('sessao_id', null);
      }

      const { data: setores, error: setoresError } = await querySetores;
      if (setoresError) throw setoresError;

      // Para cada setor, carregar lotes e ingressos
      const setoresCompletos = await Promise.all(
        setores.map(async (setor) => {
          // Carregar lotes do setor (ativos e dentro da data)
          const { data: lotes } = await supabase
            .from('lotes')
            .select('*')
            .eq('setor', setor.nome)
            .eq('ativo', true)
            .lte('data_inicio', new Date().toISOString())
            .gte('data_fim', new Date().toISOString());

          // Se tem lotes, carregar ingressos dos lotes
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
            // Sem lotes, carregar ingressos direto do setor
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
      // Buscar cupom
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

      // Verificar se ainda tem usos disponíveis
      const usosDisponiveis = cupom.quantidade_total - cupom.quantidade_usada;
      if (usosDisponiveis <= 0) {
        setCupomError('Este cupom já atingiu o limite de usos');
        setAplicandoCupom(false);
        return;
      }

      // Buscar preços com cupom para ingressos
      const { data: precosIngressos } = await supabase
        .from('cupom_ingresso_preco')
        .select('*')
        .eq('cupom_id', cupom.id);

      setCupomAplicado({
        ...cupom,
        precosIngressos: precosIngressos || []
      });

      // Recarregar ingressos para aplicar os novos preços
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
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
    <div className="min-h-screen bg-gray-50">
      {/* Header do Evento */}
      <div className="relative h-96 bg-gradient-to-br from-purple-600 to-blue-600">
        {evento.imagem_url && (
          <Image
            src={evento.imagem_url}
            alt={evento.nome}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">{evento.nome}</h1>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatarData(evento.data)} • {formatarHora(evento.hora)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{evento.local}</span>
              </div>
              {evento.categoria && (
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  <span>{evento.categoria}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2">
            {/* Descrição */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Descrição do evento</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {evento.descricao}
              </div>
            </div>

            {/* Seletor de Sessões */}
            {sessoes.length > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Selecione a sessão</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sessoes.map((sessao) => (
                    <button
                      key={sessao.id}
                      onClick={() => {
                        setSessaoSelecionada(sessao.id);
                        carregarIngressos(params.id, sessao.id);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        sessaoSelecionada === sessao.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <div className="text-left">
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

          {/* Sidebar - Ingressos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm sticky top-4">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Ingressos</h2>
              </div>

              {/* Campo de Cupom */}
              {temCupons && (
                <div className="p-6 border-b border-gray-200 bg-gray-50">
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        />
                        <button
                          onClick={aplicarCupom}
                          disabled={aplicandoCupom}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                          {aplicandoCupom ? '...' : 'OK'}
                        </button>
                      </div>
                      {cupomError && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {cupomError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-green-900">
                            Cupom aplicado!
                          </div>
                          <div className="text-sm text-green-700">
                            {cupomAplicado.codigo}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={removerCupom}
                        className="p-1 hover:bg-green-100 rounded"
                      >
                        <X className="w-4 h-4 text-green-700" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Lista de Ingressos */}
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {setoresData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum ingresso disponível</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {setoresData.map((setor) => (
                      <div key={setor.id}>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          {setor.nome}
                        </h3>

                        {setor.temLotes ? (
                          // Renderizar por lotes
                          <div className="space-y-4">
                            {setor.lotes.map((lote) => (
                              <div key={lote.id} className="border border-gray-200 rounded-lg p-3">
                                <div className="text-sm font-medium text-gray-700 mb-2">
                                  {lote.nome}
                                </div>
                                {lote.estaEsgotado ? (
                                  <div className="text-center py-2 text-sm text-red-600 font-medium">
                                    Esgotado
                                  </div>
                                ) : (
                                  <>
                                    {lote.saoUltimos && (
                                      <div className="mb-2 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Últimos ingressos!
                                      </div>
                                    )}
                                    <div className="space-y-3">
                                      {lote.ingressos.map((ingresso) => {
                                        const precoOriginal = parseFloat(ingresso.valor || 0);
                                        const precoComCupom = calcularPrecoComCupom(ingresso, lote.id);
                                        const precoFinal = precoComCupom || precoOriginal;
                                        const taxa = calcularTaxaServico(precoFinal);
                                        const precoTotal = precoFinal + taxa;

                                        return (
                                          <div key={ingresso.id} className="flex items-center justify-between">
                                            <div className="flex-1">
                                              <div className="text-sm font-medium text-gray-900">
                                                {ingresso.tipo}
                                              </div>
                                              <div className="text-sm text-gray-600">
                                                {precoComCupom && (
                                                  <span className="line-through text-gray-400 mr-2">
                                                    R$ {precoOriginal.toFixed(2)}
                                                  </span>
                                                )}
                                                R$ {precoFinal.toFixed(2)}
                                                {taxa > 0 && (
                                                  <span className="text-xs text-gray-500">
                                                    {' '}(+ R$ {taxa.toFixed(2)} taxa)
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => alterarQuantidade(ingresso.id, 'remove', lote.id)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                                              >
                                                <Minus className="w-4 h-4" />
                                              </button>
                                              <span className="w-8 text-center font-medium">
                                                {carrinhoItens[`${ingresso.id}-${lote.id}`] || 0}
                                              </span>
                                              <button
                                                onClick={() => alterarQuantidade(ingresso.id, 'add', lote.id)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                                              >
                                                <Plus className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Renderizar sem lotes
                          <div>
                            {setor.estaEsgotado ? (
                              <div className="text-center py-4 text-sm text-red-600 font-medium border border-red-200 rounded-lg">
                                Setor esgotado
                              </div>
                            ) : (
                              <>
                                {setor.saoUltimos && (
                                  <div className="mb-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Últimos ingressos disponíveis!
                                  </div>
                                )}
                                <div className="space-y-3">
                                  {setor.ingressos.map((ingresso) => {
                                    const precoOriginal = parseFloat(ingresso.valor || 0);
                                    const precoComCupom = calcularPrecoComCupom(ingresso);
                                    const precoFinal = precoComCupom || precoOriginal;
                                    const taxa = calcularTaxaServico(precoFinal);
                                    const precoTotal = precoFinal + taxa;

                                    return (
                                      <div key={ingresso.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div className="flex-1">
                                          <div className="font-medium text-gray-900">
                                            {ingresso.tipo}
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            {precoComCupom && (
                                              <span className="line-through text-gray-400 mr-2">
                                                R$ {precoOriginal.toFixed(2)}
                                              </span>
                                            )}
                                            R$ {precoFinal.toFixed(2)}
                                            {taxa > 0 && (
                                              <span className="text-xs text-gray-500">
                                                {' '}(+ R$ {taxa.toFixed(2)} taxa)
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => alterarQuantidade(ingresso.id, 'remove')}
                                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                                          >
                                            <Minus className="w-4 h-4" />
                                          </button>
                                          <span className="w-8 text-center font-medium">
                                            {carrinhoItens[ingresso.id] || 0}
                                          </span>
                                          <button
                                            onClick={() => alterarQuantidade(ingresso.id, 'add')}
                                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                                          >
                                            <Plus className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botão Comprar */}
              {getTotalItensCarrinho() > 0 && (
                <div className="p-6 border-t border-gray-200">
                  <button
                    onClick={() => router.push(`/checkout/${params.id}`)}
                    className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Comprar Ingressos ({getTotalItensCarrinho()})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
