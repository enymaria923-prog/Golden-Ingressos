// app/page.js - Página Inicial "Inteligente"

import { createClient } from '../utils/supabase/server';
import { logout } from './actions-auth'; // Importa a ação de Logout

export default async function HomePage() {
  
  // 1. CRIA O CLIENTE SUPABASE (igual a antes)
  const supabase = createClient();

  // 2. TENTA BUSCAR O USUÁRIO LOGADO
  const { data: { user } } = await supabase.auth.getUser();

  // 3. BUSCA OS EVENTOS (igual a antes, com a correção do 'select')
  const { data: eventos, error } = await supabase
    .from('eventos')
    .select('id, nome, data, hora, local, preco, categoria')
    .order('id', { ascending: false });

  if (error) {
    console.error("Erro ao buscar eventos:", error);
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      
      {/* CABEÇALHO ATUALIZADO */}
      <header style={{ 
        backgroundColor: '#5d34a4', color: 'white', padding: '20px', 
        textAlign: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
      }}>
        
        {/* Logo (clicável para a Home) */}
        <a href="/" style={{ color: 'white', textDecoration: 'none' }}>
          <h1 style={{ margin: '0', fontSize: '24px' }}>GOLDEN INGRESSOS</h1>
        </a>

        {/* Links de Ação (Login/Perfil/Publicar) */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          
          <a href="/publicar-evento" style={{ backgroundColor: '#f1c40f', color: 'black', padding: '10px 15px', borderRadius: '5px', fontWeight: 'bold', textDecoration: 'none' }}>
            Publicar Evento
          </a>
          
          {/* A MÁGICA ACONTECE AQUI: */}
          {user ? (
            // Se o usuário ESTIVER logado:
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px' }}>Olá, {user.email}</span>
              {/* Formulário de Logout (para segurança) */}
              <form action={logout}>
                <button type="submit" style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid white', padding: '10px 15px', cursor: 'pointer', borderRadius: '5px' }}>
                  Sair
                </button>
              </form>
            </div>
          ) : (
            // Se o usuário NÃO ESTIVER logado:
            <a href="/login" style={{ backgroundColor: 'white', color: '#5d34a4', padding: '10px 15px', borderRadius: '5px', fontWeight: 'bold', textDecoration: 'none' }}>
              Login / Cadastrar
            </a>
          )}
        </div>
      </header>

      {/* Conteúdo Principal (O RESTO DO CÓDIGO É IDÊNTICO) */}
      <div style={{ width: '80%', margin: '20px auto', padding: '20px' }}>
        <h2 style={{ color: '#5d34a4' }}>Eventos em Destaque</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {(!eventos || eventos.length === 0) && (
            <p>Ainda não há eventos publicados. Seja o primeiro!</p>
          )}

          {eventos && eventos.map(evento => (
            <div key={evento.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
              <span style={{ fontSize: '12px', color: '#5d34a4', fontWeight: 'bold' }}>{evento.categoria.toUpperCase()}</span>
              <h3 style={{ color: '#333', marginTop: '5px' }}>{evento.nome}</h3>
              <p>📅 Data: **{evento.data}** às **{evento.hora}**</p>
              <p>📍 Local: **{evento.local}**</p>
              <p>💰 Preço: **{evento.preco}**</p>
              <a 
                href={`/evento/${evento.id}`} 
                style={{ 
                  backgroundColor: '#f1c40f', color: 'black', padding: '10px 15px', 
                  borderRadius: '5px', textDecoration: 'none', display: 'inline-block', 
                  marginTop: '10px', fontWeight: 'bold'
                }}
              >
                Comprar Ingresso
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
