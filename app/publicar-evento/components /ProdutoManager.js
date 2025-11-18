import React, { useState, useEffect } from 'react';

const ProdutoManager = ({ onProdutosChange, cupons }) => {
  const [usaProdutos, setUsaProdutos] = useState(false);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    if (onProdutosChange) {
      onProdutosChange(usaProdutos ? produtos : []);
    }
  }, [produtos, usaProdutos, onProdutosChange]);

  const adicionarProduto = () => {
    const novoProduto = {
      id: Date.now(),
      nome: '',
      descricao: '',
      preco: '',
      quantidade: '',
      tamanho: '',
      tipoProduto: 'bebida',
      imagem: null,
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
        return { ...produto, [campo]: valor };
      }
      return produto;
    }));
  };

  const atualizarImagemProduto = (produtoId, file) => {
    setProdutos(produtos.map(produto => {
      if (produto.id === produtoId) {
        return { ...produto, imagem: file };
      }
      return produto;
    }));
  };

  const atualizarPrecoPorCupom = (produtoId, cupomId, novoPreco) => {
    setProdutos(produtos.map(produto => {
      if (produto.id === produtoId) {
        return {
          ...produto,
          precosPorCupom: {
            ...produto.precosPorCupom,
            [cupomId]: parseFloat(novoPreco) || 0
          }
        };
      }
      return produto;
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '20px', borderRadius: '12px', color: 'white' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={usaProdutos} 
            onChange={(e) => {
              setUsaProdutos(e.target.checked);
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
              Bebidas, comidas, camisetas, brindes e outros itens
            </div>
          </div>
        </label>
      </div>

      {usaProdutos && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {produtos.map((produto, produtoIndex) => (
            <div key={produto.id} style={{ 
              border: '3px solid #f5576c', 
              borderRadius: '12px', 
              padding: '25px', 
              backgroundColor: '#fff5f7',
              boxShadow: '0 4px 12px rgba(245, 87, 108, 0.15)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#f5576c', fontSize: '20px' }}>
                  🛍️ Produto {produtoIndex + 1}
                </h3>
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
                  ❌ Remover
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={produto.nome}
                    onChange={(e) => atualizarProduto(produto.id, 'nome', e.target.value)}
                    placeholder="Ex: Coca-Cola 350ml"
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '2px solid #f5576c', 
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Tipo de Produto *
                  </label>
                  <select
                    value={produto.tipoProduto}
                    onChange={(e) => atualizarProduto(produto.id, 'tipoProduto', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '2px solid #ddd', 
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="bebida">🥤 Bebida</option>
                    <option value="comida">🍔 Comida</option>
                    <option value="roupa">👕 Roupa/Acessório</option>
                    <option value="brinde">🎁 Brinde</option>
                    <option value="outro">📦 Outro</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={produto.preco}
                    onChange={(e) => atualizarProduto(produto.id, 'preco', e.target.value)}
                    placeholder="0.00"
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
                    Quantidade Disponível *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={produto.quantidade}
                    onChange={(e) => atualizarProduto(produto.id, 'quantidade', e.target.value)}
                    placeholder="Ex: 100"
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
                    Tamanho (opcional)
                  </label>
                  <input
                    type="text"
                    value={produto.tamanho}
                    onChange={(e) => atualizarProduto(produto.id, 'tamanho', e.target.value)}
                    placeholder="Ex: P, M, G, 350ml"
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
                    Imagem do Produto (opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        atualizarImagemProduto(produto.id, file);
                      }
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '2px solid #ddd', 
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  />
                  {produto.imagem && (
                    <div style={{ marginTop: '10px', color: '#27ae60', fontSize: '13px' }}>
                      ✓ Arquivo: {produto.imagem.name}
                    </div>
                  )}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={produto.descricao}
                    onChange={(e) => atualizarProduto(produto.id, 'descricao', e.target.value)}
                    placeholder="Descreva o produto..."
                    rows="2"
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '2px solid #ddd', 
                      borderRadius: '5px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              {cupons && cupons.length > 0 && (
                <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <input 
                      type="checkbox" 
                      checked={produto.aceitaCupons}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setProdutos(produtos.map(p => {
                          if (p.id === produto.id) {
                            const precos = {};
                            if (checked) {
                              cupons.forEach(cupom => {
                                precos[cupom.id] = parseFloat(produto.preco) || 0;
                              });
                            }
                            return { ...p, aceitaCupons: checked, precosPorCupom: precos };
                          }
                          return p;
                        }));
                      }}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <strong style={{ color: '#2980b9' }}>
                      Este produto aceita cupons de desconto
                    </strong>
                  </label>

                  {produto.aceitaCupons && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#2980b9' }}>
                        💰 Preço com cada cupom:
                      </h4>
                      {cupons.map(cupom => (
                        <div key={cupom.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label style={{ minWidth: '150px', fontWeight: 'bold', color: '#555' }}>
                            {cupom.codigo || `Cupom ${cupons.indexOf(cupom) + 1}`}:
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: '#e74c3c', textDecoration: 'line-through', fontSize: '14px' }}>
                              R$ {parseFloat(produto.preco || 0).toFixed(2)}
                            </span>
                            <span style={{ margin: '0 5px' }}>→</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={produto.precosPorCupom[cupom.id] || 0}
                              onChange={(e) => atualizarPrecoPorCupom(produto.id, cupom.id, e.target.value)}
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
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => adicionarProduto()}
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
            + Adicionar Novo Produto
          </button>
        </div>
      )}
    </div>
  );
};

export default ProdutoManager;
