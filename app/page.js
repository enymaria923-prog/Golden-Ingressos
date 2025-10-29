// app/page.js
// CÓDIGO COMPLETO E CORRIGIDO PARA ABRIR A HOME E CONSERTAR O BOTÃO DE COMPRA

import { createClient } from '../utils/supabase/server'; 
import Link from 'next/link'; 

// --- Componente do Cartão do Evento (CardEvento) ---
function CardEvento({ evento }) {
  // Converte o preço para formato BRL (se for um número)
  const precoFormatado = isNaN(parseFloat(evento.preco)) 
    ? evento.preco 
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(evento.preco));
  
  // O link para a página de detalhes (assumindo que a página é /evento/[id])
  const eventoDetalheUrl = `/evento/${evento.id}`; 

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
      overflow: 'hidden', 
      width: '300px', 
      margin: '20px',
      transition: 'transform 0.3s',
      fontFamily: 'sans-serif'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Imagem da Capa */}
      <div style={{ height: '180px', overflow: 'hidden' }}>
        <img 
          src={evento.imagem_url || 'https://placehold.co/300x180/5d34a4/ffffff?text=EVENTO'} 
          alt={`Capa do evento ${evento.nome}`} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      
      {/* Detalhes */}
      <div style={{ padding: '15px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#5d34a4', fontSize: '1.4em' }}>
          {evento.nome}
        </h3>
        <p style={{ margin: '0 0 5px 0', fontSize: '0.9em' }}>
          **{evento.categoria}** | {new Date(evento.data).toLocaleDateString('pt-BR')}
        </p>
        <p style={{ margin: '0 0 15px 0', fontWeight: 'bold' }}>
          Preço: {precoFormatado}
        </p>

        {/* BOTÃO COMPRAR INGRESSO CORRIGIDO: Usa Link do Next.js */}
        <Link href={eventoDetalheUrl}>
          <button style={{
            backgroundColor: '#f1c40f',
            color: 'black',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
            transition: 'background-color 0.3s'
          }}>
            Comprar Ingresso
          </button>
        </Link>
      </div>
    </div>
  );
}


// --- Componente Principal da Home Page ---
export default async function Index() {
  
  // Tentativa de criar o cliente Supabase. Esta linha pode ter causado o erro se o caminho estivesse errado.
  const supabase = createClient(); 
  
  // Busca dos eventos
  const { data: eventos, error } = await supabase
    .from('eventos')
    .select('*')
    .order('data', { ascending: true }); 

  if (error) {
    console.error('Erro ao buscar eventos:', error);
    return (
      <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '50px' }}>
        <h1>Erro ao carregar eventos</h1>
        <p>A Home Page não pôde se conectar ao banco de dados ou a importação falhou. Por favor, verifique o console.</p>
      </div>
    );
  }
  
  // Estilos
  const containerStyle = {
    fontFamily: 'sans-serif',
    backgroundColor: '#f4f4f4',
    minHeight: '100vh',
    padding: '20px',
  };

  const eventosGridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '30px',
    maxWidth: '1200px',
    margin: '40px auto',
  };

  return (
    <div style={containerStyle}>
      
      {/* Cabeçalho */}
      <header style={{ 
        backgroundColor: '#5d34a4', 
        color: 'white', 
        padding: '20px', 
        textAlign: 'center',
        marginBottom: '20px',
        borderRadius: '8px'
      }}>
        <h1 style={{ margin: '0', fontSize: '2em' }}>GOLDEN INGRESSOS</h1>
        <p style={{ margin: '5px 0 0 0' }}>Encontre seu próximo evento inesquecível.</p>
      </header>
      
      {/* Botões de Ação */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        
        {/* BOTÃO PUBLICAR EVENTO: Usando A pura para evitar problemas de componente cliente/servidor */}
        <a href="/publicar-evento" style={{ textDecoration: 'none' }}>
            <button style={{ 
                backgroundColor: '#f1c40f', 
                color: 'black', 
                padding: '12px 25px', 
                border: 'none', 
                borderRadius: '5px', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                marginRight: '15px'
            }}>
                Publicar Novo Evento
            </button>
        </a>

        {/* Botão Entrar */}
        <a href="/login" style={{ textDecoration: 'none' }}>
            <button style={{ 
                backgroundColor: '#fff', 
                color: '#5d34a4', 
                padding: '12px 25px', 
                border: '2px solid #5d34a4', 
                borderRadius: '5px', 
                fontWeight: 'bold', 
                cursor: 'pointer'
            }}>
                Entrar
            </button>
        </a>
      </div>

      {/* Exibição dos Eventos */}
      <h2 style={{ textAlign: 'center', color: '#333' }}>Eventos em Destaque</h2>

      {eventos && eventos.length > 0 ? (
        <div style={eventosGridStyle}>
          {eventos.map((evento) => (
            <CardEvento key={evento.id} evento={evento} />
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', fontSize: '1.2em', color: '#666' }}>Nenhum evento encontrado no momento. Seja o primeiro a publicar!</p>
