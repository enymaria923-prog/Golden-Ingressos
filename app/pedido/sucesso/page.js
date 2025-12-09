// app/pedido/sucesso/page.js
'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PedidoSucessoContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [pedido, setPedido] = useState(null);
  const [ingressos, setIngressos] = useState([]);

  const pedidoId = searchParams.get('pedido_id');

  useEffect(() => {
    carregarDados();
  }, [pedidoId]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Carregar pedido
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single();

      if (pedidoError) {
        console.error('Erro ao carregar pedido:', pedidoError);
        return;
      }

      setPedido(pedidoData);

      // Carregar ingressos gerados
      const { data: ingressosData } = await supabase
        .from('ingressos_vendidos')
        .select('*')
        .eq('pedido_id', pedidoId);

      if (ingressosData) {
        setIngressos(ingressosData);
      }

    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
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
      <header style={{ backgroundColor: '#27ae60', color: 'white', padding: '20px 30px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '10px' }}>🎉</div>
        <h1 style={{ margin: 0, fontSize: '32px' }}>Pagamento Confirmado!</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '18px', opacity: 0.9 }}>
          Seu pedido foi processado com sucesso
        </p>
      </header>

      <div style={{ maxWidth: '800px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* Card de Sucesso */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              display: 'inline-block',
              padding: '15px 30px',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '50px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: '2px solid #c3e6cb'
            }}>
              ✅ Pagamento Confirmado
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '16px', color: '#666', marginBottom: '10px' }}>
              Pedido
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50', fontFamily: 'monospace' }}>
              #{pedido.id.substring(0, 8).toUpperCase()}
            </div>
          </div>

          <div style={{ 
            padding: '20px', 
            backgroundColor: '#e7f5ff', 
            borderRadius: '8px',
            border: '1px solid #339af0',
            marginBottom: '30px'
          }}>
            <p style={{ margin: 0, fontSize: '15px', color: '#1971c2', textAlign: 'center' }}>
              📧 Enviamos um e-mail para <strong>{pedido.comprador_email}</strong> com todos os detalhes do seu pedido e seus ingressos!
            </p>
          </div>

          {/* Resumo do Pedido */}
          <div style={{ borderTop: '2px solid #e0e0e0', paddingTop: '25px' }}>
            <h3 style={{ color: '#2c3e50', fontSize: '20px', marginBottom: '20px' }}>
              📋 Resumo do Pedido
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#666', fontSize: '15px' }}>Comprador:</span>
                <span style={{ color: '#2c3e50', fontSize: '15px', fontWeight: '600' }}>{pedido.comprador_nome}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#666', fontSize: '15px' }}>E-mail:</span>
                <span style={{ color: '#2c3e50', fontSize: '15px' }}>{pedido.comprador_email}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#666', fontSize: '15px' }}>CPF:</span>
                <span style={{ color: '#2c3e50', fontSize: '15px', fontFamily: 'monospace' }}>
                  {pedido.comprador_cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#666', fontSize: '15px' }}>Forma de Pagamento:</span>
                <span style={{ color: '#2c3e50', fontSize: '15px', fontWeight: '600' }}>
                  {pedido.forma_pagamento === 'pix' && '💚 PIX'}
                  {pedido.forma_pagamento === 'boleto' && '📄 Boleto'}
                  {pedido.forma_pagamento === 'cartao_credito' && '💳 Cartão de Crédito'}
                  {pedido.forma_pagamento === 'cartao_debito' && '💳 Cartão de Débito'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px' }}>
                <span style={{ color: '#666', fontSize: '16px', fontWeight: '600' }}>Valor Total:</span>
                <span style={{ color: '#27ae60', fontSize: '22px', fontWeight: 'bold' }}>
                  R$ {parseFloat(pedido.valor_total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ingressos */}
        {ingressos.length > 0 && (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h3 style={{ color: '#2c3e50', fontSize: '20px', marginBottom: '20px' }}>
              🎫 Seus Ingressos ({ingressos.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {ingressos.map((ingresso, index) => (
                <div key={index} style={{
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
                      {ingresso.tipo}
                      {ingresso.assento && (
                        <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                          • Assento: {ingresso.assento}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: '#999', fontFamily: 'monospace' }}>
                      Código: {ingresso.codigo_qr}
                    </div>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#27ae60' }}>
                    R$ {parseFloat(ingresso.valor).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: '#fff3cd', 
              borderRadius: '8px',
              border: '1px solid #ffc107'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#856404', textAlign: 'center' }}>
                💡 <strong>Importante:</strong> Apresente seu e-mail ou código QR na entrada do evento
              </p>
            </div>
          </div>
        )}

        {/* Próximos Passos */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h3 style={{ color: '#2c3e50', fontSize: '20px', marginBottom: '20px' }}>
            📝 Próximos Passos
          </h3>

          <ol style={{ color: '#555', fontSize: '15px', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '12px' }}>
              Verifique seu e-mail (<strong>{pedido.comprador_email}</strong>) para encontrar seus ingressos
            </li>
            <li style={{ marginBottom: '12px' }}>
              Salve os ingressos no seu celular ou imprima
            </li>
            <li style={{ marginBottom: '12px' }}>
              Chegue com antecedência no local do evento
            </li>
            <li>
              Apresente seu ingresso (QR Code) na entrada
            </li>
          </ol>
        </div>

        {/* Botões de Ação */}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ flex: 1, minWidth: '200px', textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              backgroundColor: '#5d34a4',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              🏠 Voltar para Home
            </button>
          </Link>

          <button
            onClick={() => window.print()}
            style={{
              flex: 1,
              minWidth: '200px',
              backgroundColor: 'white',
              color: '#5d34a4',
              border: '2px solid #5d34a4',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            🖨️ Imprimir Comprovante
          </button>
        </div>

        {/* Suporte */}
        <div style={{ 
          marginTop: '30px', 
          textAlign: 'center',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
            💬 Dúvidas sobre seu pedido?
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#5d34a4', fontWeight: '600' }}>
            Entre em contato com nosso suporte
          </p>
        </div>

      </div>
    </div>
  );
}

export default function PedidoSucessoPage() {
  return (
    <Suspense fallback={
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando...</h2>
      </div>
    }>
      <PedidoSucessoContent />
    </Suspense>
  );
}
