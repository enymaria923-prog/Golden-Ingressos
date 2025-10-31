'use client';
import React, { useState } from 'react';

const CategoriaSelector = ({ onCategoriasChange }) => {
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [pesquisaCategoria, setPesquisaCategoria] = useState('');

  const categoriasPredefinidas = [
    'Teatro Adulto', 'Teatro Infantil', 'Comédia', 'Musical Adulto', 
    'Musical Infantil', 'Romance', 'Religioso', 'Dança', 'Espírita',
    'Passeios e Experiências', 'Cursos e Palestras', 'Stand Up',
    'Gospel', 'MPB', 'Pop', 'Pop Rock', 'Rap', 'Rock', 
    'Samba e Pagode', 'Tributos'
  ];

  const categoriasFiltradas = categoriasPredefinidas.filter(cat =>
    cat.toLowerCase().includes(pesquisaCategoria.toLowerCase())
  );

  const adicionarCategoria = (categoria) => {
    if (categoriasSelecionadas.length < 5 && !categoriasSelecionadas.includes(categoria)) {
      const novasCategorias = [...categoriasSelecionadas, categoria];
      setCategoriasSelecionadas(novasCategorias);
      onCategoriasChange(novasCategorias);
      setPesquisaCategoria('');
    }
  };

  const removerCategoria = (categoria) => {
    const novasCategorias = categoriasSelecionadas.filter(cat => cat !== categoria);
    setCategoriasSelecionadas(novasCategorias);
    onCategoriasChange(novasCategorias);
  };

  const adicionarCategoriaPersonalizada = () => {
    if (pesquisaCategoria.trim() && categoriasSelecionadas.length < 5) {
      adicionarCategoria(pesquisaCategoria.trim());
    }
  };

  return (
    <div className="categoria-selector">
      <label>Categorias do Evento (máx. 5)</label>
      
      <div className="categorias-selecionadas">
        {categoriasSelecionadas.map(categoria => (
          <span key={categoria} className="categoria-tag">
            {categoria}
            <button type="button" onClick={() => removerCategoria(categoria)}>×</button>
          </span>
        ))}
      </div>

      <div className="pesquisa-categoria">
        <input
          type="text"
          placeholder="Pesquisar categorias ou digitar uma nova..."
          value={pesquisaCategoria}
          onChange={(e) => setPesquisaCategoria(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              adicionarCategoriaPersonalizada();
            }
          }}
        />
        <button 
          type="button" 
          onClick={adicionarCategoriaPersonalizada}
          disabled={!pesquisaCategoria.trim()}
        >
          Adicionar
        </button>
      </div>

      {pesquisaCategoria && (
        <div className="sugestoes-categoria">
          {categoriasFiltradas.map(categoria => (
            <div 
              key={categoria} 
              className="sugestao-item"
              onClick={() => adicionarCategoria(categoria)}
            >
              {categoria}
            </div>
          ))}
          {categoriasFiltradas.length === 0 && pesquisaCategoria && (
            <div 
              className="sugestao-item nova-categoria"
              onClick={adicionarCategoriaPersonalizada}
            >
              Adicionar "{pesquisaCategoria}" como nova categoria
            </div>
          )}
        </div>
      )}

      {categoriasSelecionadas.length >= 5 && (
        <small style={{color: 'orange'}}>Máximo de 5 categorias atingido</small>
      )}
    </div>
  );
};

export default CategoriaSelector;
