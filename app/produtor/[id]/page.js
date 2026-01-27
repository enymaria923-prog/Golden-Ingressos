'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';


export default function ProdutorPage() {
  const params = useParams();
  const produtorId = params.id;
  const supabase = createClient();

  const [produtor, setProdutor] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('eventos');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [postSelecionado, setPostSelecionado] = useState(null);

  useEffect(() => {
    carregarProdutor();
  }, [produtorId]);

  const carregarProdutor = async () => {
    try {
      // Buscar informações do produtor
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfil_produtor')
        .select('*')
        .eq('user_id', produtorId)
        .eq('ativo', true)
        .single();

      if (perfilError || !perfilData) {
        setErro('Produtor não encontrado');
        setLoading(false);
        return;
      }

      setProdutor(perfilData);

      // Buscar eventos do produtor
      const dataHoje = new Date().toISOString().split('T')[0];
      const { data: eventosData } = await supabase
        .from('eventos')
        .select('id, nome, data, hora, local, imagem_url, preco_medio, total_ingressos, ingressos_vendidos, status')
        .eq('user_id', produtorId)
        .eq('status', 'aprovado')
        .gte('data', dataHoje)
        .order('data', { ascending: true });

      setEventos(eventosData || []);

      // Buscar posts do produtor
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', produtorId)
        .order('created_at', { ascending: false });

      setPosts(postsData || []);

    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro ao carregar perfil do produtor');
    } finally {
      setLoading(false);
    }
  };

  const handleEventoClick = (evento) => {
    window.open(`/evento/${evento.id}`, '_blank');
  };

  const abrirPost = (post) => {
    setPostSelecionado(post);
  };

  const fecharPost = () => {
    setPostSelecionado(null);
  };

  if (loading) {
    return (
      <div className="produtor-loading">
        <div className="loading-spinner"></div>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  if (erro || !produtor) {
    return (
      <div className="produtor-erro">
        <h1>😕 Produtor não encontrado</h1>
        <p>{erro || 'Este produtor não existe ou foi desativado.'}</p>
        <a href="/" className="btn-voltar">Voltar para Home</a>
      </div>
    );
  }

  const totalEventos = eventos.length;
  const totalPosts = posts.length;

  return (
    <div className="produtor-container">
      <div className="produtor-content">
        
        {/* Header do Perfil */}
        <header className="produtor-header">
          <div className="header-foto">
            <img 
              src={produtor.foto_perfil_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(produtor.nome_exibicao)}&size=200&background=5d34a4&color=fff`}
              alt={produtor.nome_exibicao}
            />
          </div>
          
          <div className="header-info">
            <div className="info-top">
              <h1 className="produtor-username">{produtor.nome_exibicao}</h1>
              {produtor.slug && (
                <a 
                  href={`/vitrine/${produtor.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-vitrine"
                >
                  Ver Vitrine
                </a>
              )}
            </div>
            
            <div className="info-stats">
              <div className="stat">
                <span className="stat-numero">{totalEventos}</span>
                <span className="stat-label">eventos</span>
              </div>
              <div className="stat">
                <span className="stat-numero">{totalPosts}</span>
                <span className="stat-label">publicações</span>
              </div>
            </div>
            
            {produtor.bio && (
              <div className="info-bio">
                <p>{produtor.bio}</p>
              </div>
            )}

            {/* Redes Sociais */}
            {(produtor.instagram || produtor.facebook || produtor.youtube) && (
              <div className="info-redes">
                {produtor.instagram && (
                  <a 
                    href={`https://instagram.com/${produtor.instagram.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="rede-link instagram"
                    title="Instagram"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    {produtor.instagram}
                  </a>
                )}
                {produtor.facebook && (
                  <a 
                    href={`https://facebook.com/${produtor.facebook}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="rede-link facebook"
                    title="Facebook"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                )}
                {produtor.youtube && (
                  <a 
                    href={`https://youtube.com/${produtor.youtube}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="rede-link youtube"
                    title="YouTube"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    YouTube
                  </a>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Abas de Navegação */}
        <div className="produtor-tabs">
          <button 
            className={`tab ${abaAtiva === 'eventos' ? 'ativa' : ''}`}
            onClick={() => setAbaAtiva('eventos')}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
            EVENTOS
          </button>
          <button 
            className={`tab ${abaAtiva === 'posts' ? 'ativa' : ''}`}
            onClick={() => setAbaAtiva('posts')}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z"/>
            </svg>
            PUBLICAÇÕES
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="produtor-conteudo">
          
          {/* Aba de Eventos */}
          {abaAtiva === 'eventos' && (
            <div className="eventos-container">
              {eventos.length === 0 ? (
                <div className="vazio">
                  <div className="vazio-icone">📅</div>
                  <h3>Nenhum evento próximo</h3>
                  <p>Este produtor não tem eventos futuros no momento.</p>
                </div>
              ) : (
                <div className="eventos-grid">
                  {eventos.map(evento => {
                    const disponivel = (evento.total_ingressos || 0) - (evento.ingressos_vendidos || 0);
                    return (
                      <div 
                        key={evento.id} 
                        className="evento-card"
                        onClick={() => handleEventoClick(evento)}
                      >
                        {evento.imagem_url && (
                          <div className="evento-imagem">
                            <img src={evento.imagem_url} alt={evento.nome} />
                            <div className="evento-overlay">
                              <div className="overlay-info">
                                <span className="overlay-data">
                                  {new Date(evento.data).toLocaleDateString('pt-BR', { 
                                    day: '2-digit', 
                                    month: 'short' 
                                  })}
                                </span>
                                {disponivel > 0 && (
                                  <span className="overlay-disponivel">
                                    {disponivel} ingressos
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="evento-detalhes">
                          <h3 className="evento-nome">{evento.nome}</h3>
                          <div className="evento-info-linha">
                            <span className="info-item">
                              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                              </svg>
                              {evento.hora}
                            </span>
                            <span className="info-item">
                              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                              </svg>
                              {evento.local}
                            </span>
                          </div>
                          {evento.preco_medio > 0 && (
                            <div className="evento-preco">
                              A partir de R$ {parseFloat(evento.preco_medio).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Aba de Posts */}
          {abaAtiva === 'posts' && (
            <div className="posts-container">
              {posts.length === 0 ? (
                <div className="vazio">
                  <div className="vazio-icone">📷</div>
                  <h3>Nenhuma publicação</h3>
                  <p>Este produtor ainda não fez nenhuma publicação.</p>
                </div>
              ) : (
                <div className="posts-grid">
                  {posts.map(post => (
                    <div 
                      key={post.id} 
                      className="post-item"
                      onClick={() => abrirPost(post)}
                    >
                      <img src={post.imagem_url} alt={post.legenda || 'Post'} />
                      <div className="post-overlay">
                        <div className="post-overlay-info">
                          {post.legenda && (
                            <span className="overlay-legenda">
                              {post.legenda.length > 100 
                                ? post.legenda.substring(0, 100) + '...' 
                                : post.legenda
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Modal de Post */}
      {postSelecionado && (
        <div className="modal-overlay" onClick={fecharPost}>
          <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
            <button className="modal-fechar" onClick={fecharPost}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            
            <div className="modal-grid">
              <div className="modal-imagem">
                <img src={postSelecionado.imagem_url} alt={postSelecionado.legenda || 'Post'} />
              </div>
              
              <div className="modal-info">
                <div className="modal-header">
                  <img 
                    src={produtor.foto_perfil_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(produtor.nome_exibicao)}&size=40&background=5d34a4&color=fff`}
                    alt={produtor.nome_exibicao}
                    className="modal-avatar"
                  />
                  <div className="modal-usuario">
                    <strong>{produtor.nome_exibicao}</strong>
                    {postSelecionado.localizacao && (
                      <span className="modal-localizacao">{postSelecionado.localizacao}</span>
                    )}
                  </div>
                </div>
                
                <div className="modal-legenda">
                  {postSelecionado.legenda ? (
                    <p>{postSelecionado.legenda}</p>
                  ) : (
                    <p className="sem-legenda">Sem legenda</p>
                  )}
                </div>
                
                <div className="modal-data">
                  {new Date(postSelecionado.created_at).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
