'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import Link from 'next/link';
import '../publicar-evento/PublicarEvento.css';

export default function MinhaVitrinePage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  const [perfil, setPerfil] = useState({
    slug: '',
    nome_exibicao: '',
    bio: '',
    foto_perfil_url: '',
    foto_capa_url: '',
    instagram: '',
    facebook: '',
    youtube: '',
    // Novos campos de personalização
    tema: 'default',
    cor_primaria: '#667eea',
    cor_secundaria: '#764ba2',
    cor_fundo: '#f5f7fa',
    cor_texto: '#2c3e50',
    fonte_titulo: 'system-ui',
    fonte_corpo: 'system-ui'
  });

  const [links, setLinks] = useState([]);
  const [uploadingFotoPerfil, setUploadingFotoPerfil] = useState(false);
  const [uploadingFotoCapa, setUploadingFotoCapa] = useState(false);
  const [uploadingImagensLinks, setUploadingImagensLinks] = useState({});
  const fotoPerfilRef = useRef(null);
  const fotoCapaRef = useRef(null);
  const imagemLinkRefs = useRef({});

  // Opções de fontes
  const fontesDisponiveis = [
    { nome: 'System UI', valor: 'system-ui' },
    { nome: 'Arial', valor: 'Arial, sans-serif' },
    { nome: 'Georgia', valor: 'Georgia, serif' },
    { nome: 'Courier', valor: 'Courier New, monospace' },
    { nome: 'Verdana', valor: 'Verdana, sans-serif' },
    { nome: 'Times New Roman', valor: 'Times New Roman, serif' },
    { nome: 'Comic Sans', valor: 'Comic Sans MS, cursive' },
    { nome: 'Impact', valor: 'Impact, sans-serif' }
  ];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      await carregarVitrine(session.user.id);
    } catch (error) {
      console.error('Erro:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const carregarVitrine = async (userId) => {
    try {
      const { data: perfilData } = await supabase.from('perfil_produtor').select('*').eq('user_id', userId).single();
      if (perfilData) {
        setPerfil({
          slug: perfilData.slug || '',
          nome_exibicao: perfilData.nome_exibicao || '',
          bio: perfilData.bio || '',
          foto_perfil_url: perfilData.foto_perfil_url || '',
          foto_capa_url: perfilData.foto_capa_url || '',
          instagram: perfilData.instagram || '',
          facebook: perfilData.facebook || '',
          youtube: perfilData.youtube || '',
          tema: perfilData.tema || 'default',
          cor_primaria: perfilData.cor_primaria || '#667eea',
          cor_secundaria: perfilData.cor_secundaria || '#764ba2',
          cor_fundo: perfilData.cor_fundo || '#f5f7fa',
          cor_texto: perfilData.cor_texto || '#2c3e50',
          fonte_titulo: perfilData.fonte_titulo || 'system-ui',
          fonte_corpo: perfilData.fonte_corpo || 'system-ui'
        });
        const { data: linksData } = await supabase.from('links_vitrine').select('*').eq('user_id', userId).order('ordem');
        setLinks(linksData || []);
      } else {
        const emailSlug = gerarSlug(userId.substring(0, 8));
        setPerfil(prev => ({ ...prev, slug: emailSlug, nome_exibicao: 'Meu Nome' }));
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handlePerfilChange = (campo, valor) => setPerfil(prev => ({ ...prev, [campo]: valor }));

  const gerarSlug = (texto) => texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/@/g, '-').replace(/\./g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');

  const handleNomeChange = (valor) => {
    handlePerfilChange('nome_exibicao', valor);
    if (!perfil.slug) handlePerfilChange('slug', gerarSlug(valor));
  };

  const uploadImagem = async (file, tipo, linkId = null) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = linkId ? `${user.id}/links/${linkId}-${Date.now()}.${fileExt}` : `${user.id}/${tipo}-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('vitrine-imagens').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('vitrine-imagens').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      alert('Erro ao fazer upload');
      return null;
    }
  };

  const handleFotoPerfilChange = async (e) => {
    const file = e.target.files[0];
    if (!file || file.size > 5 * 1024 * 1024) return alert('Imagem muito grande');
    setUploadingFotoPerfil(true);
    const url = await uploadImagem(file, 'perfil');
    if (url) handlePerfilChange('foto_perfil_url', url);
    setUploadingFotoPerfil(false);
  };

  const handleFotoCapaChange = async (e) => {
    const file = e.target.files[0];
    if (!file || file.size > 5 * 1024 * 1024) return alert('Imagem muito grande');
    setUploadingFotoCapa(true);
    const url = await uploadImagem(file, 'capa');
    if (url) handlePerfilChange('foto_capa_url', url);
    setUploadingFotoCapa(false);
  };

  const handleImagemLinkChange = async (e, linkId) => {
    const file = e.target.files[0];
    if (!file || file.size > 5 * 1024 * 1024) return alert('Imagem muito grande');
    setUploadingImagensLinks(prev => ({ ...prev, [linkId]: true }));
    const url = await uploadImagem(file, 'link', linkId);
    if (url) atualizarLink(linkId, 'imagem_url', url);
    setUploadingImagensLinks(prev => ({ ...prev, [linkId]: false }));
  };

  const adicionarLink = () => setLinks([...links, { 
    id: Date.now().toString(), 
    titulo: '', 
    url: '', 
    descricao: '', 
    imagem_url: '', 
    icone: '🔗', 
    ordem: links.length, 
    agendamento_inicio: null,
    agendamento_fim: null,
    novo: true 
  }]);
  
  const atualizarLink = (id, campo, valor) => setLinks(links.map(link => link.id === id ? { ...link, [campo]: valor } : link));
  const removerLink = (id) => { if (confirm('Remover?')) setLinks(links.filter(link => link.id !== id)); };

  const handleSalvar = async () => {
    if (!perfil.nome_exibicao || !perfil.slug) return alert('Preencha nome e slug!');
    setSalvando(true);
    try {
      const { data: perfilExistente } = await supabase.from('perfil_produtor').select('id').eq('user_id', user.id).single();
      if (perfilExistente) {
        await supabase.from('perfil_produtor').update({ ...perfil, updated_at: new Date().toISOString() }).eq('user_id', user.id);
      } else {
        await supabase.from('perfil_produtor').insert([{ user_id: user.id, ...perfil }]);
      }

      const linksIdsAtuais = links.filter(l => !l.novo).map(l => l.id);
      if (linksIdsAtuais.length > 0) {
        await supabase.from('links_vitrine').delete().eq('user_id', user.id).not('id', 'in', `(${linksIdsAtuais.join(',')})`);
      }

      for (const link of links) {
        if (!link.titulo || !link.url) continue;
        const linkData = {
          user_id: user.id,
          titulo: link.titulo,
          url: link.url,
          descricao: link.descricao,
          imagem_url: link.imagem_url,
          icone: link.icone,
          ordem: link.ordem,
          agendamento_inicio: link.agendamento_inicio || null,
          agendamento_fim: link.agendamento_fim || null
        };
        
        if (link.novo) {
          await supabase.from('links_vitrine').insert([linkData]);
        } else {
          await supabase.from('links_vitrine').update(linkData).eq('id', link.id);
        }
      }
      alert('✅ Salvo!');
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <div className="publicar-evento-container" style={{ textAlign: 'center', padding: '50px' }}><h2>Carregando...</h2></div>;

  return (
    <div className="publicar-evento-container">
      <div className="user-info-banner"><p>👤 Editando: <strong>{user.email}</strong></p></div>

      <h1>✨ Minha Vitrine</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Crie sua página personalizada</p>

      {perfil.slug && (
        <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '30px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 10px 0', color: '#2e7d32' }}><strong>🔗 Sua vitrine:</strong></p>
          <a href={`/vitrine/${perfil.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', fontSize: '18px', fontWeight: 'bold', textDecoration: 'none' }}>
            golden-ingressos.vercel.app/vitrine/{perfil.slug}
          </a>
        </div>
      )}

      <div className="form-section">
        <h2>📝 Dados Básicos</h2>
        <div className="form-group">
          <label>Nome *</label>
          <input type="text" value={perfil.nome_exibicao} onChange={(e) => handleNomeChange(e.target.value)} placeholder="Seu nome" required />
        </div>
        <div className="form-group">
          <label>Slug *</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ color: '#666' }}>vitrine/</span>
            <input type="text" value={perfil.slug} onChange={(e) => handlePerfilChange('slug', gerarSlug(e.target.value))} placeholder="seu-nome" required style={{ flex: 1 }} />
          </div>
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea value={perfil.bio} onChange={(e) => handlePerfilChange('bio', e.target.value)} placeholder="Sobre você..." rows="3" />
        </div>
      </div>

      {/* NOVA SEÇÃO: PERSONALIZAÇÃO AVANÇADA */}
      <div className="form-section" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '30px', borderRadius: '15px' }}>
        <h2 style={{ color: 'white', marginBottom: '20px' }}>🎨 Personalização Avançada</h2>
        
        <div className="form-group">
          <label style={{ color: 'white' }}>Tema Predefinido</label>
          <select value={perfil.tema} onChange={(e) => {
            const tema = e.target.value;
            handlePerfilChange('tema', tema);
            // Aplicar cores predefinidas
            if (tema === 'default') {
              handlePerfilChange('cor_primaria', '#667eea');
              handlePerfilChange('cor_secundaria', '#764ba2');
              handlePerfilChange('cor_fundo', '#f5f7fa');
            } else if (tema === 'dark') {
              handlePerfilChange('cor_primaria', '#0f0c29');
              handlePerfilChange('cor_secundaria', '#302b63');
              handlePerfilChange('cor_fundo', '#24243e');
            } else if (tema === 'ocean') {
              handlePerfilChange('cor_primaria', '#2E3192');
              handlePerfilChange('cor_secundaria', '#1BFFFF');
              handlePerfilChange('cor_fundo', '#e0f7fa');
            } else if (tema === 'sunset') {
              handlePerfilChange('cor_primaria', '#FF512F');
              handlePerfilChange('cor_secundaria', '#F09819');
              handlePerfilChange('cor_fundo', '#fff5e6');
            } else if (tema === 'forest') {
              handlePerfilChange('cor_primaria', '#134E5E');
              handlePerfilChange('cor_secundaria', '#71B280');
              handlePerfilChange('cor_fundo', '#e8f5e9');
            }
          }} style={{ background: 'white' }}>
            <option value="default">Padrão (Roxo)</option>
            <option value="dark">Escuro</option>
            <option value="ocean">Oceano</option>
            <option value="sunset">Pôr do Sol</option>
            <option value="forest">Floresta</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <div className="form-group">
            <label style={{ color: 'white' }}>Cor Primária</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="color" value={perfil.cor_primaria} onChange={(e) => handlePerfilChange('cor_primaria', e.target.value)} style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px' }} />
              <input type="text" value={perfil.cor_primaria} onChange={(e) => handlePerfilChange('cor_primaria', e.target.value)} style={{ flex: 1, background: 'white' }} />
            </div>
          </div>

          <div className="form-group">
            <label style={{ color: 'white' }}>Cor Secundária</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="color" value={perfil.cor_secundaria} onChange={(e) => handlePerfilChange('cor_secundaria', e.target.value)} style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px' }} />
              <input type="text" value={perfil.cor_secundaria} onChange={(e) => handlePerfilChange('cor_secundaria', e.target.value)} style={{ flex: 1, background: 'white' }} />
            </div>
          </div>

          <div className="form-group">
            <label style={{ color: 'white' }}>Cor de Fundo</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="color" value={perfil.cor_fundo} onChange={(e) => handlePerfilChange('cor_fundo', e.target.value)} style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px' }} />
              <input type="text" value={perfil.cor_fundo} onChange={(e) => handlePerfilChange('cor_fundo', e.target.value)} style={{ flex: 1, background: 'white' }} />
            </div>
          </div>

          <div className="form-group">
            <label style={{ color: 'white' }}>Cor do Texto</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="color" value={perfil.cor_texto} onChange={(e) => handlePerfilChange('cor_texto', e.target.value)} style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px' }} />
              <input type="text" value={perfil.cor_texto} onChange={(e) => handlePerfilChange('cor_texto', e.target.value)} style={{ flex: 1, background: 'white' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <div className="form-group">
            <label style={{ color: 'white' }}>Fonte dos Títulos</label>
            <select value={perfil.fonte_titulo} onChange={(e) => handlePerfilChange('fonte_titulo', e.target.value)} style={{ background: 'white' }}>
              {fontesDisponiveis.map(fonte => (
                <option key={fonte.valor} value={fonte.valor}>{fonte.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ color: 'white' }}>Fonte do Corpo</label>
            <select value={perfil.fonte_corpo} onChange={(e) => handlePerfilChange('fonte_corpo', e.target.value)} style={{ background: 'white' }}>
              {fontesDisponiveis.map(fonte => (
                <option key={fonte.valor} value={fonte.valor}>{fonte.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <p style={{ color: 'white', fontSize: '14px', marginTop: '15px', opacity: 0.9 }}>
          💡 Personalize completamente a aparência da sua vitrine! As mudanças serão aplicadas imediatamente.
        </p>
      </div>

      <div className="form-section">
        <h2>📸 Fotos</h2>
        <div className="form-group">
          <label>Foto de Perfil</label>
          <input type="file" ref={fotoPerfilRef} accept="image/*" onChange={handleFotoPerfilChange} style={{ display: 'none' }} />
          <button type="button" onClick={() => fotoPerfilRef.current.click()} className="btn-submit" style={{ background: '#3498db' }} disabled={uploadingFotoPerfil}>
            {uploadingFotoPerfil ? '⏳ Enviando...' : '📷 Escolher'}
          </button>
          {perfil.foto_perfil_url && <img src={perfil.foto_perfil_url} alt="Perfil" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', marginTop: '10px' }} />}
        </div>
        <div className="form-group">
          <label>Foto de Capa</label>
          <input type="file" ref={fotoCapaRef} accept="image/*" onChange={handleFotoCapaChange} style={{ display: 'none' }} />
          <button type="button" onClick={() => fotoCapaRef.current.click()} className="btn-submit" style={{ background: '#9b59b6' }} disabled={uploadingFotoCapa}>
            {uploadingFotoCapa ? '⏳ Enviando...' : '🖼️ Escolher'}
          </button>
          {perfil.foto_capa_url && <img src={perfil.foto_capa_url} alt="Capa" style={{ width: '100%', maxWidth: '400px', height: '150px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }} />}
        </div>
      </div>

      <div className="form-section">
        <h2>📱 Redes Sociais</h2>
        <div className="form-group">
          <label>Instagram</label>
          <input type="text" value={perfil.instagram} onChange={(e) => handlePerfilChange('instagram', e.target.value)} placeholder="@seuusuario" />
        </div>
        <div className="form-group">
          <label>Facebook</label>
          <input type="text" value={perfil.facebook} onChange={(e) => handlePerfilChange('facebook', e.target.value)} placeholder="seu-usuario" />
        </div>
        <div className="form-group">
          <label>YouTube</label>
          <input type="text" value={perfil.youtube} onChange={(e) => handlePerfilChange('youtube', e.target.value)} placeholder="@seu-canal" />
        </div>
      </div>

      <div className="form-section">
        <h2>🔗 Links Ilimitados</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>Adicione quantos links quiser! Configure agendamentos para aparecer automaticamente em datas específicas.</p>
        
        {links.map((link, index) => (
          <div key={link.id} style={{ border: '2px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '15px', background: '#f9f9f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Link {index + 1}</h3>
              <button type="button" onClick={() => removerLink(link.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>🗑️</button>
            </div>
            <div className="form-group">
              <label>Título</label>
              <input type="text" value={link.titulo} onChange={(e) => atualizarLink(link.id, 'titulo', e.target.value)} placeholder="Título" />
            </div>
            <div className="form-group">
              <label>URL</label>
              <input type="url" value={link.url} onChange={(e) => atualizarLink(link.id, 'url', e.target.value)} placeholder="https://..." />
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <input type="text" value={link.descricao} onChange={(e) => atualizarLink(link.id, 'descricao', e.target.value)} placeholder="Descrição" />
            </div>
            <div className="form-group">
              <label>Ícone</label>
              <input type="text" value={link.icone} onChange={(e) => atualizarLink(link.id, 'icone', e.target.value)} placeholder="🔗" maxLength="2" style={{ width: '80px' }} />
            </div>
            <div className="form-group">
              <label>Imagem</label>
              <input type="file" ref={(el) => imagemLinkRefs.current[link.id] = el} accept="image/*" onChange={(e) => handleImagemLinkChange(e, link.id)} style={{ display: 'none' }} />
              <button type="button" onClick={() => imagemLinkRefs.current[link.id]?.click()} className="btn-submit" style={{ background: '#27ae60' }} disabled={uploadingImagensLinks[link.id]}>
                {uploadingImagensLinks[link.id] ? '⏳ Enviando...' : '🖼️ Escolher'}
              </button>
              {link.imagem_url && <img src={link.imagem_url} alt={link.titulo} style={{ width: '100%', maxWidth: '300px', height: '120px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }} />}
            </div>

            {/* AGENDAMENTO */}
            <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>⏰ Agendamento Automático</h4>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>Configure para este link aparecer e sumir automaticamente</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Aparecer em:</label>
                  <input 
                    type="datetime-local" 
                    value={link.agendamento_inicio || ''} 
                    onChange={(e) => atualizarLink(link.id, 'agendamento_inicio', e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>Sumir em:</label>
                  <input 
                    type="datetime-local" 
                    value={link.agendamento_fim || ''} 
                    onChange={(e) => atualizarLink(link.id, 'agendamento_fim', e.target.value)} 
                  />
                </div>
              </div>
              
              {(link.agendamento_inicio || link.agendamento_fim) && (
                <button 
                  type="button" 
                  onClick={() => {
                    atualizarLink(link.id, 'agendamento_inicio', null);
                    atualizarLink(link.id, 'agendamento_fim', null);
                  }}
                  style={{ marginTop: '10px', padding: '5px 10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Limpar Agendamento
                </button>
              )}
            </div>
          </div>
        ))}
        <button type="button" onClick={adicionarLink} className="btn-submit" style={{ background: '#27ae60', width: '100%', fontSize: '16px' }}>➕ Adicionar Link</button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginTop: '30px', flexWrap: 'wrap' }}>
        <button onClick={handleSalvar} className="btn-submit" disabled={salvando} style={{ flex: 1, minWidth: '200px' }}>
          {salvando ? '⏳ Salvando...' : '💾 Salvar'}
        </button>
        {perfil.slug && (
          <>
            <Link href={`/vitrine/${perfil.slug}`} target="_blank" rel="noopener noreferrer" className="btn-submit" style={{ flex: 1, minWidth: '200px', background: '#3498db', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              👁️ Ver Vitrine
            </Link>
            <Link href="/minha-vitrine/organizar" className="btn-submit" style={{ flex: 1, minWidth: '200px', background: '#9b59b6', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🎭 Organizar
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
