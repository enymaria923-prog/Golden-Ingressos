'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PagamentoBoletoContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [pedido, setPedido] = useState(null);
  const [copiado, setCopiado] = useState(false);

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
        <h1 style={{ margin: 0, fontSize: '28px' }}>📄 Pagamento - Boleto</h1>
      </header>

      <div style={{ maxWidth: '700px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* Card Principal */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          
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

          {/* Linha Digitável */}
          {pedido.boleto_linha_digitavel && (
            <div style={{ marginBottom: '25px' }}>
              <p style={{ color: '#2c3e50', fontWeight: '600', marginBottom: '10px', fontSize: '16px' }}>
                📊 Linha Digitável:
              </p>
              
              <div style={{
                backgroundColor: '#f8f9fa',
                border: '2px dashed #dee2e6',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '15px',
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#495057',
                textAlign: 'center',
                letterSpacing: '1px',
                wordBreak: 'break-all'
              }}>
                {pedido.boleto_linha_digitavel}
              </div>

              <button
                onClick={copiarLinhaDigitavel}
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
                  transition: 'all 0.3s',
                  marginBottom: '15px'
                }}
              >
                {copiado ? '✅ Linha Digitável Copiada!' : '📋 Copiar Linha Digitável'}
              </button>
            </div>
          )}

          {/* Código de Barras */}
          {pedido.boleto_codigo_barras && (
            <div style={{ marginBottom: '25px' }}>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                Código de Barras: <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{pedido.boleto_codigo_barras}</span>
              </p>
            </div>
          )}

          {/* Botão Imprimir/Visualizar */}
          {pedido.boleto_url && (
            <button
              onClick={imprimirBoleto}
              style={{
                width: '100%',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s',
                marginBottom: '30px'
              }}
            >
              🖨️ Visualizar/Imprimir Boleto
            </button>
          )}

          {/* Instruções */}
          <div style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #90caf9',
            borderRadius: '8px',
            padding: '25px',
            marginBottom: '25px'
          }}>
            <h3 style={{ color: '#1976d2', fontSize: '16px', marginTop: 0, marginBottom: '15px' }}>
              📝 Como pagar:
            </h3>
            <ol style={{ color: '#555', fontSize: '14px', paddingLeft: '20px', margin: 0, lineHeight: '1.8' }}>
              <li style={{ marginBottom: '10px' }}>
                <strong>Internet Banking:</strong> Copie a linha digitável e cole no campo de pagamento de boleto do seu banco
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Lotérica/Banco:</strong> Imprima o boleto e pague no caixa
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>App do Banco:</strong> Use a câmera para escanear o código de barras do boleto impresso
              </li>
              <li>
                Após o pagamento, seus ingressos serão liberados em até 2 dias úteis
              </li>
            </ol>
          </div>

          {/* Data de Vencimento */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffc107'
          }}>
            <span style={{ fontSize: '14px', color: '#856404', fontWeight: '600' }}>
              📅 Vencimento:
            </span>
            <span style={{ fontSize: '16px', color: '#856404', fontWeight: 'bold' }}>
              {pedido.data_vencimento ? new Date(pedido.data_vencimento).toLocaleDateString('pt-BR') : 'Em 3 dias úteis'}
            </span>
          </div>

          {/* Aviso Importante */}
          <div style={{
            marginTop: '25px',
            padding: '15px',
            backgroundColor: '#fff4e5',
            borderLeft: '4px solid #ff9800',
            borderRadius: '4px'
          }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#e65100' }}>
              ⚠️ <strong>Importante:</strong> O pagamento de boleto pode levar até 2 dias úteis para ser confirmado pelo banco. 
              Você receberá um e-mail assim que o pagamento for confirmado.
            </p>
          </div>

        </div>

        {/* Detalhes do Pedido */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginTop: '20px' }}>
          <h3 style={{ color: '#2c3e50', fontSize: '18px', marginTop: 0, marginBottom: '15px' }}>
            📋 Detalhes do Pedido
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #e0e0e0' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Pedido:</span>
              <span style={{ color: '#2c3e50', fontSize: '14px', fontWeight: '600' }}>#{pedido.id.substring(0, 8)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #e0e0e0' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Comprador:</span>
              <span style={{ color: '#2c3e50', fontSize: '14px' }}>{pedido.comprador_nome}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #e0e0e0' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>E-mail:</span>
              <span style={{ color: '#2c3e50', fontSize: '14px' }}>{pedido.comprador_email}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>Valor Total:</span>
              <span style={{ color: '#27ae60', fontSize: '18px', fontWeight: 'bold' }}>
                R$ {parseFloat(pedido.valor_total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Ajuda */}
        <div style={{
          marginTop: '25px',
          textAlign: 'center',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#666' }}>
            💡 <strong>Dica:</strong> Salve esta página nos favoritos ou anote o número do pedido para acompanhar o status do pagamento
          </p>
          
          <Link href="/" style={{ color: '#5d34a4', textDecoration: 'none', fontSize: '14px' }}>
            ← Voltar para Home
          </Link>
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
