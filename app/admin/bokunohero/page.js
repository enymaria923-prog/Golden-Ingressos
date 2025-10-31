'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FiltrosAdmin from './components/FiltrosAdmin';
import ListaEventosAdmin from './components/ListaEventosAdmin';
import DetalhesEventoModal from './components/DetalhesEventoModal';
import './admin.css';

// Componente principal que usa useSearchParams
function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({
    data: 'todos',
    produtor: '',
    status: 'todos'
  });

  // Verificação de senha
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
      // Dados mockados - substitua pela sua API
      const eventosMock = [
        {
          id: 1,
          titulo: 'Show da Banda Rock',
          descricao: 'Um show incrível da banda de rock',
          data: '2024-02-15',
          hora: '20:00',
          localNome: 'Teatro Elis Regina',
          localEndereco: 'Rua das Flores, 123 - Centro',
          categorias: ['Rock', 'Show'],
          temLugarMarcado: true,
          taxa: { taxaComprador: 15, taxaProdutor: 5 },
          status: 'aprovado',
          produtor: {
            nome: 'João Silva',
            email: 'joao@empresa.com',
            telefone: '(11) 99999-9999',
            documento: '123.456.789-00',
            banco: 'Banco do Brasil',
            agencia: '1234',
            conta: '56789-0',
            tipo: 'Pessoa Física'
          },
          setores: [
            {
              nome: 'Pista',
              capacidadeTotal: 100,
              tiposIngresso: [
                { nome: 'Inteira', preco: 50, quantidade: 100, vendidos: 80 },
                { nome: 'Meia', preco: 25, quantidade: 50, vendidos: 45 }
              ]
            }
          ],
          createdAt: '2024-01-10T10:00:00Z'
        }
      ];
      setEventos(eventosMock);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setCarregando(false);
    }
  };

  const filtrarEventos = () => {
    let eventosFiltrados = [...eventos];
    
    if (filtros.data !== 'todos') {
      const hoje = new Date();
      switch (filtros.data) {
        case 'ultimos5dias':
          const cincoDiasAtras = new Date(hoje);
          cincoDiasAtras.setDate(hoje.getDate() - 5);
          eventosFiltrados = eventosFiltrados.filter(evento => 
            new Date(evento.createdAt) >= cincoDiasAtras
          );
          break;
        case 'proximos5dias':
          const cincoDiasFrente = new Date(hoje);
          cincoDiasFrente.setDate(hoje.getDate() + 5);
          eventosFiltrados = eventosFiltrados.filter(evento => 
            new Date(evento.data) <= cincoDiasFrente && 
            new Date(evento.data) >= hoje
          );
          break;
        case 'hoje':
          eventosFiltrados = eventosFiltrados.filter(evento => 
            new Date(evento.data).toDateString() === hoje.toDateString()
          );
          break;
      }
    }

    if (filtros.produtor) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.produtor.nome.toLowerCase().includes(filtros.produtor.toLowerCase())
      );
    }

    if (filtros.status !== 'todos') {
      eventosFiltrados = eventosFiltrados.filter(evento => 
        evento.status === filtros.status
      );
    }

    eventosFiltrados.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return eventosFiltrados;
  };

  const aprovarEvento = (eventoId) => {
    setEventos(eventos.map(evento => 
      evento.id === eventoId ? { ...evento, status: 'aprovado' } : evento
    ));
  };

  const rejeitarEvento = (eventoId) => {
    setEventos(eventos.map(evento => 
      evento.id === eventoId ? { ...evento, status: 'rejeitado' } : evento
    ));
  };

  const eventosFiltrados = filtrarEventos();

  if (carregando) {
    return <div className="admin-loading">Carregando eventos...</div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>🏛️ Área de Moderação - Golden Ingressos</h1>
        <div className="admin-stats">
          <span>Total: {eventos.length} eventos</span>
          <span>Aprovados: {eventos.filter(e => e.status === 'aprovado').length}</span>
          <span>Pendentes: {eventos.filter(e => e.status === 'pendente').length}</span>
        </div>
      </header>

      <FiltrosAdmin filtros={filtros} setFiltros={setFiltros} />

      <ListaEventosAdmin
        eventos={eventosFiltrados}
        onAprovar={aprovarEvento}
        onRejeitar={rejeitarEvento}
        onEditar={(evento) => router.push(`/admin/bokunohero/editar/${evento.id}?senha=valtinho`)}
        onVerDetalhes={(evento) => {
          setEventoSelecionado(evento);
          setMostrarDetalhes(true);
        }}
      />

      {mostrarDetalhes && eventoSelecionado && (
        <DetalhesEventoModal
          evento={eventoSelecionado}
          onClose={() => setMostrarDetalhes(false)}
        />
      )}
    </div>
  );
}

// Componente principal com Suspense
export default function AdminPage() {
  return (
    <Suspense fallback={<div className="admin-loading">Carregando...</div>}>
      <AdminContent />
    </Suspense>
  );
}
