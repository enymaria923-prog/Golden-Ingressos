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

      // Carregar quem o usuário está seguindo com informações dos perfis
      const { data: seguindoData } = await supabase
        .from('seguidores')
        .select(`
          *,
          perfis!seguidores_seguido_id_fkey (
            id,
            nome_completo,
            username,
            foto_perfil_url,
            bio
          )
        `)
        .eq('seguidor_id', userData.id);

      setSeguindo(seguindoData || []);
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
            Seguindo
          </h1>
        </div>

        {/* Lista de quem está seguindo */}
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
                  {/* Foto de perfil */}
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%', 
                    overflow: 'hidden',
                    backgroundColor: '#dbdbdb',
                    flexShrink: 0
                  }}>
                    {seguindoItem.perfis?.foto_perfil_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={seguindoItem.perfis.foto_perfil_url} 
                        alt={seguindoItem.perfis.username || seguindoItem.perfis.nome_completo}
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
                      {seguindoItem.perfis?.username || seguindoItem.perfis?.nome_completo || 'Usuário'}
                    </p>
                    {seguindoItem.perfis?.nome_completo && seguindoItem.perfis?.username && (
                      <p style={{ 
                        margin: '2px 0 0 0', 
                        color: '#8e8e8e', 
                        fontSize: '14px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {seguindoItem.perfis.nome_completo}
                      </p>
                    )}
                    {seguindoItem.perfis?.bio && (
                      <p style={{ 
                        margin: '2px 0 0 0', 
                        color: '#8e8e8e', 
                        fontSize: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {seguindoItem.perfis.bio}
                      </p>
                    )}
                  </div>
                </Link>

                {/* Botão deixar de seguir */}
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
```

## Estrutura de pastas

Crie os arquivos nesta estrutura:
```
app/
├── seguidores/
│   └── page.js
└── seguindo/
    └── page.js
