'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '../../utils/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import '../styles/checkout.css';

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
  const [theme, setTheme] = useState('dark');
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
    // Carregar tema do localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    carregarUsuario();
    carregarDados();
  }, [eventoId, sessaoId]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

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
      <div className="loading-container">
        <h2>🔄 Carregando...</h2>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="error-container">
        <h2>⚠️ Erro ao carregar checkout</h2>
        <Link href="/">
          <button className="btn-home">
            Voltar para Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <div className="checkout-header-content">
          <Link href={`/evento/${eventoId}`} className="checkout-back-link">
            ← Voltar
          </Link>
          <h1 className="checkout-logo">GOLDEN INGRESSOS</h1>
          <button 
            className="checkout-theme-toggle"
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className="checkout-main">
        
        {/* Coluna Esquerda */}
        <div className="checkout-left">
          {/* Dados do Comprador */}
          <div className="checkout-card">
            <h2 className="checkout-section-title">
              👤 Dados do Comprador
            </h2>
            
            <div className="checkout-form-group">
              <div className="checkout-input-wrapper">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  className="checkout-input"
                  value={dadosComprador.nome}
                  onChange={(e) => setDadosComprador({...dadosComprador, nome: e.target.value})}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="checkout-input-wrapper">
                <label>E-mail *</label>
                <input
                  type="email"
                  className="checkout-input"
                  value={dadosComprador.email}
                  onChange={(e) => setDadosComprador({...dadosComprador, email: e.target.value})}
                  placeholder="seu@email.com"
                  disabled={!!user}
                />
              </div>

              <div className="checkout-form-row">
                <div className="checkout-input-wrapper">
                  <label>CPF *</label>
                  <input
                    type="text"
                    className="checkout-input"
                    value={dadosComprador.cpf}
                    onChange={(e) => setDadosComprador({...dadosComprador, cpf: e.target.value})}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="checkout-input-wrapper">
                  <label>Telefone</label>
                  <input
                    type="tel"
                    className="checkout-input"
                    value={dadosComprador.telefone}
                    onChange={(e) => setDadosComprador({...dadosComprador, telefone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {user && (
                <div className="checkout-alert">
                  ✅ Dados preenchidos automaticamente da sua conta
                </div>
              )}
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="checkout-card">
            <h2 className="checkout-section-title">
              💳 Forma de Pagamento
            </h2>

            <div className="payment-options">
              <label className={`payment-option-label ${formaPagamento === 'pix' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="pagamento"
                  value="pix"
                  checked={formaPagamento === 'pix'}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="payment-radio"
                />
                <span className="payment-title">📱 PIX</span>
                <div className="payment-desc">
                  Pagamento instantâneo
                </div>
              </label>

              <label className={`payment-option-label ${formaPagamento === 'cartao_credito' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="pagamento"
                  value="cartao_credito"
                  checked={formaPagamento === 'cartao_credito'}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="payment-radio"
                />
                <span className="payment-title">💳 Cartão de Crédito</span>
                <div className="payment-desc">
                  Parcele em até 12x
                </div>
              </label>

              <label className={`payment-option-label ${formaPagamento === 'cartao_debito' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="pagamento"
                  value="cartao_debito"
                  checked={formaPagamento === 'cartao_debito'}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="payment-radio"
                />
                <span className="payment-title">💳 Cartão de Débito</span>
                <div className="payment-desc">
                  Débito em conta
                </div>
              </label>

              <label className={`payment-option-label ${formaPagamento === 'boleto' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="pagamento"
                  value="boleto"
                  checked={formaPagamento === 'boleto'}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="payment-radio"
                />
                <span className="payment-title">📄 Boleto</span>
                <div className="payment-desc">
                  Pagamento em até 3 dias
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Resumo */}
        <div className="checkout-summary">
          <div className="checkout-card">
            <h2 className="checkout-section-title">
              🛒 Resumo do Pedido
            </h2>

            {/* Evento */}
            <div className="summary-event-info">
              <h3 className="summary-event-title">{evento.nome}</h3>
              <p className="summary-event-detail">
                📅 {sessao?.data && new Date(sessao.data).toLocaleDateString('pt-BR')}
              </p>
              <p className="summary-event-detail">
                🕐 {sessao?.hora}
              </p>
              <p className="summary-event-detail">
                📍 {evento.local}
              </p>
            </div>

            {/* Itens */}
            <div className="summary-section">
              <h3 className="summary-section-title">Ingressos:</h3>
              {itensCarrinho.map((item, index) => (
                <div key={index} className="summary-item">
                  <div className="summary-item-info">
                    <div className="summary-item-name">
                      {item.tipo}
                      {lugarMarcado && item.assento && (
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          ({item.assento})
                        </span>
                      )}
                    </div>
                    {!lugarMarcado && (
                      <div className="summary-item-qty">
                        Qtd: {item.quantidade}
                      </div>
                    )}
                  </div>
                  <div className="summary-item-price">
                    R$ {(item.valor * (lugarMarcado ? 1 : item.quantidade)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Produtos */}
            {produtos.length > 0 && (
              <div className="summary-section">
                <h3 className="summary-section-title">Produtos:</h3>
                {produtos.map((produto, index) => (
                  <div key={index} className="summary-item">
                    <div className="summary-item-info">
                      <div className="summary-item-name">
                        {produto.nome}
                      </div>
                      <div className="summary-item-qty">
                        Qtd: {produto.quantidade}
                      </div>
                    </div>
                    <div className="summary-item-price">
                      R$ {(parseFloat(produto.preco) * produto.quantidade).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totais */}
            <div className="summary-totals">
              <div className="summary-total-line">
                <span className="summary-total-label">Subtotal:</span>
                <span className="summary-total-value">R$ {calcularSubtotal().toFixed(2)}</span>
              </div>

              {cupom && (
                <div className="summary-total-line summary-discount">
                  <span className="summary-total-label">Desconto ({cupom.codigo}):</span>
                  <span className="summary-total-value">- R$ {calcularDesconto().toFixed(2)}</span>
                </div>
              )}

              <div className="summary-total-line">
                <span className="summary-total-label">Taxa de serviço:</span>
                <span className="summary-total-value">R$ {calcularTaxas().toFixed(2)}</span>
              </div>

              <div className="summary-final-total">
                <span className="summary-final-label">Total:</span>
                <span className="summary-final-value">
                  R$ {calcularTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botão Finalizar */}
            <button
              onClick={handleFinalizarPedido}
              disabled={processando}
              className="checkout-submit-btn"
              onMouseOver={(e) => !processando && (e.target.style.transform = 'scale(1.02)')}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              {processando ? '⏳ Processando...' : '🎫 Finalizar Pedido'}
            </button>

            <div className="checkout-security">
              <div className="checkout-security-badges">
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
      <div className="loading-container">
        <h2>🔄 Carregando...</h2>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
