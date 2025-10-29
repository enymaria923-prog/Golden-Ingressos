// app/page.js - VERSÃO DE EMERGÊNCIA (HOME FUNCIONAL)
import Link from 'next/link';

// Componente do Cartão do Evento (Fake)
function CardEvento({ evento }) {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
      overflow: 'hidden', 
      width: '300px', 
      margin: '20px',
      transition: 'transform 0.3s',
      fontFamily: 'sans-serif'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ height: '180px', overflow: 'hidden' }}>
        <img 
          src={evento.imagem_url} 
          alt={`Capa do evento ${evento.nome}`} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      
      <div style={{ padding: '15px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#5d34a4', fontSize: '1.4em' }}>
          {evento.nome}
        </h3>
        <p style={{ margin: '0 0 5px 0', fontSize: '0.9em' }}>
          {evento.categoria} | {evento.data}
        </p>
        <p style={{ margin: '0 0 15px 0', fontWeight: 'bold' }}>
          Preço: {evento.preco}
        </p>

        <Link href={evento.detalheUrl}>
          <button style={{
            backgroundColor: '#f1c40f',
            color: 'black',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
            transition: 'background-color 0.3s'
          }}>
            Comprar Ingresso
          </button>
        </Link>
      </div>
    </div>
  );
}

// Componente Principal da Home Page (SEM SUPABASE)
export default function Index() {
  // Eventos de exemplo (FAKE DATA)
  const eventosExemplo = [
    {
      id: 1,
      nome: "Show da Taylor Swift",
      categoria: "Música",
      data: "15/12/2024",
      preco: "R$ 250,00",
      imagem_url: "https://placehold.co/300x180/5d34a4/ffffff?text=TAYLOR+SWIFT",
      detalheUrl: "/evento/1"
    },
    {
      id: 2,
      nome: "Festival de Rock",
      categoria: "Música",
      data: "20/12/2024", 
      preco: "R$ 120,00",
      imagem_url: "https://placehold.co/300x180/ff6b6b/ffffff?text=FESTIVAL+ROCK",
      detalheUrl: "/evento/2"
    },
    {
      id: 3,
      nome: "Peça de Teatro - Hamlet",
      categoria: "Teatro",
      data: "25/12/2024",
      preco: "R$ 80,00",
      imagem_url: "https://placehold.co/300x180/4ecdc4/ffffff?text=TEATRO+HAMLET",
      detalheUrl: "/evento/3"
    }
  ];

  const containerStyle = {
    fontFamily: 'sans-serif',
    backgroundColor: '#f4f4f4',
    minHeight: '100vh',
    padding: '20px',
  };

  const eventosGridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '30px',
    maxWidth: '1200px',
    margin: '40px auto',
  };

  return (
    <div style={containerStyle}>
      
      {/* Cabeçalho */}
      <header style={{ 
        backgroundColor: '#5d34a4', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        marginBottom: '20px',
        borderRadius: '8px'
      }}>
        <h1 style={{ margin: '0', fontSize: '2em' }}>GOLDEN INGRESSOS</h1>
        <p style={{ margin: '5px 0 0 0' }}>Encontre seu próximo evento inesquecível.</p>
      </header>
      
      {/* Botões de Ação */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        
        <Link href="/publicar-evento" style={{ textDecoration: 'none' }}>
            <button style={{ 
                backgroundColor: '#f1c40f', 
                color: 'black', 
                padding: '12px 25px', 
                border: 'none', 
                borderRadius: '5px', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                marginRight: '15px'
            }}>
                Publicar Novo Evento
            </button>
        </Link>

        <Link href="/login" style={{ textDecoration: 'none' }}>
            <button style={{ 
                backgroundColor: '#fff', 
                color: '#5d34a4', 
                padding: '12px 25px', 
                border: '2px solid #5d34a4', 
                borderRadius: '5px', 
                fontWeight: 'bold', 
                cursor: 'pointer'
            }}>
                Entrar
            </button>
        </Link>
      </div>

      {/* Exibição dos Eventos (FAKE DATA) */}
      <h2 style={{ textAlign: 'center', color: '#333' }}>Eventos em Destaque</h2>

      <div style={eventosGridStyle}>
        {eventosExemplo.map((evento) => (
          <CardEvento key={evento.id} evento={evento} />
        ))}
      </div>

      {/* Aviso */}
      <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          ⚠️ Modo de demonstração - Conectando ao banco de dados...
        </p>
      </div>

    </div>
  );
}
