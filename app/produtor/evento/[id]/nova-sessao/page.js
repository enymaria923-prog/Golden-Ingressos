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
  
  // Modal criar/editar
  const [mostrarModalCriar, setMostrarModalCriar] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false); // true = editando sessão existente
  const [sessaoEditando, setSessaoEditando] = useState(null);
  
  // Dados do formulário de criação/edição
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

  useEffect(() => {
    carregarDados();
  }, [eventoId]);

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

  // ABRIR MODAL PARA CRIAR NOVA SESSÃO (com dados clonados)
  const abrirModalCriarNova = async () => {
    if (!sessaoOriginal) {
      alert('❌ Sessão original não encontrada');
      return;
    }

    setLoading(true);

    try {
      // Carregar SETORES da sessão original (NÃO ingressos individuais)
      const { data: setores } = await supabase.from('setores').select('*').eq('sessao_id', sessaoOriginal.id);
      
      // Carregar apenas tipos de ingresso únicos (para mostrar variedade)
      const { data: tiposIngressos } = await supabase
        .from('ingressos')
        .select('tipo, valor, setor, lote_id')
        .eq('sessao_id', sessaoOriginal.id);
      
      const { data: lotes } = await supabase.from('lotes').select('*').eq('sessao_id', sessaoOriginal.id);
      const { data: cupons } = await supabase.from('cupons').select('*').eq('sessao_id', sessaoOriginal.id);

      // Criar um resumo dos tipos de ingresso por setor
      const tiposPorSetor = {};
      if (tiposIngressos) {
        tiposIngressos.forEach(ing => {
          if (!tiposPorSetor[ing.setor]) {
            tiposPorSetor[ing.setor] = [];
          }
          // Evitar duplicatas
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

  // ABRIR MODAL PARA EDITAR SESSÃO EXISTENTE
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

  // SALVAR NOVA SESSÃO OU EDITAR EXISTENTE
  const salvarSessao = async () => {
    if (!formData.data || !formData.hora) {
      alert('❌ Preencha data e hora');
      return;
    }

    setSalvando(true);

    try {
      if (modoEdicao) {
        // EDITAR SESSÃO EXISTENTE (só data e hora)
        const { error } = await supabase
          .from('sessoes')
          .update({ data: formData.data, hora: formData.hora })
          .eq('id', sessaoEditando.id);

        if (error) throw error;

        alert('✅ Sessão atualizada!');
      } else {
        // CRIAR NOVA SESSÃO
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

        console.log('✅ Sessão criada:', novaSessao.id);

        // CLONAR SETORES (mantém capacidades)
        if (formData.setores.length > 0) {
          const setoresClonados = formData.setores.map(s => ({
            eventos_id: eventoId,
            sessao_id: novaSessao.id,
            nome: s.nome,
            capacidade_definida: s.capacidade_definida,
            capacidade_calculada: s.capacidade_calculada
          }));
          
          const { error: setoresError } = await supabase.from('setores').insert(setoresClonados);
          if (setoresError) throw setoresError;
          
          console.log(`✅ ${setoresClonados.length} setores clonados`);
        }

        // CLONAR LOTES e mapear IDs
        const lotesMap = new Map();
        if (formData.lotes.length > 0) {
          for (const lote of formData.lotes) {
            const { data: novoLote, error: loteError } = await supabase
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

            if (loteError) throw loteError;
            if (novoLote) lotesMap.set(lote.id, novoLote.id);
          }
          console.log(`✅ ${formData.lotes.length} lotes clonados`);
        }

        // CLONAR TIPOS DE INGRESSO (criar ingressos com base nos setores)
        let totalIngressosCriados = 0;
        
        for (const setor of formData.setores) {
          const tiposDesteSetor = formData.tiposPorSetor[setor.nome] || [];
          
          // Para cada tipo de ingresso deste setor
          for (const tipoInfo of tiposDesteSetor) {
            // Buscar o lote_id novo se houver
            const loteIdNovo = tipoInfo.lote_id ? lotesMap.get(tipoInfo.lote_id) : null;
            
            // Calcular quantidade baseado na capacidade do setor
            // Se tem capacidade definida, usa ela dividida pelos tipos
            // Se não, usa a capacidade calculada
            const capacidade = setor.capacidade_definida || setor.capacidade_calculada;
            const quantidadePorTipo = Math.floor(capacidade / (tiposDesteSetor.length || 1));
            
            const { error: ingressoError } = await supabase
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
                user_id: sessaoOriginal.user_id || user?.id,
                codigo: Date.now() + totalIngressosCriados
              });
            
            if (ingressoError) throw ingressoError;
            totalIngressosCriados++;
          }
        }
        
        console.log(`✅ ${totalIngressosCriados} tipos de ingresso criados`);

        // CLONAR CUPONS
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
          
          const { error: cuponsError } = await supabase.from('cupons').insert(cuponsClonados);
          if (cuponsError) throw cuponsError;
          
          console.log(`✅ ${cuponsClonados.length} cupons clonados`);
        }

        alert(`✅ Sessão ${proximoNumero} criada com sucesso!\n\n📊 ${formData.setores.length} setores\n🎫 ${totalIngressosCriados} tipos de ingresso\n🎟️ ${formData.cupons.length} cupons`);
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

  const deletarIngresso = async (ingressoId, sessaoId) => {
    if (!window.confirm('Deletar este ingresso?')) return;

    setSalvando(true);
    try {
      const { error } = await supabase.from('ingressos').delete().eq('id', ingressoId);
      if (error) throw error;

      alert('✅ Ingresso deletado!');
      
      // Atualizar formData se estiver no modal
      if (modoEdicao) {
        setFormData(prev => ({
          ...prev,
          ingressos: prev.ingressos.filter(i => i.id !== ingressoId)
        }));
      }
      
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
      const { error } = await supabase.from('cupons').delete().eq('id', cupomId);
      if (error) throw error;

      alert('✅ Cupom deletado!');
      
      // Atualizar formData se estiver no modal
      if (modoEdicao) {
        setFormData(prev => ({
          ...prev,
          cupons: prev.cupons.filter(c => c.id !== cupomId)
        }));
      }
      
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
            <li>Clique em <strong>"Criar Nova Sessão"</strong> para ver um preview dos dados clonados da Sessão 1</li>
            <li>Você pode <strong>editar tudo</strong> antes de salvar: data, hora, ingressos, cupons...</li>
            <li>Cada sessão é <strong>independente</strong> - vendas não interferem entre elas</li>
            <li>A sessão original não pode ser deletada</li>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
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

                      <button onClick={() => abrirModalEditarSessao(sessao)} disabled={salvando} style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: salvando ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                        ✏️ Editar
                      </button>
                      
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
                                  <button onClick={() => deletarIngresso(ingresso.id, sessao.id)} disabled={salvando} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: salvando ? 'not-allowed' : 'pointer' }}>
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
                                  <button onClick={() => deletarCupom(cupom.id, sessao.id)} disabled={salvando} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: salvando ? 'not-allowed' : 'pointer' }}>
                                    🗑️
                                  </button>
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

            {/* DATA E HORA */}
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

            {/* PREVIEW DOS SETORES E INGRESSOS */}
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

            {/* PREVIEW DOS CUPONS */}
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

            {/* PREVIEW DOS SETORES */}
            {formData.setores.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#5d34a4', marginBottom: '15px' }}>
                  🏟️ Setores ({formData.setores.length})
                </h3>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {formData.setores.map((setor, idx) => (
                    <div key={idx} style={{ padding: '8px 15px', backgroundColor: '#e3f2fd', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', color: '#1976d2' }}>
                      {setor.nome}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BOTÕES */}
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

    </div>
  );
}
