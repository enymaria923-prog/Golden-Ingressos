'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '../../../../../utils/supabase/client';
import Link from 'next/link';

export default function GerenciarSessoesPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const eventoId = params.id;
  
  const [evento, setEvento] = useState(null);
  const [sessoes, setSessoes] = useState([]);
  const [sessaoOriginal, setSessaoOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  const [mostrarModalCriar, setMostrarModalCriar] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [sessaoEditando, setSessaoEditando] = useState(null);
  
  const [novaData, setNovaData] = useState('');
  const [novaHora, setNovaHora] = useState('');
  const [editarData, setEditarData] = useState('');
  const [editarHora, setEditarHora] = useState('');

  const [sessaoExpandida, setSessaoExpandida] = useState(null);
  const [dadosSessao, setDadosSessao] = useState({});

  useEffect(() => {
    carregarDados();
  }, [eventoId]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Buscar evento
      const { data: eventoData, error: eventoError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      if (eventoError) throw eventoError;
      setEvento(eventoData);

      // Buscar sessões
      const { data: sessoesData, error: sessoesError } = await supabase
        .from('sessoes')
        .select('*')
        .eq('evento_id', eventoId)
        .order('numero', { ascending: true });

      if (sessoesError && sessoesError.code !== 'PGRST116') {
        throw sessoesError;
      }

      // Se não existem sessões, criar a sessão original automaticamente
      if (!sessoesData || sessoesData.length === 0) {
        console.log('⚠️ Nenhuma sessão encontrada. Criando sessão original...');
        await criarSessaoOriginalAutomatica(eventoData);
        return; // Recarrega após criar
      }

      setSessoes(sessoesData);
      const original = sessoesData.find(s => s.is_original) || sessoesData[0];
      setSessaoOriginal(original);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do evento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // NOVA FUNÇÃO: Cria sessão original automaticamente
  const criarSessaoOriginalAutomatica = async (eventoData) => {
    try {
      console.log('🔧 Criando sessão original para evento:', eventoData.nome);

      // Criar sessão original
      const { data: novaSessao, error: sessaoError } = await supabase
        .from('sessoes')
        .insert({
          evento_id: eventoData.id,
          data: eventoData.data,
          hora: eventoData.hora,
          numero: 1,
          is_original: true
        })
        .select()
        .single();

      if (sessaoError) throw sessaoError;

      console.log('✅ Sessão original criada:', novaSessao.id);

      // Vincular setores existentes à sessão
      await supabase
        .from('setores')
        .update({ sessao_id: novaSessao.id })
        .eq('eventos_id', eventoData.id)
        .is('sessao_id', null);

      // Vincular ingressos existentes à sessão
      await supabase
        .from('ingressos')
        .update({ sessao_id: novaSessao.id })
        .eq('evento_id', eventoData.id)
        .is('sessao_id', null);

      // Vincular lotes existentes à sessão
      await supabase
        .from('lotes')
        .update({ sessao_id: novaSessao.id })
        .eq('evento_id', eventoData.id)
        .is('sessao_id', null);

      // Vincular cupons existentes à sessão
      await supabase
        .from('cupons')
        .update({ sessao_id: novaSessao.id })
        .eq('evento_id', eventoData.id)
        .is('sessao_id', null);

      console.log('✅ Dados vinculados à sessão original');

      // Recarregar dados
      await carregarDados();

    } catch (error) {
      console.error('Erro ao criar sessão original:', error);
      alert('Erro ao criar sessão original: ' + error.message);
      setLoading(false);
    }
  };

  const carregarDadosSessao = async (sessaoId) => {
    try {
      const { data: setores } = await supabase
        .from('setores')
        .select('*')
        .eq('sessao_id', sessaoId);

      const { data: ingressos } = await supabase
        .from('ingressos')
        .select('*')
        .eq('sessao_id', sessaoId);

      const { data: lotes } = await supabase
        .from('lotes')
        .select('*')
        .eq('sessao_id', sessaoId);

      const { data: cupons } = await supabase
        .from('cupons')
        .select('*')
        .eq('sessao_id', sessaoId);

      setDadosSessao(prev => ({
        ...prev,
        [sessaoId]: {
          setores: setores || [],
          ingressos: ingressos || [],
          lotes: lotes || [],
          cupons: cupons || []
        }
      }));

    } catch (error) {
      console.error('Erro ao carregar dados da sessão:', error);
    }
  };

  const toggleSessao = async (sessaoId) => {
    if (sessaoExpandida === sessaoId) {
      setSessaoExpandida(null);
    } else {
      setSessaoExpandida(sessaoId);
      if (!dadosSessao[sessaoId]) {
        await carregarDadosSessao(sessaoId);
      }
    }
  };

  const clonarDadosSessao = async (sessaoOrigemId, sessaoDestinoId) => {
    try {
      // Clonar setores
      const { data: setores } = await supabase
        .from('setores')
        .select('*')
        .eq('sessao_id', sessaoOrigemId);

      if (setores && setores.length > 0) {
        const setoresClonados = setores.map(s => ({
          eventos_id: s.eventos_id,
          sessao_id: sessaoDestinoId,
          nome: s.nome,
          capacidade_definida: s.capacidade_definida,
          capacidade_calculada: s.capacidade_calculada
        }));

        await supabase.from('setores').insert(setoresClonados);
      }

      // Clonar lotes
      const { data: lotes } = await supabase
        .from('lotes')
        .select('*')
        .eq('sessao_id', sessaoOrigemId);

      const lotesMap = new Map(); // Mapear IDs antigos -> novos

      if (lotes && lotes.length > 0) {
        for (const lote of lotes) {
          const { data: novoLote } = await supabase
            .from('lotes')
            .insert({
              evento_id: lote.evento_id,
              sessao_id: sessaoDestinoId,
              setor: lote.setor,
              nome: lote.nome,
              quantidade_total: lote.quantidade_total,
              quantidade_vendida: 0,
              data_inicio: lote.data_inicio,
              data_fim: lote.data_fim,
              ativo: lote.ativo,
              user_id: lote.user_id
            })
            .select()
            .single();

          if (novoLote) {
            lotesMap.set(lote.id, novoLote.id);
          }
        }
      }

      // Clonar ingressos
      const { data: ingressos } = await supabase
        .from('ingressos')
        .select('*')
        .eq('sessao_id', sessaoOrigemId);

      if (ingressos && ingressos.length > 0) {
        const ingressosClonados = ingressos.map(i => ({
          evento_id: i.evento_id,
          sessao_id: sessaoDestinoId,
          setor: i.setor,
          tipo: i.tipo,
          valor: i.valor,
          quantidade: i.quantidade,
          vendidos: 0,
          lote_id: i.lote_id ? lotesMap.get(i.lote_id) : null,
          status_ingresso: 'disponivel',
          user_id: i.user_id,
          codigo: Date.now() + Math.random()
        }));

        await supabase.from('ingressos').insert(ingressosClonados);
      }

      // Clonar cupons
      const { data: cupons } = await supabase
        .from('cupons')
        .select('*')
        .eq('sessao_id', sessaoOrigemId);

      if (cupons && cupons.length > 0) {
        const cuponsClonados = cupons.map(c => ({
          evento_id: c.evento_id,
          sessao_id: sessaoDestinoId,
          codigo: `${c.codigo}_S${sessoes.length + 1}`,
          descricao: c.descricao,
          tipo_desconto: c.tipo_desconto,
          valor_desconto: c.valor_desconto,
          quantidade_total: c.quantidade_total,
          quantidade_usada: 0,
          ativo: c.ativo,
          data_validade_inicio: c.data_validade_inicio,
          data_validade_fim: c.data_validade_fim
        }));

        await supabase.from('cupons').insert(cuponsClonados);
      }

    } catch (error) {
      console.error('Erro ao clonar dados da sessão:', error);
      throw error;
    }
  };

  const criarNovaSessao = async () => {
    if (!novaData || !novaHora) {
      alert('❌ Por favor, preencha data e hora');
      return;
    }

    if (!sessaoOriginal) {
      alert('❌ Erro: Sessão original não encontrada. Recarregue a página.');
      return;
    }

    setSalvando(true);

    try {
      const proximoNumero = sessoes.length + 1;

      // Criar nova sessão
      const { data: novaSessao, error: sessaoError } = await supabase
        .from('sessoes')
        .insert({
          evento_id: eventoId,
          data: novaData,
          hora: novaHora,
          numero: proximoNumero,
          is_original: false
        })
        .select()
        .single();

      if (sessaoError) throw sessaoError;

      // Clonar dados da sessão original
      await clonarDadosSessao(sessaoOriginal.id, novaSessao.id);

      alert(`✅ Sessão ${proximoNumero} criada com sucesso!\nTodos os dados foram clonados da sessão original.`);
      
      setMostrarModalCriar(false);
      setNovaData('');
      setNovaHora('');
      
      carregarDados();

    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      alert('❌ Erro ao criar nova sessão: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const abrirModalEditar = (sessao) => {
    setSessaoEditando(sessao);
    setEditarData(sessao.data);
    setEditarHora(sessao.hora);
    setMostrarModalEditar(true);
  };

  const salvarEdicaoSessao = async () => {
    if (!editarData || !editarHora) {
      alert('❌ Por favor, preencha data e hora');
      return;
    }

    setSalvando(true);

    try {
      const { error } = await supabase
        .from('sessoes')
        .update({
          data: editarData,
          hora: editarHora
        })
        .eq('id', sessaoEditando.id);

      if (error) throw error;

      alert('✅ Sessão atualizada com sucesso!');
      setMostrarModalEditar(false);
      carregarDados();

    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      alert('❌ Erro ao atualizar sessão');
    } finally {
      setSalvando(false);
    }
  };

  const deletarSessao = async (sessaoId, numeroSessao) => {
    if (sessoes.length === 1) {
      alert('❌ Não é possível deletar a única sessão do evento!');
      return;
    }

    const sessao = sessoes.find(s => s.id === sessaoId);
    if (sessao?.is_original) {
      alert('❌ Não é possível deletar a sessão original!');
      return;
    }

    const confirmar = window.confirm(
      `⚠️ Tem certeza que deseja deletar a Sessão ${numeroSessao}?\n\n` +
      `Isso irá deletar:\n` +
      `- Todos os setores\n` +
      `- Todos os ingressos\n` +
      `- Todos os lotes\n` +
      `- Todos os cupons\n\n` +
      `Esta ação não pode ser desfeita!`
    );

    if (!confirmar) return;

    setSalvando(true);

    try {
      const { error } = await supabase
        .from('sessoes')
        .delete()
        .eq('id', sessaoId);

      if (error) throw error;

      alert('✅ Sessão deletada com sucesso!');
      carregarDados();

    } catch (error) {
      console.error('Erro ao deletar sessão:', error);
      alert('❌ Erro ao deletar sessão');
    } finally {
      setSalvando(false);
    }
  };

  const deletarIngresso = async (ingressoId, sessaoId) => {
    const confirmar = window.confirm('Tem certeza que deseja deletar este ingresso?');
    if (!confirmar) return;

    setSalvando(true);

    try {
      const { error } = await supabase
        .from('ingressos')
        .delete()
        .eq('id', ingressoId);

      if (error) throw error;

      alert('✅ Ingresso deletado com sucesso!');
      await carregarDadosSessao(sessaoId);

    } catch (error) {
      console.error('Erro ao deletar ingresso:', error);
      alert('❌ Erro ao deletar ingresso');
    } finally {
      setSalvando(false);
    }
  };

  const deletarCupom = async (cupomId, sessaoId) => {
    const confirmar = window.confirm('Tem certeza que deseja deletar este cupom?');
    if (!confirmar) return;

    setSalvando(true);

    try {
      const { error } = await supabase
        .from('cupons')
        .delete()
        .eq('id', cupomId);

      if (error) throw error;

      alert('✅ Cupom deletado com sucesso!');
      await carregarDadosSessao(sessaoId);

    } catch (error) {
      console.error('Erro ao deletar cupom:', error);
      alert('❌ Erro ao deletar cupom');
    } finally {
      setSalvando(false);
    }
  };

  const calcularTotaisSessao = (sessaoId) => {
    const dados = dadosSessao[sessaoId];
    if (!dados) return { ingressos: 0, vendidos: 0, cupons: 0 };

    const totalIngressos = dados.ingressos.reduce((sum, i) => sum + (i.quantidade || 0), 0);
    const totalVendidos = dados.ingressos.reduce((sum, i) => sum + (i.vendidos || 0), 0);
    const totalCupons = dados.cupons.length;

    return {
      ingressos: totalIngressos,
      vendidos: totalVendidos,
      cupons: totalCupons
    };
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px', textAlign: 'center', paddingTop: '100px' }}>
        <h2>🔄 Carregando...</h2>
        <p style={{ color: '#666' }}>Preparando sistema de sessões...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      <header style={{ 
        backgroundColor: '#9b59b6', 
        color: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <Link href={`/produtor/evento/${eventoId}`} style={{ color: 'white', textDecoration: 'none', float: 'left' }}>
          &larr; Voltar
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 10px 0' }}>🎬 Gerenciar Sessões</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>{evento?.nome}</p>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        <div style={{ 
          backgroundColor: '#e8f5e9',
          border: '2px solid #27ae60',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <h3 style={{ color: '#155724', marginTop: 0, marginBottom: '10px' }}>
            💡 Como Funciona o Sistema de Sessões
          </h3>
          <ul style={{ color: '#155724', margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Cada nova sessão <strong>clona automaticamente</strong> todos os setores, ingressos, lotes e cupons da sessão original</li>
            <li>Você pode <strong>editar, deletar ou adicionar</strong> itens em cada sessão de forma independente</li>
            <li>As vendas de cada sessão são <strong>separadas</strong> e não interferem umas nas outras</li>
            <li>A sessão original <strong>não pode ser deletada</strong>, mas pode ser editada</li>
            <li>Clique em "📋 Ver Detalhes" para visualizar e gerenciar os ingressos de cada sessão</li>
          </ul>
        </div>

        <button
          onClick={() => setMostrarModalCriar(true)}
          disabled={salvando}
          style={{
            width: '100%',
            backgroundColor: '#27ae60',
            color: 'white',
            padding: '20px',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '18px',
            cursor: salvando ? 'not-allowed' : 'pointer',
            marginBottom: '25px',
            boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)',
            transition: 'all 0.3s'
          }}
        >
          ➕ Criar Nova Sessão
        </button>

        {sessoes.length === 0 ? (
          <div style={{ 
            backgroundColor: 'white',
            padding: '40px', 
            textAlign: 'center', 
            color: '#95a5a6',
            border: '2px dashed #ddd',
            borderRadius: '12px'
          }}>
            <p style={{ fontSize: '48px', margin: '0 0 15px 0' }}>🎬</p>
            <p style={{ margin: 0, fontSize: '16px' }}>Criando sessão original...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {sessoes.map((sessao) => {
              const totais = calcularTotaisSessao(sessao.id);
              const expandida = sessaoExpandida === sessao.id;
              const dados = dadosSessao[sessao.id];

              return (
                <div key={sessao.id} style={{ 
                  backgroundColor: 'white',
                  padding: '25px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  border: sessao.is_original ? '3px solid #f1c40f' : '2px solid #e0e0e0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ color: '#5d34a4', margin: '0 0 5px 0' }}>
                        🎬 Sessão {sessao.numero}
                        {sessao.is_original && (
                          <span style={{ 
                            fontSize: '12px',
                            marginLeft: '10px',
                            padding: '4px 10px',
                            backgroundColor: '#fff3cd',
                            color: '#856404',
                            borderRadius: '12px',
                            fontWeight: 'normal'
                          }}>
                            ⭐ Original
                          </span>
                        )}
                      </h2>
                      <div style={{ fontSize: '15px', color: '#666' }}>
                        📅 {new Date(sessao.data).toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })} • 🕐 {sessao.hora}
                      </div>
                      {expandida && dados && (
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                          📊 {totais.ingressos} ingressos • ✅ {totais.vendidos} vendidos • 🎟️ {totais.cupons} cupons
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => toggleSessao(sessao.id)}
                        style={{
                          backgroundColor: '#3498db',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        {expandida ? '🔼 Ocultar' : '📋 Ver Detalhes'}
                      </button>

                      <button
                        onClick={() => abrirModalEditar(sessao)}
                        disabled={salvando}
                        style={{
                          backgroundColor: '#f39c12',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          cursor: salvando ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      
                      {!sessao.is_original && (
                        <button
                          onClick={() => deletarSessao(sessao.id, sessao.numero)}
                          disabled={salvando}
                          style={{
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: salvando ? 'not-allowed' : 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          🗑️ Deletar
                        </button>
                      )}
                    </div>
                  </div>

                  {expandida && dados && (
                    <div style={{ 
                      marginTop: '20px',
                      paddingTop: '20px',
                      borderTop: '2px solid #e0e0e0'
                    }}>
                      <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>🎫 Ingressos</h3>
                        
                        {dados.ingressos.length === 0 ? (
                          <div style={{ 
                            padding: '20px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            textAlign: 'center',
                            color: '#666'
                          }}>
                            Nenhum ingresso cadastrado
                          </div>
                        ) : (
                          <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '15px'
                          }}>
                            {dados.ingressos.map((ingresso) => (
                              <div key={ingresso.id} style={{ 
                                backgroundColor: '#f8f9fa',
                                padding: '15px',
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0'
                              }}>
                                <div style={{ 
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'start',
                                  marginBottom: '10px'
                                }}>
                                  <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                                      {ingresso.tipo}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#666' }}>
                                      🏟️ Setor: {ingresso.setor}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => deletarIngresso(ingresso.id, sessao.id)}
                                    disabled={salvando}
                                    style={{
                                      backgroundColor: '#e74c3c',
                                      color: 'white',
                                      border: 'none',
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      cursor: salvando ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                                <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                                  <div>💰 Preço: <strong>R$ {parseFloat(ingresso.valor).toFixed(2)}</strong></div>
                                  <div>📊 Total: <strong>{ingresso.quantidade}</strong></div>
                                  <div>✅ Vendidos: <strong style={{ color: '#27ae60' }}>{ingresso.vendidos}</strong></div>
                                  <div>🟡 Disponíveis: <strong style={{ color: '#e67e22' }}>{ingresso.quantidade - ingresso.vendidos}</strong></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {dados.cupons.length > 0 && (
                        <div>
                          <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>🎟️ Cupons de Desconto</h3>
                          
                          <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '15px'
                          }}>
                            {dados.cupons.map((cupom) => (
                              <div key={cupom.id} style={{ 
                                backgroundColor: '#f8f9fa',
                                padding: '15px',
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0'
                              }}>
                                <div style={{ 
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'start',
                                  marginBottom: '10px'
                                }}>
                                  <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                                      {cupom.codigo}
                                    </div>
                                    <div style={{ 
                                      fontSize: '11px',
                                      padding: '3px 8px',
                                      borderRadius: '12px',
                                      backgroundColor: cupom.ativo ? '#d4edda' : '#f8d7da',
                                      color: cupom.ativo ? '#155724' : '#721c24',
                                      display: 'inline-block'
                                    }}>
                                      {cupom.ativo ? 'Ativo' : 'Inativo'}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => deletarCupom(cupom.id, sessao.id)}
                                    disabled={salvando}
                                    style={{
                                      backgroundColor: '#e74c3c',
                                      color: 'white',
                                      border: 'none',
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      cursor: salvando ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                                <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                                  {cupom.descricao && (
                                    <div style={{ fontStyle: 'italic', marginBottom: '8px' }}>
                                      "{cupom.descricao}"
                                    </div>
                                  )}
                                  <div>💵 Desconto: <strong>
                                    {cupom.tipo_desconto === 'percentual' 
                                      ? `${cupom.valor_desconto}%` 
                                      : `R$ ${parseFloat(cupom.valor_desconto).toFixed(2)}`}
                                  </strong></div>
                                  <div>📊 Usos: <strong>{cupom.quantidade_usada || 0} / {cupom.quantidade_total || '∞'}</strong></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ 
                        marginTop: '20px',
                        paddingTop: '20px',
                        borderTop: '2px solid #e0e0e0',
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap'
                      }}>
                        <Link
                          href={`/produtor/evento/${eventoId}/adicionar-ingressos?sessao=${sessao.id}`}
                          style={{
                            backgroundColor: '#27ae60',
                            color: 'white',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            fontSize: '14px',
                            display: 'inline-block'
                          }}
                        >
                          ➕ Adicionar Ingressos
                        </Link>
                        
                        <button
                          onClick={() => alert('Funcionalidade em desenvolvimento')}
                          style={{
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          🎟️ Adicionar Cupom
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modal - Criar Nova Sessão */}
      {mostrarModalCriar && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ color: '#27ae60', marginTop: 0 }}>➕ Criar Nova Sessão</h2>
            
            <div style={{ 
              backgroundColor: '#e8f5e9',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#155724'
            }}>
              💡 A nova sessão será criada com <strong>todos os dados clonados</strong> da sessão original:
              <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                <li>Setores e capacidades</li>
                <li>Tipos de ingressos e preços</li>
                <li>Lotes (se existirem)</li>
                <li>Cupons de desconto</li>
              </ul>
              Você poderá editar tudo depois! ✏️
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: '#333'
              }}>
                📅 Data da Sessão:
              </label>
              <input
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
                disabled={salvando}
              />
              <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                💡 Use a mesma data para criar uma sessão extra no mesmo dia
              </small>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: '#333'
              }}>
                🕐 Horário da Sessão:
              </label>
              <input
                type="time"
                value={novaHora}
                onChange={(e) => setNovaHora(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
                disabled={salvando}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setMostrarModalCriar(false);
                  setNovaData('');
                  setNovaHora('');
                }}
                disabled={salvando}
                style={{
                  flex: 1,
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: salvando ? 'not-allowed' : 'pointer',
                  fontSize: '15px'
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={criarNovaSessao}
                disabled={salvando || !novaData || !novaHora}
                style={{
                  flex: 1,
                  backgroundColor: salvando ? '#95a5a6' : '#27ae60',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: salvando || !novaData || !novaHora ? 'not-allowed' : 'pointer',
                  fontSize: '15px'
                }}
              >
                {salvando ? '⏳ Criando...' : '✅ Criar e Clonar Dados'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Editar Sessão */}
      {mostrarModalEditar && sessaoEditando && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h2 style={{ color: '#f39c12', marginTop: 0 }}>✏️ Editar Sessão {sessaoEditando.numero}</h2>
            
            {sessaoEditando.is_original && (
              <div style={{ 
                backgroundColor: '#fff3cd',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                color: '#856404'
              }}>
                ⭐ Esta é a sessão original do evento
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: '#333'
              }}>
                📅 Data da Sessão:
              </label>
              <input
                type="date"
                value={editarData}
                onChange={(e) => setEditarData(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
                disabled={salvando}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: '#333'
              }}>
                🕐 Horário da Sessão:
              </label>
              <input
                type="time"
                value={editarHora}
                onChange={(e) => setEditarHora(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
                disabled={salvando}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setMostrarModalEditar(false);
                  setSessaoEditando(null);
                }}
                disabled={salvando}
                style={{
                  flex: 1,
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: salvando ? 'not-allowed' : 'pointer',
                  fontSize: '15px'
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={salvarEdicaoSessao}
                disabled={salvando || !editarData || !editarHora}
                style={{
                  flex: 1,
                  backgroundColor: salvando ? '#95a5a6' : '#f39c12',
                  color: 'white',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: salvando || !editarData || !editarHora ? 'not-allowed' : 'pointer',
                  fontSize: '15px'
                }}
              >
                {salvando ? '⏳ Salvando...' : '✅ Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
