'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function VerPerfilPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [userLogado, setUserLogado] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [posts, setPosts] = useState([]);
  const [seguidores, setSeguidores] = useState(0);
  const [seguindo, setSeguindo] = useState(0);
  const [estaSeguindo, setEstaSeguindo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postSelecionado, setPostSelecionado] = useState(null);

  useEffect(() => {
    loadPerfil();
  }, [params.username]);

  const loadPerfil = async () => {
    try {
      // Verificar usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      setUserLogado(user);

      // Buscar perfil pelo username
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfis')
        .select('*')
        .eq('username', params.username)
        .single();

      if (perfilError || !perfilData) {
        alert('Perfil não encontrado');
        router.push('/buscar-usuarios');
        return;
      }

      setPerfil(perfilData);

      // Se for o próprio perfil, redirecionar
      if (user && perfilData.id === user.id) {
        router.push('/perfil');
        return;
      }

      // Carregar posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', perfilData.id)
        .order('created_at', { ascending: false });
      
      setPosts(postsData || []);

      // Contar seguidores
      const { count: seguidoresCount } = await supabase
        .from('seguidores')
        .select('*', { count: 'exact', head: true })
        .eq('seguido_id', perfilData.id);
      
      setSeguidores(seguidoresCount || 0);

      // Contar seguindo
      const { count: seguindoCount } = await supabase
        .from('seguidores')
        .select('*', { count: 'exact', head: true })
        .eq('seguidor_id', perfilData.id);
      
      setSeguindo(seguindoCount || 0);

      // Verificar se está seguindo
      if (user) {
        const { data: segueData } = await supabase
          .from('seguidores')
          .select('id')
          .eq('seguidor_id', user.id)
          .eq('seguido_id', perfilData.id)
          .single();
        
        setEstaSeguindo(!!segueData);
      }

    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeguir = async () => {
    if (!userLogado) {
      alert('Você precisa estar logado para seguir usuários');
      router.push('/login');
      return;
    }

    try {
      if (estaSeguindo) {
        await supabase
          .from('seguidores')
          .delete()
          .eq('seguidor_id', userLogado.id)
          .eq('seguido_id', perfil.id);
        
        setEstaSeguindo(false);
        setSeguidores(prev => prev - 1);
      } else {
        await supabase
          .from('seguidores')
          .insert({
            seguidor_id: userLogado.id,
            seguido_id: perfil.id
          });
        
        setEstaSeguindo(true);
        setSeguidores(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error);
      alert('Erro ao processar ação');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Perfil não encontrado</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #dbdbdb',
        padding: '15px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '935px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: '#262626' }}>
            Golden Ingressos
          </Link>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: '#262626' }}>🏠 Início</Link>
            <Link href="/buscar-usuarios" style={{ textDecoration: 'none', color: '#262626' }}>🔍 Buscar</Link>
            <Link href="/perfil" style={{ textDecoration: 'none', color: '#262626' }}>👤 Meu Perfil</Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '935px', margin: '60px auto 0', padding: '30px 20px' }}>
        
        {/* Seção do perfil */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #dbdbdb' }}>
          <div style={{ display: 'flex', gap: '80px', marginBottom: '30px' }}>
            
            {/* Foto de perfil */}
            <div>
              <div style={{ 
                width: '150px', 
                height: '150px', 
                borderRadius: '50%', 
                overflow: 'hidden',
                border: '3px solid #dbdbdb',
                backgroundColor: '#fafafa'
              }}>
                {perfil.foto_perfil_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={perfil.foto_perfil_url} 
                    alt="Foto de perfil" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '60px',
                    color: '#8e8e8e'
                  }}>
                    👤
                  </div>
                )}
              </div>
            </div>

            {/* Informações */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '300' }}>
                  {perfil.username || perfil.nome_completo}
                </h2>
                
                {userLogado && (
                  <button 
                    onClick={toggleSeguir}
                    style={{
                      padding: '8px 30px',
                      backgroundColor: estaSeguindo ? '#efefef' : '#0095f6',
                      color: estaSeguindo ? '#262626' : 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {estaSeguindo ? 'Seguindo' : 'Seguir'}
                  </button>
                )}
              </div>

              {/* Estatísticas */}
              <div style={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
                <div>
                  <strong style={{ fontSize: '16px' }}>{posts.length}</strong>
                  <span style={{ marginLeft: '5px', color: '#8e8e8e' }}>publicações</span>
                </div>
                <div>
                  <strong style={{ fontSize: '16px' }}>{seguidores}</strong>
                  <span style={{ marginLeft: '5px', color: '#8e8e8e' }}>seguidores</span>
                </div>
                <div>
                  <strong style={{ fontSize: '16px' }}>{seguindo}</strong>
                  <span style={{ marginLeft: '5px', color: '#8e8e8e' }}>seguindo</span>
                </div>
              </div>

              {/* Nome e bio */}
              <div>
                <p style={{ margin: '0 0 5px 0', fontWeight: '600', fontSize: '16px' }}>
                  {perfil.nome_completo}
                </p>
                {perfil.bio && (
                  <p style={{ margin: '5px 0', color: '#262626', whiteSpace: 'pre-wrap' }}>
                    {perfil.bio}
                  </p>
                )}
                {perfil.localizacao && (
                  <p style={{ margin: '5px 0 0 0', color: '#8e8e8e', fontSize: '14px' }}>
                    📍 {perfil.localizacao}
                  </p>
                )}
                {perfil.email && (
                  <p style={{ margin: '5px 0 0 0', color: '#8e8e8e', fontSize: '14px' }}>
                    📧 {perfil.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grid de posts */}
        <div style={{ 
          borderTop: '1px solid #dbdbdb',
          paddingTop: '30px',
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '28px'
        }}>
          {posts.length > 0 ? (
            posts.map(post => (
              <div 
                key={post.id}
                onClick={() => setPostSelecionado(post)}
                style={{ 
                  aspectRatio: '1/1',
                  backgroundColor: '#efefef',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={post.imagem_url} 
                  alt={post.legenda || 'Post'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))
          ) : (
            <div style={{ 
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              color: '#8e8e8e'
            }}>
              <p style={{ fontSize: '40px', margin: '0 0 20px 0' }}>📷</p>
              <p style={{ fontSize: '28px', fontWeight: '300', margin: '0 0 10px 0' }}>
                Nenhuma publicação
              </p>
            </div>
          )}
        </div>

        {/* Modal do Post */}
        {postSelecionado && (
          <div 
            onClick={() => setPostSelecionado(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                maxWidth: '1000px',
                width: '100%',
                maxHeight: '90vh',
                display: 'flex',
                overflow: 'hidden'
              }}
            >
              <div style={{ flex: '1 1 60%', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={postSelecionado.imagem_url} 
                  alt={postSelecionado.legenda || 'Post'}
                  style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }}
                />
              </div>

              <div style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', maxWidth: '400px' }}>
                <div style={{ padding: '15px', borderBottom: '1px solid #efefef', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dbdbdb', overflow: 'hidden' }}>
                      {perfil.foto_perfil_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={perfil.foto_perfil_url} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👤</div>
                      )}
                    </div>
                    <strong style={{ fontSize: '14px' }}>{perfil.username || perfil.nome_completo}</strong>
                  </div>
                  <button 
                    onClick={() => setPostSelecionado(null)}
                    style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#8e8e8e' }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ padding: '15px', flex: 1, overflowY: 'auto' }}>
                  {postSelecionado.legenda && (
                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        <strong style={{ marginRight: '5px' }}>{perfil.username || perfil.nome_completo}</strong>
                        {postSelecionado.legenda}
                      </p>
                    </div>
                  )}
                  {postSelecionado.localizacao && (
                    <p style={{ margin: '10px 0 0 0', color: '#8e8e8e', fontSize: '12px' }}>
                      📍 {postSelecionado.localizacao}
                    </p>
                  )}
                  <p style={{ margin: '15px 0 0 0', color: '#8e8e8e', fontSize: '12px' }}>
                    {new Date(postSelecionado.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
