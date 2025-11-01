// app/admin/bokunohero/page.js
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import './admin.css';

// CORREÇÃO: Removemos a inicialização global para evitar erros de Server Component.
// A instância do cliente Supabase será criada DENTRO da função carregarEventos.

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
    // CORREÇÃO: Inicializa o cliente Supabase AQUI, dentro da função, 
    // garantindo que o objeto 'supabase' exista no runtime do cliente.
    const supabase = createClient(); 

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

  // Os callbacks aprovarEvento e rejeitarEvento também precisam da instância.
  // Vamos reescrevê-los para garantir a instância local.
  const aprovarEvento = async (eventoId) => {
    const supabase = createClient(); // Inicializa localmente
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
    const supabase = createClient(); // Inicializa localmente
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
          <span>Pendentes: {eventos.filter(e => e.status === 'pendente' || !e.status).length}</span>
        </div>
      </header>

      <button onClick={carregarEventos} className="btn-recargar">
        Recarregar Eventos
      </button>

      <div className="eventos-list">
        {eventos.length === 0 ? (
          <p className="no-events">Nenhum evento encontrado ou erro de permissão.</p>
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
