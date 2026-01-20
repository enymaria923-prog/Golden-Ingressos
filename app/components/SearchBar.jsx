'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import FavoriteButton from './FavoriteButton';

export default function EventosCarousel({ eventos, userId, favoritos = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play - muda a cada 5 segundos
  useEffect(() => {
    if (!eventos || eventos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % eventos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [eventos]);

  if (!eventos || eventos.length === 0) return null;

  const currentEvento = eventos[currentIndex];

  return (
    <div style={{
      position: 'relative',
      maxWidth: '1000px',
      margin: '0 auto',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <Link href={`/evento/${currentEvento.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          backgroundImage: `url(${currentEvento.imagem_url || 'https://placehold.co/1000x280/5d34a4/ffffff?text=EVENTO'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: 'pointer'
        }}>
          {/* Gradiente escuro em cima da imagem */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)'
          }} />

          {/* Botão de Favoritar */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10
          }}>
            <FavoriteButton 
              eventoId={currentEvento.id}
              userId={userId}
              initialFavorited={favoritos.includes(currentEvento.id)}
            />
          </div>

          {/* Info do Evento */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            color: 'white',
            zIndex: 5
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '20px',
              fontWeight: '700',
              lineHeight: '1.3',
              textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {currentEvento.nome}
            </h3>

            <div style={{
              fontSize: '13px',
              marginBottom: '4px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
              📍 {currentEvento.local || currentEvento.cidade || 'Local a definir'}
            </div>

            <div style={{
              fontSize: '13px',
              marginBottom: '8px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
              📅 {new Date(currentEvento.data).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'short',
                year: 'numeric'
              })}
            </div>

            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#f1c40f',
              textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
            }}>
              A partir de R$ {currentEvento.preco}
            </div>
          </div>
        </div>
      </Link>

      {/* Indicadores (bolinhas) */}
      {eventos.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '6px',
          zIndex: 10
        }}>
          {eventos.map((_, index) => (
            <div
              key={index}
              style={{
                width: index === currentIndex ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: index === currentIndex ? '#f1c40f' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
