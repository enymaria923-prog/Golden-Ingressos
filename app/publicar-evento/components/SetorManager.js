'use client';
import React, { useState, useEffect } from 'react';

const SetorManager = ({ onSetoresChange }) => {
  const [setores, setSetores] = useState([
    {
      id: 1,
      nome: '',
      capacidadeTotal: '',
      usaLotes: false,
      lotes: [],
      tiposIngresso: [
        { id: 1, nome: '', preco: '', quantidade: '' }
      ]
    }
  ]);

  useEffect(() => {
    console.log('🎫 Setores atualizados:', setores);
    if (onSetoresChange) {
      // LIMPAR VALORES VAZIOS ANTES DE ENVIAR
      const setoresLimpos = setores.map(setor => ({
        ...setor,
        capacidadeTotal: setor.capacidadeTotal || null,
        tiposIngresso: setor.tiposIngresso.map(tipo => ({
          ...tipo,
          quantidade: tipo.quantidade === '' ? null : tipo.quantidade,
          preco: tipo.preco || null
        })),
        lotes: setor.lotes.map(lote => ({
          ...lote,
          quantidadeTotal: lote.quantidadeTotal === '' ? null : lote.quantidadeTotal,
          tiposIngresso: lote.tiposIngresso.map(tipo => ({
            ...tipo,
            quantidade: tipo.quantidade === '' ? null : tipo.quantidade,
            preco: tipo.preco || null
          }))
        }))
      }));
      
      onSetoresChange(setoresLimpos);
    }
  }, [setores, onSetoresChange]);

  const adicionarSetor = () => {
    const novoSetor = {
      id: Date.now(),
      nome: '',
      capacidadeTotal: '',
      usaLotes: false,
      lotes: [],
      tiposIngresso: [{ id: Date.now(), nome: '', preco: '', quantidade: '' }]
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
        const novoSetor = { ...setor, [campo]: valor };
        
        if (campo === 'usaLotes' && valor === true && setor.lotes.length === 0) {
          novoSetor.lotes = [{
            id: Date.now(),
            nome: '1º Lote',
            quantidadeTotal: '',
            dataInicio: '',
            dataFim: '',
            tiposIngresso: [{ id: Date.now(), nome: '', preco: '', quantidade: '' }]
          }];
          novoSetor.tiposIngresso = [];
        }
        
        if (campo === 'usaLotes' && valor === false) {
          novoSetor.lotes = [];
          if (novoSetor.tiposIngresso.length === 0) {
            novoSetor.tiposIngresso = [{ id: Date.now(), nome: '', preco: '', quantidade: '' }];
          }
        }
        
        return novoSetor;
      }
      return setor;
    }));
  };

  const adicionarLote = (setorId) => {
    setSetores(setores.map(setor => {
      if (setor.id === setorId) {
        const numeroLote = setor.lotes.length + 1;
        return {
          ...setor,
          lotes: [
            ...setor.lotes,
            {
              id: Date.now(),
              nome: `${numeroLote}º Lote`,
              quantidadeTotal: '',
              dataInicio: '',
              dataFim: '',
              tiposIngresso: [{ id: Date.now() + 1, nome: '', preco: '', quantidade: '' }]
            }
          ]
        };
      }
      return setor;
    }));
  };

  const removerLote = (setorId, loteId) => {
    setSetores(setores.map(setor => {
      if (setor.id === setorId) {
        if (setor.lotes.length === 1) {
          alert('Você precisa ter pelo menos um lote! Ou desative o uso de lotes.');
          return setor;
        }
        return {
          ...setor,
          lotes: setor.lotes.filter(l => l.id !== loteId)
        };
      }
      return setor;
    }));
  };

  const atualizarLote = (setorId, loteId, campo, valor) => {
    setSetores(setores.map(setor => {
      if (setor.id === setorId) {
        return {
          ...setor,
          lotes: setor.lotes.map(lote => {
            if (lote.id === loteId) {
              return { ...lote, [campo]: valor };
            }
            return lote;
          })
        };
      }
      return setor;
    }));
  };

  const adicionarTipoIngresso = (setorId, loteId = null) => {
    setSetores(setores.map(setor => {
      if (setor.id === setorId) {
        if (loteId) {
          return {
            ...setor,
            lotes: setor.lotes.map(lote => {
              if (lote.id === loteId) {
                return {
                  ...lote,
                  tiposIngresso: [
                    ...lote.tiposIngresso,
                    { id: Date.now(), nome: '', preco: '', quantidade: '' }
                  ]
                };
              }
              return lote;
            })
          };
        } else {
          return {
            ...setor,
            tiposIngresso: [
              ...setor.tiposIngresso,
              { id: Date.now(), nome: '', preco: '', quantidade: '' }
            ]
          };
        }
      }
      return setor;
    }));
  };

  const removerTipoIngresso = (setorId, tipoId, loteId = null) => {
    setSetores(setores.map(setor => {
      if (setor.id === setorId) {
        if (loteId) {
          return {
            ...setor,
            lotes: setor.lotes.map(lote => {
              if (lote.id === loteId) {
                if (lote.tiposIngresso.length === 1) {
                  alert('Você precisa ter pelo menos um tipo de ingresso no lote!');
                  return lote;
                }
                return {
                  ...lote,
                  tiposIngresso: lote.tiposIngresso.filter(t => t.id !== tipoId)
                };
              }
              return lote;
            })
          };
        } else {
          if (setor.tiposIngresso.length === 1) {
            alert('Você precisa ter pelo menos um tipo de ingresso!');
            return setor;
          }
          return {
            ...setor,
            tiposIngresso: setor.tiposIngresso.filter(t => t.id !== tipoId)
          };
        }
      }
      return setor;
    }));
  };

  const atualizarTipoIngresso = (setorId, tipoId, campo, valor, loteId = null) => {
    setSetores(setores.map(setor => {
      if (setor.id === setorId) {
        if (loteId) {
          return {
            ...setor,
            lotes: setor.lotes.map(lote => {
              if (lote.id === loteId) {
                return {
                  ...lote,
                  tiposIngresso: lote.tiposIngresso.map(tipo => {
                    if (tipo.id === tipoId) {
                      return { ...tipo, [campo]: valor };
                    }
                    return tipo;
                  })
                };
              }
              return lote;
            })
          };
        } else {
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
      }
      return setor;
    }));
  };

  const calcularTotalIngressos = (setor, lote = null) => {
    if (lote) {
      return lote.tiposIngresso.reduce((sum, tipo) => sum + (parseInt(tipo.quantidade) || 0), 0);
    }
    return setor.tiposIngresso.reduce((sum, tipo) => sum + (parseInt(tipo.quantidade) || 0), 0);
  };

  const verificarCapacidade = (setor, lote = null) => {
    const total = calcularTotalIngressos(setor, lote);
    const capacidade = lote ? parseInt(lote.quantidadeTotal) || Infinity : parseInt(setor.capacidadeTotal) || Infinity;
    
    if (total > capacidade) {
      return { valido: false, total, capacidade };
    }
    return { valido: true, total, capacidade };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', border: '2px solid #3498db' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#2980b9' }}>💡 Como funciona:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
          <li><strong>Capacidade do Setor</strong>: Define quantos ingressos no total podem ser vendidos (opcional)</li>
          <li><strong>Lotes</strong>: Divida as vendas em fases (1º lote mais barato, 2º lote, etc.)</li>
          <li><strong>Tipos de Ingresso</strong>: Inteira, Meia, VIP, etc.</li>
          <li><strong>Quantidade</strong>: Deixe vazio para ilimitado!</li>
        </ul>
      </div>

      {setores.map((setor, setorIndex) => {
        const validacaoSetor = verificarCapacidade(setor);
        
        return (
          <div key={setor.id} style={{ 
            border: '2px solid #ddd', 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#5d34a4' }}>🎪 Setor {setorIndex + 1}</h3>
              {setores.length > 1 && (
                <button type="button" onClick={() => removerSetor(setor.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  ❌ Remover Setor
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nome do Setor *</label>
                <input type="text" value={setor.nome} onChange={(e) => atualizarSetor(setor.id, 'nome', e.target.value)} placeholder="Ex: VIP, Camarote, Pista Premium" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Capacidade Total do Setor (opcional)</label>
                <input type="number" value={setor.capacidadeTotal} onChange={(e) => atualizarSetor(setor.id, 'capacidadeTotal', e.target.value)} placeholder="Deixe vazio para ilimitado" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }} />
                <small style={{ color: '#666' }}>Deixe em branco para ilimitado</small>
                {setor.capacidadeTotal && !validacaoSetor.valido && (
                  <div style={{ color: '#e74c3c', fontWeight: 'bold', marginTop: '5px' }}>
                    ⚠️ ATENÇÃO: Total de ingressos ({validacaoSetor.total}) excede a capacidade ({validacaoSetor.capacidade})!
                  </div>
                )}
              </div>

              <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '2px dashed #9b59b6' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={setor.usaLotes} onChange={(e) => atualizarSetor(setor.id, 'usaLotes', e.target.checked)} style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontWeight: 'bold', color: '#9b59b6' }}>🎫 Usar Lotes (vendas em fases)</span>
                </label>
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                  Com lotes você pode vender em fases: 1º lote mais barato, 2º lote, etc.
                </small>
              </div>

              {setor.usaLotes ? (
                <div style={{ marginLeft: '20px', borderLeft: '3px solid #9b59b6', paddingLeft: '15px' }}>
                  <h4 style={{ color: '#9b59b6', marginBottom: '15px' }}>Lotes deste Setor</h4>
                  
                  {setor.lotes.map((lote, loteIndex) => {
                    const validacaoLote = verificarCapacidade(setor, lote);
                    
                    return (
                      <div key={lote.id} style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '2px solid #d1a7f5' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <h5 style={{ margin: 0, color: '#8e44ad' }}>Lote {loteIndex + 1}</h5>
                          {setor.lotes.length > 1 && (
                            <button type="button" onClick={() => removerLote(setor.id, lote.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                              🗑️ Remover
                            </button>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                          <div>
                            <label style={{ fontSize: '12px', display: 'block', marginBottom: '3px' }}>Nome do Lote *</label>
                            <input type="text" value={lote.nome} onChange={(e) => atualizarLote(setor.id, lote.id, 'nome', e.target.value)} placeholder="Ex: 1º Lote" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', display: 'block', marginBottom: '3px' }}>Qtd Total</label>
                            <input type="number" min="0" value={lote.quantidadeTotal} onChange={(e) => atualizarLote(setor.id, lote.id, 'quantidadeTotal', e.target.value)} placeholder="Ilimitado" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', display: 'block', marginBottom: '3px' }}>Início</label>
                            <input type="datetime-local" value={lote.dataInicio} onChange={(e) => atualizarLote(setor.id, lote.id, 'dataInicio', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '12px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', display: 'block', marginBottom: '3px' }}>Fim</label>
                            <input type="datetime-local" value={lote.dataFim} onChange={(e) => atualizarLote(setor.id, lote.id, 'dataFim', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '12px' }} />
                          </div>
                        </div>

                        {lote.quantidadeTotal && !validacaoLote.valido && (
                          <div style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '13px', marginBottom: '10px' }}>
                            ⚠️ Total ({validacaoLote.total}) excede capacidade do lote ({validacaoLote.capacidade})!
                          </div>
                        )}

                        <div>
                          <h6 style={{ margin: '10px 0', fontSize: '13px' }}>Tipos de Ingresso neste Lote:</h6>
                          {lote.tiposIngresso.map((tipo) => (
                            <div key={tipo.id} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-end' }}>
                              <div style={{ flex: 1 }}>
                                <input type="text" value={tipo.nome} onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'nome', e.target.value, lote.id)} placeholder="Nome (ex: Inteira, Meia)" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '13px' }} />
                              </div>
                              <div style={{ width: '100px' }}>
                                <input type="number" step="0.01" min="0.01" value={tipo.preco} onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'preco', e.target.value, lote.id)} placeholder="R$" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '13px' }} />
                              </div>
                              <div style={{ width: '80px' }}>
                                <input type="number" min="0" value={tipo.quantidade} onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'quantidade', e.target.value, lote.id)} placeholder="Ilimitado" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '13px' }} />
                              </div>
                              {lote.tiposIngresso.length > 1 && (
                                <button type="button" onClick={() => removerTipoIngresso(setor.id, tipo.id, lote.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                  🗑️
                                </button>
                              )}
                            </div>
                          ))}
                          <button type="button" onClick={() => adicionarTipoIngresso(setor.id, lote.id)} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', marginTop: '5px' }}>
                            + Adicionar Tipo
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <button type="button" onClick={() => adicionarLote(setor.id)} style={{ backgroundColor: '#9b59b6', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                    + Adicionar Novo Lote
                  </button>
                </div>
              ) : (
                <div>
                  <h4 style={{ marginBottom: '10px', color: '#333' }}>Tipos de Ingresso neste Setor</h4>
                  {setor.tiposIngresso.map((tipo) => (
                    <div key={tipo.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '3px' }}>Nome *</label>
                        <input type="text" value={tipo.nome} onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'nome', e.target.value)} placeholder="Ex: Inteira, Meia" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ width: '120px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '3px' }}>Preço (R$) *</label>
                        <input type="number" step="0.01" min="0" value={tipo.preco} onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'preco', e.target.value)} placeholder="0.00" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ width: '120px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '3px' }}>Quantidade</label>
                        <input type="number" min="0" value={tipo.quantidade} onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'quantidade', e.target.value)} placeholder="Ilimitado" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                      </div>
                      {setor.tiposIngresso.length > 1 && (
                        <button type="button" onClick={() => removerTipoIngresso(setor.id, tipo.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => adicionarTipoIngresso(setor.id)} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '5px' }}>
                    + Adicionar Tipo de Ingresso
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <button type="button" onClick={adicionarSetor} style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
        + Adicionar Novo Setor
      </button>
    </div>
  );
};

export default SetorManager;
