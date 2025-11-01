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
      console.log('🔍 Buscando eventos no Supabase...');
      
      // Buscar eventos com todas as relações
      const { data: eventos, error } = await supabase
        .from('eventos')
        .select(`
          *,
          taxas_evento (*),
          setores (
            *,
            tipos_ingresso (*)
          ),
          profiles!eventos_user_id_fkey (nome, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ Eventos carregados:', eventos);

      // Formatar os dados com informações REAIS
      const eventosFormatados = eventos.map(evento => {
        // Calcular vendas totais (simulação - você precisará criar tabela de vendas)
        const totalVendidos = evento.ingressos_vendidos || 0;
        const faturamentoBruto = totalVendidos * (evento.preco || 0);
        const taxaComprador = evento.taxas_evento?.[0]?.taxa_comprador || 15;
        const taxaProdutor = evento.taxas_evento?.[0]?.taxa_produtor || 5;
        
        const taxaValor = faturamentoBruto * (taxaComprador / 100);
        const valorProdutor = faturamentoBruto * (1 - (taxaProdutor / 100));
        const lucroPlataforma = taxaValor - (faturamentoBruto * (taxaProdutor / 100));

        return {
          id: evento.id,
          titulo: evento.nome,
          descricao: evento.descricao,
          data: evento.data,
          hora: evento.hora,
          localNome: evento.local,
          localEndereco: evento.localizacao,
          categorias: evento.categoria ? evento.categoria.split(',') : [],
          temLugarMarcado: evento.tem_lugar_marcado,
          taxa: evento.taxas_evento?.[0] || { 
            taxa_comprador: taxaComprador, 
            taxa_produtor: taxaProdutor 
          },
          status: evento.status || 'pendente',
          imagemUrl: evento.imagem_url,
          createdAt: evento.created_at,
          produtor: {
            nome: evento.profiles?.nome || 'Produtor',
            email: evento.profiles?.email || 'produtor@email.com'
          },
          setores: evento.setores?.map(setor => ({
            id: setor.id,
            nome: setor.nome,
            capacidadeTotal: setor.capacidade_total,
            tiposIngresso: setor.tipos_ingresso?.map(tipo => ({
              id: tipo.id,
              nome: tipo.nome,
              preco: parseFloat(tipo.preco),
              quantidade: tipo.quantidade,
              vendidos: tipo.vendidos || 0
            })) || []
          })) || [],
          // Dados financeiros
          totalVendidos: totalVendidos,
          faturamentoBruto: faturamentoBruto,
          taxaValor: taxaValor,
          valorProdutor: valorProdutor,
          lucroPlataforma: lucroPlataforma
        };
      });

      setEventos(eventosFormatados);
    } catch (error) {
      console.error('❌ Erro ao carregar eventos:', error);
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
      
      alert('✅ Evento aprovado!');
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
      
      alert('❌ Evento rejeitado!');
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
      hoje.setHours(0, 0, 0, 0);
      
      switch (filtros.data) {
        case 'ultimos5dias':
          const cincoDiasAtras = new Date(hoje);
          cincoDiasAtras.setDate(hoje.getDate() - 5);
          eventosFiltrados = eventosFiltrados.filter(evento => {
            const dataEvento = new Date(evento.createdAt);
            return dataEvento >= cincoDiasAtras;
          });
          break;
        case 'proximos5dias':
          const cincoDiasFrente = new Date(hoje);
          cincoDiasFrente.setDate(hoje.getDate() + 5);
          eventosFiltrados = eventosFiltrados.filter(evento => {
            const dataEvento = new Date(evento.data);
            return dataEvento <= cincoDiasFrente && dataEvento >= hoje;
          });
          break;
        case 'hoje':
          eventosFiltrados = eventosFiltrados.filter(evento => {
            const dataEvento = new Date(evento.data);
            return dataEvento.toDateString() === hoje.toDateString();
          });
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
