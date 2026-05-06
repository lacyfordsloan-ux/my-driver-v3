'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Page() {
  const router = useRouter();
  const routerRef = useRef(router);
  const barRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const domaRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          reg.update().catch(() => {});
          console.log('[SW] Cleanup worker registered');
        })
        .catch((err) => console.warn('[SW] Registration failed (safe to ignore):', err));
    }
  }, []);

  useEffect(() => {
    let progress = 0;
    let authFinished = false;
    let authSuccess = false;

    const initAuth = async () => {
      try {
        const queryString = typeof window !== 'undefined' ? window.location.search : '';
        const res = await fetch('/api/auth/vk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queryString }),
        });

        if (res.ok) {
          authSuccess = true;
          const data = await res.json();
          if (data.user) {
            localStorage.setItem('user-data', JSON.stringify(data.user));
          }
        } else {
          const data = await res.json();
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Auth Skip] Разработка: вход без параметров VK разрешен');
            authSuccess = true;
          } else {
            console.error('[Auth Error]:', data.error);
            // We allow proceeding to city selection even if auth fails in some cases,
            // but let's mark it so we can show an error if needed.
            authSuccess = false;
          }
        }
      } catch (err) {
        console.error('[Auth Fetch Error]:', err);
        authSuccess = process.env.NODE_ENV === 'development';
      } finally {
        authFinished = true;
      }
    };

    initAuth();

    const step = () => {
      if (progress < 90) {
        progress += 1.5;
      } else if (authFinished) {
        progress += 5;
      }

      const pct = Math.min(Math.round(progress), 100);
      
      if (barRef.current) barRef.current.style.width = `${pct}%`;
      if (textRef.current) textRef.current.textContent = `${pct}%`;

      if (domaRef.current) {
        const deg = (pct / 100) * 360;
        domaRef.current.style.transform = `rotate(${-deg}deg)`;
      }

      if (pct < 100) {
        setTimeout(step, 30);
      } else {
        setTimeout(async () => {
          // Resolve even if auth failed, but redirect to city selection as safety
          localStorage.setItem('user-registered', 'true');
          
          let userId = null;
          try {
            const userData = localStorage.getItem('user-data');
            if (userData) userId = JSON.parse(userData).id;
          } catch {}

          // 1. Check Supabase for active ride first (Production source of truth)
          if (userId) {
            const { data: activeRide, error } = await supabase
              .from('ride_requests')
              .select('*')
              .or(`user_id.eq.${userId},driver_id.eq.${userId}`)
              .in('status', ['accepted', 'in_progress'])
              .maybeSingle();

            if (activeRide && !error) {
              localStorage.setItem('active-ride-data', JSON.stringify(activeRide));
              router.push('/active-ride');
              return;
            }
          }

          // 2. Fallback to localStorage for legacy/offline support
          const activeRideData = localStorage.getItem('active-ride-data');
          if (activeRideData) {
            router.push('/active-ride');
            return;
          }

          // 3. Otherwise go to home based on city and role
          const city = localStorage.getItem('user-city');
          if (!city) {
            router.push('/city-selection');
          } else {
            const savedRole = localStorage.getItem('app-role') || 'passenger';
            router.push(`/${savedRole}/home`);
          }
        }, 400);
      }
    };

    step();
  }, [router]);

  return (
    <main style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      background: '#0A0A0A',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.2s ease', // Плавное, но быстрое появление всего экрана
    }}>

      {/* ── Animated image stack ───────────────────────── */}
      <div className="splash-stack">
        <style jsx>{`
          .splash-stack {
            position: relative;
            width: 100vw;
            height: 100vw;
            max-width: 500px;
            max-height: 500px;
            display: flex;
            align-items: center;
            justifyContent: center;
            /* Убираем индивидуальные анимации появления, всё появляется вместе с основным контейнером */
          }

          .layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justifyContent: center;
          }

          .img-full {
            width: 100%;
            height: 100%;
            object-fit: contain;
            user-select: none;
            pointer-events: none;
            display: block;
          }

          @media (min-width: 1024px) {
            .splash-stack {
              width: 60vh;
              height: 60vh;
              max-width: none;
              max-height: none;
            }
          }
        `}</style>

        {/* 1. ДОМА (Вращение) - Нижний слой */}
        <div ref={domaRef} className="layer" style={{ zIndex: 1 }}>
          <img src="/Дома.png" alt="" className="img-full"/>
        </div>

        {/* 2. МАШИНА (Подвеска) - Средний слой */}
        <div className="layer" style={{
          zIndex: 2,
          animation: 'suspension-new 1.8s ease-in-out infinite',
        }}>
          <img src="/Машина.png" alt="" className="img-full"/>
        </div>

        {/* 3. ЛОГОТИП - Верхний слой (БЕЗ анимации масштабирования) */}
        <div className="layer" style={{ zIndex: 3 }}>
          <img src="/Логотип.png" alt="" className="img-full"/>
        </div>

        <style jsx global>{`
          @keyframes suspension-new {
            0%   { transform: rotate(-1.5deg) translateY(0px);   }
            12%  { transform: rotate(-2.5deg) translateY(-4px);  }
            25%  { transform: rotate(0deg)    translateY(-8px);  }
            38%  { transform: rotate(2.5deg)  translateY(-4px);  }
            50%  { transform: rotate(1.5deg)  translateY(0px);   }
            62%  { transform: rotate(0.5deg)  translateY(-3px);  }
            75%  { transform: rotate(-0.8deg) translateY(-5px);  }
            88%  { transform: rotate(-1.2deg) translateY(-2px);  }
            100% { transform: rotate(-1.5deg) translateY(0px);   }
          }
        `}</style>
      </div>

      {/* ── Progress bar ──────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: '5.5rem',
        width: '100%',
        maxWidth: '280px',
        padding: '0 1rem',
        zIndex: 10000,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.575rem',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            fontWeight: 700,
          }}>
            Инициализация
          </span>
          <span ref={textRef} style={{ color: '#FFB4A8', fontWeight: 900, fontSize: '0.8rem' }}>0%</span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
          <div ref={barRef} style={{
            height: '100%',
            width: '0%',
            background: 'linear-gradient(to right, #FFB4A8, #FF5540)',
            borderRadius: '99px',
            transition: 'width 0.05s linear',
          }} />
        </div>
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          opacity: 0.2,
          fontSize: '9px',
          fontFamily: 'var(--font-manrope)',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.3em',
          color: '#FFFFFF'
        }}>
          Powered by Antigravity
        </div>
      </div>

    </main>
  );
}
