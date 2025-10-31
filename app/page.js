import { createClient } from '../utils/supabase/server.js';
import Link from 'next/link';
import UserDropdown from './components/UserDropdown';
import SearchBar from './components/SearchBar';

// Componente SIMPLES do Cartão
function CardEvento({ evento }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', overflow: 'hidden', width: '300px', margin: '20px' }}>
      <img src={evento.imagem_url || 'https://placehold.co/300x180/5d34a4/ffffff?text=EVENTO'} alt={evento.nome} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
      <div style={{ padding: '15px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#5d34a4' }}>{evento.nome}</h3>
        <p>{evento.categoria} | {new Date(evento.data).toLocaleDateString('pt-BR')}</p>
        <p><strong>Preço: R$ {evento.preco}</strong></p>
        <Link href={`/evento/${evento.id}`}>
          <button style={{ backgroundColor: '#f1c40f', color: 'black', padding: '10px 15px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
            Comprar Ingresso
          </button>
        </Link>
      </div>
    </div>
  );
}

// Componente principal
export default async function Index() {
  const supabase = createClient();
  
  // Verifica se o usuário está logado
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: eventos, error } = await supabase.from('eventos').select('*').order('data', { ascending: true });

  if (error) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '20px', textAlign: 'center' }}>
        <h1>Golden Ingressos</h1>
        <p>Erro ao carregar eventos. Tente novamente.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', marginBottom: '20px', borderRadius: '8px' }}>
        <h1>GOLDEN INGRESSOS</h1>
        <p>Encontre seu próximo evento inesquecível.</p>
      </header>
      
      {/* Barra de Pesquisa */}
      <SearchBar />
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Link href="/publicar-evento">
          <button style={{ backgroundColor: '#f1c40f', color: 'black', padding: '12px 25px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginRight: '15px' }}>
            Publicar Novo Evento
          </button>
        </Link>
        
        {/* Botão condicional - mostra "Entrar" ou menu do usuário */}
        {user ? (
          <UserDropdown user={user} />
        ) : (
          <Link href="/login">
            <button style={{ backgroundColor: '#fff', color: '#5d34a4', padding: '12px 25px', border: '2px solid #5d34a4', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
              Entrar
            </button>
          </Link>
        )}
      </div>

      <h2 style={{ textAlign: 'center' }}>Eventos em Destaque</h2>
      
      {eventos && eventos.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', maxWidth: '1200px', margin: '40px auto' }}>
          {eventos.map((evento) => <CardEvento key={evento.id} evento={evento} />)}
        </div>
      ) : (
        <p style={{ textAlign: 'center' }}>Nenhum evento encontrado.</p>
      )}
    </div>
  );
}
