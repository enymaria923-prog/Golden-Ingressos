'use client';
import React, { useState } from 'react';

const SelecionarTaxa = ({ onTaxaSelecionada }) => {
  const [taxaSelecionada, setTaxaSelecionada] = useState('opcao1');

  const opcoesTaxa = [
    {
      id: 'opcao1',
      taxaComprador: 15,
      taxaProdutor: 5,
      titulo: 'Opção Recomendada 🏆',
      descricao: 'Taxa do comprador: 15% - Você recebe 5%',
      beneficios: [
        'Maior visibilidade no site',
        'Destaque nas pesquisas',
        'Divulgação em nossas redes sociais',
        'Prioridade na moderação'
      ],
      cor: '#e8f5e8'
    },
    {
      id: 'opcao2', 
      taxaComprador: 10,
      taxaProdutor: 3,
      titulo: 'Opção Econômica',
      descricao: 'Taxa do comprador: 10% - Você recebe 3%',
      beneficios: [
        'Visibilidade padrão',
        'Listagem básica no site'
      ],
      cor: '#fff3cd'
    }
  ];

  const handleSelecionarTaxa = (opcaoId) => {
    setTaxaSelecionada(opcaoId);
    const opcao = opcoesTaxa.find(o => o.id === opcaoId);
    onTaxaSelecionada({
      taxaComprador: opcao.taxaComprador,
      taxaProdutor: opcao.taxaProdutor
    });
  };

  return (
    <div className="selecionar-taxa">
      <h3>Escolha como as taxas serão cobradas</h3>
      <p className="info-text">
        A taxa de serviço é cobrada do comprador e uma parte é repassada para você como parceiro.
        A opção recomendada oferece mais benefícios para a divulgação do seu evento.
      </p>

      <div className="opcoes-taxa">
        {opcoesTaxa.map((opcao) => (
          <div 
            key={opcao.id}
            className={`opcao-taxa ${taxaSelecionada === opcao.id ? 'selecionada' : ''}`}
            style={{ borderLeft: `5px solid ${opcao.cor}` }}
            onClick={() => handleSelecionarTaxa(opcao.id)}
          >
            <div className="opcao-header">
              <div className="radio-container">
                <input
                  type="radio"
                  name="taxa"
                  value={opcao.id}
                  checked={taxaSelecionada === opcao.id}
                  onChange={() => handleSelecionarTaxa(opcao.id)}
                />
              </div>
              <div className="opcao-info">
                <h4>{opcao.titulo}</h4>
                <p className="opcao-descricao">{opcao.descricao}</p>
              </div>
            </div>
            
            <div className="beneficios">
              <strong>Benefícios incluídos:</strong>
              <ul>
                {opcao.beneficios.map((beneficio, index) => (
                  <li key={index}>✓ {beneficio}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="resumo-taxa">
        <p>
          <strong>Resumo:</strong> Na opção selecionada, o comprador paga {opcoesTaxa.find(o => o.id === taxaSelecionada).taxaComprador}% de taxa 
          e você recebe {opcoesTaxa.find(o => o.id === taxaSelecionada).taxaProdutor}% do valor do ingresso.
        </p>
      </div>
    </div>
  );
};

export default SelecionarTaxa;
