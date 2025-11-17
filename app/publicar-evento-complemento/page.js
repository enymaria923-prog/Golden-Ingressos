'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import CuponsManager from '../publicar-evento/components/CuponsManager';
import ProdutoManager from '../publicar-evento/components/ProdutoManager';

function PublicarEventoComplementoContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventoId = searchParams.get('evento');
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evento, setEvento] = useState(null);
  
  const [cupons, setCupons] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [taxa, setTaxa] = useState({ taxaComprador: 15, taxaProdutor: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setLoading(false);

    } catch (error) {
      console.error('💥 Erro:', error);
      alert('Erro ao carregar dados do evento!');
      router.push('/publicar-evento');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log('💰 Atualizando taxas do evento...');

      // ====== 1. ATUALIZAR TAXAS E MARCAR COMO PUBLICADO ======
      const { error: updateError } = await supabase
        .from('eventos')
        .update({
          TaxaCliente: taxa.taxaComprador,
          TaxaProdutor: taxa.taxaProdutor,
          rascunho: false,
          status: 'ativo'
        })
        .eq('id', eventoId);

      if (updateError) {
        throw new Error(`Erro ao atualizar taxas: ${updateError.message}`);
      }

      // ====== 2. SALVAR PRODUTOS (SE HOUVER) ======
      if (produtos && produtos.length > 0) {
        console.log('🛍️ Salvando produtos...');
        
        for (const produto of produtos) {
          let imagemProdutoUrl = null;

          if (produto.imagem) {
            const fileExtension = produto.imagem.name.split('.').pop();
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(7);
            const filePath = `produtos/${user.id}/${eventoId}/${timestamp}-${randomStr}.${fileExtension}`;

            const { data: uploadProdData, error: uploadProdError } = await supabase.storage
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
            quantidade_disponivel: parseInt(produto.quantidade) || 0,
            quantidade_vendida: 0,
            tamanho: produto.tamanho || null,
            imagem_url: imagemProdutoUrl,
            tipo_produto: produto.tipoProduto,
            ativo: true,
            user_id: user.id
          };

          const { error: produtoError } = await supabase
            .from('produtos')
            .insert([produtoData]);

          if (produtoError) {
            throw new Error(`Erro ao salvar produto "${produto.nome}": ${produtoError.message}`);
          }

          console.log(`✅ Produto "${produto.nome}" salvo!`);
        }
      }

      // ====== 3. SALVAR CUPONS (SE HOUVER) ======
      if (cupons && cupons.length > 0) {
        console.log('🎟️ Salvando cupons...');
        
        for (const cupom of cupons) {
          // Validar campos obrigatórios
          if (!cupom.codigo || cupom.codigo.trim() === '') {
            throw new Error('Preencha o código de todos os cupons!');
          }
          if (!cupom.desconto || parseFloat(cupom.desconto) <= 0) {
            throw new Error(`Preencha um desconto válido para o cupom "${cupom.codigo}"!`);
          }

          const cupomData = {
            evento_id: eventoId,
            codigo: cupom.codigo.toUpperCase(),
            tipo_desconto: cupom.tipoDesconto || 'porcentagem',
            valor_desconto: parseFloat(cupom.desconto),
            quantidade_total: parseInt(cupom.quantidade) || null,
            quantidade_usada: 0,
            data_validade: cupom.dataValidade || null,
            ativo: true,
            user_id: user.id
          };

          const { error: cupomError } = await supabase
            .from('cupons')
            .insert([cupomData]);

          if (cupomError) {
            console.error('❌ Erro ao salvar cupom:', cupomError);
            throw new Error(`Erro ao salvar cupom "${cupom.codigo}": ${cupomError.message}`);
          }

          console.log(`✅ Cupom "${cupom.codigo}" salvo!`);
        }
      }
      
      alert('🎉 Evento publicado com sucesso!');
      router.push('/produtor');

    } catch (error) {
      console.error('💥 Erro:', error);
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
        {/* SEÇÃO DE CUPONS */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0 }}>🎟️ Cupons de Desconto (Opcional)</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            Adicione cupons de desconto para atrair mais clientes
          </p>
          <CuponsManager onCuponsChange={setCupons} />
        </div>

        {/* SEÇÃO DE PRODUTOS */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0 }}>🛍️ Produtos Adicionais (Opcional)</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            Venda camisetas, copos, brindes e outros produtos do seu evento
          </p>
          <ProdutoManager onProdutosChange={setProdutos} />
        </div>

        {/* SEÇÃO DE TAXAS */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0 }}>💰 Escolha seu Plano de Taxas *</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Selecione o plano que melhor se adequa ao seu evento
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* PLANO PREMIUM */}
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

            {/* PLANO PADRÃO */}
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

            {/* PLANO ECONÔMICO */}
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

        {/* BOTÕES */}
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
            ⬅️ Cancelar
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
              boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(76, 175, 80, 0.4)'
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
      <PublicarEventoComplementoContent />
    </Suspense>
  );
}
