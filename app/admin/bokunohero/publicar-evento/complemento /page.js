'use client';
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../../../../utils/supabase/client';
import CupomManager from '../../../../publicar-evento/components/CupomManager';
import ProdutoManager from '../../../../publicar-evento/components/ProdutoManager';
export const dynamic = 'force-dynamic';

export default function ComplementoContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventoId = searchParams.get('evento');
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evento, setEvento] = useState(null);
  const [sessoes, setSessoes] = useState([]);
  const [setoresIngressos, setSetoresIngressos] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [taxa, setTaxa] = useState({ taxaComprador: 18.5, taxaProdutor: 6.5 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🆕 ESTADOS PARA PESQUISA DE PRODUTOR
  const [produtorSelecionado, setProdutorSelecionado] = useState(null);
  const [buscaProdutor, setBuscaProdutor] = useState('');
  const [produtoresEncontrados, setProdutoresEncontrados] = useState([]);
  const [pesquisando, setPesquisando] = useState(false);

  const handleProdutosChange = useCallback((novosProdutos) => {
    setProdutos(novosProdutos);
  }, []);

  const handleCuponsChange = useCallback((novosCupons) => {
    setCupons(novosCupons);
  }, []);

  useEffect(() => {
    if (!eventoId) {
      router.push('/admin/bokunohero/publicar-evento');
      return;
    }
    checkUserAndLoadData();
  }, [eventoId]);

  const checkUserAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/login');
        return;
      }
      
      setUser(session.user);

      const { data: eventoData, error: eventoError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      if (eventoError || !eventoData) {
        alert('Evento não encontrado!');
        router.push('/admin/bokunohero/publicar-evento');
        return;
      }

      setEvento(eventoData);

      // Se já tem produtor definido, buscar dados dele
      if (eventoData.user_id) {
        const { data: produtorData } = await supabase
          .from('produtores')
          .select('*')
          .eq('user_id', eventoData.user_id)
          .single();
        
        if (produtorData) {
          setProdutorSelecionado(produtorData);
        }
      }

      const { data: sessoesData } = await supabase
        .from('sessoes')
        .select('*')
        .eq('evento_id', eventoId)
        .order('numero', { ascending: true });

      setSessoes(sessoesData || []);

      const { data: ingressosData } = await supabase
        .from('ingressos')
        .select('*')
        .eq('evento_id', eventoId)
        .order('setor', { ascending: true });

      const { data: lotesData } = await supabase
        .from('lotes')
        .select('*')
        .eq('evento_id', eventoId);

      const setoresMap = new Map();

      ingressosData?.forEach(ing => {
        if (!setoresMap.has(ing.setor)) {
          setoresMap.set(ing.setor, {
            id: `setor-${ing.setor}`,
            nome: ing.setor,
            usaLotes: false,
            lotes: [],
            tiposIngresso: []
          });
        }
      });

      if (lotesData && lotesData.length > 0) {
        lotesData.forEach(lote => {
          const setor = setoresMap.get(lote.setor);
          if (setor) {
            setor.usaLotes = true;
            
            const loteObj = {
              id: lote.id,
              nome: lote.nome,
              quantidadeTotal: lote.quantidade_total,
              tiposIngresso: []
            };

            ingressosData?.forEach(ing => {
              if (ing.lote_id === lote.id && ing.setor === lote.setor) {
                loteObj.tiposIngresso.push({
                  id: ing.id,
                  nome: ing.tipo,
                  preco: ing.valor,
                  quantidade: ing.quantidade,
                  sessao_id: ing.sessao_id
                });
              }
            });

            setor.lotes.push(loteObj);
          }
        });
      }

      ingressosData?.forEach(ing => {
        if (ing.lote_id === null) {
          const setor = setoresMap.get(ing.setor);
          if (setor) {
            setor.tiposIngresso.push({
              id: ing.id,
              nome: ing.tipo,
              preco: ing.valor,
              quantidade: ing.quantidade,
              sessao_id: ing.sessao_id
            });
          }
        }
      });

      setSetoresIngressos(Array.from(setoresMap.values()));
      setLoading(false);

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao carregar dados do evento!');
      router.push('/admin/bokunohero/publicar-evento');
    }
  };

  // 🆕 FUNÇÃO PARA PESQUISAR PRODUTORES
  const pesquisarProdutor = async (termo) => {
    if (!termo || termo.trim().length < 2) {
      setProdutoresEncontrados([]);
      return;
    }

    setPesquisando(true);

    try {
      // Pesquisa por nome_completo, nome_empresa ou user_id
      const { data, error } = await supabase
        .from('produtores')
        .select('*')
        .or(`nome_completo.ilike.%${termo}%,nome_empresa.ilike.%${termo}%,user_id.eq.${termo}`)
        .limit(10);

      if (!error && data) {
        setProdutoresEncontrados(data);
      } else {
        setProdutoresEncontrados([]);
      }
    } catch (error) {
      console.error('Erro ao pesquisar produtor:', error);
      setProdutoresEncontrados([]);
    } finally {
      setPesquisando(false);
    }
  };

  // Debounce para pesquisa
  useEffect(() => {
    const timer = setTimeout(() => {
      if (buscaProdutor) {
        pesquisarProdutor(buscaProdutor);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [buscaProdutor]);

  const selecionarProdutor = (produtor) => {
    setProdutorSelecionado(produtor);
    setBuscaProdutor('');
    setProdutoresEncontrados([]);
  };

  const removerProdutor = () => {
    setProdutorSelecionado(null);
  };

  const calcularRecebimento = (taxaComprador, taxaProdutor) => {
    const valorBase = 10000;
    const recebimento = valorBase + (valorBase * (taxaProdutor / 100));
    return recebimento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const calcularRecebimentoAbsorcao = () => {
    const valorBase = 10000;
    const taxaAbsorcao = 8;
    const recebimento = valorBase - (valorBase * (taxaAbsorcao / 100));
    return recebimento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // ✅ VALIDAR SE PRODUTOR FOI SELECIONADO
    if (!produtorSelecionado) {
      alert('⚠️ Por favor, selecione um produtor para este evento!');
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ ATUALIZAR EVENTO COM PRODUTOR SELECIONADO
      const { error: updateError } = await supabase
        .from('eventos')
        .update({
          TaxaCliente: taxa.taxaComprador,
          TaxaProdutor: taxa.taxaProdutor,
          rascunho: false,
          user_id: produtorSelecionado.user_id,
          produtor_email: produtorSelecionado.email,
          produtor_nome: produtorSelecionado.nome_completo || produtorSelecionado.nome_empresa
        })
        .eq('id', eventoId);

      if (updateError) {
        throw new Error(`Erro ao atualizar evento: ${updateError.message}`);
      }

      const produtosSalvosIds = {};
      if (produtos && produtos.length > 0) {
        for (const produto of produtos) {
          if (!produto.nome || !produto.preco || !produto.quantidade) {
            throw new Error('Preencha todos os campos obrigatórios do produto!');
          }

          let imagemProdutoUrl = null;

          if (produto.imagem) {
            const fileExtension = produto.imagem.name.split('.').pop();
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(7);
            const filePath = `produtos/${produtorSelecionado.user_id}/${eventoId}/${timestamp}-${randomStr}.${fileExtension}`;

            const { error: uploadProdError } = await supabase.storage
              .from('imagens_eventos')
              .upload(filePath, produto.imagem, { 
                cacheControl: '3600', 
                upsert: false 
              });

            if (!uploadProdError) {
              const { data: publicProdUrlData } = supabase.storage
                .from('imagens_eventos')
                .getPublicUrl(filePath);
              
              imagemProdutoUrl = publicProdUrlData.publicUrl;
            }
          }

          const produtoData = {
            evento_id: eventoId,
            nome: produto.nome,
            descricao: produto.descricao || null,
            preco: parseFloat(produto.preco),
            quantidade_disponivel: parseInt(produto.quantidade),
            quantidade_vendida: 0,
            tamanho: produto.tamanho || null,
            imagem_url: imagemProdutoUrl,
            tipo_produto: produto.tipoProduto,
            ativo: true,
            user_id: produtorSelecionado.user_id
          };

          const { data: produtoInserido, error: produtoError } = await supabase
            .from('produtos')
            .insert([produtoData])
            .select();

          if (produtoError) {
            throw new Error(`Erro ao salvar produto "${produto.nome}": ${produtoError.message}`);
          }

          produtosSalvosIds[produto.id] = produtoInserido[0].id;
        }
      }

      if (cupons && cupons.length > 0) {
        for (const cupom of cupons) {
          if (!cupom.codigo || cupom.codigo.trim() === '') {
            throw new Error('Preencha o código de todos os cupons!');
          }

          for (const sessao of sessoes) {
            const codigoCupom = sessoes.length > 1 
              ? `${cupom.codigo.toUpperCase()}_S${sessao.numero}` 
              : cupom.codigo.toUpperCase();

            const cupomData = {
              evento_id: eventoId,
              sessao_id: sessao.id,
              codigo: codigoCupom,
              descricao: cupom.descricao || null,
              ativo: true,
              quantidade_total: cupom.quantidadeTotal ? parseInt(cupom.quantidadeTotal) : null,
              quantidade_usada: 0,
              data_validade_inicio: cupom.dataInicio || null,
              data_validade_fim: cupom.dataFim || null,
              user_id: produtorSelecionado.user_id
            };

            const { data: cupomInserido, error: cupomError } = await supabase
              .from('cupons')
              .insert([cupomData])
              .select();

            if (cupomError) {
              throw new Error(`Erro ao salvar cupom "${codigoCupom}": ${cupomError.message}`);
            }

            const cupomIdReal = cupomInserido[0].id;
            const cuponsIngressosData = [];

            Object.keys(cupom.precosPorIngresso || {}).forEach(chave => {
              const precoComCupom = parseFloat(cupom.precosPorIngresso[chave]);
              
              if (precoComCupom && precoComCupom > 0) {
                const partes = chave.split('-');
                const ingressoId = parseInt(partes[partes.length - 1]);
                
                const ingressoDaSessao = setoresIngressos.some(setor => {
                  return setor.tiposIngresso.some(tipo => 
                    tipo.id === ingressoId && tipo.sessao_id === sessao.id
                  ) || setor.lotes.some(lote => 
                    lote.tiposIngresso.some(tipo => 
                      tipo.id === ingressoId && tipo.sessao_id === sessao.id
                    )
                  );
                });
                
                if (ingressoDaSessao) {
                  cuponsIngressosData.push({
                    cupom_id: cupomIdReal,
                    ingresso_id: ingressoId,
                    preco_com_cupom: precoComCupom
                  });
                }
              }
            });

            if (cuponsIngressosData.length > 0) {
              const { error: cuponsIngressosError } = await supabase
                .from('cupons_ingressos')
                .insert(cuponsIngressosData);

              if (cuponsIngressosError) {
                throw new Error(`Erro ao salvar preços do cupom: ${cuponsIngressosError.message}`);
              }
            }

            if (produtos && produtos.length > 0) {
              const cuponsProdutosData = [];
              
              produtos.forEach(produto => {
                if (produto.aceitaCupons && produto.precosPorCupom && produto.precosPorCupom[cupom.id]) {
                  const produtoIdReal = produtosSalvosIds[produto.id];
                  const precoProdutoComCupom = parseFloat(produto.precosPorCupom[cupom.id]);
                  
                  if (produtoIdReal && precoProdutoComCupom && precoProdutoComCupom > 0) {
                    cuponsProdutosData.push({
                      cupom_id: cupomIdReal,
                      produto_id: produtoIdReal,
                      preco_com_cupom: precoProdutoComCupom
                    });
                  }
                }
              });

              if (cuponsProdutosData.length > 0) {
                await supabase
                  .from('cupons_produtos')
                  .insert(cuponsProdutosData);
              }
            }
          }
        }
      }
      
      const mensagemSucesso = `🎉 Evento publicado com sucesso!\n\n👤 Produtor: ${produtorSelecionado.nome_completo || produtorSelecionado.nome_empresa}\n🎬 ${sessoes.length} sessões criadas`;
      
      alert(mensagemSucesso);
      router.push('/admin/bokunohero?senha=valtinho');

    } catch (error) {
      console.error('Erro:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
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
        <button onClick={() => router.push('/admin/bokunohero/publicar-evento')} style={{ padding: '10px 20px', marginTop: '20px' }}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '30px', borderRadius: '16px', marginBottom: '30px', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>Publicar Evento (Admin) - Passo 2/2</h1>
        <p style={{ margin: 0, opacity: 0.95, fontSize: '16px' }}>
          Configure produtor, cupons, produtos e escolha o plano de taxas
        </p>
        <p style={{ margin: '15px 0 0 0', fontSize: '15px', background: 'rgba(255,255,255,0.2)', padding: '10px 15px', borderRadius: '8px', display: 'inline-block' }}>
          <strong>📅 Evento:</strong> {evento.nome}
          {sessoes.length > 1 && <strong style={{ marginLeft: '15px' }}>🎬 {sessoes.length} sessões</strong>}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 🆕 SEÇÃO DE SELEÇÃO DE PRODUTOR */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', marginBottom: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '3px solid #FF6B6B' }}>
          <h2 style={{ color: '#FF6B6B', marginTop: 0, fontSize: '24px', marginBottom: '20px' }}>
            👤 Definir Produtor do Evento *
          </h2>

          {!produtorSelecionado ? (
            <>
              <p style={{ color: '#666', marginBottom: '15px' }}>
                Pesquise por nome completo, nome da empresa ou ID do produtor:
              </p>
              
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={buscaProdutor}
                  onChange={(e) => setBuscaProdutor(e.target.value)}
                  placeholder="Digite para pesquisar..."
                  style={{
                    width: '100%',
                    padding: '15px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                  onFocus={() => setBuscaProdutor(buscaProdutor)}
                />

                {pesquisando && (
                  <div style={{ marginTop: '10px', color: '#666' }}>
                    🔄 Pesquisando...
                  </div>
                )}

                {produtoresEncontrados.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    marginTop: '5px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    {produtoresEncontrados.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => selecionarProdutor(prod)}
                        style={{
                          padding: '15px',
                          borderBottom: '1px solid #eee',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                      >
                        <div style={{ fontWeight: 'bold', color: '#333' }}>
                          {prod.nome_completo || prod.nome_empresa || 'Sem nome'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                          📧 {prod.email} • 🆔 {prod.user_id}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {buscaProdutor && produtoresEncontrados.length === 0 && !pesquisando && (
                <div style={{ marginTop: '15px', color: '#999', fontStyle: 'italic' }}>
                  Nenhum produtor encontrado
                </div>
              )}
            </>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #4CAF50'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0', color: '#2E7D32', fontSize: '20px' }}>
                    ✅ Produtor Selecionado
                  </h3>
                  <p style={{ margin: '5px 0', color: '#333', fontSize: '16px' }}>
                    <strong>Nome:</strong> {produtorSelecionado.nome_completo || produtorSelecionado.nome_empresa}
                  </p>
                  <p style={{ margin: '5px 0', color: '#555', fontSize: '14px' }}>
                    📧 {produtorSelecionado.email}
                  </p>
                  <p style={{ margin: '5px 0', color: '#555', fontSize: '14px' }}>
                    🆔 ID: {produtorSelecionado.user_id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removerProdutor}
                  style={{
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  🗑️ Remover
                </button>
              </div>
            </div>
          )}
        </div>

        {sessoes.length > 1 && (
          <div style={{ background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '2px solid #ff9800' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#e65100', fontSize: '18px' }}>
              🎬 Evento com Múltiplas Sessões
            </h3>
            <p style={{ margin: 0, color: '#bf360c', lineHeight: '1.6', fontSize: '15px' }}>
              Seu evento tem <strong>{sessoes.length} sessões</strong>. Os cupons serão aplicados a todas as sessões com identificadores únicos.
            </p>
          </div>
        )}

        {setoresIngressos.length > 0 && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', marginBottom: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <h2 style={{ color: '#667eea', marginTop: 0, fontSize: '24px', marginBottom: '20px' }}>🎟️ Cupons de Desconto (Opcional)</h2>
            <CupomManager 
              setoresIngressos={setoresIngressos} 
              onCuponsChange={handleCuponsChange} 
            />
          </div>
        )}

        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', marginBottom: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ color: '#667eea', marginTop: 0, fontSize: '24px', marginBottom: '20px' }}>🛍️ Produtos Adicionais (Opcional)</h2>
          <ProdutoManager onProdutosChange={handleProdutosChange} cupons={cupons} />
        </div>

        <div style={{ background: 'white', padding: '35px', borderRadius: '16px', marginBottom: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#667eea', marginTop: 0, fontSize: '28px', marginBottom: '10px' }}>💰 Escolha o Plano de Taxas *</h2>
            <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
              Selecione o plano que melhor se adequa ao evento. Valores baseados em R$ 10.000 de vendas.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            
            {/* PREMIUM */}
            <div 
              onClick={() => setTaxa({ taxaComprador: 18.5, taxaProdutor: 6.5 })}
              style={{ 
                border: taxa.taxaComprador === 18.5 ? '4px solid #FFD700' : '2px solid #e0e0e0',
                borderRadius: '16px', 
                padding: '25px', 
                cursor: 'pointer',
                background: taxa.taxaComprador === 18.5 ? 'linear-gradient(135deg, #fff9e6 0%, #ffe6b3 100%)' : 'white',
                transition: 'all 0.3s',
                position: 'relative',
                boxShadow: taxa.taxaComprador === 18.5 ? '0 8px 24px rgba(255, 215, 0, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                transform: taxa.taxaComprador === 18.5 ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              {taxa.taxaComprador === 18.5 && (
                <div style={{ position: 'absolute', top: '-12px', right: '20px', background: '#FFD700', color: '#000', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)' }}>
                  🏆 RECOMENDADO
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <input 
                  type="radio" 
                  checked={taxa.taxaComprador === 18.5} 
                  onChange={() => {}}
                  style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                />
                <h3 style={{ margin: 0, color: '#FF8C00', fontSize: '22px', fontWeight: 'bold' }}>💎 Premium</h3>
              </div>
              <div style={{ fontSize: '15px', color: '#333', marginBottom: '20px', lineHeight: '1.8' }}>
                <p style={{ margin: '8px 0' }}><strong>Taxa do Cliente:</strong>
                  <span style={{ fontSize: '18px', color: '#FF8C00' }}>18,5%</span></p>
                <p style={{ margin: '8px 0' }}><strong>Você recebe:</strong> <span style={{ fontSize: '18px', color: '#4CAF50' }}>+6,5% de bônus</span></p>
                <div style={{ background: 'rgba(255, 140, 0, 0.1)', padding: '12px', borderRadius: '8px', marginTop: '15px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>💵 Exemplo: R$ 10.000 em vendas</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#FF8C00' }}>
                    Você recebe: {calcularRecebimento(18.5, 6.5)}
                  </p>
                </div>
              </div>
            </div>

            {/* PADRÃO */}
            <div 
              onClick={() => setTaxa({ taxaComprador: 15, taxaProdutor: 5 })}
              style={{ 
                border: taxa.taxaComprador === 15 ? '4px solid #4CAF50' : '2px solid #e0e0e0',
                borderRadius: '16px', 
                padding: '25px', 
                cursor: 'pointer',
                background: taxa.taxaComprador === 15 ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : 'white',
                transition: 'all 0.3s',
                position: 'relative',
                boxShadow: taxa.taxaComprador === 15 ? '0 8px 24px rgba(76, 175, 80, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                transform: taxa.taxaComprador === 15 ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <input 
                  type="radio" 
                  checked={taxa.taxaComprador === 15} 
                  onChange={() => {}}
                  style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                />
                <h3 style={{ margin: 0, color: '#4CAF50', fontSize: '22px', fontWeight: 'bold' }}>✅ Padrão</h3>
              </div>
              <div style={{ fontSize: '15px', color: '#333', marginBottom: '20px', lineHeight: '1.8' }}>
                <p style={{ margin: '8px 0' }}><strong>Taxa do Cliente:</strong> <span style={{ fontSize: '18px', color: '#4CAF50' }}>15%</span></p>
                <p style={{ margin: '8px 0' }}><strong>Você recebe:</strong> <span style={{ fontSize: '18px', color: '#4CAF50' }}>+5% de bônus</span></p>
                <div style={{ background: 'rgba(76, 175, 80, 0.1)', padding: '12px', borderRadius: '8px', marginTop: '15px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>💵 Exemplo: R$ 10.000 em vendas</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>
                    Você recebe: {calcularRecebimento(15, 5)}
                  </p>
                </div>
              </div>
            </div>

            {/* ECONÔMICO */}
            <div 
              onClick={() => setTaxa({ taxaComprador: 10, taxaProdutor: 3 })}
              style={{ 
                border: taxa.taxaComprador === 10 ? '4px solid #2196F3' : '2px solid #e0e0e0',
                borderRadius: '16px', 
                padding: '25px', 
                cursor: 'pointer',
                background: taxa.taxaComprador === 10 ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' : 'white',
                transition: 'all 0.3s',
                boxShadow: taxa.taxaComprador === 10 ? '0 8px 24px rgba(33, 150, 243, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                transform: taxa.taxaComprador === 10 ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <input 
                  type="radio" 
                  checked={taxa.taxaComprador === 10} 
                  onChange={() => {}}
                  style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                />
                <h3 style={{ margin: 0, color: '#2196F3', fontSize: '22px', fontWeight: 'bold' }}>💙 Econômico</h3>
              </div>
              <div style={{ fontSize: '15px', color: '#333', marginBottom: '20px', lineHeight: '1.8' }}>
                <p style={{ margin: '8px 0' }}><strong>Taxa do Cliente:</strong> <span style={{ fontSize: '18px', color: '#2196F3' }}>10%</span></p>
                <p style={{ margin: '8px 0' }}><strong>Você recebe:</strong> <span style={{ fontSize: '18px', color: '#4CAF50' }}>+3% de bônus</span></p>
                <div style={{ background: 'rgba(33, 150, 243, 0.1)', padding: '12px', borderRadius: '8px', marginTop: '15px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>💵 Exemplo: R$ 10.000 em vendas</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#2196F3' }}>
                    Você recebe: {calcularRecebimento(10, 3)}
                  </p>
                </div>
              </div>
            </div>

            {/* COMPETITIVO */}
            <div 
              onClick={() => setTaxa({ taxaComprador: 8, taxaProdutor: 0 })}
              style={{ 
                border: taxa.taxaComprador === 8 ? '4px solid #FF5722' : '2px solid #e0e0e0',
                borderRadius: '16px', 
                padding: '25px', 
                cursor: 'pointer',
                background: taxa.taxaComprador === 8 ? 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' : 'white',
                transition: 'all 0.3s',
                position: 'relative',
                boxShadow: taxa.taxaComprador === 8 ? '0 8px 24px rgba(255, 87, 34, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                transform: taxa.taxaComprador === 8 ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              {taxa.taxaComprador === 8 && (
                <div style={{ position: 'absolute', top: '-12px', right: '20px', background: '#FF5722', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(255, 87, 34, 0.4)' }}>
                  🔥 MENOR TAXA
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <input 
                  type="radio" 
                  checked={taxa.taxaComprador === 8} 
                  onChange={() => {}}
                  style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                />
                <h3 style={{ margin: 0, color: '#FF5722', fontSize: '22px', fontWeight: 'bold' }}>🚀 Competitivo</h3>
              </div>
              <div style={{ fontSize: '15px', color: '#333', marginBottom: '20px', lineHeight: '1.8' }}>
                <p style={{ margin: '8px 0' }}><strong>Taxa do Cliente:</strong> <span style={{ fontSize: '18px', color: '#FF5722' }}>8%</span></p>
                <p style={{ margin: '8px 0' }}><strong>Você recebe:</strong> <span style={{ fontSize: '18px', color: '#666' }}>0% (sem bônus)</span></p>
                <div style={{ background: 'rgba(255, 87, 34, 0.1)', padding: '12px', borderRadius: '8px', marginTop: '15px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>💵 Exemplo: R$ 10.000 em vendas</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#FF5722' }}>
                    Você recebe: R$ 10.000,00
                  </p>
                </div>
              </div>
            </div>

            {/* ABSORÇÃO DE TAXAS */}
            <div 
              onClick={() => setTaxa({ taxaComprador: 0, taxaProdutor: -8 })}
              style={{ 
                border: taxa.taxaComprador === 0 ? '4px solid #9C27B0' : '2px solid #e0e0e0',
                borderRadius: '16px', 
                padding: '25px', 
                cursor: 'pointer',
                background: taxa.taxaComprador === 0 ? 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)' : 'white',
                transition: 'all 0.3s',
                position: 'relative',
                boxShadow: taxa.taxaComprador === 0 ? '0 8px 24px rgba(156, 39, 176, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                transform: taxa.taxaComprador === 0 ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              {taxa.taxaComprador === 0 && (
                <div style={{ position: 'absolute', top: '-12px', right: '20px', background: '#9C27B0', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(156, 39, 176, 0.4)' }}>
                  💜 SEM TAXA
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <input 
                  type="radio" 
                  checked={taxa.taxaComprador === 0} 
                  onChange={() => {}}
                  style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                />
                <h3 style={{ margin: 0, color: '#9C27B0', fontSize: '22px', fontWeight: 'bold' }}>💜 Absorção Total</h3>
              </div>
              <div style={{ fontSize: '15px', color: '#333', marginBottom: '20px', lineHeight: '1.8' }}>
                <p style={{ margin: '8px 0' }}><strong>Taxa do Cliente:</strong> <span style={{ fontSize: '18px', color: '#9C27B0' }}>0%</span></p>
                <p style={{ margin: '8px 0' }}><strong>Você paga:</strong> <span style={{ fontSize: '18px', color: '#f44336' }}>8% da arrecadação</span></p>
                <div style={{ background: 'rgba(156, 39, 176, 0.1)', padding: '12px', borderRadius: '8px', marginTop: '15px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>💵 Exemplo: R$ 10.000 em vendas</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#9C27B0' }}>
                    Você recebe: {calcularRecebimentoAbsorcao()}
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '30px', padding: '20px', background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%)', borderRadius: '12px', border: '2px solid #2196F3' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1976d2', fontSize: '18px' }}>💡 Dica Importante:</h4>
            <p style={{ margin: 0, color: '#555', lineHeight: '1.7', fontSize: '15px' }}>
              Os planos <strong>Premium</strong> e <strong>Padrão</strong> oferecem bônus sobre suas vendas, aumentando sua receita final! 
              Quanto maior a taxa para o cliente, maior o lucro do produtor. 📈
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
          <button 
            type="button"
            onClick={() => router.push('/admin/bokunohero?senha=valtinho')}
            style={{ 
              flex: 1,
              background: '#757575', 
              color: 'white', 
              border: 'none', 
              padding: '18px 30px', 
              borderRadius: '12px', 
              fontSize: '17px', 
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseOver={(e) => e.target.style.background = '#616161'}
            onMouseOut={(e) => e.target.style.background = '#757575'}
          >
            ⬅️ Voltar
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              flex: 2,
              background: isSubmitting ? '#ccc' : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', 
              color: 'white', 
              border: 'none', 
              padding: '18px 30px', 
              borderRadius: '12px', 
              fontSize: '20px', 
              fontWeight: 'bold',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: isSubmitting ? 'none' : '0 6px 20px rgba(76, 175, 80, 0.5)',
              transition: 'all 0.3s',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(76, 175, 80, 0.6)';
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.5)';
              }
            }}
          >
            {isSubmitting ? '⏳ Publicando...' : '🚀 Publicar Evento'}
          </button>
        </div>
      </form>
    </div>
  );
}
