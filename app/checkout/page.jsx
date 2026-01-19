'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '../../utils/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function CheckoutContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [evento, setEvento] = useState(null);
  const [sessao, setSessao] = useState(null);
  const [itensCarrinho, setItensCarrinho] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [cupom, setCupom] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [user, setUser] = useState(null);
  const [dadosComprador, setDadosComprador] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: ''
  });

  const eventoId = searchParams.get('evento_id');
  const sessaoId = searchParams.get('sessao_id');
  const lugarMarcado = searchParams.get('lugar_marcado') === 'true';
  const cupomId = searchParams.get('cupom_id');

  useEffect(() => {
    carregarUsuario();
    carregarDados();
  }, [eventoId, sessaoId]);

  const carregarUsuario = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUser(user);
      
      const { data: perfil } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', user.id)
        .single();

      if (perfil) {
        setDadosComprador({
          nome: perfil.nome_completo || user.user_metadata?.nome_completo || '',
          email: user.email || '',
          cpf: perfil.cpf || '',
          telefone: perfil.telefone || ''
        });
      } else {
        setDadosComprador({
          nome: user.user_metadata?.nome_completo || '',
          email: user.email || '',
          cpf: '',
          telefone: ''
        });
      }
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);

      const { data: eventoData } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventoId)
        .single();

      setEvento(eventoData);

      const { data: sessaoData } = await supabase
        .from('sessoes')
        .select('*')
        .eq('id', sessaoId)
        .single();

      setSessao(sessaoData);

      const itensParam = searchParams.get('itens');
      if (itensParam) {
        const itens = JSON.parse(itensParam);
        
        const ingressosIds = itens.map(item => item.ingressoId);
        const { data: ingressosData } = await supabase
          .from('ingressos')
          .select('*')
          .in('id', ingressosIds);

        const itensDetalhados = itens.map(item => {
          const ingresso = ingressosData.find(i => i.id === item.ingressoId);
          return {
            ...item,
            ingresso,
            tipo: ingresso?.tipo || '',
            valor: parseFloat(ingresso?.valor || 0)
          };
        });

        setItensCarrinho(itensDetalhados);
      }

      const produtosParam = searchParams.get('produtos');
      if (produtosParam) {
        try {
          const produtosIds = JSON.parse(produtosParam);
          
          const { data: produtosData } = await supabase
            .from('produtos')
            .select('*')
            .in('id', produtosIds.map(p => p.id));

          if (produtosData) {
            const produtosComQuantidade = produtosData.map(produto => {
              const produtoParam = produtosIds.find(p => p.id === produto.id);
              return {
                ...produto,
                quantidade: produtoParam?.quantidade || 1
              };
            });
            
            setProdutos(produtosComQuantidade);
          }
        } catch (error) {
          console.error('Erro ao carregar produtos:', error);
        }
      }

      if (cupomId) {
        const { data: cupomData } = await supabase
          .from('cupons')
          .select('*')
          .eq('id', cupomId)
          .single();

        setCupom(cupomData);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularSubtotal = () => {
    let total = itensCarrinho.reduce((acc, item) => {
      const quantidade = lugarMarcado ? 1 : (item.quantidade || 0);
      return acc + (item.valor * quantidade);
    }, 0);
    
    total += produtos.reduce((acc, produto) => {
      return acc + (parseFloat(produto.preco) * (produto.quantidade || 1));
    }, 0);
    
    return total;
  };

  const calcularDesconto = () => {
    if (!cupom) return 0;
    
    const subtotal = calcularSubtotal();
    
    if (cupom.tipo_desconto === 'percentual') {
      return subtotal * (cupom.valor_desconto / 100);
    } else {
      return Math.min(cupom.valor_desconto, subtotal);
    }
  };

  const calcularTaxas = () => {
    const subtotal = calcularSubtotal() - calcularDesconto();
    const taxaPercentual = evento?.TaxaCliente || 15;
    return subtotal * (taxaPercentual / 100);
  };

  const calcularTotal = () => {
    return calcularSubtotal() - calcularDesconto() + calcularTaxas();
  };

  const handleFinalizarPedido = async () => {
    // Validações
    if (!dadosComprador.nome || !dadosComprador.email || !dadosComprador.cpf) {
      alert('Por favor, preencha todos os dados obrigatórios!');
      return;
    }

    // Validar CPF
    const cpfLimpo = dadosComprador.cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      alert('CPF inválido! Digite um CPF válido com 11 dígitos.');
      return;
    }

    setProcessando(true);

    try {
      // Preparar itens em formato JSON
      const itensJson = itensCarrinho.map(item => ({
        ingresso_id: item.ingressoId,
        tipo: item.tipo,
        quantidade: lugarMarcado ? 1 : item.quantidade,
        valor_unitario: item.valor,
        assento: item.assento || null
      }));

      // Preparar produtos em formato JSON
      const produtosJson = produtos.map(produto => ({
        produto_id: produto.id,
        nome: produto.nome,
        quantidade: produto.quantidade,
        valor_unitario: parseFloat(produto.preco)
      }));

      // Criar pedido no banco de dados
      const pedidoData = {
        evento_id: eventoId,
        sessao_id: sessaoId,
        user_id: user?.id || null,
        nome_comprador: dadosComprador.nome,
        email_comprador: dadosComprador.email,
        cpf_comprador: cpfLimpo,
        telefone_comprador: dadosComprador.telefone,
        forma_pagamento: formaPagamento,
        subtotal: calcularSubtotal(),
        desconto: calcularDesconto(),
        taxa_servico: calcularTaxas(),
        valor_total: calcularTotal(),
        cupom_id: cupomId || null,
        status: 'PENDENTE',
        itens: itensJson,
        produtos: produtosJson.length > 0 ? produtosJson : null
      };

      console.log('📤 Criando pedido...', pedidoData);

      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([pedidoData])
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      console.log('✅ Pedido criado:', pedido);

      // Redirecionar para página de pagamento específica
      const params = new URLSearchParams({
        pedido_id: pedido.id,
        valor: calcularTotal().toFixed(2),
        nome: dadosComprador.nome,
        email: dadosComprador.email,
        cpf: cpfLimpo
      });

      if (formaPagamento === 'pix') {
        router.push(`/pagamento/pix?${params.toString()}`);
      } else if (formaPagamento === 'boleto') {
        router.push(`/pagamento/boleto?${params.toString()}`);
      } else if (formaPagamento === 'cartao_credito' || formaPagamento === 'cartao_debito') {
        params.append('tipo', formaPagamento);
        router.push(`/pagamento/cartao?${params.toString()}`);
      }

    } catch (error) {
      console.error('❌ Erro ao finalizar pedido:', error);
      alert(`Erro ao processar pedido: ${error.message}`);
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

  if (!evento) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>⚠️ Erro ao carregar checkout</h2>
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
        <Link href={`/evento/${eventoId}`} style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>
          ← Voltar
        </Link>
        <h1 style={{ margin: '10px 0 0 0', fontSize: '28px' }}>Checkout - {evento.nome}</h1>
      </header>

      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
        
        {/* Coluna Esquerda */}
        <div>
          {/* Dados do Comprador */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h2 style={{ color: '#5d34a4', marginTop: 0, fontSize: '24px', marginBottom: '20px' }}>
              👤 Dados do Comprador
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={dadosComprador.nome}
                  onChange={(e) => setDadosComprador({...dadosComprador, nome: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                  E-mail *
                </label>
                <input
                  type="email"
                  value={dadosComprador.email}
                  onChange={(e) => setDadosComprador({...dadosComprador, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="seu@email.com"
                  disabled={!!user}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={dadosComprador.cpf}
                    onChange={(e) => setDadosComprador({...dadosComprador, cpf: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={dadosComprador.telefone}
                    onChange={(e) => setDadosComprador({...dadosComprador, telefone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {user && (
                <div style={{
                  padding: '10px',
                  backgroundColor: '#d4edda',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#155724',
                  border: '1px solid #c3e6cb'
                }}>
                  ✅ Dados preenchidos automaticamente da sua conta
                </div>
              )}
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#5d34a4', marginTop: 0, fontSize: '24px', marginBottom: '20px' }}>
              💳 Forma de Pagamento
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{
                padding: '20px',
                border: formaPagamento === 'pix' ? '3px solid #5d34a4' : '2px solid #e0e0e0',
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor: formaPagamento === 'pix' ? '#f0e6ff' : 'white',
                transition: 'all 0.3s'
              }}>
                <input
                  type="radio"
                  name="pagamento"
                  value="pix"
                  checked={formaPagamento === 'pix'}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <span style={{ fontSize: '18px', fontWeight: '600' }}>📱 PIX</span>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '5px', marginLeft: '25px' }}>
                  Pagamento instantâneo
                </div>
              </label>

              <label style={{
                padding: '20px',
                border: formaPagamento === 'cartao_credito' ? '3px solid #5d34a4' : '2px solid #e0e0e0',
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor: formaPagamento === 'cartao_credito' ? '#f0e6ff' : 'white',
                transition: 'all 0.3s'
              }}>
                <input
                  type="radio"
                  name="pagamento"
                  value="cartao_credito"
                  checked={formaPagamento === 'cartao_credito'}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <span style={{ fontSize: '18px', fontWeight: '600' }}>💳 Cartão de Crédito</span>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '5px', marginLeft: '25px' }}>
                  Parcele em até 12x
                </div>
              </label>

              <label style={{
                padding: '20px',
                border: formaPagamento === 'cartao_debito' ? '3px solid #5d34a4' : '2px solid #e0e0e0',
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor: formaPagamento === 'cartao_debito' ? '#f0e6ff' : 'white',
                transition: 'all 0.3s'
              }}>
                <input
                  type="radio"
                  name="pagamento"
                  value="cartao_debito"
                  checked={formaPagamento === 'cartao_debito'}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <span style={{ fontSize: '18px', fontWeight: '600' }}>💳 Cartão de Débito</span>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '5px', marginLeft: '25px' }}>
                  Débito em conta
                </div>
              </label>

              <label style={{
                padding: '20px',
                border: formaPagamento === 'boleto' ? '3px solid #5d34a4' : '2px solid #e0e0e0',
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor: formaPagamento === 'boleto' ? '#f0e6ff' : 'white',
                transition: 'all 0.3s'
              }}>
                <input
                  type="radio"
                  name="pagamento"
                  value="boleto"
                  checked={formaPagamento === 'boleto'}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <span style={{ fontSize: '18px', fontWeight: '600' }}>📄 Boleto</span>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '5px', marginLeft: '25px' }}>
                  Pagamento em até 3 dias
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Resumo */}
        <div>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', position: 'sticky', top: '20px' }}>
            <h2 style={{ color: '#5d34a4', marginTop: 0, fontSize: '24px', marginBottom: '20px' }}>
              🛒 Resumo do Pedido
            </h2>

            {/* Evento */}
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
              <h3 style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '10px' }}>{evento.nome}</h3>
              <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                📅 {sessao?.data && new Date(sessao.data).toLocaleDateString('pt-BR')}
              </p>
              <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                🕐 {sessao?.hora}
              </p>
              <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                📍 {evento.local}
              </p>
            </div>

            {/* Itens */}
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
              <h3 style={{ fontSize: '16px', color: '#2c3e50', marginBottom: '15px' }}>Ingressos:</h3>
              {itensCarrinho.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                      {item.tipo}
                      {lugarMarcado && item.assento && (
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                          ({item.assento})
                        </span>
                      )}
                    </div>
                    {!lugarMarcado && (
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        Qtd: {item.quantidade}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#27ae60' }}>
                    R$ {(item.valor * (lugarMarcado ? 1 : item.quantidade)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Produtos */}
            {produtos.length > 0 && (
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
                <h3 style={{ fontSize: '16px', color: '#2c3e50', marginBottom: '15px' }}>Produtos:</h3>
                {produtos.map((produto, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                        {produto.nome}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        Qtd: {produto.quantidade}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#27ae60' }}>
                      R$ {(parseFloat(produto.preco) * produto.quantidade).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totais */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Subtotal:</span>
                <span style={{ fontSize: '14px', color: '#666' }}>R$ {calcularSubtotal().toFixed(2)}</span>
              </div>

              {cupom && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', color: '#28a745' }}>Desconto ({cupom.codigo}):</span>
                  <span style={{ fontSize: '14px', color: '#28a745' }}>- R$ {calcularDesconto().toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Taxa de serviço:</span>
                <span style={{ fontSize: '14px', color: '#666' }}>R$ {calcularTaxas().toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', borderTop: '2px solid #5d34a4' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>Total:</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                  R$ {calcularTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botão Finalizar */}
            <button
              onClick={handleFinalizarPedido}
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
                transition: 'all 0.3s',
                boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)'
              }}
              onMouseOver={(e) => !processando && (e.target.style.transform = 'scale(1.02)')}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              {processando ? '⏳ Processando...' : '🎫 Finalizar Pedido'}
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '12px', color: '#999' }}>
                <span>🔒 Pagamento seguro</span>
                <span>✅ Entrada garantida</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ fontFamily: 'sans-serif', padding: '50px', textAlign: 'center' }}>
        <h2>🔄 Carregando...</h2>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
