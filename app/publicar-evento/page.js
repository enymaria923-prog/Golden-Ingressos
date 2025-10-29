// app/publicar-evento/page.js

import { createClient } from '../../utils/supabase/server'; 
import { criarEvento } from '../actions';
import FormularioPublicacao from './FormularioPublicacao'; // NOVO COMPONENTE CLIENTE

export default async function PublicarEventoPage() {
  
  const supabase = createClient();
  const { data, error: userError } = await supabase.auth.getUser();
  const user = data?.user;

  // LÓGICA DE PROTEÇÃO DE PRODUTOR
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
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center' }}>
        <a href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar para a Home</a>
        <h1 style={{ margin: '0' }}>Publicar Novo Evento</h1>
      </header>

      {/* Renderiza o Formulário Cliente */}
      <FormularioPublicacao 
        criarEventoAction={criarEvento} 
        userEmail={user.email} 
      />
    </div>
  );
}
