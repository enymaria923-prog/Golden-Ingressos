// Configuração de todos os teatros/locais mapeados
// Para adicionar um novo teatro, basta copiar um bloco e ajustar os dados

export const teatrosConfig = {
  
  // Exemplo 1: Teatro simples com plateia (todas fileiras iguais)
  'teatro-paiol': {
    id: 'teatro-paiol',
    nome: 'Teatro Paiol',
    cidade: 'Curitiba',
    setores: [
      {
        id: 'plateia',
        nome: 'Plateia',
        fileiras: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        assentosPorFileira: 20, // Padrão para todas as fileiras
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

  // Exemplo 2: Teatro com fileiras de tamanhos DIFERENTES
  'teatro-aspro': {
    id: 'teatro-aspro',
    nome: 'Teatro Aspro',
    cidade: 'Osasco',
    setores: [
      {
        id: 'plateia',
        nome: 'Plateia',
        // OPÇÃO 1: Usar objeto com quantidade específica por fileira
        fileiras: {
          'A': 30, // Fileira A tem 30 assentos
          'B': 30, // Fileira B tem 30 assentos
          'C': 25, // Fileira C tem 25 assentos
          'D': 25, // Fileira D tem 25 assentos
          'E': 20, // Fileira E tem 20 assentos
          'F': 20,
          'G': 20,
          'H': 20,
          'I': 20,
          'J': 20
        },
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
        fileiras: ['A', 'B', 'C', 'D'], // Todas iguais
        assentosPorFileira: 15, // Usa o padrão quando fileiras é array
        mostrarNumeracaoInferior: true,
        assentosEspeciais: []
      }
    ]
  },

  // Exemplo 3: Teatro com layout irregular (OPÇÃO 2 - array de objetos)
  'teatro-municipal': {
    id: 'teatro-municipal',
    nome: 'Teatro Municipal',
    cidade: 'São Paulo',
    setores: [
      {
        id: 'plateia',
        nome: 'Plateia',
        // OPÇÃO 2: Array de objetos (mais verboso mas mais claro)
        fileiras: [
          { letra: 'A', assentos: 30 },
          { letra: 'B', assentos: 30 },
          { letra: 'C', assentos: 28 },
          { letra: 'D', assentos: 26 },
          { letra: 'E', assentos: 24 },
          { letra: 'F', assentos: 22 },
          { letra: 'G', assentos: 20 },
          { letra: 'H', assentos: 20 },
        ],
        mostrarNumeracaoInferior: true,
        assentosEspeciais: [
          { fileira: 'A', numero: 1, tipo: 'pcd' },
          { fileira: 'A', numero: 2, tipo: 'acompanhante_pcd' },
        ]
      }
    ]
  },

  // Exemplo 4: Circo com layout complexo
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
        fileiras: {
          'A': 21, 'B': 21, 'C': 21, 'D': 21, 'E': 21,
          'F': 23, 'G': 23, 'H': 23, // Fileiras do meio maiores
          'I': 23, 'J': 23, 'K': 23,
          'L': 21, 'M': 21, 'N': 21, 'O': 21, 'P': 21
        },
        mostrarNumeracaoInferior: true,
        assentosEspeciais: [
          { fileira: 'J', numero: 1, tipo: 'pcd' },
          { fileira: 'J', numero: 2, tipo: 'acompanhante_pcd' },
          { fileira: 'J', numero: 22, tipo: 'pcd' },
          { fileira: 'J', numero: 23, tipo: 'acompanhante_pcd' },
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

  // Exemplo 5: Teatro com formato triangular (diminui conforme avança)
  'teatro-bradesco': {
    id: 'teatro-bradesco',
    nome: 'Teatro Bradesco',
    cidade: 'São Paulo',
    setores: [
      {
        id: 'plateia-a',
        nome: 'Plateia A',
        fileiras: [
          { letra: 'A', assentos: 10 }, // Frente menor
          { letra: 'B', assentos: 12 },
          { letra: 'C', assentos: 14 },
          { letra: 'D', assentos: 16 },
          { letra: 'E', assentos: 18 },
          { letra: 'F', assentos: 18 },
          { letra: 'G', assentos: 18 },
          { letra: 'H', assentos: 18 }
        ],
        mostrarNumeracaoInferior: true,
        assentosEspeciais: [
          { fileira: 'A', numero: 1, tipo: 'pcd' },
          { fileira: 'A', numero: 2, tipo: 'acompanhante_pcd' },
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

// Função helper para obter número de assentos de uma fileira específica
export function getAssentosPorFileira(setor, fileira) {
  // Se fileiras é um objeto (OPÇÃO 1)
  if (typeof setor.fileiras === 'object' && !Array.isArray(setor.fileiras)) {
    return setor.fileiras[fileira] || 0;
  }
  
  // Se fileiras é um array de objetos (OPÇÃO 2)
  if (Array.isArray(setor.fileiras) && setor.fileiras[0]?.letra) {
    const fileiraObj = setor.fileiras.find(f => f.letra === fileira);
    return fileiraObj?.assentos || 0;
  }
  
  // Se fileiras é um array simples (padrão antigo)
  return setor.assentosPorFileira || 0;
}

// Função helper para obter lista de letras das fileiras
export function getFileirasLetras(setor) {
  // Se fileiras é um objeto
  if (typeof setor.fileiras === 'object' && !Array.isArray(setor.fileiras)) {
    return Object.keys(setor.fileiras);
  }
  
  // Se fileiras é um array de objetos
  if (Array.isArray(setor.fileiras) && setor.fileiras[0]?.letra) {
    return setor.fileiras.map(f => f.letra);
  }
  
  // Se fileiras é um array simples
  return setor.fileiras;
}

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
    const fileiras = getFileirasLetras(setor);
    const assentosPorFileira = fileiras.map(fileira => 
      getAssentosPorFileira(setor, fileira)
    );
    return total + assentosPorFileira.reduce((sum, num) => sum + num, 0);
  }, 0);
}

// Função para obter informações detalhadas de um setor
export function getDetalhesSetor(setor) {
  const fileiras = getFileirasLetras(setor);
  return fileiras.map(fileira => ({
    fileira,
    assentos: getAssentosPorFileira(setor, fileira),
    temAssentosEspeciais: setor.assentosEspeciais?.some(a => a.fileira === fileira)
  }));
}
