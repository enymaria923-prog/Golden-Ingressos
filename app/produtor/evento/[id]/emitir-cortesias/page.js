'use client';  //caralho
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '../../../../../utils/supabase/client';
import Link from 'next/link';

export default function EmitirCortesiasPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const eventoId = params.id;
  
  const [evento, setEvento] = useState(null);
  const [sessoes, setSessoes] = useState([]);
  const [setores, setSetores] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [ingressos, setIngressos] = useState([]);
  const [cortesiasEmitidas, setCortesiasEmitidas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [sessaoSelecionada, setSessaoSelecionada] = useState('');
  const [setorSelecionado, setSetorSelecionado] = useState('');
  const [loteSelecionado, setLoteSelecionado] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [assentoSelecionado, setAssentoSelecionado] = useState('');
  const [nomeBeneficiario, setNomeBeneficiario] = useState('');
  const [emailBeneficiario, setEmailBeneficiario] = useState('');
  const [cpfBeneficiario, setCpfBeneficiario] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [emitindo, setEmitindo] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [eventoId]);

  const carregarDados = async () => {
    try {
      const { data: eventoData, error: eventoError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      if (eventoError) throw eventoError;
      setEvento(eventoData);

      const { data: sessoesData } = await supabase
        .from('sessoes')
        .select('*')
        .eq('evento_id', eventoId)
        .order('is_original', { ascending: false })
        .order('created_at', { ascending: true });

      setSessoes(sessoesData || []);

      const { data: setoresData } = await supabase
        .from('setores')
        .select('*')
        .eq('eventos_id', eventoId);

      setSetores(setoresData || []);

      const { data: lotesData } = await supabase
        .from('lotes')
        .select('*')
        .eq('evento_id', eventoId);

      setLotes(lotesData || []);

      const { data: ingressosData } = await supabase
        .from('ingressos')
        .select('*')
        .eq('evento_id', eventoId);

      console.log('📊 INGRESSOS:', ingressosData);
      setIngressos(ingressosData || []);

      const { data: cortesiasData } = await supabase
        .from('ingressos_vendidos')
        .select('*')
        .eq('evento_id', eventoId)
        .eq('tipo_pagamento', 'cortesia')
        .order('created_at', { ascending: false });

      setCortesiasEmitidas(cortesiasData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do evento');
    } finally {
      setLoading(false);
    }
  };

  const setoresFiltrados = sessaoSelecionada 
    ? setores.filter(s => s.sessao_id === sessaoSelecionada)
    : [];

  const lotesFiltrados = (sessaoSelecionada && setorSelecionado)
    ? lotes.filter(l => l.sessao_id === sessaoSelecionada && l.setor === setorSelecionado)
    : [];

  const calcularDisponiveis = (ingresso) => {
    const vendidos = parseInt(ingresso.vendidos) || 0;
    const cortesias = parseInt(ingresso.cortesias) || 0;
    const ocupadosIngresso = vendidos + cortesias;

    console.log(`\n🔍 Calculando disponíveis para "${ingresso.tipo}":`);
    console.log('  vendidos:', vendidos, '| cortesias:', cortesias, '| ocupados:', ocupadosIngresso);

    const qtdTipo = parseInt(ingresso.quantidade) || 0;
    if (qtdTipo > 0) {
      const disponiveis = qtdTipo - ocupadosIngresso;
      console.log('  ✅ CONTROLADO POR TIPO: qtd=' + qtdTipo + ' → disponíveis=' + disponiveis);
      return disponiveis;
    }

    if (ingresso.lote_id) {
      const lote = lotes.find(l => l.id === ingresso.lote_id);
      const qtdLote = lote ? parseInt(lote.quantidade_total) || 0 : 0;
      
      if (qtdLote > 0) {
        const ingressosDoLote = ingressos.filter(i => 
          i.lote_id === ingresso.lote_id && 
          i.sessao_id === ingresso.sessao_id
        );
        const ocupadosLote = ingressosDoLote.reduce((sum, i) => 
          sum + (parseInt(i.vendidos) || 0) + (parseInt(i.cortesias) || 0), 0
        );
        const disponiveis = qtdLote - ocupadosLote;
        console.log('  ✅ CONTROLADO POR LOTE:', lote.nome, '| qtd=' + qtdLote + ' | ocupados=' + ocupadosLote + ' → disponíveis=' + disponiveis);
        return disponiveis;
      }
    }

    const setor = setores.find(s => 
      s.nome === ingresso.setor && 
      s.sessao_id === ingresso.sessao_id
    );
    const qtdSetor = setor ? parseInt(setor.capacidade_definida) || 0 : 0;
    
    if (qtdSetor > 0) {
      const ingressosDoSetor = ingressos.filter(i => 
        i.setor === ingresso.setor && 
        i.sessao_id === ingresso.sessao_id
      );
      const ocupadosSetor = ingressosDoSetor.reduce((sum, i) => 
        sum + (parseInt(i.vendidos) || 0) + (parseInt(i.cortesias) || 0), 0
      );
      const disponiveis = qtdSetor - ocupadosSetor;
      console.log('  ✅ CONTROLADO POR SETOR: qtd=' + qtdSetor + ' | ocupados=' + ocupadosSetor + ' → disponíveis=' + disponiveis);
      return disponiveis;
    }

    console.log('  ❌ SEM CONTROLE DE QUANTIDADE');
    return 0;
  };

  const tiposFiltrados = () => {
    if (!sessaoSelecionada || !setorSelecionado) {
      return [];
    }

    let tipos = ingressos.filter(ing => 
      ing.sessao_id === sessaoSelecionada && 
      ing.setor === setorSelecionado
    );

    if (loteSelecionado) {
      tipos = tipos.filter(ing => String(ing.lote_id) === String(loteSelecionado));
    }

    tipos = tipos.filter(ing => calcularDisponiveis(ing) > 0);

    return tipos;
  };

  useEffect(() => {
    if (sessoes.length === 1 && !sessaoSelecionada) {
      setSessaoSelecionada(sessoes[0].id);
    }
  }, [sessoes]);

  useEffect(() => {
    if (sessaoSelecionada && setoresFiltrados.length === 1 && !setorSelecionado) {
      setSetorSelecionado(setoresFiltrados[0].nome);
    }
  }, [sessaoSelecionada, setoresFiltrados]);

  useEffect(() => {
    const tipos = tiposFiltrados();
    if (setorSelecionado && tipos.length === 1 && !tipoSelecionado) {
      setTipoSelecionado(tipos[0].id);
    }
  }, [setorSelecionado, loteSelecionado, sessaoSelecionada]);

  const emitirCortesia = async () => {
    if (!sessaoSelecionada) {
      alert('Por favor, selecione uma sessão');
      return;
    }

    if (!setorSelecionado) {
      alert('Por favor, selecione um setor');
      return;
    }

    if (!tipoSelecionado) {
      alert('Por favor, selecione um tipo de ingresso');
      return;
    }

    if (!nomeBeneficiario || !emailBeneficiario) {
      alert('Por favor, preencha nome e email do beneficiário');
      return;
    }

    if (evento.tem_lugar_marcado && !assentoSelecionado) {
      alert('Por favor, selecione um assento');
      return;
    }

    setEmitindo(true);

    try {
      const ingressoTipo = ingressos.find(i => i.id === tipoSelecionado);
      
      if (!ingressoTipo) {
        throw new Error('Tipo de ingresso não encontrado');
      }

      const disponiveis = calcularDisponiveis(ingressoTipo);
      
      if (disponiveis <= 0) {
        throw new Error('Não há ingressos disponíveis deste tipo');
      }

      // Gerar IDs únicos
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const qrCode = `CORTESIA-${eventoId}-${timestamp}-${random}`;
      const pedidoId = `${timestamp}${random}${Math.random().toString(36).substring(2, 15)}`.substring(0, 36);

      console.log('🔑 pedidoId gerado:', pedidoId);

      const { data: cortesiaData, error: cortesiaError } = await supabase
        .from('ingressos_vendidos')
        .insert([{
          pedido_id: pedidoId,
          evento_id: eventoId,
          sessao_id: sessaoSelecionada,
          tipo_ingresso: ingressoTipo.tipo,
          valor: 0,
          assento: assentoSelecionado || null,
          qr_code: qrCode,
          status: 'ATIVO',
          tipo_pagamento: 'cortesia',
          data_compra: new Date().toISOString(),
          comprador_nome: nomeBeneficiario,
          comprador_email: emailBeneficiario,
          comprador_cpf: cpfBeneficiario || null,
          observacoes: observacoes || null
        }])
        .select()
        .single();

      if (cortesiaError) throw cortesiaError;

      const cortesiasAtuais = parseInt(ingressoTipo.cortesias) || 0;
      const { error: updateError } = await supabase
        .from('ingressos')
        .update({ cortesias: cortesiasAtuais + 1 })
        .eq('id', tipoSelecionado);

      if (updateError) {
        console.warn('Erro ao atualizar cortesias:', updateError);
      }

      alert('✅ Cortesia emitida com sucesso!');
      
      setAssentoSelecionado('');
      setNomeBeneficiario('');
      setEmailBeneficiario('');
      setCpfBeneficiario('');
      setObservacoes('');
      setTipoSelecionado('');
      setLoteSelecionado('');

      carregarDados();

    } catch (error) {
      console.error('Erro ao emitir cortesia:', error);
      alert('Erro ao emitir cortesia: ' + error.message);
    } finally {
      setEmitindo(false);
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px', textAlign: 'center', paddingTop: '100px' }}>
        <h2>Carregando...</h2>
      </div>
    );
  }

  if (!evento) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px', textAlign: 'center', paddingTop: '100px' }}>
        <h2>Evento não encontrado</h2>
        <Link href="/produtor" style={{ color: '#5d34a4', textDecoration: 'underline' }}>Voltar</Link>
      </div>
    );
  }

  const tiposDisponiveis = tiposFiltrados();

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <Link href={`/produtor/evento/${eventoId}`} style={{ color: 'white', textDecoration: 'none', float: 'left' }}>
          &larr; Voltar
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 10px 0' }}>🎁 Emitir Cortesias</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>{evento.nome}</p>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
        
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0, marginBottom: '25px' }}>📝 Nova Cortesia</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                🎬 Sessão *
              </label>
              <select
                value={sessaoSelecionada}
                onChange={(e) => {
                  setSessaoSelecionada(e.target.value);
                  setSetorSelecionado('');
                  setLoteSelecionado('');
                  setTipoSelecionado('');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">Selecione a sessão</option>
                {sessoes.map(sessao => (
                  <option key={sessao.id} value={sessao.id}>
                    {sessao.numero ? `Sessão ${sessao.numero}` : 'Sessão Principal'} - {new Date(sessao.data).toLocaleDateString('pt-BR')} às {sessao.hora}
                  </option>
                ))}
              </select>
            </div>

            {sessaoSelecionada && setoresFiltrados.length > 0 && (
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                  🏟️ Setor *
                </label>
                <select
                  value={setorSelecionado}
                  onChange={(e) => {
                    setSetorSelecionado(e.target.value);
                    setLoteSelecionado('');
                    setTipoSelecionado('');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Selecione o setor</option>
                  {setoresFiltrados.map(setor => (
                    <option key={setor.id} value={setor.nome}>
                      {setor.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {setorSelecionado && lotesFiltrados.length > 0 && (
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                  📦 Lote (opcional)
                </label>
                <select
                  value={loteSelecionado}
                  onChange={(e) => {
                    setLoteSelecionado(e.target.value);
                    setTipoSelecionado('');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Todos os lotes</option>
                  {lotesFiltrados.map(lote => (
                    <option key={lote.id} value={lote.id}>
                      {lote.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {setorSelecionado && (
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                  🎫 Tipo de Ingresso *
                </label>
                <select
                  value={tipoSelecionado}
                  onChange={(e) => setTipoSelecionado(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Selecione o tipo</option>
                  {tiposDisponiveis.map(tipo => {
                    const disponiveis = calcularDisponiveis(tipo);
                    return (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.tipo} - R$ {parseFloat(tipo.valor).toFixed(2)} ({disponiveis} disponíveis)
                      </option>
                    );
                  })}
                </select>
                {tiposDisponiveis.length === 0 && (
                  <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#856404'
                  }}>
                    ⚠️ Nenhum ingresso disponível para esta seleção
                  </div>
                )}
              </div>
            )}

            {evento.tem_lugar_marcado && tipoSelecionado && (
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                  💺 Assento *
                </label>
                <div style={{
                  padding: '20px',
                  border: '2px dashed #5d34a4',
                  borderRadius: '8px',
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa'
                }}>
                  <p style={{ margin: '0 0 10px 0', color: '#666' }}>Mapa de assentos do evento</p>
                  <input
                    type="text"
                    value={assentoSelecionado}
                    onChange={(e) => setAssentoSelecionado(e.target.value)}
                    placeholder="Ex: A15"
                    style={{
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      textAlign: 'center',
                      width: '150px'
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ borderTop: '2px solid #e0e0e0', marginTop: '10px', paddingTop: '20px' }}>
              <h3 style={{ color: '#5d34a4', fontSize: '18px', marginBottom: '15px' }}>👤 Dados do Beneficiário</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={nomeBeneficiario}
                    onChange={(e) => setNomeBeneficiario(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={emailBeneficiario}
                    onChange={(e) => setEmailBeneficiario(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                    CPF
                  </label>
                  <input
                    type="text"
                    value={cpfBeneficiario}
                    onChange={(e) => setCpfBeneficiario(e.target.value)}
                    placeholder="000.000.000-00"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                    Observações
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={emitirCortesia}
              disabled={emitindo}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: emitindo ? '#95a5a6' : '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: emitindo ? 'not-allowed' : 'pointer',
                marginTop: '10px'
              }}
            >
              {emitindo ? '⏳ Emitindo...' : '✅ Emitir Cortesia'}
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0, marginBottom: '20px' }}>
            📋 Cortesias Emitidas ({cortesiasEmitidas.length})
          </h2>
          
          <div style={{ maxHeight: '700px', overflowY: 'auto' }}>
            {cortesiasEmitidas.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#95a5a6',
                border: '2px dashed #ddd',
                borderRadius: '8px'
              }}>
                <p style={{ fontSize: '48px', margin: '0 0 15px 0' }}>🎁</p>
                <p style={{ margin: 0, fontSize: '16px' }}>Nenhuma cortesia emitida ainda</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {cortesiasEmitidas.map((cortesia, index) => (
                  <div key={index} style={{
                    padding: '15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <div style={{ fontWeight: 'bold', color: '#333', fontSize: '15px' }}>
                        {cortesia.comprador_nome}
                      </div>
                      <div style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: cortesia.status === 'USADO' ? '#f8d7da' : '#d4edda',
                        color: cortesia.status === 'USADO' ? '#721c24' : '#155724'
                      }}>
                        {cortesia.status === 'USADO' ? '✓ Usado' : '✓ Ativo'}
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
                      <div>📧 {cortesia.comprador_email}</div>
                      {cortesia.comprador_cpf && <div>🆔 CPF: {cortesia.comprador_cpf}</div>}
                      <div>🎫 {cortesia.tipo_ingresso}</div>
                      {cortesia.assento && <div>💺 Assento: {cortesia.assento}</div>}
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                        Emitida em: {new Date(cortesia.data_compra).toLocaleString('pt-BR')}
                      </div>
                      {cortesia.observacoes && (
                        <div style={{ 
                          marginTop: '8px', 
                          padding: '8px', 
                          backgroundColor: '#fff3cd',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#856404'
                        }}>
                          💬 {cortesia.observacoes}
                        </div>
                      )}
                      <div style={{ 
                        marginTop: '8px',
                        padding: '6px',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                        color: '#666'
                      }}>
                        🔑 {cortesia.qr_code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
