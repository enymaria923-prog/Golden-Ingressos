// Adicione esta função no seu arquivo de checkout
// Substitua apenas a função handleFinalizarPedido existente

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
    const payload = {
      eventoId,
      sessaoId,
      itensCarrinho,
      produtos,
      formaPagamento,
      dadosComprador: {
        ...dadosComprador,
        userId: user?.id
      },
      cupomId,
      total: calcularTotal()
    };

    console.log('📤 Enviando pedido...', payload);

    const response = await fetch('/api/pagamento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    console.log('📥 Resposta:', result);

    if (!response.ok) {
      throw new Error(result.error || result.details || 'Erro ao processar pagamento');
    }

    if (!result.success) {
      throw new Error('Erro ao criar pedido');
    }

    // Redirecionar para página de pagamento específica
    if (formaPagamento === 'pix') {
      router.push(`/pagamento/pix?pedido_id=${result.pedidoId}`);
    } else if (formaPagamento === 'boleto') {
      router.push(`/pagamento/boleto?pedido_id=${result.pedidoId}`);
    } else if (formaPagamento === 'cartao_credito' || formaPagamento === 'cartao_debito') {
      router.push(`/pagamento/cartao?pedido_id=${result.pedidoId}&tipo=${formaPagamento}`);
    }

  } catch (error) {
    console.error('❌ Erro ao finalizar pedido:', error);
    alert(`Erro: ${error.message}\n\nVerifique o console (F12) para mais detalhes.`);
  } finally {
    setProcessando(false);
  }
};
