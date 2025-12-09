'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function PagamentoCartaoContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [pedido, setPedido] = useState(null);
  const [dadosCartao, setDadosCartao] = useState({
    number: '',
    holderName: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
    holderInfo: {
      name: '',
      email: '',
      cpfCnpj: '',
      postalCode: '',
      addressNumber: '',
      phone: ''
    }
  });

  const pedidoId = searchParams.get('pedido_id');
  const tipoCartao = searchParams.get('tipo'); // cartao_credito ou cartao_debito

  useEffect(() => {
    carregarPedido();
  }, [pedidoId]);

  const carregarPedido = async () => {
    try {
      setLoading(true);

      const { data: pedidoData, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single();

      if (error) {
        console.error('Erro ao carregar pedido:', error);
        return;
      }

      setPedido(pedidoData);

      // Preencher dados do comprador automaticamente
      setDadosCartao(prev => ({
        ...prev,
        holderInfo: {
          name: pedidoData.comprador_nome,
          email: pedidoData.comprador_email,
          cpfCnpj: pedidoData.comprador_cpf,
          postalCode: '',
          addressNumber: '',
          phone: pedidoData.comprador_telefone || ''
        }
      }));

    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarNumeroCartao = (valor) => {
    const limpo = valor.replace(/\D/g, '');
    const formatado = limpo.match(/.{1,4}/g);
    return formatado ? formatado.join(' ') : limpo;
  };

  const handleNumeroCartaoChange = (e) => {
    const valor = e.target.value.replace(/\D/g, '');
    if (valor.length <= 16) {
      setDadosCartao({ ...dadosCartao, number: valor });
    }
  };

  const handleProcessarPagamento = async () => {
    // Validações
    if (!dadosCartao.number || dadosCartao.number.length < 13) {
      alert('Número do cartão inválido');
      return;
    }

    if (!dadosCartao.holderName) {
      alert('Nome do titular é obrigatório');
      return;
    }

    if (!dadosCartao.expiryMonth || !dadosCartao.expiryYear) {
      alert('Data de validade é obrigatória');
      return;
    }

    if (!dadosCartao.ccv || dadosCartao.ccv.length < 3) {
      alert('CVV inválido');
      return;
    }

    if (!dadosCartao.holderInfo.postalCode || !dadosCartao.holderInfo.addressNumber) {
      alert('CEP e número do endereço são obrigatórios');
      return;
    }

    setProcessando(true);

    try {
      // Obter IP do cliente
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();

      const payload = {
        pedidoId: pedido.id,
        formaPagamento: tipoCartao,
        dadosCartao: {
          ...dadosCartao,
          remoteIp: ipData.ip
        }
      };

      const response = await fetch('/api/pagamento/processar-cartao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar pagamento');
      }

      if (result.aprovado) {
        // Pagamento aprovado! Redirecionar para página de sucesso
        router.push(`/pedido/sucesso?pedido_id=${pedido.id}`);
      } else {
        alert('Pagamento recusado. Verifique os dados do cartão e tente novamente.');
      }

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert(`Erro: ${error.message}`);
    } finally {
      setProcessando(false);
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando...</h2>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>⚠️ Pedido não encontrado</h2>
        <Link href="/">
          <button style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}>
            Voltar para Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f4', minHeight: '100vh', paddingBottom: '40px' }}>
      <header style={{ backgroundColor: '#5d34a4', color: 'white', padding: '20px 30px' }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>
          💳 Pagamento - {tipoCartao === 'cartao_credito' ? 'Cartão de Crédito' : 'Cartão de Débito'}
        </h1>
      </header>

      <div style={{ maxWidth: '600px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* Resumo do Pedido */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Pedido #{pedido.id.substring(0, 8)}</p>
              <p style={{ margin: '5px 0 0 0', color: '#2c3e50', fontSize: '18px', fontWeight: 'bold' }}>
                Total: R$ {parseFloat(pedido.valor_total).toFixed(2)}
              </p>
            </div>
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#fff3cd',
              color: '#856404',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              ⏳ Aguardando
            </div>
          </div>
        </div>

        {/* Formulário do Cartão */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#5d34a4', marginTop: 0, fontSize: '20px', marginBottom: '25px' }}>
            Dados do Cartão
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Número do Cartão */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                Número do Cartão *
              </label>
              <input
                type="text"
                value={formatarNumeroCartao(dadosCartao.number)}
                onChange={handleNumeroCartaoChange}
                placeholder="0000 0000 0000 0000"
                maxLength="19"
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  letterSpacing: '2px'
                }}
              />
            </div>

            {/* Nome do Titular */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                Nome no Cartão *
              </label>
              <input
                type="text"
                value={dadosCartao.holderName}
                onChange={(e) => setDadosCartao({ ...dadosCartao, holderName: e.target.value.toUpperCase() })}
                placeholder="NOME COMO ESTÁ NO CARTÃO"
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  textTransform: 'uppercase'
                }}
              />
            </div>

            {/* Validade e CVV */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                  Mês *
                </label>
                <input
                  type="text"
                  value={dadosCartao.expiryMonth}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '');
                    if (valor.length <= 2 && (valor === '' || (parseInt(valor) >= 1 && parseInt(valor) <= 12))) {
                      setDadosCartao({ ...dadosCartao, expiryMonth: valor });
                    }
                  }}
                  placeholder="MM"
                  maxLength="2"
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    textAlign: 'center'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                  Ano *
                </label>
                <input
                  type="text"
                  value={dadosCartao.expiryYear}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '');
                    if (valor.length <= 4) {
                      setDadosCartao({ ...dadosCartao, expiryYear: valor });
                    }
                  }}
                  placeholder="AAAA"
                  maxLength="4"
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    textAlign: 'center'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                  CVV *
                </label>
                <input
                  type="text"
                  value={dadosCartao.ccv}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '');
                    if (valor.length <= 4) {
                      setDadosCartao({ ...dadosCartao, ccv: valor });
                    }
                  }}
                  placeholder="123"
                  maxLength="4"
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    textAlign: 'center'
                  }}
                />
              </div>
            </div>

            {/* Endereço de Cobrança */}
            <div style={{
              borderTop: '1px solid #e0e0e0',
              paddingTop: '25px',
              marginTop: '10px'
            }}>
              <h3 style={{ color: '#2c3e50', fontSize: '16px', marginTop: 0, marginBottom: '20px' }}>
                Endereço de Cobrança
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                    CEP *
                  </label>
                  <input
                    type="text"
                    value={dadosCartao.holderInfo.postalCode}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, '');
                      if (valor.length <= 8) {
                        setDadosCartao({
                          ...dadosCartao,
                          holderInfo: { ...dadosCartao.holderInfo, postalCode: valor }
                        });
                      }
                    }}
                    placeholder="00000000"
                    maxLength="8"
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
                    Número *
                  </label>
                  <input
                    type="text"
                    value={dadosCartao.holderInfo.addressNumber}
                    onChange={(e) => setDadosCartao({
                      ...dadosCartao,
                      holderInfo: { ...dadosCartao.holderInfo, addressNumber: e.target.value }
                    })}
                    placeholder="123"
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#999', margin: '10px 0 0 0' }}>
                ℹ️ Usamos o CEP apenas para validação com a operadora do cartão
              </p>
            </div>

            {/* Botão de Pagamento */}
            <button
              onClick={handleProcessarPagamento}
              disabled={processando}
              style={{
                width: '100%',
                backgroundColor: processando ? '#95a5a6' : '#27ae60',
                color: 'white',
                border: 'none',
                padding: '18px',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: processando ? 'not-allowed' : 'pointer',
                marginTop: '10px',
                transition: 'all 0.3s'
              }}
            >
              {processando ? '⏳ Processando...' : `💳 Pagar R$ ${parseFloat(pedido.valor_total).toFixed(2)}`}
            </button>

          </div>
        </div>

        {/* Segurança */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#d4edda',
          borderRadius: '8px',
          border: '1px solid #c3e6cb'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#155724', textAlign: 'center' }}>
            🔒 Pagamento 100% seguro. Seus dados são criptografados
          </p>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link href={`/checkout?evento_id=${pedido.evento_id}&sessao_id=${pedido.sessao_id}`} style={{ color: '#5d34a4', textDecoration: 'none', fontSize: '14px' }}>
            ← Voltar para checkout
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function PagamentoCartaoPage() {
  return (
    <Suspense fallback={
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando...</h2>
      </div>
    }>
      <PagamentoCartaoContent />
    </Suspense>
  );
}
