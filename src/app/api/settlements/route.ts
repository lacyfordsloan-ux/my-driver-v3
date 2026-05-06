import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: settlements, error } = await supabase
      .from('settlements')
      .select('*')
      .order('is_active', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      console.error('Failed to fetch settlements:', error);
      return NextResponse.json({ error: 'Failed to fetch settlements' }, { status: 500 });
    }

    return NextResponse.json(settlements);
  } catch (error) {
    console.error('Failed to fetch settlements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
