import React, { useState, useEffect } from 'react';

const SetorManager = ({ onSetoresChange }) => {
  const [setores, setSetores] = useState([
    {
      id: 1,
      nome: '',
      capacidadeTotal: '',
      tiposIngresso: [
        { id: 1, nome: '', preco: '', quantidade: '' }
      ]
    }
  ]);

  // SEMPRE que os setores mudarem, passa para o componente pai
  useEffect(() => {
    console.log('🎫 Setores atualizados:', setores);
    if (onSetoresChange) {
      onSetoresChange(setores);
    }
  }, [setores]);

  const adicionarSetor = () => {
    const novoSetor = {
      id: Date.now(),
      nome: '',
      capacidadeTotal: '',
      tiposIngresso: [
        { id: Date.now(), nome: '', preco: '', quantidade: '' }
      ]
    };
    setSetores([...setores, novoSetor]);
  };

  const removerSetor = (setorId) => {
    if (setores.length === 1) {
      alert('Você precisa ter pelo menos um setor!');
      return;
    }
    setSetores(setores.filter(s => s.id !== setorId));
  };

  const atualizarSetor = (setorId, campo, valor) => {
    setSetores(setores.map(setor => {
      if (setor.id === setorId) {
        return { ...setor, [campo]: valor };
      }
      return setor;
    }));
  };

  const adicionarTipoIngresso = (setorId) => {
    setSetores(setores.map(setor => {
      if (setor.id === setorId) {
        return {
          ...setor,
          tiposIngresso: [
            ...setor.tiposIngresso,
            { id: Date.now(), nome: '', preco: '', quantidade: '' }
          ]
        };
      }
      return setor;
    }));
  };

  const removerTipoIngresso = (setorId, tipoId) => {
    setSetores(setores.map(setor => {
      if (setor.id === setorId) {
        if (setor.tiposIngresso.length === 1) {
          alert('Você precisa ter pelo menos um tipo de ingresso!');
          return setor;
        }
        return {
          ...setor,
          tiposIngresso: setor.tiposIngresso.filter(t => t.id !== tipoId)
        };
      }
      return setor;
    }));
  };

  const atualizarTipoIngresso = (setorId, tipoId, campo, valor) => {
    setSetores(setores.map(setor => {
      if (setor.id === setorId) {
        return {
          ...setor,
          tiposIngresso: setor.tiposIngresso.map(tipo => {
            if (tipo.id === tipoId) {
              return { ...tipo, [campo]: valor };
            }
            return tipo;
          })
        };
      }
      return setor;
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic' }}>
        Organize os setores do seu evento (ex: VIP, Camarote, Pista) e os tipos de ingresso em cada setor.
      </p>

      {setores.map((setor, setorIndex) => (
        <div key={setor.id} style={{ 
          border: '2px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#f9f9f9'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: 0, color: '#5d34a4' }}>Setor {setorIndex + 1}</h3>
            {setores.length > 1 && (
              <button
                type="button"
                onClick={() => removerSetor(setor.id)}
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ❌ Remover Setor
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Nome do Setor
              </label>
              <input
                type="text"
                value={setor.nome}
                onChange={(e) => atualizarSetor(setor.id, 'nome', e.target.value)}
                placeholder="Ex: VIP, Camarote, Pista Premium"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  boxSizing: 'border-box',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Capacidade Total do Setor (opcional)
              </label>
              <input
                type="number"
                value={setor.capacidadeTotal}
                onChange={(e) => atualizarSetor(setor.id, 'capacidadeTotal', e.target.value)}
                placeholder="Quantidade total de ingressos neste setor"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  boxSizing: 'border-box',
                  fontSize: '14px'
                }}
              />
              <small style={{ color: '#666' }}>
                - Deixe em branco para controle por tipo de ingresso
              </small>
            </div>

            <div style={{ marginTop: '10px' }}>
              <h4 style={{ marginBottom: '10px', color: '#333' }}>Tipos de Ingresso neste Setor</h4>
              
              {setor.tiposIngresso.map((tipo, tipoIndex) => (
                <div key={tipo.id} style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  marginBottom: '10px',
                  alignItems: 'flex-end'
                }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '3px' }}>
                      Nome (ex: Inteira, Meia, Promocional)
                    </label>
                    <input
                      type="text"
                      value={tipo.nome}
                      onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'nome', e.target.value)}
                      placeholder="Nome do tipo"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ width: '120px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '3px' }}>
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={tipo.preco}
                      onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'preco', e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ width: '120px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '3px' }}>
                      Quantidade
                    </label>
                    <input
                      type="number"
                      value={tipo.quantidade}
                      onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'quantidade', e.target.value)}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {setor.tiposIngresso.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerTipoIngresso(setor.id, tipo.id)}
                      style={{
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                      title="Remover tipo de ingresso"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => adicionarTipoIngresso(setor.id)}
                style={{
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  marginTop: '5px'
                }}
              >
                + Adicionar Tipo de Ingresso
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={adicionarSetor}
        style={{
          backgroundColor: '#27ae60',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px'
        }}
      >
        + Adicionar Novo Setor
      </button>
    </div>
  );
};

export default SetorManager;
