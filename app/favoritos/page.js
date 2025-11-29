import { createClient } from '../../utils/supabase/server.js';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import FavoriteButton from '../components/FavoriteButton';

// Componente do Cartão de Evento Favorito
function CardEventoFavorito({ evento, userId, isPast = false }) {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
      overflow: 'hidden', 
      width: '300px', 
      margin: '20px',
      position: 'relative',
      opacity: isPast ? 0.7 : 1
    }}>
      {/* Badge de Evento Passado */}
      {isPast && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: '#e74c3c',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 5
        }}>
          ENCERRADO
        </div>
      )}

      {/* Botão de Favoritar */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
        <FavoriteButton 
          eventoId={evento.id} 
          userId={userId}
          initialFavorited={true}
        />
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={evento.imagem_url || 'https://placehold.co/300x180/5d34a4/ffffff?text=EVENTO'} 
        alt={evento.nome} 
        style={{ 
          width: '100%', 
          height: '180px', 
          objectFit: 'cover',
          filter: isPast ? 'grayscale(50%)' : 'none'
        }} 
      />
      <div style={{ padding: '15px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#5d34a4' }}>{evento.nome}</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
          📅 {new Date(evento.data).toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
          🕒 {evento.hora}
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
          📍 {evento.local}
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
          🎭 {evento.categoria}
        </p>
        <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
          💰 R$ {evento.preco}
        </p>
        
        {!isPast ? (
          <Link href={`/evento/${evento.id}`}>
            <button style={{ 
              backgroundColor: '#f1c40f', 
              color: 'black', 
              padding: '10px 15px', 
              border: 'none', 
              borderRadius: '4px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              width: '100%' 
            }}>
              Comprar Ingresso
            </button>
          </Link>
        ) : (
          <button 
            disabled 
            style={{ 
              backgroundColor: '#95a5a6', 
              color: 'white', 
              padding: '10px 15px', 
              border: 'none', 
              borderRadius: '4px', 
              fontWeight: 'bold', 
              cursor: 'not-allowed', 
              width: '100%' 
            }}
          >
            Evento Encerrado
          </button>
        )}
      </div>
    </div>
  );
}

export default async function FavoritosPage() {
  const supabase = createClient();
  
  // Verificar se usuário está logado
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Data de hoje para comparação
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataHoje = hoje.toISOString().split('T')[0];

  // Buscar favoritos do usuário
  const { data: favoritosData, error: favoritosError } = await supabase
    .from('favoritos')
    .select('evento_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (favoritosError) {
    console.error('Erro ao buscar favoritos:', favoritosError);
  }

  let eventosFuturos = [];
  let eventosPassados = [];

  // Buscar detalhes dos eventos favoritos
  if (favoritosData && favoritosData.length > 0) {
    const eventosIds = favoritosData.map(f => f.evento_id);
    
    const { data: eventosData, error: eventosError } = await supabase
      .from('eventos')
      .select('*')
      .in('id', eventosIds)
      .eq('status', 'aprovado');

    if (eventosError) {
      console.error('Erro ao buscar eventos:', eventosError);
    }

    if (eventosData) {
      // Separar eventos futuros e passados
      eventosFuturos = eventosData.filter(e => e.data >= dataHoje);
      eventosPassados = eventosData.filter(e => e.data < dataHoje);
      
      // Ordenar eventos futuros por data (mais próximo primeiro)
      eventosFuturos.sort((a, b) => new Date(a.data) - new Date(b.data));
      
      // Ordenar eventos passados por data (mais recente primeiro)
      eventosPassados.sort((a, b) => new Date(b.data) - new Date(a.data));
    }
  }

  return (
    <div style={{ 
      fontFamily: 'sans-serif', 
      backgroundColor: '#f4f4f4', 
      minHeight: '100vh', 
      padding: '20px' 
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#5d34a4', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center', 
        marginBottom: '30px', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link href="/">
          <button style={{
            backgroundColor: 'white',
            color: '#5d34a4',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            ← Voltar
          </button>
        </Link>
        <div>
          <h1 style={{ margin: 0 }}>⭐ Meus Favoritos</h1>
          <p style={{ margin: '5px 0 0 0' }}>
            {eventosFuturos.length + eventosPassados.length} eventos favoritos
          </p>
        </div>
        <div style={{ width: '100px' }}></div>
      </header>

      {/* Seção de Eventos Futuros */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '40px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            color: '#5d34a4', 
            margin: '0 0 20px 0',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📅 Próximos Eventos ({eventosFuturos.length})
          </h2>
          
          {eventosFuturos.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              gap: '30px',
              marginTop: '30px'
            }}>
              {eventosFuturos.map(evento => (
                <CardEventoFavorito 
                  key={evento.id} 
                  evento={evento} 
                  userId={user.id}
                  isPast={false}
                />
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#666'
            }}>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>
                Você ainda não tem eventos futuros nos favoritos.
              </p>
              <Link href="/">
                <button style={{
                  backgroundColor: '#f1c40f',
                  color: 'black',
                  padding: '12px 25px',
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}>
                  Explorar Eventos
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Seção de Eventos Passados */}
        {eventosPassados.length > 0 && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              color: '#7f8c8d', 
              margin: '0 0 20px 0',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              📦 Eventos Encerrados ({eventosPassados.length})
            </h2>
            
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              gap: '30px',
              marginTop: '30px'
            }}>
              {eventosPassados.map(evento => (
                <CardEventoFavorito 
                  key={evento.id} 
                  evento={evento} 
                  userId={user.id}
                  isPast={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
