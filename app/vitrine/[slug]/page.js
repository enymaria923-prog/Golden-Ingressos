'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import './vitrine.css';

export default function VitrinePage() {
  const params = useParams();
  const slug = params.slug;
  const supabase = createClient();

  const [produtor, setProdutor] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [eventosPorCategoria, setEventosPorCategoria] = useState({});
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarVitrine();
  }, [slug]);

  const carregarVitrine = async () => {
    try {
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfil_produtor')
        .select('*')
        .eq('slug', slug)
        .eq('ativo', true)
        .single();

      if (perfilError) {
        setErro('Vitrine não encontrada');
        setLoading(false);
        return;
      }

      setProdutor(perfilData);

      // Registrar visualização
      await supabase.rpc('registrar_visualizacao_vitrine', { perfil_user_id: perfilData.user_id });

      // Buscar categorias
      const { data: categoriasData } = await supabase
        .from('categorias_vitrine')
        .select('*')
        .eq('user_id', perfilData.user_id)
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      setCategorias(categoriasData || []);

      // Buscar eventos da vitrine
      const dataHoje = new Date().toISOString().split('T')[0];
      const { data: eventosVitrineData } = await supabase
        .from('eventos_vitrine')
        .select(`
          id,
          evento_id,
          categoria_id,
          ordem,
          destaque
        `)
        .eq('user_id', perfilData.user_id)
        .eq('visivel_vitrine', true);

      // Buscar dados dos eventos
      const eventosIds = eventosVitrineData?.map(ev => ev.evento_id) || [];
      if (eventosIds.length > 0) {
        const { data: eventosData } = await supabase
          .from('eventos')
          .select('id, nome, data, hora, local, imagem_url, preco_medio, total_ingressos, ingressos_vendidos, status')
          .in('id', eventosIds)
          .eq('status', 'aprovado')
          .gte('data', dataHoje);

        // Organizar por categoria
        const grouped = {};
        (categoriasData || []).forEach(cat => { grouped[cat.id] = []; });
        grouped['sem-categoria'] = [];
        grouped['destaque'] = [];

        eventosVitrineData?.forEach(evVitrine => {
          const evento = eventosData?.find(e => e.id === evVitrine.evento_id);
          if (evento) {
            const eventoCompleto = { ...evento, ordem: evVitrine.ordem, destaque: evVitrine.destaque };
            
            if (evVitrine.destaque) grouped['destaque'].push(eventoCompleto);
            
            if (evVitrine.categoria_id && grouped[evVitrine.categoria_id]) {
              grouped[evVitrine.categoria_id].push(eventoCompleto);
            } else {
              grouped['sem-categoria'].push(eventoCompleto);
            }
          }
        });

        Object.keys(grouped).forEach(key => {
          grouped[key].sort((a, b) => a.ordem - b.ordem);
        });

        setEventosPorCategoria(grouped);
      }

      // Buscar links e filtrar por agendamento
      const { data: linksData } = await supabase
        .from('links_vitrine')
        .select('*')
        .eq('user_id', perfilData.user_id)
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      // Filtrar links por agendamento
      const agora = new Date();
      const linksFiltrados = (linksData || []).filter(link => {
        // Se não tem agendamento, mostra sempre
        if (!link.agendamento_inicio && !link.agendamento_fim) return true;
        
        // Verifica se está dentro do período agendado
        const inicio = link.agendamento_inicio ? new Date(link.agendamento_inicio) : null;
        const fim = link.agendamento_fim ? new Date(link.agendamento_fim) : null;
        
        if (inicio && agora < inicio) return false; // Ainda não começou
        if (fim && agora > fim) return false; // Já terminou
        
        return true; // Está dentro do período
      });

      setLinks(linksFiltrados);

    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro ao carregar vitrine');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (link) => {
    await supabase.rpc('incrementar_clique_link', { link_id: link.id });
    let url = link.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    window.open(url, '_blank');
  };

  const handleEventoClick = (evento) => {
    window.open(`/evento/${evento.id}`, '_blank');
  };

  if (loading) {
    return (
      <div className="vitrine-loading">
        <div className="loading-spinner"></div>
        <p>Carregando vitrine...</p>
      </div>
    );
  }

  if (erro || !produtor) {
    return (
      <div className="vitrine-erro">
        <h1>😕 Vitrine não encontrada</h1>
        <p>{erro || 'Esta vitrine não existe ou foi desativada.'}</p>
        <a href="/" className="btn-voltar">Voltar para Home</a>
      </div>
    );
  }

  // Aplicar estilos personalizados
  const customStyles = {
    '--cor-primaria': produtor.cor_primaria || '#667eea',
    '--cor-secundaria': produtor.cor_secundaria || '#764ba2',
    '--cor-fundo': produtor.cor_fundo || '#f5f7fa',
    '--cor-texto': produtor.cor_texto || '#2c3e50',
    '--fonte-titulo': produtor.fonte_titulo || 'system-ui',
    '--fonte-corpo': produtor.fonte_corpo || 'system-ui'
  };

  return (
    <div className="vitrine-container" data-tema={produtor.tema} style={customStyles}>
      <div className="vitrine-content">
        
        {produtor.foto_capa_url && (
          <div className="vitrine-capa">
            <img src={produtor.foto_capa_url} alt="Capa" />
          </div>
        )}

        <div className="vitrine-perfil">
          <img 
            src={produtor.foto_perfil_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(produtor.nome_exibicao)}&size=200&background=5d34a4&color=fff`}
            alt={produtor.nome_exibicao}
            className="perfil-foto"
          />
          
          <h1 className="perfil-nome">{produtor.nome_exibicao}</h1>
          
          {produtor.bio && <p className="perfil-bio">{produtor.bio}</p>}

          <div className="redes-sociais">
            {produtor.instagram && (
              <a href={`https://instagram.com/${produtor.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="rede-social instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
            {produtor.facebook && (
              <a href={`https://facebook.com/${produtor.facebook}`} target="_blank" rel="noopener noreferrer" className="rede-social facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
            {produtor.youtube && (
              <a href={`https://youtube.com/${produtor.youtube}`} target="_blank" rel="noopener noreferrer" className="rede-social youtube">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Eventos em Destaque */}
        {eventosPorCategoria['destaque']?.length > 0 && (
          <div className="vitrine-secao">
            <h2 className="secao-titulo">⭐ Em Destaque</h2>
            <div className="eventos-grid">
              {eventosPorCategoria['destaque'].map(evento => {
                const disponivel = (evento.total_ingressos || 0) - (evento.ingressos_vendidos || 0);
                return (
                  <div key={evento.id} className="evento-card destaque" onClick={() => handleEventoClick(evento)}>
                    {evento.imagem_url && (
                      <div className="evento-imagem">
                        <img src={evento.imagem_url} alt={evento.nome} />
                        <div className="evento-badge-destaque">⭐ DESTAQUE</div>
                        {disponivel > 0 && <div className="evento-badge">{disponivel} disponíveis</div>}
                      </div>
                    )}
                    <div className="evento-info">
                      <h3>{evento.nome}</h3>
                      <div className="evento-detalhes">
                        <span className="evento-data">📅 {new Date(evento.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                        <span className="evento-hora">🕐 {evento.hora}</span>
                      </div>
                      <div className="evento-local">📍 {evento.local}</div>
                      {evento.preco_medio > 0 && <div className="evento-preco">A partir de R$ {parseFloat(evento.preco_medio).toFixed(2)}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Eventos por Categoria */}
        {categorias.map(categoria => (
          eventosPorCategoria[categoria.id]?.length > 0 && (
            <div key={categoria.id} className="vitrine-secao">
              <h2 className="secao-titulo" style={{ color: categoria.cor }}>
                {categoria.icone} {categoria.nome}
              </h2>
              <div className="eventos-grid">
                {eventosPorCategoria[categoria.id].map(evento => {
                  const disponivel = (evento.total_ingressos || 0) - (evento.ingressos_vendidos || 0);
                  return (
                    <div key={evento.id} className="evento-card" onClick={() => handleEventoClick(evento)}>
                      {evento.imagem_url && (
                        <div className="evento-imagem">
                          <img src={evento.imagem_url} alt={evento.nome} />
                          {disponivel > 0 && <div className="evento-badge">{disponivel} disponíveis</div>}
                        </div>
                      )}
                      <div className="evento-info">
                        <h3>{evento.nome}</h3>
                        <div className="evento-detalhes">
                          <span className="evento-data">📅 {new Date(evento.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                          <span className="evento-hora">🕐 {evento.hora}</span>
                        </div>
                        <div className="evento-local">📍 {evento.local}</div>
                        {evento.preco_medio > 0 && <div className="evento-preco">A partir de R$ {parseFloat(evento.preco_medio).toFixed(2)}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ))}

        {/* Eventos Sem Categoria */}
        {eventosPorCategoria['sem-categoria']?.length > 0 && (
          <div className="vitrine-secao">
            <h2 className="secao-titulo">🎭 Outros Eventos</h2>
            <div className="eventos-grid">
              {eventosPorCategoria['sem-categoria'].map(evento => {
                const disponivel = (evento.total_ingressos || 0) - (evento.ingressos_vendidos || 0);
                return (
                  <div key={evento.id} className="evento-card" onClick={() => handleEventoClick(evento)}>
                    {evento.imagem_url && (
                      <div className="evento-imagem">
                        <img src={evento.imagem_url} alt={evento.nome} />
                        {disponivel > 0 && <div className="evento-badge">{disponivel} disponíveis</div>}
                      </div>
                    )}
                    <div className="evento-info">
                      <h3>{evento.nome}</h3>
                      <div className="evento-detalhes">
                        <span className="evento-data">📅 {new Date(evento.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                        <span className="evento-hora">🕐 {evento.hora}</span>
                      </div>
                      <div className="evento-local">📍 {evento.local}</div>
                      {evento.preco_medio > 0 && <div className="evento-preco">A partir de R$ {parseFloat(evento.preco_medio).toFixed(2)}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Links */}
        {links.length > 0 && (
          <div className="vitrine-secao">
            <h2 className="secao-titulo">🔗 Meus Links</h2>
            <div className="links-lista">
              {links.map(link => (
                <div key={link.id} className="link-card" onClick={() => handleLinkClick(link)}>
                  {link.imagem_url && (
                    <div className="link-imagem">
                      <img src={link.imagem_url} alt={link.titulo} />
                    </div>
                  )}
                  <div className="link-conteudo">
                    <div className="link-icone">{link.icone}</div>
                    <div className="link-texto">
                      <h3>{link.titulo}</h3>
                      {link.descricao && <p>{link.descricao}</p>}
                    </div>
                    <svg className="link-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7V17"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="vitrine-footer">
          <p>Feito com ❤️ por <strong>Golden Ingressos</strong></p>
          <a href="/criar-vitrine" className="criar-vitrine-btn">Crie sua vitrine gratuitamente</a>
        </div>

      </div>
    </div>
  );
}
