'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '../../../../../utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';

export default function ValidarIngressosPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const eventoId = params.id;
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const [evento, setEvento] = useState(null);
  const [escaneando, setEscaneando] = useState(false);
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [cameraSelecionada, setCameraSelecionada] = useState('');
  const [modoManual, setModoManual] = useState(false);
  const [codigoManual, setCodigoManual] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEvento();
    carregarCameras();
    
    return () => {
      pararScanner();
    };
  }, [eventoId]);

  const carregarEvento = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      if (error) throw error;
      setEvento(data);
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      setErro('Erro ao carregar informações do evento');
    } finally {
      setLoading(false);
    }
  };

  const carregarCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      console.log('📷 Câmeras disponíveis:', devices);
      setCameras(devices);
      
      if (devices.length > 0) {
        const cameraTraseira = devices.find(d => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('traseira') ||
          d.label.toLowerCase().includes('rear')
        );
        setCameraSelecionada(cameraTraseira ? cameraTraseira.id : devices[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar câmeras:', error);
    }
  };

  const iniciarScanner = async () => {
    if (html5QrCodeRef.current) {
      await pararScanner();
    }

    try {
      setErro(null);
      setResultado(null);
      
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        cameraSelecionada || { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanError
      );

      setEscaneando(true);
      console.log('📸 Scanner iniciado');

    } catch (error) {
      console.error('Erro ao iniciar scanner:', error);
      setErro('Erro ao iniciar câmera: ' + error.message);
      setEscaneando(false);
    }
  };

  const pararScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        setEscaneando(false);
        console.log('🛑 Scanner parado');
      } catch (error) {
        console.error('Erro ao parar scanner:', error);
      }
    }
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    console.log('✅ QR Code detectado:', decodedText);
    validarIngresso(decodedText);
  };

  const onScanError = (error) => {
    // Ignorar erros de scan contínuo
  };

  const validarIngresso = async (qrCode) => {
    if (validando) return;
    
    setValidando(true);
    setErro(null);
    setResultado(null);

    try {
      if (escaneando && html5QrCodeRef.current) {
        await html5QrCodeRef.current.pause();
      }

      console.log('🔍 Validando ingresso:', qrCode);

      // Buscar ingresso pelo QR Code
      const { data: ingresso, error: ingressoError } = await supabase
        .from('ingressos_vendidos')
        .select(`
          *,
          evento:eventos!ingressos_vendidos_evento_id_fkey(
            id,
            nome,
            local,
            imagem_url
          ),
          sessao:sessoes!ingressos_vendidos_sessao_id_fkey(
            id,
            data,
            hora
          )
        `)
        .eq('qr_code', qrCode)
        .eq('evento_id', eventoId)
        .single();

      if (ingressoError) {
        console.error('❌ Erro ao buscar ingresso:', ingressoError);
        
        if (ingressoError.code === 'PGRST116') {
          throw new Error('Ingresso não encontrado neste evento');
        }
        throw new Error('Erro ao buscar ingresso: ' + ingressoError.message);
      }

      console.log('🎫 Ingresso encontrado:', ingresso);

      // Verificar se já foi validado
      if (ingresso.status === 'USADO' || ingresso.validado) {
        const dataValidacao = ingresso.validado_em 
          ? new Date(ingresso.validado_em).toLocaleString('pt-BR')
          : 'Data não registrada';

        setResultado({
          tipo: 'erro',
          titulo: '❌ INGRESSO JÁ UTILIZADO',
          dados: {
            evento: ingresso.evento?.nome || 'Evento não encontrado',
            local: ingresso.evento?.local || '-',
            comprador: ingresso.comprador_nome || '-',
            tipoIngresso: ingresso.tipo_ingresso || '-',
            assento: ingresso.assento || 'Sem assento',
            validadoEm: dataValidacao,
            status: 'USADO'
          }
        });

        setValidando(false);
        return;
      }

      // Marcar como USADO
      const { error: updateError } = await supabase
        .from('ingressos_vendidos')
        .update({ 
          status: 'USADO',
          validado: true,
          validado_em: new Date().toISOString()
        })
        .eq('id', ingresso.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar status:', updateError);
        throw new Error('Erro ao validar ingresso: ' + updateError.message);
      }

      console.log('✅ Ingresso validado com sucesso!');

      setResultado({
        tipo: 'sucesso',
        titulo: '✅ INGRESSO VÁLIDO',
        dados: {
          evento: ingresso.evento?.nome || 'Evento não encontrado',
          local: ingresso.evento?.local || '-',
          sessaoData: ingresso.sessao?.data 
            ? new Date(ingresso.sessao.data).toLocaleDateString('pt-BR')
            : '-',
          sessaoHora: ingresso.sessao?.hora || '-',
          comprador: ingresso.comprador_nome || '-',
          tipoIngresso: ingresso.tipo_ingresso || '-',
          assento: ingresso.assento || 'Sem assento marcado',
          valor: ingresso.valor ? `R$ ${parseFloat(ingresso.valor).toFixed(2)}` : 'Cortesia',
          validadoAgora: new Date().toLocaleString('pt-BR'),
          status: 'USADO'
        }
      });

      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi78OScTgwOUKfh7bZiHAU7k9nyz3krBSl+zfDckUALFV+06+yoVRQKRp/h7r1tIAUs');
        audio.play().catch(() => {});
      } catch (e) {}

    } catch (error) {
      console.error('❌ Erro ao validar:', error);
      setErro(error.message);
      
      setResultado({
        tipo: 'erro',
        titulo: '❌ ERRO NA VALIDAÇÃO',
        dados: {
          mensagem: error.message
        }
      });
    } finally {
      setValidando(false);
      
      setTimeout(async () => {
        if (escaneando && html5QrCodeRef.current) {
          try {
            await html5QrCodeRef.current.resume();
            console.log('▶️ Scanner retomado');
          } catch (e) {
            console.error('Erro ao retomar scanner:', e);
          }
        }
      }, 3000);
    }
  };

  const validarManualmente = () => {
    if (!codigoManual.trim()) {
      setErro('Digite o código do ingresso');
      return;
    }
    validarIngresso(codigoManual.trim());
  };

  const limparResultado = () => {
    setResultado(null);
    setErro(null);
    setCodigoManual('');
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando...</h2>
      </div>
    );
  }

  if (!evento) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>❌ Evento não encontrado</h2>
        <Link href="/produtor" style={{ color: '#5d34a4', textDecoration: 'underline' }}>
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      
      <header style={{ 
        maxWidth: '600px',
        margin: '0 auto 30px',
        textAlign: 'center'
      }}>
        <Link href={`/produtor/evento/${eventoId}`} style={{ 
          color: 'white',
          textDecoration: 'none',
          float: 'left',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          ← Voltar
        </Link>
        <div style={{ clear: 'both', paddingTop: '10px' }}>
          <h1 style={{ 
            color: 'white',
            fontSize: '32px',
            fontWeight: '800',
            margin: '0 0 10px 0',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            🎫 Validar Ingresso
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)',
            fontSize: '16px',
            margin: '0 0 5px 0',
            fontWeight: '600'
          }}>
            {evento.nome}
          </p>
          <p style={{ 
            color: 'rgba(255,255,255,0.8)',
            fontSize: '14px',
            margin: 0
          }}>
            Escaneie o QR Code ou insira o código manualmente
          </p>
        </div>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        <div style={{ 
          display: 'flex',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => {
              setModoManual(false);
              limparResultado();
              if (!escaneando) iniciarScanner();
            }}
            style={{
              flex: 1,
              padding: '15px',
              backgroundColor: !modoManual ? 'white' : 'rgba(255,255,255,0.2)',
              color: !modoManual ? '#667eea' : 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            📸 Scanner
          </button>
          <button
            onClick={() => {
              setModoManual(true);
              limparResultado();
              if (escaneando) pararScanner();
            }}
            style={{
              flex: 1,
              padding: '15px',
              backgroundColor: modoManual ? 'white' : 'rgba(255,255,255,0.2)',
              color: modoManual ? '#667eea' : 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            ⌨️ Manual
          </button>
        </div>

        {!modoManual ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            marginBottom: '20px'
          }}>
            
            {cameras.length > 1 && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  📷 Câmera:
                </label>
                <select
                  value={cameraSelecionada}
                  onChange={(e) => {
                    setCameraSelecionada(e.target.value);
                    if (escaneando) {
                      pararScanner();
                      setTimeout(() => iniciarScanner(), 500);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  {cameras.map(camera => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label || `Câmera ${camera.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div 
              id="qr-reader" 
              ref={scannerRef}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#000',
                minHeight: escaneando ? '300px' : '0'
              }}
            />

            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              {!escaneando ? (
                <button
                  onClick={iniciarScanner}
                  disabled={cameras.length === 0}
                  style={{
                    flex: 1,
                    padding: '15px',
                    backgroundColor: cameras.length === 0 ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: cameras.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  📸 Iniciar Scanner
                </button>
              ) : (
                <button
                  onClick={pararScanner}
                  style={{
                    flex: 1,
                    padding: '15px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  🛑 Parar Scanner
                </button>
              )}
            </div>

            {cameras.length === 0 && (
              <div style={{
                marginTop: '15px',
                padding: '15px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#856404'
              }}>
                ⚠️ Nenhuma câmera detectada. Permita o acesso à câmera ou use o modo manual.
              </div>
            )}
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            marginBottom: '20px'
          }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '10px'
            }}>
              Digite o código do ingresso:
            </label>
            <input
              type="text"
              value={codigoManual}
              onChange={(e) => setCodigoManual(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') validarManualmente();
              }}
              placeholder="Ex: INGRESSO-123-456..."
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '14px',
                fontFamily: 'monospace',
                marginBottom: '15px'
              }}
            />
            <button
              onClick={validarManualmente}
              disabled={validando || !codigoManual.trim()}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: validando || !codigoManual.trim() ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: validando || !codigoManual.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {validando ? '⏳ Validando...' : '✅ Validar Ingresso'}
            </button>
          </div>
        )}

        {validando && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ 
              fontSize: '60px',
              marginBottom: '15px',
              animation: 'spin 1s linear infinite'
            }}>
              ⏳
            </div>
            <h3 style={{ 
              color: '#667eea',
              margin: '0 0 10px 0',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              Validando ingresso...
            </h3>
            <p style={{ color: '#666', margin: 0 }}>
              Aguarde um momento
            </p>
          </div>
        )}

        {erro && !resultado && (
          <div style={{
            backgroundColor: '#dc3545',
            color: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>
              Erro
            </h3>
            <p style={{ margin: 0, fontSize: '14px' }}>{erro}</p>
            <button
              onClick={limparResultado}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                backgroundColor: 'white',
                color: '#dc3545',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {resultado && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            marginBottom: '20px',
            border: resultado.tipo === 'sucesso' ? '4px solid #27ae60' : '4px solid #dc3545'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '25px',
              paddingBottom: '25px',
              borderBottom: '2px solid #e0e0e0'
            }}>
              <div style={{ 
                fontSize: '80px',
                marginBottom: '15px',
                animation: resultado.tipo === 'sucesso' ? 'bounce 0.5s' : 'shake 0.5s'
              }}>
                {resultado.tipo === 'sucesso' ? '✅' : '❌'}
              </div>
              <h2 style={{
                color: resultado.tipo === 'sucesso' ? '#27ae60' : '#dc3545',
                margin: 0,
                fontSize: '28px',
                fontWeight: '800',
                textTransform: 'uppercase'
              }}>
                {resultado.titulo}
              </h2>
            </div>

            <div style={{ fontSize: '16px', lineHeight: '2' }}>
              {resultado.dados.evento && (
                <>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ fontWeight: '600', color: '#667eea' }}>🎭 Evento:</span>
                    <span style={{ fontWeight: 'bold', color: '#333', textAlign: 'right' }}>
                      {resultado.dados.evento}
                    </span>
                  </div>

                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ fontWeight: '600', color: '#667eea' }}>📍 Local:</span>
                    <span style={{ color: '#666', textAlign: 'right' }}>{resultado.dados.local}</span>
                  </div>

                  {resultado.dados.sessaoData && (
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <span style={{ fontWeight: '600', color: '#667eea' }}>📅 Data:</span>
                      <span style={{ color: '#666' }}>
                        {resultado.dados.sessaoData} às {resultado.dados.sessaoHora}
                      </span>
                    </div>
                  )}

                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ fontWeight: '600', color: '#667eea' }}>👤 Comprador:</span>
                    <span style={{ color: '#666', textAlign: 'right' }}>{resultado.dados.comprador}</span>
                  </div>

                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ fontWeight: '600', color: '#667eea' }}>🎫 Tipo:</span>
                    <span style={{ color: '#666' }}>{resultado.dados.tipoIngresso}</span>
                  </div>

                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ fontWeight: '600', color: '#667eea' }}>💺 Assento:</span>
                    <span style={{ color: '#666' }}>{resultado.dados.assento}</span>
                  </div>

                  {resultado.dados.valor && (
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <span style={{ fontWeight: '600', color: '#667eea' }}>💰 Valor:</span>
                      <span style={{ fontWeight: 'bold', color: '#27ae60' }}>
                        {resultado.dados.valor}
                      </span>
                    </div>
                  )}
                </>
              )}

              {resultado.tipo === 'sucesso' && resultado.dados.validadoAgora && (
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: '#d4edda',
                  borderRadius: '10px',
                  textAlign: 'center',
                  border: '2px solid #27ae60'
                }}>
                  <div style={{ fontSize: '14px', color: '#155724', fontWeight: 'bold' }}>
                    ⏰ Validado em: {resultado.dados.validadoAgora}
                  </div>
                </div>
              )}

              {resultado.tipo === 'erro' && resultado.dados.validadoEm && (
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: '#f8d7da',
                  borderRadius: '10px',
                  textAlign: 'center',
                  border: '2px solid #dc3545'
                }}>
                  <div style={{ fontSize: '14px', color: '#721c24', fontWeight: 'bold' }}>
                    ⚠️ Já foi validado em: {resultado.dados.validadoEm}
                  </div>
                </div>
              )}

              {resultado.dados.mensagem && (
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: '#f8d7da',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '14px', color: '#721c24' }}>
                    {resultado.dados.mensagem}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={limparResultado}
              style={{
                width: '100%',
                marginTop: '25px',
                padding: '15px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ✅ Validar Próximo Ingresso
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}
