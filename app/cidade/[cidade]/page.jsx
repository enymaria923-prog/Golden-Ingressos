import { createClient } from '../../../../utils/supabase/server';
import Link from 'next/link';

function CardEvento({ evento }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', overflow: 'hidden', width: '300px', margin: '20px' }}>
      <img src={evento.imagem_url || 'https://placehold.co/300x180/5d34a4/ffffff?text=EVENTO'} alt={evento.nome} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
      <div style={{ padding: '15px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#5d34a4' }}>{evento.nome}</h3>
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>{evento.categoria}</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>📅 {new Date(evento.data).toLocaleDateString('pt-BR')}</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>📍 {evento.cidade || evento.localizacao || 'Local a definir'}</p>
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

export default async function CidadePage({ params }) {
  const supabase = createClient();
  
  const cidade = decodeURIComponent(params.cidade);
  
  // Data de hoje (início do dia)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataHoje = hoje.toISOString().split('T')[0];
  
  // Buscar eventos aprovados e futuros
  const { data: todosEventos, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('status', 'aprovado')
    .gte('data', dataHoje)
    .order('data', { ascending: true });

  if (error) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '20px', textAlign: 'center' }}>
        <h1>Erro ao carregar eventos</h1>
        <Link href="/" style={{ color: '#5d34a4', textDecoration: 'underline' }}>
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  // Filtrar eventos pela cidade (ignorando maiúsculas/minúsculas)
  const eventos = todosEventos?.filter(evento => 
    evento.cidade?.toLowerCase() === cidade.toLowerCase()
  ) || [];

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', marginBottom: '20px', borderRadius: '8px', position: 'relative' }}>
        <Link href="/escolher-cidade" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'white', textDecoration: 'none', fontSize: '18px' }}>
          ← Voltar
        </Link>
        <h1>Eventos em {cidade}</h1>
        <p>Encontre os melhores eventos na sua cidade</p>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {eventos.length > 0 ? (
          <>
            <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px', color: '#666' }}>
              {eventos.length} evento(s) encontrado(s)
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px' }}>
              {eventos.map((evento) => (
                <CardEvento key={evento.id} evento={evento} />
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
            <h3 style={{ color: '#666', marginBottom: '20px' }}>Nenhum evento encontrado em {cidade}</h3>
            <p style={{ color: '#999', marginBottom: '30px' }}>
              Não há eventos programados para esta cidade no momento.
              <br />
              Que tal explorar eventos em outras cidades?
            </p>
            <Link href="/escolher-cidade">
              <button style={{ 
                backgroundColor: '#5d34a4', 
                color: 'white', 
                padding: '12px 25px', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '16px', 
                fontWeight: 'bold', 
                cursor: 'pointer' 
              }}>
                📍 Escolher outra cidade
              </button>
            </Link>
            <br />
            <Link href="/" style={{ display: 'inline-block', marginTop: '15px', color: '#5d34a4', textDecoration: 'underline' }}>
              Ou voltar para a página inicial
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
