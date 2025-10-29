// app/page.js
import { createClient } from '../utils/supabase/server';
import Link from 'next/link'; // CRÍTICO: Importar o Link

// --- Componente do Cartão do Evento (CardEvento) ---
function CardEvento({ evento }) {
  // Converte o preço para formato BRL (se for um número)
  const precoFormatado = isNaN(parseFloat(evento.preco)) 
    ? evento.preco 
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(evento.preco));
  
  // CRÍTICO: O link para a página de detalhes
  const eventoDetalheUrl = `/evento/${evento.id}`; // Assumindo /evento/[id]

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
      {/* Imagem da Capa */}
      <div style={{ height: '180px', overflow: 'hidden' }}>
        <img 
          src={evento.imagem_url || 'https://placehold.co/300x180/5d34a4/ffffff?text=EVENTO'} 
          alt={`Capa do evento ${evento.nome}`} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      
      {/* Detalhes */}
      <div style={{ padding: '15px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#5d34a4', fontSize: '1.4em' }}>
          {evento.nome}
        </h3>
        <p style={{ margin: '0 0 5px 0', fontSize: '0.9em' }}>
          **{evento.categoria}** | {new Date(evento.data).toLocaleDateString('pt-BR')}
        </p>
        <p style={{ margin: '0 0 15px 0', fontWeight: 'bold' }}>
          Preço: {precoFormatado}
        </p>

        {/* CORREÇÃO DO BOTÃO: Usando Link do Next.js */}
        <Link href={eventoDetalheUrl}>
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


// --- Componente Principal da Home Page ---
export default async function Index() {
  const supabase = createClient();
  
  // Buscando todos os eventos para exibição na home
  const { data: eventos, error } = await supabase
    .from('eventos')
    .select('*')
    .order('data', { ascending: true }); // Ordena pelos mais próximos

  if (error) {
    console.error('Erro ao buscar eventos:', error);
    return <div>Erro ao carregar eventos. Tente novamente mais tarde.</div>;
  }
  
  // Configuração de estilo geral
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
        <h1 style={{ margin: '0', fontSize: '2em' }}>Bem-vindo ao Elite Tickets</h1>
        <p style={{ margin: '5px 0 0 0' }}>Encontre seu próximo evento inesquecível.</p>
      </header>
      
      {/* Botões de Ação */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Link href="/publicar-evento">
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
        <Link href="/login">
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

      {/* Exibição dos Eventos */}
      <h2 style={{ textAlign: 'center', color: '#333' }}>Próximos Eventos</h2>

      {eventos && eventos.length > 0 ? (
        <div style={eventosGridStyle}>
          {eventos.map((evento) => (
            // CRÍTICO: O evento precisa ter um ID único para a chave e para o Link
            <CardEvento key={evento.id} evento={evento} />
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', fontSize: '1.2em', color: '#666' }}>Nenhum evento encontrado no momento. Seja o primeiro a publicar!</p>
      )}

    </div>
  );
}
