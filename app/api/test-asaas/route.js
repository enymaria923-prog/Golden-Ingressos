// app/api/test-asaas/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ASAAS_API_KEY;
  const env = process.env.ASAAS_ENV;
  const baseUrl = env === 'production' 
    ? 'https://api.asaas.com/v3' 
    : 'https://sandbox.asaas.com/api/v3';

  console.log('🔍 Testando conexão com Asaas...');
  console.log('API Key existe?', !!apiKey);
  console.log('Ambiente:', env);
  console.log('Base URL:', baseUrl);

  if (!apiKey) {
    return NextResponse.json({
      error: 'ASAAS_API_KEY não encontrada',
      env_keys: Object.keys(process.env).filter(k => k.includes('ASAAS')),
      all_env_count: Object.keys(process.env).length
    }, { status: 500 });
  }

  try {
    // Tentar buscar dados da conta
    const response = await fetch(`${baseUrl}/myAccount`, {
      method: 'GET',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'GoldenIngressos/1.0'
      }
    });

    const status = response.status;
    const data = await response.json();

    console.log('📊 Status:', status);
    console.log('📥 Resposta:', data);

    return NextResponse.json({
      success: status === 200,
      status,
      apiKeyExists: true,
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 15),
      environment: env,
      baseUrl,
      response: data
    });

  } catch (error) {
    console.error('❌ Erro ao testar Asaas:', error);
    return NextResponse.json({
      error: 'Erro ao conectar com Asaas',
      message: error.message,
      apiKeyExists: true,
      apiKeyLength: apiKey.length,
      environment: env
    }, { status: 500 });
  }
}
