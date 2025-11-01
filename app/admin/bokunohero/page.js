// app/admin/bokunohero/page.js
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
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
    // 1. Inicializa o cliente Supabase aqui
    const supabase = createClient(); 
    setCarregando(true); // Garante que o estado de loading é ativado.

    try {
      console.log('Buscando eventos...');
      
      const { data: eventosData, error } = await supabase
        .from('eventos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Se houver um erro de Supabase, lançamos.
        throw error;
      }

      console.log('Eventos encontrados:', eventosData);
      setEventos(eventosData || []);
    } catch (error) {
      console.error('ERRO CRÍTICO AO CARREGAR EVENTOS:', error);
      alert('Erro ao carregar dados do banco de dados: ' + error.message);
      setEventos([]); // Limpa a lista em caso de erro.
    } finally {
      // 2. Garante que o estado de loading seja desligado, aconteça o que acontecer.
      setCarregando(false); 
      console.log('Carregamento finalizado.');
    }
  };

  const aprovarEvento = async (eventoId) => {
    const supabase = createClient(); 
    try {
      const { error } = await supabase
        .from('eventos')
        .update({ status: 'aprovado' })
        .eq('id', eventoId);
      if (error) throw error;
      alert('Evento aprovado!');
      carregarEventos();
    } catch (error) {
      alert('Erro ao aprovar: ' + error.message);
    }
  };

  const rejeitarEvento = async (eventoId) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('eventos')
        .update({ status: 'rejeitado' })
        .eq('id', eventoId);
      if (error) throw error;
      alert('Evento rejeitado!');
      carregarEventos();
    } catch (error) {
      alert('Erro ao rejeitar: ' + error.message);
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
          <span>Pendentes: {eventos.filter(e => e.status === 'pendente' || !e.status).length}</span>
        </div>
      </header>

      <button onClick={carregarEventos} className="btn-recargar">
        Recarregar Eventos
      </button>

      <div className="eventos-list">
        {eventos.length === 0 ? (
          <p className="no-events">Nenhum evento encontrado ou erro de permissão/conexão.</p>
        ) : (
          eventos.map(evento => (
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
          ))
        )}
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
