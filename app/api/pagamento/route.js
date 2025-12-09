// app/api/pagamento/route.js
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_WALLET_ID = process.env.ASAAS_WALLET_ID || '3be2035e-fe8a-4afa-941e-6a31d95371ec';
const ASAAS_BASE_URL = process.env.ASAAS_ENV === 'production' 
  ? 'https://api.asaas.com/v3' 
  : 'https://sandbox.asaas.com/api/v3';

export async function POST(request) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    console.log('📦 Payload recebido:', body);

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

    // Validação da API Key
    if (!ASAAS_API_KEY) {
      console.error('❌ ASAAS_API_KEY não configurada');
      return NextResponse.json({ 
        error: 'Gateway de pagamento não configurado. Configure ASAAS_API_KEY no .env.local' 
      }, { status: 500 });
    }

    console.log('🔑 API Key configurada:', ASAAS_API_KEY.substring(0, 10) + '...');
    console.log('🌐 URL Base:', ASAAS_BASE_URL);

    // 1. Criar ou buscar cliente no Asaas
    console.log('👤 Criando/buscando cliente...');
    const asaasCustomer = await criarOuBuscarCliente(dadosComprador);
    
    if (!asaasCustomer || asaasCustomer.errors) {
      console.error('❌ Erro ao criar cliente:', asaasCustomer);
      return NextResponse.json({ 
        error: 'Erro ao criar cliente no Asaas',
        details: asaasCustomer?.errors || 'Cliente não foi criado'
      }, { status: 400 });
    }

    console.log('✅ Cliente criado/encontrado:', asaasCustomer.id);

    // 2. Criar cobrança no Asaas
    console.log('💳 Criando cobrança...');
    const cobranca = await criarCobranca({
      customer: asaasCustomer.id,
      billingType: mapearTipoPagamento(formaPagamento),
      value: parseFloat(total.toFixed(2)),
      dueDate: calcularDataVencimento(formaPagamento),
      description: `Ingressos - Evento ID: ${eventoId}`,
      externalReference: `evento_${eventoId}_${Date.now()}`,
      dadosCartao: formaPagamento.includes('cartao') ? dadosCartao : null
    });

    if (!cobranca || cobranca.errors) {
      console.error('❌ Erro ao criar cobrança:', cobranca);
      return NextResponse.json({ 
        error: 'Erro ao criar cobrança no Asaas', 
        details: cobranca?.errors || 'Cobrança não foi criada'
      }, { status: 400 });
    }

    console.log('✅ Cobrança criada:', cobranca.id);

    // 3. Salvar pedido no banco de dados
    console.log('💾 Salvando pedido no banco...');
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
      console.error('❌ Erro ao salvar pedido:', pedidoError);
      return NextResponse.json({ 
        error: 'Erro ao salvar pedido', 
        details: pedidoError.message 
      }, { status: 500 });
    }

    console.log('✅ Pedido salvo:', pedido.id);

    // 4. Retornar resposta com dados do pagamento
    const resposta = {
      pedidoId: pedido.id,
      paymentId: cobranca.id,
      status: cobranca.status,
      formaPagamento
    };

    // Adicionar informações específicas por método de pagamento
    if (formaPagamento === 'pix') {
      resposta.pixQrCode = cobranca.encodedImage;
      resposta.pixCopyPaste = cobranca.payload;
      resposta.pixExpirationDate = cobranca.expirationDate;
    } else if (formaPagamento === 'boleto') {
      resposta.boletoUrl = cobranca.bankSlipUrl;
      resposta.boletoBarcode = cobranca.identificationField;
      resposta.boletoDigitableLine = await obterLinhaDigitavel(cobranca.id);
    } else if (formaPagamento.includes('cartao')) {
      resposta.invoiceUrl = cobranca.invoiceUrl;
      resposta.transactionReceiptUrl = cobranca.transactionReceiptUrl;
      // Se pagamento foi aprovado na hora
      if (cobranca.status === 'CONFIRMED' || cobranca.status === 'RECEIVED') {
        resposta.aprovado = true;
      }
    }

    return NextResponse.json({ success: true, ...resposta });

  } catch (error) {
    console.error('Erro no processamento do pagamento:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    }, { status: 500 });
  }
}

// ==================== FUNÇÕES AUXILIARES ====================

async function criarOuBuscarCliente(dadosComprador) {
  try {
    const cpfLimpo = dadosComprador.cpf.replace(/\D/g, '');
    
    console.log('🔍 Buscando cliente pelo CPF:', cpfLimpo);
    
    // Primeiro tenta buscar cliente existente pelo CPF/CNPJ
    const response = await fetch(
      `${ASAAS_BASE_URL}/customers?cpfCnpj=${cpfLimpo}`,
      {
        headers: {
          'access_token': ASAAS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();
    
    console.log('📋 Resultado da busca:', result);
    
    // Se encontrou, retorna o cliente existente
    if (result.data && result.data.length > 0) {
      console.log('✅ Cliente já existe, usando ID:', result.data[0].id);
      return result.data[0];
    }

    console.log('➕ Cliente não existe, criando novo...');

    // Se não encontrou, cria novo cliente
    const createPayload = {
      name: dadosComprador.nome,
      email: dadosComprador.email,
      cpfCnpj: cpfLimpo,
      mobilePhone: dadosComprador.telefone ? dadosComprador.telefone.replace(/\D/g, '') : undefined
    };

    console.log('📤 Payload de criação:', createPayload);

    const createResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createPayload)
    });

    const createResult = await createResponse.json();
    
    console.log('📥 Resultado da criação:', createResult);

    if (createResult.errors) {
      console.error('❌ Erros ao criar cliente:', createResult.errors);
    }

    return createResult;
  } catch (error) {
    console.error('❌ Erro ao criar/buscar cliente:', error);
    return null;
  }
}

async function criarCobranca({ customer, billingType, value, dueDate, description, externalReference, dadosCartao }) {
  try {
    const payload = {
      customer,
      billingType,
      value: parseFloat(value),
      dueDate,
      description,
      externalReference
    };

    console.log('📤 Payload da cobrança:', payload);

    // Se for cartão de crédito, adiciona dados do cartão
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

    const response = await fetch(`${ASAAS_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    console.log('📥 Resultado da cobrança:', result);

    if (result.errors) {
      console.error('❌ Erros na cobrança:', result.errors);
      return result;
    }
    
    // Se for PIX, buscar QR Code
    if (billingType === 'PIX' && result.id) {
      console.log('📱 Buscando QR Code PIX...');
      const pixResponse = await fetch(`${ASAAS_BASE_URL}/payments/${result.id}/pixQrCode`, {
        headers: {
          'access_token': ASAAS_API_KEY
        }
      });
      const pixData = await pixResponse.json();
      console.log('✅ QR Code PIX obtido');
      return { ...result, ...pixData };
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao criar cobrança:', error);
    return { errors: [{ description: error.message }] };
  }
}

async function obterLinhaDigitavel(paymentId) {
  try {
    const response = await fetch(
      `${ASAAS_BASE_URL}/payments/${paymentId}/identificationField`,
      {
        headers: {
          'access_token': ASAAS_API_KEY
        }
      }
    );
    const data = await response.json();
    return data.identificationField;
  } catch (error) {
    console.error('Erro ao obter linha digitável:', error);
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
  
  // Boleto: 3 dias úteis
  if (formaPagamento === 'boleto') {
    hoje.setDate(hoje.getDate() + 3);
  } else {
    // PIX e cartão: hoje
    hoje.setDate(hoje.getDate());
  }
  
  return hoje.toISOString().split('T')[0]; // Formato: YYYY-MM-DD
}
