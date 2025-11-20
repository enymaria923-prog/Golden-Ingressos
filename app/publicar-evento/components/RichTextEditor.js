'use client';
import React, { useState } from 'react';

const RichTextEditor = ({ value, onChange }) => {
  const [blocos, setBlocos] = useState(value || [{ tipo: 'texto', conteudo: '' }]);
  
  const atualizarBloco = (index, campo, valor) => {
    const novosBlocos = [...blocos];
    novosBlocos[index][campo] = valor;
    setBlocos(novosBlocos);
    onChange(novosBlocos);
  };
  
  const adicionarBloco = (tipo) => {
    const novoBloco = tipo === 'texto' 
      ? { tipo: 'texto', conteudo: '' }
      : { tipo: 'imagem', url: '', textoAntes: '', textoDepois: '' };
    
    const novosBlocos = [...blocos, novoBloco];
    setBlocos(novosBlocos);
    onChange(novosBlocos);
  };
  
  const removerBloco = (index) => {
    if (blocos.length === 1) {
      alert('Deve ter pelo menos um bloco!');
      return;
    }
    const novosBlocos = blocos.filter((_, i) => i !== index);
    setBlocos(novosBlocos);
    onChange(novosBlocos);
  };
  
  const moverBloco = (index, direcao) => {
    if (
      (direcao === -1 && index === 0) || 
      (direcao === 1 && index === blocos.length - 1)
    ) return;
    
    const novosBlocos = [...blocos];
    const temp = novosBlocos[index];
    novosBlocos[index] = novosBlocos[index + direcao];
    novosBlocos[index + direcao] = temp;
    setBlocos(novosBlocos);
    onChange(novosBlocos);
  };
  
  const handleImageUpload = async (index, file) => {
    if (!file) return;
    
    // Converte para base64 para preview
    const reader = new FileReader();
    reader.onload = (e) => {
      atualizarBloco(index, 'url', e.target.result);
      atualizarBloco(index, 'arquivo', file);
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {blocos.map((bloco, index) => (
        <div key={index} style={{ 
          border: '2px solid #ddd', 
          borderRadius: '8px', 
          padding: '15px',
          backgroundColor: bloco.tipo === 'imagem' ? '#f0f8ff' : '#fff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold', color: '#5d34a4' }}>
              {bloco.tipo === 'texto' ? '📝 Texto' : '🖼️ Imagem'} #{index + 1}
            </span>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                type="button" 
                onClick={() => moverBloco(index, -1)}
                disabled={index === 0}
                style={{ 
                  padding: '5px 10px', 
                  fontSize: '12px',
                  cursor: index === 0 ? 'not-allowed' : 'pointer',
                  opacity: index === 0 ? 0.5 : 1
                }}
              >
                ⬆️
              </button>
              <button 
                type="button" 
                onClick={() => moverBloco(index, 1)}
                disabled={index === blocos.length - 1}
                style={{ 
                  padding: '5px 10px', 
                  fontSize: '12px',
                  cursor: index === blocos.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: index === blocos.length - 1 ? 0.5 : 1
                }}
              >
                ⬇️
              </button>
              <button 
                type="button" 
                onClick={() => removerBloco(index)}
                style={{ 
                  padding: '5px 10px', 
                  backgroundColor: '#e74c3c', 
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🗑️
              </button>
            </div>
          </div>
          
          {bloco.tipo === 'texto' ? (
            <textarea
              value={bloco.conteudo}
              onChange={(e) => atualizarBloco(index, 'conteudo', e.target.value)}
              placeholder="Digite o texto da descrição..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>
                  Texto antes da imagem (opcional)
                </label>
                <textarea
                  value={bloco.textoAntes || ''}
                  onChange={(e) => atualizarBloco(index, 'textoAntes', e.target.value)}
                  placeholder="Texto que aparece acima da imagem..."
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '13px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>
                  Imagem *
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={(e) => handleImageUpload(index, e.target.files[0])}
                  style={{ fontSize: '13px' }}
                />
                {bloco.url && (
                  <img 
                    src={bloco.url} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px', 
                      marginTop: '10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }} 
                  />
                )}
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>
                  Texto depois da imagem (opcional)
                </label>
                <textarea
                  value={bloco.textoDepois || ''}
                  onChange={(e) => atualizarBloco(index, 'textoDepois', e.target.value)}
                  placeholder="Texto que aparece abaixo da imagem..."
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '13px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => adicionarBloco('texto')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          ➕ Adicionar Texto
        </button>
        <button
          type="button"
          onClick={() => adicionarBloco('imagem')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#9b59b6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          🖼️ Adicionar Imagem
        </button>
      </div>
    </div>
  );
};

export default RichTextEditor;
