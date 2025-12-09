import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ASAAS_API_KEY_exists: !!process.env.ASAAS_API_KEY,
    ASAAS_API_KEY_preview: process.env.ASAAS_API_KEY ? process.env.ASAAS_API_KEY.substring(0, 30) + '...' : 'UNDEFINED',
    ASAAS_ENV: process.env.ASAAS_ENV,
    ASAAS_WALLET_ID: process.env.ASAAS_WALLET_ID,
    all_asaas_vars: Object.keys(process.env).filter(k => k.includes('ASAAS'))
  });
}
