import { NextResponse } from 'next/server';
import { rateLimit, redis } from '@/lib/redis';
import { z } from 'zod';

const requestSchema = z.object({
  phone: z.string().min(10).max(15).regex(/^\+?[1-9]\d{1,14}$/),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = requestSchema.parse(body);

    // Limit to 3 requests per 15 mins (900 seconds)
    const limitResult = await rateLimit(`otp_limit:${phone}`, 3, 900);
    if (!limitResult.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store in Redis for 3 minutes (180 seconds)
    await redis.setex(`phone_otp:${phone}`, 180, otp);

    // LOG ONLY (Simulate SMS)
    console.log(`[SMS AUTH] OTP for ${phone}: ${otp}`);

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
