// app/api/pagamento/route.js
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Ler variáveis AQUI dentro da função
    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    const ASAAS_WALLET_ID = process.env.ASAAS_WALLET_ID || '';
    const ASAAS_ENV = process.env.ASAAS_ENV || 'sandbox';
    const ASAAS_BASE_URL = ASAAS_ENV === 'production' 
      ? 'https://api.asaas.com/v3' 
      : 'https://sandbox.asaas.com/api/v3';

    const supabase = createClient();
    const body = await request.json();
    
    console.log('📦 Iniciando pagamento');
    console.log('🔑 API Key existe?', !!ASAAS_API_KEY);
    console.log('🌐 Ambiente:', ASAAS_ENV);

    const {
      eventoId,
      sessaoId,
      itensCarrinho,
      produtos,
      formaPagamento,
      dadosComprador,
      cupomId,
      total,
      dadosCartao
    } = body;

    if (!ASAAS_API_KEY) {
      console.error('❌ API Key não configurada');
      return NextResponse.json({ 
        error: 'Gateway de pagamento não configurado'
      }, { status: 500 });
    }

    console.log('✅ Config OK');

    // 1. Criar/buscar cliente
    const asaasCustomer = await criarOuBuscarCliente(dadosComprador, ASAAS_API_KEY, ASAAS_BASE_URL);
    
    if (!asaasCustomer || asaasCustomer.errors) {
      return NextResponse.json({ 
        error: 'Erro ao criar cliente',
        details: asaasCustomer?.errors
      }, { status: 400 });
    }

    console.log('✅ Cliente:', asaasCustomer.id);

    // 2. Criar cobrança
    const cobranca = await criarCobranca({
      customer: asaasCustomer.id,
      billingType: mapearTipoPagamento(formaPagamento),
      value: parseFloat(total.toFixed(2)),
      dueDate: calcularDataVencimento(formaPagamento),
      description: `Ingressos - Evento ${eventoId}`,
      externalReference: `evento_${eventoId}_${Date.now()}`,
      dadosCartao: formaPagamento.includes('cartao') ? dadosCartao : null
    }, ASAAS_API_KEY, ASAAS_BASE_URL);

    if (!cobranca || cobranca.errors) {
      return NextResponse.json({ 
        error: 'Erro ao criar cobrança',
        details: cobranca?.errors
      }, { status: 400 });
    }

    console.log('✅ Cobrança:', cobranca.id);

    // 3. Salvar pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        evento_id: String(eventoId),
        sessao_id: sessaoId ? String(sessaoId) : null,
        user_id: dadosComprador.userId ? String(dadosComprador.userId) : null,
        comprador_nome: dadosComprador.nome,
        comprador_email: dadosComprador.email,
        comprador_cpf: dadosComprador.cpf.replace(/\D/g, ''),
        comprador_telefone: dadosComprador.telefone ? dadosComprador.telefone.replace(/\D/g, '') : null,
        forma_pagamento: formaPagamento,
        valor_total: parseFloat(total.toFixed(2)),
        status: 'PENDENTE',
        asaas_payment_id: cobranca.id,
        asaas_customer_id: asaasCustomer.id,
        cupom_id: cupomId ? String(cupomId) : null,
        itens: JSON.stringify(itensCarrinho),
        produtos: produtos && produtos.length > 0 ? JSON.stringify(produtos) : null
      })
      .select()
      .single();

    if (pedidoError) {
      return NextResponse.json({ 
        error: 'Erro ao salvar pedido',
        details: pedidoError.message
      }, { status: 500 });
    }

    console.log('✅ Pedido:', pedido.id);

    // 4. Atualizar com dados do pagamento
    const updateData = {
      asaas_payment_id: cobranca.id,
      updated_at: new Date().toISOString()
    };

    if (formaPagamento === 'pix') {
      updateData.pix_qr_code = cobranca.encodedImage;
      updateData.pix_copy_paste = cobranca.payload;
      updateData.pix_expiration_date = cobranca.expirationDate;
    } else if (formaPagamento === 'boleto') {
      updateData.boleto_url = cobranca.bankSlipUrl;
      updateData.boleto_codigo_barras = cobranca.identificationField;
      updateData.boleto_linha_digitavel = await obterLinhaDigitavel(cobranca.id, ASAAS_API_KEY, ASAAS_BASE_URL);
      updateData.data_vencimento = cobranca.dueDate;
    } else if (formaPagamento.includes('cartao')) {
      updateData.invoice_url = cobranca.invoiceUrl;
      updateData.transaction_receipt_url = cobranca.transactionReceiptUrl;
      
      if (cobranca.status === 'CONFIRMED' || cobranca.status === 'RECEIVED') {
        updateData.status = 'CONFIRMADO';
      }
    }

    await supabase
      .from('pedidos')
      .update(updateData)
      .eq('id', pedido.id);

    return NextResponse.json({ 
      success: true, 
      pedidoId: pedido.id,
      formaPagamento
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    return NextResponse.json({ 
      error: 'Erro interno',
      message: error.message
    }, { status: 500 });
  }
}

async function criarOuBuscarCliente(dadosComprador, apiKey, baseUrl) {
  try {
    const cpfLimpo = dadosComprador.cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) {
      return { errors: [{ description: 'CPF inválido' }] };
    }
    
    const searchUrl = `${baseUrl}/customers?cpfCnpj=${cpfLimpo}`;
    const response = await fetch(searchUrl, {
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401 || response.status === 403) {
      return { errors: [{ description: 'API Key inválida' }] };
    }

    const result = await response.json();
    
    if (result.errors) return result;
    
    if (result.data && result.data.length > 0) {
      return result.data[0];
    }

    // Criar novo cliente
    let telefoneLimpo = null;
    if (dadosComprador.telefone) {
      telefoneLimpo = dadosComprador.telefone.replace(/\D/g, '');
      if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        telefoneLimpo = null;
      }
    }

    const createPayload = {
      name: dadosComprador.nome.trim(),
      email: dadosComprador.email.trim().toLowerCase(),
      cpfCnpj: cpfLimpo
    };

    if (telefoneLimpo) {
      createPayload.mobilePhone = telefoneLimpo;
    }

    const createResponse = await fetch(`${baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createPayload)
    });

    return await createResponse.json();
  } catch (error) {
    return { errors: [{ description: error.message }] };
  }
}

async function criarCobranca({ customer, billingType, value, dueDate, description, externalReference, dadosCartao }, apiKey, baseUrl) {
  try {
    const payload = {
      customer,
      billingType,
      value: parseFloat(value),
      dueDate,
      description,
      externalReference
    };

    if (billingType === 'CREDIT_CARD' && dadosCartao) {
      payload.creditCard = {
        holderName: dadosCartao.holderName,
        number: dadosCartao.number,
        expiryMonth: dadosCartao.expiryMonth,
        expiryYear: dadosCartao.expiryYear,
        ccv: dadosCartao.ccv
      };
      
      payload.creditCardHolderInfo = {
        name: dadosCartao.holderInfo.name,
        email: dadosCartao.holderInfo.email,
        cpfCnpj: dadosCartao.holderInfo.cpfCnpj.replace(/\D/g, ''),
        postalCode: dadosCartao.holderInfo.postalCode.replace(/\D/g, ''),
        addressNumber: dadosCartao.holderInfo.addressNumber,
        phone: dadosCartao.holderInfo.phone.replace(/\D/g, '')
      };
      
      payload.remoteIp = dadosCartao.remoteIp || '127.0.0.1';
    }

    const response = await fetch(`${baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.errors) return result;
    
    if (billingType === 'PIX' && result.id) {
      const pixResponse = await fetch(`${baseUrl}/payments/${result.id}/pixQrCode`, {
        headers: { 'access_token': apiKey }
      });
      const pixData = await pixResponse.json();
      return { ...result, ...pixData };
    }

    return result;
  } catch (error) {
    return { errors: [{ description: error.message }] };
  }
}

async function obterLinhaDigitavel(paymentId, apiKey, baseUrl) {
  try {
    const response = await fetch(
      `${baseUrl}/payments/${paymentId}/identificationField`,
      { headers: { 'access_token': apiKey } }
    );
    const data = await response.json();
    return data.identificationField;
  } catch (error) {
    return null;
  }
}

function mapearTipoPagamento(formaPagamento) {
  const mapeamento = {
    'pix': 'PIX',
    'boleto': 'BOLETO',
    'cartao_credito': 'CREDIT_CARD',
    'cartao_debito': 'DEBIT_CARD'
  };
  return mapeamento[formaPagamento] || 'PIX';
}

function calcularDataVencimento(formaPagamento) {
  const hoje = new Date();
  if (formaPagamento === 'boleto') {
    hoje.setDate(hoje.getDate() + 3);
  }
  return hoje.toISOString().split('T')[0];
}
