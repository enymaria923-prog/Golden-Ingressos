'use client';
import React, { useState, useEffect, useRef } from 'react';

const CupomManager = ({ setoresIngressos = [], onCuponsChange }) => {
  const [cupons, setCupons] = useState([]);
  const onCuponsChangeRef = useRef(onCuponsChange);

  // Atualiza a ref quando o callback mudar
  useEffect(() => {
    onCuponsChangeRef.current = onCuponsChange;
  }, [onCuponsChange]);

  // Chama o callback apenas quando cupons mudarem
  useEffect(() => {
    if (onCuponsChangeRef.current) {
      onCuponsChangeRef.current(cupons);
    }
  }, [cupons]);

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

    // Se está copiando de outro cupom
    if (copiarDe) {
      const cupomOriginal = cupons.find(c => c.id === copiarDe);
      if (cupomOriginal) {
        novoCupom.precosPorIngresso = { ...cupomOriginal.precosPorIngresso };
      }
    }

    setCupons([...cupons, novoCupom]);
  };

  const removerCupom = (cupomId) => {
    setCupons(cupons.filter(c => c.id !== cupomId));
  };

  const atualizarCupom = (cupomId, campo, valor) => {
    setCupons(cupons.map(cupom => 
      cupom.id === cupomId ? { ...cupom, [campo]: valor } : cupom
    ));
  };

  const atualizarPrecoCupom = (cupomId, chaveIngresso, valor) => {
    setCupons(cupons.map(cupom => {
      if (cupom.id === cupomId) {
        return {
          ...cupom,
          precosPorIngresso: {
            ...cupom.precosPorIngresso,
            [chaveIngresso]: valor
          }
        };
      }
      return cupom;
    }));
  };

  const obterPrecoOriginal = (chaveIngresso) => {
    // Chave formato: setor-NOME-lote-ID-tipo-ID ou setor-NOME-tipo-ID
    const partes = chaveIngresso.split('-');
    const ingressoId = parseInt(partes[partes.length - 1]);

    for (const setor of setoresIngressos) {
      if (setor.usaLotes) {
        for (const lote of setor.lotes) {
          const tipo = lote.tiposIngresso.find(t => t.id === ingressoId);
          if (tipo) return parseFloat(tipo.preco) || 0;
        }
      } else {
        const tipo = setor.tiposIngresso.find(t => t.id === ingressoId);
        if (tipo) return parseFloat(tipo.preco) || 0;
      }
    }
    return 0;
  };

  const calcularDesconto = (precoOriginal, precoComCupom) => {
    if (!precoOriginal || precoOriginal === 0) return 0;
    const preco = parseFloat(precoComCupom) || 0;
    return ((precoOriginal - preco) / precoOriginal * 100).toFixed(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {cupons.length === 0 ? (
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '30px', 
          borderRadius: '12px', 
          textAlign: 'center',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '24px' }}>🎟️ Cupons de Desconto</h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '16px', opacity: 0.9 }}>
            Crie cupons personalizados com preços especiais para cada ingresso
          </p>
          <button 
            type="button"
            onClick={() => adicionarCupom()}
            style={{ 
              background: 'white', 
              color: '#667eea', 
              border: 'none', 
              padding: '15px 30px', 
              borderRadius: '8px', 
              fontSize: '16px', 
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            + Criar Primeiro Cupom
          </button>
        </div>
      ) : (
        <>
          {cupons.map((cupom, index) => (
            <div 
              key={cupom.id} 
              style={{ 
                border: '2px solid #667eea', 
                borderRadius: '12px', 
                padding: '25px', 
                background: 'linear-gradient(to bottom, #f0f4ff, #ffffff)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#667eea', fontSize: '22px' }}>
                  🎫 Cupom {index + 1}
                </h3>
                <button 
                  type="button"
                  onClick={() => removerCupom(cupom.id)}
                  style={{ 
                    background: '#e74c3c', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🗑️ Remover Cupom
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    Código do Cupom *
                  </label>
                  <input
                    type="text"
                    value={cupom.codigo}
                    onChange={(e) => atualizarCupom(cupom.id, 'codigo', e.target.value.toUpperCase())}
                    placeholder="Ex: PROMO50, BLACKFRIDAY"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '2px solid #667eea', 
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    Quantidade de Usos (opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cupom.quantidadeTotal}
                    onChange={(e) => atualizarCupom(cupom.id, 'quantidadeTotal', e.target.value)}
                    placeholder="Ilimitado"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    Descrição (opcional)
                  </label>
                  <input
                    type="text"
                    value={cupom.descricao}
                    onChange={(e) => atualizarCupom(cupom.id, 'descricao', e.target.value)}
                    placeholder="Ex: Desconto especial para clientes VIP"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    Data de Início (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={cupom.dataInicio}
                    onChange={(e) => atualizarCupom(cupom.id, 'dataInicio', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                    Data de Término (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={cupom.dataFim}
                    onChange={(e) => atualizarCupom(cupom.id, 'dataFim', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '2px dashed #667eea' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#667eea', fontSize: '18px' }}>
                  💰 Defina o Preço com Cupom para Cada Ingresso
                </h4>

                {setoresIngressos.map((setor) => (
                  <div key={setor.id} style={{ marginBottom: '20px' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                      color: 'white', 
                      padding: '12px 15px', 
                      borderRadius: '8px 8px 0 0',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      📍 {setor.nome}
                    </div>

                    {setor.usaLotes ? (
                      setor.lotes.map((lote) => (
                        <div key={lote.id} style={{ 
                          background: '#f8f9fa', 
                          padding: '15px', 
                          borderLeft: '3px solid #667eea',
                          marginBottom: '10px'
                        }}>
                          <div style={{ fontWeight: 'bold', color: '#555', marginBottom: '10px', fontSize: '15px' }}>
                            🎟️ {lote.nome}
                          </div>
                          {lote.tiposIngresso.map((tipo) => {
                            const chaveIngresso = `setor-${setor.nome}-lote-${lote.id}-tipo-${tipo.id}`;
                            const precoOriginal = parseFloat(tipo.preco) || 0;
                            const precoComCupom = parseFloat(cupom.precosPorIngresso[chaveIngresso]) || 0;
                            const desconto = calcularDesconto(precoOriginal, precoComCupom);

                            return (
                              <div key={tipo.id} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '15px', 
                                background: 'white',
                                padding: '12px',
                                borderRadius: '6px',
                                marginBottom: '8px',
                                border: '1px solid #e0e0e0'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                                    {tipo.nome}
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#666' }}>
                                    Preço original: <span style={{ textDecoration: 'line-through' }}>R$ {precoOriginal.toFixed(2)}</span>
                                    {desconto > 0 && (
                                      <span style={{ color: '#e74c3c', fontWeight: 'bold', marginLeft: '8px' }}>
                                        (-{desconto}% OFF)
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontWeight: 'bold', color: '#667eea' }}>R$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={cupom.precosPorIngresso[chaveIngresso] || ''}
                                    onChange={(e) => atualizarPrecoCupom(cupom.id, chaveIngresso, e.target.value)}
                                    placeholder={precoOriginal.toFixed(2)}
                                    style={{ 
                                      width: '120px',
                                      padding: '10px', 
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
                      ))
                    ) : (
                      <div style={{ padding: '15px', background: '#f8f9fa' }}>
                        {setor.tiposIngresso.map((tipo) => {
                          const chaveIngresso = `setor-${setor.nome}-tipo-${tipo.id}`;
                          const precoOriginal = parseFloat(tipo.preco) || 0;
                          const precoComCupom = parseFloat(cupom.precosPorIngresso[chaveIngresso]) || 0;
                          const desconto = calcularDesconto(precoOriginal, precoComCupom);

                          return (
                            <div key={tipo.id} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '15px', 
                              background: 'white',
                              padding: '12px',
                              borderRadius: '6px',
                              marginBottom: '8px',
                              border: '1px solid #e0e0e0'
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>
                                  {tipo.nome}
                                </div>
                                <div style={{ fontSize: '13px', color: '#666' }}>
                                  Preço original: <span style={{ textDecoration: 'line-through' }}>R$ {precoOriginal.toFixed(2)}</span>
                                  {desconto > 0 && (
                                    <span style={{ color: '#e74c3c', fontWeight: 'bold', marginLeft: '8px' }}>
                                      (-{desconto}% OFF)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 'bold', color: '#667eea' }}>R$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={cupom.precosPorIngresso[chaveIngresso] || ''}
                                  onChange={(e) => atualizarPrecoCupom(cupom.id, chaveIngresso, e.target.value)}
                                  placeholder={precoOriginal.toFixed(2)}
                                  style={{ 
                                    width: '120px',
                                    padding: '10px', 
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
                background: '#667eea', 
                color: 'white', 
                border: 'none', 
                padding: '15px 25px', 
                borderRadius: '8px', 
                fontSize: '16px', 
                fontWeight: 'bold',
                cursor: 'pointer',
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
                  background: '#764ba2', 
                  color: 'white', 
                  border: 'none', 
                  padding: '15px 25px', 
                  borderRadius: '8px', 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(118, 75, 162, 0.3)'
                }}
              >
                📋 Copiar Valores do Último Cupom
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CupomManager;
