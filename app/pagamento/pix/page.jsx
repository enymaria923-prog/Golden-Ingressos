'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';

function PixPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [copiado, setCopiado] = useState(false);
  const [temporizador, setTemporizador] = useState(300); // 5 minutos
  const [verificando, setVerificando] = useState(false);

  const pedidoId = searchParams.get('pedido_id');
  const valor = searchParams.get('valor');
  const nome = searchParams.get('nome');

  // QR Code simulado (código PIX fictício)
  const codigoPix = `00020126580014BR.GOV.BCB.PIX0136${pedidoId}${Math.random().toString(36).substring(7)}520400005303986540${valor}5802BR5925${nome}6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  useEffect(() => {
    const interval = setInterval(() => {
      setTemporizador((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoPix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const simularPagamento = async () => {
    setVerificando(true);

    try {
      // Aguardar 2 segundos para simular verificação
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Criar registro de pagamento
      const { error: pagamentoError } = await supabase
        .from('pagamentos')
        .insert([{
          pedido_id: pedidoId,
          valor: parseFloat(valor),
          forma_pagamento: 'pix',
          pago: true,
          pago_em: new Date().toISOString()
        }]);

      if (pagamentoError) throw pagamentoError;

      // Atualizar status do pedido
      const { error: pedidoError } = await supabase
        .from('pedidos')
        .update({ 
          status: 'PAGO',
          data_pagamento: new Date().toISOString()
        })
        .eq('id', pedidoId);

      if (pedidoError) throw pedidoError;

      // Redirecionar para meus ingressos
      router.push('/meus-ingressos');

    } catch (error) {
      console.error('Erro ao simular pagamento:', error);
      alert('Erro ao processar pagamento: ' + error.message);
    } finally {
      setVerificando(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Card Principal */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          
          {/* Cabeçalho */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📱</div>
            <h1 style={{ color: '#5d34a4', margin: '0 0 10px 0', fontSize: '32px' }}>Pagamento via PIX</h1>
            <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>Escaneie o QR Code ou copie o código</p>
          </div>

          {/* Valor */}
          <div style={{ 
            backgroundColor: '#f0e6ff', 
            padding: '20px', 
            borderRadius: '12px', 
            marginBottom: '30px',
            border: '2px solid #5d34a4'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Valor a pagar</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#27ae60' }}>
              R$ {valor}
            </div>
          </div>

          {/* QR Code Simulado */}
          <div style={{
            width: '250px',
            height: '250px',
            margin: '0 auto 30px',
            backgroundColor: 'white',
            border: '3px solid #5d34a4',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '100px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div>🎫</div>
              <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>QR Code Simulado</div>
            </div>
          </div>

          {/* Código PIX */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#333', 
              marginBottom: '10px',
              textAlign: 'left'
            }}>
              Código PIX Copia e Cola:
            </label>
            <div style={{ 
              position: 'relative',
              backgroundColor: '#f8f9fa',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              padding: '15px',
              wordBreak: 'break-all',
              fontSize: '12px',
              color: '#333',
              fontFamily: 'monospace',
              textAlign: 'left',
              maxHeight: '100px',
              overflowY: 'auto'
            }}>
              {codigoPix}
            </div>
            <button
              onClick={copiarCodigo}
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
              {copiado ? '✅ Código Copiado!' : '📋 Copiar Código PIX'}
            </button>
          </div>

          {/* Temporizador */}
          <div style={{ 
            padding: '15px', 
            backgroundColor: temporizador < 60 ? '#fff3cd' : '#f0e6ff',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
              Tempo restante para pagamento
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: temporizador < 60 ? '#dc3545' : '#5d34a4'
            }}>
              ⏱️ {formatarTempo(temporizador)}
            </div>
          </div>

          {/* Instruções */}
          <div style={{ 
            textAlign: 'left', 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <h3 style={{ fontSize: '16px', color: '#333', marginTop: 0 }}>Como pagar:</h3>
            <ol style={{ fontSize: '14px', color: '#666', paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '10px' }}>Abra o app do seu banco</li>
              <li style={{ marginBottom: '10px' }}>Escolha a opção PIX</li>
              <li style={{ marginBottom: '10px' }}>Escaneie o QR Code ou cole o código</li>
              <li style={{ marginBottom: '10px' }}>Confirme o pagamento</li>
            </ol>
          </div>

          {/* Botão de Simulação (APENAS PARA TESTE) */}
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
              {verificando ? '⏳ Verificando pagamento...' : '✅ Simular Pagamento Aprovado'}
            </button>
          </div>

          {/* Botão Cancelar */}
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

        {/* Avisos */}
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          fontSize: '12px',
          color: '#999'
        }}>
          <p>🔒 Pagamento seguro via PIX</p>
          <p>⚡ Confirmação instantânea após o pagamento</p>
        </div>

      </div>
    </div>
  );
}

export default function PixPaymentPage() {
  return (
    <Suspense fallback={
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando...</h2>
      </div>
    }>
      <PixPaymentContent />
    </Suspense>
  );
}
