const EstatisticasEvento = ({ stats, taxa }) => {
  return (
    <div className="estatisticas-evento">
      <div className="stat-item">
        <span>Ingressos Vendidos:</span>
        <strong>{stats.ingressosVendidos}</strong>
      </div>
      
      <div className="stat-item">
        <span>Faturamento Ingressos:</span>
        <strong>R$ {stats.faturamentoIngressos.toFixed(2)}</strong>
      </div>
      
      <div className="stat-item">
        <span>Taxas ({taxa.taxaComprador}%):</span>
        <strong>R$ {stats.valorTaxas.toFixed(2)}</strong>
      </div>
      
      <div className="stat-item">
        <span>Faturamento Total:</span>
        <strong>R$ {stats.faturamentoTotal.toFixed(2)}</strong>
      </div>
      
      <div className="stat-item">
        <span>Pagar ao Produtor ({taxa.taxaProdutor}%):</span>
        <strong className="valor-produtor">R$ {stats.valorProdutor.toFixed(2)}</strong>
      </div>
      
      <div className="stat-item">
        <span>Lucro Plataforma:</span>
        <strong className="valor-lucro">R$ {stats.lucroPlataforma.toFixed(2)}</strong>
      </div>
    </div>
  );
};

export default EstatisticasEvento;
