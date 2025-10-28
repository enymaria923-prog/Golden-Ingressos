// app/page.js - Página Inicial da Aplicação Golden Ingressos

// Dados simulados de eventos 
const DADOS_EVENTOS = [
  { id: 1, nome: "Show do DJ Golden Beats", data: "20/12/2025", hora: "22:00", local: "Arena de Festas", preco: "R$ 80,00", categoria: "Música" },
  { id: 2, nome: "Feira de Negócios e Inovação", data: "15/01/2026", hora: "09:00", local: "Centro de Convenções", preco: "R$ 150,00", categoria: "Negócios" },
  { id: 3, nome: "Festival Gastronômico de Verão", data: "05/02/2026", hora: "18:00", local: "Praia Central", preco: "R$ 30,00 (Entrada)", categoria: "Gastronomia" },
];

// Componente principal da Home Page
export default function HomePage() {
  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ margin: '0' }}>GOLDEN INGRESSOS</h1>
        <p>A sua plataforma de eventos VIP.</p>
      </header>

      {/* Conteúdo Principal */}
      <div style={{ width: '80%', margin: '20px auto', padding: '20px' }}>
        <h2 style={{ color: '#5d34a4' }}>Eventos em Destaque</h2>
        
        {/* Lista de Eventos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {DADOS_EVENTOS.map(evento => (
            <div key={evento.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
              <span style={{ fontSize: '12px', color: '#5d34a4', fontWeight: 'bold' }}>{evento.categoria.toUpperCase()}</span>
              <h3 style={{ color: '#333', marginTop: '5px' }}>{evento.nome}</h3>
              <p>📅 Data: **{evento.data}** às **{evento.hora}**</p>
              <p>📍 Local: **{evento.local}**</p>
              <p>💰 Preço: **{evento.preco}**</p>
              {/* Link Simulado para a página de detalhes */}
              <a 
                href={`/evento/${evento.id}`} 
                style={{ 
                  backgroundColor: '#f1c40f', /* Cor dourada simulada */
                  color: 'black', 
                  padding: '10px 15px', 
                  borderRadius: '5px', 
                  textDecoration: 'none', 
                  display: 'inline-block', 
                  marginTop: '10px',
                  fontWeight: 'bold'
                }}
              >
                Comprar Ingresso
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
