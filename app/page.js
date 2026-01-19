import { createClient } from '../utils/supabase/server.js';
import Link from 'next/link';
import UserDropdown from './components/UserDropdown';
import SearchBar from './components/SearchBar';
import EventosCarousel from './components/EventosCarousel';
import FavoriteButton from './components/FavoriteButton';
import './styles/home.css'; // ← ÚNICA LINHA ADICIONADA

// Componente do Cartão com botão de favoritar
function CardEvento({ evento, userId, isFavorited }) {
  return (
    <div className="event-card">
      {/* Botão de Favoritar */}
      <div className="favorite-btn-container">
        <FavoriteButton 
          eventoId={evento.id} 
          userId={userId}
          initialFavorited={isFavorited}
        />
      </div>

      <div className="event-image-container">
        <img 
          src={evento.imagem_url || 'https://placehold.co/300x180/5d34a4/ffffff?text=EVENTO'} 
          alt={evento.nome}
          className="event-image"
        />
      </div>
      
      <div className="event-content">
        <h3 className="event-title">{evento.nome}</h3>
        <p className="event-info">{evento.categoria} | {new Date(evento.data).toLocaleDateString('pt-BR')}</p>
        <p className="event-price"><strong>Preço: R$ {evento.preco}</strong></p>
        <Link href={`/evento/${evento.id}`}>
          <button className="btn-comprar">
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
  
  // Data de hoje (início do dia)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataHoje = hoje.toISOString().split('T')[0];
  
  // Buscar apenas eventos aprovados e futuros
  const { data: eventos, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('status', 'aprovado')
    .gte('data', dataHoje) // Apenas eventos de hoje em diante
    .order('data', { ascending: true });

  if (error) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '20px', textAlign: 'center' }}>
        <h1>Golden Ingressos</h1>
        <p>Erro ao carregar eventos. Tente novamente.</p>
      </div>
    );
  }

  // Buscar favoritos do usuário (se estiver logado)
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

  // Separar eventos em destaque (primeiros 5) e eventos regulares
  const eventosDestaque = eventos?.slice(0, 5) || [];
  const eventosRegulares = eventos || [];

  return (
    <div className="page-home">
      <div className="container-principal">
        <header className="header-principal">
          <h1 className="logo-golden">GOLDEN INGRESSOS</h1>
          <p className="tagline">Encontre seu próximo evento inesquecível.</p>
        </header>
        
        {/* Barra de Pesquisa */}
        <SearchBar />
        
        <div className="action-buttons-container">
          <Link href="/publicar-evento">
            <button className="btn-publicar">
              Publicar Novo Evento
            </button>
          </Link>
          
          {user ? (
            <UserDropdown user={user} />
          ) : (
            <Link href="/login">
              <button className="btn-entrar">
                Entrar
              </button>
            </Link>
          )}
        </div>

        {/* Carrossel de Eventos em Destaque */}
        {eventosDestaque.length > 0 && (
          <div className="secao-destaque">
            <h2 className="titulo-secao">🌟 Eventos em Destaque</h2>
            <EventosCarousel eventos={eventosDestaque} userId={user?.id} favoritos={favoritos} />
          </div>
        )}

        {/* Lista de Todos os Eventos */}
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

      {/* RODAPÉ COM DOCUMENTAÇÕES */}
      <footer className="footer-principal">
        <div className="footer-grid">
          
          {/* Coluna 1: Marketplace */}
          <div className="footer-coluna">
            <h3 className="footer-titulo">🎭 Marketplace</h3>
            <ul className="footer-lista">
              <li>
                <Link href="/shows">O melhor marketplace para Shows</Link>
              </li>
              <li>
                <Link href="/teatros">O melhor marketplace para Teatros</Link>
              </li>
              <li>
                <Link href="/stand-up">O melhor marketplace para Stand-up</Link>
              </li>
            </ul>
          </div>

          {/* Coluna 2: Institucional */}
          <div className="footer-coluna">
            <h3 className="footer-titulo">📄 Institucional</h3>
            <ul className="footer-lista">
              <li><Link href="/termos">Termos de Uso</Link></li>
              <li><Link href="/privacidade">Políticas de Privacidade</Link></li>
              <li><Link href="/confianca">Golden Ingressos é confiável?</Link></li>
              <li><Link href="/sobre">Sobre a Golden</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Suporte */}
          <div className="footer-coluna">
            <h3 className="footer-titulo">🆘 Suporte</h3>
            <ul className="footer-lista">
              <li><Link href="/ajuda-produtores">Tutorial e Ajuda para Produtores</Link></li>
              <li><Link href="/duvidas-frequentes">Dúvidas Frequentes</Link></li>
              <li><a href="mailto:contato@goldeningressos.com.br">Fale Conosco</a></li>
            </ul>
          </div>

          {/* Coluna 4: Contato */}
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

        {/* Linha de copyright */}
        <div className="footer-copyright">
          <p>© 2025 Golden Ingressos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
