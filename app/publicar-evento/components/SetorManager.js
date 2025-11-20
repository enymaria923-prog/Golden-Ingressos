'use client';
import React, { useState, useEffect } from 'react';

const SetorManager = ({ onSetoresChange }) => {
  const [setores, setSetores] = useState([
    {
      id: 1,
      nome: '',
      capacidadeDefinida: '', // Limite opcional definido pelo usuário
      usaLotes: false,
      lotes: [],
      tiposIngresso: [
        { id: 1, nome: '', preco: '', quantidade: '' }
      ]
    }
  ]);

  // Função para calcular o total real de ingressos de um setor
  const calcularCapacidadeReal = (setor) => {
    let total = 0;
    
    if (setor.usaLotes && setor.lotes.length > 0) {
      setor.lotes.forEach(lote => {
        lote.tiposIngresso.forEach(tipo => {
          const qtd = parseInt(tipo.quantidade) || 0;
          if (tipo.nome && tipo.nome.trim() !== '' && parseFloat(tipo.preco) > 0) {
            total += qtd;
          }
        });
      });
    } else {
      setor.tiposIngresso.forEach(tipo => {
        const qtd = parseInt(tipo.quantidade) || 0;
        if (tipo.nome && tipo.nome.trim() !== '' && parseFloat(tipo.preco) > 0) {
          total += qtd;
        }
      });
    }
    
    return total;
  };

  useEffect(() => {
    console.log('🎫 Setores atualizados:', setores);
    if (onSetoresChange) {
      const setoresProcessados = setores.map(setor => {
        const capacidadeReal = calcularCapacidadeReal(setor);
        
        return {
          ...setor,
          capacidadeDefinida: setor.capacidadeDefinida === '' ? null : parseInt(setor.capacidadeDefinida),
          capacidadeCalculada: capacidadeReal, // Total real calculado
          tiposIngresso: setor.tiposIngresso.map(tipo => ({
            ...tipo,
            quantidade: tipo.quantidade === '' ? 0 : parseInt(tipo.quantidade),
            preco: tipo.preco || null
          })),
          lotes: setor.lotes.map(lote => ({
            ...lote,
            quantidadeTotal: lote.quantidadeTotal === '' ? null : parseInt(lote.quantidadeTotal),
            tiposIngresso: lote.tiposIngresso.map(tipo => ({
              ...tipo,
              quantidade: tipo.quantidade === '' ? 0 : parseInt(tipo.quantidade),
              preco: tipo.preco || null
            }))
          }))
        };
      });
      
      console.log('📊 Setores processados com capacidades:', setoresProcessados.map(s => ({
        nome: s.nome,
        definida: s.capacidadeDefinida,
        calculada: s.capacidadeCalculada
      })));
      
      onSetoresChange(setoresProcessados);
    }
  }, [setores]);

  const adicionarSetor = () => {
    const novoSetor = {
      id: Date.now(),
      nome: '',
      capacidadeDefinida: '',
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

  const calcularTotalTipos = (tipos) => {
    return tipos.reduce((sum, tipo) => {
      const qtd = parseInt(tipo.quantidade);
      return sum + (isNaN(qtd) ? 0 : qtd);
    }, 0);
  };

  const validarHierarquia = (setor, lote = null) => {
    if (lote) {
      const totalTipos = calcularTotalTipos(lote.tiposIngresso);
      const capacidadeLote = parseInt(lote.quantidadeTotal);
      
      // Validar lote (se tiver limite definido)
      if (!isNaN(capacidadeLote) && capacidadeLote > 0 && totalTipos > capacidadeLote) {
        return { 
          valido: false, 
          mensagem: `Soma dos tipos (${totalTipos}) excede capacidade do lote (${capacidadeLote})!`
        };
      }
      
      return { valido: true };
    } else {
      // Validar setor sem lotes
      const totalTipos = calcularTotalTipos(setor.tiposIngresso);
      const capacidadeDefinida = parseInt(setor.capacidadeDefinida);
      
      if (!isNaN(capacidadeDefinida) && capacidadeDefinida > 0 && totalTipos > capacidadeDefinida) {
        return {
          valido: false,
          mensagem: `Soma dos tipos (${totalTipos}) excede o limite do setor (${capacidadeDefinida})!`
        };
      }
      
      return { valido: true };
    }
  };

  // Validar setor inteiro (soma de todos os lotes vs capacidade do setor)
  const validarSetorCompleto = (setor) => {
    if (!setor.usaLotes || setor.lotes.length === 0) return { valido: true };
    
    const capacidadeReal = calcularCapacidadeReal(setor);
    const capacidadeDefinida = parseInt(setor.capacidadeDefinida);
    
    if (!isNaN(capacidadeDefinida) && capacidadeDefinida > 0 && capacidadeReal > capacidadeDefinida) {
      return {
        valido: false,
        mensagem: `Total de ingressos nos lotes (${capacidadeReal}) excede o limite do setor (${capacidadeDefinida})!`
      };
    }
    
    return { valido: true };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', border: '2px solid #3498db' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#2980b9' }}>💡 Como funciona:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
          <li><strong>Limite do Setor:</strong> Capacidade máxima OPCIONAL (deixe vazio para ilimitado)</li>
          <li><strong>Lotes:</strong> Divida vendas em fases com limites próprios (opcional)</li>
          <li><strong>Tipos de Ingresso:</strong> Inteira, Meia, etc. com QUANTIDADES OBRIGATÓRIAS</li>
          <li><strong>⚠️ Regra:</strong> Soma das quantidades dos tipos ≤ Limite do Lote ≤ Limite do Setor</li>
          <li><strong>📊 Total Real:</strong> É calculado pela soma de TODOS os ingressos criados</li>
        </ul>
      </div>

      {setores.map((setor, setorIndex) => {
        const validacaoSetor = validarHierarquia(setor);
        const validacaoCompleta = validarSetorCompleto(setor);
        const capacidadeReal = calcularCapacidadeReal(setor);
        
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
                <input type="text" value={setor.nome} onChange={(e) => atualizarSetor(setor.id, 'nome', e.target.value)} placeholder="Ex: VIP, Pista" required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }} />
              </div>

              <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', border: '2px solid #ffc107' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#856404' }}>
                  🔒 Limite Máximo do Setor (opcional)
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={setor.capacidadeDefinida} 
                  onChange={(e) => atualizarSetor(setor.id, 'capacidadeDefinida', e.target.value)} 
                  placeholder="Deixe vazio para ilimitado" 
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', boxSizing: 'border-box', fontSize: '14px' }} 
                />
                <div style={{ marginTop: '10px', fontSize: '13px', color: '#555' }}>
                  <div style={{ fontWeight: 'bold', color: '#2196f3' }}>
                    📊 Total de Ingressos Criados: {capacidadeReal}
                  </div>
                  {setor.capacidadeDefinida && parseInt(setor.capacidadeDefinida) > 0 && (
                    <div style={{ color: '#666' }}>
                      🎯 Limite definido: {setor.capacidadeDefinida} | Disponível: {Math.max(0, parseInt(setor.capacidadeDefinida) - capacidadeReal)}
                    </div>
                  )}
                </div>
              </div>

              {!validacaoSetor.valido && (
                <div style={{ background: '#ffe6e6', border: '2px solid #e74c3c', borderRadius: '6px', padding: '10px', color: '#c0392b', fontWeight: 'bold' }}>
                  ⚠️ {validacaoSetor.mensagem}
                </div>
              )}

              {!validacaoCompleta.valido && (
                <div style={{ background: '#ffe6e6', border: '2px solid #e74c3c', borderRadius: '6px', padding: '10px', color: '#c0392b', fontWeight: 'bold' }}>
                  ⚠️ {validacaoCompleta.mensagem}
                </div>
              )}

              <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '2px dashed #9b59b6' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={setor.usaLotes} onChange={(e) => atualizarSetor(setor.id, 'usaLotes', e.target.checked)} style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontWeight: 'bold', color: '#9b59b6' }}>🎫 Usar Lotes (vendas em fases)</span>
                </label>
              </div>

              {setor.usaLotes ? (
                <div style={{ marginLeft: '20px', borderLeft: '3px solid #9b59b6', paddingLeft: '15px' }}>
                  <h4 style={{ color: '#9b59b6', marginBottom: '15px' }}>Lotes deste Setor</h4>
                  
                  {setor.lotes.map((lote, loteIndex) => {
                    const validacaoLote = validarHierarquia(setor, lote);
                    
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

                        {!validacaoLote.valido && (
                          <div style={{ background: '#ffe6e6', border: '1px solid #e74c3c', borderRadius: '4px', padding: '8px', marginBottom: '10px', color: '#c0392b', fontSize: '12px', fontWeight: 'bold' }}>
                            ⚠️ {validacaoLote.mensagem}
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                          <div>
                            <label style={{ fontSize: '12px', display: 'block', marginBottom: '3px' }}>Nome do Lote *</label>
                            <input type="text" value={lote.nome} onChange={(e) => atualizarLote(setor.id, lote.id, 'nome', e.target.value)} placeholder="Ex: 1º Lote" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', display: 'block', marginBottom: '3px' }}>Limite (opcional)</label>
                            <input type="number" min="1" value={lote.quantidadeTotal} onChange={(e) => atualizarLote(setor.id, lote.id, 'quantidadeTotal', e.target.value)} placeholder="Ilimitado" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
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

                        <div>
                          <h6 style={{ margin: '10px 0', fontSize: '13px' }}>Tipos de Ingresso:</h6>
                          {lote.tiposIngresso.map((tipo) => (
                            <div key={tipo.id} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-end' }}>
                              <div style={{ flex: 1 }}>
                                <input type="text" value={tipo.nome} onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'nome', e.target.value, lote.id)} placeholder="Nome *" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '13px' }} />
                              </div>
                              <div style={{ width: '100px' }}>
                                <input type="number" step="0.01" min="0.01" value={tipo.preco} onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'preco', e.target.value, lote.id)} placeholder="R$ *" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '13px' }} />
                              </div>
                              <div style={{ width: '100px' }}>
                                <input type="number" min="0" value={tipo.quantidade} onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'quantidade', e.target.value, lote.id)} placeholder="Qtd *" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '13px' }} />
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
                  <h4 style={{ marginBottom: '10px', color: '#333' }}>Tipos de Ingresso *</h4>
                  {setor.tiposIngresso.map((tipo) => (
                    <div key={tipo.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '3px' }}>Nome *</label>
                        <input type="text" value={tipo.nome} onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'nome', e.target.value)} placeholder="Ex: Inteira, Meia" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ width: '120px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '3px' }}>Preço (R$) *</label>
                        <input type="number" step="0.01" min="0.01" value={tipo.preco} onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'preco', e.target.value)} placeholder="0.00" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ width: '120px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '3px' }}>Quantidade *</label>
                        <input type="number" min="0" value={tipo.quantidade} onChange={(e) => atualizarTipoIngresso(setor.id, tipo.id, 'quantidade', e.target.value)} placeholder="Ex: 100" required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
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
