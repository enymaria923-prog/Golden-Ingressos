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

    // DEBUG: Verificar todas as variáveis de ambiente
    console.log('🔍 DEBUG - Variáveis de Ambiente:');
    console.log('ASAAS_API_KEY existe?', !!ASAAS_API_KEY);
    console.log('ASAAS_API_KEY valor:', ASAAS_API_KEY ? ASAAS_API_KEY.substring(0, 30) + '...' : 'UNDEFINED');
    console.log('ASAAS_WALLET_ID:', ASAAS_WALLET_ID);
    console.log('ASAAS_ENV:', process.env.ASAAS_ENV);
    console.log('ASAAS_BASE_URL:', ASAAS_BASE_URL);
    console.log('process.env completo (keys):', Object.keys(process.env).filter(k => k.includes('ASAAS')));

    // Validação da API Key
    if (!ASAAS_API_KEY) {
      console.error('❌ ASAAS_API_KEY não configurada');
      console.error('❌ Variáveis disponíveis:', Object.keys(process.env));
      return NextResponse.json({ 
        error: 'Gateway de pagamento não configurado. Configure ASAAS_API_KEY no .env.local',
        debug: {
          hasApiKey: !!ASAAS_API_KEY,
          env: process.env.ASAAS_ENV,
          availableEnvVars: Object.keys(process.env).filter(k => k.includes('ASAAS'))
        }
      }, { status: 500 });
    }

    console.log('🔑 API Key configurada:', ASAAS_API_KEY.substring(0, 20) + '...');
    console.log('🔑 Tipo de Key:', ASAAS_API_KEY.includes('_prod_') ? 'PRODUÇÃO' : 'SANDBOX');
    console.log('🌐 URL Base:', ASAAS_BASE_URL);
    console.log('🌐 Ambiente:', process.env.ASAAS_ENV);

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

    // 4. Atualizar pedido com dados do pagamento
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
      updateData.boleto_linha_digitavel = await obterLinhaDigitavel(cobranca.id);
      updateData.data_vencimento = cobranca.dueDate;
    } else if (formaPagamento.includes('cartao')) {
      updateData.invoice_url = cobranca.invoiceUrl;
      updateData.transaction_receipt_url = cobranca.transactionReceiptUrl;
      
      // Se pagamento foi aprovado na hora
      if (cobranca.status === 'CONFIRMED' || cobranca.status === 'RECEIVED') {
        updateData.status = 'CONFIRMADO';
      }
    }

    await supabase
      .from('pedidos')
      .update(updateData)
      .eq('id', pedido.id);

    console.log('✅ Pedido atualizado com dados do pagamento');

    // 5. Retornar resposta
    return NextResponse.json({ 
      success: true, 
      pedidoId: pedido.id,
      formaPagamento
    });

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
    
    // Validar CPF
    if (cpfLimpo.length !== 11) {
      console.error('❌ CPF inválido:', cpfLimpo);
      return { errors: [{ description: 'CPF deve ter 11 dígitos' }] };
    }
    
    console.log('🔍 Buscando cliente pelo CPF:', cpfLimpo);
    console.log('🔑 Usando API Key:', ASAAS_API_KEY.substring(0, 20) + '...');
    console.log('🌐 URL:', ASAAS_BASE_URL);
    
    // Primeiro tenta buscar cliente existente pelo CPF/CNPJ
    const searchUrl = `${ASAAS_BASE_URL}/customers?cpfCnpj=${cpfLimpo}`;
    console.log('🔗 URL de busca:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    console.log('📋 Status da busca:', response.status);
    console.log('📋 Resultado da busca:', result);
    
    // Se teve erro na busca, retornar erro
    if (result.errors) {
      console.error('❌ Erro ao buscar cliente:', result.errors);
      return result;
    }
    
    // Se encontrou, retorna o cliente existente
    if (result.data && result.data.length > 0) {
      console.log('✅ Cliente já existe, usando ID:', result.data[0].id);
      return result.data[0];
    }

    console.log('➕ Cliente não existe, criando novo...');

    // Limpar telefone e validar
    let telefoneLimpo = null;
    if (dadosComprador.telefone) {
      telefoneLimpo = dadosComprador.telefone.replace(/\D/g, '');
      // Telefone deve ter 10 ou 11 dígitos
      if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        console.warn('

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
