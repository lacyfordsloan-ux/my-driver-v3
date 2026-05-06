import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const verifySchema = z.object({
  phone: z.string().min(10).max(15).regex(/^\+?[1-9]\d{1,14}$/),
  otp: z.string().length(4),
});

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, otp } = verifySchema.parse(body);

    const storedOtp = await redis.get(`phone_otp:${phone}`);

    if (!storedOtp || storedOtp !== otp) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // OTP Correct: Delete it from Redis
    await redis.del(`phone_otp:${phone}`);

    // Find or create user in Supabase profiles table
    let { data: user, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (findError) {
      console.error('[OTP Verify] Error finding user:', findError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('profiles')
        .insert({ phone, role: 'passenger', name: phone })
        .select()
        .single();

      if (createError || !newUser) {
        console.error('[OTP Verify] Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      user = newUser;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set persistence cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input format' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
