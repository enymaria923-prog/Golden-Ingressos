import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Pegando os dados do formulário
    const { 
      customer, // Objeto com dados do cliente (nome, cpf, etc)
      billingType, 
      value, 
      dueDate 
    } = body;

    // Define a URL base (Sandbox ou Produção)
    // Se você tiver uma variável de ambiente para definir ambiente, use-a. 
    // Caso contrário, altere manualmente aqui para 'https://api.asaas.com/v3' quando for pra valer.
    const ASAAS_URL = process.env.ASAAS_ENV === 'production' 
      ? 'https://api.asaas.com/v3' 
      : 'https://sandbox.asaas.com/api/v3';

    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

    if (!ASAAS_API_KEY) {
      throw new Error("Chave de API do Asaas não configurada (.env)");
    }

    // --- PASSO 1: CRIAR OU ATUALIZAR O CLIENTE ---
    console.log("Tentando criar cliente no Asaas:", customer);

    const newCustomerResponse = await fetch(`${ASAAS_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify({
        name: customer.name,
        cpfCnpj: customer.cpfCnpj,
        email: customer.email,
        mobilePhone: customer.mobilePhone,
        notificationDisabled: false
      })
    });

    const customerData = await newCustomerResponse.json();

    // AQUI ESTÁ A EXPLICAÇÃO DO ERRO DO CLIENTE
    if (!newCustomerResponse.ok) {
      console.error("ERRO AO SALVAR CLIENTE NO ASAAS:", JSON.stringify(customerData, null, 2));
      return NextResponse.json(
        { error: "Erro ao cadastrar cliente", details: customerData.errors }, 
        { status: 400 }
      );
    }

    const customerId = customerData.id;
    console.log("Cliente criado com sucesso. ID:", customerId);

    // --- PASSO 2: CRIAR A COBRANÇA ---
    const paymentResponse = await fetch(`${ASAAS_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: billingType,
        value: value,
        dueDate: dueDate,
        description: "Venda de Ingresso"
      })
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error("ERRO AO CRIAR COBRANÇA:", paymentData);
      return NextResponse.json(
        { error: "Erro ao gerar cobrança", details: paymentData.errors },
        { status: 400 }
      );
    }

    // Sucesso total
    return NextResponse.json({ 
      success: true, 
      paymentId: paymentData.id, 
      invoiceUrl: paymentData.invoiceUrl, 
      bankSlipUrl: paymentData.bankSlipUrl,
      pixQrCode: paymentData.pixQrCode // Se for PIX, isso pode vir vazio aqui e precisar de outra chamada, mas o link resolve
    });

  } catch (error) {
    console.error("Erro interno no servidor (API Route):", error);
    return NextResponse.json(
      { error: "Erro interno no servidor", details: error.message },
      { status: 500 }
    );
  }
}
