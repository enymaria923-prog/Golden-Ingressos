'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../../utils/supabase/client';
import './admin.css';

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const senha = searchParams.get('senha');
    if (senha !== 'valtinho') {
      alert('Acesso não autorizado!');
      router.push('/');
      return;
    }
    carregarEventos();
  }, [searchParams, router]);

  const carregarEventos = async () => {
    try {
      console.log('Buscando eventos...');
      
      // Buscar TODOS os eventos sem filtro complexo
      const { data: eventos, error } = await supabase
        .from('eventos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro:', error);
        throw error;
      }

      console.log('Eventos encontrados:', eventos);

      // Formatar dados básicos
      const eventosFormatados = eventos.map(evento => ({
        id: evento.id,
        titulo: evento.nome,
        descricao: evento.descricao,
        data: evento.data,
        hora: evento.hora,
        localNome: evento.local,
        status: evento.status || 'pendente',
        imagemUrl: evento.imagem_url,
        createdAt: evento.created_at || evento.data
      }));

      setEventos(eventosFormatados);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      alert('Erro: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const aprovarEvento = async (eventoId) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .update({ status: 'aprovado' })
        .eq('id', eventoId);

      if (error) throw error;
      
      alert('Evento aprovado!');
      carregarEventos();
    } catch (error) {
      console.error('Erro ao aprovar evento:', error);
      alert('Erro: ' + error.message);
    }
  };

  const rejeitarEvento = async (eventoId) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .update({ status: 'rejeitado' })
        .eq('id', eventoId);

      if (error) throw error;
      
      alert('Evento rejeitado!');
      carregarEventos();
    } catch (error) {
      console.error('Erro ao rejeitar evento:', error);
      alert('Erro: ' + error.message);
    }
  };

  if (carregando) {
    return <div className="admin-loading">Carregando eventos...</div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Área de Moderação - Golden Ingressos</h1>
        <div className="admin-stats">
          <span>Total: {eventos.length} eventos</span>
          <span>Aprovados: {eventos.filter(e => e.status === 'aprovado').length}</span>
          <span>Pendentes: {eventos.filter(e => e.status === 'pendente').length}</span>
        </div>
      </header>

      <button onClick={carregarEventos} className="btn-recargar">
        Recarregar Eventos
      </button>

      <div className="eventos-list">
        {eventos.map(evento => (
          <div key={evento.id} className="evento-card">
            <h3>{evento.titulo}</h3>
            <p><strong>Data:</strong> {evento.data} {evento.hora}</p>
            <p><strong>Local:</strong> {evento.localNome}</p>
            <p><strong>Status:</strong> {evento.status}</p>
            
            <div className="evento-actions">
              <button 
                onClick={() => aprovarEvento(evento.id)} 
                className="btn-aprovar"
                disabled={evento.status === 'aprovado'}
              >
                ✅ Aprovar
              </button>
              <button 
                onClick={() => rejeitarEvento(evento.id)} 
                className="btn-rejeitar"
                disabled={evento.status === 'rejeitado'}
              >
                ❌ Rejeitar
              </button>
              <button 
                onClick={() => router.push(`/admin/bokunohero/editar/${evento.id}?senha=valtinho`)}
                className="btn-editar"
              >
                ✏️ Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="admin-loading">Carregando...</div>}>
      <AdminContent />
    </Suspense>
  );
}
