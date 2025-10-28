// app/page.js - Página Inicial LENDO DO SUPABASE

// 1. Importa o "cérebro" do Supabase (com o caminho CORRETO)
import { createClient } from '../utils/supabase/server';

// A página agora é 'async' para poder esperar o banco de dados
export default async function HomePage() {
  
  // 2. Cria o cliente Supabase
  const supabase = createClient();

  // 3. Busca os eventos REAIS do banco de dados (Sintaxe do Supabase)
  // 'order' mostra os eventos mais novos primeiro
  const { data: eventos, error } = await supabase
    .from('eventos')
    .select('*')
    .order('id', { ascending: false });

  // Mostra um erro no console do Vercel se a busca falhar
  if (error) {
    console.error("Erro ao buscar eventos:", error);
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ margin: '0' }}>GOLDEN INGRESSOS</h1>
        <p>A sua plataforma de eventos VIP.</p>
        
        {/* Link para a página de Publicar Evento */}
        <a 
          href="/publicar-evento"
          style={{
            backgroundColor: '#f1c4f', color: 'black', padding: '10px 15px',
            borderRadius: '5px', fontWeight: 'bold', textDecoration: 'none',
            position: 'absolute', top: '20px', right: '20px'
          }}
        >
          Publicar Evento
        </a>
      </header>

      {/* Conteúdo Principal */}
      <div style={{ width: '80%', margin: '20px auto', padding: '20px' }}>
        <h2 style={{ color: '#5d34a4' }}>Eventos em Destaque</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* Se não houver eventos, mostra uma mensagem */}
          {(!eventos || eventos.length === 0) && (
            <p>Ainda não há eventos publicados. Seja o primeiro!</p>
          )}

          {/* Mapeia e mostra os eventos do banco */}
          {eventos && eventos.map(evento => (
            <div key={evento.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
              <span style={{ fontSize: '12px', color: '#5d34a4', fontWeight: 'bold' }}>{evento.categoria.toUpperCase()}</span>
              <h3 style={{ color: '#333', marginTop: '5px' }}>{evento.nome}</h3>
              <p>📅 Data: **{evento.data}** às **{evento.hora}**</p>
              <p>📍 Local: **{evento.local}**</p>
              <p>💰 Preço: **{evento.preco}**</p>
              <a 
                href={`/evento/${evento.id}`} 
                style={{ 
                  backgroundColor: '#f1c40f', color: 'black', padding: '10px 15px', 
                  borderRadius: '5px', textDecoration: 'none', display: 'inline-block', 
                  marginTop: '10px', fontWeight: 'bold'
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
