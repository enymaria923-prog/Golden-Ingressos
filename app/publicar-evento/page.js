'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase/client';
import SetorManager from './components/SetorManager';
import CategoriaSelector from './components/CategoriaSelector';
import SelecionarTaxa from './components/SelecionarTaxa';
import './PublicarEvento.css';

const PublicarEvento = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    titulo: '', descricao: '', data: '', hora: '', localNome: '', localEndereco: '' 
  });
  const [categorias, setCategorias] = useState([]);
  const [temLugarMarcado, setTemLugarMarcado] = useState(false);
  const [taxa, setTaxa] = useState({ taxaComprador: 15, taxaProdutor: 5 });
  const [imagem, setImagem] = useState(null); 
  const [imagemPreview, setImagemPreview] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // VERIFICAÇÃO IMEDIATA AO CARREGAR A PÁGINA
useEffect(() => {
  const checkUserOnLoad = async () => {
    console.log('🔄 Verificando usuário ao carregar...');
    
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Erro ao verificar sessão:', error);
      alert('Erro de autenticação. Faça login novamente.');
      router.push('/login');
      return;
    }

    if (!session || !session.user) {
      console.log('❌ Nenhuma sessão ativa - redirecionando para login');
      alert('Você precisa estar logado para publicar eventos!');
      router.push('/login');
      return;
    }

    console.log('✅ Usuário logado detectado:', session.user.email);
    setUser(session.user);
    setLoading(false);
  };

  checkUserOnLoad();
}, [router]);


  // VERIFICAÇÃO CONTÍNUA A CADA 30 SEGUNDOS
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('⚠️ Sessão expirada durante o uso');
        alert('Sua sessão expirou. Faça login novamente.');
        router.push('/login');
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user, router]);

  // ENQUANTO CARREGA
  if (loading) {
    return (
      <div className="publicar-evento-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>🔄 Verificando autenticação...</h2>
        <p>Por favor, aguarde...</p>
      </div>
    );
  }

  // SE NÃO TEM USUÁRIO (não deveria chegar aqui se a verificação funcionou)
  if (!user) {
    return (
      <div className="publicar-evento-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>❌ Acesso não autorizado</h2>
        <p>Redirecionando para login...</p>
        <button onClick={() => router.push('/login')} className="btn-submit">
          🔐 Ir para Login
        </button>
      </div>
    );
  }

  // SE CHEGOU AQUI - USUÁRIO ESTÁ LOGADO E VERIFICADO
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande. Máximo 5MB.');
        return;
      }
      if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/gif')) {
        alert('Apenas JPG, PNG ou GIF.');
        return;
      }
      setImagem(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagemPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleClickUpload = () => fileInputRef.current.click();
  const removeImage = () => {
    setImagem(null);
    setImagemPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // VERIFICAÇÃO FINAL ANTES DO ENVIO
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      alert('❌ Sua sessão expirou! Faça login novamente.');
      router.push('/login');
      return;
    }

    if (!formData.titulo || !formData.descricao || !formData.data || !formData.hora || !formData.localNome || !imagem) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }
    if (categorias.length === 0) {
      alert('Selecione pelo menos uma categoria!');
      return;
    }
    
    setIsSubmitting(true);
    let publicUrl = '';
    let uploadedFilePath = null; 

    try {
      console.log('🚀 Iniciando publicação para usuário:', currentUser.email);

      // UPLOAD DA IMAGEM
      if (imagem) {
        const fileExtension = imagem.name.split('.').pop();
        const slug = formData.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const filePath = `eventos/${slug}-${Date.now()}.${fileExtension}`;
        uploadedFilePath = filePath; 

        const { error: uploadError } = await supabase.storage
          .from('imagens_eventos')
          .upload(filePath, imagem, { 
            cacheControl: '3600', 
            upsert: false,
            contentType: imagem.type
          });

        if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from('imagens_eventos')
          .getPublicUrl(filePath);
        publicUrl = publicUrlData.publicUrl;
      }
      
      // DADOS DO EVENTO
      const eventData = {
        nome: formData.titulo,
        descricao: formData.descricao,
        data: formData.data,
        hora: formData.hora,
        local: formData.localNome,
        endereco: formData.localEndereco,
        categoria: categorias[0] || 'Geral',
        tem_lugar_ma: temLugarMarcado,
        TaxaCliente: taxa.taxaComprador,
        TaxaProdutor: taxa.taxaProdutor,
        imagem_url: publicUrl,
        status: 'pendente',
        user_id: currentUser.id,  // ID DO USUÁRIO LOGADO
        created_at: new Date().toISOString()
      };

      console.log('📝 Inserindo evento:', eventData);

      const { data, error: insertError } = await supabase
        .from('eventos')
        .insert([eventData])
        .select();

      if (insertError) {
        console.error('❌ Erro na inserção:', insertError);
        if (uploadedFilePath) {
          await supabase.storage.from('imagens_eventos').remove([uploadedFilePath]);
        }
        throw new Error(`Erro ao salvar evento: ${insertError.message}`);
      }
      
      console.log('✅ Evento criado com sucesso:', data);
      alert('🎉 Evento enviado para moderação com sucesso!');
      
      // Limpar formulário
      setFormData({ titulo: '', descricao: '', data: '', hora: '', localNome: '', localEndereco: '' });
      setCategorias([]);
      setTemLugarMarcado(false);
      setTaxa({ taxaComprador: 15, taxaProdutor: 5 });
      setImagem(null);
      setImagemPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error) {
      console.error('💥 Erro no processo:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('✅ Renderizando formulário para:', user.email);

  return (
    <div className="publicar-evento-container">
      <div className="user-status-confirmed">
        <h3>✅ Status: Logado e Verificado</h3>
        <p><strong>Usuário:</strong> {user.email}</p>
        <p><strong>ID:</strong> {user.id.substring(0, 8)}...</p>
      </div>
      
      <h1>Publicar Novo Evento</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Informações Básicas</h2>
          
          <div className="form-group">
            <label>Título do Evento *</label>
            <input type="text" name="titulo" value={formData.titulo} onChange={handleFormChange} required />
          </div>

          <div className="form-group">
            <label>Descrição do Evento *</label>
            <textarea name="descricao" value={formData.descricao} onChange={handleFormChange} required />
          </div>

          <div className="form-group">
            <label>Imagem do Evento *</label>
            <div className="image-upload-container">
              <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/gif" onChange={handleImageChange} style={{ display: 'none' }} />
              
              {imagemPreview ? (
                <div className="image-preview-container">
                  <img src={imagemPreview} alt="Preview" className="image-preview" />
                  <button type="button" onClick={removeImage}>Remover Imagem</button>
                </div>
              ) : (
                <div className="image-upload-area" onClick={handleClickUpload}>
                  <div>📷 Clique para selecionar uma imagem</div>
                </div>
              )}
            </div>
          </div>

          <CategoriaSelector onCategoriasChange={setCategorias} />

          <div className="form-group">
            <label>Nome do Local *</label>
            <input type="text" name="localNome" value={formData.localNome} onChange={handleFormChange} required />
          </div>

          <div className="form-group">
            <label>Endereço do Local (opcional)</label>
            <input type="text" name="localEndereco" value={formData.localEndereco} onChange={handleFormChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data do Evento *</label>
              <input type="date" name="data" value={formData.data} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label>Horário *</label>
              <input type="time" name="hora" value={formData.hora} onChange={handleFormChange} required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Configuração de Assentos</h2>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={temLugarMarcado} onChange={(e) => setTemLugarMarcado(e.target.checked)} />
              Evento com lugar marcado
            </label>
          </div>
        </div>

        <div className="form-section">
          <h2>Setores e Ingressos</h2>
          <SetorManager />
        </div>

        <div className="form-section">
          <h2>Configuração de Taxas</h2>
          <SelecionarTaxa onTaxaSelecionada={setTaxa} />
        </div>

        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? '⏳ Enviando para Moderação...' : '🚀 Publicar Evento'}
        </button>
      </form>
    </div>
  );
};

export default PublicarEvento;
