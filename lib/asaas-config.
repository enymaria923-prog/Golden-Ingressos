// lib/asaas-config.js

// Função para obter configuração do Asaas
export function getAsaasConfig() {
  // Tenta ler das variáveis de ambiente primeiro
  let apiKey = process.env.ASAAS_API_KEY;
  let env = process.env.ASAAS_ENV || 'production';
  let walletId = process.env.ASAAS_WALLET_ID;
  
  // Se não encontrar nas variáveis de ambiente, usa fallback
  // ⚠️ REMOVA ESTAS LINHAS depois que as variáveis funcionarem
  if (!apiKey) {
    console.warn('⚠️ ASAAS_API_KEY não encontrada em process.env, usando fallback');
    apiKey = 'COLE_SUA_CHAVE_AQUI'; // ← Cole sua chave aqui
  }
  
  if (!walletId) {
    walletId = '3be2035e-fe8a-4afa-941e-6a31d95371ec';
  }
  
  const baseUrl = env === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3';
  
  // Log para debug
  console.log('🔧 Asaas Config:', {
    hasApiKey: !!apiKey,
    apiKeySource: process.env.ASAAS_API_KEY ? 'env' : 'fallback',
    environment: env,
    baseUrl
  });
  
  return {
    apiKey,
    env,
    walletId,
    baseUrl
  };
}

// Validar se a configuração está OK
export function validateAsaasConfig() {
  const config = getAsaasConfig();
  
  if (!config.apiKey || config.apiKey === 'COLE_SUA_CHAVE_AQUI') {
    throw new Error('ASAAS_API_KEY não configurada. Configure no .env ou em lib/asaas-config.js');
  }
  
  if (!config.apiKey.startsWith('$aact_')) {
    throw new Error('ASAAS_API_KEY inválida. Deve começar com $aact_');
  }
  
  return config;
}
