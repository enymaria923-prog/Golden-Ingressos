'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('São Paulo, SP');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Redireciona para página de busca com os parâmetros
      router.push(`/busca?q=${encodeURIComponent(searchTerm)}&local=${encodeURIComponent(location)}`);
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '8px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      margin: '20px auto',
      maxWidth: '800px'
    }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Campo de busca principal */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ flex: 3, display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: '25px', padding: '5px 15px' }}>
            <span style={{ marginRight: '10px', color: '#6c757d' }}>🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar eventos, artistas, locais..."
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                padding: '10px 0',
                width: '100%',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>
          
          {/* Localização */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: '25px', padding: '5px 15px' }}>
            <span style={{ marginRight: '10px', color: '#6c757d' }}>📍</span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                padding: '10px 0',
                width: '100%',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="São Paulo, SP">São Paulo, SP</option>
              <option value="Rio de Janeiro, RJ">Rio de Janeiro, RJ</option>
              <option value="Belo Horizonte, MG">Belo Horizonte, MG</option>
              <option value="Brasília, DF">Brasília, DF</option>
              <option value="Salvador, BA">Salvador, BA</option>
              <option value="Porto Alegre, RS">Porto Alegre, RS</option>
              <option value="Curitiba, PR">Curitiba, PR</option>
              <option value="Fortaleza, CE">Fortaleza, CE</option>
              <option value="Recife, PE">Recife, PE</option>
              <option value="Online">Online</option>
            </select>
          </div>

          {/* Botão de busca */}
          <button
            type="submit"
            style={{
              backgroundColor: '#5d34a4',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '12px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Buscar
          </button>
        </div>

        {/* Filtros rápidos */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={() => setSearchTerm('Teatro')}
            style={{
              backgroundColor: 'transparent',
              color: '#5d34a4',
              border: '1px solid #5d34a4',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🎭 Teatro
          </button>
          <button 
            type="button"
            onClick={() => setSearchTerm('Shows')}
            style={{
              backgroundColor: 'transparent',
              color: '#5d34a4',
              border: '1px solid #5d34a4',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🎵 Shows
          </button>
          <button 
            type="button"
            onClick={() => setSearchTerm('Stand-up')}
            style={{
              backgroundColor: 'transparent',
              color: '#5d34a4',
              border: '1px solid #5d34a4',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🎤 Stand-up
          </button>
          <button 
            type="button"
            onClick={() => setSearchTerm('Festivais')}
            style={{
              backgroundColor: 'transparent',
              color: '#5d34a4',
              border: '1px solid #5d34a4',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🎪 Festivais
          </button>
          <button 
            type="button"
            onClick={() => {
              setSearchTerm('Online');
              setLocation('Online');
            }}
            style={{
              backgroundColor: 'transparent',
              color: '#5d34a4',
              border: '1px solid #5d34a4',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            💻 Online
          </button>
        </div>
      </form>
    </div>
  );
}
