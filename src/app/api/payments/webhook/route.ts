import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body.event;
    const payment = body.object;

    if (event !== 'payment.succeeded') {
      return NextResponse.json({ success: true });
    }

    const yookassaId = payment.id;
    const amountPaid = parseFloat(payment.amount.value);
    
    // 1. Find the pending subscription
    const { data: subscription, error: findError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('yookassa_payment_id', yookassaId)
      .eq('status', 'PENDING')
      .maybeSingle();

    if (findError || !subscription) {
      console.warn(`[YOO WEBHOOK] Subscription was not found for ID: ${yookassaId}`);
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // 2. STICK TO 10 RUBLE MARGIN OF ERROR as requested
    const expected = subscription.amount;
    const difference = Math.abs(amountPaid - expected);

    if (difference > 10) {
      console.error(`[YOO WEBHOOK] Amount mismatch too large: Paid ${amountPaid}, Expected ${expected} (Diff: ${difference})`);
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    console.log(`[YOO WEBHOOK] Amount accepted within 10 ruble margin. Paid ${amountPaid}, Expected ${expected}`);

    // 3. Update subscription and potentially driver status
    await supabase
      .from('subscriptions')
      .update({ status: 'SUCCEEDED' })
      .eq('id', subscription.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[YOO WEBHOOK] Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
