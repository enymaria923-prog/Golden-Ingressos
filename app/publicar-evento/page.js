// app/publicar-evento/page.js - O Formulário (Frontend)

// Importa a AÇÃO que vamos criar no próximo passo
import { criarEvento } from '../actions';

export default function PaginaPublicarEvento() {
  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar</a>
        <h1 style={{ margin: '0' }}>Golden Ingressos - Publicar Evento</h1>
      </header>

      {/* Formulário */}
      <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
        
        {/* O 'action={criarEvento}' é o que liga o formulário ao Backend (Passo 3) */}
        <form action={criarEvento} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

          <label htmlFor="nome">Nome do Evento:</label>
          <input type="text" id="nome" name="nome" required style={{ padding: '10px' }} />

          <label htmlFor="categoria">Categoria:</label>
          <select id="categoria" name="categoria" required style={{ padding: '10px' }}>
            <option value="">Selecione uma categoria</option>
            <option value="Música">Música</option>
            <option value="Negócios">Negócios</option>
            <option value="Gastronomia">Gastronomia</option>
            <option value="Teatro">Teatro</option>
            <option value="Outro">Outro</option>
          </select>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="data">Data:</label>
              <input type="date" id="data" name="data" required style={{ padding: '10px', width: '100%' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="hora">Hora:</label>
              <input type="time" id="hora" name="hora" required style={{ padding: '10px', width: '100%' }} />
            </div>
          </div>

          <label htmlFor="local">Local:</label>
          <input type="text" id="local" name="local" required style={{ padding: '10px' }} />

          <label htmlFor="preco">Preço (ex: R$ 80,00 ou Gratuito):</label>
          <input type="text" id="preco" name="preco" required style={{ padding: '10px' }} />

          <label htmlFor="descricao">Descrição:</label>
          <textarea id="descricao" name="descricao" rows="5" required style={{ padding: '10px', fontFamily: 'sans-serif' }}></textarea>

          <button 
            type="submit"
            style={{ 
              backgroundColor: '#f1c40f', color: 'black', padding: '15px 20px',
              borderRadius: '5px', fontWeight: 'bold', fontSize: '18px',
              border: 'none', cursor: 'pointer'
            }}
          >
            Publicar Evento
          </button>

        </form>
      </div>
    </div>
  );
}
