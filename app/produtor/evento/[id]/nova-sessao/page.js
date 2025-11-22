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
  const [user, setUser] = useState(null);
  
  const [mostrarModalCriar, setMostrarModalCriar] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [sessaoEditando, setSessaoEditando] = useState(null);
  
  const [formData, setFormData] = useState({
    data: '',
    hora: '',
    setores: [],
    ingressos: [],
    lotes: [],
    cupons: []
  });

  const [sessaoExpandida, setSessaoExpandida] = useState(null);
  const [dadosSessao, setDadosSessao] = useState({});
  
  const [editandoIngresso, setEditandoIngresso] = useState(null);
  const [editandoCupom, setEditandoCupom] = useState(null);
  const [editandoLote, setEditandoLote] = useState(null);

  useEffect(() => {
    carregarDados();
    carregarUsuario();
  }, [eventoId]);

  const carregarUsuario = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const carregarDados = async () => {
    try {
      setLoading(true);

      const { data: eventoData, error: eventoError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      if (eventoError) throw eventoError;
      setEvento(eventoData);

      const { data: sessoesData, error: sessoesError } = await supabase
        .from('sessoes')
        .select('*')
        .eq('evento_id', eventoId)
        .order('numero', { ascending: true });

      if (sessoesError && sessoesError.code !== 'PGRST116') {
        throw sessoesError;
      }

      if (!sessoesData || sessoesData.length === 0) {
        await criarSessaoOriginalAutomatica(eventoData);
        return;
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

  const criarSessaoOriginalAutomatica = async (eventoData) => {
    try {
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

      await supabase.from('setores').update({ sessao_id: novaSessao.id }).eq('eventos_id', eventoData.id).is('sessao_id', null);
      await supabase.from('ingressos').update({ sessao_id: novaSessao.id }).eq('evento_id', eventoData.id).is('sessao_id', null);
      await supabase.from('lotes').update({ sessao_id: novaSessao.id }).eq('evento_id', eventoData.id).is('sessao_id', null);
      await supabase.from('cupons').update({ sessao_id: novaSessao.id }).eq('evento_id', eventoData.id).is('sessao_id', null);

      await carregarDados();
    } catch (error) {
      console.error('Erro ao criar sessão original:', error);
      alert('Erro ao criar sessão original: ' + error.message);
      setLoading(false);
    }
  };

  const carregarDadosSessao = async (sessaoId) => {
    try {
      const { data: setores } = await supabase.from('setores').select('*').eq('sessao_id', sessaoId);
      const { data: ingressos } = await supabase.from('ingressos').select('*').eq('sessao_id', sessaoId);
      const { data: lotes } = await supabase.from('lotes').select('*').eq('sessao_id', sessaoId);
      const { data: cupons } = await supabase.from('cupons').select('*').eq('sessao_id', sessaoId);

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

  const abrirModalCriarNova = async () => {
    if (!sessaoOriginal) {
      alert('❌ Sessão original não encontrada');
      return;
    }

    setLoading(true);

    try {
      const { data: setores } = await supabase.from('setores').select('*').eq('sessao_id', sessaoOriginal.id);
      
      const { data: tiposIngressos } = await supabase
        .from('ingressos')
        .select('tipo, valor, setor, lote_id')
        .eq('sessao_id', sessaoOriginal.id);
      
      const { data: lotes } = await supabase.from('lotes').select('*').eq('sessao_id', sessaoOriginal.id);
      const { data: cupons } = await supabase.from('cupons').select('*').eq('sessao_id', sessaoOriginal.id);

      const tiposPorSetor = {};
      if (tiposIngressos) {
        tiposIngressos.forEach(ing => {
          if (!tiposPorSetor[ing.setor]) {
            tiposPorSetor[ing.setor] = [];
          }
          if (!tiposPorSetor[ing.setor].find(t => t.tipo === ing.tipo && t.valor === ing.valor)) {
            tiposPorSetor[ing.setor].push({
              tipo: ing.tipo,
              valor: ing.valor,
              lote_id: ing.lote_id
            });
          }
        });
      }

      setFormData({
        data: '',
        hora: '',
        setores: setores || [],
        tiposPorSetor: tiposPorSetor,
        lotes: lotes || [],
        cupons: cupons || []
      });

      setModoEdicao(false);
      setMostrarModalCriar(true);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalEditarSessao = async (sessao) => {
    setLoading(true);

    try {
      const { data: setores } = await supabase.from('setores').select('*').eq('sessao_id', sessao.id);
      
      const { data: tiposIngressos } = await supabase
        .from('ingressos')
        .select('tipo, valor, setor, lote_id')
        .eq('sessao_id', sessao.id);
      
      const { data: lotes } = await supabase.from('lotes').select('*').eq('sessao_id', sessao.id);
      const { data: cupons } = await supabase.from('cupons').select('*').eq('sessao_id', sessao.id);

      const tiposPorSetor = {};
      if (tiposIngressos) {
        tiposIngressos.forEach(ing => {
          if (!tiposPorSetor[ing.setor]) {
            tiposPorSetor[ing.setor] = [];
          }
          if (!tiposPorSetor[ing.setor].find(t => t.tipo === ing.tipo && t.valor === ing.valor)) {
            tiposPorSetor[ing.setor].push({
              tipo: ing.tipo,
              valor: ing.valor,
              lote_id: ing.lote_id
            });
          }
        });
      }

      setFormData({
        data: sessao.data,
        hora: sessao.hora,
        setores: setores || [],
        tiposPorSetor: tiposPorSetor,
        lotes: lotes || [],
        cupons: cupons || []
      });

      setSessaoEditando(sessao);
      setModoEdicao(true);
      setMostrarModalCriar(true);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const salvarSessao = async () => {
    if (!formData.data || !formData.hora) {
      alert('❌ Preencha data e hora');
      return;
    }

    setSalvando(true);

    try {
      if (modoEdicao) {
        const { error } = await supabase
          .from('sessoes')
          .update({ data: formData.data, hora: formData.hora })
          .eq('id', sessaoEditando.id);

        if (error) throw error;

        alert('✅ Sessão atualizada!');
      } else {
        const proximoNumero = sessoes.length + 1;

        const { data: novaSessao, error: sessaoError } = await supabase
          .from('sessoes')
          .insert({
            evento_id: eventoId,
            data: formData.data,
            hora: formData.hora,
            numero: proximoNumero,
            is_original: false
          })
          .select()
          .single();

        if (sessaoError) throw sessaoError;

        if (formData.setores.length > 0) {
          const setoresClonados = formData.setores.map(s => ({
            eventos_id: eventoId,
            sessao_id: novaSessao.id,
            nome: s.nome,
            capacidade_definida: s.capacidade_definida,
            capacidade_calculada: s.capacidade_calculada
          }));
          
          await supabase.from('setores').insert(setoresClonados);
        }

        const lotesMap = new Map();
        if (formData.lotes.length > 0) {
          for (const lote of formData.lotes) {
            const { data: novoLote } = await supabase
              .from('lotes')
              .insert({
                evento_id: eventoId,
                sessao_id: novaSessao.id,
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

            if (novoLote) lotesMap.set(lote.id, novoLote.id);
          }
        }

        let totalIngressosCriados = 0;
        
        for (const setor of formData.setores) {
          const tiposDesteSetor = formData.tiposPorSetor[setor.nome] || [];
          
          for (const tipoInfo of tiposDesteSetor) {
            const loteIdNovo = tipoInfo.lote_id ? lotesMap.get(tipoInfo.lote_id) : null;
            
            const capacidade = setor.capacidade_definida || setor.capacidade_calculada;
            const quantidadePorTipo = Math.floor(capacidade / (tiposDesteSetor.length || 1));
            
            await supabase
              .from('ingressos')
              .insert({
                evento_id: eventoId,
                sessao_id: novaSessao.id,
                setor: setor.nome,
                tipo: tipoInfo.tipo,
                valor: tipoInfo.valor,
                quantidade: quantidadePorTipo,
                vendidos: 0,
                lote_id: loteIdNovo,
                status_ingresso: 'disponivel',
                user_id: user?.id || null,
                codigo: Date.now() + totalIngressosCriados
              });
            
            totalIngressosCriados++;
          }
        }

        if (formData.cupons.length > 0) {
          const cuponsClonados = formData.cupons.map(c => ({
            evento_id: eventoId,
            sessao_id: novaSessao.id,
            codigo: `${c.codigo}_S${proximoNumero}`,
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

        alert(`✅ Sessão ${proximoNumero} criada!\n\n📊 ${formData.setores.length} setores\n🎫 ${totalIngressosCriados} tipos de ingresso\n🎟️ ${formData.cupons.length} cupons`);
      }

      setMostrarModalCriar(false);
      carregarDados();

    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const deletarSessao = async (sessaoId, numeroSessao) => {
    if (sessoes.length === 1) {
      alert('❌ Não é possível deletar a única sessão!');
      return;
    }

    const sessao = sessoes.find(s => s.id === sessaoId);
    if (sessao?.is_original) {
      alert('❌ Não é possível deletar a sessão original!');
      return;
    }

    const confirmar = window.confirm(`⚠️ Deletar Sessão ${numeroSessao}?\n\nIsso irá deletar TODOS os dados desta sessão!`);
    if (!confirmar) return;

    setSalvando(true);

    try {
      const { error } = await supabase.from('sessoes').delete().eq('id', sessaoId);
      if (error) throw error;

      alert('✅ Sessão deletada!');
      carregarDados();
    } catch (error) {
      console.error('Erro:', error);
      alert('❌ Erro ao deletar');
    } finally {
      setSalvando(false);
    }
  };

  const editarIngresso = async (ingresso) => {
    setEditandoIngresso(ingresso);
  };

  const salvarEdicaoIngresso = async () => {
    if (!editandoIngresso) return;

    setSalvando(true);
    try {
      const { error } = await supabase
        .from('ingressos')
        .update({
          tipo: editandoIngresso.tipo,
          valor: editandoIngresso.valor,
          quantidade: editandoIngresso.quantidade,
          setor: editandoIngresso.setor
        })
        .eq('id', editandoIngresso.id);

      if (error) throw error;

      alert('✅ Ingresso atualizado!');
      setEditandoIngresso(null);
      await carregarDadosSessao(editandoIngresso.sessao_id);
    } catch (error) {
      console.error('Erro ao editar ingresso:', error);
      alert('❌ Erro ao editar: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const editarCupom = async (cupom) => {
    setEditandoCupom(cupom);
  };

  const salvarEdicaoCupom = async () => {
    if (!editandoCupom) return;

    setSalvando(true);
    try {
      const { error } = await supabase
        .from('cupons')
        .update({
          codigo: editandoCupom.codigo,
          descricao: editandoCupom.descricao,
          tipo_desconto: editandoCupom.tipo_desconto,
          valor_desconto: editandoCupom.valor_desconto,
          quantidade_total: editandoCupom.quantidade_total,
          ativo: editandoCupom.ativo,
          data_validade_inicio: editandoCupom.data_validade_inicio,
          data_validade_fim: editandoCupom.data_validade_fim
        })
        .eq('id', editandoCupom.id);

      if (error) throw error;

      alert('✅ Cupom atualizado!');
      setEditandoCupom(null);
      await carregarDadosSessao(editandoCupom.sessao_id);
    } catch (error) {
      console.error('Erro ao editar cupom:', error);
      alert('❌ Erro ao editar: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const editarLote = async (lote) => {
    setEditandoLote(lote);
  };

  const salvarEdicaoLote = async () => {
    if (!editandoLote) return;

    setSalvando(true);
    try {
      const { error } = await supabase
        .from('lotes')
        .update({
          nome: editandoLote.nome,
          quantidade_total: editandoLote.quantidade_total,
          data_inicio: editandoLote.data_inicio,
          data_fim: editandoLote.data_fim,
          ativo: editandoLote.ativo
        })
        .eq('id', editandoLote.id);

      if (error) throw error;

      alert('✅ Lote atualizado!');
      setEditandoLote(null);
      await carregarDadosSessao(editandoLote.sessao_id);
    } catch (error) {
      console.error('Erro ao editar lote:', error);
      alert('❌ Erro ao editar: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const deletarIngresso = async (ingressoId, sessaoId) => {
    if (!window.confirm('Deletar este ingresso?')) return;

    setSalvando(true);
    try {
      await supabase.from('ingressos').delete().eq('id', ingressoId);
      alert('✅ Ingresso deletado!');
      await carregarDadosSessao(sessaoId);
    } catch (error) {
      alert('❌ Erro ao deletar');
    } finally {
      setSalvando(false);
    }
  };

  const deletarCupom = async (cupomId, sessaoId) => {
    if (!window.confirm('Deletar este cupom?')) return;

    setSalvando(true);
    try {
      await supabase.from('cupons').delete().eq('id', cupomId);
      alert('✅ Cupom deletado!');
      await carregarDadosSessao(sessaoId);
    } catch (error) {
      alert('❌ Erro ao deletar');
    } finally {
      setSalvando(false);
    }
  };

  const deletarLote = async (loteId, sessaoId) => {
    if (!window.confirm('Deletar este lote?')) return;

    setSalvando(true);
    try {
      await supabase.from('lotes').delete().eq('id', loteId);
      alert('✅ Lote deletado!');
      await carregarDadosSessao(sessaoId);
    } catch (error) {
      alert('❌ Erro ao deletar');
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

    return { ingressos: totalIngressos, vendidos: totalVendidos, cupons: totalCupons };
  };

  if (loading && !mostrarModalCriar) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px', textAlign: 'center', paddingTop: '100px' }}>
        <h2>🔄 Carregando...</h2>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      <header style={{ backgroundColor: '#9b59b6', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <Link href={`/produtor/evento/${eventoId}`} style={{ color: 'white', textDecoration: 'none', float: 'left' }}>
          &larr; Voltar
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 10px 0' }}>🎬 Gerenciar Sessões</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>{evento?.nome}</p>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        <div style={{ backgroundColor: '#e8f5e9', border: '2px solid #27ae60', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
          <h3 style={{ color: '#155724', marginTop: 0, marginBottom: '10px' }}>💡 Como Funciona</h3>
          <ul style={{ color: '#155724', margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Clique em <strong>"Criar Nova Sessão"</strong> para clonar dados da Sessão 1</li>
            <li>Você pode <strong>editar data, hora e gerenciar ingressos/cupons/lotes</strong> de cada sessão</li>
            <li>Cada sessão é <strong>independente</strong> - vendas não interferem entre elas</li>
            <li>Use os botões ✏️ para editar e 🗑️ para deletar itens</li>
          </ul>
        </div>

        <button
          onClick={abrirModalCriarNova}
          disabled={salvando || !sessaoOriginal}
          style={{
            width: '100%',
            backgroundColor: '#27ae60',
            color: 'white',
            padding: '20px',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '18px',
            cursor: salvando || !sessaoOriginal ? 'not-allowed' : 'pointer',
            marginBottom: '25px',
            boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)'
          }}
        >
          ➕ Criar Nova Sessão
        </button>

        {sessoes.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '40px', textAlign: 'center', color: '#95a5a6', border: '2px dashed #ddd', borderRadius: '12px' }}>
            <p style={{ fontSize: '48px', margin: '0 0 15px 0' }}>🎬</p>
            <p style={{ margin: 0 }}>Preparando sessão original...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {sessoes.map((sessao) => {
              const totais = calcularTotaisSessao(sessao.id);
              const expandida = sessaoExpandida === sessao.id;
              const dados = dadosSessao[sessao.id];

              return (
                <div key={sessao.id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: sessao.is_original ? '3px solid #f1c40f' : '2px solid #e0e0e0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <h2 style={{ color: '#5d34a4', margin: '0 0 5px 0' }}>
                        🎬 Sessão {sessao.numero}
                        {sessao.is_original && (
                          <span style={{ fontSize: '12px', marginLeft: '10px', padding: '4px 10px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '12px', fontWeight: 'normal' }}>
                            ⭐ Original
                          </span>
                        )}
                      </h2>
                      <div style={{ fontSize: '15px', color: '#666' }}>
                        📅 {new Date(sessao.data).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • 🕐 {sessao.hora}
                      </div>
                      {expandida && dados && (
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                          📊 {totais.ingressos} ingressos • ✅ {totais.vendidos} vendidos • 🎟️ {totais.cupons} cupons
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button onClick={() => toggleSessao(sessao.id)} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                        {expandida ? '🔼 Ocultar' : '📋 Ver Detalhes'}
                      </button>

                    {!sessao.is_original && (
  <button onClick={() => abrirModalEditarSessao(sessao)} disabled={salvando} style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: salvando ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
    ✏️ Editar
  </button>
)}
                      
                      {!sessao.is_original && (
                        <button onClick={() => deletarSessao(sessao.id, sessao.numero)} disabled={salvando} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: salvando ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                          🗑️ Deletar
                        </button>
                      )}
                    </div>
                  </div>

                  {expandida && dados && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e0e0e0' }}>
                      <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>🎫 Ingressos</h3>
                        
                        {dados.ingressos.length === 0 ? (
                          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
                            Nenhum ingresso cadastrado
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                            {dados.ingressos.map((ingresso) => (
                              <div key={ingresso.id} style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                  <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>{ingresso.tipo}</div>
                                    <div style={{ fontSize: '13px', color: '#666' }}>🏟️ Setor: {ingresso.setor}</div>
                                  </div>
                                  <div style={{ display: 'flex', gap: '5px' }}>
                                    <button onClick={() => editarIngresso(ingresso)} disabled={salvando} style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: salvando ? 'not-allowed' : 'pointer' }}>
                                      ✏️
                                    </button>
                                    <button onClick={() => deletarIngresso(ingresso.id, sessao.id)} disabled={salvando} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: salvando ? 'not-allowed' : 'pointer' }}>
                                      🗑️
                                    </button>
                                  </div>
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
                        <div style={{ marginBottom: '25px' }}>
                          <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>🎟️ Cupons</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                            {dados.cupons.map((cupom) => (
                              <div key={cupom.id} style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                  <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>{cupom.codigo}</div>
                                    <div style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', backgroundColor: cupom.ativo ? '#d4edda' : '#f8d7da', color: cupom.ativo ? '#155724' : '#721c24', display: 'inline-block' }}>
                                      {cupom.ativo ? 'Ativo' : 'Inativo'}
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: '5px' }}>
                                    <button onClick={() => editarCupom(cupom)} disabled={salvando} style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: salvando ? 'not-allowed' : 'pointer' }}>
                                      ✏️
                                    </button>
                                    <button onClick={() => deletarCupom(cupom.id, sessao.id)} disabled={salvando} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: salvando ? 'not-allowed' : 'pointer' }}>
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                                  {cupom.descricao && <div style={{ fontStyle: 'italic', marginBottom: '8px' }}>"{cupom.descricao}"</div>}
                                  <div>💵 Desconto: <strong>{cupom.tipo_desconto === 'percentual' ? `${cupom.valor_desconto}%` : `R$ ${parseFloat(cupom.valor_desconto).toFixed(2)}`}</strong></div>
                                  <div>📊 Usos: <strong>{cupom.quantidade_usada || 0} / {cupom.quantidade_total || '∞'}</strong></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {dados.lotes && dados.lotes.length > 0 && (
                        <div style={{ marginBottom: '25px' }}>
                          <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>📦 Lotes</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                            {dados.lotes.map((lote) => (
                              <div key={lote.id} style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                  <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>{lote.nome}</div>
                                    <div style={{ fontSize: '13px', color: '#666' }}>🏟️ Setor: {lote.setor}</div>
                                    <div style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', backgroundColor: lote.ativo ? '#d4edda' : '#f8d7da', color: lote.ativo ? '#155724' : '#721c24', display: 'inline-block', marginTop: '5px' }}>
                                      {lote.ativo ? 'Ativo' : 'Inativo'}
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: '5px' }}>
                                    <button onClick={() => editarLote(lote)} disabled={salvando} style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: salvando ? 'not-allowed' : 'pointer' }}>
                                      ✏️
                                    </button>
                                    <button onClick={() => deletarLote(lote.id, sessao.id)} disabled={salvando} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: salvando ? 'not-allowed' : 'pointer' }}>
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                                  <div>📊 Total: <strong>{lote.quantidade_total}</strong></div>
                                  <div>✅ Vendidos: <strong style={{ color: '#27ae60' }}>{lote.quantidade_vendida || 0}</strong></div>
                                  <div>🟡 Disponíveis: <strong style={{ color: '#e67e22' }}>{lote.quantidade_total - (lote.quantidade_vendida || 0)}</strong></div>
                                  {lote.data_inicio && <div style={{ fontSize: '12px', marginTop: '5px' }}>📅 Início: {new Date(lote.data_inicio).toLocaleDateString('pt-BR')}</div>}
                                  {lote.data_fim && <div style={{ fontSize: '12px' }}>📅 Fim: {new Date(lote.data_fim).toLocaleDateString('pt-BR')}</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e0e0e0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <Link href={`/produtor/evento/${eventoId}/adicionar-ingressos?sessao=${sessao.id}`} style={{ backgroundColor: '#27ae60', color: 'white', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px', display: 'inline-block' }}>
                          ➕ Adicionar Ingressos
                        </Link>
                        
                        <button onClick={() => alert('Funcionalidade em desenvolvimento')} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
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

      {/* MODAL CRIAR/EDITAR SESSÃO */}
      {mostrarModalCriar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', maxWidth: '1200px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: modoEdicao ? '#f39c12' : '#27ae60', marginTop: 0 }}>
              {modoEdicao ? `✏️ Editar Sessão ${sessaoEditando?.numero}` : '➕ Criar Nova Sessão'}
            </h2>
            
            {!modoEdicao && (
              <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', color: '#155724' }}>
                💡 <strong>Preview dos dados da Sessão 1</strong> - Você pode editar tudo antes de salvar!
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>📅 Data:</label>
                <input type="date" value={formData.data} onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))} style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }} disabled={salvando} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>🕐 Hora:</label>
                <input type="time" value={formData.hora} onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))} style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }} disabled={salvando} />
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>
                🏟️ Setores e Capacidades ({formData.setores.length})
                {!modoEdicao && <span style={{ fontSize: '13px', color: '#666', fontWeight: 'normal', marginLeft: '10px' }}>(clonados da Sessão 1)</span>}
              </h3>
              
              {formData.setores.length === 0 ? (
                <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
                  Nenhum setor
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '15px', maxHeight: '400px', overflowY: 'auto', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  {formData.setores.map((setor, idx) => {
                    const tiposDesteSetor = formData.tiposPorSetor?.[setor.nome] || [];
                    const capacidade = setor.capacidade_definida || setor.capacidade_calculada;
                    
                    return (
                      <div key={idx} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '2px solid #e0e0e0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#5d34a4', marginBottom: '5px' }}>
                              🏟️ {setor.nome}
                            </div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              <div>📊 Capacidade: <strong>{capacidade} ingressos</strong></div>
                              {setor.capacidade_definida && (
                                <div style={{ fontSize: '12px', color: '#888' }}>
                                  (Definida: {setor.capacidade_definida} | Calculada: {setor.capacidade_calculada})
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {tiposDesteSetor.length > 0 && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e0e0e0' }}>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>
                              🎫 Tipos de Ingresso:
                            </div>
                            <div style={{ display: 'grid', gap: '8px' }}>
                              {tiposDesteSetor.map((tipo, tipoIdx) => (
                                <div key={tipoIdx} style={{ fontSize: '13px', padding: '8px', backgroundColor: '#f0f7ff', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                  <span><strong>{tipo.tipo}</strong></span>
                                  <span style={{ color: '#27ae60', fontWeight: 'bold' }}>R$ {parseFloat(tipo.valor).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div style={{ fontSize: '12px', color: '#888', marginTop: '8px', fontStyle: 'italic' }}>
                              * Cada tipo terá aproximadamente {Math.floor(capacidade / tiposDesteSetor.length)} ingressos
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              <p style={{ fontSize: '13px', color: '#666', marginTop: '10px', fontStyle: 'italic' }}>
                💡 As capacidades dos setores serão mantidas. Use "Adicionar Ingressos" após salvar para gerenciar individualmente.
              </p>
            </div>

            {formData.cupons.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>
                  🎟️ Cupons ({formData.cupons.length})
                  {!modoEdicao && <span style={{ fontSize: '13px', color: '#666', fontWeight: 'normal', marginLeft: '10px' }}>(clonados da Sessão 1)</span>}
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px', maxHeight: '200px', overflowY: 'auto', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  {formData.cupons.map((cupom, idx) => (
                    <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>
                        {!modoEdicao ? `${cupom.codigo}_S${sessoes.length + 1}` : cupom.codigo}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        <div>💵 {cupom.tipo_desconto === 'percentual' ? `${cupom.valor_desconto}%` : `R$ ${cupom.valor_desconto}`}</div>
                        <div>📊 {cupom.quantidade_total || '∞'} usos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e0e0e0' }}>
              <button onClick={() => { setMostrarModalCriar(false); setSessaoEditando(null); }} disabled={salvando} style={{ flex: 1, backgroundColor: '#95a5a6', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: salvando ? 'not-allowed' : 'pointer', fontSize: '16px' }}>
                Cancelar
              </button>
              
              <button onClick={salvarSessao} disabled={salvando || !formData.data || !formData.hora} style={{ flex: 2, backgroundColor: salvando ? '#95a5a6' : (modoEdicao ? '#f39c12' : '#27ae60'), color: 'white', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: salvando || !formData.data || !formData.hora ? 'not-allowed' : 'pointer', fontSize: '16px' }}>
                {salvando ? '⏳ Salvando...' : (modoEdicao ? '✅ Salvar Alterações' : '✅ Criar Sessão')}
              </button>
            </div>

            {!modoEdicao && (
              <p style={{ fontSize: '13px', color: '#666', marginTop: '15px', textAlign: 'center', fontStyle: 'italic' }}>
                💡 Após criar a sessão, você poderá adicionar/editar ingressos e cupons individualmente
              </p>
            )}
          </div>
        </div>
      )}

     {/* MODAL EDITAR INGRESSO */}
      {editandoIngresso && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', maxWidth: '600px', width: '100%' }}>
            <h2 style={{ color: '#f39c12', marginTop: 0 }}>✏️ Editar Ingresso</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Tipo de Ingresso:</label>
              <input 
                type="text" 
                value={editandoIngresso.tipo} 
                onChange={(e) => setEditandoIngresso({...editandoIngresso, tipo: e.target.value})}
                style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
                disabled={salvando}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Setor:</label>
              <input 
                type="text" 
                value={editandoIngresso.setor} 
                onChange={(e) => setEditandoIngresso({...editandoIngresso, setor: e.target.value})}
                style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
                disabled={salvando}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Valor (R$):</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editandoIngresso.valor} 
                  onChange={(e) => setEditandoIngresso({...editandoIngresso, valor: parseFloat(e.target.value)})}
                  style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
                  disabled={salvando}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Quantidade:</label>
                <input 
                  type="number" 
                  value={editandoIngresso.quantidade} 
                  onChange={(e) => setEditandoIngresso({...editandoIngresso, quantidade: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
                  disabled={salvando}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e0e0e0' }}>
              <button 
                onClick={() => setEditandoIngresso(null)} 
                disabled={salvando}
                style={{ flex: 1, backgroundColor: '#95a5a6', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: salvando ? 'not-allowed' : 'pointer', fontSize: '16px' }}
              >
                Cancelar
              </button>
              <button 
                onClick={salvarEdicaoIngresso} 
                disabled={salvando}
                style={{ flex: 2, backgroundColor: '#f39c12', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: salvando ? 'not-allowed' : 'pointer', fontSize: '16px' }}
              >
                {salvando ? '⏳ Salvando...' : '✅ Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR CUPOM */}
      {editandoCupom && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001, padding: '20px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: '#f39c12', marginTop: 0 }}>✏️ Editar Cupom</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Código do Cupom:</label>
              <input 
                type="text" 
                value={editandoCupom.codigo} 
                onChange={(e) => setEditandoCupom({...editandoCupom, codigo: e.target.value})}
                style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
                disabled={salvando}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Descrição:</label>
              <textarea 
                value={editandoCupom.descricao || ''} 
                onChange={(e) => setEditandoCupom({...editandoCupom, descricao: e.target.value})}
                style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px', minHeight: '80px' }}
                disabled={salvando}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Tipo de Desconto:</label>
                <select 
                  value={editandoCupom.tipo_desconto} 
                  onChange={(e) => setEditandoCupom({...editandoCupom, tipo_desconto: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
                  disabled={salvando}
                >
                  <option value="percentual">Percentual (%)</option>
                  <option value="fixo">Valor Fixo (R$)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Valor do Desconto:</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editandoCupom.valor_desconto} 
                  onChange={(e) => setEditandoCupom({...editandoCupom, valor_desconto: parseFloat(e.target.value)})}
                  style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
                  disabled={salvando}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Quantidade de Usos:</label>
              <input 
                type="number" 
                value={editandoCupom.quantidade_total || ''} 
                onChange={(e) => setEditandoCupom({...editandoCupom, quantidade_total: e.target.value ? parseInt(e.target.value) : null})}
                placeholder="Deixe vazio para ilimitado"
                style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
                disabled={salvando}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Data Início:</label>
                <input 
                  type="date" 
                  value={editandoCupom.data_validade_inicio || ''} 
                  onChange={(e) => setEditandoCupom({...editandoCupom, data_validade_inicio: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
                  disabled={salvando}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Data Fim:</label>
                <input 
                  type="date" 
                  value={editandoCupom.data_validade_fim || ''} 
                  onChange={(e) => setEditandoCupom({...editandoCupom, data_validade_fim: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
                  disabled={salvando}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={editandoCupom.ativo} 
                  onChange={(e) => setEditandoCupom({...editandoCupom, ativo: e.target.checked})}
                  style={{ marginRight: '10px', width: '20px', height: '20px' }}
                  disabled={salvando}
                />
                <span style={{ fontWeight: 'bold', color: '#333' }}>Cupom Ativo</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e0e0e0' }}>
              <button 
                onClick={() => setEditandoCupom(null)} 
                disabled={salvando}
                style={{ flex: 1, backgroundColor: '#95a5a6', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: salvando ? 'not-allowed' : 'pointer', fontSize: '16px' }}
              >
                Cancelar
              </button>
              <button 
                onClick={salvarEdicaoCupom} 
                disabled={salvando}
                style={{ flex: 2, backgroundColor: '#f39c12', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: salvando ? 'not-allowed' : 'pointer', fontSize: '16px' }}
              >
                {salvando ? '⏳ Salvando...' : '✅ Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR LOTE */}
      {editandoLote && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', maxWidth: '600px', width: '100%' }}>
            <h2 style={{ color: '#f39c12', marginTop: 0 }}>✏️ Editar Lote</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Nome do Lote:</label>
              <input 
                type="text" 
                value={editandoLote.nome} 
                onChange={(e) => setEditandoLote({...editandoLote, nome: e.target.value})}
                style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
                disabled={salvando}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Quantidade Total:</label>
              <input 
                type="number" 
                value={editandoLote.quantidade_total} 
                onChange={(e) => setEditandoLote({...editandoLote, quantidade_total: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
                disabled={salvando}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Data Início:</label>
                <input 
                  type="date" 
                  value={editandoLote.data_inicio || ''} 
                  onChange={(e) => setEditandoLote({...editandoLote, data_inicio: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
                  disabled={salvando}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Data Fim:</label>
                <input 
                  type="date" 
                  value={editandoLote.data_fim || ''} 
                  onChange={(e) => setEditandoLote({...editandoLote, data_fim: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
                  disabled={salvando}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={editandoLote.ativo} 
                  onChange={(e) => setEditandoLote({...editandoLote, ativo: e.target.checked})}
                  style={{ marginRight: '10px', width: '20px', height: '20px' }}
                  disabled={salvando}
                />
                <span style={{ fontWeight: 'bold', color: '#333' }}>Lote Ativo</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e0e0e0' }}>
              <button 
                onClick={() => setEditandoLote(null)} 
                disabled={salvando}
                style={{ flex: 1, backgroundColor: '#95a5a6', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: salvando ? 'not-allowed' : 'pointer', fontSize: '16px' }}
              >
                Cancelar
              </button>
              <button 
                onClick={salvarEdicaoLote} 
                disabled={salvando}
                style={{ flex: 2, backgroundColor: '#f39c12', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: salvando ? 'not-allowed' : 'pointer', fontSize: '16px' }}
              >
                {salvando ? '⏳ Salvando...' : '✅ Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
