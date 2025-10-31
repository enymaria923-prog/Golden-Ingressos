const FiltrosAdmin = ({ filtros, setFiltros }) => {
  return (
    <div className="filtros-admin">
      <div className="filtro-group">
        <label>Filtrar por Data:</label>
        <select 
          value={filtros.data} 
          onChange={(e) => setFiltros({...filtros, data: e.target.value})}
        >
          <option value="todos">Todos os eventos</option>
          <option value="hoje">Eventos de hoje</option>
          <option value="ultimos5dias">Últimos 5 dias</option>
          <option value="proximos5dias">Próximos 5 dias</option>
        </select>
      </div>

      <div className="filtro-group">
        <label>Filtrar por Produtor:</label>
        <input
          type="text"
          placeholder="Digite o nome do produtor..."
          value={filtros.produtor}
          onChange={(e) => setFiltros({...filtros, produtor: e.target.value})}
        />
      </div>

      <div className="filtro-group">
        <label>Filtrar por Status:</label>
        <select 
          value={filtros.status} 
          onChange={(e) => setFiltros({...filtros, status: e.target.value})}
        >
          <option value="todos">Todos os status</option>
          <option value="pendente">Pendentes</option>
          <option value="aprovado">Aprovados</option>
          <option value="rejeitado">Rejeitados</option>
        </select>
      </div>

      <button 
        className="btn-limpar-filtros"
        onClick={() => setFiltros({ data: 'todos', produtor: '', status: 'todos' })}
      >
        Limpar Filtros
      </button>
    </div>
  );
};

export default FiltrosAdmin;
