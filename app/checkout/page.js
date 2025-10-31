// app/checkout/page.js - VERSÃO FUNCIONANDO
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pegar evento_id da URL no cliente
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento_id');
    
    if (!eventoId) {
      router.push('/');
      return;
    }

    // Buscar dados do evento - SIMULADO
    setTimeout(() => {
      setEvento({
        id: eventoId,
        nome: "Show Incrível",
        preco: 89.90,
        data: new Date('2024-12-25T20:00:00'),
        imagem_url: "https://placehold.co/600x400/5d34a4/ffffff?text=SHOW+INCRÍVEL",
        categoria: "Show",
        localizacao: "São Paulo, SP"
      });
      setLoading(false);
    }, 500);
  }, [router]);

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '40px', textAlign: 'center' }}>
        <h2>Carregando checkout...</h2>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', marginBottom: '20px', borderRadius: '8px' }}>
        <button 
          onClick={() => router.back()}
          style={{ 
            backgroundColor: 'transparent', 
            color: 'white', 
            border: 'none', 
            fontSize: '16px', 
            cursor: 'pointer',
            float: 'left'
          }}
        >
          &larr; Voltar
        </button>
        <h1>Checkout - {evento.nome}</h1>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Resumo do Pedido */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0 }}>Resumo do Pedido</h2>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
            <img 
              src={evento.imagem_url} 
              alt={evento.nome}
              style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
            />
            <div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{evento.nome}</h3>
              <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>{evento.categoria}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                📅 {evento.data.toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Ingresso:</span>
              <span>R$ {evento.preco.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Taxa de serviço:</span>
              <span>R$ {(evento.preco * 0.1).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              <span>Total:</span>
              <span>R$ {(evento.preco * 1.1).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Formulário de Pagamento */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0 }}>Pagamento</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Forma de Pagamento</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '15px', 
                border: '2px solid #5d34a4', 
                borderRadius: '8px', 
                cursor: 'pointer',
                backgroundColor: '#f8f6ff'
              }}>
                <input type="radio" name="payment" defaultChecked style={{ marginRight: '10px' }} />
                <div>
                  <strong>💳 Cartão de crédito</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                    Parcele em até 12x
                  </p>
                </div>
              </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '15px', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                cursor: 'pointer'
              }}>
                <input type="radio" name="payment" style={{ marginRight: '10px' }} />
                <div>
                  <strong>📱 PIX</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                    Pagamento instantâneo
                  </p>
                </div>
              </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '15px', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                cursor: 'pointer'
              }}>
                <input type="radio" name="payment" style={{ marginRight: '10px' }} />
                <div>
                  <strong>📄 Boleto</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                    Pagamento em até 3 dias
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div style={{ 
            backgroundColor: '#fff3cd', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #ffeaa7'
          }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#856404' }}>
              <strong>⚠️ Modo Demonstração:</strong> Sistema de pagamento real em desenvolvimento.
            </p>
          </div>

          <button
            onClick={() => alert('Sistema de pagamento em desenvolvimento!')}
            style={{
              backgroundColor: '#f1c40f',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              padding: '15px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Finalizar Compra - R$ {(evento.preco * 1.1).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
