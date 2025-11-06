'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import SetorManager from './components/SetorManager';
import CategoriaSelector from './components/CategoriaSelector';
import SelecionarTaxa from './components/SelecionarTaxa';
import './PublicarEvento.css';

const PublicarEvento = () => {
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
    localNome: '', 
    localEndereco: '' 
  });
  
  const [categorias, setCategorias] = useState([]);
  const [temLugarMarcado, setTemLugarMarcado] = useState(false);
  const [taxa, setTaxa] = useState({ 
    taxaComprador: 15, 
    taxaProdutor: 5 
  });
  
  const [imagem, setImagem] = useState(null); 
  const [imagemPreview, setImagemPreview] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // VERIFICA SE O USUÁRIO ESTÁ LOGADO
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      console.log('🔍 Verificando usuário...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('📦 Sessão:', session);
      
      if (session?.user) {
        console.log('✅ Usuário logado:', session.user.email);
        setUser(session.user);
      } else {
        console.log('❌ Nenhum usuário logado');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('💥 Erro:', error);
      setLoading(false);
    }
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande. Por favor, selecione uma imagem menor que 5MB.');
        e.target.value = null; 
        setImagem(null);
        setImagemPreview(null);
        return;
      }
      if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/gif')) {
        alert('Por favor, selecione apenas imagens nos formatos JPG, PNG ou GIF.');
        e.target.value = null; 
        setImagem(null);
        setImagemPreview(null);
        return;
      }
      setImagem(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target.result);
      };
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

    // VERIFICA SE ESTÁ LOGADO ANTES DE ENVIAR
    if (!user) {
      alert('⚠️ Você precisa estar logado para publicar eventos!');
      router.push('/login');
      return;
    }

    if (!formData.titulo || !formData.descricao || !formData.data || !formData.hora || !formData.localNome || !imagem) {
      alert('Por favor, preencha todos os campos obrigatórios, incluindo a imagem!');
      return;
    }
    if (categorias.length === 0) {
      alert('Por favor, selecione pelo menos uma categoria!');
      return;
    }
    
    setIsSubmitting(true);
    let publicUrl = '';
    let uploadedFilePath = null; 

    try {
      console.log('👤 Publicando como usuário:', user.id);
      console.log('📧 Email do usuário:', user.email);

      // --- UPLOAD DE IMAGEM ---
      if (imagem) {
        const fileExtension = imagem.name.split('.').pop();
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const filePath = `eventos/${user.id}/${timestamp}-${randomStr}.${fileExtension}`;
        uploadedFilePath = filePath; 

        console.log('📤 Iniciando upload da imagem para:', filePath);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('imagens_eventos')
          .upload(filePath, imagem, { 
            cacheControl: '3600', 
            upsert: false 
          });

        if (uploadError) {
          console.error('❌ Erro no upload:', uploadError);
          throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        }

        console.log('✅ Upload realizado:', uploadData);
        
        const { data: publicUrlData } = supabase.storage
          .from('imagens_eventos')
          .getPublicUrl(filePath);
        
        publicUrl = publicUrlData.publicUrl;
        console.log('🔗 URL pública:', publicUrl);
      }

      // --- DADOS DO EVENTO ---
      const eventData = {
        nome: formData.titulo,
        descricao: formData.descricao,
        data: formData.data,
        hora: formData.hora,
        local: formData.localNome,
        endereco: formData.localEndereco || null,
        categoria: categorias[0],
        tem_lugar_ma: temLugarMarcado,
        TaxaCliente: taxa.taxaComprador,
        TaxaProdutor: taxa.taxaProdutor,
        imagem_url: publicUrl,
        status: 'pendente',
        user_id: user.id, // ID DO USUÁRIO LOGADO
        produtor_email: user.email, // EMAIL DO PRODUTOR
        produtor_nome: user.user_metadata?.name || user.email, // NOME DO PRODUTOR
        ingressos_vendidos: 0, // INICIA COM ZERO
        preco_medio: 0 // SERÁ CALCULADO DEPOIS
      };

      console.log('📝 Inserindo evento no banco...', eventData);
      
      const { data: insertedData, error: insertError } = await supabase
        .from('eventos')
        .insert([eventData])
        .select();

      if (insertError) {
        console.error('❌ Erro na inserção:', insertError);
        
        // Remove a imagem se o evento não foi criado
        if (uploadedFilePath) {
          console.log('🗑️ Removendo imagem do storage...');
          await supabase.storage.from('imagens_eventos').remove([uploadedFilePath]);
        }
        
        throw new Error(`Erro ao inserir evento: ${insertError.message}`);
      }
      
      console.log('✅ Evento criado com sucesso!', insertedData);
      alert('🎉 Evento enviado para moderação! Em breve estará disponível no site.');
      
      // Limpar formulário
      setFormData({
        titulo: '', descricao: '', data: '', hora: '', localNome: '', localEndereco: ''
      });
      setCategorias([]);
      setTemLugarMarcado(false);
      setTaxa({ taxaComprador: 15, taxaProdutor: 5 });
      setImagem(null);
      setImagemPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Redireciona para meus eventos (opcional)
      // router.push('/meus-ingressos');

    } catch (error) {
      console.error('💥 Erro no processo de publicação:', error);
      alert(`❌ Erro ao publicar evento: ${error.message}\n\nSe o problema persistir, entre em contato com o suporte.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // MOSTRA LOADING ENQUANTO VERIFICA AUTH
  if (loading) {
    return (
      <div className="publicar-evento-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>🔄 Verificando autenticação...</h2>
        <p>Aguarde um momento...</p>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
          Checando sua sessão... Abra o console (F12) para ver detalhes.
        </p>
      </div>
    );
  }

  // SE NÃO ESTIVER LOGADO, MOSTRA AVISO MAS NÃO REDIRECIONA AUTOMATICAMENTE
  if (!user) {
    console.log('⚠️ Renderizando tela de acesso negado');
    return (
      <div className="publicar-evento-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>⚠️ Sessão não encontrada</h2>
        <p>Não conseguimos verificar seu login.</p>
        <p style={{ fontSize: '14px', color: '#666', margin: '20px 0' }}>
          Isso pode acontecer se você acabou de fazer login. Tente:
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={checkUser} className="btn-submit" style={{ background: '#2196F3' }}>
            🔄 Tentar Novamente
          </button>
          <button onClick={() => router.push('/login')} className="btn-submit">
            🔐 Ir para Login
          </button>
          <button onClick={() => router.push('/')} className="btn-submit" style={{ background: '#666' }}>
            🏠 Voltar ao Início
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '30px' }}>
          Debug: Abra o console (F12) para ver os logs detalhados
        </p>
      </div>
    );
  }

  console.log('✅ Renderizando formulário - Usuário:', user.email);

  return (
    <div className="publicar-evento-container">
      <div className="user-info-banner">
        <p>👤 Publicando como: <strong>{user.email}</strong></p>
      </div>
      
      <h1>Publicar Novo Evento</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Informações Básicas */}
        <div className="form-section">
          <h2>Informações Básicas</h2>
          
          <div className="form-group">
            <label>Título do Evento *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleFormChange}
              placeholder="Ex: Show da Banda X, Peça de Teatro Y"
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição do Evento *</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleFormChange}
              placeholder="Descreva detalhadamente o seu evento..."
              required
            />
          </div>

          {/* Campo de Imagem */}
          <div className="form-group">
            <label>Imagem do Evento *</label>
            <div className="image-upload-container">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
                className="image-input"
                style={{ display: 'none' }} 
              />
              
              {imagemPreview ? (
                <div className="image-preview-container">
                  <img src={imagemPreview} alt="Preview" className="image-preview" />
                  <div className="image-info">
                    <p>✅ {imagem?.name || 'Imagem selecionada'}</p>
                    <button type="button" onClick={removeImage} className="btn-remove-image">
                      Remover Imagem
                    </button>
                  </div>
                </div>
              ) : (
                <div className="image-upload-area" onClick={handleClickUpload}>
                  <div className="upload-icon">📷</div>
                  <p>Clique para selecionar uma imagem</p>
                  <small>Arraste ou clique para fazer upload</small>
                </div>
              )}
            </div>
            <small>Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB</small>
          </div>

          <CategoriaSelector onCategoriasChange={setCategorias} />

          <div className="form-group">
            <label>Nome do Local *</label>
            <input
              type="text"
              name="localNome" 
              value={formData.localNome}
              onChange={handleFormChange}
              placeholder="Ex: Teatro Maria Della Costa"
              required
            />
          </div>

          <div className="form-group">
            <label>Endereço do Local (opcional)</label>
            <input
              type="text"
              name="localEndereco"
              value={formData.localEndereco}
              onChange={handleFormChange}
              placeholder="Ex: Rua Exemplo, 123 - Bairro - Cidade/Estado"
            />
            <small>Pode deixar em branco - nossa equipe completará se necessário</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data do Evento *</label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Horário *</label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Configuração de Assentos */}
        <div className="form-section">
          <h2>Configuração de Assentos</h2>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={temLugarMarcado}
                onChange={(e) => setTemLugarMarcado(e.target.checked)}
              />
              Evento com lugar marcado
            </label>
            <small>Marque esta opção se o evento terá assentos numerados</small>
          </div>
        </div>

        {/* Setores e Ingressos */}
        <div className="form-section">
          <h2>Setores e Ingressos</h2>
          <SetorManager />
        </div>

        {/* Configuração de Taxas */}
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
