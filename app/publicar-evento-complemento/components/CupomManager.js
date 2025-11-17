import React, { useState, useEffect } from 'react';

const CupomManager = ({ setoresIngressos, onCuponsChange }) => {
  const [usaCupons, setUsaCupons] = useState(false);
  const [cupons, setCupons] = useState([]);

  useEffect(() => {
    console.log('🎟️ Cupons atualizados:', cupons);
    if (onCuponsChange) {
      onCuponsChange(usaCupons ? cupons : []);
    }
  }, [cupons, usaCupons, onCuponsChange]);

  const adicionarCupom = (copiarDe = null) => {
    const novoCupom = {
      id: Date.now(),
      codigo: '',
      descricao: '',
      quantidadeTotal: '',
      dataInicio: '',
      dataFim: '',
      precosPorIngresso: {}
    };

    if (copiarDe) {
      novoCupom.precosPorIngresso = { ...copiarDe.precosPorIngresso };
    } else {
      setoresIngressos.forEach((setor) => {
        if (setor.usaLotes) {
          setor.lotes.forEach((lote) => {
            lote.tiposIngresso.forEach((tipo) => {
              const chave = `${setor.id}-${lote.id}-${tipo.id}`;
              novoCupom.precosPorIngresso[chave] = tipo.preco || '';
            });
          });
        } else {
          setor.tiposIngresso.forEach((tipo) => {
            const chave = `${setor.id}-null-${tipo.id}`;
            novoCupom.precosPorIngresso[chave] = tipo.preco || '';
          });
        }
      });
    }

    setCupons([...cupons, novoCupom]);
  };

  const removerCupom = (cupomId) => {
    setCupons(cupons.filter(c => c.id !== cupomId));
  };

  const atualizarCupom = (cupomId, campo, valor) => {
    setCupons(cupons.map(cupom => {
      if (cupom.id === cupomId) {
        return { ...cupom, [campo]: valor };
      }
      return cupom;
    }));
  };

  const atualizarPrecoIngresso = (cupomId, chave, valor) => {
    setCupons(cupons.map(cupom => {
      if (cupom.id === cupomId) {
        return {
          ...cupom,
          precosPorIngresso: {
            ...cupom.precosPorIngresso,
            [chave]: valor
          }
        };
      }
      return cupom;
    }));
  };

  const aplicarDescontoPercentual = (cupomId, percentual) => {
    setCupons(cupons.map(cupom => {
      if (cupom.id === cupomId) {
        const novosPrecos = {};
        Object.keys(cupom.precosPorIngresso).forEach(chave => {
          const precoOriginal = parseFloat(cupom.precosPorIngresso[chave]) || 0;
          novosPrecos[chave] = (precoOriginal * (1 - percentual / 100)).toFixed(2);
        });
        return { ...cupom, precosPorIngresso: novosPrecos };
      }
      return cupom;
    }));
  };

  if (!setoresIngressos || setoresIngressos.length === 0) {
    return (
      <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', border: '2px solid #ffc107' }}>
        <p style={{ margin: 0, color: '#856404' }}>
          ⚠️ Crie pelo menos um setor com ingressos antes de adicionar cupons!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '12px', color: 'white' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={usaCupons} 
            onChange={(e) => {
              setUsaCupons(e.target.checked);
              if (e.target.checked && cupons.length === 0) {
                adicionarCupom();
              }
            }}
            style={{ width: '24px', height: '24px', cursor: 'pointer' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
              🎟️ Criar Cupons de Desconto
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              Defina preços especiais para seus ingressos quando cupons forem aplicados
            </div>
          </div>
        </label>
      </div>

      {usaCupons && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#d1ecf1', padding: '15px', borderRadius: '8px', border: '2px solid #17a2b8' }}>
            <strong style={{ color: '#0c5460' }}>💡 Como funciona:</strong>
            <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', fontSize: '14px', color: '#0c5460' }}>
              <li>Crie cupons com códigos personalizados (ex: PROMO50, VERAO2024)</li>
              <li>Defina quanto cada ingresso vai custar COM o cupom aplicado</li>
              <li>Use os atalhos rápidos para aplicar descontos em todos os ingressos</li>
            </ul>
          </div>

          {cupons.map((cupom, cupomIndex) => (
            <div key={cupom.id} style={{ 
              border: '3px solid #764ba2', 
              borderRadius: '12px', 
              padding: '25px', 
              backgroundColor: '#f8f9fa',
              boxShadow: '0 4px 12px rgba(118, 75, 162, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#764ba2', fontSize: '20px' }}>
                  🎟️ Cupom {cupomIndex + 1}
                </h3>
                <button 
                  type="button" 
                  onClick={() => removerCupom(cupom.id)}
                  style={{ 
                    backgroundColor: '#e74c3c', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  🗑️ Remover Cupom
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Código do Cupom * (ex: PROMO50)
                  </label>
                  <input
                    type="text"
                    value={cupom.codigo}
                    onChange={(e) => atualizarCupom(cupom.id, 'codigo', e.target.value.toUpperCase())}
                    placeholder="PROMOCAO2024"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px solid #ddd', 
                      borderRadius: '8px', 
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Limite de Usos (opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cupom.quantidadeTotal}
                    onChange={(e) => atualizarCupom(cupom.id, 'quantidadeTotal', e.target.value)}
                    placeholder="Deixe vazio = ilimitado"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px solid #ddd', 
                      borderRadius: '8px', 
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Descrição (opcional)
                  </label>
                  <input
                    type="text"
                    value={cupom.descricao}
                    onChange={(e) => atualizarCupom(cupom.id, 'descricao', e.target.value)}
                    placeholder="Ex: Promoção de Verão - 50% off"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px solid #ddd', 
                      borderRadius: '8px', 
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Válido de (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={cupom.dataInicio}
                    onChange={(e) => atualizarCupom(cupom.id, 'dataInicio', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px solid #ddd', 
                      borderRadius: '8px', 
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Válido até (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={cupom.dataFim}
                    onChange={(e) => atualizarCupom(cupom.id, 'dataFim', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px solid #ddd', 
                      borderRadius: '8px', 
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#2980b9' }}>⚡ Atalho Rápido</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[10, 20, 30, 50].map(desc => (
                    <button
                      key={desc}
                      type="button"
                      onClick={() => aplicarDescontoPercentual(cupom.id, desc)}
                      style={{ 
                        backgroundColor: '#3498db', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 15px', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      -{desc}% em tudo
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '2px solid #667eea' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#667eea', fontSize: '16px' }}>
                  💰 Preços dos Ingressos COM Este Cupom
                </h4>
                
                {setoresIngressos.map((setor) => (
                  <div key={setor.id} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed #ddd' }}>
                    <h5 style={{ margin: '0 0 10px 0', color: '#5d34a4', fontSize: '15px' }}>
                      🎪 {setor.nome}
                    </h5>
                    
                    {setor.usaLotes ? (
                      setor.lotes.map((lote) => (
                        <div key={lote.id} style={{ marginLeft: '15px', marginBottom: '15px' }}>
                          <h6 style={{ margin: '0 0 8px 0', color: '#8e44ad', fontSize: '14px' }}>
                            📦 {lote.nome}
                          </h6>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                            {lote.tiposIngresso.map((tipo) => {
                              const chave = `${setor.id}-${lote.id}-${tipo.id}`;
                              const precoOriginal = parseFloat(tipo.preco) || 0;
                              const precoComCupom = parseFloat(cupom.precosPorIngresso[chave]) || 0;
                              const desconto = precoOriginal > 0 ? ((precoOriginal - precoComCupom) / precoOriginal * 100).toFixed(0) : 0;
                              
                              return (
                                <div key={tipo.id} style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                  <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                                    {tipo.nome}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                    Original: <span style={{ textDecoration: 'line-through' }}>R$ {precoOriginal.toFixed(2)}</span>
                                    {desconto > 0 && <span style={{ color: '#e74c3c', fontWeight: 'bold', marginLeft: '5px' }}>(-{desconto}%)</span>}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>R$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={cupom.precosPorIngresso[chave] || ''}
                                      onChange={(e) => atualizarPrecoIngresso(cupom.id, chave, e.target.value)}
                                      placeholder="0.00"
                                      style={{ 
                                        flex: 1,
                                        padding: '8px', 
                                        border: '2px solid #667eea', 
                                        borderRadius: '6px', 
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px', marginLeft: '15px' }}>
                        {setor.tiposIngresso.map((tipo) => {
                          const chave = `${setor.id}-null-${tipo.id}`;
                          const precoOriginal = parseFloat(tipo.preco) || 0;
                          const precoComCupom = parseFloat(cupom.precosPorIngresso[chave]) || 0;
                          const desconto = precoOriginal > 0 ? ((precoOriginal - precoComCupom) / precoOriginal * 100).toFixed(0) : 0;
                          
                          return (
                            <div key={tipo.id} style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                              <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                                {tipo.nome}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                Original: <span style={{ textDecoration: 'line-through' }}>R$ {precoOriginal.toFixed(2)}</span>
                                {desconto > 0 && <span style={{ color: '#e74c3c', fontWeight: 'bold', marginLeft: '5px' }}>(-{desconto}%)</span>}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>R$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={cupom.precosPorIngresso[chave] || ''}
                                  onChange={(e) => atualizarPrecoIngresso(cupom.id, chave, e.target.value)}
                                  placeholder="0.00"
                                  style={{ 
                                    flex: 1,
                                    padding: '8px', 
                                    border: '2px solid #667eea', 
                                    borderRadius: '6px', 
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={() => adicionarCupom()}
              style={{ 
                flex: 1,
                minWidth: '200px',
                backgroundColor: '#667eea', 
                color: 'white', 
                border: 'none', 
                padding: '15px 25px', 
                borderRadius: '10px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              + Criar Novo Cupom
            </button>

            {cupons.length > 0 && (
              <button 
                type="button" 
                onClick={() => adicionarCupom(cupons[cupons.length - 1])}
                style={{ 
                  flex: 1,
                  minWidth: '200px',
                  backgroundColor: '#764ba2', 
                  color: 'white', 
                  border: 'none', 
                  padding: '15px 25px', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '16px',
                  boxShadow: '0 4px 12px rgba(118, 75, 162, 0.3)'
                }}
              >
                + Copiar Valores do Último Cupom
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CupomManager;
  const [usaCupons, setUsaCupons] = useState(false);
  const [cupons, setCupons] = useState([]);

  useEffect(() => {
    console.log('🎟️ Cupons atualizados:', cupons);
    if (onCuponsChange) {
      onCuponsChange(usaCupons ? cupons : []);
    }
  }, [cupons, usaCupons, onCuponsChange]);

  const adicionarCupom = (copiarDe = null) => {
    const novoCupom = {
      id: Date.now(),
      codigo: '',
      descricao: '',
      quantidadeTotal: '',
      dataInicio: '',
      dataFim: '',
      precosPorIngresso: {}
    };

    if (copiarDe) {
      const cupomOrigem = cupons.find(c => c.id === copiarDe);
      if (cupomOrigem) {
        novoCupom.precosPorIngresso = { ...cupomOrigem.precosPorIngresso };
      }
    } else {
      setoresIngressos.forEach((setor) => {
        if (setor.usaLotes) {
          setor.lotes.forEach((lote) => {
            lote.tiposIngresso.forEach((tipo) => {
              const chave = `${setor.id}-${lote.id}-${tipo.id}`;
              novoCupom.precosPorIngresso[chave] = tipo.preco || '';
            });
          });
        } else {
          setor.tiposIngresso.forEach((tipo) => {
            const chave = `${setor.id}-null-${tipo.id}`;
            novoCupom.precosPorIngresso[chave] = tipo.preco || '';
          });
        }
      });
    }

    setCupons([...cupons, novoCupom]);
  };

  const removerCupom = (cupomId) => {
    setCupons(cupons.filter(c => c.id !== cupomId));
  };

  const atualizarCupom = (cupomId, campo, valor) => {
    setCupons(cupons.map(cupom => {
      if (cupom.id === cupomId) {
        return { ...cupom, [campo]: valor };
      }
      return cupom;
    }));
  };

  const atualizarPrecoIngresso = (cupomId, chave, valor) => {
    setCupons(cupons.map(cupom => {
      if (cupom.id === cupomId) {
        return {
          ...cupom,
          precosPorIngresso: {
            ...cupom.precosPorIngresso,
            [chave]: valor
          }
        };
      }
      return cupom;
    }));
  };

  if (!setoresIngressos || setoresIngressos.length === 0) {
    return (
      <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', border: '2px solid #ffc107' }}>
        <p style={{ margin: 0, color: '#856404' }}>
          ⚠️ Crie pelo menos um setor com ingressos antes de adicionar cupons!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '12px', color: 'white' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={usaCupons} 
            onChange={(e) => {
              setUsaCupons(e.target.checked);
              if (e.target.checked && cupons.length === 0) {
                adicionarCupom();
              }
            }}
            style={{ width: '24px', height: '24px', cursor: 'pointer' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
              🎟️ Criar Cupons de Desconto
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              Defina preços especiais para seus ingressos quando cupons forem aplicados
            </div>
          </div>
        </label>
      </div>

      {usaCupons && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#d1ecf1', padding: '15px', borderRadius: '8px', border: '2px solid #17a2b8' }}>
            <strong style={{ color: '#0c5460' }}>💡 Como funciona:</strong>
            <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', fontSize: '14px', color: '#0c5460' }}>
              <li>Crie cupons com códigos personalizados (ex: PROMO50, VERAO2024)</li>
              <li>Defina quanto cada ingresso vai custar COM o cupom aplicado</li>
              <li>Você pode criar vários cupons com preços diferentes</li>
              <li>Ao criar o 2º cupom, pode copiar os valores do 1º</li>
            </ul>
          </div>

          {cupons.map((cupom, cupomIndex) => (
            <div key={cupom.id} style={{ 
              border: '3px solid #764ba2', 
              borderRadius: '12px', 
              padding: '25px', 
              backgroundColor: '#f8f9fa',
              boxShadow: '0 4px 12px rgba(118, 75, 162, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#764ba2', fontSize: '20px' }}>
                  🎟️ Cupom {cupomIndex + 1}
                </h3>
                <button 
                  type="button" 
                  onClick={() => removerCupom(cupom.id)}
                  style={{ 
                    backgroundColor: '#e74c3c', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  🗑️ Remover Cupom
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Código do Cupom * (ex: PROMO50)
                  </label>
                  <input
                    type="text"
                    value={cupom.codigo}
                    onChange={(e) => atualizarCupom(cupom.id, 'codigo', e.target.value.toUpperCase())}
                    placeholder="PROMOCAO2024"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px solid #ddd', 
                      borderRadius: '8px', 
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Limite de Usos (opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cupom.quantidadeTotal}
                    onChange={(e) => atualizarCupom(cupom.id, 'quantidadeTotal', e.target.value)}
                    placeholder="Deixe vazio = ilimitado"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px solid #ddd', 
                      borderRadius: '8px', 
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Descrição (opcional)
                  </label>
                  <input
                    type="text"
                    value={cupom.descricao}
                    onChange={(e) => atualizarCupom(cupom.id, 'descricao', e.target.value)}
                    placeholder="Ex: Promoção de Verão - 50% off"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px solid #ddd', 
                      borderRadius: '8px', 
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Válido de (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={cupom.dataInicio}
                    onChange={(e) => atualizarCupom(cupom.id, 'dataInicio', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px solid #ddd', 
                      borderRadius: '8px', 
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Válido até (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={cupom.dataFim}
                    onChange={(e) => atualizarCupom(cupom.id, 'dataFim', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px solid #ddd', 
                      borderRadius: '8px', 
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '2px solid #667eea' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#667eea', fontSize: '16px' }}>
                  💰 Preços dos Ingressos COM Este Cupom
                </h4>
                
                {setoresIngressos.map((setor) => (
                  <div key={setor.id} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed #ddd' }}>
                    <h5 style={{ margin: '0 0 10px 0', color: '#5d34a4', fontSize: '15px' }}>
                      🎪 {setor.nome}
                    </h5>
                    
                    {setor.usaLotes ? (
                      setor.lotes.map((lote) => (
                        <div key={lote.id} style={{ marginLeft: '15px', marginBottom: '15px' }}>
                          <h6 style={{ margin: '0 0 8px 0', color: '#8e44ad', fontSize: '14px' }}>
                            📦 {lote.nome}
                          </h6>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                            {lote.tiposIngresso.map((tipo) => {
                              const chave = `${setor.id}-${lote.id}-${tipo.id}`;
                              const precoOriginal = parseFloat(tipo.preco) || 0;
                              const precoComCupom = parseFloat(cupom.precosPorIngresso[chave]) || 0;
                              const desconto = precoOriginal > 0 ? ((precoOriginal - precoComCupom) / precoOriginal * 100).toFixed(0) : 0;
                              
                              return (
                                <div key={tipo.id} style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                  <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                                    {tipo.nome}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                    Original: <span style={{ textDecoration: 'line-through' }}>R$ {precoOriginal.toFixed(2)}</span>
                                    {desconto > 0 && <span style={{ color: '#e74c3c', fontWeight: 'bold', marginLeft: '5px' }}>(-{desconto}%)</span>}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>R$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={cupom.precosPorIngresso[chave] || ''}
                                      onChange={(e) => atualizarPrecoIngresso(cupom.id, chave, e.target.value)}
                                      placeholder="0.00"
                                      style={{ 
                                        flex: 1,
                                        padding: '8px', 
                                        border: '2px solid #667eea', 
                                        borderRadius: '6px', 
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px', marginLeft: '15px' }}>
                        {setor.tiposIngresso.map((tipo) => {
                          const chave = `${setor.id}-null-${tipo.id}`;
                          const precoOriginal = parseFloat(tipo.preco) || 0;
                          const precoComCupom = parseFloat(cupom.precosPorIngresso[chave]) || 0;
                          const desconto = precoOriginal > 0 ? ((precoOriginal - precoComCupom) / precoOriginal * 100).toFixed(0) : 0;
                          
                          return (
                            <div key={tipo.id} style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                              <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                                {tipo.nome}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                Original: <span style={{ textDecoration: 'line-through' }}>R$ {precoOriginal.toFixed(2)}</span>
                                {desconto > 0 && <span style={{ color: '#e74c3c', fontWeight: 'bold', marginLeft: '5px' }}>(-{desconto}%)</span>}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>R$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={cupom.precosPorIngresso[chave] || ''}
                                  onChange={(e) => atualizarPrecoIngresso(cupom.id, chave, e.target.value)}
                                  placeholder="0.00"
                                  style={{ 
                                    flex: 1,
                                    padding: '8px', 
                                    border: '2px solid #667eea', 
                                    borderRadius: '6px', 
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={() => adicionarCupom()}
              style={{ 
                flex: 1,
                minWidth: '200px',
                backgroundColor: '#667eea', 
                color: 'white', 
                border: 'none', 
                padding: '15px 25px', 
                borderRadius: '10px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              + Criar Novo Cupom
            </button>

            {cupons.length > 0 && (
              <button 
                type="button" 
                onClick={() => adicionarCupom(cupons[cupons.length - 1].id)}
                style={{ 
                  flex: 1,
                  minWidth: '200px',
                  backgroundColor: '#764ba2', 
                  color: 'white', 
                  border: 'none', 
                  padding: '15px 25px', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '16px',
                  boxShadow: '0 4px 12px rgba(118, 75, 162, 0.3)'
                }}
              >
                + Copiar Valores do Último Cupom
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CupomManager;
