// Configuração de todos os teatros/locais mapeados
// Para adicionar um novo teatro, basta copiar um bloco e ajustar os dados

export const teatrosConfig = {
  
  // Exemplo 1: Teatro simples com plateia
  'teatro-paiol': {
    id: 'teatro-paiol',
    nome: 'Teatro Paiol',
    cidade: 'Curitiba',
    setores: [
      {
        id: 'plateia',
        nome: 'Plateia',
        fileiras: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        assentosPorFileira: 20,
        mostrarNumeracaoInferior: true,
        // Assentos especiais (PCD, Obeso, etc)
        assentosEspeciais: [
          { fileira: 'A', numero: 1, tipo: 'pcd' },
          { fileira: 'A', numero: 2, tipo: 'acompanhante_pcd' },
          { fileira: 'A', numero: 19, tipo: 'pcd' },
          { fileira: 'A', numero: 20, tipo: 'acompanhante_pcd' },
          { fileira: 'J', numero: 10, tipo: 'obeso' },
          { fileira: 'J', numero: 11, tipo: 'obeso' },
        ]
      }
    ]
  },

  // Exemplo 2: Teatro com múltiplos setores
  'teatro-aspro': {
    id: 'teatro-aspro',
    nome: 'Teatro Aspro',
    cidade: 'Osasco',
    setores: [
      {
        id: 'plateia',
        nome: 'Plateia',
        fileiras: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        assentosPorFileira: 20,
        mostrarNumeracaoInferior: true,
        assentosEspeciais: [
          { fileira: 'A', numero: 1, tipo: 'pcd' },
          { fileira: 'A', numero: 2, tipo: 'acompanhante_pcd' },
          { fileira: 'J', numero: 10, tipo: 'obeso' },
        ]
      },
      {
        id: 'balcao',
        nome: 'Balcão',
        fileiras: ['A', 'B', 'C', 'D'],
        assentosPorFileira: 15,
        mostrarNumeracaoInferior: true,
        assentosEspeciais: []
      }
    ]
  },

  // Exemplo 3: Circo com layout complexo
  'circo-thathi': {
    id: 'circo-thathi',
    nome: 'Circo Thathi',
    cidade: 'São Paulo',
    setores: [
      {
        id: 'quadra-frontal',
        nome: 'Quadra Frontal',
        fileiras: ['A', 'B', 'C', 'D', 'E'],
        assentosPorFileira: 9,
        mostrarNumeracaoInferior: false,
        assentosEspeciais: [
          { fileira: 'A', numero: 1, tipo: 'pcd' },
          { fileira: 'A', numero: 2, tipo: 'acompanhante_pcd' },
        ]
      },
      {
        id: 'plateia-esquerda',
        nome: 'Fileiras Plateia Esquerda',
        fileiras: ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
        assentosPorFileira: 9,
        mostrarNumeracaoInferior: true,
        assentosEspeciais: []
      },
      {
        id: 'centro',
        nome: 'Centro',
        fileiras: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
        assentosPorFileira: 21,
        mostrarNumeracaoInferior: true,
        assentosEspeciais: [
          { fileira: 'J', numero: 1, tipo: 'pcd' },
          { fileira: 'J', numero: 2, tipo: 'acompanhante_pcd' },
          { fileira: 'J', numero: 20, tipo: 'pcd' },
          { fileira: 'J', numero: 21, tipo: 'acompanhante_pcd' },
        ]
      },
      {
        id: 'plateia-direita',
        nome: 'Fileiras Plateia Direita',
        fileiras: ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
        assentosPorFileira: 7,
        mostrarNumeracaoInferior: true,
        assentosEspeciais: []
      }
    ]
  },

  // Exemplo 4: Teatro médio
  'teatro-bradesco': {
    id: 'teatro-bradesco',
    nome: 'Teatro Bradesco',
    cidade: 'São Paulo',
    setores: [
      {
        id: 'plateia-a',
        nome: 'Plateia A',
        fileiras: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        assentosPorFileira: 18,
        mostrarNumeracaoInferior: true,
        assentosEspeciais: [
          { fileira: 'A', numero: 1, tipo: 'pcd' },
          { fileira: 'A', numero: 2, tipo: 'acompanhante_pcd' },
          { fileira: 'A', numero: 17, tipo: 'pcd' },
          { fileira: 'A', numero: 18, tipo: 'acompanhante_pcd' },
        ]
      },
      {
        id: 'plateia-b',
        nome: 'Plateia B',
        fileiras: ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
        assentosPorFileira: 18,
        mostrarNumeracaoInferior: true,
        assentosEspeciais: [
          { fileira: 'P', numero: 9, tipo: 'obeso' },
          { fileira: 'P', numero: 10, tipo: 'obeso' },
        ]
      },
      {
        id: 'mezanino',
        nome: 'Mezanino',
        fileiras: ['A', 'B', 'C', 'D', 'E'],
        assentosPorFileira: 12,
        mostrarNumeracaoInferior: true,
        assentosEspeciais: []
      }
    ]
  }

};

// Função helper para verificar se um teatro existe
export function getTeatroConfig(teatroId) {
  return teatrosConfig[teatroId] || null;
}

// Função para listar todos os teatros disponíveis (para usar no select do publicar evento)
export function listarTeatrosDisponiveis() {
  return Object.values(teatrosConfig).map(teatro => ({
    id: teatro.id,
    nome: teatro.nome,
    cidade: teatro.cidade,
    label: `${teatro.nome} - ${teatro.cidade}`
  }));
}

// Função para calcular total de assentos de um teatro
export function calcularTotalAssentos(teatroId) {
  const teatro = teatrosConfig[teatroId];
  if (!teatro) return 0;
  
  return teatro.setores.reduce((total, setor) => {
    return total + (setor.fileiras.length * setor.assentosPorFileira);
  }, 0);
}
