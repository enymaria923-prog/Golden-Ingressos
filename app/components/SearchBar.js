'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('São Paulo, SP');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() || location) {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('q', searchTerm.trim());
      if (location) params.append('local', location);
      router.push(`/busca?${params.toString()}`);
    }
  };

  const handleQuickFilter = (filter) => {
    setSearchTerm(filter);
    // Busca imediatamente quando clica em um filtro rápido
    const params = new URLSearchParams();
    params.append('q', filter);
    if (location) params.append('local', location);
    router.push(`/busca?${params.toString()}`);
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      margin: '25px auto',
      maxWidth: '900px'
    }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Linha principal de busca */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'stretch', flexWrap: 'wrap' }}>
          
          {/* Campo de busca */}
          <div style={{ flex: '2', minWidth: '250px', display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: '25px', padding: '0 20px', border: '2px solid #e9ecef' }}>
            <span style={{ marginRight: '12px', color: '#6c757d', fontSize: '18px' }}>🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar eventos, artistas, locais..."
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                padding: '15px 0',
                width: '100%',
                fontSize: '16px',
                outline: 'none',
                fontWeight: '500'
              }}
            />
          </div>
          
          {/* Seletor de localização */}
          <div style={{ flex: '1', minWidth: '200px', display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: '25px', padding: '0 20px', border: '2px solid #e9ecef' }}>
            <span style={{ marginRight: '12px', color: '#6c757d', fontSize: '18px' }}>📍</span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                padding: '15px 0',
                width: '100%',
                fontSize: '15px',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: '500'
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
              <option value="Online">Eventos Online</option>
              <option value="">Qualquer local</option>
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
              padding: '15px 35px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minWidth: '120px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4a2a82'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#5d34a4'}
          >
            Buscar
          </button>
        </div>

        {/* Filtros rápidos */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ color: '#6c757d', fontSize: '14px', marginRight: '10px', alignSelf: 'center' }}>Categorias:</span>
          {['Teatro', 'Shows', 'Stand-up', 'Festivais', 'Online'].map((categoria) => (
            <button 
              key={categoria}
              type="button"
              onClick={() => handleQuickFilter(categoria)}
              style={{
                backgroundColor: searchTerm === categoria ? '#5d34a4' : 'transparent',
                color: searchTerm === categoria ? 'white' : '#5d34a4',
                border: `1px solid #5d34a4`,
                borderRadius: '20px',
                padding: '8px 18px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {categoria === 'Teatro' && '🎭 '}
              {categoria === 'Shows' && '🎵 '}
              {categoria === 'Stand-up' && '🎤 '}
              {categoria === 'Festivais' && '🎪 '}
              {categoria === 'Online' && '💻 '}
              {categoria}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
