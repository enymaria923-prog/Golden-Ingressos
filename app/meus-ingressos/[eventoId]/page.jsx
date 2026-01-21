'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function IngressosEventoPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const eventoId = params.eventoId;

  const [loading, setLoading] = useState(true);
  const [ingressos, setIngressos] = useState([]);
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    carregarIngressos();
  }, []);

  const carregarIngressos = async () => {
    try {
      setLoading(true);

      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Buscar pedidos pagos do usuário para este evento
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select('id, evento_id, sessao_id, status')
        .eq('user_id', user.id)
        .eq('evento_id', eventoId)
        .eq('status', 'PAGO');

      if (pedidosError) throw pedidosError;

      if (!pedidos || pedidos.length === 0) {
        router.push('/meus-ingressos');
        return;
      }

      const pedidosIds = pedidos.map(p => p.id);

      // Buscar ingressos
      const { data: ingressosData, error: ingressosError } = await supabase
        .from('ingressos_vendidos')
        .select('*')
        .in('pedido_id', pedidosIds)
        .order('created_at', { ascending: false });

      if (ingressosError) throw ingressosError;

      // Buscar informações do evento
      const { data: eventoData } = await supabase
        .from('eventos')
        .select('id, nome, local, imagem')
        .eq('id', eventoId)
        .single();

      // Buscar informações da sessão
      const sessaoId = pedidos[0].sessao_id;
      const { data: sessaoData } = await supabase
        .from('sessoes')
        .select('id, data, hora')
        .eq('id', sessaoId)
        .single();

      // Combinar dados
      const ingressosCompletos = ingressosData.map(ingresso => ({
        ...ingresso,
        evento: eventoData,
        sessao: sessaoData
      }));

      setIngressos(ingressosCompletos);
      setEvento(eventoData);

    } catch (error) {
      console.error('Erro ao carregar ingressos:', error);
      alert('Erro ao carregar ingressos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const gerarQRCodeURL = (texto) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(texto)}`;
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando ingressos...</h2>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', paddingBottom: '40px' }}>
      
      {/* Header */}
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px 30px' }}>
        <Link href="/meus-ingressos" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>
          ← Voltar para meus eventos
        </Link>
        <h1 style={{ margin: '10px 0 0 0', fontSize: '28px' }}>🎫 {evento?.nome}</h1>
      </header>

      <div style={{ maxWidth: '800px', margin: '30px auto', padding: '0 20px' }}>
        
        <div style={{ 
          backgroundColor: '#d4edda', 
          padding: '15px 20px', 
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #c3e6cb'
        }}>
          <p style={{ margin: 0, color: '#155724', fontSize: '14px' }}>
            ✅ <strong>Ingressos:</strong> {ingressos.length} ingresso(s)
          </p>
        </div>

        <div style={{ display: 'grid', gap: '30px' }}>
          {ingressos.map((ingresso, index) => (
            <div key={ingresso.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              padding: '30px',
              border: ingresso.validado ? '3px solid #dc3545' : '3px solid #27ae60'
            }}>
              
              {/* Título do Evento */}
              <h2 style={{ 
                color: '#5d34a4', 
                margin: '0 0 20px 0', 
                fontSize: '24px',
                textAlign: 'center'
              }}>
                {ingresso.evento?.nome}
              </h2>

              {/* QR Code */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '25px'
              }}>
                <div style={{
                  width: '250px',
                  height: '250px',
                  backgroundColor: 'white',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '2px solid #5d34a4'
                }}>
                  <img 
                    src={gerarQRCodeURL(ingresso.qr_code)} 
                    alt="QR Code do Ingresso"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                
                {ingresso.validado ? (
                  <div style={{
                    marginTop: '15px',
                    padding: '10px 20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    ❌ JÁ UTILIZADO
                  </div>
                ) : (
                  <div style={{
                    marginTop: '15px',
                    padding: '10px 20px',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    ✅ VÁLIDO
                  </div>
                )}
              </div>

              {/* Tipo de Ingresso e Setor */}
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '5px' }}>
                  {ingresso.tipo_ingresso}
                </div>
                {ingresso.assento && (
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#5d34a4' }}>
                    Assento: {ingresso.assento}
                  </div>
                )}
              </div>

              {/* Data, Hora e Local */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    📅 Data
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                    {ingresso.sessao?.data && new Date(ingresso.sessao.data).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    🕐 Horário
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                    {ingresso.sessao?.hora}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    📍 Local
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                    {ingresso.evento?.local}
                  </div>
                </div>
              </div>

              {ingresso.validado && (
                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8d7da',
                  borderRadius: '8px',
                  border: '1px solid #f5c6cb',
                  marginTop: '20px'
                }}>
                  <div style={{ fontSize: '14px', color: '#721c24', textAlign: 'center' }}>
                    <strong>⚠️ Ingresso utilizado</strong><br />
                    Validado em: {new Date(ingresso.validado_em).toLocaleString('pt-BR')}
                  </div>
                </div>
              )}

              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                border: '1px solid #ffc107',
                fontSize: '13px',
                color: '#856404',
                textAlign: 'center'
              }}>
                💡 <strong>Importante:</strong> Apresente este QR Code na entrada do evento. 
                Cada ingresso só pode ser validado uma vez.
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
