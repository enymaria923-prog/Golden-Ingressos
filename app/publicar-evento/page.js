'use client';
import React, { useState, useRef } from 'react';
import { createClient } from '../../utils/supabase/client'; // Importação do cliente Supabase para o lado do cliente
import SetorManager from './components/SetorManager';
import CategoriaSelector from './components/CategoriaSelector';
import SelecionarTaxa from './components/SelecionarTaxa';
import './PublicarEvento.css';

const PublicarEvento = () => {
  // Inicialização do Supabase Client
  const supabase = createClient();

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
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Validação de Tamanho (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande. Por favor, selecione uma imagem menor que 5MB.');
        e.target.value = null; 
        setImagem(null);
        setImagemPreview(null);
        return;
      }
      
      // 2. Validação de Tipo
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

    // 1. Validações de Pré-Envio
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
      // --- PROCESSO DE UPLOAD DE IMAGEM ---
      
      if (imagem) {
        const fileExtension = imagem.name.split('.').pop();
        const slug = formData.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const filePath = `eventos/${slug}-${Date.now()}.${fileExtension}`;
        uploadedFilePath = filePath; 
        const bucketName = 'eventos-capas'; 

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, imagem, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        publicUrl = publicUrlData.publicUrl;
      }
      
      // --- INSERÇÃO DE DADOS NA TABELA 'eventos' ---

      const eventData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        data: formData.data,
        hora: formData.hora,
        local_nome: formData.localNome,
        local_endereco: formData.localEndereco,
        categorias: categorias, 
        tem_lugar_marcado: temLugarMarcado,
        taxas: taxa, 
        // Coluna conforme solicitado: imagem_url
        imagem_url: publicUrl, 
        status: 'pendente', 
      };

      const { error: insertError } = await supabase
        .from('eventos') // Tabela conforme solicitado: 'eventos'
        .insert([eventData]);

      if (insertError) {
        // Rollback: remove a imagem do storage se a inserção no banco de dados falhar
        if (uploadedFilePath) {
            await supabase.storage.from('eventos-capas').remove([uploadedFilePath]);
        }
        throw new Error(`Erro ao inserir evento no BD: ${insertError.message}`);
      }
      
      alert('Evento enviado para moderação! Em breve estará disponível no site.');
      
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

    } catch (error) {
      console.error('💥 Erro no processo de publicação:', error.message);
      alert(`Erro ao publicar evento: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="publicar-evento-container">
      <h1>Publicar Novo Evento</h1>
      
      <form onSubmit={handleSubmit}>
        {/* ... restante do seu formulário (mantido intacto) ... */}

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
                style={{ display: 'none' }} // Esconde o input original
              />
              
              {imagemPreview ? (
                <div className="image-preview-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
              placeholder="Ex: Teatro Elis Regina, Casa de Show X"
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
          {isSubmitting ? 'Enviando para Moderação...' : '🚀 Publicar Evento'}
        </button>
      </form>
    </div>
  );
};

export default PublicarEvento;
