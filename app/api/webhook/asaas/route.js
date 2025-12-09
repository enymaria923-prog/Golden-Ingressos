// app/api/webhook/asaas/route.js
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    console.log('🔔 Webhook recebido do Asaas:', body);

    const { event, payment } = body;

    if (!event || !payment) {
      console.error('❌ Webhook inválido - faltam dados');
      return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 });
    }

    console.log('📋 Evento:', event);
    console.log('💳 Payment ID:', payment.id);

    // Buscar pedido pelo asaas_payment_id
    const { data: pedido, error: buscaError } = await supabase
      .from('pedidos')
      .select('*')
      .eq('asaas_payment_id', payment.id)
      .single();

    if (buscaError || !pedido) {
      console.error('❌ Pedido não encontrado:', payment.id);
      return NextResponse.json({ 
        error: 'Pedido não encontrado',
        payment_id: payment.id 
      }, { status: 404 });
    }

    console.log('✅ Pedido encontrado:', pedido.id);

    // Mapear evento para status
    let novoStatus = pedido.status;
    let atualizarStatus = false;

    switch(event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        // Pagamento confirmado (PIX ou Boleto compensado)
        novoStatus = 'CONFIRMADO';
        atualizarStatus = true;
        console.log('✅ Pagamento CONFIRMADO');
        break;

      case 'PAYMENT_OVERDUE':
        // Pagamento vencido
        novoStatus = 'EXPIRADO';
        atualizarStatus = true;
        console.log('⏰ Pagamento EXPIRADO');
        break;

      case 'PAYMENT_DELETED':
      case 'PAYMENT_REFUNDED':
        // Pagamento cancelado ou reembolsado
        novoStatus = 'CANCELADO';
        atualizarStatus = true;
        console.log('🚫 Pagamento CANCELADO');
        break;

      default:
        console.log('ℹ️ Evento não requer atualização:', event);
    }

    // Atualizar status do pedido se necessário
    if (atualizarStatus && novoStatus !== pedido.status) {
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({
          status: novoStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', pedido.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar pedido:', updateError);
        return NextResponse.json({ 
          error: 'Erro ao atualizar pedido',
          details: updateError.message 
        }, { status: 500 });
      }

      console.log('✅ Pedido atualizado:', {
        pedido_id: pedido.id,
        status_anterior: pedido.status,
        status_novo: novoStatus
      });

      // TODO: Enviar e-mail de confirmação ao comprador
      // TODO: Gerar ingressos em PDF
      // TODO: Enviar ingressos por e-mail

    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processado com sucesso',
      pedido_id: pedido.id,
      novo_status: novoStatus
    });

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    }, { status: 500 });
  }
}

// Permitir apenas POST
export async function GET() {
  return NextResponse.json({ 
    error: 'Método não permitido. Use POST.' 
  }, { status: 405 });
}
