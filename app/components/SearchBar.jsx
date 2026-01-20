'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './SearchBar.css';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-box">
        
        {/* Campo de busca */}
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar eventos, artistas, locais..."
            className="search-input"
          />
        </div>
        
        {/* Botão Escolher Cidade */}
        <Link href="/escolher-cidade" style={{ textDecoration: 'none' }}>
          <button type="button" className="location-btn">
            📍 Escolher Cidade
          </button>
        </Link>

        {/* Botão de busca */}
        <button type="submit" className="search-btn">
          Buscar
        </button>
      </form>
    </div>
  );
}
