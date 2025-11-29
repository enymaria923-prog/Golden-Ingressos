'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import FavoriteButton from './FavoriteButton';

export default function EventosCarousel({ eventos, userId, favoritos = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play do carrossel
  useEffect(() => {
    if (!isAutoPlaying || eventos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % eventos.length);
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [isAutoPlaying, eventos.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % eventos.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + eventos.length) % eventos.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (!eventos || eventos.length === 0) return null;

  const currentEvento = eventos[currentIndex];

  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
    }}>
      {/* Card do Evento em Destaque */}
      <Link href={`/evento/${currentEvento.id}`} style={{ textDecoration: 'none' }}>
        <div style={{ 
          position: 'relative',
          height: '500px',
          background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${currentEvento.imagem_url || 'https://placehold.co/1000x500/5d34a4/ffffff?text=EVENTO'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: 'pointer'
        }}>
          {/* Botão de Favoritar */}
          <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
            <FavoriteButton 
              eventoId={currentEvento.id}
              userId={userId}
              initialFavorited={favoritos.includes(currentEvento.id)}
            />
          </div>

          {/* Informações do Evento */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            padding: '40px',
            color: 'white'
          }}>
            <h2 style={{ 
              fontSize: '36px', 
              margin: '0 0 15px 0',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}>
              {currentEvento.nome}
            </h2>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>
              📅 {new Date(currentEvento.data).toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>
              📍 {currentEvento.local}
            </div>
            <div style={{ fontSize: '18px', marginBottom: '15px' }}>
              🎭 {currentEvento.categoria}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f1c40f' }}>
              A partir de R$ {currentEvento.preco}
            </div>
          </div>
        </div>
      </Link>

      {/* Botões de Navegação */}
      {eventos.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              fontSize: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ‹
          </button>
          <button
            onClick={goToNext}
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              fontSize: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ›
          </button>
        </>
      )}

      {/* Indicadores */}
      {eventos.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 10
        }}>
          {eventos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: index === currentIndex ? '30px' : '12px',
                height: '12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: index === currentIndex ? '#f1c40f' : 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
