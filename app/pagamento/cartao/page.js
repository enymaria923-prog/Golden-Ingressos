'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';

function PagamentoCartaoContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [pedido, setPedido] = useState(null);
  const [parcelas, setParcelas] = useState(1);
  const [dadosCartao, setDadosCartao] = useState({
    number: '',
    holderName: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
    holderInfo: {
      name: '',
      email: '',
      cpfCnpj: '',
      postalCode: '',
      addressNumber: '',
      phone: ''
    }
  });

  const pedidoId = searchParams.get('pedido_id');
  const tipoCartao = searchParams.get('tipo'); // cartao_credito ou cartao_debito

  useEffect(() => {
    carregarPedido();
  }, [pedidoId]);

  const carregarPedido = async () => {
    try {
      setLoading(true);

      const { data: pedidoData, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single();

      if (error) {
        console.error('Erro ao carregar pedido:', error);
        return;
      }

      setPedido(pedidoData);

      // Preencher dados do comprador automaticamente
      setDadosCartao(prev => ({
        ...prev,
        holderInfo: {
          name: pedidoData.nome_comprador,
          email: pedidoData.email_comprador,
          cpfCnpj: pedidoData.cpf_comprador,
          postalCode: '',
          addressNumber: '',
          phone: pedidoData.telefone_comprador || ''
        }
      }));

    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarNumeroCartao = (valor) => {
    const limpo = valor.replace(/\D/g, '');
    const formatado = limpo.match(/.{1,4}/g);
    return formatado ? formatado.join(' ') : limpo;
  };

  const handleNumeroCartaoChange = (e) => {
    const valor = e.target.value.replace(/\D/g, '');
    if (valor.length <= 16) {
      setDadosCartao({ ...dadosCartao, number: valor });
    }
  };

  const calcularValorParcela = () => {
    if (!pedido) return 0;
    return parseFloat(pedido.valor_total) / parcelas;
  };

  const simularPagamento = async () => {
    // Validações
    if (!dadosCartao.number || dadosCartao.number.length < 13) {
      alert('Número do cartão inválido');
      return;
    }

    if (!dadosCartao.holderName) {
      alert('Nome do titular é obrigatório');
      return;
    }

    if (!dadosCartao.expiryMonth || !dadosCartao.expiryYear) {
      alert('Data de validade é obrigatória');
      return;
    }

    if (!dadosCartao.ccv || dadosCartao.ccv.length < 3) {
      alert('CVV inválido');
      return;
    }

    if (!dadosCartao.holderInfo.postalCode || !dadosCartao.holderInfo.addressNumber) {
      alert('CEP e número do endereço são obrigatórios');
      return;
    }

    setProcessando(true);

    try {
      console.log('🔄 Iniciando simulação de pagamento via cartão...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Buscar pedido
      const { data: pedidoAtual, error: pedidoErro } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single();

      if (pedidoErro) {
        console.error('❌ Erro ao buscar pedido:', pedidoErro);
        throw pedidoErro;
      }

      console.log('📦 Pedido encontrado:', pedidoAtual);

      // Criar registro de pagamento
      const { error: pagamentoError } = await supabase
        .from('pagamentos')
        .insert([{
          pedido_id: pedidoId,
          valor: parseFloat(pedidoAtual.valor_total),
          forma_pagamento: tipoCartao,
          pago: true,
          pago_em: new Date().toISOString()
        }]);

      if (pagamentoError) {
        console.error('❌ Erro ao criar pagamento:', pagamentoError);
        throw pagamentoError;
      }

      console.log('💰 Pagamento criado!');

      // Atualizar status do pedido
      const { error: pedidoError } = await supabase
        .from('pedidos')
        .update({ 
          status: 'PAGO',
          data_pagamento: new Date().toISOString()
        })
        .eq('id', pedidoId);

      if (pedidoError) {
        console.error('❌ Erro ao atualizar pedido:', pedidoError);
        throw pedidoError;
      }

      console.log('✅ Pedido atualizado para PAGO!');

      // Processar itens e gerar ingressos
      let itens = [];
      
      if (pedidoAtual.itens) {
        if (typeof pedidoAtual.itens === 'string') {
          itens = JSON.parse(pedidoAtual.itens);
        } else {
          itens = pedidoAtual.itens;
        }
      }

      console.log('🎫 Itens do pedido:', itens);

      if (!Array.isArray(itens) || itens.length === 0) {
        console.error('❌ Nenhum item encontrado no pedido!');
        throw new Error('Nenhum item encontrado no pedido');
      }

      // Gerar ingressos individuais com QR Code único
      const ingressosParaGerar = [];

      itens.forEach((item, index) => {
        const quantidade = item.quantidade || 1;
        console.log(`🎟️ Gerando ${quantidade} ingresso(s) do tipo: ${item.tipo}`);
        
        for (let i = 0; i < quantidade; i++) {
          const qrCode = `INGRESSO-${pedidoId}-${item.ingresso_id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          ingressosParaGerar.push({
            pedido_id: pedidoId,
            evento_id: pedidoAtual.evento_id,
            sessao_id: pedidoAtual.sessao_id,
            ingresso_id: item.ingresso_id,
            tipo_ingresso: item.tipo,
            valor: item.valor_unitario,
            comprador_nome: pedidoAtual.nome_comprador,
            comprador_email: pedidoAtual.email_comprador,
            comprador_cpf: pedidoAtual.cpf_comprador,
            assento: item.assento || null,
            qr_code: qrCode,
            status: 'ATIVO',
            tipo_pagamento: tipoCartao,
            parcelas: tipoCartao === 'cartao_credito' ? parcelas : 1
          });
        }
      });

      console.log(`📝 Total de ingressos a gerar: ${ingressosParaGerar.length}`);
      console.log('📋 Ingressos:', ingressosParaGerar);

      if (ingressosParaGerar.length > 0) {
        const { data: ingressosGerados, error: ingressosError } = await supabase
          .from('ingressos_vendidos')
          .insert(ingressosParaGerar)
          .select();

        if (ingressosError) {
          console.error('❌ Erro ao gerar ingressos:', ingressosError);
          throw ingressosError;
        }

        console.log('🎉 Ingressos gerados com sucesso:', ingressosGerados);
      }

      // ✅ ATUALIZAR ESTOQUE DE INGRESSOS
      console.log('📊 Atualizando estoque...');
      
      for (const item of itens) {
        const quantidade = item.quantidade || 1;
        const ingressoId = item.ingresso_id;

        // Buscar dados do ingresso
        const { data: ingressoOriginal } = await supabase
          .from('ingressos')
          .select('*, lote_id')
          .eq('id', ingressoId)
          .single();

        if (ingressoOriginal) {
          // Atualizar vendidos do ingresso
          const { error: updateIngressoError } = await supabase
            .from('ingressos')
            .update({ 
              vendidos: (ingressoOriginal.vendidos || 0) + quantidade 
            })
            .eq('id', ingressoId);

          if (updateIngressoError) {
            console.error('❌ Erro ao atualizar estoque do ingresso:', updateIngressoError);
          } else {
            console.log(`✅ Ingresso ${ingressoId}: +${quantidade} vendidos`);
          }

          // Se tem lote, atualizar o lote também
          if (ingressoOriginal.lote_id) {
            const { data: lote } = await supabase
              .from('lotes')
              .select('quantidade_vendida')
              .eq('id', ingressoOriginal.lote_id)
              .single();

            if (lote) {
              await supabase
                .from('lotes')
                .update({ 
                  quantidade_vendida: (lote.quantidade_vendida || 0) + quantidade 
                })
                .eq('id', ingressoOriginal.lote_id);

              console.log(`✅ Lote ${ingressoOriginal.lote_id}: +${quantidade} vendidos`);
            }
          }
        }
      }

      // Atualizar total de ingressos vendidos do evento
      const totalVendidosAgora = itens.reduce((acc, item) => acc + (item.quantidade || 1), 0);
      
      const { data: eventoAtual } = await supabase
        .from('eventos')
        .select('ingressos_vendidos')
        .eq('id', pedidoAtual.evento_id)
        .single();

      if (eventoAtual) {
        await supabase
          .from('eventos')
          .update({ 
            ingressos_vendidos: (eventoAtual.ingressos_vendidos || 0) + totalVendidosAgora 
          })
          .eq('id', pedidoAtual.evento_id);

        console.log(`✅ Evento: +${totalVendidosAgora} ingressos vendidos`);
      }

      console.log('📊 Estoque atualizado com sucesso!');

      // Redirecionar
      console.log('🚀 Redirecionando para meus-ingressos...');
      router.push('/meus-ingressos');

    } catch (error) {
      console.error('❌ Erro ao simular pagamento:', error);
      alert('Erro ao processar pagamento: ' + error.message);
    } finally {
      setProcessando(false);
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando...</h2>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>⚠️ Pedido não encontrado</h2>
        <button 
          onClick={() => router.push('/')}
          style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', paddingBottom: '40px' }}>
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px 30px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>
          💳 Pagamento - {tipoCartao === 'cartao_credito' ? 'Cartão de Crédito' : 'Cartão de Débito'}
        </h1>
      </header>

      <div style={{ maxWidth: '600px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* Resumo do Pedido */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Pedido #{pedido.id.substring(0, 8)}</p>
              <p style={{ margin: '5px 0 0 0', color: '#2c3e50', fontSize: '18px', fontWeight: 'bold' }}>
                Total: R$ {parseFloat(pedido.valor_total).toFixed(2)}
              </p>
            </div>
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#fff3cd',
              color: '#856404',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              ⏳ Aguardando
            </div>
          </div>
        </div>

        {/* Parcelamento (apenas para crédito) */}
        {tipoCartao === 'cartao_credito' && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h3 style={{ color: '#5d34a4', marginTop: 0, fontSize: '16px', marginBottom: '15px' }}>
              Parcelamento
            </h3>
            <select
              value={parcelas}
              onChange={(e) => setParcelas(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                <option key={num} value={num}>
                  {num}x de R$ {calcularValorParcela().toFixed(2)} {num === 1 ? 'à vista' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Formulário do Cartão */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0, fontSize: '20px', marginBottom: '25px' }}>
            Dados do Cartão
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Número do Cartão */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                Número do Cartão *
              </label>
              <input
                type="text"
                value={formatarNumeroCartao(dadosCartao.number)}
                onChange={handleNumeroCartaoChange}
                placeholder="0000 0000 0000 0000"
                maxLength="19"
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  letterSpacing: '2px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Nome do Titular */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                Nome no Cartão *
              </label>
              <input
                type="text"
                value={dadosCartao.holderName}
                onChange={(e) => setDadosCartao({ ...dadosCartao, holderName: e.target.value.toUpperCase() })}
                placeholder="NOME COMO ESTÁ NO CARTÃO"
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  textTransform: 'uppercase',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Validade e CVV */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                  Mês *
                </label>
                <input
                  type="text"
                  value={dadosCartao.expiryMonth}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '');
                    if (valor.length <= 2 && (valor === '' || (parseInt(valor) >= 1 && parseInt(valor) <= 12))) {
                      setDadosCartao({ ...dadosCartao, expiryMonth: valor });
                    }
                  }}
                  placeholder="MM"
                  maxLength="2"
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                  Ano *
                </label>
                <input
                  type="text"
                  value={dadosCartao.expiryYear}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '');
                    if (valor.length <= 4) {
                      setDadosCartao({ ...dadosCartao, expiryYear: valor });
                    }
                  }}
                  placeholder="AAAA"
                  maxLength="4"
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                  CVV *
                </label>
                <input
                  type="text"
                  value={dadosCartao.ccv}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '');
                    if (valor.length <= 4) {
                      setDadosCartao({ ...dadosCartao, ccv: valor });
                    }
                  }}
                  placeholder="123"
                  maxLength="4"
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Endereço de Cobrança */}
            <div style={{
              borderTop: '1px solid #e0e0e0',
              paddingTop: '25px',
              marginTop: '10px'
            }}>
              <h3 style={{ color: '#2c3e50', fontSize: '16px', marginTop: 0, marginBottom: '20px' }}>
                Endereço de Cobrança
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                    CEP *
                  </label>
                  <input
                    type="text"
                    value={dadosCartao.holderInfo.postalCode}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, '');
                      if (valor.length <= 8) {
                        setDadosCartao({
                          ...dadosCartao,
                          holderInfo: { ...dadosCartao.holderInfo, postalCode: valor }
                        });
                      }
                    }}
                    placeholder="00000000"
                    maxLength="8"
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                    Número *
                  </label>
                  <input
                    type="text"
                    value={dadosCartao.holderInfo.addressNumber}
                    onChange={(e) => setDadosCartao({
                      ...dadosCartao,
                      holderInfo: { ...dadosCartao.holderInfo, addressNumber: e.target.value }
                    })}
                    placeholder="123"
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#999', margin: '10px 0 0 0' }}>
                ℹ️ Usamos o CEP apenas para validação com a operadora do cartão
              </p>
            </div>

            {/* Ambiente de Teste */}
            <div style={{
              padding: '20px',
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              border: '2px dashed #ffc107',
              marginTop: '10px'
            }}>
              <div style={{ fontSize: '14px', color: '#856404', marginBottom: '10px', fontWeight: 'bold' }}>
                ⚠️ AMBIENTE DE TESTE
              </div>
              <button
                onClick={simularPagamento}
                disabled={processando}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: processando ? '#95a5a6' : '#ffc107',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: processando ? 'not-allowed' : 'pointer'
                }}
              >
                {processando ? '⏳ Processando pagamento...' : '✅ Simular Pagamento Aprovado'}
              </button>
            </div>

            {/* Botão de Pagamento Real (desabilitado) */}
            <button
              disabled={true}
              style={{
                width: '100%',
                backgroundColor: '#e0e0e0',
                color: '#999',
                border: 'none',
                padding: '18px',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'not-allowed',
                marginTop: '10px'
              }}
            >
              💳 Pagamento Real (Em Produção)
            </button>

          </div>
        </div>

        {/* Segurança */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#d4edda',
          borderRadius: '8px',
          border: '1px solid #c3e6cb'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#155724', textAlign: 'center' }}>
            🔒 Pagamento 100% seguro. Seus dados são criptografados
          </p>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            onClick={() => router.back()}
            style={{ 
              color: '#5d34a4', 
              background: 'none',
              border: 'none',
              textDecoration: 'underline',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ← Voltar
          </button>
        </div>

      </div>
    </div>
  );
}

export default function PagamentoCartaoPage() {
  return (
    <Suspense fallback={
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando...</h2>
      </div>
    }>
      <PagamentoCartaoContent />
    </Suspense>
  );
}
