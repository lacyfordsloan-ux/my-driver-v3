import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

export const dynamic = 'force-dynamic';

const createRideSchema = z.object({
  fromName: z.string().min(1),
  toName: z.string().min(1),
  fromLat: z.number().optional(),
  fromLng: z.number().optional(),
  toLat: z.number().optional(),
  toLng: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const body = await req.json();
    const validatedData = createRideSchema.parse(body);

    const { data: rideRequest, error } = await supabase
      .from('ride_requests')
      .insert({
        from_address: validatedData.fromName,
        to_address: validatedData.toName,
        from_lat: validatedData.fromLat,
        from_lng: validatedData.fromLng,
        to_lat: validatedData.toLat,
        to_lng: validatedData.toLng,
        user_id: decoded.id,
        status: 'pending',
        expires_at: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 min TTL
      })
      .select()
      .single();

    if (error) {
      console.error('[Ride Request Create Error]:', error);
      return NextResponse.json({ error: 'Ошибка создания заявки' }, { status: 500 });
    }

    return NextResponse.json(rideRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data: requests, error } = await supabase
      .from('ride_requests')
      .select('*, profiles(*), ride_offers(count)')
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Ride Request Fetch Error]:', error);
      return NextResponse.json({ error: 'Ошибка получения заявок' }, { status: 500 });
    }

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
