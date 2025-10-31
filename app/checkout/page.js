// app/checkout/page.js - VERSÃO CORRIGIDA
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const eventoId = searchParams.get('evento_id');
  const router = useRouter();
  
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventoId) {
      router.push('/');
      return;
    }

    // Buscar dados do evento - SIMULADO POR ENQUANTO
    const fetchEventoSimulado = async () => {
      // Simular busca - depois integra com Supabase
      setTimeout(() => {
        setEvento({
          id: eventoId,
          nome: "Evento de Exemplo",
          preco: 50,
          data: new Date(),
          imagem_url: "https://placehold.co/300x200/5d34a4/ffffff?text=EVENTO",
          categoria: "Show",
          localizacao: "São Paulo, SP"
        });
        setLoading(false);
      }, 1000);
    };

    fetchEventoSimulado();
  }, [eventoId, router]);

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '40px', textAlign: 'center' }}>
        <h2>Carregando...</h2>
      </div>
    );
  }

  if (!evento) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '40px', textAlign: 'center' }}>
        <h2>Evento não encontrado</h2>
        <Link href="/">Voltar para Home</Link>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', marginBottom: '20px', borderRadius: '8px' }}>
        <Link href={`/evento/${evento.id}`} style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar</Link>
        <h1>Checkout - {evento.nome}</h1>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '8px', textAlign: 'center' }}>
        
        <h2 style={{ color: '#5d34a4' }}>Sistema de Pagamento em Desenvolvimento</h2>
        
        <div style={{ margin: '30px 0' }}>
          <img 
            src={evento.imagem_url} 
            alt={evento.nome}
            style={{ width: '100%', borderRadius: '8px', marginBottom: '20px' }}
          />
          
          <h3>{evento.nome}</h3>
          <p><strong>Preço:</strong> R$ {evento.preco}</p>
          <p><strong>Data:</strong> {new Date(evento.data).toLocaleDateString('pt-BR')}</p>
          <p><strong>Local:</strong> {evento.localizacao}</p>
        </div>

        <div style={{ 
          backgroundColor: '#fff3cd', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '30px',
          border: '1px solid #ffeaa7'
        }}>
          <h4 style={{ color: '#856404', marginTop: 0 }}>⚠️ Sistema de Pagamento</h4>
          <p style={{ color: '#856404', marginBottom: 0 }}>
            Estamos implementando o sistema de pagamento real com Mercado Pago.
            Em breve você poderá pagar com Cartão, PIX e Boleto.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            href="/meus-ingressos" 
            style={{ 
              backgroundColor: '#5d34a4', 
              color: 'white', 
              padding: '12px 25px', 
              borderRadius: '5px', 
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Ver Meus Ingressos
          </Link>
          <Link 
            href="/" 
            style={{ 
              backgroundColor: '#f1c40f', 
              color: 'black', 
              padding: '12px 25px', 
              borderRadius: '5px', 
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Explorar Mais Eventos
          </Link>
        </div>
      </div>
    </div>
  );
}
