// app/page.js (CÓDIGO COMPLETO E FINAL - Com Imagem e Layout Corrigido)
import { createClient } from './utils/supabase/server';
import Link from 'next/link';

export default async function Index() {
  const supabase = createClient();

  // 1. OBRIGATÓRIO: Obter a lista de eventos (agora com o novo campo 'imagem_url')
  const { data: eventos, error } = await supabase
    .from('eventos')
    .select('*') // Seleciona todos os campos, incluindo 'imagem_url'
    .order('data', { ascending: true });

  // 2. OBRIGATÓRIO: Obter o usuário logado para a interface
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  // 3. Função para formatar a data
  const formatarData = (dataStr) => {
    try {
      const dataObj = new Date(dataStr + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
      return dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return dataStr; // Retorna o original em caso de erro
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: '0' }}>GOLDEN INGRESSOS</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          {/* Botão de Publicar Evento (Aparece se o usuário estiver logado) */}
          {user ? (
            <Link href="/publicar-evento" style={{ 
              backgroundColor: '#f1c40f', 
              color: 'black', 
              padding: '10px 15px', 
              textDecoration: 'none', 
              fontWeight: 'bold',
              borderRadius: '5px'
            }}>
              Publicar Evento
            </Link>
          ) : (
            <Link href="/login" style={{ 
              backgroundColor: '#f1c40f', 
              color: 'black', 
              padding: '10px 15px', 
              textDecoration: 'none', 
              fontWeight: 'bold',
              borderRadius: '5px'
            }}>
              Login / Produtor
            </Link>
          )}

          {/* Nome e Botão de Sair (Aparece se o usuário estiver logado) */}
          {user && (
            <>
              <span style={{ color: 'white' }}>Olá, {user.email}</span>
              <form action="/auth/sign-out" method="post">
                <button type="submit" style={{ 
                  backgroundColor: '#c0392b', 
                  color: 'white', 
                  padding: '10px 15px', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: 'pointer'
                }}>
                  Sair
                </button>
              </form>
            </>
          )}
        </div>
      </header>

      {/* Conteúdo Principal (Lista de Eventos) */}
      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ color: '#5d34a4', borderBottom: '2px solid #5d34a4', paddingBottom: '10px', marginBottom: '30px' }}>
          Eventos em Destaque
        </h2>

        {/* Grade dos Eventos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
          {error && <p style={{ color: 'red' }}>Erro ao carregar eventos.</p>}
          {eventos && eventos.length === 0 && <p>Nenhum evento publicado ainda. Seja o primeiro!</p>}

          {/* LOOP PELOS EVENTOS */}
          {eventos && eventos.map((evento) => (
            <div 
              key={evento.id} 
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '10px', 
                overflow: 'hidden', 
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              
              {/* NOVO: Imagem do Evento (CRÍTICO: Esta parte exibe a URL salva) */}
              {evento.imagem_url && (
                <img 
                  src={evento.imagem_url} 
                  alt={`Capa do Evento: ${evento.nome}`} 
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                />
              )}
              
              {/* Conteúdo do Card */}
              <div style={{ padding: '20px', flexGrow: 1 }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '0.8em', fontWeight: 'bold', color: '#f1c40f' }}>
                  {evento.categoria ? evento.categoria.toUpperCase() : 'CATEGORIA INDEFINIDA'}
                </p>
                
                <h3 style={{ color: '#2c3e50', margin: '0 0 15px 0', fontSize: '1.4em' }}>
                  {evento.nome}
                </h3>
                
                <p style={{ margin: '0 0 8px 0', fontSize: '0.9em' }}>
                  🗓️ Data: **{formatarData(evento.data)}** às **{evento.hora}**
                </p>
                
                <p style={{ margin: '0 0 8px 0', fontSize: '0.9em' }}>
                  📍 Local: **{evento.local}**
                </p>
                
                <p style={{ margin: '0 0 20px 0', fontSize: '1.1em', fontWeight: 'bold', color: '#27ae60' }}>
                  💰 Preço: **{evento.preco}**
                </p>

                {/* Botão de Comprar Ingresso */}
                <button 
                  style={{ 
                    backgroundColor: '#e67e22', 
                    color: 'white', 
                    padding: '10px 15px', 
                    fontWeight: 'bold', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  // FUTURO: Aqui a lógica levaria para a página de compra
                >
                  Comprar Ingresso
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
