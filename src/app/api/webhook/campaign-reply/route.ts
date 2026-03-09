import { NextRequest, NextResponse } from 'next/server';
import { markBrokerAsRecovered, notifyAdminOfRecovery } from '@/lib/broker-recovery';

export async function POST(req: NextRequest) {
  // Verify webhook secret (existing auth mechanism)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: 'Missing phone' }, { status: 400 });

  const result = await markBrokerAsRecovered(phone);

  if (result.recovered) {
    await notifyAdminOfRecovery(result.brokerName!, phone, result.campaignNames!);
  }

  return NextResponse.json({ found: result.recovered, recovered: result.recovered });
}
