'use client';
import React, { useState } from 'react';
import SetorManager from './components/SetorManager';
import CategoriaSelector from './components/CategoriaSelector';
import SelecionarTaxa from './components/SelecionarTaxa';
import './PublicarEvento.css';

const PublicarEvento = () => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
    localNome: '',      // Nome do local (ex: Teatro Elis Regina)
    localEndereco: ''   // Endereço (opcional)
  });
  
  const [categorias, setCategorias] = useState([]);
  const [temLugarMarcado, setTemLugarMarcado] = useState(false);
  const [taxa, setTaxa] = useState({ 
    taxaComprador: 15, 
    taxaProdutor: 5 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!formData.titulo || !formData.descricao || !formData.data || !formData.hora || !formData.localNome) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    if (categorias.length === 0) {
      alert('Por favor, selecione pelo menos uma categoria!');
      return;
    }
    
    const dadosEvento = {
      ...formData,
      categorias,
      temLugarMarcado,
      taxa,
      status: 'pending'
    };

    console.log('Dados do evento para moderação:', dadosEvento);
    alert('Evento enviado para moderação! Em breve estará disponível no site.');
    
    // Limpar formulário após envio
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

          <CategoriaSelector onCategoriasChange={setCategorias} />

          {/* NOVOS CAMPOS DE LOCAL SIMPLES */}
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

        {/* Configuração de Assentos - SEM ALERTA */}
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

        <button type="submit" className="btn-submit">
          🚀 Publicar Evento
        </button>
      </form>
    </div>
  );
};

export default PublicarEvento;
