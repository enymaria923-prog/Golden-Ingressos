'use client';

import { createClient } from '../../utils/supabase/client';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function SeguidoresPage() {
  const [user, setUser] = useState(null);
  const [seguidores, setSeguidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seguindoIds, setSeguindoIds] = useState(new Set());

  useEffect(() => {
    async function loadSeguidores() {
      const supabase = createClient();
      
      const { data: { user: userData } } = await supabase.auth.getUser();
      if (!userData) {
        redirect('/login');
        return;
      }
      setUser(userData);

      // Carregar seguidores com informações dos perfis
      const { data: seguidoresData } = await supabase
        .from('seguidores')
        .select(`
          *,
          perfis!seguidores_seguidor_id_fkey (
            id,
            nome_completo,
            username,
            foto_perfil_url,
            bio
          )
        `)
        .eq('seguido_id', userData.id);

      setSeguidores(seguidoresData || []);

      // Carregar IDs de quem o usuário está seguindo
      const { data: seguindoData } = await supabase
        .from('seguidores')
        .select('seguido_id')
        .eq('seguidor_id', userData.id);

      const ids = new Set(seguindoData?.map(s => s.seguido_id) || []);
      setSeguindoIds(ids);

      setLoading(false);
    }

    loadSeguidores();
  }, []);

  const toggleSeguir = async (perfilId) => {
    try {
      const supabase = createClient();
      const estaSeguindo = seguindoIds.has(perfilId);

      if (estaSeguindo) {
        // Deixar de seguir
        await supabase
          .from('seguidores')
          .delete()
          .eq('seguidor_id', user.id)
          .eq('seguido_id', perfilId);

        setSeguindoIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(perfilId);
          return newSet;
        });
      } else {
        // Seguir
        await supabase
          .from('seguidores')
          .insert({
            seguidor_id: user.id,
            seguido_id: perfilId
          });

        setSeguindoIds(prev => new Set(prev).add(perfilId));
      }
    } catch (error) {
      console.error('Erro ao atualizar seguidor:', error);
      alert('Erro ao atualizar. Tente novamente.');
    }
  };

  const removerSeguidor = async (seguidorId) => {
    if (!confirm('Tem certeza que deseja remover este seguidor?')) {
      return;
    }

    try {
      const supabase = createClient();
      await supabase
        .from('seguidores')
        .delete()
        .eq('seguidor_id', seguidorId)
        .eq('seguido_id', user.id);

      setSeguidores(prev => prev.filter(s => s.seguidor_id !== seguidorId));
    } catch (error) {
      console.error('Erro ao remover seguidor:', error);
      alert('Erro ao remover seguidor.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Carregando seguidores...</p>
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
            <Link href="/perfil" style={{ textDecoration: 'none', color: '#262626' }}>👤 Perfil</Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '600px', margin: '60px auto 0', padding: '30px 20px' }}>
        
        {/* Cabeçalho da página */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #dbdbdb',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <Link href="/perfil" style={{ textDecoration: 'none', color: '#262626', fontSize: '24px' }}>
            ←
          </Link>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
            Seguidores
          </h1>
        </div>

        {/* Lista de seguidores */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dbdbdb' }}>
          {seguidores.length > 0 ? (
            seguidores.map(seguidor => (
              <div 
                key={seguidor.id}
                style={{ 
                  padding: '15px 20px',
                  borderBottom: '1px solid #efefef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Link 
                  href={`/perfil/${seguidor.seguidor_id}`}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '15px',
                    textDecoration: 'none',
                    color: '#262626',
                    flex: 1
                  }}
                >
                  {/* Foto de perfil */}
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%', 
                    overflow: 'hidden',
                    backgroundColor: '#dbdbdb',
                    flexShrink: 0
                  }}>
                    {seguidor.perfis?.foto_perfil_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={seguidor.perfis.foto_perfil_url} 
                        alt={seguidor.perfis.username || seguidor.perfis.nome_completo}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        👤
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      margin: 0, 
                      fontWeight: '600', 
                      fontSize: '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {seguidor.perfis?.username || seguidor.perfis?.nome_completo || 'Usuário'}
                    </p>
                    {seguidor.perfis?.nome_completo && seguidor.perfis?.username && (
                      <p style={{ 
                        margin: '2px 0 0 0', 
                        color: '#8e8e8e', 
                        fontSize: '14px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {seguidor.perfis.nome_completo}
                      </p>
                    )}
                    {seguidor.perfis?.bio && (
                      <p style={{ 
                        margin: '2px 0 0 0', 
                        color: '#8e8e8e', 
                        fontSize: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {seguidor.perfis.bio}
                      </p>
                    )}
                  </div>
                </Link>

                {/* Botões de ação */}
                <div style={{ display: 'flex', gap: '10px', marginLeft: '10px' }}>
                  {seguidor.seguidor_id !== user?.id && (
                    <button
                      onClick={() => toggleSeguir(seguidor.seguidor_id)}
                      style={{
                        padding: '7px 16px',
                        backgroundColor: seguindoIds.has(seguidor.seguidor_id) ? '#efefef' : '#0095f6',
                        color: seguindoIds.has(seguidor.seguidor_id) ? '#262626' : 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {seguindoIds.has(seguidor.seguidor_id) ? 'Seguindo' : 'Seguir'}
                    </button>
                  )}
                  <button
                    onClick={() => removerSeguidor(seguidor.seguidor_id)}
                    style={{
                      padding: '7px 16px',
                      backgroundColor: '#efefef',
                      color: '#262626',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              padding: '60px 20px',
              textAlign: 'center',
              color: '#8e8e8e'
            }}>
              <p style={{ fontSize: '40px', margin: '0 0 20px 0' }}>👥</p>
              <p style={{ fontSize: '22px', fontWeight: '300', margin: '0 0 10px 0' }}>
                Nenhum seguidor ainda
              </p>
              <p style={{ fontSize: '14px', margin: 0 }}>
                Quando alguém te seguir, aparecerá aqui
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
