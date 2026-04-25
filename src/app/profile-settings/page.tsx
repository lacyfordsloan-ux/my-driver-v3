'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { NotificationModal } from '@/components/NotificationModal';

const TOTAL_AVATARS = 17;
const AVATARS = Array.from({ length: TOTAL_AVATARS }, (_, i) => i + 1);
const ITEM_WIDTH = 80; // Width of each avatar item in the roulette

export default function Page() {
  const router = useRouter();
  const [selectedAvatar, setSelectedAvatar] = useState<number>(0);
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  
  const rouletteRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  
  // Custom animate function for snapping
  const snapTo = (val: number) => {
    const nearestIndex = Math.round(Math.abs(val) / ITEM_WIDTH) + 1;
    const clampedIndex = Math.min(Math.max(nearestIndex, 1), TOTAL_AVATARS);
    const snappedX = -(clampedIndex - 1) * ITEM_WIDTH;
    
    import('framer-motion').then(({ animate }) => {
      animate(x, snappedX, {
        type: 'spring',
        stiffness: 300,
        damping: 30
      });
    });
  };
  
  const [rating, setRating] = useState(5.0);
  const [tripCount, setTripCount] = useState(12);
  const [reviewCount, setReviewCount] = useState(24);

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    const savedRole = (sessionStorage.getItem('tab-role') || localStorage.getItem('app-role')) as 'passenger' | 'driver' || 'passenger';
    setRole(savedRole);

    const savedName = localStorage.getItem('user-name') || '';
    const nameParts = savedName.split(' ');
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' ') || '');
    
    setPhone(localStorage.getItem('user-phone') || '');
    
    // Avatar Logic - ROLE SPECIFIC
    const roleKey = `user-avatar-${savedRole}`;
    const savedAvatar = localStorage.getItem(roleKey);
    let initialIndex = 0;

    if (savedAvatar) {
      const match = savedAvatar.match(/\((\d+)\)/);
      initialIndex = match ? parseInt(match[1]) : 1;
    } else {
      // Default roles based on user request: Driver=8, Passenger=10
      initialIndex = savedRole === 'driver' ? 8 : 10;
    }
    
    setSelectedAvatar(initialIndex);
    // Position roulette initially - center it on the active avatar
    const centerOffset = (initialIndex - 1) * -ITEM_WIDTH;
    x.set(centerOffset);

    setRating(Number(localStorage.getItem('user-rating')) || 5.0);
    setTripCount(Number(localStorage.getItem('user-trip-count')) || 12);
    setReviewCount(Number(localStorage.getItem('user-review-count')) || 24);
  }, [x]);

  // --- Roulette Sound Logic (Web Audio API) ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTickIndex = useRef<number>(-1);

  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSynthTick = () => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      // Classic mechanical tick sound signature
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime); // Normal volume
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio synth failed:', e);
    }
  };

  useEffect(() => {
    const handleValueChange = (latest: number) => {
      const index = Math.round(Math.abs(latest) / ITEM_WIDTH);
      if (index !== lastTickIndex.current) {
        lastTickIndex.current = index;
        playSynthTick();
      }
    };

    const unsubscribe = x.on('change', handleValueChange);
    return () => unsubscribe();
  }, [x]);

  const handleSave = () => {
    // Validation
    if (!firstName.trim()) {
      setNotification({
        isOpen: true,
        title: 'Заполните данные',
        message: 'Пожалуйста, укажите ваше имя. Это поле обязательно для регистрации.',
        type: 'error'
      });
      return;
    }

    if (!phone.trim()) {
      setNotification({
        isOpen: true,
        title: 'Укажите телефон',
        message: 'Номер телефона необходим для связи с вами.',
        type: 'error'
      });
      return;
    }

    localStorage.setItem('user-name', `${firstName} ${lastName}`.trim());
    localStorage.setItem('user-phone', phone);
    
    // Save role-specific avatar
    const avatarValue = `avatar (${selectedAvatar})`;
    localStorage.setItem(`user-avatar-${role}`, avatarValue);
    localStorage.setItem('user-avatar', avatarValue); // Keep legacy in sync
    
    console.log('Profile saved');
    
    setNotification({
      isOpen: true,
      title: 'Успешно!',
      message: 'Ваш профиль обновлен. Все изменения сохранены.',
      type: 'success'
    });
  };

  // Sync selectedAvatar in real-time based on x position
  useEffect(() => {
    const unsubscribe = x.on('change', (val) => {
      const nearestIndex = Math.round(Math.abs(val) / ITEM_WIDTH) + 1;
      const clamped = Math.min(Math.max(nearestIndex, 1), TOTAL_AVATARS);
      if (clamped !== selectedAvatar) {
        setSelectedAvatar(clamped);
      }
    });
    return () => unsubscribe();
  }, [x, selectedAvatar]);

  return (
    <main className="min-h-dvh w-full flex flex-col bg-surface overflow-x-hidden relative text-on-surface">
      {/* Header */}
      <header
        className="app-header app-header-fixed bg-background/90 backdrop-blur-xl border-b border-outline-variant/15 flex items-center justify-between px-4 z-50 shrink-0"
        style={{ height: 'calc(3.5rem + var(--sat))', paddingTop: 'var(--sat)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-nav-drawer'))}
            className="mobile-menu-btn w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-primary"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-baseline gap-3">
            <h1 className="font-['Manrope'] text-lg font-black tracking-widest uppercase text-primary">Профиль</h1>
          </div>
        </div>
      </header>

      <div 
        className="flex-grow flex flex-col justify-start px-5 page-content w-full z-10"
        style={{ paddingTop: 'calc(3.5rem + var(--sat))', paddingBottom: 'calc(1rem + var(--sab))' }}
      >
        <div className="space-y-4 max-w-md mx-auto w-full">
          {/* Avatar Roulette Section - MOVED TO TOP */}
          <section className="flex flex-col items-center py-4">
            <div className="relative w-full h-44 flex items-center justify-center overflow-visible mb-2">
              {/* 1. Background Circle (Behind everything) */}
              <div className="absolute z-0 size-40 rounded-full bg-surface-container-high shadow-inner border border-outline-variant/10" />
              
              {/* 2. Track Background (Horizontal Belt) */}
              <div className="absolute z-5 inset-0 h-24 my-auto bg-surface-container-lowest/40 border-y border-outline-variant/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]" />

              {/* 3. The Roulette Viewport */}
              <div className="w-full h-full flex items-center justify-center relative">
                  <motion.div
                    ref={rouletteRef}
                    drag="x"
                    dragConstraints={{ left: -(TOTAL_AVATARS - 1) * ITEM_WIDTH, right: 0 }}
                    dragElastic={0}
                    dragMomentum={true}
                    onPointerDown={initAudioCtx}
                    onTouchStart={initAudioCtx}
                    onDragEnd={(_, info) => {
                    const currentX = x.get();
                    const projectedX = currentX + info.velocity.x * 0.05;
                    const nearestIndex = Math.round(-projectedX / ITEM_WIDTH) + 1;
                    const clampedIndex = Math.min(Math.max(nearestIndex, 1), TOTAL_AVATARS);
                    const snappedX = -(clampedIndex - 1) * ITEM_WIDTH;
                    import('framer-motion').then(({ animate }) => {
                      animate(x, snappedX, { type: 'spring', stiffness: 400, damping: 40, restDelta: 0.1 });
                    });
                  }}
                  style={{ x, left: '50%', marginLeft: `-${ITEM_WIDTH / 2}px` }}
                  className="flex items-center absolute cursor-grab active:cursor-grabbing h-full z-20"
                >
                  {AVATARS.map((num) => (
                    <AvatarItem key={num} num={num} rouletteX={x} onSelect={() => snapTo(-(num - 1) * ITEM_WIDTH)} />
                  ))}
                </motion.div>
              </div>

              {/* 4. Selection Border & HUD */}
              <div className="absolute z-50 size-40 rounded-full border-2 border-primary/40 shadow-[0_0_40px_rgba(255,180,168,0.15)] pointer-events-none" />
              
              {/* Star Badge inside frame */}
              <div className="absolute z-50 translate-x-16 translate-y-16 flex items-center bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-primary/30 shadow-xl pointer-events-none">
                <span className="text-[11px] font-black text-primary italic">{rating.toFixed(1)} ★</span>
              </div>
            </div>

            {/* Stylized Two-way Arrow Indicator */}
            <div className="flex items-center gap-1 opacity-40">
              <span className="material-symbols-outlined text-sm animate-pulse">chevron_left</span>
              <span className="material-symbols-outlined text-lg">swap_horiz</span>
              <span className="material-symbols-outlined text-sm animate-pulse">chevron_right</span>
            </div>
          </section>

          {/* Statistics Bar - NEW */}
          <section className="bg-surface-container-low/40 border border-outline-variant/10 rounded-2xl p-3 flex justify-between divide-x divide-outline-variant/20 shadow-sm">
            <div className="flex-1 flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant/40 mb-1">Рейтинг</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-black text-primary">{rating.toFixed(1)}</span>
                <span className="material-symbols-outlined scale-75 text-primary fill-current">star</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center px-1">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant/40 mb-1">Отзывы</span>
              <span className="text-sm font-black text-on-surface">{reviewCount}</span>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant/40 mb-1">Поездки</span>
              <span className="text-sm font-black text-on-surface">{tripCount}</span>
            </div>
          </section>

          {/* Personal data - Improved readability */}
          <section className="bg-surface-container-low/60 border border-outline-variant/10 rounded-2xl p-4 shadow-sm w-full mx-auto">
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] uppercase tracking-widest text-on-surface-variant/50 font-bold ml-2">
                    Имя <span className="text-primary">*</span>
                  </span>
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl h-13 px-4 text-[15px] text-white placeholder:text-on-surface-variant/20 focus:ring-1 focus:ring-primary/30 transition-all outline-none font-bold" 
                    placeholder="Ваше имя" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] uppercase tracking-widest text-on-surface-variant/50 font-bold ml-2">Фамилия</span>
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant/5 rounded-xl h-13 px-4 text-[15px] text-white placeholder:text-on-surface-variant/20 focus:ring-1 focus:ring-primary/30 transition-all outline-none font-bold opacity-60" 
                    placeholder="Необязательно" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] uppercase tracking-widest text-on-surface-variant/50 font-bold ml-2">
                  Номер телефона <span className="text-primary">*</span>
                </span>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl h-13 px-4 text-[15px] text-white placeholder:text-on-surface-variant/20 focus:ring-1 focus:ring-primary/30 transition-all outline-none font-bold tracking-wider" 
                  placeholder="+7 (___) ___ __ __" 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Save button - Compact high */}
          <div className="pt-1">
            <button
              onClick={handleSave}
              className="w-full h-13 rounded-xl bg-gradient-to-br from-[#FFB4A8] to-[#FF5540] text-black font-['Manrope'] font-black text-[15px] tracking-[0.2em] uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>

      {/* Audio tags removed - using Web Audio API synthesis instead */}

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => {
          setNotification({ ...notification, isOpen: false });
          if (notification.type === 'success') {
             router.back();
          }
        }}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </main>
  );
}

function AvatarItem({ num, rouletteX, onSelect }: { num: number, rouletteX: any, onSelect: () => void }) {
  const itemOffset = (num - 1) * ITEM_WIDTH;
  const distance = useTransform(rouletteX, (val: number) => Math.abs(val + itemOffset));
  
  // Center is scale 2.5 (matches size-40 frame), sides are scale 0.6
  const scale = useTransform(distance, [0, ITEM_WIDTH, ITEM_WIDTH * 2], [2.5, 0.6, 0.4]);
  const opacity = useTransform(distance, [0, ITEM_WIDTH, ITEM_WIDTH * 2], [1, 0.4, 0.2]);
  
  // Dynamically set z-index: 20 for center, 0 for others
  const zIndex = useTransform(distance, [0, ITEM_WIDTH], [25, 0]);

  return (
    <motion.div
      onClick={onSelect}
      style={{
        width: ITEM_WIDTH,
        height: ITEM_WIDTH,
        scale,
        opacity,
        zIndex,
      }}
      className="flex items-center justify-center shrink-0"
    >
      <div className="size-16 overflow-hidden pointer-events-none rounded-full bg-surface-container-high">
        <img 
          src={`/avatars/avatar (${num}).svg`} 
          alt={`Avatar ${num}`}
          className="size-full object-contain"
        />
      </div>
    </motion.div>
  );
}
