import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { verifyLaunchParams } from '@/lib/vk-verify';

const VK_APP_SECRET = process.env.VK_APP_SECRET || '';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

export async function POST(req: Request) {
  try {
    const { queryString } = await req.json();
    
    if (!queryString) {
      return NextResponse.json({ error: 'Отсутствуют параметры запуска' }, { status: 400 });
    }

    const searchParams = new URLSearchParams(queryString);
    
    // Проверка подписи (только если задан секрет)
    if (VK_APP_SECRET) {
      const isValid = verifyLaunchParams(searchParams, VK_APP_SECRET);
      if (!isValid) {
        return NextResponse.json({ error: 'Неверная подпись VK' }, { status: 403 });
      }
    } else if (process.env.NODE_ENV === 'production') {
       console.error('CRITICAL: VK_APP_SECRET is not set in production!');
       return NextResponse.json({ error: 'Ошибка конфигурации сервера' }, { status: 500 });
    }

    const vkId = searchParams.get('vk_user_id');
    const firstName = searchParams.get('vk_first_name') || '';
    const lastName = searchParams.get('vk_last_name') || '';
    const photoUrl = searchParams.get('vk_photo_max_orig') || '';

    if (!vkId) {
      return NextResponse.json({ error: 'vk_user_id не найден' }, { status: 400 });
    }

    // Находим или создаем пользователя в Supabase (таблица profiles)
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .upsert({
        id: vkId, // Using vk_id as the primary key or unique identifier in profiles
        name: `${firstName} ${lastName}`.trim(),
        avatar_id: photoUrl,
        role: 'passenger',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single();

    if (userError || !user) {
      console.error('[VK Auth] Supabase Error:', userError);
      return NextResponse.json({ error: 'Ошибка сохранения профиля' }, { status: 500 });
    }

    // Генерируем токен сессии
    const token = jwt.sign(
      { 
        id: user.id, 
        vkId: user.id, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    // Сохраняем в куки
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: true, // VK Mini Apps всегда работают через HTTPS
      sameSite: 'none', // Требуется для работы внутри iframe (VK)
      maxAge: 60 * 60 * 24 * 30, // 30 дней
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        vkId: user.id,
        role: user.role,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ')[1] || '',
        avatarUrl: user.avatar_id
      } 
    });
  } catch (error) {
    console.error('[VK Auth API Error]:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
