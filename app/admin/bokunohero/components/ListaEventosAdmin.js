import EstatisticasEvento from './EstatisticasEvento';

const ListaEventosAdmin = ({ eventos, onAprovar, onRejeitar, onEditar, onVerDetalhes }) => {
  const calcularEstatisticas = (evento) => {
    let ingressosVendidos = 0;
    let faturamentoIngressos = 0;

    evento.setores.forEach(setor => {
      setor.tiposIngresso.forEach(tipo => {
        ingressosVendidos += tipo.vendidos || 0;
        faturamentoIngressos += (tipo.preco * (tipo.vendidos || 0));
      });
    });

    const taxaComprador = evento.taxa.taxaComprador / 100;
    const taxaProdutor = evento.taxa.taxaProdutor / 100;
    
    const valorTaxas = faturamentoIngressos * taxaComprador;
    const faturamentoTotal = faturamentoIngressos + valorTaxas;
    const valorProdutor = faturamentoIngressos * (1 + taxaProdutor);
    const lucroPlataforma = valorTaxas - (faturamentoIngressos * taxaProdutor);

    return {
      ingressosVendidos,
      faturamentoIngressos,
      faturamentoTotal,
      valorTaxas,
      valorProdutor,
      lucroPlataforma
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado': return '#28a745';
      case 'pendente': return '#ffc107';
      case 'rejeitado': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="lista-eventos-admin">
      {eventos.length === 0 ? (
        <div className="nenhum-evento">
          Nenhum evento encontrado com os filtros atuais.
        </div>
      ) : (
        eventos.map(evento => {
          const stats = calcularEstatisticas(evento);
          
          return (
            <div key={evento.id} className="evento-card-admin">
              <div className="evento-header-admin">
                <div className="evento-info-basica">
                  <h3>{evento.titulo}</h3>
                  <div className="evento-meta">
                    <span>📅 {new Date(evento.data).toLocaleDateString()} às {evento.hora}</span>
                    <span>📍 {evento.localNome}</span>
                    <span style={{color: getStatusColor(evento.status)}}>
                      ● {evento.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="evento-actions">
                  {evento.status === 'pendente' && (
                    <>
                      <button 
                        className="btn-aprovar"
                        onClick={() => onAprovar(evento.id)}
                      >
                        ✅ Aprovar
                      </button>
                      <button 
                        className="btn-rejeitar"
                        onClick={() => onRejeitar(evento.id)}
                      >
                        ❌ Rejeitar
                      </button>
                    </>
                  )}
                  <button 
                    className="btn-editar"
                    onClick={() => onEditar(evento)}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn-detalhes"
                    onClick={() => onVerDetalhes(evento)}
                  >
                    📊 Detalhes
                  </button>
                </div>
              </div>

              <EstatisticasEvento stats={stats} taxa={evento.taxa} />

              <div className="evento-produtor-info">
                <strong>Produtor:</strong> {evento.produtor.nome} - {evento.produtor.email}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ListaEventosAdmin;
