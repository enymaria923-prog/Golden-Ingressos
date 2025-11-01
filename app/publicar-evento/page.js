'use client';
import React, { useState, useRef } from 'react';
import { createClient } from '../../utils/supabase/client'; // Importação CORRETA do utilitário Supabase
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
  const [isSubmitting, setIsSubmitting] = useState(false); // Adicionado para controle do botão
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validar campos obrigatórios (suas validações)
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

    try {
      // 1. UPLOAD DA IMAGEM para o Supabase Storage
      const fileExtension = imagem.name.split('.').pop();
      // Criando um slug e timestamp único para o caminho do arquivo
      const slug = formData.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const filePath = `eventos/${slug}-${Date.now()}.${fileExtension}`;
      const bucketName = 'eventos-capas'; // <-- VERIFIQUE SE O NOME DO SEU BUCKET ESTÁ CORRETO

      console.log('Iniciando upload para Storage...');
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, imagem, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
      }

      // 2. OBTER URL pública
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      publicUrl = publicUrlData.publicUrl;
      console.log('URL da Imagem:', publicUrl);

      // 3. INSERIR DADOS NA TABELA 'eventos'
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
        imagem_url: publicUrl, // Salva a URL pública
        status: 'pendente', // Definindo o status para a moderação (Admin deve filtrar por este)
        // Nota: O SetorManager não está passando dados para cá, se precisar, 
        // a lógica de ingressos e setores precisa ser adicionada aqui
      };

      console.log('Iniciando inserção no banco de dados...');
      const { error: insertError } = await supabase
        .from('eventos') // <-- VERIFIQUE SE O NOME DA SUA TABELA É 'eventos'
        .insert([eventData]);

      if (insertError) {
        // Se a inserção no banco de dados falhar, tente remover a imagem que foi carregada
        await supabase.storage.from(bucketName).remove([filePath]);
        throw new Error(`Erro ao inserir evento no BD: ${insertError.message}`);
      }
      
      console.log('✅ Evento enviado para moderação com sucesso!');
      alert('Evento enviado para moderação! Em breve estará disponível no site.');
      
      // Limpar formulário após envio (seu código original)
      setFormData({
        titulo: '',
        descricao: '',
        data: '',
        hora: '',
        localNome: '',
        localEndereco: ''
      });
      setCategorias([]);
      setTemLugarMarcado(false);
      setTaxa({ taxaComprador: 15, taxaProdutor: 5 });
      setImagem(null);
      setImagemPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('💥 Erro no processo de publicação:', error.message);
      alert(`Erro ao publicar evento: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    // ... Sua função handleImageChange (mantida intacta) ...
    const file = e.target.files[0];
    if (file) {
      // Verificar tamanho do arquivo (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande. Por favor, selecione uma imagem menor que 5MB.');
        return;
      }
      
      // Verificar tipo do arquivo
      if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/gif')) {
        alert('Por favor, selecione apenas imagens nos formatos JPG, PNG ou GIF.');
        return;
      }
      
      setImagem(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current.click();
  };

  const removeImage = () => {
    setImagem(null);
    setImagemPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="publicar-evento-container">
      <h1>Publicar Novo Evento</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Informações Básicas */}
        <div className="form-section">
          <h2>Informações Básicas</h2>
          
          <div className="form-group">
            <label>Título do Evento *</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              placeholder="Ex: Show da Banda X, Peça de Teatro Y"
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição do Evento *</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Descreva detalhadamente o seu evento..."
              required
            />
          </div>

          {/* Campo de Imagem CORRIGIDO */}
          <div className="form-group">
            <label>Imagem do Evento *</label>
            <div className="image-upload-container">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
                className="image-input"
                // Removendo o 'required' do HTML e confiando na validação do JS
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
              value={formData.localNome}
              onChange={(e) => setFormData({...formData, localNome: e.target.value})}
              placeholder="Ex: Teatro Elis Regina, Casa de Show X"
              required
            />
          </div>

          <div className="form-group">
            <label>Endereço do Local (opcional)</label>
            <input
              type="text"
              value={formData.localEndereco}
              onChange={(e) => setFormData({...formData, localEndereco: e.target.value})}
              placeholder="Ex: Rua Exemplo, 123 - Bairro - Cidade/Estado"
            />
            <small>Pode deixar em branco - nossa equipe completará se necessário</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data do Evento *</label>
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({...formData, data: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Horário *</label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({...formData, hora: e.target.value})}
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
