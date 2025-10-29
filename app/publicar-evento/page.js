// app/publicar-evento/page.js (CÓDIGO DE RESTAURAÇÃO FINAL COM CORREÇÃO DE ESTILO)

import { createClient } from '../../utils/supabase/server'; 
import { criarEvento } from '../actions';

export default async function PublicarEventoPage() {
  
  const supabase = createClient();

  const { data, error: userError } = await supabase.auth.getUser();
  const user = data?.user;

  // --- LÓGICA DE PROTEÇÃO DE PRODUTOR ---
  if (userError || !user) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: '#5d34a4', marginTop: '50px' }}>Acesso de Produtor Requerido</h1>
        <p style={{ fontSize: '18px' }}>Para criar um evento, você precisa ter seu login de produtor.</p>
        <a href="/login" style={{ backgroundColor: '#f1c40f', color: 'black', padding: '15px 20px', textDecoration: 'none', fontWeight: 'bold', borderRadius: '5px', display: 'inline-block', marginTop: '20px' }}>
          Ir para a Página de Login
        </a>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para a Home</a>
        <h1 style={{ margin: '0' }}>Publicar Novo Evento</h1>
      </header>

    // CÓDIGO CORRIGIDO/SIMPLIFICADO
// Removemos a DIV do container, deixando apenas o FORM com os estilos de container.
  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho permanece */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para a Home</a>
        <h1 style={{ margin: '0' }}>Publicar Novo Evento</h1>
      </header>

      {/* INÍCIO DO FORMULÁRIO - AGORA É O CONTAINER PRINCIPAL */}
      <form 
        action={criarEvento} 
        style={{ 
          maxWidth: '800px', 
          margin: '40px auto', 
          padding: '30px', 
          backgroundColor: 'white', 
          borderRadius: '8px',
          // Flexbox do formulário
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px', 
          marginTop: '20px' 
        }}
      >
        
        {/* Adicione o parágrafo de login de volta dentro do form */}
        <p style={{ margin: '0' }}>Logado como: {user.email}</p>
        
        {/* ... todos os inputs ... */}
        
        {/* BOTÃO (mantido da Restauração Final) */}
        <button 
          type="submit"
          style={{ 
              backgroundColor: '#f1c40f', 
              color: 'black', 
              padding: '15px', 
              fontWeight: 'bold', 
              border: 'none', 
              fontSize: '16px',
              display: 'block', 
              width: '100%',
              position: 'relative',
              zIndex: 999 
          }}
        >
          Publicar Evento
        </button>

      </form>
    </div>
  );
}
          
          <label htmlFor="nome">Nome do Evento:</label>
          <input id="nome" name="nome" type="text" style={{ padding: '10px' }} required />

          <label htmlFor="capa">Capa do Evento (Imagem):</label>
          <input id="capa" name="capa" type="file" accept="image/*" style={{ padding: '10px' }} required />
          
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

          {/* BOTÃO HTML PURO COM A CORREÇÃO DE FORÇA */}
          <button 
            type="submit"
            style={{ 
                backgroundColor: '#f1c40f', 
                color: 'black', 
                padding: '15px', 
                fontWeight: 'bold', 
                border: 'none', 
                fontSize: '16px',
                display: 'block', 
                width: '100%',
                // Adicionando um z-index de fallback final
                position: 'relative',
                zIndex: 999 
            }}
          >
            Publicar Evento
          </button>

        </form>
      </div>
    </div>
  );
}
