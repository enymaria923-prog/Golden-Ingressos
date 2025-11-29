'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import './MapaAssentos.css';

export default function MapaAssentos({ 
  eventoId, 
  teatroConfig, 
  sessaoId, 
  setorFiltro, 
  assentosSelecionados = [], 
  onToggleAssento 
}) {
  const supabase = createClient();
  
  const [assentosOcupados, setAssentosOcupados] = useState([]);
  const [hoveredAssento, setHoveredAssento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventoId && sessaoId) {
      carregarAssentosOcupados();
    }
  }, [eventoId, sessaoId]);

  const carregarAssentosOcupados = async () => {
    try {
      // Busca assentos já vendidos/reservados na nova tabela
      const { data, error } = await supabase
        .from('assentos_vendidos')
        .select('setor, fileira, numero, assento, status')
        .eq('evento_id', eventoId)
        .eq('sessao_id', sessaoId)
        .in('status', ['vendido', 'reservado']);

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar assentos ocupados:', error);
      }
      
      setAssentosOcupados(data || []);
    } catch (error) {
      console.error('Erro ao carregar assentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusAssento = (setorNome, fileira, numero) => {
    // Verifica se já foi vendido/ocupado
    const ocupado = assentosOcupados.find(
      a => a.setor === setorNome && 
           a.fileira === fileira && 
           a.numero === numero
    );
    
    if (ocupado) return 'ocupado';
    
    // Verifica se está selecionado
    const selecionado = assentosSelecionados.find(
      a => a.setor === setorNome && 
           a.fileira === fileira && 
           a.numero === numero
    );
    
    if (selecionado) return 'selecionado';
    
    return 'disponivel';
  };

  const handleToggleAssento = (setorNome, fileira, numero, tipoAssento = 'normal') => {
    const status = getStatusAssento(setorNome, fileira, numero);
    
    // Se está ocupado, não faz nada
    if (status === 'ocupado') {
      alert('Este assento já está ocupado!');
      return;
    }
    
    // Chama a função passada como prop
    if (onToggleAssento) {
      onToggleAssento({ setor: setorNome, fileira, numero, tipoAssento });
    }
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
    }
    
    return classes.join(' ');
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px', 
        fontSize: '18px', 
        color: '#666' 
      }}>
        🔄 Carregando mapa de assentos...
      </div>
    );
  }

  if (!teatroConfig || !teatroConfig.setores) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px', 
        fontSize: '18px', 
        color: '#dc3545' 
      }}>
        ⚠️ Configuração de teatro não encontrada
      </div>
    );
  }

  // Filtra apenas o setor selecionado
  const setoresFiltrados = setorFiltro 
    ? teatroConfig.setores.filter(s => s.nome === setorFiltro)
    : teatroConfig.setores;

  if (setoresFiltrados.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px', 
        fontSize: '18px', 
        color: '#dc3545' 
      }}>
        ⚠️ Setor não encontrado na configuração do teatro
      </div>
    );
  }

  return (
    <div className="mapa-assentos-container">
      
      {/* Indicador do Palco */}
      <div className="palco-container">
        <div className="palco-visual">
          <div className="palco-icon">🎭</div>
          <div className="palco-texto">PALCO</div>
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
          <span>Acompanhante</span>
        </div>
      </div>

      {/* Tooltip hover */}
      {hoveredAssento && (
        <div style={{
          position: 'fixed',
          top: hoveredAssento.y + 10,
          left: hoveredAssento.x + 10,
          pointerEvents: 'none',
          backgroundColor: '#333',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 9999,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          {hoveredAssento.fileira}{hoveredAssento.numero}
        </div>
      )}

      {/* Mapa de Setores */}
      <div className="teatr-layout">
        {setoresFiltrados.map(setor => (
          <div key={setor.id} className={`setor setor-${setor.id}`}>
            <h3 className="setor-titulo">{setor.nome}</h3>
            
            <div className="grade-assentos">
              {setor.fileiras.map((fileira) => (
                <div key={fileira} className="fileira-row">
                  
                  {/* Label da fileira (esquerda) */}
                  <div className="label-fileira">{fileira}</div>
                  
                  {/* Assentos da fileira */}
                  <div className="assentos-wrapper">
                    {[...Array(setor.assentosPorFileira)].map((_, idx) => {
                      const numero = idx + 1;
                      const status = getStatusAssento(setor.nome, fileira, numero);
                      const tipoEspecial = setor.assentosEspeciais?.find(
                        a => a.fileira === fileira && a.numero === numero
                      )?.tipo;
                      
                      return (
                        <button
                          key={numero}
                          className={getClasseAssento(status, tipoEspecial)}
                          disabled={status === 'ocupado'}
                          onClick={() => handleToggleAssento(setor.nome, fileira, numero, tipoEspecial)}
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
    </div>
  );
}
