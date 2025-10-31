import { createClient } from '../../../utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function EventoPage({ params }) {
  const supabase = createClient();
  const { id } = await params;

  const { data: evento, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !evento) {
    notFound();
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', marginBottom: '20px', borderRadius: '8px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para Home</Link>
        <h1>{evento.nome}</h1>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Imagem e Informações */}
        <div>
          <img 
            src={evento.imagem_url || 'https://placehold.co/600x400/5d34a4/ffffff?text=EVENTO'} 
            alt={evento.nome}
            style={{ width: '100%', borderRadius: '8px', marginBottom: '20px' }}
          />
          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
            <h2 style={{ color: '#5d34a4', marginTop: 0 }}>Descrição</h2>
            <p>{evento.descricao || 'Descrição não disponível.'}</p>
            
            <h3 style={{ color: '#5d34a4' }}>Detalhes</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>Data:</strong> {new Date(evento.data).toLocaleDateString('pt-BR')}</li>
              <li><strong>Horário:</strong> {new Date(evento.data).toLocaleTimeString('pt-BR')}</li>
              <li><strong>Categoria:</strong> {evento.categoria}</li>
              <li><strong>Local:</strong> {evento.localizacao || 'A definir'}</li>
              {evento.online && <li><strong>Evento Online</strong></li>}
            </ul>
          </div>
        </div>

        {/* Card de Compra */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', height: 'fit-content' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0 }}>Ingressos</h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#5d34a4' }}>
            R$ {evento.preco}
          </p>
          
          <div style={{ margin: '20px 0' }}>
            <p>✅ Entrada garantida</p>
            <p>✅ Cancelamento gratuito</p>
            <p>✅ Suporte 24h</p>
          </div>

          <Link href={`/checkout?evento_id=${evento.id}`}>
            <button style={{ 
              backgroundColor: '#f1c40f', 
              color: 'black', 
              padding: '15px', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              width: '100%',
              fontSize: '18px'
            }}>
              Comprar Ingresso
            </button>
          </Link>

          <p style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginTop: '15px' }}>
            Pagamento seguro via Mercado Pago
          </p>
        </div>
      </div>
    </div>
  );
}
