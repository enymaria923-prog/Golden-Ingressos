'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client'
// TRÊS pontos duplos!
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
      
      const { data: eventos, error } = await supabase
        .from('eventos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Eventos encontrados:', eventos);
      setEventos(eventos || []);
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
            <h3>{evento.nome}</h3>
            <p><strong>Data:</strong> {evento.data} {evento.hora}</p>
            <p><strong>Local:</strong> {evento.local}</p>
            <p><strong>Status:</strong> {evento.status || 'pendente'}</p>
            
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
