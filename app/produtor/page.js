// app/produtor/page.js

import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProdutorPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Buscar dados do produtor
  const { data: produtor } = await supabase
    .from('produtores')
    .select('*')
    .eq('id', user.id)
    .single();

  // Buscar eventos futuros do produtor
  const { data: eventos } = await supabase
    .from('eventos')
    .select('*')
    .eq('produtor_id', user.id)
    .gte('data', new Date().toISOString())
    .order('data', { ascending: true });

  // Buscar eventos passados para contar
  const { data: eventosPassados } = await supabase
    .from('eventos')
    .select('id')
    .eq('produtor_id', user.id)
    .lt('data', new Date().toISOString());

  // Buscar ingressos vendidos (você precisará implementar essa lógica)
  const { data: ingressosVendidos } = await supabase
    .from('ingressos')
    .select('id')
    .eq('produtor_id', user.id);

  // Calcular lucro total (você precisará implementar essa lógica baseada nas taxas)
  const lucroTotal = 0; // Implementar cálculo real

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      {/* Cabeçalho */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '20px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar</Link>
        <h1 style={{ margin: '0' }}>Área do Produtor</h1>
        <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Gerencie seus eventos e acompanhe suas vendas</p>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Cartão de Lucro - Só mostra se houver lucro */}
        {lucroTotal > 0 && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            marginBottom: '25px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>💰 Quanto você já lucrou por vender com a Golden</h2>
            <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '15px 0' }}>
              R$ {lucroTotal.toFixed(2)}
            </div>
            <p style={{ margin: '0', opacity: 0.9, fontSize: '14px' }}>
              Este valor representa sua parte das taxas sobre as vendas dos seus eventos
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>

          {/* Coluna Esquerda - Eventos */}
          <div>

            {/* Seção Meus Eventos */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#5d34a4', margin: 0 }}>Meus Eventos</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link 
                    href="/publicar-evento" 
                    style={{ 
                      backgroundColor: '#f1c40f', 
                      color: 'black', 
                      padding: '10px 20px', 
                      borderRadius: '6px', 
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    + Novo Evento
                  </Link>
                  <Link 
                    href="/eventos-passados" 
                    style={{ 
                      backgroundColor: '#95a5a6', 
                      color: 'white', 
                      padding: '10px 20px', 
                      borderRadius: '6px', 
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    Eventos Passados ({eventosPassados?.length || 0})
                  </Link>
                </div>
              </div>

              {eventos && eventos.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {eventos.map((evento) => (
                    <div key={evento.id} style={{ 
                      border: '1px solid #e1e8ed', 
                      borderRadius: '8px', 
                      padding: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '18px' }}>
                          {evento.nome}
                        </h3>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#7f8c8d' }}>
                          <span>
                            <strong>Data:</strong> {new Date(evento.data).toLocaleDateString('pt-BR')}
                          </span>
                          <span>
                            <strong>Local:</strong> {evento.local || 'Online'}
                          </span>
                          <span>
                            <strong>Ingressos vendidos:</strong> {evento.ingressos_vendidos || 0}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Link 
                          href={`/editar-evento/${evento.id}`}
                          style={{ 
                            backgroundColor: '#3498db', 
                            color: 'white', 
                            padding: '8px 15px', 
                            borderRadius: '5px', 
                            textDecoration: 'none',
                            fontSize: '14px'
                          }}
                        >
                          Editar
                        </Link>
                        <Link 
                          href={`/evento/${evento.id}`}
                          style={{ 
                            backgroundColor: '#2ecc71', 
                            color: 'white', 
                            padding: '8px 15px', 
                            borderRadius: '5px', 
                            textDecoration: 'none',
                            fontSize: '14px'
                          }}
                        >
                          Ver Detalhes
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '48px', color: '#bdc3c7', marginBottom: '15px' }}>📅</div>
                  <h3 style={{ color: '#7f8c8d', marginBottom: '10px' }}>Nenhum evento futuro</h3>
                  <p style={{ color: '#95a5a6', marginBottom: '25px' }}>
                    Você ainda não publicou nenhum evento futuro.
                  </p>
                  <Link 
                    href="/publicar-evento" 
                    style={{ 
                      backgroundColor: '#f1c40f', 
                      color: 'black', 
                      padding: '12px 25px', 
                      borderRadius: '6px', 
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    Criar Primeiro Evento
                  </Link>
                </div>
              )}
            </div>

            {/* Estatísticas Reais */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '25px', 
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ color: '#5d34a4', margin: '0 0 20px 0' }}>Estatísticas</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', textAlign: 'center' }}>
                <div style={{ padding: '15px', backgroundColor: '#e8f6f3', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a085' }}>{eventos?.length || 0}</div>
                  <div style={{ fontSize: '14px', color: '#1abc9c' }}>Eventos Ativos</div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#e8f4fd', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2980b9' }}>{ingressosVendidos?.length || 0}</div>
                  <div style={{ fontSize: '14px', color: '#3498db' }}>Ingressos Vendidos</div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#fef9e7', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f39c12' }}>{eventosPassados?.length || 0}</div>
                  <div style={{ fontSize: '14px', color: '#f1c40f' }}>Eventos Passados</div>
                </div>
              </div>
            </div>

          </div>

          {/* Coluna Direita - Dados do Produtor */}
          <div>

            {/* Dados do Produtor */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '25px', 
              borderRadius: '12px',
              marginBottom: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#5d34a4', margin: 0 }}>Seus Dados</h2>
                <Link 
                  href="/editar-dados-produtor" 
                  style={{ 
                    backgroundColor: '#5d34a4', 
                    color: 'white', 
                    padding: '8px 15px', 
                    borderRadius: '5px', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Editar
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Dados Pessoais */}
                <div>
                  <h3 style={{ color: '#2c3e50', fontSize: '16px', margin: '0 0 10px 0', borderBottom: '1px solid #ecf0f1', paddingBottom: '5px' }}>
                    Dados Pessoais
                  </h3>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Nome Completo:</strong><br />
                    {produtor?.nome_completo || 'Não informado'}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Empresa:</strong><br />
                    {produtor?.nome_empresa || 'Não informado'}
                  </p>
                </div>

                {/* Recebimento PIX */}
                <div>
                  <h3 style={{ color: '#2c3e50', fontSize: '16px', margin: '0 0 10px 0', borderBottom: '1px solid #ecf0f1', paddingBottom: '5px' }}>
                    Recebimento via PIX
                  </h3>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Chave PIX:</strong><br />
                    {produtor?.chave_pix || 'Não informado'}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Tipo:</strong><br />
                    {produtor?.tipo_chave_pix || 'Não informado'}
                  </p>
                </div>

                {/* Dados Bancários */}
                {produtor?.dados_bancarios && (
                  <div>
                    <h3 style={{ color: '#2c3e50', fontSize: '16px', margin: '0 0 10px 0', borderBottom: '1px solid #ecf0f1', paddingBottom: '5px' }}>
                      Dados Bancários
                    </h3>
                    <p style={{ margin: '5px 0' }}>
                      {produtor.dados_bancarios}
                    </p>
                  </div>
                )}

                {/* Preferências */}
                <div>
                  <h3 style={{ color: '#2c3e50', fontSize: '16px', margin: '0 0 10px 0', borderBottom: '1px solid #ecf0f1', paddingBottom: '5px' }}>
                    Preferências
                  </h3>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Forma de Pagamento:</strong><br />
                    {produtor?.forma_pagamento ? 
                      (produtor.forma_pagamento === 'apenas_pix' ? 'Apenas PIX' :
                       produtor.forma_pagamento === 'apenas_transferencia' ? 'Apenas Transferência' :
                       produtor.forma_pagamento === 'ambos' ? 'Ambos (PIX e Transferência)' :
                       produtor.forma_pagamento) 
                      : 'Não informado'}
                  </p>
                </div>

              </div>
            </div>

            {/* Ações Rápidas */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '25px', 
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ color: '#5d34a4', margin: '0 0 20px 0' }}>Ações Rápidas</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link 
                  href="/publicar-evento"
                  style={{
                    display: 'block',
                    padding: '12px 15px',
                    backgroundColor: '#f1c40f',
                    color: 'black',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                >
                  📝 Criar Novo Evento
                </Link>
                <Link 
                  href="/eventos-passados"
                  style={{
                    display: 'block',
                    padding: '12px 15px',
                    backgroundColor: '#9b59b6',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                >
                  📊 Meus Eventos Passados
                </Link>
                <Link 
                  href="/editar-dados-produtor"
                  style={{
                    display: 'block',
                    padding: '12px 15px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                >
                  ⚙️ Editar Meus Dados
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
