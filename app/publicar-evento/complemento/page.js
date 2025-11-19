'use client';
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import CupomManager from '../components/CupomManager';
import ProdutoManager from '../components/ProdutoManager';

function ComplementoContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventoId = searchParams.get('evento');
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evento, setEvento] = useState(null);
  const [setoresIngressos, setSetoresIngressos] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [taxa, setTaxa] = useState({ taxaComprador: 15, taxaProdutor: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoriza o callback para evitar recriações
  const handleProdutosChange = useCallback((novosProdutos) => {
    setProdutos(novosProdutos);
  }, []);

  const handleCuponsChange = useCallback((novosCupons) => {
    setCupons(novosCupons);
  }, []);

  useEffect(() => {
    if (!eventoId) {
      router.push('/publicar-evento');
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
        .eq('user_id', session.user.id)
        .single();

      if (eventoError || !eventoData) {
        alert('Evento não encontrado!');
        router.push('/publicar-evento');
        return;
      }

      setEvento(eventoData);

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
                  quantidade: ing.quantidade
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
              quantidade: ing.quantidade
            });
          }
        }
      });

      setSetoresIngressos(Array.from(setoresMap.values()));
      setLoading(false);

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao carregar dados do evento!');
      router.push('/publicar-evento');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase
        .from('eventos')
        .update({
          TaxaCliente: taxa.taxaComprador,
          TaxaProdutor: taxa.taxaProdutor,
          rascunho: false
        })
        .eq('id', eventoId);

      if (updateError) {
        throw new Error(`Erro ao atualizar taxas: ${updateError.message}`);
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
            const filePath = `produtos/${user.id}/${eventoId}/${timestamp}-${randomStr}.${fileExtension}`;

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
            user_id: user.id
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

          const cupomData = {
            evento_id: eventoId,
            codigo: cupom.codigo.toUpperCase(),
            descricao: cupom.descricao || null,
            ativo: true,
            quantidade_total: cupom.quantidadeTotal ? parseInt(cupom.quantidadeTotal) : null,
            quantidade_usada: 0,
            data_validade_inicio: cupom.dataInicio || null,
            data_validade_fim: cupom.dataFim || null,
            user_id: user.id
          };

          const { data: cupomInserido, error: cupomError } = await supabase
            .from('cupons')
            .insert([cupomData])
            .select();

          if (cupomError) {
            throw new Error(`Erro ao salvar cupom "${cupom.codigo}": ${cupomError.message}`);
          }

          const cupomIdReal = cupomInserido[0].id;
          const cuponsIngressosData = [];

          Object.keys(cupom.precosPorIngresso || {}).forEach(chave => {
            const precoComCupom = parseFloat(cupom.precosPorIngresso[chave]);
            
            if (precoComCupom && precoComCupom > 0) {
              const partes = chave.split('-');
              const ingressoId = parseInt(partes[partes.length - 1]);
              
              cuponsIngressosData.push({
                cupom_id: cupomIdReal,
                ingresso_id: ingressoId,
                preco_com_cupom: precoComCupom
              });
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
                .from('cupom_ingresso_preco')
                .insert(cuponsProdutosData);
            }
          }
        }
      }
      
      alert('🎉 Evento publicado com sucesso!');
      router.push('/produtor');

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
        <button onClick={() => router.push('/publicar-evento')} style={{ padding: '10px 20px', marginTop: '20px' }}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ background: '#5d34a4', color: 'white', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 10px 0' }}>Publicar Evento - Passo 2/2</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Configure cupons, produtos e escolha seu plano de taxas
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
          <strong>Evento:</strong> {evento.nome}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {setoresIngressos.length > 0 && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#5d34a4', marginTop: 0 }}>🎟️ Cupons de Desconto (Opcional)</h2>
            <CupomManager 
              setoresIngressos={setoresIngressos} 
              onCuponsChange={handleCuponsChange} 
            />
          </div>
        )}

        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0 }}>🛍️ Produtos Adicionais (Opcional)</h2>
          <ProdutoManager onProdutosChange={handleProdutosChange} cupons={cupons} />
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0 }}>💰 Escolha seu Plano de Taxas *</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Selecione o plano que melhor se adequa ao seu evento
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div 
              onClick={() => setTaxa({ taxaComprador: 15, taxaProdutor: 5 })}
              style={{ 
                border: taxa.taxaComprador === 15 ? '3px solid #4CAF50' : '2px solid #ddd',
                borderRadius: '12px', 
                padding: '25px', 
                cursor: 'pointer',
                background: taxa.taxaComprador === 15 ? '#f1f8f4' : 'white',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <input 
                  type="radio" 
                  checked={taxa.taxaComprador === 15} 
                  onChange={() => {}}
                  style={{ width: '20px', height: '20px' }}
                />
                <h3 style={{ margin: 0, color: '#4CAF50', fontSize: '20px' }}>Premium</h3>
              </div>
              <div style={{ fontSize: '14px', color: '#555', marginBottom: '15px' }}>
                <p><strong>Taxa do Cliente:</strong> 15%</p>
                <p><strong>Você recebe:</strong> +5% de bônus</p>
              </div>
              <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                <strong>✓ Visibilidade máxima</strong><br/>
                <strong>✓ Destaque no site</strong><br/>
                <strong>✓ Suporte prioritário</strong>
              </div>
            </div>

            <div 
              onClick={() => setTaxa({ taxaComprador: 10, taxaProdutor: 3 })}
              style={{ 
                border: taxa.taxaComprador === 10 ? '3px solid #2196F3' : '2px solid #ddd',
                borderRadius: '12px', 
                padding: '25px', 
                cursor: 'pointer',
                background: taxa.taxaComprador === 10 ? '#e3f2fd' : 'white',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <input 
                  type="radio" 
                  checked={taxa.taxaComprador === 10} 
                  onChange={() => {}}
                  style={{ width: '20px', height: '20px' }}
                />
                <h3 style={{ margin: 0, color: '#2196F3', fontSize: '20px' }}>Padrão</h3>
              </div>
              <div style={{ fontSize: '14px', color: '#555', marginBottom: '15px' }}>
                <p><strong>Taxa do Cliente:</strong> 10%</p>
                <p><strong>Você recebe:</strong> +3% de bônus</p>
              </div>
              <div style={{ background: '#e3f2fd', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                <strong>✓ Visibilidade padrão</strong><br/>
                <strong>✓ Listagem básica</strong><br/>
                <strong>✓ Suporte padrão</strong>
              </div>
            </div>

            <div 
              onClick={() => setTaxa({ taxaComprador: 8, taxaProdutor: 0 })}
              style={{ 
                border: taxa.taxaComprador === 8 ? '3px solid #FF9800' : '2px solid #ddd',
                borderRadius: '12px', 
                padding: '25px', 
                cursor: 'pointer',
                background: taxa.taxaComprador === 8 ? '#fff3e0' : 'white',
                transition: 'all 0.3s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <input 
                  type="radio" 
                  checked={taxa.taxaComprador === 8} 
                  onChange={() => {}}
                  style={{ width: '20px', height: '20px' }}
                />
                <h3 style={{ margin: 0, color: '#FF9800', fontSize: '20px' }}>Econômico</h3>
              </div>
              <div style={{ fontSize: '14px', color: '#555', marginBottom: '15px' }}>
                <p><strong>Taxa do Cliente:</strong> 8%</p>
                <p><strong>Você recebe:</strong> 0% (sem bônus)</p>
              </div>
              <div style={{ background: '#fff3e0', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                <strong>🏆 MENOR TAXA DO MERCADO</strong><br/>
                <strong>✓ Garanta o melhor preço</strong><br/>
                <strong>✓ Atraia mais clientes</strong>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            type="button"
            onClick={() => router.push('/produtor')}
            style={{ 
              flex: 1,
              background: '#9e9e9e', 
              color: 'white', 
              border: 'none', 
              padding: '15px 30px', 
              borderRadius: '8px', 
              fontSize: '16px', 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ⬅️ Voltar
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              flex: 2,
              background: isSubmitting ? '#ccc' : '#4CAF50', 
              color: 'white', 
              border: 'none', 
              padding: '15px 30px', 
              borderRadius: '8px', 
              fontSize: '18px', 
              fontWeight: 'bold',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
            }}
          >
            {isSubmitting ? '⏳ Publicando...' : '🚀 Publicar Evento'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PublicarEventoComplemento() {
  return (
    <Suspense fallback={
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando...</h2>
      </div>
    }>
      <ComplementoContent />
    </Suspense>
  );
}
