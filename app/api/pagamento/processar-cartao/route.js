// app/api/pagamento/processar-cartao/route.js
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_BASE_URL = process.env.ASAAS_ENV === 'production' 
  ? 'https://api.asaas.com/v3' 
  : 'https://sandbox.asaas.com/api/v3';

export async function POST(request) {
  try {
    const supabase = createClient();
    const { pedidoId, formaPagamento, dadosCartao } = await request.json();
    
    console.log('💳 Processando pagamento com cartão...');
    console.log('Pedido ID:', pedidoId);
    console.log('Forma:', formaPagamento);

    // Validação
    if (!ASAAS_API_KEY) {
      return NextResponse.json({ 
        error: 'Gateway de pagamento não configurado' 
      }, { status: 500 });
    }

    // Buscar pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', pedidoId)
      .single();

    if (pedidoError || !pedido) {
      return NextResponse.json({ 
        error: 'Pedido não encontrado' 
      }, { status: 404 });
    }

    // Criar cobrança com cartão no Asaas
    const billingType = formaPagamento === 'cartao_credito' ? 'CREDIT_CARD' : 'DEBIT_CARD';
    
    const payload = {
      customer: pedido.asaas_customer_id,
      billingType,
      value: parseFloat(pedido.valor_total),
      dueDate: new Date().toISOString().split('T')[0],
      description: `Pagamento Pedido #${pedido.id.substring(0, 8)}`,
      externalReference: pedido.id,
      creditCard: {
        holderName: dadosCartao.holderName,
        number: dadosCartao.number,
        expiryMonth: dadosCartao.expiryMonth,
        expiryYear: dadosCartao.expiryYear,
        ccv: dadosCartao.ccv
      },
      creditCardHolderInfo: {
        name: dadosCartao.holderInfo.name,
        email: dadosCartao.holderInfo.email,
        cpfCnpj: dadosCartao.holderInfo.cpfCnpj.replace(/\D/g, ''),
        postalCode: dadosCartao.holderInfo.postalCode.replace(/\D/g, ''),
        addressNumber: dadosCartao.holderInfo.addressNumber,
        phone: dadosCartao.holderInfo.phone.replace(/\D/g, '')
      },
      remoteIp: dadosCartao.remoteIp || '127.0.0.1'
    };

    console.log('📤 Enviando para Asaas...');

    const response = await fetch(`${ASAAS_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    console.log('📥 Resposta Asaas:', result);

    if (result.errors) {
      console.error('❌ Erro Asaas:', result.errors);
      return NextResponse.json({ 
        error: 'Erro ao processar pagamento',
        details: result.errors 
      }, { status: 400 });
    }

    // Atualizar pedido com informações do pagamento
    const novoStatus = (result.status === 'CONFIRMED' || result.status === 'RECEIVED') 
      ? 'CONFIRMADO' 
      : 'PENDENTE';

    const { error: updateError } = await supabase
      .from('pedidos')
      .update({
        status: novoStatus,
        asaas_payment_id: result.id,
        invoice_url: result.invoiceUrl,
        transaction_receipt_url: result.transactionReceiptUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', pedidoId);

    if (updateError) {
      console.error('❌ Erro ao atualizar pedido:', updateError);
    }

    return NextResponse.json({
      success: true,
      aprovado: novoStatus === 'CONFIRMADO',
      status: result.status,
      paymentId: result.id,
      invoiceUrl: result.invoiceUrl,
      transactionReceiptUrl: result.transactionReceiptUrl
    });

  } catch (error) {
    console.error('❌ Erro ao processar cartão:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    }, { status: 500 });
  }
}
