// app/api/webhook/asaas/route.js
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createClient();
    
    // Validar token de autenticação do webhook (adicione um token no .env.local)
    const authToken = request.headers.get('asaas-access-token');
    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
    
    if (expectedToken && authToken !== expectedToken) {
      console.error('❌ Token de webhook inválido');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📨 Webhook recebido:', JSON.stringify(body, null, 2));

    const { event, payment } = body;

    if (!payment || !payment.id) {
      console.error('❌ Webhook sem dados de pagamento');
      return NextResponse.json({ received: true });
    }

    // Buscar pedido pelo payment ID
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('*')
      .eq('asaas_payment_id', payment.id)
      .single();

    if (pedidoError || !pedido) {
      console.error('❌ Pedido não encontrado:', payment.id);
      return NextResponse.json({ received: true });
    }

    console.log('📦 Pedido encontrado:', pedido.id);

    // Processar eventos
    switch (event) {
      case 'PAYMENT_CREATED':
        console.log('✅ Pagamento criado');
        break;

      case 'PAYMENT_AWAITING_RISK_ANALYSIS':
        await atualizarPedido(supabase, pedido.id, 'ANALISE', 'Pagamento em análise de risco');
        break;

      case 'PAYMENT_APPROVED_BY_RISK_ANALYSIS':
        await atualizarPedido(supabase, pedido.id, 'APROVADO', 'Pagamento aprovado pela análise');
        break;

      case 'PAYMENT_REPROVED_BY_RISK_ANALYSIS':
        await atualizarPedido(supabase, pedido.id, 'REPROVADO', 'Pagamento reprovado pela análise de risco');
        // Liberar ingressos de volta ao estoque
        await liberarIngressos(supabase, pedido);
        break;

      case 'PAYMENT_CONFIRMED':
        await atualizarPedido(supabase, pedido.id, 'CONFIRMADO', 'Pagamento confirmado');
        break;

      case 'PAYMENT_RECEIVED':
        // PAGAMENTO RECEBIDO - GERAR INGRESSOS
        await atualizarPedido(supabase, pedido.id, 'PAGO', 'Pagamento recebido com sucesso');
        await gerarIngressos(supabase, pedido);
        // Enviar email de confirmação (implementar depois)
        break;

      case 'PAYMENT_OVERDUE':
        await atualizarPedido(supabase, pedido.id, 'VENCIDO', 'Pagamento vencido');
        await liberarIngressos(supabase, pedido);
        break;

      case 'PAYMENT_REFUNDED':
        await atualizarPedido(supabase, pedido.id, 'REEMBOLSADO', 'Pagamento reembolsado');
        await cancelarIngressos(supabase, pedido);
        break;

      case 'PAYMENT_DELETED':
        await atualizarPedido(supabase, pedido.id, 'CANCELADO', 'Pagamento cancelado');
        await liberarIngressos(supabase, pedido);
        break;

      default:
        console.log(`ℹ️ Evento não tratado: ${event}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    // Mesmo com erro, retornar 200 para não interromper a fila
    return NextResponse.json({ received: true, error: error.message });
  }
}

// ==================== FUNÇÕES AUXILIARES ====================

async function atualizarPedido(supabase, pedidoId, status, observacao) {
  const { error } = await supabase
    .from('pedidos')
    .update({
      status,
      observacoes: observacao,
      updated_at: new Date().toISOString()
    })
    .eq('id', pedidoId);

  if (error) {
    console.error('❌ Erro ao atualizar pedido:', error);
  } else {
    console.log(`✅ Pedido ${pedidoId} atualizado para ${status}`);
  }
}

async function gerarIngressos(supabase, pedido) {
  try {
    console.log('🎫 Gerando ingressos para pedido:', pedido.id);

    const itens = JSON.parse(pedido.itens || '[]');
    
    for (const item of itens) {
      const { error } = await supabase
        .from('ingressos_vendidos')
        .insert({
          pedido_id: pedido.id,
          evento_id: pedido.evento_id,
          sessao_id: pedido.sessao_id,
          ingresso_id: item.ingressoId,
          tipo: item.tipo,
          valor: item.valor,
          comprador_nome: pedido.comprador_nome,
          comprador_email: pedido.comprador_email,
          comprador_cpf: pedido.comprador_cpf,
          assento: item.assento || null,
          codigo_qr: gerarCodigoQR(),
          status: 'ATIVO',
          data_compra: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Erro ao criar ingresso vendido:', error);
      }
    }

    console.log('✅ Ingressos gerados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao gerar ingressos:', error);
  }
}

async function liberarIngressos(supabase, pedido) {
  try {
    console.log('♻️ Liberando ingressos do pedido:', pedido.id);

    const itens = JSON.parse(pedido.itens || '[]');
    
    for (const item of itens) {
      if (item.assento) {
        // Se tinha assento marcado, liberar o assento
        await supabase
          .from('assentos')
          .update({ 
            status: 'disponivel',
            pedido_id: null
          })
          .eq('assento', item.assento)
          .eq('sessao_id', pedido.sessao_id);
      } else {
        // Se era ingresso sem assento, devolver ao estoque
        const { data: ingresso } = await supabase
          .from('ingressos')
          .select('quantidade_disponivel')
          .eq('id', item.ingressoId)
          .single();

        if (ingresso) {
          await supabase
            .from('ingressos')
            .update({ 
              quantidade_disponivel: ingresso.quantidade_disponivel + (item.quantidade || 1)
            })
            .eq('id', item.ingressoId);
        }
      }
    }

    console.log('✅ Ingressos liberados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao liberar ingressos:', error);
  }
}

async function cancelarIngressos(supabase, pedido) {
  try {
    console.log('🚫 Cancelando ingressos do pedido:', pedido.id);

    await supabase
      .from('ingressos_vendidos')
      .update({ 
        status: 'CANCELADO',
        data_cancelamento: new Date().toISOString()
      })
      .eq('pedido_id', pedido.id);

    console.log('✅ Ingressos cancelados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao cancelar ingressos:', error);
  }
}

function gerarCodigoQR() {
  return `ING-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}
