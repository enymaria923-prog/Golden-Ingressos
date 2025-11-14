'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import Link from 'next/link';

export default function ProdutorPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [produtor, setProdutor] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [eventosPassados, setEventosPassados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lucroTotal, setLucroTotal] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData) {
        router.push('/login');
        return;
      }
      
      setUser(userData);

      // Removido a busca da tabela produtores (não existe)
      // const { data: produtorData } = await supabase
      //   .from('produtores')
      //   .select('*')
      //   .eq('id', userData.id)
      //   .single();
      // setProdutor(produtorData);

      const dataHoje = new Date().toISOString().split('T')[0];
      const { data: eventosFuturos } = await supabase
        .from('eventos')
        .select('*')
        .eq('user_id', userData.id)
        .gte('data', dataHoje)
        .order('data', { ascending: true });

      setEventos(eventosFuturos || []);

      const { data: eventosPass } = await supabase
        .from('eventos')
        .select('*')
        .eq('user_id', userData.id)
        .lt('data', dataHoje)
        .order('data', { ascending: false });

      setEventosPassados(eventosPass || []);

      const todosEventos = [...(eventosFuturos || []), ...(eventosPass || [])];
      const lucro = calcularLucroTotal(todosEventos);
      setLucroTotal(lucro);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularBonusGolden = (evento) => {
    const taxaCliente = evento.TaxaCliente || evento.taxacliente || 0;
    const ingressosVendidos = evento.ingressos_vendidos || 0;
    const precoMedio = parseFloat(evento.preco_medio) || 0;
    
    const valorTotal = ingressosVendidos * precoMedio;
    
    let percentualBonus = 0;
    if (taxaCliente === 15) percentualBonus = 5;
    else if (taxaCliente === 10) percentualBonus = 3;
    else if (taxaCliente === 8) percentualBonus = 0;
    
    return valorTotal * (percentualBonus / 100);
  };

  const calcularLucroTotal = (todosEventos) => {
    return todosEventos.reduce((total, evento) => {
      return total + calcularBonusGolden(evento);
    }, 0);
  };

  const calcularDadosEvento = (evento) => {
    const totalIngressos = evento.total_ingressos || 0;
    const ingressosVendidos = evento.ingressos_vendidos || 0;
    const ingressosDisponiveis = Math.max(0, totalIngressos - ingressosVendidos);
    const precoMedio = parseFloat(evento.preco_medio) || 0;
    const valorTotalIngressos = ingressosVendidos * precoMedio;
    const bonusGolden = calcularBonusGolden(evento);
    const totalReceber = valorTotalIngressos + bonusGolden;

    return {
      totalIngressos,
      ingressosVendidos,
      ingressosDisponiveis,
      valorTotalIngressos,
      bonusGolden,
      totalReceber
    };
  };

  const extrairCidade = (endereco) => {
    if (!endereco) return 'Não informado';
    
    const partes = endereco.split('-');
    if (partes.length >= 2) {
      const ultimaParte = partes[partes.length - 1].trim();
      return ultimaParte.split('/')[0].trim();
    }
    
    return endereco.split(',')[0].trim();
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px', textAlign: 'center', paddingTop: '100px' }}>
        <h2>Carregando...</h2>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', padding: '20px' }}>
      
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px', marginBottom: '20px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', float: 'left' }}>&larr; Voltar</Link>
        <h1 style={{ margin: '0' }}>Área do Produtor</h1>
        <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Gerencie seus eventos e acompanhe suas vendas</p>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

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
            Este valor representa seu bônus sobre as vendas dos seus eventos
          </p>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <Link 
              href="/publicar-evento" 
              style={{ 
                backgroundColor: '#f1c40f', 
                color: 'black', 
                padding: '12px 25px', 
                borderRadius: '8px', 
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              + Novo Evento
            </Link>
            <Link 
              href="/eventos-passados" 
              style={{ 
                backgroundColor: '#9b59b6', 
                color: 'white', 
                padding: '12px 25px', 
                borderRadius: '8px', 
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              📊 Eventos Passados ({eventosPassados.length})
            </Link>
            <Link 
              href="/minha-vitrine" 
              style={{ 
                backgroundColor: '#e67e22', 
                color: 'white', 
                padding: '12px 25px', 
                borderRadius: '8px', 
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              ✨ Minha Vitrine
            </Link>
          </div>
          
          <Link 
            href="/editar-dados-produtor" 
            style={{ 
              backgroundColor: '#3498db', 
              color: 'white', 
              padding: '12px 25px', 
              borderRadius: '8px', 
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            ⚙️ Editar Meus Dados
          </Link>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '25px', borderBottom: '2px solid #f0f0f0' }}>
            <h2 style={{ color: '#5d34a4', margin: 0 }}>Meus Eventos Futuros</h2>
          </div>

          {eventos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📅</div>
              <h3 style={{ color: '#7f8c8d', marginBottom: '10px' }}>Nenhum evento futuro</h3>
              <p style={{ color: '#95a5a6', marginBottom: '30px' }}>
                Comece criando seu primeiro evento!
              </p>
              <Link 
                href="/publicar-evento" 
                style={{ 
                  backgroundColor: '#f1c40f', 
                  color: 'black', 
                  padding: '15px 30px', 
                  borderRadius: '8px', 
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}
              >
                Criar Primeiro Evento
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Nome do Evento</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#495057' }}>Cidade</th>
                    <th style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: '#495057' }}>Ingressos Vendidos</th>
                    <th style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: '#495057' }}>Ingressos Disponíveis</th>
                    <th style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#495057' }}>Total Ingressos</th>
                    <th style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#495057' }}>Bônus Golden</th>
                    <th style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#495057' }}>Total a Receber</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((evento) => {
                    const dados = calcularDadosEvento(evento);
                    return (
                      <tr 
                        key={evento.id}
                        onClick={() => router.push(`/produtor/evento/${evento.id}`)}
                        style={{ 
                          borderBottom: '1px solid #e9ecef',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <td style={{ padding: '20px' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
                              {evento.nome}
                            </div>
                            <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
                              📅 {new Date(evento.data).toLocaleDateString('pt-BR')} às {evento.hora}
                            </div>
                            <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
                              📍 {evento.local}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '20px', color: '#7f8c8d' }}>
                          {extrairCidade(evento.endereco)}
                        </td>
                        <td style={{ padding: '20px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>
                          {dados.ingressosVendidos}
                        </td>
                        <td style={{ padding: '20px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#e67e22' }}>
                          {dados.ingressosDisponiveis}
                        </td>
                        <td style={{ padding: '20px', textAlign: 'right', fontSize: '16px', fontWeight: 'bold', color: '#2980b9' }}>
                          R$ {dados.valorTotalIngressos.toFixed(2)}
                        </td>
                        <td style={{ padding: '20px', textAlign: 'right', fontSize: '16px', fontWeight: 'bold', color: '#9b59b6' }}>
                          R$ {dados.bonusGolden.toFixed(2)}
                        </td>
                        <td style={{ padding: '20px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: '#16a085' }}>
                          R$ {dados.totalReceber.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px', 
          marginTop: '25px' 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '10px', 
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a085' }}>
              {eventos.length}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '5px' }}>
              Eventos Ativos
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '10px', 
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9b59b6' }}>
              {eventosPassados.length}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '5px' }}>
              Eventos Passados
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '10px', 
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2980b9' }}>
              {eventos.reduce((sum, e) => sum + (e.ingressos_vendidos || 0), 0)}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '5px' }}>
              Total de Ingressos Vendidos
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '10px', 
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e74c3c' }}>
              {eventos.reduce((sum, e) => sum + Math.max(0, (e.total_ingressos || 0) - (e.ingressos_vendidos || 0)), 0)}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '5px' }}>
              Ingressos Disponíveis
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
