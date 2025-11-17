'use client';
import React, { useState, useEffect } from 'react';

const CuponsManager = ({ onCuponsChange }) => {
  const [cupons, setCupons] = useState([
    {
      id: 1,
      codigo: '',
      desconto: '',
      tipoDesconto: 'porcentagem', // 'porcentagem' ou 'fixo'
      quantidade: '',
      dataValidade: '',
      ativo: true
    }
  ]);

  useEffect(() => {
    console.log('🎟️ Cupons atualizados:', cupons);
    if (onCuponsChange) {
      onCuponsChange(cupons);
    }
  }, [cupons, onCuponsChange]);

  const adicionarCupom = () => {
    const novoCupom = {
      id: Date.now(),
      codigo: '',
      desconto: '',
      tipoDesconto: 'porcentagem',
      quantidade: '',
      dataValidade: '',
      ativo: true
    };
    setCupons([...cupons, novoCupom]);
  };

  const removerCupom = (cupomId) => {
    if (cupons.length === 1) {
      // Permite remover o último cupom, resetando para vazio
      setCupons([]);
      if (onCuponsChange) {
        onCuponsChange([]);
      }
      return;
    }
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

  const gerarCodigoAleatorio = (cupomId) => {
    const codigo = 'CUPOM' + Math.random().toString(36).substring(2, 8).toUpperCase();
    atualizarCupom(cupomId, 'codigo', codigo);
  };

  // Se não tem cupons, mostra mensagem e botão para adicionar
  if (cupons.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '8px' }}>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Nenhum cupom adicionado ainda
        </p>
        <button 
          type="button"
          onClick={adicionarCupom} 
          style={{ 
            backgroundColor: '#f39c12', 
            color: 'white', 
            border: 'none', 
            padding: '12px 20px', 
            borderRadius: '5px', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            fontSize: '16px' 
          }}
        >
          + Adicionar Cupom
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', border: '2px solid #ffc107' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>🎟️ Como funcionam os cupons:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#856404' }}>
          <li><strong>Código</strong>: O texto que o comprador vai digitar (ex: PROMO10, BLACKFRIDAY)</li>
          <li><strong>Desconto</strong>: Pode ser em % (ex: 10%) ou valor fixo (ex: R$ 20,00)</li>
          <li><strong>Quantidade</strong>: Número de vezes que pode ser usado (deixe vazio para ilimitado)</li>
          <li><strong>Validade</strong>: Data até quando o cupom funciona (opcional)</li>
        </ul>
      </div>

      {cupons.map((cupom, index) => (
        <div key={cupom.id} style={{ 
          border: '2px solid #ffc107', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#fffbf0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#f39c12' }}>🎟️ Cupom {index + 1}</h3>
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

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '15px' }}>
            {/* CÓDIGO DO CUPOM */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Código do Cupom *
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  value={cupom.codigo} 
                  onChange={(e) => atualizarCupom(cupom.id, 'codigo', e.target.value.toUpperCase())} 
                  placeholder="Ex: PROMO10, BLACKFRIDAY" 
                  required
                  style={{ 
                    flex: 1,
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px', 
                    boxSizing: 'border-box', 
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }} 
                />
                <button
                  type="button"
                  onClick={() => gerarCodigoAleatorio(cupom.id)}
                  style={{
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '10px 15px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  🎲 Gerar
                </button>
              </div>
            </div>

            {/* TIPO DE DESCONTO */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tipo de Desconto *
              </label>
              <select
                value={cupom.tipoDesconto}
                onChange={(e) => atualizarCupom(cupom.id, 'tipoDesconto', e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px', 
                  boxSizing: 'border-box', 
                  fontSize: '14px' 
                }}
              >
                <option value="porcentagem">Porcentagem (%)</option>
                <option value="fixo">Valor Fixo (R$)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            {/* VALOR DO DESCONTO */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Valor do Desconto *
              </label>
              <input 
                type="number" 
                step={cupom.tipoDesconto === 'fixo' ? '0.01' : '1'}
                min="0"
                max={cupom.tipoDesconto === 'porcentagem' ? '100' : undefined}
                value={cupom.desconto} 
                onChange={(e) => atualizarCupom(cupom.id, 'desconto', e.target.value)} 
                placeholder={cupom.tipoDesconto === 'porcentagem' ? 'Ex: 10' : 'Ex: 20.00'}
                required
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
                {cupom.tipoDesconto === 'porcentagem' ? '% de desconto' : 'Desconto em R$'}
              </small>
            </div>

            {/* QUANTIDADE DE USOS */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Quantidade de Usos
              </label>
              <input 
                type="number" 
                min="1"
                value={cupom.quantidade} 
                onChange={(e) => atualizarCupom(cupom.id, 'quantidade', e.target.value)} 
                placeholder="Ilimitado"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px', 
                  boxSizing: 'border-box', 
                  fontSize: '14px' 
                }} 
              />
              <small style={{ color: '#666' }}>Vazio = ilimitado</small>
            </div>

            {/* DATA DE VALIDADE */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Válido até
              </label>
              <input 
                type="date" 
                value={cupom.dataValidade} 
                onChange={(e) => atualizarCupom(cupom.id, 'dataValidade', e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '5px', 
                  boxSizing: 'border-box', 
                  fontSize: '14px' 
                }} 
              />
              <small style={{ color: '#666' }}>Vazio = sem prazo</small>
            </div>
          </div>

          {/* PREVIEW DO CUPOM */}
          {cupom.codigo && cupom.desconto && (
            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              backgroundColor: '#d4edda', 
              borderRadius: '5px',
              border: '1px solid #c3e6cb'
            }}>
              <p style={{ margin: 0, color: '#155724', fontWeight: 'bold' }}>
                ✅ Preview: Use o código <span style={{ 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  padding: '4px 10px', 
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}>{cupom.codigo}</span> e ganhe {cupom.tipoDesconto === 'porcentagem' ? `${cupom.desconto}%` : `R$ ${parseFloat(cupom.desconto).toFixed(2)}`} de desconto!
              </p>
            </div>
          )}
        </div>
      ))}

      <button 
        type="button" 
        onClick={adicionarCupom} 
        style={{ 
          backgroundColor: '#f39c12', 
          color: 'white', 
          border: 'none', 
          padding: '12px 20px', 
          borderRadius: '5px', 
          cursor: 'pointer', 
          fontWeight: 'bold', 
          fontSize: '16px' 
        }}
      >
        + Adicionar Novo Cupom
      </button>
    </div>
  );
};

export default CuponsManager;
