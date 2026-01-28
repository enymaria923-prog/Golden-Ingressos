'use client';

import { createClient } from '../../utils/supabase/client';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function SeguindoPage() {
  const [user, setUser] = useState(null);
  const [seguindo, setSeguindo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeguindo() {
      const supabase = createClient();
      
      const { data: { user: userData } } = await supabase.auth.getUser();
      if (!userData) {
        redirect('/login');
        return;
      }
      setUser(userData);

      // Buscar quem está seguindo
      const { data: seguindoData, error: segError } = await supabase
        .from('seguidores')
        .select('*')
        .eq('seguidor_id', userData.id);

      console.log('Seguindo data:', seguindoData);
      console.log('Seguindo error:', segError);

      if (seguindoData && seguindoData.length > 0) {
        // Buscar perfis de quem está seguindo
        const seguidoIds = seguindoData.map(s => s.seguido_id);
        const { data: perfisData } = await supabase
          .from('perfis')
          .select('*')
          .in('id', seguidoIds);

        // Combinar dados
        const seguindoComPerfis = seguindoData.map(seg => ({
          ...seg,
          perfil: perfisData?.find(p => p.id === seg.seguido_id)
        }));

        setSeguindo(seguindoComPerfis);
      }

      setLoading(false);
    }

    loadSeguindo();
  }, []);

  const deixarDeSeguir = async (seguidoId) => {
    if (!confirm('Tem certeza que deseja deixar de seguir?')) {
      return;
    }

    try {
      const supabase = createClient();
      await supabase
        .from('seguidores')
        .delete()
        .eq('seguidor_id', user.id)
        .eq('seguido_id', seguidoId);

      setSeguindo(prev => prev.filter(s => s.seguido_id !== seguidoId));
    } catch (error) {
      console.error('Erro ao deixar de seguir:', error);
      alert('Erro ao deixar de seguir.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      
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
            Seguindo
          </h1>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dbdbdb' }}>
          {seguindo.length > 0 ? (
            seguindo.map(seguindoItem => (
              <div 
                key={seguindoItem.id}
                style={{ 
                  padding: '15px 20px',
                  borderBottom: '1px solid #efefef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Link 
                  href={`/perfil/${seguindoItem.seguido_id}`}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '15px',
                    textDecoration: 'none',
                    color: '#262626',
                    flex: 1
                  }}
                >
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%', 
                    overflow: 'hidden',
                    backgroundColor: '#dbdbdb',
                    flexShrink: 0
                  }}>
                    {seguindoItem.perfil?.foto_perfil_url ? (
                      <img 
                        src={seguindoItem.perfil.foto_perfil_url} 
                        alt={seguindoItem.perfil.username || seguindoItem.perfil.nome_completo}
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

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ 
                      margin: 0, 
                      fontWeight: '600', 
                      fontSize: '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {seguindoItem.perfil?.username || seguindoItem.perfil?.nome_completo || 'Usuário'}
                    </p>
                    {seguindoItem.perfil?.nome_completo && seguindoItem.perfil?.username && (
                      <p style={{ 
                        margin: '2px 0 0 0', 
                        color: '#8e8e8e', 
                        fontSize: '14px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {seguindoItem.perfil.nome_completo}
                      </p>
                    )}
                    {seguindoItem.perfil?.bio && (
                      <p style={{ 
                        margin: '2px 0 0 0', 
                        color: '#8e8e8e', 
                        fontSize: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {seguindoItem.perfil.bio}
                      </p>
                    )}
                  </div>
                </Link>

                <button
                  onClick={() => deixarDeSeguir(seguindoItem.seguido_id)}
                  style={{
                    padding: '7px 16px',
                    backgroundColor: '#efefef',
                    color: '#262626',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginLeft: '10px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Seguindo
                </button>
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
                Você não está seguindo ninguém
              </p>
              <p style={{ fontSize: '14px', margin: '0 0 20px 0' }}>
                Comece a seguir pessoas para ver suas publicações
              </p>
              <Link 
                href="/buscar-usuarios"
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  backgroundColor: '#0095f6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Buscar pessoas
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
