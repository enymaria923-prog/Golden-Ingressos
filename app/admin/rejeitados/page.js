'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import Link from 'next/link';
import '../bokunohero/admin.css'; // Reutilizando o mesmo CSS da página admin

function RejeitadosContent() {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // ETAPA 1: Proteger a página.
    // Verifica se o usuário está logado (usando o sessionStorage que definimos antes)
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    if (!isLoggedIn) {
      alert('Acesso negado. Faça o login primeiro.');
      router.push('/admin/bokunohero'); // Redireciona para a página de login
      return;
    }
    
    // Se estiver logado, carrega os eventos rejeitados.
    carregarEventosRejeitados();
  }, [router]);

  const carregarEventosRejeitados = async () => {
    setCarregando(true);
    try {
      console.log('Buscando eventos REJEITADOS...');
      
      // ETAPA 2: Buscar apenas eventos com status 'rejeitado'
      const { data: eventosData, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('status', 'rejeitado') // <-- SÓ PEGA OS REJEITADOS
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Eventos rejeitados encontrados:', eventosData);
      setEventos(eventosData || []);
    } catch (error) {
      console.error('Erro ao carregar eventos rejeitados:', error);
      alert('Erro: ' + error.message);
    } finally {
      setCarregando(false);
    }
  };

  // ETAPA 3: Função para "Recuperar" o evento
  // Isso o move de volta para a fila de 'pendentes' na página principal
  const recuperarEvento = async (eventoId) => {
    if (!confirm('Tem certeza que deseja mover este evento de volta para "Pendentes"?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('eventos')
        .update({ status: 'pendente' }) // Define o status como 'pendente'
        .eq('id', eventoId);
        
      if (error) throw error;
      
      alert('Evento movido para "Pendentes"!');
      carregarEventosRejeitados(); // Recarrega a lista (o evento vai sumir daqui)
    } catch (error) {
      alert('Erro ao recuperar evento: ' + error.message);
    }
  };

  if (carregando) {
    return <div className="admin-loading">Carregando eventos rejeitados...</div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Eventos Rejeitados</h1>
        <div className="admin-stats">
          <span>Total de Rejeitados: {eventos.length}</span>
        </div>
        {/* Link para voltar à página principal de moderação */}
        <Link href="/admin/bokunohero" legacyBehavior>
          <a className="btn-logout" style={{top: '20px', right: '20px'}}>Voltar</a>
        </Link>
      </header>

      <button onClick={carregarEventosRejeitados} className="btn-recargar">
        Recarregar Lista
      </button>

      <div className="eventos-list">
        {eventos.length === 0 ? (
          <p className="no-events">Nenhum evento rejeitado encontrado.</p>
        ) : (
          eventos.map(evento => (
            <div key={evento.id} className="evento-card evento-rejeitado">
              <h3>{evento.nome}</h3>
              <p><strong>Data:</strong> {evento.data} {evento.hora}</p>
              <p><strong>Local:</strong> {evento.local}</p>
              <p><strong>Status:</strong> {evento.status}</p>
              
              <div className="evento-actions">
                <button 
                  onClick={() => recuperarEvento(evento.id)} 
                  className="btn-recuperar" // Você pode precisar estilizar este botão no seu .css
                >
                  ♻️ Mover para Pendentes
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Componente principal que usa Suspense
export default function RejeitadosPage() {
  return (
    <Suspense fallback={<div className="admin-loading">Carregando...</div>}>
      <RejeitadosContent />
    </Suspense>
  );
}
