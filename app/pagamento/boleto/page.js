'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';

function PagamentoBoletoContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [pedido, setPedido] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [verificando, setVerificando] = useState(false);

  const pedidoId = searchParams.get('pedido_id');

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

    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const copiarLinhaDigitavel = async () => {
    if (!pedido?.boleto_linha_digitavel) return;
    
    try {
      await navigator.clipboard.writeText(pedido.boleto_linha_digitavel);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      alert('Erro ao copiar linha digitável');
    }
  };

  const imprimirBoleto = () => {
    if (pedido?.boleto_url) {
      window.open(pedido.boleto_url, '_blank');
    }
  };

  const simularPagamento = async () => {
    setVerificando(true);

    try {
      console.log('🔄 Iniciando simulação de pagamento via boleto...');
      
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
          forma_pagamento: 'boleto',
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
        // Verificar se é string ou objeto
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
            status: 'ATIVO'
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
      setVerificando(false);
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
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          
          <div style={{ marginBottom: '30px' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📄</div>
            <h1 style={{ color: '#5d34a4', margin: '0 0 10px 0', fontSize: '32px' }}>Pagamento via Boleto</h1>
            <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>Pague no banco, lotérica ou app</p>
          </div>

          <div style={{ 
            backgroundColor: '#f0e6ff', 
            padding: '20px', 
            borderRadius: '12px', 
            marginBottom: '30px',
            border: '2px solid #5d34a4'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Valor a pagar</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#27ae60' }}>
              R$ {parseFloat(pedido.valor_total).toFixed(2)}
            </div>
          </div>

          {/* Código de Barras Simulado */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            height: '120px',
            margin: '0 auto 30px',
            backgroundColor: 'white',
            border: '3px solid #5d34a4',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{ 
              width: '100%',
              height: '100%',
              background: 'repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px)',
              borderRadius: '4px',
              position: 'relative'
            }}>
              <div style={{ 
                position: 'absolute',
                bottom: '-25px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#666',
                whiteSpace: 'nowrap'
              }}>
                Código de Barras Simulado
              </div>
            </div>
          </div>

          {/* Linha Digitável */}
          {pedido.boleto_linha_digitavel && (
            <div style={{ marginBottom: '30px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#333', 
                marginBottom: '10px',
                textAlign: 'left'
              }}>
                📊 Linha Digitável:
              </label>
              <div style={{ 
                position: 'relative',
                backgroundColor: '#f8f9fa',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                padding: '15px',
                wordBreak: 'break-all',
                fontSize: '13px',
                color: '#333',
                fontFamily: 'monospace',
                textAlign: 'center',
                letterSpacing: '0.5px'
              }}>
                {pedido.boleto_linha_digitavel}
              </div>
              <button
                onClick={copiarLinhaDigitavel}
                style={{
                  width: '100%',
                  marginTop: '15px',
                  padding: '15px',
                  backgroundColor: copiado ? '#27ae60' : '#5d34a4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {copiado ? '✅ Linha Copiada!' : '📋 Copiar Linha Digitável'}
              </button>
            </div>
          )}

          {/* Botão Visualizar Boleto */}
          {pedido.boleto_url && (
            <button
              onClick={imprimirBoleto}
              style={{
                width: '100%',
                marginBottom: '30px',
                padding: '15px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              🖨️ Visualizar/Imprimir Boleto
            </button>
          )}

          {/* Data de Vencimento */}
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            marginBottom: '30px',
            border: '1px solid #ffc107'
          }}>
            <div style={{ fontSize: '14px', color: '#856404', marginBottom: '5px', fontWeight: '600' }}>
              📅 Vencimento:
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#856404' }}>
              {pedido.data_vencimento ? new Date(pedido.data_vencimento).toLocaleDateString('pt-BR') : 'Em 3 dias úteis'}
            </div>
          </div>

          <div style={{ 
            textAlign: 'left', 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <h3 style={{ fontSize: '16px', color: '#333', marginTop: 0 }}>Como pagar:</h3>
            <ol style={{ fontSize: '14px', color: '#666', paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <strong>Internet Banking:</strong> Copie a linha digitável e cole no campo de pagamento
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Lotérica/Banco:</strong> Imprima o boleto e apresente no caixa
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>App do Banco:</strong> Escaneie o código de barras com a câmera
              </li>
              <li>
                Confirmação em até 2 dias úteis após o pagamento
              </li>
            </ol>
          </div>

          {/* Ambiente de Teste */}
          <div style={{
            padding: '20px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '2px dashed #ffc107',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '14px', color: '#856404', marginBottom: '10px', fontWeight: 'bold' }}>
              ⚠️ AMBIENTE DE TESTE
            </div>
            <button
              onClick={simularPagamento}
              disabled={verificando}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: verificando ? '#95a5a6' : '#ffc107',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: verificando ? 'not-allowed' : 'pointer'
              }}
            >
              {verificando ? '⏳ Processando pagamento...' : '✅ Simular Pagamento Aprovado'}
            </button>
          </div>

          <button
            onClick={() => router.back()}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: 'white',
              color: '#dc3545',
              border: '2px solid #dc3545',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ❌ Cancelar Pedido
          </button>

        </div>

        {/* Aviso Importante */}
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #ff9800'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#e65100' }}>
            ⚠️ <strong>Importante:</strong> O pagamento de boleto pode levar até 2 dias úteis para ser confirmado. 
            Você receberá um e-mail assim que o pagamento for confirmado e seus ingressos estarão disponíveis 
            em "Meus Ingressos" com QR Code único para validação.
          </p>
        </div>

        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          fontSize: '12px',
          color: '#999'
        }}>
          <p>🔒 Pagamento seguro via boleto bancário</p>
          <p>📧 Confirmação por e-mail após compensação</p>
        </div>

      </div>
    </div>
  );
}

export default function PagamentoBoletoPage() {
  return (
    <Suspense fallback={
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando...</h2>
      </div>
    }>
      <PagamentoBoletoContent />
    </Suspense>
  );
}
