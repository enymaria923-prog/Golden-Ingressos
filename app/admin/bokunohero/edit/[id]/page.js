'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '../../../../../utils/supabase/client'; 
import { useParams, useRouter } from 'next/navigation';
// Reutilizando componentes da Publicação
import SetorManager from '../../../../publicar-evento/components/SetorManager';
import CategoriaSelector from '../../../../publicar-evento/components/CategoriaSelector';
import SelecionarTaxa from '../../../../publicar-evento/components/SelecionarTaxa';
import '../../../../publicar-evento/PublicarEvento.css'; // Reutilizando CSS

const EditarEvento = () => {
  const supabase = createClient();
  const params = useParams(); // Pega o ID do evento na URL
  const router = useRouter();
  const eventoId = params.id;

  // Estados com valores iniciais para edição
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
    localNome: '', 
    localEndereco: '', 
    // Outros campos...
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

  // 1. CARREGAR DADOS DO EVENTO
  useEffect(() => {
    // Proteger a página com login
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    if (!isLoggedIn) {
      alert('Acesso negado. Faça o login na área admin primeiro.');
      router.push('/admin/bokunohero'); 
      return;
    }
    
    const buscarEvento = async () => {
      try {
        const { data: evento, error } = await supabase
          .from('eventos')
          .select('*')
          .eq('id', eventoId)
          .single();

        if (error) throw error;
        if (!evento) {
          alert('Evento não encontrado!');
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
        alert('Erro ao carregar dados do evento.');
      } finally {
        setCarregando(false);
      }
    };

    if (eventoId) {
      buscarEvento();
    } else {
      setCarregando(false); // Não há ID, talvez um erro?
    }
  }, [eventoId, router, supabase]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };
  
  // (Mantenha as funções handleImageChange, handleClickUpload e removeImage do publicar-evento)

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!formData.titulo || !formData.descricao || !formData.data || !formData.hora || !formData.localNome) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }
    
    setIsSubmitting(true);
    let publicUrl = imagemPreview; 
    let uploadedFilePath = null; 

    try {
      // 2. Lógica de Upload da Imagem (se uma NOVA imagem foi selecionada)
      if (imagem) {
        // ... (Lógica de upload de imagem idêntica à do publicar-evento)
        // Lembre-se de deletar a imagem antiga se o upload for bem-sucedido.
        const fileExtension = imagem.name.split('.').pop();
        const slug = formData.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const filePath = `eventos/${slug}-${Date.now()}.${fileExtension}`;
        uploadedFilePath = filePath; 
        const bucketName = 'imagens_eventos'; 

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, imagem, { cacheControl: '3600', upsert: false });

        if (uploadError) throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        publicUrl = publicUrlData.publicUrl;
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
        imagem_url: publicUrl,           
      };

      console.log('Iniciando atualização no banco de dados...');
      const { error: updateError } = await supabase
        .from('eventos') 
        .update(eventData)
        .eq('id', eventoId); // É ISSO QUE GARANTE A EDIÇÃO E NÃO INSERÇÃO

      if (updateError) {
        // Se a atualização falhar, tente remover a imagem que acabou de ser upada
        if (uploadedFilePath) {
            await supabase.storage.from('imagens_eventos').remove([uploadedFilePath]);
        }
        throw new Error(`Erro ao atualizar evento no BD: ${updateError.message}`);
      }
      
      console.log('✅ Evento atualizado com sucesso!');
      alert('Evento atualizado com sucesso!');
      router.push('/admin/bokunohero'); // Volta para a lista principal

    } catch (error) {
      console.error('💥 Erro no processo de edição:', error.message);
      alert(`Erro ao editar evento: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (carregando) {
    return <div className="admin-loading">Carregando dados do evento para edição...</div>;
  }

  return (
    <div className="publicar-evento-container">
      <h1>Editar Evento: {formData.titulo} (ID: {eventoId})</h1>
      <small>⚠️ Você está no modo Super Admin. Tenha cuidado ao salvar.</small>
      
      <form onSubmit={handleSubmit}>
        {/* ... (Todo o formulário de publicação deve ser copiado/reutilizado aqui) ... */}
        
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

          {/* Campo de Imagem (Copiar a lógica completa do publicar-evento/page.js) */}
          {/* OBS: Para evitar um código enorme, você deve copiar as funções handleImageChange, handleClickUpload, removeImage do arquivo original e o JSX completo do campo de imagem. */}

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

        {/* Setores e Ingressos (Mantenha o componente SetorManager, mas a lógica de carregar/salvar setores é complexa e precisa ser implementada dentro dele) */}
        <div className="form-section">
          <h2>Setores e Ingressos</h2>
          <SetorManager eventoId={eventoId} isEditing={true} />
          <small>⚠️ O gerenciamento de setores no modo edição é complexo. Verifique se o SetorManager está adaptado para carregar/salvar dados.</small>
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
