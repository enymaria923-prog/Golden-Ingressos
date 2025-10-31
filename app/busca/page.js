import { createClient } from '../../utils/supabase/server';
import Link from 'next/link';

// Componente do Cartão do Evento (reutilizável)
function CardEvento({ evento }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', overflow: 'hidden', width: '300px', margin: '20px' }}>
      <img src={evento.imagem_url || 'https://placehold.co/300x180/5d34a4/ffffff?text=EVENTO'} alt={evento.nome} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
      <div style={{ padding: '15px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#5d34a4' }}>{evento.nome}</h3>
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>{evento.categoria}</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>📅 {new Date(evento.data).toLocaleDateString('pt-BR')}</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>📍 {evento.localizacao || 'Local a definir'}</p>
        <p style={{ margin: '10px 0', fontSize: '16px', fontWeight: 'bold' }}>R$ {evento.preco}</p>
        <Link href={`/evento/${evento.id}`}>
          <button style={{ backgroundColor: '#f1c40f', color: 'black', padding: '10px 15px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
            Comprar Ingresso
          </button>
        </Link>
      </div>
    </div>
  );
}

export default async function BuscaPage({ searchParams }) {
  const supabase = createClient();
  
  // Obter parâmetros da busca
  const query = searchParams?.q || '';
  const local = searchParams?.local || '';
  
  let eventos = [];
  let error = null;

  if (query || local) {
    // Construir a consulta base
    let consulta = supabase.from('eventos').select('*');
    
    // Aplicar filtros se existirem
    if (query) {
      consulta = consulta.or(`nome.ilike.%${query}%,categoria.ilike.%${query}%,descricao.ilike.%${query}%`);
    }
    
    if (local && local !== 'Online') {
      consulta = consulta.ilike('localizacao', `%${local}%`);
    } else if (local === 'Online') {
      consulta = consulta.eq('online', true);
    }
    
    // Ordenar por data
    consulta = consulta.order('data', { ascending: true });
    
    const resultado = await consulta;
    eventos = resultado.data || [];
    error = resultado.error;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', marginBottom: '20px', borderRadius: '8px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para Home</Link>
        <h1>Resultados da Busca</h1>
        {(query || local) && (
          <p>
            {query && `Termo: "${query}"`}
            {query && local && ' • '}
            {local && `Local: ${local}`}
          </p>
        )}
      </header>

      {/* Resultados */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {error ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Erro ao carregar eventos: {error.message}</p>
          </div>
        ) : eventos.length > 0 ? (
          <>
            <p style={{ textAlign: 'center', marginBottom: '20px' }}>
              Encontrados {eventos.length} evento(s)
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px' }}>
              {eventos.map((evento) => (
                <CardEvento key={evento.id} evento={evento} />
              ))}
            </div>
          </>
        ) : query || local ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>Nenhum evento encontrado</h3>
            <p>Tente ajustar os termos da busca ou explore nossas categorias:</p>
            <div style={{ marginTop: '20px' }}>
              <Link href="/busca?q=Teatro" style={{ margin: '0 10px', color: '#5d34a4' }}>Teatro</Link>
              <Link href="/busca?q=Shows" style={{ margin: '0 10px', color: '#5d34a4' }}>Shows</Link>
              <Link href="/busca?q=Stand-up" style={{ margin: '0 10px', color: '#5d34a4' }}>Stand-up</Link>
              <Link href="/busca?q=Festivais" style={{ margin: '0 10px', color: '#5d34a4' }}>Festivais</Link>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Digite um termo de busca para encontrar eventos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
