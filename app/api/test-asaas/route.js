// app/api/test-asaas/route.js
// CRIAR ESTE ARQUIVO PARA TESTAR A API DO ASAAS

import { NextResponse } from 'next/server';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_BASE_URL = process.env.ASAAS_ENV === 'production' 
  ? 'https://api.asaas.com/v3' 
  : 'https://sandbox.asaas.com/api/v3';

export async function GET() {
  try {
    console.log('🧪 Testando API do Asaas...');
    console.log('🔑 API Key:', ASAAS_API_KEY ? ASAAS_API_KEY.substring(0, 20) + '...' : 'NÃO CONFIGURADA');
    console.log('🌐 URL:', ASAAS_BASE_URL);

    if (!ASAAS_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'ASAAS_API_KEY não configurada no .env.local'
      }, { status: 500 });
    }

    // Teste 1: Verificar conta
    const accountResponse = await fetch(`${ASAAS_BASE_URL}/myAccount`, {
      headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const accountData = await accountResponse.json();

    console.log('📊 Status da conta:', accountResponse.status);
    console.log('📦 Dados da conta:', accountData);

    if (!accountResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Erro ao acessar conta Asaas',
        status: accountResponse.status,
        details: accountData
      }, { status: 400 });
    }

    // Teste 2: Criar cliente de teste
    const testCustomerResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Cliente Teste',
        email: 'teste@goldeningressos.com.br',
        cpfCnpj: '12345678909'
      })
    });

    const testCustomerData = await testCustomerResponse.json();

    console.log('👤 Status do cliente:', testCustomerResponse.status);
    console.log('📦 Dados do cliente:', testCustomerData);

    return NextResponse.json({
      success: true,
      message: 'API Asaas funcionando!',
      tests: {
        account: {
          status: accountResponse.status,
          ok: accountResponse.ok,
          data: accountData
        },
        customer: {
          status: testCustomerResponse.status,
          ok: testCustomerResponse.ok,
          data: testCustomerData
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
