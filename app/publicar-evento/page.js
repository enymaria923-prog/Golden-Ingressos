// app/publicar-evento/page.js
// CÓDIGO DE TESTE (Sem 'redirect')

// import { redirect } from 'next/navigation'; // <-- REMOVEMOS O 'redirect'
import { createClient } from '../../utils/supabase/server'; 
import { criarEvento } from '../actions';

export default async function PublicarEventoPage() {
  
  const supabase = createClient();

  // 'getUser' robusto
  const { data, error: userError } = await supabase.auth.getUser();
  const user = data?.user; // 'user' será o usuário ou 'null'

  // --- NOVA LÓGICA DE TESTE ---
  // Se não houver usuário, MOSTRA UMA MENSAGEM DE ERRO
  if (userError || !user) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '40px' }}>
        <h1 style={{ color: 'red' }}>Acesso Negado</h1>
        <p>Você precisa estar logado para publicar um evento.</p>
        <a href="/login" style={{ color: 'blue', fontSize: '20px' }}>Clique aqui para fazer o login</a>
      </div>
    );
  }
  // Se houver usuário, a página continua a carregar:

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para a Home</a>
        <h1 style={{ margin: '0' }}>Publicar Novo Evento</h1>
      </header>

      {/* Formulário (O código do formulário é o mesmo de antes) */}
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', backgroundColor: 'white', borderRadius: '8px' }}>
        
        <p>Logado como: {user.email}</p> {/* Prova de que o 'user' existe */}
        
        <form action={criarEvento} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          
          <label htmlFor="nome">Nome do Evento:</label>
          <input id="nome" name="nome" type="text" style={{ padding: '10px' }} required />

          {/* ... (O resto do formulário é idêntico) ... */}
          <label htmlFor="categoria">Categoria:</label>
          <select id="categoria" name="categoria" style={{ padding: '10px' }} required>
            <option value="">Selecione...</option>
            <option value="Show">Show</option>
            <option value="Teatro">Teatro</option>
            <option value="Standup">Stand-up</option>
            <option value="Congresso">Congresso</option>
            <option value="Outro">Outro</option>
          </select>
          <label htmlFor="data">Data:</label>
          <input id="data" name="data" type="date" style={{ padding: '10px' }} required />
          <label htmlFor="hora">Hora:</label>
          <input id="hora" name="hora" type="time" style={{ padding: '10px' }} required />
          <label htmlFor="local">Local (Endereço completo):</label>
          <input id="local" name="local" type="text" style={{ padding: '10px' }} required />
          <label htmlFor="preco">Preço (Ex: 50,00 ou "Gratuito"):</label>
          <input id="preco" name="preco" type="text" style={{ padding: '10px' }} required />
          <label htmlFor="descricao">Descrição do Evento:</label>
          <textarea id="descricao" name="descricao" rows="5" style={{ padding: '10px' }}></textarea>

          <button 
            type="submit"
            style={{ backgroundColor: '#f1c40f', color: 'black', padding: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '16px' }}
          >
            Publicar Evento
          </button>
        </form>
      </div>
    </div>
  );
}
