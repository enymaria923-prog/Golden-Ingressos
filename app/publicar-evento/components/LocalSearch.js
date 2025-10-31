'use client';
import React, { useState, useEffect } from 'react';

const LocalSearch = ({ onLocalSelect }) => {
  const [query, setQuery] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);

  const buscarSugestoes = async (termo) => {
    if (termo.length < 3) {
      setSugestoes([]);
      return;
    }

    const mockSugestoes = [
      `${termo} - Teatro`,
      `${termo} - Casa de Show`,
      `${termo} - Centro Cultural`,
      `${termo} - Arena`,
      `${termo} - Casa de Eventos`
    ];

    setSugestoes(mockSugestoes);
    setShowSugestoes(true);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarSugestoes(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const selecionarLocal = (local) => {
    setQuery(local);
    setShowSugestoes(false);
    onLocalSelect(local);
  };

  return (
    <div className="local-search">
      <label>Local do Evento *</label>
      <input
        type="text"
        placeholder="Digite o nome do local (teatro, casa de show, etc.)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 3 && setShowSugestoes(true)}
        required
      />
      
      {showSugestoes && sugestoes.length > 0 && (
        <div className="sugestoes-local">
          {sugestoes.map((sugestao, index) => (
            <div 
              key={index}
              className="sugestao-local-item"
              onClick={() => selecionarLocal(sugestao)}
            >
              {sugestao}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocalSearch;
