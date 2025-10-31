'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SetorManager from './components/SetorManager';
import CategoriaSelector from './components/CategoriaSelector';
import LocalSearch from './components/LocalSearch';
import SelecionarTaxa from './components/SelecionarTaxa';
import './PublicarEvento.css';

const PublicarEvento = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
  });
  
  const [categorias, setCategorias] = useState([]);
  const [local, setLocal] = useState('');
  const [temLugarMarcado, setTemLugarMarcado] = useState(false);
  const [taxa, setTaxa] = useState({ taxaComprador: 15, taxaProdutor: 5 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dadosEvento = {
      ...formData,
      categorias,
      local,
      temLugarMarcado,
      taxa,
      status: 'pending'
    };

    console.log('Dados do evento:', dadosEvento);
    alert('Evento enviado para moderação!');
    // Aqui você vai conectar com seu backend depois
  };

  return (
    <div className="publicar-evento-container">
      <h1>Publicar Novo Evento</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título do Evento *</label>
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Descrição *</label>
          <textarea
            value={formData.descricao}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            required
          />
        </div>

        <CategoriaSelector onCategoriasChange={setCategorias} />

        <LocalSearch onLocalSelect={setLocal} />

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
            <label>Hora *</label>
            <input
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({...formData, hora: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={temLugarMarcado}
              onChange={(e) => setTemLugarMarcado(e.target.checked)}
            />
            Evento com lugar marcado
          </label>
          <small>Os compradores poderão escolher assentos específicos</small>
        </div>

        {temLugarMarcado && (
          <div className="mapa-assentos-alerta">
            <p>⚠️ Configuração de mapa de assentos necessária</p>
            <button 
              type="button" 
              onClick={() => router.push('/configurar-mapa-assentos')}
              className="btn-primary"
            >
              Configurar Mapa de Assentos
            </button>
          </div>
        )}

        <SetorManager />

        {/* NOVO COMPONENTE DE TAXAS */}
        <SelecionarTaxa onTaxaSelecionada={setTaxa} />

        <button type="submit" className="btn-submit">
          Enviar para Moderação
        </button>
      </form>
    </div>
  );
};

export default PublicarEvento;
