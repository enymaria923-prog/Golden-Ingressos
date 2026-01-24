'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const EditarEvento = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [evento, setEvento] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const senha = searchParams.get('senha');
    if (senha !== 'valtinho') {
      alert('Acesso não autorizado!');
      router.push('/');
      return;
    }
    // Simular carregamento do evento
    setTimeout(() => {
      setEvento({
        id: params.id,
        titulo: 'Show da Banda Rock',
        descricao: 'Um show incrível da banda de rock',
        data: '2024-02-15',
        hora: '20:00',
        localNome: 'Teatro Elis Regina',
        localEndereco: 'Rua das Flores, 123 - Centro',
        categorias: ['Rock', 'Show'],
        temLugarMarcado: true,
        status: 'aprovado'
      });
      setCarregando(false);
    }, 1000);
  }, [params.id]);

  const handleSalvar = () => {
    alert('Evento salvo com sucesso!');
    router.push('/admin/bokunohero?senha=valtinho');
  };

  if (carregando) {
    return <div className="admin-loading">Carregando evento...</div>;
  }

  return (
    <div className="editar-evento-container">
      <header className="editar-header">
        <h1>✏️ Editando Evento: {evento.titulo}</h1>
        <button 
          className="btn-voltar"
          onClick={() => router.push('/admin/bokunohero?senha=valtinho')}
        >
          ← Voltar para Moderação
        </button>
      </header>

      <div className="editar-form">
        <div className="form-group">
          <label>Título do Evento</label>
          <input
            type="text"
            value={evento.titulo}
            onChange={(e) => setEvento({...evento, titulo: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <textarea
            value={evento.descricao}
            onChange={(e) => setEvento({...evento, descricao: e.target.value})}
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Data</label>
            <input
              type="date"
              value={evento.data}
              onChange={(e) => setEvento({...evento, data: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Hora</label>
            <input
              type="time"
              value={evento.hora}
              onChange={(e) => setEvento({...evento, hora: e.target.value})}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Local</label>
          <input
            type="text"
            value={evento.localNome}
            onChange={(e) => setEvento({...evento, localNome: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Endereço</label>
          <input
            type="text"
            value={evento.localEndereco}
            onChange={(e) => setEvento({...evento, localEndereco: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            value={evento.status}
            onChange={(e) => setEvento({...evento, status: e.target.value})}
          >
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
          </select>
        </div>

        <div className="form-actions">
          <button className="btn-salvar" onClick={handleSalvar}>
            💾 Salvar Alterações
          </button>
          <button 
            className="btn-cancelar"
            onClick={() => router.push('/admin/bokunohero?senha=valtinho')}
          >
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarEvento;
