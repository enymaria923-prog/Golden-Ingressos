'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../utils/supabase/client';
import FiltrosAdmin from './components/FiltrosAdmin';
import ListaEventosAdmin from './components/ListaEventosAdmin';
import DetalhesEventoModal from './components/DetalhesEventoModal';
import './admin.css';

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
      // Buscar eventos com todas as relações da tabela "eventos"
      const { data: eventos, error } = await supabase
        .from('eventos')
        .select(`
          *,
          taxas_evento (*),
          setores (
            *,
            tipos_ingresso (*),
            assentos (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Eventos carregados:', eventos);

      // Formatar os dados
      const eventosFormatados = eventos.map(evento => ({
        id: evento.id,
        titulo: evento.nome,
        descricao: evento.descricao,
        data: evento.data,
        hora: evento.hora,
        localNome: evento.local,
        localEndereco: evento.localizacao,
        categorias: evento.categoria ? evento.categoria.split(',') : [],
        temLugarMarcado: evento.tem_lugar_marcado,
        taxa: evento.taxas_evento?.[0] || { taxa_comprador: 15, taxa_produtor: 5 },
        status: evento.status || 'pendente',
        imagemUrl: evento.imagem,
        createdAt: evento.created_at,
        produtor: {
          nome: 'Produtor',
          email: 'produtor@email.com'
        },
        setores: evento.setores.map(setor => ({
          id: setor.id,
          nome: setor.nome,
          capacidadeTotal: setor.capacidade_total,
          tiposIngresso: setor.tipos_ingresso.map(tipo => ({
            id: tipo.id,
            nome: tipo.nome,
            preco: parseFloat(tipo.preco),
            quantidade: tipo.quantidade,
            vendidos: tipo.vendidos || 0
          })),
          assentos: setor.assentos || []
        }))
      }));

      setEventos(eventosFormatados);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      alert('Erro ao carregar eventos: ' + error.message);
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
      
      carregarEventos();
    } catch (error) {
      console.error('Erro ao aprovar evento:', error);
      alert('Erro ao aprovar evento: ' + error.message);
    }
  };

  const rejeitarEvento = async (eventoId) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .update({ status: 'rejeitado' })
        .eq('id', eventoId);

      if (error) throw error;
      
      carregarEventos();
    } catch (error) {
      console.error('Erro ao rejeitar evento:', error);
      alert('Erro ao rejeitar evento: ' + error.message);
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

      <button onClick={carregarEventos} className="btn-recargar">
        🔄 Recarregar Eventos
      </button>

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

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="admin-loading">Carregando...</div>}>
      <AdminContent />
    </Suspense>
  );
}
