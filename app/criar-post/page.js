'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CriarPostPage() {
  const [user, setUser] = useState(null);
  const [imagem, setImagem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [legenda, setLegenda] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      const { data: { user: userData } } = await supabase.auth.getUser();
      if (!userData) {
        router.push('/login');
        return;
      }
      setUser(userData);
    }
    checkUser();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamanho (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 10MB');
      return;
    }

    setImagem(file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imagem) {
      alert('Selecione uma imagem');
      return;
    }

    setUploading(true);

    try {
      // 1. Upload da imagem
      const fileExt = imagem.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('fotos')
        .upload(filePath, imagem);

      if (uploadError) throw uploadError;

      // 2. Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('fotos')
        .getPublicUrl(filePath);

      // 3. Criar post no banco
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          imagem_url: publicUrl,
          legenda: legenda.trim() || null,
          localizacao: localizacao.trim() || null
        });

      if (postError) throw postError;

      alert('Post publicado com sucesso!');
      router.push('/perfil');

    } catch (error) {
      console.error('Erro ao criar post:', error);
      alert('Erro ao publicar post: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagem(null);
    setPreviewUrl('');
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
          <Link href="/perfil" style={{ fontSize: '20px', textDecoration: 'none', color: '#262626' }}>
            ← Voltar
          </Link>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Nova publicação</h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </header>

      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
        
        <form onSubmit={handleSubmit}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #dbdbdb', overflow: 'hidden' }}>
            
            {/* Área de upload da imagem */}
            {!previewUrl ? (
              <div style={{ 
                padding: '60px 20px',
                textAlign: 'center',
                borderBottom: '1px solid #dbdbdb'
              }}>
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>📷</div>
                <p style={{ fontSize: '22px', fontWeight: '300', marginBottom: '20px', color: '#262626' }}>
                  Selecione uma foto
                </p>
                <label style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  backgroundColor: '#0095f6',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px'
                }}>
                  Escolher arquivo
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    required
                  />
                </label>
                <p style={{ marginTop: '20px', fontSize: '12px', color: '#8e8e8e' }}>
                  Tamanho máximo: 10MB
                </p>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '600px', 
                    objectFit: 'contain',
                    backgroundColor: '#000'
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Formulário de legenda e localização */}
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  ✍️ Legenda
                </label>
                <textarea
                  value={legenda}
                  onChange={(e) => setLegenda(e.target.value)}
                  placeholder="Escreva uma legenda... (opcional)"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #dbdbdb',
                    borderRadius: '8px',
                    outline: 'none',
                    resize: 'vertical',
                    fontSize: '16px',
                    fontFamily: 'inherit'
                  }}
                  maxLength={2200}
                />
                <small style={{ color: '#8e8e8e', fontSize: '12px' }}>
                  {legenda.length}/2200 caracteres
                </small>
              </div>
              
              <div style={{ paddingTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  📍 Localização (opcional)
                </label>
                <input
                  type="text"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  placeholder="Adicionar localização..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #dbdbdb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  maxLength={100}
                />
              </div>

              <button
                type="submit"
                disabled={uploading || !imagem}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '12px',
                  backgroundColor: uploading || !imagem ? '#b2dffc' : '#0095f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: uploading || !imagem ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? 'Publicando...' : 'Compartilhar'}
              </button>
            </div>
          </div>
        </form>

        {/* Dicas */}
        <div style={{ 
          marginTop: '30px', 
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #dbdbdb'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600' }}>
            💡 Dicas para uma boa foto
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#8e8e8e', fontSize: '14px' }}>
            <li style={{ marginBottom: '8px' }}>Use boa iluminação</li>
            <li style={{ marginBottom: '8px' }}>Enquadre bem o assunto</li>
            <li style={{ marginBottom: '8px' }}>Evite fotos tremidas</li>
            <li style={{ marginBottom: '8px' }}>Capriche na legenda!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
