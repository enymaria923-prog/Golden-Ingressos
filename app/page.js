import { createClient } from '../utils/supabase/server.js';
import Link from 'next/link';
import UserDropdown from './components/UserDropdown';
import SearchBar from './components/SearchBar';
import EventosCarousel from './components/EventosCarousel';
import FavoriteButton from './components/FavoriteButton';

// Componente do Cartão com botão de favoritar
function CardEvento({ evento, userId, isFavorited }) {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
      overflow: 'hidden', 
      width: '300px', 
      margin: '20px',
      position: 'relative'
    }}>
      {/* Botão de Favoritar */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
        <FavoriteButton 
          eventoId={evento.id} 
          userId={userId}
          initialFavorited={isFavorited}
        />
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={evento.imagem_url || 'https://placehold.co/300x180/5d34a4/ffffff?text=EVENTO'} 
        alt={evento.nome} 
        style={{ width: '100%', height: '180px', objectFit: 'cover' }} 
      />
      <div style={{ padding: '15px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#5d34a4' }}>{evento.nome}</h3>
        <p>{evento.categoria} | {new Date(evento.data).toLocaleDateString('pt-BR')}</p>
        <p><strong>Preço: R$ {evento.preco}</strong></p>
        <Link href={`/evento/${evento.id}`}>
          <button style={{ 
            backgroundColor: '#f1c40f', 
            color: 'black', 
            padding: '10px 15px', 
            border: 'none', 
            borderRadius: '4px', 
            fontWeight: 'bold', 
            cursor: 'pointer', 
            width: '100%' 
          }}>
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
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <div style={{ padding: '20px', paddingBottom: '0' }}>
        <header style={{ 
          backgroundColor: '#5d34a4', 
          color: 'white', 
          padding: '20px', 
          textAlign: 'center', 
          marginBottom: '20px', 
          borderRadius: '8px' 
        }}>
          <h1>GOLDEN INGRESSOS</h1>
          <p>Encontre seu próximo evento inesquecível.</p>
        </header>
        
        {/* Barra de Pesquisa */}
        <SearchBar />
        
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
          
          {user ? (
            <UserDropdown user={user} />
          ) : (
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
          )}
        </div>

        {/* Carrossel de Eventos em Destaque */}
        {eventosDestaque.length > 0 && (
          <div style={{ marginBottom: '50px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🌟 Eventos em Destaque</h2>
            <EventosCarousel eventos={eventosDestaque} userId={user?.id} favoritos={favoritos} />
          </div>
        )}

        {/* Lista de Todos os Eventos */}
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>📅 Todos os Eventos</h2>
        
        {eventosRegulares && eventosRegulares.length > 0 ? (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: '30px', 
            maxWidth: '1200px', 
            margin: '40px auto',
            marginBottom: '60px'
          }}>
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
          <p style={{ textAlign: 'center', marginBottom: '60px' }}>Nenhum evento aprovado encontrado.</p>
        )}
      </div>

      {/* RODAPÉ COM DOCUMENTAÇÕES */}
      <footer style={{ 
        backgroundColor: '#2c3e50', 
        color: '#ecf0f1',
        padding: '50px 20px 30px',
        marginTop: '60px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px'
        }}>
          
          {/* Coluna 1: Marketplace */}
          <div>
            <h3 style={{ 
              color: '#f1c40f', 
              marginBottom: '20px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              🎭 Marketplace
            </h3>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/shows" style={{ 
                  color: '#ecf0f1', 
                  textDecoration: 'none',
                  fontSize: '15px',
                  transition: 'color 0.3s'
                }}>
                  O melhor marketplace para Shows
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/teatros" style={{ 
                  color: '#ecf0f1', 
                  textDecoration: 'none',
                  fontSize: '15px'
                }}>
                  O melhor marketplace para Teatros
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/baladas" style={{ 
                  color: '#ecf0f1', 
                  textDecoration: 'none',
                  fontSize: '15px'
                }}>
                  O melhor marketplace para Baladas
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/stand-up" style={{ 
                  color: '#ecf0f1', 
                  textDecoration: 'none',
                  fontSize: '15px'
                }}>
                  O melhor marketplace para Stand-up
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 2: Institucional */}
          <div>
            <h3 style={{ 
              color: '#f1c40f', 
              marginBottom: '20px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              📄 Institucional
            </h3>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/termos" style={{ 
                  color: '#ecf0f1', 
                  textDecoration: 'none',
                  fontSize: '15px'
                }}>
                  Termos de Uso
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/privacidade" style={{ 
                  color: '#ecf0f1', 
                  textDecoration: 'none',
                  fontSize: '15px'
                }}>
                  Políticas de Privacidade
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/confianca" style={{ 
                  color: '#ecf0f1', 
                  textDecoration: 'none',
                  fontSize: '15px'
                }}>
                  Golden Ingressos é confiável?
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/sobre" style={{ 
                  color: '#ecf0f1', 
                  textDecoration: 'none',
                  fontSize: '15px'
                }}>
                  Sobre a Golden
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Suporte */}
          <div>
            <h3 style={{ 
              color: '#f1c40f', 
              marginBottom: '20px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              🆘 Suporte
            </h3>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0,
              margin: 0
            }}>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/ajuda-produtores" style={{ 
                  color: '#ecf0f1', 
                  textDecoration: 'none',
                  fontSize: '15px'
                }}>
                  Tutorial e Ajuda para Produtores
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/duvidas-frequentes" style={{ 
                  color: '#ecf0f1', 
                  textDecoration: 'none',
                  fontSize: '15px'
                }}>
                  Dúvidas Frequentes
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="mailto:contato@goldeningressos.com.br" style={{ 
                  color: '#ecf0f1', 
                  textDecoration: 'none',
                  fontSize: '15px'
                }}>
                  Fale Conosco
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Contato */}
          <div>
            <h3 style={{ 
              color: '#f1c40f', 
              marginBottom: '20px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              📞 Contato
            </h3>
            <p style={{ 
              margin: '0 0 15px 0',
              fontSize: '15px',
              lineHeight: '1.8'
            }}>
              <strong>Email:</strong><br />
              contato@goldeningressos.com.br
            </p>
            <p style={{ 
              margin: '0',
              fontSize: '15px',
              lineHeight: '1.8'
            }}>
              <strong>Atendimento:</strong><br />
              Segunda a Sexta<br />
              09:00 - 18:00
            </p>
          </div>

        </div>

        {/* Linha de copyright */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #34495e',
          fontSize: '14px',
          color: '#95a5a6'
        }}>
          <p style={{ margin: 0 }}>
            © 2025 Golden Ingressos. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
