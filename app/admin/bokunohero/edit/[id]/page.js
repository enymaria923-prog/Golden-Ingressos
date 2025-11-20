'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '../../../../../utils/supabase/client';
import CategoriaSelector from '../../../../publicar-evento/components/CategoriaSelector';
import '../../../../publicar-evento/PublicarEvento.css';
import '../../admin.css';

export default function EditarEventoPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const eventoId = params.id; // isso esta
  
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [evento, setEvento] = useState(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
    localNome: '',
    localEndereco: '',
    status: 'pendente'
  });
  
  const [categorias, setCategorias] = useState([]);
  const [temLugarMarcado, setTemLugarMarcado] = useState(false);
  const [taxa, setTaxa] = useState({ 
    taxaComprador: 15, 
    taxaProdutor: 5 
  });
  
  const [imagemAtual, setImagemAtual] = useState('');
  const [novaImagem, setNovaImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const fileInputRef = useRef(null);

  // CARREGA OS DADOS DO EVENTO
  useEffect(() => {
    if (eventoId) {
      carregarEvento();
    }
  }, [eventoId]);

  const carregarEvento = async () => {
    try {
      console.log('📥 Carregando evento ID:', eventoId);
      console.log('🔍 Tipo do ID:', typeof eventoId);
      
      // Valida se o ID é válido
      if (!eventoId || eventoId === '[id]' || eventoId.includes('[')) {
        throw new Error('ID de evento inválido');
      }
      
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Evento não encontrado');
      }

      console.log('✅ Evento carregado:', data);
      setEvento(data);
      
      // Preenche o formulário com os dados existentes
      setFormData({
        titulo: data.nome || '',
        descricao: data.descricao || '',
        data: data.data || '',
        hora: data.hora || '',
        localNome: data.local || '',
        localEndereco: data.endereco || '',
        status: data.status || 'pendente'
      });
      
      setCategorias(data.categoria ? [data.categoria] : []);
      setTemLugarMarcado(data.tem_lugar_ma || false);
      setTaxa({
        taxaComprador: data.TaxaCliente || 15,
        taxaProdutor: data.TaxaProdutor || 5
      });
      setImagemAtual(data.imagem_url || '');
      
    } catch (error) {
      console.error('❌ Erro ao carregar evento:', error);
      alert('Erro ao carregar evento: ' + error.message);
      router.push('/admin/bokunohero');
    } finally {
      setCarregando(false);
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
        return;
      }
      if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/gif')) {
        alert('Por favor, selecione apenas imagens nos formatos JPG, PNG ou GIF.');
        return;
      }
      
      setNovaImagem(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClickUpload = () => fileInputRef.current.click();
  
  const removerNovaImagem = () => {
    setNovaImagem(null);
    setImagemPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (salvando) return;

    if (!formData.titulo || !formData.descricao || !formData.data || !formData.hora || !formData.localNome) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }
    
    if (categorias.length === 0) {
      alert('Por favor, selecione pelo menos uma categoria!');
      return;
    }

    setSalvando(true);
    let publicUrl = imagemAtual; // Mantém a imagem atual por padrão
    let uploadedFilePath = null;

    try {
      // --- UPLOAD DE NOVA IMAGEM (SE HOUVER) ---
      if (novaImagem) {
        console.log('📤 Fazendo upload da nova imagem...');
        
        const fileExtension = novaImagem.name.split('.').pop();
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const filePath = `eventos/${evento.user_id}/${timestamp}-${randomStr}.${fileExtension}`;
        uploadedFilePath = filePath;

        const { error: uploadError } = await supabase.storage
          .from('imagens_eventos')
          .upload(filePath, novaImagem, { 
            cacheControl: '3600', 
            upsert: false 
          });

        if (uploadError) {
          console.error('❌ Erro no upload:', uploadError);
          throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('imagens_eventos')
          .getPublicUrl(filePath);
        
        publicUrl = publicUrlData.publicUrl;
        console.log('✅ Nova imagem uploaded:', publicUrl);
        
        // Remove a imagem antiga se houver
        if (imagemAtual && imagemAtual.includes('imagens_eventos')) {
          const oldPath = imagemAtual.split('/imagens_eventos/')[1];
          if (oldPath) {
            await supabase.storage.from('imagens_eventos').remove([oldPath]);
            console.log('🗑️ Imagem antiga removida');
          }
        }
      }

      // --- ATUALIZA OS DADOS DO EVENTO ---
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
        status: formData.status
      };

      console.log('💾 Atualizando evento...', eventData);
      
      const { error: updateError } = await supabase
        .from('eventos')
        .update(eventData)
        .eq('id', eventoId);

      if (updateError) {
        console.error('❌ Erro na atualização:', updateError);
        
        // Remove a nova imagem se o evento não foi atualizado
        if (uploadedFilePath) {
          await supabase.storage.from('imagens_eventos').remove([uploadedFilePath]);
        }
        
        throw new Error(`Erro ao atualizar evento: ${updateError.message}`);
      }
      
      console.log('✅ Evento atualizado com sucesso!');
      alert('✅ Evento atualizado com sucesso!');
      router.push('/admin/bokunohero');

    } catch (error) {
      console.error('💥 Erro ao salvar:', error);
      alert(`❌ Erro ao atualizar evento: ${error.message}`);
    } finally {
      setSalvando(false);
    }
  };

  const cancelar = () => {
    if (confirm('Deseja realmente cancelar? As alterações não salvas serão perdidas.')) {
      router.push('/admin/bokunohero');
    }
  };

  if (carregando) {
    return (
      <div className="admin-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Carregando evento...</h2>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="admin-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Evento não encontrado</h2>
        <button onClick={() => router.push('/admin/bokunohero')} className="btn-submit">
          Voltar ao Admin
        </button>
      </div>
    );
  }

  return (
    <div className="publicar-evento-container">
      <div className="edit-header" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        color: 'white'
      }}>
        <h1>✏️ Editar Evento</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          ID: {eventoId} | Produtor: {evento.user_id}
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* STATUS DO EVENTO */}
        <div className="form-section">
          <h2>Status do Evento</h2>
          <div className="form-group">
            <label>Status Atual:</label>
            <select 
              name="status" 
              value={formData.status}
              onChange={handleFormChange}
              style={{ 
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '2px solid #ddd'
              }}
            >
              <option value="pendente">⏳ Pendente</option>
              <option value="aprovado">✅ Aprovado</option>
              <option value="rejeitado">❌ Rejeitado</option>
            </select>
          </div>
        </div>

        {/* INFORMAÇÕES BÁSICAS */}
        <div className="form-section">
          <h2>Informações Básicas</h2>
          
          <div className="form-group">
            <label>Título do Evento *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleFormChange}
              placeholder="Ex: Show da Banda X"
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição do Evento *</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleFormChange}
              placeholder="Descreva o evento..."
              rows="5"
              required
            />
          </div>

          {/* IMAGEM */}
          <div className="form-group">
            <label>Imagem do Evento</label>
            
            {/* Imagem Atual */}
            {imagemAtual && !imagemPreview && (
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Imagem Atual:</p>
                <img 
                  src={imagemAtual} 
                  alt="Imagem atual" 
                  style={{ 
                    maxWidth: '300px', 
                    borderRadius: '8px',
                    border: '2px solid #ddd'
                  }} 
                />
              </div>
            )}

            {/* Preview da Nova Imagem */}
            {imagemPreview && (
              <div className="image-preview-container" style={{ marginBottom: '15px' }}>
                <p style={{ fontWeight: 'bold', color: '#4caf50' }}>✨ Nova Imagem:</p>
                <img src={imagemPreview} alt="Preview" className="image-preview" />
                <button type="button" onClick={removerNovaImagem} className="btn-remove-image">
                  Cancelar Nova Imagem
                </button>
              </div>
            )}

            {/* Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <button 
              type="button" 
              onClick={handleClickUpload}
              className="btn-submit"
              style={{ background: '#2196F3', marginTop: '10px' }}
            >
              📷 {imagemPreview ? 'Escolher Outra Imagem' : 'Alterar Imagem'}
            </button>
            <small style={{ display: 'block', marginTop: '5px' }}>
              Deixe em branco para manter a imagem atual
            </small>
          </div>

          <CategoriaSelector 
            onCategoriasChange={setCategorias}
            categoriasIniciais={categorias}
          />

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
            <label>Endereço do Local</label>
            <input
              type="text"
              name="localEndereco"
              value={formData.localEndereco}
              onChange={handleFormChange}
              placeholder="Ex: Rua Exemplo, 123"
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

        {/* CONFIGURAÇÕES */}
        <div className="form-section">
          <h2>Configurações</h2>
          
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

          <SelecionarTaxa 
            onTaxaSelecionada={setTaxa}
            taxaInicial={taxa}
          />
        </div>

        {/* BOTÕES */}
        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
          <button 
            type="submit" 
            className="btn-submit"
            disabled={salvando}
            style={{ flex: 1 }}
          >
            {salvando ? '💾 Salvando...' : '💾 Salvar Alterações'}
          </button>
          
          <button 
            type="button"
            onClick={cancelar}
            className="btn-submit"
            disabled={salvando}
            style={{ flex: 1, background: '#666' }}
          >
            ❌ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
