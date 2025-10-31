// app/meus-ingressos/page.js - VERSÃO BÁSICA
import { createClient } from '../../utils/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function MeusIngressosPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: ingressos, error } = await supabase
    .from('ingressos')
    .select(`
      *,
      eventos (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', marginBottom: '20px', borderRadius: '8px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar</Link>
        <h1>Meus Ingressos</h1>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {error ? (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <p>Erro ao carregar ingressos: {error.message}</p>
          </div>
        ) : ingressos && ingressos.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {ingressos.map((ingresso) => (
              <div key={ingresso.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#5d34a4' }}>{ingresso.eventos.nome}</h3>
                <p><strong>Status:</strong> {ingresso.status}</p>
                <p><strong>Código:</strong> {ingresso.codigo_ingresso}</p>
                <p><strong>Data do Evento:</strong> {new Date(ingresso.eventos.data).toLocaleDateString('pt-BR')}</p>
                <Link 
                  href={`/evento/${ingresso.eventos.id}`}
                  style={{ 
                    color: '#5d34a4', 
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Ver Detalhes do Evento
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: '#5d34a4' }}>Nenhum ingresso encontrado</h3>
            <p style={{ color: '#666', marginBottom: '25px' }}>
              Você ainda não comprou nenhum ingresso.
            </p>
            <Link 
              href="/" 
              style={{ 
                backgroundColor: '#f1c40f', 
                color: 'black', 
                padding: '12px 25px', 
                borderRadius: '5px', 
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Explorar Eventos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
