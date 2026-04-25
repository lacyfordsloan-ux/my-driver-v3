'use client';

import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  const handleRoleSelection = (role: 'passenger' | 'driver') => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tab-role', role);
      
      // Avatar Role Sync
      const savedRoleAvatar = localStorage.getItem(`user-avatar-${role}`);
      if (savedRoleAvatar) {
        localStorage.setItem('user-avatar', savedRoleAvatar);
      } else {
         // Default if never set
         const defaultAvatar = role === 'driver' ? 'avatar (8)' : 'avatar (10)';
         localStorage.setItem('user-avatar', defaultAvatar);
         localStorage.setItem(`user-avatar-${role}`, defaultAvatar);
      }
    }
    router.push(role === 'driver' ? '/driver/requests' : '/passenger/home');
  };

  return (
    <main className="min-h-dvh flex flex-col bg-surface overflow-x-hidden relative">
      {/* Header */}
      <header
        className="app-header app-header-fixed bg-background/90 backdrop-blur-xl border-b border-outline-variant/15 flex items-center justify-between px-4 z-50 shrink-0"
        style={{ height: 'calc(3.5rem + var(--sat))', paddingTop: 'var(--sat)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-3">
            <h1 className="font-['Manrope'] text-lg font-black tracking-widest uppercase text-primary">Мой Водитель</h1>
            <span className="text-[10px] text-primary/40 font-bold uppercase tracking-[0.3em]">Premium</span>
          </div>
        </div>
      </header>

      <div 
        className="flex-grow flex flex-col justify-center px-6 page-content lg:max-w-4xl lg:mx-auto w-full z-10 relative"
        style={{ paddingTop: 'calc(5rem + var(--sat))', paddingBottom: 'calc(2rem + var(--sab))' }}
      >
        {/* Title */}
        <div className="mb-10 lg:mb-16 text-center">
          <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-4">
            <span className="text-primary font-black text-[10px] uppercase tracking-[0.2em]">Выберите вашу роль</span>
          </div>
          <h1 className="font-['Manrope'] font-black text-4xl lg:text-6xl tracking-tight text-white mb-3 leading-tight uppercase">
            Кто вы <span className="text-primary italic">сегодня?</span>
          </h1>
          <p className="text-on-surface-variant text-sm lg:text-base font-medium opacity-60 max-w-md mx-auto">
            Сервис подстраивается под ваши потребности в реальном времени
          </p>
        </div>

        {/* Role Cards — vertical list on desktop, stacked on mobile */}
        <div className="flex flex-col gap-3 lg:gap-6 w-full">
          {/* Passenger */}
          <button
            onClick={() => handleRoleSelection('passenger')}
            className="group relative overflow-hidden bg-surface-container-low border border-outline-variant/5 rounded-3xl p-1 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-left w-full"
          >
            <div className="bg-surface-container-low rounded-[23px] p-4 lg:p-10 flex items-center gap-4 lg:gap-8 relative z-10 lg:min-h-[160px]">
              <div className="w-12 h-12 lg:w-20 lg:h-20 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500 flex-shrink-0 shadow-md">
                <span className="material-symbols-outlined text-2xl lg:text-4xl">person</span>
              </div>
              <div className="flex-grow min-w-0">
                <h2 className="font-['Manrope'] font-black text-lg lg:text-2xl text-white mb-0.5 lg:mb-2">Пассажир</h2>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                  <span className="text-on-surface-variant text-[9px] lg:text-[11px] font-black uppercase tracking-widest truncate">Активных водителей: 14</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary/40 text-xl flex-shrink-0 group-hover:translate-x-1 group-hover:text-primary transition-all">arrow_forward_ios</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
          </button>

          {/* Driver */}
          <button
            onClick={() => handleRoleSelection('driver')}
            className="group relative overflow-hidden bg-surface-container-low border border-outline-variant/5 rounded-3xl p-1 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-left w-full"
          >
            <div className="bg-surface-container-low rounded-[23px] p-4 lg:p-10 flex items-center gap-4 lg:gap-8 relative z-10 lg:min-h-[160px]">
              <div className="w-12 h-12 lg:w-20 lg:h-20 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500 flex-shrink-0 shadow-md">
                <span className="material-symbols-outlined text-2xl lg:text-4xl">directions_car</span>
              </div>
              <div className="flex-grow min-w-0">
                <h2 className="font-['Manrope'] font-bold text-lg lg:text-2xl text-white mb-0.5 lg:mb-2">Водитель</h2>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0"></span>
                  <span className="text-on-surface-variant text-[9px] lg:text-[11px] font-black uppercase tracking-widest truncate">Доступных заявок: 8</span>
                </div>
                <p className="hidden lg:block text-on-surface-variant/40 text-xs lg:text-sm leading-relaxed max-w-sm">
                  Получайте выгодные предложения и управляйте своим временем максимально эффективно
                </p>
              </div>
              <span className="material-symbols-outlined text-primary/40 text-xl lg:text-2xl flex-shrink-0 group-hover:translate-x-1 group-hover:text-primary transition-all">arrow_forward_ios</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
          </button>
        </div>

        {/* Footer badge */}
        <div className="mt-auto pt-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center mb-3">
            <div className="absolute w-8 h-8 bg-primary/20 rounded-full animate-ping"></div>
            <div className="relative w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_12px_rgba(255,180,168,0.6)]"></div>
          </div>
          <p className="text-[9px] text-on-surface-variant/30 uppercase tracking-[0.3em] font-black">Premium Mobility</p>
        </div>
      </div>

      {/* Decorative blobs */}
      <div className="fixed -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-0"></div>
      <div className="fixed -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-0"></div>
    </main>
  );
}
