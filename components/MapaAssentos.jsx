'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import './MapaAssentos.css';

export default function MapaAssentos({ eventoId, teatroConfig }) {
  const supabase = createClient();
  
  const [assentosVendidos, setAssentosVendidos] = useState([]);
  const [assentosSelecionados, setAssentosSelecionados] = useState([]);
  const [hoveredAssento, setHoveredAssento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarAssentosVendidos();
  }, [eventoId]);

  const carregarAssentosVendidos = async () => {
    try {
      const { data, error } = await supabase
        .from('ingressos')
        .select('*')
        .eq('evento_id', eventoId)
        .in('status', ['vendido', 'reservado']);

      if (error) throw error;
      setAssentosVendidos(data || []);
    } catch (error) {
      console.error('Erro ao carregar assentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusAssento = (setorId, fileira, numero) => {
    // Verifica se já foi vendido
    const vendido = assentosVendidos.find(
      a => a.setor === setorId && a.fileira === fileira && a.numero === numero
    );
    
    if (vendido) {
      return vendido.tipo_assento || 'ocupado'; // 'ocupado', 'pcd', 'acompanhante_pcd', 'obeso', 'pmr'
    }
    
    // Verifica se está selecionado
    const selecionado = assentosSelecionados.find(
      a => a.setor === setorId && a.fileira === fileira && a.numero === numero
    );
    
    if (selecionado) return 'selecionado';
    
    return 'disponivel';
  };

  const toggleAssento = (setorId, fileira, numero, tipoAssento = 'normal') => {
    const status = getStatusAssento(setorId, fileira, numero);
    
    // Se está ocupado, não faz nada
    if (status === 'ocupado' || status === 'pcd' || status === 'acompanhante_pcd' || status === 'obeso' || status === 'pmr') {
      return;
    }
    
    // Se está selecionado, remove
    if (status === 'selecionado') {
      setAssentosSelecionados(prev => 
        prev.filter(a => !(a.setor === setorId && a.fileira === fileira && a.numero === numero))
      );
      return;
    }
    
    // Se está disponível, adiciona
    setAssentosSelecionados(prev => [
      ...prev,
      { setor: setorId, fileira, numero, tipoAssento }
    ]);
  };

  const getClasseAssento = (status, tipoEspecial) => {
    const classes = ['assento'];
    
    if (status === 'ocupado') {
      classes.push('ocupado');
    } else if (status === 'selecionado') {
      classes.push('selecionado');
    } else if (status === 'disponivel') {
      classes.push('disponivel');
      if (tipoEspecial === 'pcd') classes.push('pcd');
      if (tipoEspecial === 'acompanhante_pcd') classes.push('acompanhante-pcd');
      if (tipoEspecial === 'obeso') classes.push('obeso');
      if (tipoEspecial === 'pmr') classes.push('pmr');
    } else {
      // Já vendido com tipo especial
      classes.push('ocupado');
      if (status === 'pcd') classes.push('pcd');
      if (status === 'acompanhante_pcd') classes.push('acompanhante-pcd');
      if (status === 'obeso') classes.push('obeso');
      if (status === 'pmr') classes.push('pmr');
    }
    
    return classes.join(' ');
  };

  if (loading) {
    return <div className="loading-mapa">Carregando mapa de assentos...</div>;
  }

  return (
    <div className="mapa-assentos-container">
      
      {/* Indicador do Palco */}
      <div className="palco-container">
        <div className="palco-visual">
          <div className="palco-icon">🎭</div>
          <div className="palco-texto">Palco</div>
        </div>
      </div>

      {/* Legenda */}
      <div className="legenda">
        <div className="legenda-item">
          <div className="legenda-cor disponivel"></div>
          <span>Disponível</span>
        </div>
        <div className="legenda-item">
          <div className="legenda-cor ocupado"></div>
          <span>Ocupado</span>
        </div>
        <div className="legenda-item">
          <div className="legenda-cor selecionado"></div>
          <span>Selecionado</span>
        </div>
        <div className="legenda-item">
          <div className="legenda-cor pcd">♿</div>
          <span>PCD</span>
        </div>
        <div className="legenda-item">
          <div className="legenda-cor acompanhante-pcd">👥</div>
          <span>Acompanhante PCD</span>
        </div>
        <div className="legenda-item">
          <div className="legenda-cor obeso"></div>
          <span>Obeso</span>
        </div>
        <div className="legenda-item">
          <div className="legenda-cor pmr"></div>
          <span>PMR</span>
        </div>
      </div>

      {/* Tooltip hover */}
      {hoveredAssento && (
        <div className="tooltip-assento" style={{
          position: 'fixed',
          top: hoveredAssento.y + 10,
          left: hoveredAssento.x + 10,
          pointerEvents: 'none'
        }}>
          Assento {hoveredAssento.fileira}{hoveredAssento.numero}
        </div>
      )}

      {/* Mapa de Setores */}
      <div className="teatr-layout">
        {teatroConfig.setores.map(setor => (
          <div key={setor.id} className={`setor setor-${setor.id}`}>
            <h3 className="setor-titulo">{setor.nome}</h3>
            
            <div className="grade-assentos">
              {setor.fileiras.map((fileira, fileiraIdx) => (
                <div key={fileira} className="fileira-row">
                  
                  {/* Label da fileira (esquerda) */}
                  <div className="label-fileira">{fileira}</div>
                  
                  {/* Assentos da fileira */}
                  <div className="assentos-wrapper">
                    {[...Array(setor.assentosPorFileira)].map((_, idx) => {
                      const numero = idx + 1;
                      const status = getStatusAssento(setor.id, fileira, numero);
                      const tipoEspecial = setor.assentosEspeciais?.find(
                        a => a.fileira === fileira && a.numero === numero
                      )?.tipo;
                      
                      return (
                        <button
                          key={numero}
                          className={getClasseAssento(status, tipoEspecial)}
                          disabled={status === 'ocupado' || status === 'pcd' || status === 'acompanhante_pcd' || status === 'obeso' || status === 'pmr'}
                          onClick={() => toggleAssento(setor.id, fileira, numero, tipoEspecial)}
                          onMouseEnter={(e) => {
                            setHoveredAssento({
                              fileira,
                              numero,
                              x: e.clientX,
                              y: e.clientY
                            });
                          }}
                          onMouseLeave={() => setHoveredAssento(null)}
                          onMouseMove={(e) => {
                            if (hoveredAssento) {
                              setHoveredAssento(prev => ({
                                ...prev,
                                x: e.clientX,
                                y: e.clientY
                              }));
                            }
                          }}
                        >
                          {tipoEspecial === 'pcd' && '♿'}
                          {tipoEspecial === 'acompanhante_pcd' && '👥'}
                          {!tipoEspecial && numero}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Label da fileira (direita) */}
                  <div className="label-fileira">{fileira}</div>
                </div>
              ))}
            </div>
            
            {/* Numeração inferior */}
            {setor.mostrarNumeracaoInferior && (
              <div className="numeracao-inferior">
                <div className="label-fileira"></div>
                <div className="numeros-wrapper">
                  {[...Array(setor.assentosPorFileira)].map((_, idx) => (
                    <span key={idx} className="numero-coluna">{idx + 1}</span>
                  ))}
                </div>
                <div className="label-fileira"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumo da seleção */}
      {assentosSelecionados.length > 0 && (
        <div className="resumo-selecao">
          <h3>Assentos Selecionados ({assentosSelecionados.length})</h3>
          <div className="lista-selecionados">
            {assentosSelecionados.map((a, idx) => (
              <span key={idx} className="badge-assento">
                {a.fileira}{a.numero}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
