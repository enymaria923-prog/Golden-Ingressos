'use client';
import React, { useState } from 'react';
import { supabase } from '../../utils/supabase/client'; // ✅ CORRETO
import { useRouter } from 'next/navigation';
import './PublicarEvento.css';

const PublicarEvento = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    data: '',
    hora: '',
    local: '',
    localizacao: ''
  });
  
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    if (!formData.nome || !formData.descricao || !formData.data || !formData.hora || !formData.local) {
      alert('Preencha todos os campos!');
      setEnviando(false);
      return;
    }

    try {
      const { data: evento, error } = await supabase
        .from('eventos')
        .insert([
          {
            nome: formData.nome,
            descricao: formData.descricao,
            data: formData.data,
            hora: formData.hora,
            local: formData.local,
            localizacao: formData.localizacao,
            status: 'pendente',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      alert('✅ Evento enviado para moderação!');
      router.push('/admin/bokunchero');
      
      setFormData({
        nome: '',
        descricao: '',
        data: '',
        hora: '',
        local: '',
        localizacao: ''
      });
      
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro: ' + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="publicar-evento-container">
      <h1>Publicar Novo Evento</h1>
      
      <form onSubmit={handleSubmit}>
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
            placeholder="Descreva o evento..."
            required
          />
        </div>

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
          <label>Endereço</label>
          <input
            type="text"
            value={formData.localizacao}
            onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
            placeholder="Rua, número - Bairro"
          />
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

        <button type="submit" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Publicar Evento'}
        </button>
      </form>
    </div>
  );
};

export default PublicarEvento;
