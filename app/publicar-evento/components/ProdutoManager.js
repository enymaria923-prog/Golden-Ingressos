'use client';
import React, { useState, useEffect, useRef } from 'react';

const ProdutoManager = ({ onProdutosChange, cupons = [] }) => {
  const [vendeProdutos, setVendeProdutos] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const onProdutosChangeRef = useRef(onProdutosChange);

  // Atualiza a ref quando o callback mudar
  useEffect(() => {
    onProdutosChangeRef.current = onProdutosChange;
  }, [onProdutosChange]);

  // Chama o callback apenas quando produtos ou vendeProdutos mudarem
  useEffect(() => {
    console.log('🛍️ Produtos atualizados:', produtos);
    if (onProdutosChangeRef.current) {
      onProdutosChangeRef.current(vendeProdutos ? produtos : []);
    }
  }, [produtos, vendeProdutos]);

  const adicionarProduto = () => {
    const novoProduto = {
      id: Date.now(),
      nome: '',
      descricao: '',
      preco: '',
      quantidade: '',
      tamanho: '',
      imagem: null,
      imagemPreview: null,
      tipoProduto: 'outro',
      aceitaCupons: false,
      precosPorCupom: {}
    };
    setProdutos([...produtos, novoProduto]);
  };

  const removerProduto = (produtoId) => {
    setProdutos(produtos.filter(p => p.id !== produtoId));
  };

  const atualizarProduto = (produtoId, campo, valor) => {
    setProdutos(produtos.map(produto => {
      if (produto.id === produtoId) {
        const atualizado = { ...produto, [campo]: valor };
        
        if (campo === 'aceitaCupons' && valor === true && cupons.length > 0) {
          cupons.forEach(cupom => {
            if (!atualizado.precosPorCupom[cupom.id]) {
              atualizado.precosPorCupom[cupom.id] = produto.preco || '';
            }
          });
        }
        
        return atualizado;
      }
      return produto;
    }));
  };

  const atualizarPrecoCupomProduto = (produtoId, cupomId, valor) => {
    setProdutos(produtos.map(produto => {
      if (produto.id === produtoId) {
        return {
          ...produto,
          precosPorCupom: {
            ...produto.precosPorCupom,
            [cupomId]: valor
          }
        };
      }
      return produto;
    }));
  };

  const handleImageChange = (produtoId, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Imagem muito grande! Máximo 5MB.');
        return;
      }
      if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/gif')) {
        alert('Apenas JPG, PNG ou GIF!');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProdutos(produtos.map(produto => {
          if (produto.id === produtoId) {
            return {
              ...produto,
              imagem: file,
              imagemPreview: e.target.result
            };
          }
          return produto;
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removerImagem = (produtoId) => {
    setProdutos(produtos.map(produto => {
      if (produto.id === produtoId) {
        return {
          ...produto,
          imagem: null,
          imagemPreview: null
        };
      }
      return produto;
    }));
  };

  const sugestoesPorTipo = {
    estacionamento: ['Estacionamento Coberto', 'Estacionamento Descoberto', 'Valet'],
    vestuario: ['Camiseta Oficial', 'Moletom', 'Boné', 'Regata'],
    acessorio: ['Caneca', 'Copo', 'Chaveiro', 'Adesivo', 'Pulseira'],
    outro: ['Combo Bebida', 'Brinde Exclusivo', 'Poster', 'Ingresso + Produto']
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '20px', borderRadius: '12px', color: 'white' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={vendeProdutos} 
            onChange={(e) => {
              setVendeProdutos(e.target.checked);
              if (e.target.checked && produtos.length === 0) {
                adicionarProduto();
              }
            }}
            style={{ width: '24px', height: '24px', cursor: 'pointer' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
              🛍️ Vender Produtos Adicionais
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              Estacionamento, camisetas, brindes, etc. - SEM TAXA da Golden!
            </div>
          </div>
        </label>
      </div>

      {vendeProdutos && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', border: '2px solid #ffc107' }}>
            <strong style={{ color: '#856404' }}>💰 Importante:</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#856404' }}>
              A Golden NÃO cobra nenhuma taxa sobre a venda de produtos! 
              Todo o valor vai direto para você.
            </p>
          </div>

          {produtos.map((produto, index) => (
            <div key={produto.id} style={{ 
              border: '2px solid #e0e0e0', 
              borderRadius: '12px', 
              padding: '20px', 
              backgroundColor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ margin: 0, color: '#f5576c' }}>🛒 Produto {index + 1}</h4>
                <button 
                  type="button" 
                  onClick={() => removerProduto(produto.id)}
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
                  🗑️ Remover
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Tipo de Produto *
                  </label>
                  <select
                    value={produto.tipoProduto}
                    onChange={(e) => atualizarProduto(produto.id, 'tipoProduto', e.target.value)}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      borderRadius: '5px', 
                      fontSize: '14px' 
                    }}
                  >
                    <option value="estacionamento">🚗 Estacionamento</option>
                    <option value="vestuario">👕 Vestuário</option>
                    <option value="acessorio">🎁 Acessório</option>
                    <option value="outro">📦 Outro</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={produto.nome}
                    onChange={(e) => atualizarProduto(produto.id, 'nome', e.target.value)}
                    placeholder={sugestoesPorTipo[produto.tipoProduto][0]}
                    list={`sugestoes-${produto.id}`}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      borderRadius: '5px', 
                      fontSize: '14px' 
                    }}
                  />
                  <datalist id={`sugestoes-${produto.id}`}>
                    {sugestoesPorTipo[produto.tipoProduto].map((sugestao, i) => (
                      <option key={i} value={sugestao} />
                    ))}
                  </datalist>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={produto.descricao}
                    onChange={(e) => atualizarProduto(produto.id, 'descricao', e.target.value)}
                    placeholder="Ex: Camiseta 100% algodão com estampa do evento"
                    rows="2"
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      borderRadius: '5px', 
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={produto.preco}
                    onChange={(e) => atualizarProduto(produto.id, 'preco', e.target.value)}
                    placeholder="0.00"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      borderRadius: '5px', 
                      fontSize: '14px' 
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Quantidade Disponível *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={produto.quantidade}
                    onChange={(e) => atualizarProduto(produto.id, 'quantidade', e.target.value)}
                    placeholder="0"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      borderRadius: '5px', 
                      fontSize: '14px' 
                    }}
                  />
                </div>

                {produto.tipoProduto === 'vestuario' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                      Tamanho
                    </label>
                    <select
                      value={produto.tamanho}
                      onChange={(e) => atualizarProduto(produto.id, 'tamanho', e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        border: '1px solid #ddd', 
                        borderRadius: '5px', 
                        fontSize: '14px' 
                      }}
                    >
                      <option value="">Selecione (opcional)</option>
                      <option value="PP">PP</option>
                      <option value="P">P</option>
                      <option value="M">M</option>
                      <option value="G">G</option>
                      <option value="GG">GG</option>
                      <option value="XG">XG</option>
                      <option value="Único">Tamanho Único</option>
                    </select>
                  </div>
                )}

                {cupons && cupons.length > 0 && (
                  <div style={{ gridColumn: '1 / -1', background: '#f0f8ff', padding: '15px', borderRadius: '8px', border: '2px dashed #667eea' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={produto.aceitaCupons}
                        onChange={(e) => atualizarProduto(produto.id, 'aceitaCupons', e.target.checked)}
                        style={{ width: '20px', height: '20px' }}
                      />
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#667eea' }}>
                        🎟️ Este produto aceita cupons de desconto
                      </span>
                    </label>

                    {produto.aceitaCupons && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ fontSize: '13px', color: '#555', marginBottom: '5px' }}>
                          <strong>Defina o preço deste produto COM cada cupom aplicado:</strong>
                        </div>
                        {cupons.map((cupom) => {
                          const precoOriginal = parseFloat(produto.preco) || 0;
                          const precoComCupom = parseFloat(produto.precosPorCupom[cupom.id]) || 0;
                          const desconto = precoOriginal > 0 ? ((precoOriginal - precoComCupom) / precoOriginal * 100).toFixed(0) : 0;

                          return (
                            <div key={cupom.id} style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#764ba2', marginBottom: '3px' }}>
                                    Cupom: {cupom.codigo || `Cupom ${cupons.indexOf(cupom) + 1}`}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>
                                    Preço original: <span style={{ textDecoration: 'line-through' }}>R$ {precoOriginal.toFixed(2)}</span>
                                    {desconto > 0 && <span style={{ color: '#e74c3c', fontWeight: 'bold', marginLeft: '5px' }}>(-{desconto}%)</span>}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '150px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>R$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={produto.precosPorCupom[cupom.id] || ''}
                                    onChange={(e) => atualizarPrecoCupomProduto(produto.id, cupom.id, e.target.value)}
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
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    Imagem do Produto (opcional)
                  </label>
                  
                  {produto.imagemPreview ? (
                    <div style={{ 
                      display: 'flex', 
                      gap: '15px', 
                      alignItems: 'center',
                      padding: '15px',
                      background: '#f8f9fa',
                      borderRadius: '8px'
                    }}>
                      <img 
                        src={produto.imagemPreview} 
                        alt="Preview" 
                        style={{ 
                          width: '120px', 
                          height: '120px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          border: '2px solid #dee2e6'
                        }} 
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 10px 0', color: '#28a745', fontWeight: 'bold' }}>
                          ✅ {produto.imagem?.name || 'Imagem selecionada'}
                        </p>
                        <button 
                          type="button" 
                          onClick={() => removerImagem(produto.id)}
                          style={{ 
                            backgroundColor: '#e74c3c', 
                            color: 'white', 
                            border: 'none', 
                            padding: '8px 15px', 
                            borderRadius: '5px', 
                            cursor: 'pointer' 
                          }}
                        >
                          Remover Imagem
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={(e) => handleImageChange(produto.id, e)}
                        id={`file-input-${produto.id}`}
                        style={{ display: 'none' }}
                      />
                      <label 
                        htmlFor={`file-input-${produto.id}`}
                        style={{ 
                          display: 'block',
                          padding: '40px', 
                          border: '2px dashed #ccc', 
                          borderRadius: '8px', 
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: '#f8f9fa',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#e9ecef'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
                      >
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          Clique para adicionar imagem
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button 
            type="button" 
            onClick={adicionarProduto}
            style={{ 
              backgroundColor: '#f5576c', 
              color: 'white', 
              border: 'none', 
              padding: '15px 25px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)'
            }}
          >
            + Adicionar Outro Produto
          </button>
        </div>
      )}
    </div>
  );
};

export default ProdutoManager;
