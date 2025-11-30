'use client';

import { createClient } from '../../utils/supabase/client';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PerfilPage() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [seguidores, setSeguidores] = useState(0);
  const [seguindo, setSeguindo] = useState(0);
  const [formData, setFormData] = useState({
    nome_completo: '',
    username: '',
    bio: '',
    telefone: '',
    data_nascimento: '',
    localizacao: '',
    perfil_publico: true,
    foto_perfil_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'seguidores', 'seguindo'

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient();
      
      const { data: { user: userData } } = await supabase.auth.getUser();
      if (!userData) {
        redirect('/login');
        return;
      }
      setUser(userData);

      // Carregar perfil
      const { data: perfilData } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userData.id)
        .single();

      setPerfil(perfilData);
      
      if (perfilData) {
        setFormData({
          nome_completo: perfilData.nome_completo || '',
          username: perfilData.username || '',
          bio: perfilData.bio || '',
          telefone: perfilData.telefone || '',
          data_nascimento: perfilData.data_nascimento || '',
          localizacao: perfilData.localizacao || '',
          perfil_publico: perfilData.perfil_publico ?? true,
          foto_perfil_url: perfilData.foto_perfil_url || ''
        });
      }

      // Carregar posts do usuário
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });
      
      setPosts(postsData || []);

      // Contar seguidores
      const { count: seguidoresCount } = await supabase
        .from('seguidores')
        .select('*', { count: 'exact', head: true })
        .eq('seguido_id', userData.id);
      
      setSeguidores(seguidoresCount || 0);

      // Contar seguindo
      const { count: seguindoCount } = await supabase
        .from('seguidores')
        .select('*', { count: 'exact', head: true })
        .eq('seguidor_id', userData.id);
      
      setSeguindo(seguindoCount || 0);
      
      setLoading(false);
    }

    loadUserData();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `perfis/${fileName}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('fotos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('fotos')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        foto_perfil_url: publicUrl
      }));

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Preparar dados, removendo campos vazios que causam erro
      const dadosParaSalvar = {
        id: user.id,
        nome_completo: formData.nome_completo || null,
        username: formData.username || null,
        bio: formData.bio || null,
        telefone: formData.telefone || null,
        localizacao: formData.localizacao || null,
        perfil_publico: formData.perfil_publico,
        foto_perfil_url: formData.foto_perfil_url || null,
        updated_at: new Date().toISOString()
      };

      // Só adicionar data_nascimento se tiver valor
      if (formData.data_nascimento && formData.data_nascimento.trim() !== '') {
        dadosParaSalvar.data_nascimento = formData.data_nascimento;
      }
      
      const { error } = await supabase
        .from('perfis')
        .upsert(dadosParaSalvar);

      if (error) throw error;

      setPerfil(formData);
      setIsEditing(false);
      alert('Perfil atualizado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar as alterações: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (perfil) {
      setFormData({
        nome_completo: perfil.nome_completo || '',
        username: perfil.username || '',
        bio: perfil.bio || '',
        telefone: perfil.telefone || '',
        data_nascimento: perfil.data_nascimento || '',
        localizacao: perfil.localizacao || '',
        perfil_publico: perfil.perfil_publico ?? true,
        foto_perfil_url: perfil.foto_perfil_url || ''
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      
      {/* Header fixo estilo Instagram */}
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
            <Link href="/favoritos" style={{ textDecoration: 'none', color: '#262626' }}>⭐ Favoritos</Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '935px', margin: '60px auto 0', padding: '30px 20px' }}>
        
        {/* Seção do perfil */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #dbdbdb' }}>
          <div style={{ display: 'flex', gap: '80px', marginBottom: '30px' }}>
            
            {/* Foto de perfil */}
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: '150px', 
                height: '150px', 
                borderRadius: '50%', 
                overflow: 'hidden',
                border: '3px solid #dbdbdb',
                backgroundColor: '#fafafa'
              }}>
                {formData.foto_perfil_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={formData.foto_perfil_url} 
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
              
              {isEditing && (
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                  <label style={{ 
                    cursor: 'pointer',
                    color: '#0095f6',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {uploadingPhoto ? 'Enviando...' : 'Alterar foto'}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Informações do perfil */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="@username"
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #dbdbdb', 
                      borderRadius: '4px',
                      fontSize: '20px',
                      flex: 1
                    }}
                  />
                ) : (
                  <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '300' }}>
                    {perfil?.username || perfil?.nome_completo || 'Usuário'}
                  </h2>
                )}
                
                <button 
                  onClick={isEditing ? handleSave : handleEditToggle}
                  disabled={loading}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: isEditing ? '#0095f6' : '#efefef',
                    color: isEditing ? 'white' : '#262626',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {isEditing ? (loading ? 'Salvando...' : 'Salvar') : 'Editar perfil'}
                </button>

                {isEditing && (
                  <button 
                    onClick={handleCancel}
                    disabled={loading}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: '#efefef',
                      color: '#262626',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {/* Estatísticas */}
              <div style={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
                <div>
                  <strong style={{ fontSize: '16px' }}>{posts.length}</strong>
                  <span style={{ marginLeft: '5px', color: '#8e8e8e' }}>publicações</span>
                </div>
                <Link href="/seguidores" style={{ textDecoration: 'none', color: '#262626' }}>
                  <strong style={{ fontSize: '16px' }}>{seguidores}</strong>
                  <span style={{ marginLeft: '5px', color: '#8e8e8e' }}>seguidores</span>
                </Link>
                <Link href="/seguindo" style={{ textDecoration: 'none', color: '#262626' }}>
                  <strong style={{ fontSize: '16px' }}>{seguindo}</strong>
                  <span style={{ marginLeft: '5px', color: '#8e8e8e' }}>seguindo</span>
                </Link>
              </div>

              {/* Nome e bio */}
              <div>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="nome_completo"
                      value={formData.nome_completo}
                      onChange={handleInputChange}
                      placeholder="Nome completo"
                      style={{ 
                        padding: '8px 12px', 
                        border: '1px solid #dbdbdb', 
                        borderRadius: '4px',
                        width: '100%',
                        marginBottom: '10px'
                      }}
                    />
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Escreva uma bio..."
                      rows={3}
                      style={{ 
                        padding: '8px 12px', 
                        border: '1px solid #dbdbdb', 
                        borderRadius: '4px',
                        width: '100%',
                        marginBottom: '10px',
                        resize: 'vertical'
                      }}
                    />
                    <input
                      type="text"
                      name="localizacao"
                      value={formData.localizacao}
                      onChange={handleInputChange}
                      placeholder="📍 Localização"
                      style={{ 
                        padding: '8px 12px', 
                        border: '1px solid #dbdbdb', 
                        borderRadius: '4px',
                        width: '100%',
                        marginBottom: '10px'
                      }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                      <input
                        type="checkbox"
                        name="perfil_publico"
                        checked={formData.perfil_publico}
                        onChange={handleInputChange}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '14px', color: '#262626' }}>
                        {formData.perfil_publico ? '🌐 Perfil público' : '🔒 Perfil privado'}
                      </span>
                    </label>
                  </>
                ) : (
                  <>
                    <p style={{ margin: '0 0 5px 0', fontWeight: '600', fontSize: '16px' }}>
                      {perfil?.nome_completo}
                    </p>
                    {perfil?.bio && (
                      <p style={{ margin: '0 0 5px 0', color: '#262626', whiteSpace: 'pre-wrap' }}>
                        {perfil.bio}
                      </p>
                    )}
                    {perfil?.localizacao && (
                      <p style={{ margin: '5px 0 0 0', color: '#8e8e8e', fontSize: '14px' }}>
                        📍 {perfil.localizacao}
                      </p>
                    )}
                    <p style={{ margin: '10px 0 0 0', color: '#8e8e8e', fontSize: '14px' }}>
                      {perfil?.perfil_publico ? '🌐 Perfil público' : '🔒 Perfil privado'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div style={{ 
          borderTop: '1px solid #dbdbdb',
          display: 'flex',
          justifyContent: 'center',
          gap: '60px',
          marginBottom: '30px',
          backgroundColor: 'white'
        }}>
          <button
            onClick={() => setActiveTab('posts')}
            style={{
              padding: '15px 0',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderTop: activeTab === 'posts' ? '2px solid #262626' : '2px solid transparent',
              color: activeTab === 'posts' ? '#262626' : '#8e8e8e',
              fontWeight: '600',
              fontSize: '14px',
              marginTop: '-1px'
            }}
          >
            📷 PUBLICAÇÕES
          </button>
        </div>

        {/* Grid de posts */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '28px'
        }}>
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} style={{ 
                aspectRatio: '1/1',
                backgroundColor: '#efefef',
                borderRadius: '4px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative'
              }}>
                {post.imagem_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={post.imagem_url} 
                    alt={post.legenda || 'Post'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#8e8e8e'
                  }}>
                    📷
                  </div>
                )}
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
                Nenhuma publicação ainda
              </p>
              <Link 
                href="/criar-post" 
                style={{ 
                  color: '#0095f6',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                Criar sua primeira publicação
              </Link>
            </div>
          )}
        </div>

        {/* Botão flutuante para criar post */}
        <Link href="/criar-post">
          <button style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#5d34a4',
            color: 'white',
            border: 'none',
            fontSize: '30px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            +
          </button>
        </Link>
      </div>
    </div>
  );
}
