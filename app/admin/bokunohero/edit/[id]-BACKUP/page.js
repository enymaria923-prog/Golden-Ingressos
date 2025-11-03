'use client';
import React, { useState, useEffect, useRef } from 'react';
// ===================================================================
// CORREÇÃO DOS CAMINHOS: 
// Adicionado um '../' a mais para voltar até a pasta 'app'
// ===================================================================
import { createClient } from '../../../../../utils/supabase/client'; 
import SetorManager from '../../../../../publicar-evento/components/SetorManager';
import CategoriaSelector from '../../../../../publicar-evento/components/CategoriaSelector';
import SelecionarTaxa from '../../../../../publicar-evento/components/SelecionarTaxa';
import '../../../../../publicar-evento/PublicarEvento.css'; // Reutilizando CSS
// ===================================================================

import { useParams, useRouter } from 'next/navigation';

const EditarEvento = () => {
  // ===================================================================
  // CORREÇÃO: 
  // Usa o 'createClient' importado para criar a instância
  const supabase = createClient();
  // ===================================================================
  
  const router = useRouter();
  
  const params = useParams(); 
  const [eventoId, setEventoId] = useState(null);

  // Estados com valores iniciais para edição
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
    localNome: '', 
    localEndereco: '', 
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
  const [carregando, setCarregando] = useState(true);
  const fileInputRef = useRef(null);
  
  // Efeito para carregar dados (dividido para evitar erro de build)
  useEffect(() => {
    // 1. Proteger a página
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    if (!isLoggedIn) {
      console.error('Acesso negado. Faça o login na área admin primeiro.');
      router.push('/admin/bokunohero'); 
      return;
    }
    
    // 2. Pegar o ID da URL
    if (params && params.id) {
      setEventoId(params.id);
    } else {
      setCarregando(false);
    }

  }, [params, router]);


  // 3. CARREGAR DADOS DO EVENTO (SÓ RODA DEPOIS QUE O eventoId é definido)
  useEffect(() => {
    if (!eventoId) return;

    const buscarEvento = async () => {
      setCarregando(true);
      try {
        const { data: evento, error } = await supabase
          .from('eventos')
          .select('*')
          .eq('id', eventoId)
          .single();

        if (error) throw error;
        if (!evento) {
          console.error('Evento não encontrado!');
          router.push('/admin/bokunohero');
          return;
        }

        // Mapeia os dados do banco para o estado do formulário
        setFormData({
          titulo: evento.nome || '',
          descricao: evento.descricao || '',
          data: evento.data || '',
          hora: evento.hora || '',
          localNome: evento.local || '',
          localEndereco: evento.endereco || ''
        });
        
        setCategorias(evento.categoria ? [evento.categoria] : []);
        setTemLugarMarcado(evento.tem_lugar_marcado || false);
        setTaxa({
          taxaComprador: evento.TaxaCliente || 15,
          taxaProdutor: evento.TaxaProdutor || 5
        });
        setImagemPreview(evento.imagem_url || null);

      } catch (error) {
        console.error('Erro ao buscar evento:', error.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarEvento();
    
  }, [eventoId, router, supabase]); // Depende do eventoId estar pronto

  // Funções do formulário (HandleChange, HandleImage, etc.)
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        console.error('A imagem é muito grande. Por favor, selecione uma imagem menor que 5MB.');
        return;
      }
      if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/gif')) {
        console.error('Por favor, selecione apenas imagens nos formatos JPG, PNG ou GIF.');
        return;
      }
      setImagem(file); // Armazena o ARQUIVO para o novo upload
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target.result); // Define o PREVIEW
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleClickUpload = () => fileInputRef.current.click();
  const removeImage = () => {
    setImagem(null);
    setImagemPreview(null); // Remove também o preview
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  // Função de SUBMIT (Atualizar o evento)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!formData.titulo || !formData.descricao || !formData.data || !formData.hora || !formData.localNome) {
      console.error('Por favor, preencha todos os campos obrigatórios!');
      return;
    }
    
    setIsSubmitting(true);
    let publicUrl = imagemPreview; // Mantém a URL antiga por padrão
    let uploadedFilePath = null; 

    try {
      // 2. Lógica de Upload (SÓ SE UMA NOVA imagem FOI SELECIONADA)
      if (imagem) { 
        console.log("Nova imagem detectada. Fazendo upload...");
        // (Aqui você deveria deletar a imagem antiga do storage)
        
        const fileExtension = imagem.name.split('.').pop();
        const slug = formData.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const filePath = `eventos/${slug}-${Date.now()}.${fileExtension}`;
        uploadedFilePath = filePath; 
        const bucketName = 'imagens_eventos'; 

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, imagem, { cacheControl: '3600', upsert: false });

        if (uploadError) throw new Error(`Erro ao fazer upload da nova imagem: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        publicUrl = publicUrlData.publicUrl; // Define a NOVA URL
      }
      
      // 3. ATUALIZAÇÃO NO BANCO DE DADOS
      const eventData = {
        nome: formData.titulo,           
        descricao: formData.descricao,   
        data: formData.data,             
        hora: formData.hora,             
        local: formData.localNome,       
        endereco: formData.localEndereco, 
        categoria: categorias[0],        
        tem_lugar_marcado: temLugarMarcado, 
        TaxaCliente: taxa.taxaComprador,  
        TaxaProdutor: taxa.taxaProdutor, 
        imagem_url: publicUrl, // Salva a URL (nova ou antiga)
      };

      console.log('Iniciando atualização no banco de dados...');
      const { error: updateError } = await supabase
        .from('eventos') 
        .update(eventData)
        .eq('id', eventoId); // Garante a EDIÇÃO

      if (updateError) {
        if (uploadedFilePath) {
            await supabase.storage.from('imagens_eventos').remove([uploadedFilePath]);
        }
        throw new Error(`Erro ao atualizar evento no BD: ${updateError.message}`);
      }
      
      console.log('✅ Evento atualizado com sucesso!');
      router.push('/admin/bokunohero'); // Volta para a lista principal

    } catch (error) {
      console.error('💥 Erro no processo de edição:', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (carregando) {
    return <div className="admin-loading">Carregando dados do evento para edição...</div>;
  }

  // O formulário de Edição
  return (
    <div className="publicar-evento-container">
      <h1>Editar Evento: {formData.titulo} (ID: {eventoId})</h1>
      <small>⚠️ Você está no modo Super Admin. Tenha cuidado ao salvar.</small>
      
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
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição do Evento *</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleFormChange}
              required
            />
          </div>

          {/* Campo de Imagem (Carrega o preview da imagem_url) */}
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagemPreview} alt="Preview" className="image-preview" />
                  <div className="image-info">
                    <p>✅ {imagem?.name || 'Imagem carregada'}</p>
                    <button type="button" onClick={removeImage} className="btn-remove-image">
                      Remover/Trocar Imagem
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
          </div>

          <CategoriaSelector onCategoriasChange={setCategorias} initialCategorias={categorias} />

          <div className="form-group">
            <label>Nome do Local *</label>
            <input
              type="text"
              name="localNome" 
              value={formData.localNome}
              onChange={handleFormChange}
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
            />
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
          </div>
        </div>

        {/* Setores e Ingressos */}
        <div className="form-section">
          <h2>Setores e Ingressos</h2>
          <SetorManager eventoId={eventoId} isEditing={true} />
          <small>⚠️ O SetorManager precisa ser adaptado para carregar dados do eventoId.</small>
        </div>

        {/* Configuração de Taxas */}
        <div className="form-section">
          <h2>Configuração de Taxas</h2>
          <SelecionarTaxa onTaxaSelecionada={setTaxa} initialTaxa={taxa} />
        </div>

        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando Alterações...' : '💾 Salvar Evento'}
        </button>
      </form>
    </div>
  );
};

export default EditarEvento;

