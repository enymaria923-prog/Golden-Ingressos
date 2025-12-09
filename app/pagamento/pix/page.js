'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function PagamentoPixContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [pedido, setPedido] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [verificandoPagamento, setVerificandoPagamento] = useState(false);

  const pedidoId = searchParams.get('pedido_id');

  useEffect(() => {
    carregarPedido();
    
    // Verificar status do pagamento a cada 5 segundos
    const interval = setInterval(() => {
      verificarStatusPagamento();
    }, 5000);

    return () => clearInterval(interval);
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

  const verificarStatusPagamento = async () => {
    if (verificandoPagamento) return;
    
    try {
      setVerificandoPagamento(true);

      const { data: pedidoAtualizado } = await supabase
        .from('pedidos')
        .select('status')
        .eq('id', pedidoId)
        .single();

      if (pedidoAtualizado && pedidoAtualizado.status === 'CONFIRMADO') {
        // Pagamento confirmado! Redirecionar para página de sucesso
        router.push(`/pedido/sucesso?pedido_id=${pedidoId}`);
      }

    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
    } finally {
      setVerificandoPagamento(false);
    }
  };

  const copiarCodigoPix = async () => {
    if (!pedido?.pix_copy_paste) return;
    
    try {
      await navigator.clipboard.writeText(pedido.pix_copy_paste);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      alert('Erro ao copiar código PIX');
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
        <Link href="/">
          <button style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}>
            Voltar para Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', paddingBottom: '40px' }}>
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px 30px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>💳 Pagamento PIX</h1>
      </header>

      <div style={{ maxWidth: '600px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* Card Principal */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          
          {/* Status */}
          <div style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#fff3cd',
            color: '#856404',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '20px'
          }}>
            ⏳ Aguardando Pagamento
          </div>

          <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>
            R$ {parseFloat(pedido.valor_total).toFixed(2)}
          </h2>

          <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
            Pedido #{pedido.id.substring(0, 8)}
          </p>

          {/* QR Code */}
          {pedido.pix_qr_code && (
            <div style={{ marginBottom: '30px' }}>
              <div style={{
                backgroundColor: 'white',
                border: '4px solid #5d34a4',
                borderRadius: '12px',
                padding: '20px',
                display: 'inline-block'
              }}>
                <img 
                  src={`data:image/png;base64,${pedido.pix_qr_code}`}
                  alt="QR Code PIX" 
                  style={{ width: '250px', height: '250px' }}
                />
              </div>
              <p style={{ color: '#666', fontSize: '14px', marginTop: '15px' }}>
                📱 Escaneie o QR Code com o app do seu banco
              </p>
            </div>
          )}

          {/* Código PIX Copia e Cola */}
          {pedido.pix_copy_paste && (
            <div style={{ marginTop: '30px' }}>
              <p style={{ color: '#2c3e50', fontWeight: '600', marginBottom: '10px' }}>
                Ou pague com PIX Copia e Cola:
              </p>
              
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '2px dashed #dee2e6',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px',
                wordBreak: 'break-all',
                fontSize: '12px',
                color: '#495057',
                maxHeight: '100px',
                overflowY: 'auto'
              }}>
                {pedido.pix_copy_paste}
              </div>

              <button
                onClick={copiarCodigoPix}
                style={{
                  width: '100%',
                  backgroundColor: copiado ? '#28a745' : '#5d34a4',
                  color: 'white',
                  border: 'none',
                  padding: '15px',
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
          )}

          {/* Instruções */}
          <div style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #90caf9',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#1976d2', fontSize: '16px', marginTop: 0, marginBottom: '15px' }}>
              📝 Como pagar:
            </h3>
            <ol style={{ color: '#555', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>Abra o app do seu banco</li>
              <li style={{ marginBottom: '8px' }}>Escolha pagar com PIX</li>
              <li style={{ marginBottom: '8px' }}>Escaneie o QR Code ou cole o código</li>
              <li style={{ marginBottom: '8px' }}>Confirme o pagamento</li>
              <li>Pronto! Seus ingressos serão liberados automaticamente</li>
            </ol>
          </div>

          {/* Expiração */}
          {pedido.pix_expiration_date && (
            <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '20px' }}>
              ⏰ Expira em: {new Date(pedido.pix_expiration_date).toLocaleString('pt-BR')}
            </p>
          )}

          {/* Verificando pagamento */}
          {verificandoPagamento && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#d4edda',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#155724'
            }}>
              🔄 Verificando pagamento...
            </div>
          )}

        </div>

        {/* Informações Adicionais */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>
            💡 O pagamento via PIX é instantâneo e seus ingressos serão liberados automaticamente após a confirmação
          </p>
          
          <Link href="/" style={{ color: '#5d34a4', textDecoration: 'none', fontSize: '14px' }}>
            ← Voltar para Home
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function PagamentoPixPage() {
  return (
    <Suspense fallback={
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando...</h2>
      </div>
    }>
      <PagamentoPixContent />
    </Suspense>
  );
}
