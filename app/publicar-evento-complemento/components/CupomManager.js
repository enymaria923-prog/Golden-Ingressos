import React, { useState, useEffect } from 'react';

const CupomManager = ({ setoresIngressos, onCuponsChange }) => {
  const [usaCupons, setUsaCupons] = useState(false);
  const [cupons, setCupons] = useState([]);

  useEffect(() => {
    if (onCuponsChange) {
      onCuponsChange(usaCupons ? cupons : []);
    }
  }, [cupons, usaCupons, onCuponsChange]);

  const adicionarCupom = (copiarDe = null) => {
    const novoCupom = {
      id: Date.now(),
      codigo: '',
      descricao: '',
      quantidadeDisponivel: '',
      dataInicio: '',
      dataFim: '',
      precos: copiarDe ? JSON.parse(JSON.stringify(copiarDe.precos)) : gerarEstruturaPrecos()
    };
    setCupons([...cupons, novoCupom]);
  };

  const gerarEstruturaPrecos = () => {
    const estrutura = [];
    
    setoresIngressos.forEach(setor => {
      if (setor.usaLotes) {
        setor.lotes.forEach(lote => {
          lote.tiposIngresso.forEach(tipo => {
            estrutura.push({
              setor: setor.nome,
              loteId: lote.id,
              loteNome: lote.nome,
              tipoIngresso: tipo.nome,
              precoOriginal: parseFloat(tipo.preco) || 0,
              precoComCupom: parseFloat(tipo.preco) || 0
            });
          });
        });
      } else {
        setor.tiposIngresso.forEach(tipo => {
          estrutura.push({
            setor: setor.nome,
            loteId: null,
            loteNome: null,
            tipoIngresso: tipo.nome,
            precoOriginal: parseFloat(tipo.preco) || 0,
            precoComCupom: parseFloat(tipo.preco) || 0
          });
        });
      }
    });

    return estrutura;
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

  const atualizarPrecoCupom = (cupomId, ingressoIndex, novoPreco) => {
    setCupons(cupons.map(cupom => {
      if (cupom.id === cupomId) {
        const novosPrecos = [...cupom.precos];
        novosPrecos[ingressoIndex].precoComCupom = parseFloat(novoPreco) || 0;
        return { ...cupom, precos: novosPrecos };
      }
      return cupom;
    }));
  };

  const aplicarDescontoPercentual = (cupomId, percentual) => {
    setCupons(cupons.map(cupom => {
      if (cupom.id === cupomId) {
        const novosPrecos = cupom.precos.map(preco => ({
          ...preco,
          precoComCupom: preco.precoOriginal * (1 - percentual / 100)
        }));
        return { ...cupom, precos: novosPrecos };
      }
      return cupom;
    }));
  };

  if (setoresIngressos.length === 0) {
    return (
      <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', border: '2px solid #ffc107' }}>
        <p style={{ margin: 0, color: '#856404' }}>
          ⚠️ Crie os setores e ingressos primeiro para poder adicionar cupons!
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
              Defina preços especiais para cada ingresso quando o cupom for aplicado
            </div>
          </div>
        </label>
      </div>

      {usaCupons && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cupons.map((cupom, cupomIndex) => (
            <div key={cupom.id} style={{ 
              border: '3px solid #667eea', 
              borderRadius: '12px', 
              padding: '25px', 
              backgroundColor: '#f8f9ff',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#667eea', fontSize: '20px' }}>
                  🎟️ Cupom {cupomIndex + 1}
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {cupomIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const cupomAnterior = cupons[cupomIndex - 1];
                        if (confirm(`Copiar valores do cupom "${cupomAnterior.codigo}"?`)) {
                          const cuponsAtualizados = [...cupons];
                          cuponsAtualizados[cupomIndex].precos = JSON.parse(JSON.stringify(cupomAnterior.precos));
                          setCupons(cuponsAtualizados);
                        }
                      }}
                      style={{ 
                        backgroundColor: '#3498db', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 15px', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '13px'
                      }}
                    >
                      📋 Copiar Cupom Anterior
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removerCupom(cupom.id)}
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
                    ❌ Remover
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Código do Cupom * (ex: PROMO50, VIP10)
                  </label>
                  <input
                    type="text"
                    value={cupom.codigo}
                    onChange={(e) => atualizarCupom(cupom.id, 'codigo', e.target.value.toUpperCase())}
                    placeholder="BLACKFRIDAY"
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '2px solid #667eea', 
                      borderRadius: '5px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Quantidade Disponível (opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cupom.quantidadeDisponivel}
                    onChange={(e) => atualizarCupom(cupom.id, 'quantidadeDisponivel', e.target.value)}
                    placeholder="Ilimitado"
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '2px solid #ddd', 
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Descrição (opcional)
                  </label>
                  <input
                    type="text"
                    value={cupom.descricao}
                    onChange={(e) => atualizarCupom(cupom.id, 'descricao', e.target.value)}
                    placeholder="Ex: 50% de desconto na Black Friday"
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '2px solid #ddd', 
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Data de Início (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={cupom.dataInicio}
                    onChange={(e) => atualizarCupom(cupom.id, 'dataInicio', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '2px solid #ddd', 
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Data de Fim (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={cupom.dataFim}
                    onChange={(e) => atualizarCupom(cupom.id, 'dataFim', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '2px solid #ddd', 
                      borderRadius: '5px',
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

              <div>
                <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>
                  💰 Preços dos Ingressos com este Cupom
                </h4>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#667eea', color: 'white' }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderRadius: '8px 0 0 0' }}>Setor</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Lote</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Tipo</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Preço Original</th>
                        <th style={{ padding: '12px', textAlign: 'right', borderRadius: '0 8px 0 0' }}>Preço com Cupom</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cupom.precos.map((preco, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold', color: '#667eea' }}>
                            {preco.setor}
                          </td>
                          <td style={{ padding: '10px', color: '#666' }}>
                            {preco.loteNome || '-'}
                          </td>
                          <td style={{ padding: '10px' }}>
                            {preco.tipoIngresso}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right', color: '#e74c3c', textDecoration: 'line-through' }}>
                            R$ {preco.precoOriginal.toFixed(2)}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={preco.precoComCupom}
                              onChange={(e) => atualizarPrecoCupom(cupom.id, index, e.target.value)}
                              style={{ 
                                width: '100px', 
                                padding: '8px', 
                                border: '2px solid #27ae60', 
                                borderRadius: '5px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#27ae60',
                                textAlign: 'right'
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => adicionarCupom()}
            style={{ 
              backgroundColor: '#667eea', 
              color: 'white', 
              border: 'none', 
              padding: '15px 25px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            + Adicionar Novo Cupom
          </button>
        </div>
      )}
    </div>
  );
};

export default CupomManager;
