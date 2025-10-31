'use client';
import React, { useState } from 'react';
import { supabase } from '../../../utils/supabase/client';
import SetorManager from './components/SetorManager';
import CategoriaSelector from './components/CategoriaSelector';
import SelecionarTaxa from './components/SelecionarTaxa';
import './PublicarEvento.css';

const PublicarEvento = () => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    data: '',
    hora: '',
    local: '',
    localizacao: '',
    online: false,
    preco: 0,
    categoria: '',
    total_ingressos: 0,
    ingressos_vendidos: 0
  });
  
  const [categorias, setCategorias] = useState([]);
  const [temLugarMarcado, setTemLugarMarcado] = useState(false);
  const [taxa, setTaxa] = useState({ 
    taxaComprador: 15, 
    taxaProdutor: 5 
  });
  const [imagem, setImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [setores, setSetores] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    
    // Validar campos obrigatórios
    if (!formData.nome || !formData.descricao || !formData.data || !formData.hora || !formData.local || !imagem) {
      alert('Por favor, preencha todos os campos obrigatórios, incluindo a imagem!');
      setEnviando(false);
      return;
    }

    if (categorias.length === 0) {
      alert('Por favor, selecione pelo menos uma categoria!');
      setEnviando(false);
      return;
    }

    if (setores.length === 0) {
      alert('Por favor, adicione pelo menos um setor com tipos de ingresso!');
      setEnviando(false);
      return;
    }

    try {
      // 1. Fazer upload da imagem
      let imagemUrl = '';
      if (imagem) {
        const nomeArquivo = `${Date.now()}-${imagem.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('eventos')
          .upload(nomeArquivo, imagem);

        if (uploadError) throw uploadError;

        // Obter URL pública
        const { data: urlData } = supabase.storage
          .from('eventos')
          .getPublicUrl(nomeArquivo);
        
        imagemUrl = urlData.publicUrl;
      }

      // Calcular total de ingressos
      const totalIngressos = setores.reduce((total, setor) => {
        return total + setor.tiposIngresso.reduce((sum, tipo) => sum + (tipo.quantidade || 0), 0);
      }, 0);

      // 2. Inserir evento principal na tabela "eventos"
      const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .insert([
          {
            nome: formData.nome,
            descricao: formData.descricao,
            data: formData.data,
            hora: formData.hora,
            local: formData.local,
            localizacao: formData.localizacao,
            online: formData.online,
            preco: formData.preco,
            categoria: categorias.join(','),
            imagem: imagemUrl,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            total_ingressos: totalIngressos,
            ingressos_vendidos: 0,
            controle_quantidade: 'PorTipo',
            tem_lugar_marcado: temLugarMarcado,
            status: 'pendente'
          }
        ])
        .select()
        .single();

      if (eventoError) throw eventoError;

      // 3. Inserir taxas
      const { error: taxaError } = await supabase
        .from('taxas_evento')
        .insert([
          {
            eventos_id: evento.id,
            taxa_comprador: taxa.taxaComprador,
            taxa_produtor: taxa.taxaProdutor
          }
        ]);

      if (taxaError) throw taxaError;

      // 4. Inserir setores e tipos de ingresso
      for (const setor of setores) {
        const { data: setorData, error: setorError } = await supabase
          .from('setores')
          .insert([
            {
              eventos_id: evento.id,
              nome: setor.nome,
              capacidade_total: setor.capacidadeTotal
            }
          ])
          .select()
          .single();

        if (setorError) throw setorError;

        // Inserir tipos de ingresso
        const tiposIngressoData = setor.tiposIngresso.map(tipo => ({
          setor_id: setorData.id,
          nome: tipo.nome,
          preco: tipo.preco,
          quantidade: tipo.quantidade
        }));

        const { error: tiposError } = await supabase
          .from('tipos_ingresso')
          .insert(tiposIngressoData);

        if (tiposError) throw tiposError;

        // Se for evento com lugar marcado, criar assentos
        if (temLugarMarcado && setor.capacidadeTotal) {
          const assentosData = [];
          for (let i = 1; i <= setor.capacidadeTotal; i++) {
            assentosData.push({
              setor_id: setorData.id,
              numero: i.toString(),
              fileira: 'A'
            });
          }

          const { error: assentosError } = await supabase
            .from('assentos')
            .insert(assentosData);

          if (assentosError) throw assentosError;
        }
      }

      alert('✅ Evento enviado para moderação! Agora aparecerá na área admin.');
      
      // Limpar formulário
      setFormData({
        nome: '',
        descricao: '',
        data: '',
        hora: '',
        local: '',
        localizacao: '',
        online: false,
        preco: 0,
        categoria: '',
        total_ingressos: 0,
        ingressos_vendidos: 0
      });
      setCategorias([]);
      setTemLugarMarcado(false);
      setTaxa({ taxaComprador: 15, taxaProdutor: 5 });
      setImagem(null);
      setImagemPreview(null);
      setSetores([]);
      
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert('Erro ao salvar evento: ' + error.message);
    } finally {
      setEnviando(false);
    }
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
      
      setImagem(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagemPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClickUpload = () => {
    document.querySelector('.image-input').click();
  };

  const removeImage = () => {
    setImagem(null);
    setImagemPreview(null);
    document.querySelector('.image-input').value = '';
  };

  return (
    <div className="publicar-evento-container">
      <h1>Publicar Novo Evento</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Informações Básicas</h2>
          
          <div className="form-group">
            <label>Nome do Evento *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              placeholder="Ex: Show da Banda X"
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição *</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Descreva detalhadamente o seu evento..."
              required
            />
          </div>

          <div className="form-group">
            <label>Imagem do Evento *</label>
            <div className="image-upload-container">
              <input
                type="file"
                className="image-input"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
                required
              />
              
              {imagemPreview ? (
                <div className="image-preview-container">
                  <img src={imagemPreview} alt="Preview" className="image-preview" />
                  <div className="image-info">
                    <p>✅ {imagem.name}</p>
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
            <label>Local *</label>
            <input
              type="text"
              value={formData.local}
              onChange={(e) => setFormData({...formData, local: e.target.value})}
              placeholder="Ex: Teatro Elis Regina"
              required
            />
          </div>

          <div className="form-group">
            <label>Localização/Endereço</label>
            <input
              type="text"
              value={formData.localizacao}
              onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
              placeholder="Ex: Rua Exemplo, 123 - Bairro - Cidade/Estado"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.online}
                onChange={(e) => setFormData({...formData, online: e.target.checked})}
              />
              Evento Online
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data *</label>
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

        <div className="form-section">
          <h2>Setores e Ingressos</h2>
          <SetorManager setores={setores} setSetores={setSetores} />
        </div>

        <div className="form-section">
          <h2>Configuração de Taxas</h2>
          <SelecionarTaxa onTaxaSelecionada={setTaxa} />
        </div>

        <button type="submit" className="btn-submit" disabled={enviando}>
          {enviando ? 'Enviando...' : '🚀 Publicar Evento'}
        </button>
      </form>
    </div>
  );
};

export default PublicarEvento;
