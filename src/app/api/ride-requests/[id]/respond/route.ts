import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

export const dynamic = 'force-dynamic';

const respondSchema = z.object({
  price: z.number().positive().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rideId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    let userId = 'demo-driver-id';
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        userId = decoded.id;
      } catch (e) {
        console.warn('Invalid token, using demo ID');
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { price } = respondSchema.parse(body);

    // 1. Verify ride exists
    const { data: ride, error: rideError } = await supabase
      .from('ride_requests')
      .select('id, status')
      .eq('id', rideId)
      .single();

    if (rideError || !ride) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    // 2. Create offer
    const { data: offer, error: offerError } = await supabase
      .from('ride_offers')
      .insert({
        request_id: rideId,
        driver_id: userId,
        price: price || 0,
        status: 'pending',
      })
      .select()
      .single();

    if (offerError) {
      console.error('[Offer Create Error]:', offerError);
      return NextResponse.json({ error: 'Ошибка создания предложения' }, { status: 500 });
    }

    return NextResponse.json({ success: true, offer });
  } catch (error: any) {
    console.error('Driver response error:', error);
    return NextResponse.json({ error: error.message || 'Error claiming the ride' }, { status: 400 });
  }
}
