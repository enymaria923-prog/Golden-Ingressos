import { createClient } from '../utils/supabase/server.js';
import Link from 'next/link';
import UserDropdown from './components/UserDropdown';
import SearchBar from './components/SearchBar';
import EventosCarousel from './components/EventosCarousel';
import FavoriteButton from './components/FavoriteButton';
import ThemeToggle from './components/ThemeToggle';
import ThemeProvider from './components/ThemeProvider';

// Componente do Cartão - Estilo Sympla
function CardEvento({ evento, userId, isFavorited }) {
  return (
    <div className="event-card">
      <div className="event-card-inner">
        {/* Botão de Favoritar */}
        <div className="favorite-btn-container">
          <FavoriteButton 
            eventoId={evento.id} 
            userId={userId}
            initialFavorited={isFavorited}
          />
        </div>

        {/* Imagem do Evento */}
        <div className="event-image-container">
          <img 
            src={evento.imagem_url || 'https://placehold.co/400x200/5d34a4/ffffff?text=EVENTO'} 
            alt={evento.nome}
            className="event-image"
          />
        </div>

        {/* Conteúdo */}
        <div className="event-content">
          <h3 className="event-title">{evento.nome}</h3>
          
          <div className="event-details">
            <span className="event-category">{evento.categoria}</span>
            <span className="event-date">
              📅 {new Date(evento.data).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'short' 
              })}
            </span>
          </div>

          <div className="event-location">
            📍 {evento.cidade || evento.local || 'Local a definir'}
          </div>

          <div className="event-footer">
            <div className="event-price">
              <span className="price-label">A partir de</span>
              <span className="price-value">R$ {evento.preco}</span>
            </div>
            
            <Link href={`/evento/${evento.id}`}>
              <button className="btn-buy">
                Comprar
              </button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .event-card {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          width: 100%;
          max-width: 320px;
        }

        .event-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        .event-card-inner {
          position: relative;
        }

        .favorite-btn-container {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
        }

        .event-image-container {
          width: 100%;
          height: 180px;
          overflow: hidden;
          background: var(--image-bg);
        }

        .event-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .event-card:hover .event-image {
          transform: scale(1.05);
        }

        .event-content {
          padding: 16px;
        }

        .event-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 12px 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .event-details {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 8px;
        }

        .event-category {
          background: var(--category-bg);
          color: var(--category-text);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .event-date {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .event-location {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .event-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
        }

        .event-price {
          display: flex;
          flex-direction: column;
        }

        .price-label {
          font-size: 11px;
          color: var(--text-tertiary);
          text-transform: uppercase;
        }

        .price-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--price-color);
        }

        .btn-buy {
          background: var(--btn-primary);
          color: var(--btn-text);
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-buy:hover {
          background: var(--btn-primary-hover);
          transform: scale(1.02);
        }

        @media (max-width: 768px) {
          .event-card {
            max-width: 100%;
          }
        }
      `}</style>
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
    <ThemeProvider>
      <div className="page-container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="header-top">
              <h1 className="logo">GOLDEN INGRESSOS</h1>
              <ThemeToggle />
            </div>
            <p className="tagline">Encontre seu próximo evento inesquecível</p>
          </div>
        </header>

        <div className="main-content">
          {/* Barra de Pesquisa */}
          <div className="search-section">
            <SearchBar />
          </div>

          {/* Botões de Ação */}
          <div className="action-buttons">
            <Link href="/publicar-evento">
              <button className="btn-publish">
                ➕ Publicar Evento
              </button>
            </Link>
            
            {user ? (
              <UserDropdown user={user} />
            ) : (
              <Link href="/login">
                <button className="btn-login">
                  Entrar
                </button>
              </Link>
            )}
          </div>

          {/* Carrossel de Destaques */}
          {eventosDestaque.length > 0 && (
            <section className="section-destaque">
              <h2 className="section-title">🌟 Em Alta</h2>
              <EventosCarousel eventos={eventosDestaque} userId={user?.id} favoritos={favoritos} />
            </section>
          )}

          {/* Grid de Eventos */}
          <section className="section-eventos">
            <h2 className="section-title">📅 Todos os Eventos</h2>
            
            {eventosRegulares && eventosRegulares.length > 0 ? (
              <div className="events-grid">
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
              <p className="no-events">Nenhum evento disponível no momento</p>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-column">
              <h3 className="footer-title">🎭 Marketplace</h3>
              <ul className="footer-links">
                <li><Link href="/shows">Shows</Link></li>
                <li><Link href="/teatros">Teatros</Link></li>
                <li><Link href="/stand-up">Stand-up</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-title">📄 Institucional</h3>
              <ul className="footer-links">
                <li><Link href="/termos">Termos de Uso</Link></li>
                <li><Link href="/privacidade">Privacidade</Link></li>
                <li><Link href="/confianca">É confiável?</Link></li>
                <li><Link href="/sobre">Sobre</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-title">🆘 Suporte</h3>
              <ul className="footer-links">
                <li><Link href="/ajuda-produtores">Ajuda Produtores</Link></li>
                <li><Link href="/duvidas-frequentes">FAQ</Link></li>
                <li><a href="mailto:contato@goldeningressos.com.br">Contato</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-title">📞 Contato</h3>
              <p className="footer-contact">
                <strong>Email:</strong><br />
                contato@goldeningressos.com.br
              </p>
              <p className="footer-contact">
                <strong>Atendimento:</strong><br />
                Seg-Sex: 09:00-18:00
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 Golden Ingressos. Todos os direitos reservados.</p>
          </div>
        </footer>

        <style jsx global>{`
          :root {
            /* Tema Claro */
            --bg-primary: #ffffff;
            --bg-secondary: #f8f9fa;
            --text-primary: #1a1a1a;
            --text-secondary: #666666;
            --text-tertiary: #999999;
            --card-bg: #ffffff;
            --header-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --btn-primary: #f1c40f;
            --btn-primary-hover: #d4a917;
            --btn-text: #000000;
            --border-color: #e0e0e0;
            --category-bg: #e8f4f8;
            --category-text: #2980b9;
            --price-color: #27ae60;
            --image-bg: #f0f0f0;
            --footer-bg: #2c3e50;
            --footer-text: #ecf0f1;
          }

          .dark {
            /* Tema Escuro */
            --bg-primary: #0a0e27;
            --bg-secondary: #151932;
            --text-primary: #ffffff;
            --text-secondary: #b0b0b0;
            --text-tertiary: #808080;
            --card-bg: #1a1f3a;
            --header-bg: linear-gradient(135deg, #434343 0%, #000000 100%);
            --btn-primary: #f1c40f;
            --btn-primary-hover: #d4a917;
            --btn-text: #000000;
            --border-color: #2d3250;
            --category-bg: #2d3250;
            --category-text: #64b5f6;
            --price-color: #4ade80;
            --image-bg: #2d3250;
            --footer-bg: #0f1419;
            --footer-text: #b0b0b0;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            transition: background 0.3s ease, color 0.3s ease;
          }

          .page-container {
            min-height: 100vh;
            background: var(--bg-primary);
          }

          /* HEADER */
          .header {
            background: var(--header-bg);
            padding: 40px 20px;
            text-align: center;
            position: relative;
          }

          .header-content {
            max-width: 1200px;
            margin: 0 auto;
          }

          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }

          .logo {
            font-size: 32px;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: 2px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
          }

          .tagline {
            font-size: 18px;
            color: rgba(255,255,255,0.9);
            font-weight: 300;
          }

          /* MAIN CONTENT */
          .main-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 20px 60px;
          }

          .search-section {
            margin: -30px auto 30px;
            max-width: 600px;
          }

          .action-buttons {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-bottom: 50px;
            flex-wrap: wrap;
          }

          .btn-publish {
            background: var(--btn-primary);
            color: var(--btn-text);
            border: none;
            padding: 14px 28px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(241, 196, 15, 0.3);
          }

          .btn-publish:hover {
            background: var(--btn-primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(241, 196, 15, 0.4);
          }

          .btn-login {
            background: transparent;
            color: var(--text-primary);
            border: 2px solid var(--border-color);
            padding: 12px 28px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .btn-login:hover {
            background: var(--bg-secondary);
            border-color: var(--btn-primary);
          }

          /* SECTIONS */
          .section-destaque,
          .section-eventos {
            margin-bottom: 60px;
          }

          .section-title {
            font-size: 28px;
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 30px;
            text-align: center;
          }

          /* EVENTS GRID */
          .events-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 24px;
            justify-items: center;
          }

          .no-events {
            text-align: center;
            color: var(--text-secondary);
            font-size: 18px;
            padding: 60px 20px;
          }

          /* FOOTER */
          .footer {
            background: var(--footer-bg);
            color: var(--footer-text);
            padding: 60px 20px 30px;
            margin-top: 80px;
          }

          .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 40px;
            margin-bottom: 40px;
          }

          .footer-column {
            display: flex;
            flex-direction: column;
          }

          .footer-title {
            font-size: 18px;
            font-weight: 700;
            color: #f1c40f;
            margin-bottom: 20px;
          }

          .footer-links {
            list-style: none;
            padding: 0;
          }

          .footer-links li {
            margin-bottom: 12px;
          }

          .footer-links a {
            color: var(--footer-text);
            text-decoration: none;
            font-size: 15px;
            transition: color 0.2s ease;
          }

          .footer-links a:hover {
            color: #f1c40f;
          }

          .footer-contact {
            font-size: 15px;
            line-height: 1.8;
            margin-bottom: 15px;
          }

          .footer-bottom {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
            font-size: 14px;
            color: #95a5a6;
          }

          /* RESPONSIVE */
          @media (max-width: 768px) {
            .logo {
              font-size: 24px;
            }

            .tagline {
              font-size: 14px;
            }

            .section-title {
              font-size: 22px;
            }

            .events-grid {
              grid-template-columns: 1fr;
              gap: 20px;
            }

            .footer-content {
              grid-template-columns: 1fr;
              gap: 30px;
            }
          }
        `}</style>
      </div>
    </ThemeProvider>
  );
}
