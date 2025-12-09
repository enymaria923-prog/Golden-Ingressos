import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ASAAS_API_KEY_EXISTS: !!process.env.ASAAS_API_KEY,
    ASAAS_API_KEY_LENGTH: process.env.ASAAS_API_KEY?.length || 0,
    ASAAS_API_KEY_PREFIX: process.env.ASAAS_API_KEY?.substring(0, 20) || 'VAZIO',
    ASAAS_ENV: process.env.ASAAS_ENV || 'VAZIO',
    ASAAS_WALLET_ID: process.env.ASAAS_WALLET_ID || 'VAZIO',
    ALL_ENV_KEYS: Object.keys(process.env).filter(k => k.includes('ASAAS'))
  });
}
