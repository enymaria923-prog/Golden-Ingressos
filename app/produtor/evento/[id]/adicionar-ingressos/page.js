'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '../../../../../utils/supabase/client';
import Link from 'next/link';

export default function AdicionarIngressosPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const eventoId = params.id;
  
  const [evento, setEvento] = useState(null);
  const [setoresDetalhados, setSetoresDetalhados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  // Estados para armazenar as quantidades a adicionar
  const [quantidadesAdicionar, setQuantidadesAdicionar] = useState({});
  const [quantidadesSetorAdicionar, setQuantidadesSetorAdicionar] = useState({});

  useEffect(() => {
    carregarEvento();
  }, [eventoId]);

  const carregarEvento = async () => {
    try {
      const { data: eventoData, error: eventoError } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      if (eventoError) throw eventoError;
      setEvento(eventoData);

      // Buscar setores
      const { data: setoresData } = await supabase
        .from('setores')
        .select('*')
        .eq('eventos_id', eventoId);

      // Buscar ingressos
      const { data: ingressosData } = await supabase
        .from('ingressos')
        .select('*')
        .eq('evento_id', eventoId);

      // Buscar lotes
      const { data: lotesData } = await supabase
        .from('lotes')
        .select('*')
        .eq('evento_id', eventoId);

      const setoresMap = new Map();

      ingressosData?.forEach(ingresso => {
        const setorNome = ingresso.setor;
        
        if (!setoresMap.has(setorNome)) {
          const setorInfo = setoresData?.find(s => s.nome === setorNome);
          
          setoresMap.set(setorNome, {
            nome: setorNome,
            setorId: setorInfo?.id || null,
            capacidadeDefinida: setorInfo?.capacidade_definida || null,
            lotes: new Map(),
            tiposSemLote: []
          });
        }

        const setor = setoresMap.get(setorNome);
        const quantidade = parseInt(ingresso.quantidade) || 0;
        const vendidos = parseInt(ingresso.vendidos) || 0;
        const disponiveis = quantidade - vendidos;

        const tipoObj = {
          id: ingresso.id,
          nome: ingresso.tipo,
          quantidade: quantidade,
          vendidos: vendidos,
          disponiveis: disponiveis
        };

        if (ingresso.lote_id) {
          if (!setor.lotes.has(ingresso.lote_id)) {
            const loteInfo = lotesData?.find(l => l.id === ingresso.lote_id);
            setor.lotes.set(ingresso.lote_id, {
              id: ingresso.lote_id,
              nome: loteInfo?.nome || 'Lote sem nome',
              tipos: []
            });
          }
          setor.lotes.get(ingresso.lote_id).tipos.push(tipoObj);
        } else {
          setor.tiposSemLote.push(tipoObj);
        }
      });

      const setoresArray = Array.from(setoresMap.values()).map(setor => ({
        nome: setor.nome,
        setorId: setor.setorId,
        capacidadeDefinida: setor.capacidadeDefinida,
        lotes: Array.from(setor.lotes.values()),
        tiposSemLote: setor.tiposSemLote
      }));

      setSetoresDetalhados(setoresArray);

    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      alert('Erro ao carregar evento');
      router.push(`/produtor/evento/${eventoId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantidadeChange = (ingressoId, valor) => {
    setQuantidadesAdicionar(prev => ({
      ...prev,
      [ingressoId]: parseInt(valor) || 0
    }));
  };

  const handleQuantidadeSetorChange = (setorNome, valor) => {
    setQuantidadesSetorAdicionar(prev => ({
      ...prev,
      [setorNome]: parseInt(valor) || 0
    }));
  };

  // Calcular total de ingressos em um setor
  const calcularTotalSetor = (setor) => {
    let total = 0;
    setor.lotes.forEach(lote => {
      lote.tipos.forEach(tipo => {
        total += tipo.quantidade;
      });
    });
    setor.tiposSemLote.forEach(tipo => {
      total += tipo.quantidade;
    });
    return total;
  };

  const adicionarPorSetor = async (setor) => {
    const quantidade = quantidadesSetorAdicionar[setor.nome] || 0;
    
    if (quantidade <= 0) {
      alert('Por favor, insira uma quantidade válida');
      return;
    }

    setSalvando(true);

    try {
      // Atualizar capacidade_definida do setor
      const { data: setorAtual, error: setorFetchError } = await supabase
        .from('setores')
        .select('capacidade_definida')
        .eq('id', setor.setorId)
        .single();

      if (setorFetchError) throw setorFetchError;

      const novaCapacidade = (parseInt(setorAtual.capacidade_definida) || 0) + quantidade;
      
      const { error: updateSetorError } = await supabase
        .from('setores')
        .update({ capacidade_definida: novaCapacidade })
        .eq('id', setor.setorId);

      if (updateSetorError) throw updateSetorError;

      // Atualizar total_ingressos do evento
      const { data: eventoAtual } = await supabase
        .from('eventos')
        .select('total_ingressos')
        .eq('id', eventoId)
        .single();

      if (eventoAtual) {
        const novoTotal = (parseInt(eventoAtual.total_ingressos) || 0) + quantidade;
        await supabase
          .from('eventos')
          .update({ total_ingressos: novoTotal })
          .eq('id', eventoId);
      }

      alert(`✅ ${quantidade} ingresso(s) adicionado(s) ao setor ${setor.nome}!`);
      
      // Limpar input e recarregar
      setQuantidadesSetorAdicionar(prev => ({ ...prev, [setor.nome]: 0 }));
      carregarEvento();

    } catch (error) {
      console.error('Erro ao adicionar ingressos no setor:', error);
      alert('❌ Erro ao adicionar ingressos no setor');
    } finally {
      setSalvando(false);
    }
  };

  const adicionarPorTipo = async (ingressoId, setor) => {
    const quantidade = quantidadesAdicionar[ingressoId] || 0;
    
    if (quantidade <= 0) {
      alert('Por favor, insira uma quantidade válida');
      return;
    }

    // Se o setor é controlado por capacidade definida, validar
    if (setor.capacidadeDefinida && setor.capacidadeDefinida > 0) {
      const totalAtualSetor = calcularTotalSetor(setor);
      const novoTotal = totalAtualSetor + quantidade;
      
      if (novoTotal > setor.capacidadeDefinida) {
        alert(`❌ Erro: A soma dos ingressos (${novoTotal}) ultrapassaria a capacidade do setor (${setor.capacidadeDefinida}).\n\nCapacidade atual do setor: ${setor.capacidadeDefinida}\nTotal já alocado: ${totalAtualSetor}\nVocê está tentando adicionar: ${quantidade}\n\nAdicione no máximo ${setor.capacidadeDefinida - totalAtualSetor} ingresso(s) ou aumente primeiro a capacidade do setor.`);
        return;
      }
    }

    setSalvando(true);

    try {
      // Buscar ingresso atual
      const { data: ingressoAtual, error: fetchError } = await supabase
        .from('ingressos')
        .select('quantidade')
        .eq('id', ingressoId)
        .single();

      if (fetchError) throw fetchError;

      const novaQuantidade = (parseInt(ingressoAtual.quantidade) || 0) + quantidade;

      // Atualizar quantidade do ingresso
      const { error: updateError } = await supabase
        .from('ingressos')
        .update({ quantidade: novaQuantidade })
        .eq('id', ingressoId);

      if (updateError) throw updateError;

      // Atualizar total_ingressos do evento SOMENTE se NÃO for controlado por setor
      if (!setor.capacidadeDefinida || setor.capacidadeDefinida === 0) {
        const { data: eventoAtual } = await supabase
          .from('eventos')
          .select('total_ingressos')
          .eq('id', eventoId)
          .single();

        if (eventoAtual) {
          const novoTotal = (parseInt(eventoAtual.total_ingressos) || 0) + quantidade;
          await supabase
            .from('eventos')
            .update({ total_ingressos: novoTotal })
            .eq('id', eventoId);
        }
      }

      alert(`✅ ${quantidade} ingresso(s) adicionado(s) com sucesso!`);
      
      // Limpar input e recarregar
      setQuantidadesAdicionar(prev => ({ ...prev, [ingressoId]: 0 }));
      carregarEvento();

    } catch (error) {
      console.error('Erro ao adicionar ingressos:', error);
      alert('❌ Erro ao adicionar ingressos');
    } finally {
      setSalvando(false);
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

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      <header style={{ 
        backgroundColor: '#f1c40f', 
        color: 'black', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <Link href={`/produtor/evento/${eventoId}`} style={{ color: 'black', textDecoration: 'none', float: 'left' }}>
          &larr; Voltar
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 10px 0' }}>➕ Adicionar Mais Ingressos</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>{evento.nome}</p>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {setoresDetalhados.length === 0 ? (
          <div style={{ 
            backgroundColor: 'white',
            padding: '40px', 
            textAlign: 'center', 
            color: '#95a5a6',
            border: '2px dashed #ddd',
            borderRadius: '12px'
          }}>
            <p style={{ fontSize: '48px', margin: '0 0 15px 0' }}>🎫</p>
            <p style={{ margin: 0, fontSize: '16px' }}>Nenhum ingresso cadastrado ainda</p>
          </div>
        ) : (
          setoresDetalhados.map((setor, setorIndex) => {
            const controladoPorSetor = setor.capacidadeDefinida && setor.capacidadeDefinida > 0;
            const totalAtualSetor = calcularTotalSetor(setor);
            
            return (
              <div key={setorIndex} style={{ 
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                marginBottom: '25px'
              }}>
                <h2 style={{ 
                  color: '#5d34a4', 
                  marginTop: 0,
                  borderBottom: '2px solid #5d34a4',
                  paddingBottom: '10px'
                }}>
                  🏟️ Setor: {setor.nome}
                  {controladoPorSetor && (
                    <span style={{ 
                      fontSize: '12px', 
                      marginLeft: '10px',
                      padding: '4px 10px',
                      backgroundColor: '#e8f4f8',
                      color: '#2196f3',
                      borderRadius: '12px',
                      fontWeight: 'normal'
                    }}>
                      📊 Controlado por Setor
                    </span>
                  )}
                </h2>

                {/* ADICIONAR POR SETOR - só aparece se for controlado por setor */}
                {controladoPorSetor && (
                  <div style={{ 
                    backgroundColor: '#e3f2fd',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '2px solid #2196f3'
                  }}>
                    <h3 style={{ color: '#2196f3', marginTop: 0, marginBottom: '10px' }}>
                      📊 Adicionar Capacidade ao Setor
                    </h3>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                      <div>📈 Capacidade Total: <strong>{setor.capacidadeDefinida}</strong></div>
                      <div>📊 Já Alocado: <strong>{totalAtualSetor}</strong></div>
                      <div>🟡 Restante: <strong style={{ color: totalAtualSetor < setor.capacidadeDefinida ? '#27ae60' : '#e74c3c' }}>
                        {setor.capacidadeDefinida - totalAtualSetor}
                      </strong></div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        placeholder="Adicionar ao setor"
                        value={quantidadesSetorAdicionar[setor.nome] || ''}
                        onChange={(e) => handleQuantidadeSetorChange(setor.nome, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          border: '2px solid #2196f3',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                        disabled={salvando}
                      />
                      <button
                        onClick={() => adicionarPorSetor(setor)}
                        disabled={salvando || !quantidadesSetorAdicionar[setor.nome]}
                        style={{
                          padding: '12px 25px',
                          backgroundColor: salvando ? '#95a5a6' : '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          cursor: salvando ? 'not-allowed' : 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        {salvando ? '⏳' : '➕ Adicionar ao Setor'}
                      </button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', marginBottom: 0 }}>
                      💡 Isso aumenta a capacidade total do setor. Depois distribua entre os tipos de ingresso abaixo.
                    </p>
                  </div>
                )}

                {/* Lotes */}
                {setor.lotes.map((lote, loteIndex) => (
                  <div key={loteIndex} style={{ 
                    backgroundColor: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <h3 style={{ color: '#2980b9', marginTop: 0 }}>📦 {lote.nome}</h3>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '15px'
                    }}>
                      {lote.tipos.map((tipo, tipoIndex) => (
                        <div key={tipoIndex} style={{ 
                          backgroundColor: 'white',
                          padding: '15px',
                          borderRadius: '8px',
                          border: '1px solid #d0d0d0'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px' }}>
                            {tipo.nome}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                            <div>📊 Atual: <strong>{tipo.quantidade}</strong></div>
                            <div>✅ Vendidos: <strong style={{ color: '#27ae60' }}>{tipo.vendidos}</strong></div>
                            <div>🟡 Disponíveis: <strong style={{ color: '#e67e22' }}>{tipo.disponiveis}</strong></div>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            gap: '10px',
                            alignItems: 'center'
                          }}>
                            <input
                              type="number"
                              min="0"
                              placeholder="Quantidade"
                              value={quantidadesAdicionar[tipo.id] || ''}
                              onChange={(e) => handleQuantidadeChange(tipo.id, e.target.value)}
                              style={{
                                flex: 1,
                                padding: '10px',
                                border: '2px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                              disabled={salvando}
                            />
                            <button
                              onClick={() => adicionarPorTipo(tipo.id, setor)}
                              disabled={salvando || !quantidadesAdicionar[tipo.id]}
                              style={{
                                padding: '10px 20px',
                                backgroundColor: salvando ? '#95a5a6' : '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: salvando ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              {salvando ? '⏳' : '➕'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Tipos sem lote */}
                {setor.tiposSemLote.length > 0 && (
                  <div style={{ 
                    backgroundColor: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <h3 style={{ color: '#16a085', marginTop: 0 }}>🎟️ Ingressos do Setor</h3>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '15px'
                    }}>
                      {setor.tiposSemLote.map((tipo, tipoIndex) => (
                        <div key={tipoIndex} style={{ 
                          backgroundColor: 'white',
                          padding: '15px',
                          borderRadius: '8px',
                          border: '1px solid #d0d0d0'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px' }}>
                            {tipo.nome}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                            <div>📊 Atual: <strong>{tipo.quantidade}</strong></div>
                            <div>✅ Vendidos: <strong style={{ color: '#27ae60' }}>{tipo.vendidos}</strong></div>
                            <div>🟡 Disponíveis: <strong style={{ color: '#e67e22' }}>{tipo.disponiveis}</strong></div>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            gap: '10px',
                            alignItems: 'center'
                          }}>
                            <input
                              type="number"
                              min="0"
                              placeholder="Quantidade"
                              value={quantidadesAdicionar[tipo.id] || ''}
                              onChange={(e) => handleQuantidadeChange(tipo.id, e.target.value)}
                              style={{
                                flex: 1,
                                padding: '10px',
                                border: '2px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                              disabled={salvando}
                            />
                            <button
                              onClick={() => adicionarPorTipo(tipo.id, setor)}
                              disabled={salvando || !quantidadesAdicionar[tipo.id]}
                              style={{
                                padding: '10px 20px',
                                backgroundColor: salvando ? '#95a5a6' : '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: salvando ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              {salvando ? '⏳' : '➕'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}

      </div>
    </div>
  );
}
