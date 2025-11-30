'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BuscarUsuariosPage() {
  const [user, setUser] = useState(null);
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seguindo, setSeguindo] = useState(new Set());
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      const { data: { user: userData } } = await supabase.auth.getUser();
      setUser(userData);
      
      if (userData) {
        carregarSeguindo(userData.id);
      }
    }
    checkUser();
  }, []);

  const carregarSeguindo = async (userId) => {
    const { data } = await supabase
      .from('seguidores')
      .select('seguido_id')
      .eq('seguidor_id', userId);
    
    if (data) {
      setSeguindo(new Set(data.map(s => s.seguido_id)));
    }
  };

  const buscarUsuarios = async (termoBusca) => {
    setLoading(true);
    try {
      console.log('🔍 Buscando por:', termoBusca);
      
      // Buscar TODOS os perfis
      const { data: todosPerfis, error: erroTodos } = await supabase
        .from('perfis')
        .select('id, nome_completo, username, foto_perfil_url, bio, email');

      console.log('📊 Total de perfis no banco:', todosPerfis?.length || 0);
      console.log('📋 Perfis encontrados:', todosPerfis);

      if (erroTodos) {
        console.error('❌ Erro ao buscar perfis:', erroTodos);
        alert('Erro ao buscar: ' + erroTodos.message);
        setResultados([]);
        return;
      }

      if (!todosPerfis || todosPerfis.length === 0) {
        console.log('⚠️ Nenhum perfil encontrado no banco de dados');
        setResultados([]);
        return;
      }

      // Filtrar removendo o próprio usuário (se logado)
      const perfisOutrosUsuarios = user 
        ? todosPerfis.filter(p => p.id !== user.id)
        : todosPerfis;
      
      console.log('👥 Perfis de outros usuários:', perfisOutrosUsuarios.length);

      // Se não tem termo de busca, mostrar todos
      if (!termoBusca || termoBusca.trim() === '') {
        console.log('✅ Mostrando todos os perfis');
        setResultados(perfisOutrosUsuarios);
        return;
      }

      // Filtrar pelo termo de busca
      const termo = termoBusca.toLowerCase().trim();
      const filtrados = perfisOutrosUsuarios.filter(perfil => {
        const matchUsername = perfil.username?.toLowerCase().includes(termo);
        const matchNome = perfil.nome_completo?.toLowerCase().includes(termo);
        const matchEmail = perfil.email?.toLowerCase().includes(termo);
        
        return matchUsername || matchNome || matchEmail;
      });

      console.log('✅ Perfis filtrados:', filtrados.length);
      console.log('📄 Resultados:', filtrados);

      setResultados(filtrados);
    } catch (error) {
      console.error('💥 Erro geral na busca:', error);
      alert('Erro ao buscar usuários: ' + error.message);
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscaChange = (e) => {
    const valor = e.target.value;
    setBusca(valor);
    
    // Debounce: espera 500ms após parar de digitar
    clearTimeout(window.buscaTimeout);
    window.buscaTimeout = setTimeout(() => {
      buscarUsuarios(valor);
    }, 300);
  };

  // Carregar todos os usuários ao abrir a página
  useEffect(() => {
    if (user !== null) { // Espera carregar o user (pode ser null se não logado)
      buscarUsuarios(''); // Busca vazia = todos os usuários
    }
  }, [user]);

  const toggleSeguir = async (perfilId) => {
    try {
      const jaSeguindo = seguindo.has(perfilId);

      if (jaSeguindo) {
        // Deixar de seguir
        const { error } = await supabase
          .from('seguidores')
          .delete()
          .eq('seguidor_id', user.id)
          .eq('seguido_id', perfilId);

        if (error) throw error;

        setSeguindo(prev => {
          const novo = new Set(prev);
          novo.delete(perfilId);
          return novo;
        });
      } else {
        // Seguir
        const { error } = await supabase
          .from('seguidores')
          .insert({
            seguidor_id: user.id,
            seguido_id: perfilId
          });

        if (error) throw error;

        setSeguindo(prev => new Set([...prev, perfilId]));
      }
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error);
      alert('Erro ao processar ação. Tente novamente.');
    }
  };

  if (!user) {
    return <div>Carregando...</div>;
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
            <Link href="/favoritos" style={{ textDecoration: 'none', color: '#262626' }}>⭐ Favoritos</Link>
            <Link href="/perfil" style={{ textDecoration: 'none', color: '#262626' }}>👤 Perfil</Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Barra de busca */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dbdbdb',
          marginBottom: '20px'
        }}>
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <input
              type="text"
              value={busca}
              onChange={handleBuscaChange}
              placeholder="🔍 Buscar usuários por nome, @username ou email..."
              style={{
                width: '100%',
                padding: '12px 45px 12px 15px',
                border: '1px solid #dbdbdb',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none'
              }}
            />
            {loading && (
              <div style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8e8e8e'
              }}>
                ⏳
              </div>
            )}
          </div>
          
          {/* Botão de debug - mostrar todos */}
          <button
            onClick={() => {
              setBusca('');
              buscarUsuarios(' '); // Busca com espaço para forçar a busca
            }}
            style={{
              padding: '8px 15px',
              backgroundColor: '#efefef',
              border: '1px solid #dbdbdb',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              color: '#262626'
            }}
          >
            🔍 Ver todos os usuários
          </button>
        </div>

        {/* Resultados */}
        {resultados.length === 0 && !loading && busca.trim() !== '' ? (
          <div style={{
            backgroundColor: 'white',
            padding: '60px 20px',
            borderRadius: '8px',
            border: '1px solid #dbdbdb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>😕</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#262626', fontWeight: '600' }}>
              Nenhum resultado encontrado
            </h3>
            <p style={{ margin: 0, color: '#8e8e8e' }}>
              Tente buscar por outro termo
            </p>
          </div>
        ) : resultados.length === 0 && !loading && busca.trim() === '' ? (
          <div style={{
            backgroundColor: 'white',
            padding: '60px 20px',
            borderRadius: '8px',
            border: '1px solid #dbdbdb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>👥</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#262626', fontWeight: '600' }}>
              Carregando usuários...
            </h3>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #dbdbdb',
            overflow: 'hidden'
          }}>
            {resultados.map((perfil, index) => (
              <div 
                key={perfil.id}
                style={{
                  padding: '15px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  borderBottom: index < resultados.length - 1 ? '1px solid #efefef' : 'none'
                }}
              >
                {/* Foto de perfil */}
                <Link href={`/perfil/${perfil.username || perfil.id}`}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid #dbdbdb',
                    backgroundColor: '#fafafa',
                    cursor: 'pointer'
                  }}>
                    {perfil.foto_perfil_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={perfil.foto_perfil_url}
                        alt={perfil.username || perfil.nome_completo}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        color: '#8e8e8e'
                      }}>
                        👤
                      </div>
                    )}
                  </div>
                </Link>

                {/* Informações */}
                <div style={{ flex: 1 }}>
                  <Link 
                    href={perfil.username ? `/perfil/${perfil.username}` : `/perfil-id/${perfil.id}`}
                    style={{ textDecoration: 'none', color: '#262626' }}
                  >
                    <p style={{ margin: '0 0 3px 0', fontWeight: '600', fontSize: '14px' }}>
                      {perfil.username || perfil.nome_completo || 'Usuário'}
                    </p>
                    <p style={{ margin: 0, color: '#8e8e8e', fontSize: '14px' }}>
                      {perfil.nome_completo}
                    </p>
                    {perfil.bio && (
                      <p style={{ 
                        margin: '5px 0 0 0', 
                        color: '#8e8e8e', 
                        fontSize: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {perfil.bio}
                      </p>
                    )}
                  </Link>
                </div>

                {/* Botão seguir */}
                <button
                  onClick={() => toggleSeguir(perfil.id)}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: seguindo.has(perfil.id) ? '#efefef' : '#0095f6',
                    color: seguindo.has(perfil.id) ? '#262626' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {seguindo.has(perfil.id) ? 'Seguindo' : 'Seguir'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
