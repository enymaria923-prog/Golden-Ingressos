const DetalhesEventoModal = ({ evento, onClose }) => {
  const calcularDetalhesIngressos = () => {
    const detalhes = [];
    evento.setores.forEach(setor => {
      setor.tiposIngresso.forEach(tipo => {
        detalhes.push({
          setor: setor.nome,
          tipo: tipo.nome,
          preco: tipo.preco,
          vendidos: tipo.vendidos || 0,
          total: tipo.preco * (tipo.vendidos || 0)
        });
      });
    });
    return detalhes;
  };

  const detalhesIngressos = calcularDetalhesIngressos();
  const totalVendidos = detalhesIngressos.reduce((sum, item) => sum + item.vendidos, 0);
  const totalFaturamento = detalhesIngressos.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="modal-overlay">
      <div className="modal-content-detalhes">
        <button className="btn-fechar-modal" onClick={onClose}>✕</button>
        
        <h2>Detalhes Completo do Evento</h2>
        
        <div className="detalhes-section">
          <h3>📋 Informações do Evento</h3>
          <div className="info-grid">
            <div><strong>Título:</strong> {evento.titulo}</div>
            <div><strong>Data:</strong> {new Date(evento.data).toLocaleDateString()} às {evento.hora}</div>
            <div><strong>Local:</strong> {evento.localNome}</div>
            <div><strong>Endereço:</strong> {evento.localEndereco || 'Não informado'}</div>
            <div><strong>Categorias:</strong> {evento.categorias.join(', ')}</div>
            <div><strong>Lugar Marcado:</strong> {evento.temLugarMarcado ? 'Sim' : 'Não'}</div>
          </div>
        </div>

        <div className="detalhes-section">
          <h3>👤 Informações do Produtor</h3>
          <div className="info-grid">
            <div><strong>Nome:</strong> {evento.produtor.nome}</div>
            <div><strong>Email:</strong> {evento.produtor.email}</div>
            <div><strong>Telefone:</strong> {evento.produtor.telefone}</div>
            <div><strong>CPF/CNPJ:</strong> {evento.produtor.documento}</div>
            <div><strong>Tipo:</strong> {evento.produtor.tipo}</div>
            <div><strong>Banco:</strong> {evento.produtor.banco}</div>
            <div><strong>Agência:</strong> {evento.produtor.agencia}</div>
            <div><strong>Conta:</strong> {evento.produtor.conta}</div>
          </div>
        </div>

        <div className="detalhes-section">
          <h3>🎫 Detalhamento de Ingressos Vendidos</h3>
          <table className="tabela-ingressos">
            <thead>
              <tr>
                <th>Setor</th>
                <th>Tipo</th>
                <th>Preço</th>
                <th>Vendidos</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {detalhesIngressos.map((item, index) => (
                <tr key={index}>
                  <td>{item.setor}</td>
                  <td>{item.tipo}</td>
                  <td>R$ {item.preco.toFixed(2)}</td>
                  <td>{item.vendidos}</td>
                  <td>R$ {item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3"><strong>Total Geral</strong></td>
                <td><strong>{totalVendidos}</strong></td>
                <td><strong>R$ {totalFaturamento.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="detalhes-section">
          <h3>💰 Resumo Financeiro</h3>
          <div className="resumo-financeiro">
            <div className="resumo-item">
              <span>Faturamento em Ingressos:</span>
              <span>R$ {totalFaturamento.toFixed(2)}</span>
            </div>
            <div className="resumo-item">
              <span>Taxas do Comprador ({evento.taxa.taxaComprador}%):</span>
              <span>R$ {(totalFaturamento * evento.taxa.taxaComprador / 100).toFixed(2)}</span>
            </div>
            <div className="resumo-item total">
              <span>Faturamento Total:</span>
              <span>R$ {(totalFaturamento * (1 + evento.taxa.taxaComprador / 100)).toFixed(2)}</span>
            </div>
            <div className="resumo-item">
              <span>Pagar ao Produtor ({evento.taxa.taxaProdutor}%):</span>
              <span>R$ {(totalFaturamento * (1 + evento.taxa.taxaProdutor / 100)).toFixed(2)}</span>
            </div>
            <div className="resumo-item lucro">
              <span>Lucro da Plataforma:</span>
              <span>R$ {(totalFaturamento * (evento.taxa.taxaComprador - evento.taxa.taxaProdutor) / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalhesEventoModal;
