'use client';
import { useState } from 'react';
import { createClient } from '../../utils/supabase/client';

export default function FavoriteButton({ eventoId, userId, initialFavorited = false }) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      alert('Você precisa estar logado para favoritar eventos!');
      return;
    }

    setLoading(true);

    try {
      if (isFavorited) {
        // Remover dos favoritos
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('user_id', userId)
          .eq('evento_id', eventoId);

        if (error) throw error;
        setIsFavorited(false);
      } else {
        // Adicionar aos favoritos
        const { error } = await supabase
          .from('favoritos')
          .insert({
            user_id: userId,
            evento_id: eventoId,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      alert('Erro ao favoritar evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      style={{
        backgroundColor: isFavorited ? '#f1c40f' : 'rgba(255, 255, 255, 0.9)',
        border: '2px solid #f1c40f',
        borderRadius: '50%',
        width: '45px',
        height: '45px',
        cursor: loading ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        opacity: loading ? 0.6 : 1
      }}
      title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      {isFavorited ? '⭐' : '☆'}
    </button>
  );
}
