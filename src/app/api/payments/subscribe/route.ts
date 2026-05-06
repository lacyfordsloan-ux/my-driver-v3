import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';
const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const { amount } = await req.json(); // Fixed subscription amount (e.g. 500)

    // 1. Create a pending subscription in our DB
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: decoded.id,
        amount: parseFloat(amount),
        status: 'PENDING',
      })
      .select()
      .single();

    if (subError || !subscription) {
      console.error('[YOO] Subscription creation error:', subError);
      return NextResponse.json({ error: 'Ошибка создания подписки' }, { status: 500 });
    }

    // 2. Mock or Call YooKassa API to create a payment
    let paymentUrl = `https://yookassa.ru/payments/mock/${subscription.id}`;
    let yookassaId = `yo_${Math.random().toString(36).substring(7)}`;

    if (YOOKASSA_SHOP_ID && YOOKASSA_SECRET_KEY) {
      const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');
      const response = await axios.post('https://api.yookassa.ru/v3/payments', {
        amount: { value: amount.toFixed(2), currency: 'RUB' },
        capture: true,
        confirmation: { type: 'redirect', return_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/driver/subscription` },
        description: `Subscription for user ${decoded.id}`,
        metadata: { subscriptionId: subscription.id }
      }, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Idempotence-Key': subscription.id,
          'Content-Type': 'application/json'
        }
      });
      paymentUrl = response.data.confirmation.confirmation_url;
      yookassaId = response.data.id;
    }

    // 3. Update subscription with YooKassa ID
    await supabase
      .from('subscriptions')
      .update({ yookassa_payment_id: yookassaId })
      .eq('id', subscription.id);

    return NextResponse.json({ url: paymentUrl });
  } catch (error) {
    console.error('[YOO] Payment creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
