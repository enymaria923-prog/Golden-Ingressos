"use client"; // app/evento/[id]/page.js - Página de Detalhes do Evento

// Reutilizamos os mesmos dados simulados (em um app real, isso viria de um banco de dados)
const DADOS_EVENTOS = [
  { id: 1, nome: "Show do DJ Golden Beats", data: "20/12/2025", hora: "22:00", local: "Arena de Festas", preco: "R$ 80,00", categoria: "Música", descricao: "Prepare-se para a maior festa eletrônica do ano com o DJ Golden Beats. Luzes, som e muita energia!" },
  { id: 2, nome: "Feira de Negócios e Inovação", data: "15/01/2026", hora: "09:00", local: "Centro de Convenções", preco: "R$ 150,00", categoria: "Negócios", descricao: "Conecte-se com os líderes do mercado e descubra as últimas tendências em tecnologia e inovação." },
  { id: 3, nome: "Festival Gastronômico de Verão", data: "05/02/2026", hora: "18:00", local: "Praia Central", preco: "R$ 30,00 (Entrada)", categoria: "Gastronomia", descricao: "Os melhores chefs da cidade reunidos em um só lugar. Venha provar sabores incríveis!" },
];

// Função para buscar o evento específico pelo ID
function buscarEventoPorId(id) {
  // O 'id' vem da URL. Convertemos para número.
  const idNumerico = parseInt(id, 10);
  return DADOS_EVENTOS.find(evento => evento.id === idNumerico);
}

// Este é o componente da página de detalhes
export default function PaginaEvento({ params }) {
  // 'params.id' pega o número da URL (ex: "1", "2", etc.)
  const evento = buscarEventoPorId(params.id);

  // Se o evento não for encontrado
  if (!evento) {
    return (
      <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '50px' }}>
        <h1>Evento não encontrado</h1>
        <a href="/">Voltar para a Home</a>
      </div>
    );
  }

  // Se o evento for encontrado, mostra os detalhes
  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>
          &larr; Voltar (Golden Ingressos)
        </a>
        <h1 style={{ margin: '0', paddingTop: '10px' }}>{evento.nome}</h1>
      </header>

      {/* Conteúdo Principal */}
      <div style={{ width: '70%', margin: '20px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h2 style={{ color: '#5d34a4' }}>Detalhes do Evento</h2>
        <p><strong>Descrição:</strong> {evento.descricao}</p>
        <p><strong>Categoria:</strong> {evento.categoria}</p>
        <p><strong>Data:</strong> {evento.data} às {evento.hora}</p>
        <p><strong>Local:</strong> {evento.local}</p>
        <p><strong>Preço:</strong> {evento.preco}</p>
        
        <hr style={{ margin: '20px 0' }} />
        
        {/* Área de Compra (Simulada) */}
        <h2 style={{ color: '#f1c40f' }}>Comprar Ingressos</h2>
        <p>Selecione a quantidade de ingressos (Simulação):</p>
        <input 
          type="number" 
          defaultValue="1" 
          min="1" 
          max="10" 
          style={{ padding: '10px', fontSize: '16px', width: '100px' }} 
        />
        <button 
          style={{ 
            backgroundColor: '#f1c40f', 
            color: 'black', 
            padding: '10px 20px', 
            borderRadius: '5px', 
            textDecoration: 'none', 
            display: 'inline-block', 
            marginTop: '10px',
            fontWeight: 'bold',
            fontSize: '18px',
            marginLeft: '10px',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={() => alert(`Simulação de compra para "${evento.nome}"! Em um site real, isso iria para o checkout de pagamento.`)}
        >
          Confirmar Compra (Simulado)
        </button>
      </div>
    </div>
  );
}
