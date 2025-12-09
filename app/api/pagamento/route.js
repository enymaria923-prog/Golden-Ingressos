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
    
    const {
      eventoId,
      sessaoId,
      itensCarrinho,
      produtos,
      formaPagamento,
      dadosComprador,
      cupomId,
      total,
      dadosCartao // Para cartão de crédito/débito
    } = body;

    // 1. Criar ou buscar cliente no Asaas
    const asaasCustomer = await criarOuBuscarCliente(dadosComprador);
    
    if (!asaasCustomer) {
      return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 400 });
    }

    // 2. Criar cobrança no Asaas
    const cobranca = await criarCobranca({
      customer: asaasCustomer.id,
      billingType: mapearTipoPagamento(formaPagamento),
      value: total,
      dueDate: calcularDataVencimento(formaPagamento),
      description: `Ingressos - Evento ID: ${eventoId}`,
      externalReference: `evento_${eventoId}_${Date.now()}`,
      dadosCartao: formaPagamento.includes('cartao') ? dadosCartao : null
    });

    if (!cobranca || cobranca.errors) {
      return NextResponse.json({ 
        error: 'Erro ao criar cobrança', 
        details: cobranca.errors 
      }, { status: 400 });
    }

    // 3. Salvar pedido no banco de dados
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        evento_id: eventoId,
        sessao_id: sessaoId,
        user_id: dadosComprador.userId || null,
        comprador_nome: dadosComprador.nome,
        comprador_email: dadosComprador.email,
        comprador_cpf: dadosComprador.cpf,
        comprador_telefone: dadosComprador.telefone,
        forma_pagamento: formaPagamento,
        valor_total: total,
        status: 'PENDENTE',
        asaas_payment_id: cobranca.id,
        asaas_customer_id: asaasCustomer.id,
        cupom_id: cupomId,
        itens: itensCarrinho,
        produtos: produtos
      })
      .select()
      .single();

    if (pedidoError) {
      console.error('Erro ao salvar pedido:', pedidoError);
      return NextResponse.json({ error: 'Erro ao salvar pedido' }, { status: 500 });
    }

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
    // Primeiro tenta buscar cliente existente pelo CPF/CNPJ
    const response = await fetch(
      `${ASAAS_BASE_URL}/customers?cpfCnpj=${dadosComprador.cpf}`,
      {
        headers: {
          'access_token': ASAAS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();
    
    // Se encontrou, retorna o cliente existente
    if (result.data && result.data.length > 0) {
      return result.data[0];
    }

    // Se não encontrou, cria novo cliente
    const createResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: dadosComprador.nome,
        email: dadosComprador.email,
        cpfCnpj: dadosComprador.cpf.replace(/\D/g, ''),
        mobilePhone: dadosComprador.telefone ? dadosComprador.telefone.replace(/\D/g, '') : undefined
      })
    });

    return await createResponse.json();
  } catch (error) {
    console.error('Erro ao criar/buscar cliente:', error);
    return null;
  }
}

async function criarCobranca({ customer, billingType, value, dueDate, description, externalReference, dadosCartao }) {
  try {
    const payload = {
      customer,
      billingType,
      value,
      dueDate,
      description,
      externalReference
    };

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
    
    // Se for PIX, buscar QR Code
    if (billingType === 'PIX' && result.id) {
      const pixResponse = await fetch(`${ASAAS_BASE_URL}/payments/${result.id}/pixQrCode`, {
        headers: {
          'access_token': ASAAS_API_KEY
        }
      });
      const pixData = await pixResponse.json();
      return { ...result, ...pixData };
    }

    return result;
  } catch (error) {
    console.error('Erro ao criar cobrança:', error);
    return null;
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
