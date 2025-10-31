'use client';
import React, { useState } from 'react';

const SetorManager = () => {
  const [setores, setSetores] = useState([
    {
      id: 1,
      nome: '',
      capacidadeTotal: null,
      tiposIngresso: [
        { id: 1, nome: '', preco: 0, quantidade: null }
      ]
    }
  ]);

  const adicionarSetor = () => {
    const novoSetor = {
      id: Date.now(),
      nome: '',
      capacidadeTotal: null,
      tiposIngresso: [
        { id: Date.now() + 1, nome: '', preco: 0, quantidade: null }
      ]
    };
    setSetores([...setores, novoSetor]);
  };

  const removerSetor = (setorId) => {
    setSetores(setores.filter(setor => setor.id !== setorId));
  };

  const atualizarSetor = (setorId, campo, valor) => {
    setSetores(setores.map(setor => 
      setor.id === setorId ? { ...setor, [campo]: valor } : setor
    ));
  };

  const adicionarTipoIngresso = (setorId) => {
    setSetores(setores.map(setor => 
      setor.id === setorId 
        ? { 
            ...setor, 
            tiposIngresso: [
              ...setor.tiposIngresso, 
              { id: Date.now(), nome: '', preco: 0, quantidade: null }
            ]
          } 
        : setor
    ));
  };

  const removerTipoIngresso = (setorId, tipoId) => {
    setSetores(setores.map(setor => 
      setor.id === setorId 
        ? { 
            ...setor, 
            tiposIngresso: setor.tiposIngresso.filter(tipo => tipo.id !== tipoId)
          } 
        : setor
    ));
  };

  const atualizarTipoIngresso = (setorId, tipoId, campo, valor) => {
    setSetores(setores.map(setor => 
      setor.id === setorId 
        ? { 
            ...setor, 
            tiposIngresso: setor.tiposIngresso.map(tipo => 
              tipo.id === tipoId ? { ...tipo, [campo]: valor } : tipo
            )
          } 
        : setor
    ));
  };

  return (
    <div className="setores-container">
      <h3>Setores e Ingressos</h3>
      <p className="info-text">
        Organize os setores do seu evento (ex: VIP, Camarote, Pista) e os tipos de ingresso em cada setor.
      </p>

      {setores.map((setor, index) => (
        <div key={setor.id} className="setor-card">
          <div className="setor-header">
            <h4>Setor {index + 1}</h4>
            {setores.length > 1 && (
              <button 
                type="button" 
                onClick={() => removerSetor(setor.id)}
                className="btn-remove"
              >
                Remover Setor
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Nome do Setor</label>
            <input
              type="text"
              placeholder="Ex: VIP, Camarote, Pista Premium"
              value={setor.nome}
              onChange={(e) => atualizarSetor(setor.id, 'nome', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              Capacidade Total do Setor (opcional)
              <small> - Deixe em branco para controle por tipo de ingresso</small>
            </label>
            <input
              type="number"
              placeholder="Quantidade total de ingressos neste setor"
              value={setor.capacidadeTotal || ''}
              onChange={(e) => atualizarSetor(setor.id, 'capacidadeTotal', e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>

          <div className="tipos-ingresso">
            <h5>Tipos de Ingresso neste Setor</h5>
            {setor.tiposIngresso.map((tipo, tipoIndex) => (
              <div key={tipo.id} className="tipo-ingresso-row">
                <input
                  type="text"
                  placeholder="Nome (ex: Inteira, Meia, Promocional)"
                  value={tipo.nome}
                  onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'nome', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Preço"
                  step="0.01"
                  value={tipo.preco}
                  onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'preco', parseFloat(e.target.value))}
                />
                <input
                  type="number"
                  placeholder="Quantidade (opcional)"
                  value={tipo.quantidade || ''}
                  onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'quantidade', e.target.value ? parseInt(e.target.value) : null)}
                />
                {setor.tiposIngresso.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removerTipoIngresso(setor.id, tipo.id)}
                    className="btn-remove-small"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => adicionarTipoIngresso(setor.id)}
              className="btn-add"
            >
              + Adicionar Tipo de Ingresso
            </button>
          </div>
        </div>
      ))}

      <button 
        type="button" 
        onClick={adicionarSetor}
        className="btn-add-setor"
      >
        + Adicionar Novo Setor
      </button>
    </div>
  );
};

export default SetorManager;
