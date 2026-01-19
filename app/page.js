import { createClient } from '../utils/supabase/server.js';
import Link from 'next/link';
import UserDropdown from './components/UserDropdown';
import SearchBar from './components/SearchBar';
import EventosCarousel from './components/EventosCarousel';
import FavoriteButton from './components/FavoriteButton';
import ThemeToggle from './components/ThemeToggle';
import Categorias from './components/categorias';
import './styles/home.css';

// Componente do Cartão com botão de favoritar
function CardEvento({ evento, userId, isFavorited }) {
  return (
    <div className="event-card">
      <div className="favorite-btn-container">
        <FavoriteButton 
          eventoId={evento.id} 
          userId={userId}
          initialFavorited={isFavorited}
        />
      </div>

      <div className="event-image-container">
        <img 
          src={evento.imagem_url || 'https://placehold.co/400x220/5d34a4/ffffff?text=EVENTO'} 
          alt={evento.nome}
          className="event-image"
        />
      </div>
      
      <div className="event-content">
        <h3 className="event-title">{evento.nome}</h3>
        
        <div className="event-meta">
          <span className="event-category">{evento.categoria}</span>
          <span className="event-date">
            📅 {new Date(evento.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
        </div>
        
        <div className="event-location">
          📍 {evento.cidade || evento.local || 'Local a definir'}
        </div>
        
        <div className="event-price-section">
          <div className="price-info">
            <span className="price-label">A partir de</span>
            <span className="price-value">R$ {evento.preco}</span>
          </div>
          <Link href={`/evento/${evento.id}`}>
            <button className="btn-comprar">Comprar</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Componente principal
export default async function Index() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataHoje = hoje.toISOString().split('T')[0];
  
  const { data: eventos, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('status', 'aprovado')
    .gte('data', dataHoje)
    .order('data', { ascending: true });

  if (error) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '20px', textAlign: 'center' }}>
        <h1>Golden Ingressos</h1>
        <p>Erro ao carregar eventos. Tente novamente.</p>
      </div>
    );
  }

  let favoritos = [];
  if (user) {
    const { data: favoritosData } = await supabase
      .from('favoritos')
      .select('evento_id')
      .eq('user_id', user.id);
    
    if (favoritosData) {
      favoritos = favoritosData.map(f => f.evento_id);
    }
  }

  const eventosDestaque = eventos?.slice(0, 5) || [];
  const eventosRegulares = eventos || [];

  return (
    <div className="page-home">
      <div className="container-principal">
        <header className="header-principal">
          <div className="header-content">
            <h1 className="logo-golden">GOLDEN INGRESSOS</h1>
            <ThemeToggle />
          </div>
          <p className="tagline">Encontre seu próximo evento inesquecível</p>
        </header>
        
        <SearchBar />
        <Categorias />
        
        <div className="action-buttons-container">
          <Link href="/publicar-evento">
            <button className="btn-publicar">Publicar Novo Evento</button>
          </Link>
          
          {user ? (
            <UserDropdown user={user} />
          ) : (
            <Link href="/login">
              <button className="btn-entrar">Entrar</button>
            </Link>
          )}
        </div>

        {eventosDestaque.length > 0 && (
          <div className="secao-destaque">
            <h2 className="titulo-secao">🌟 Eventos em Destaque</h2>
            <EventosCarousel eventos={eventosDestaque} userId={user?.id} favoritos={favoritos} />
          </div>
        )}

        <h2 className="titulo-secao">📅 Todos os Eventos</h2>
        
        {eventosRegulares && eventosRegulares.length > 0 ? (
          <div className="grid-eventos">
            {eventosRegulares.map((evento) => (
              <CardEvento 
                key={evento.id} 
                evento={evento} 
                userId={user?.id}
                isFavorited={favoritos.includes(evento.id)}
              />
            ))}
          </div>
        ) : (
          <p className="sem-eventos">Nenhum evento aprovado encontrado.</p>
        )}
      </div>

      <footer className="footer-principal">
        <div className="footer-grid">
          <div className="footer-coluna">
            <h3 className="footer-titulo">🎭 Marketplace</h3>
            <ul className="footer-lista">
              <li><Link href="/shows">O melhor marketplace para Shows</Link></li>
              <li><Link href="/teatros">O melhor marketplace para Teatros</Link></li>
              <li><Link href="/stand-up">O melhor marketplace para Stand-up</Link></li>
            </ul>
          </div>

          <div className="footer-coluna">
            <h3 className="footer-titulo">📄 Institucional</h3>
            <ul className="footer-lista">
              <li><Link href="/termos">Termos de Uso</Link></li>
              <li><Link href="/privacidade">Políticas de Privacidade</Link></li>
              <li><Link href="/confianca">Golden Ingressos é confiável?</Link></li>
              <li><Link href="/sobre">Sobre a Golden</Link></li>
            </ul>
          </div>

          <div className="footer-coluna">
            <h3 className="footer-titulo">🆘 Suporte</h3>
            <ul className="footer-lista">
              <li><Link href="/ajuda-produtores">Tutorial e Ajuda para Produtores</Link></li>
              <li><Link href="/duvidas-frequentes">Dúvidas Frequentes</Link></li>
              <li><a href="mailto:contato@goldeningressos.com.br">Fale Conosco</a></li>
            </ul>
          </div>

          <div className="footer-coluna">
            <h3 className="footer-titulo">📞 Contato</h3>
            <p className="footer-contato">
              <strong>Email:</strong><br />
              contato@goldeningressos.com.br
            </p>
            <p className="footer-contato">
              <strong>Atendimento:</strong><br />
              Segunda a Sexta<br />
              09:00 - 18:00
            </p>
          </div>
        </div>

        <div className="footer-copyright">
          <p>© 2025 Golden Ingressos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
