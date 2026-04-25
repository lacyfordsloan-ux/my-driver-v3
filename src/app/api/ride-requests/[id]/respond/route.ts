import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

export const dynamic = 'force-dynamic';

const respondSchema = z.object({
  price: z.number().positive().optional(), // Driver can suggest a price
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

    // Standard Prisma transaction instead of raw query for better cross-DB support
    const result = await prisma.$transaction(async (tx: any) => {
      const ride = await tx.rideRequest.findUnique({
        where: { id: rideId },
        select: { id: true, status: true }
      });

      if (!ride) {
        throw new Error('Ride not found');
      }

      // Allow multiple offers in PENDING state for demo
      // In a real app we might update status to ACCEPTED here, 
      // but for this flow, let's keep it PENDING until passenger accepts.
      
      const offer = await tx.offer.create({
        data: {
          rideRequestId: rideId,
          driverId: userId,
          price: price || 0,
          status: 'PENDING',
        },
      });

      return offer;
    });

    return NextResponse.json({ success: true, offer: result });
  } catch (error: any) {
    console.error('Driver response error:', error);
    return NextResponse.json({ error: error.message || 'Error claiming the ride' }, { status: 400 });
  }
}
