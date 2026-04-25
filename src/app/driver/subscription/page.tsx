'use client';

import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  const toggleMenu = () => window.dispatchEvent(new CustomEvent('toggle-nav-drawer'));

  return (
    <main className="min-h-dvh w-full flex flex-col bg-surface overflow-x-hidden relative">
      {/* Header */}
      <header
        className="app-header app-header-fixed bg-background/90 backdrop-blur-xl border-b border-outline-variant/15 flex items-center justify-between px-4 z-50 shrink-0"
        style={{ height: 'calc(3.5rem + var(--sat))', paddingTop: 'var(--sat)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMenu}
            className="mobile-menu-btn w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-primary"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-baseline gap-3">
            <h1 className="font-['Manrope'] text-lg font-black tracking-widest uppercase text-primary">Подписка</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div 
        className="flex-grow flex flex-col justify-center px-5 page-content w-full z-10 max-w-md mx-auto"
        style={{ paddingTop: 'calc(4rem + var(--sat))', paddingBottom: 'calc(2rem + var(--sab))' }}
      >
        <div className="space-y-6 w-full">

          {/* Premium Card Visualization */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-[#FF5540]/30 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative h-28 w-full rounded-2xl overflow-hidden shadow-xl border border-outline-variant/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/premium_card_1775918001759.png"
                alt="Premium Membership"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-4 text-white text-left">
                <p className="font-['Manrope'] font-bold text-base uppercase tracking-widest text-[#FFB4A8]">Premium Pass</p>
                <p className="text-[9px] opacity-60 uppercase tracking-tighter">Unlimited Order Access</p>
              </div>
            </div>
          </section>

          <section className="text-center w-full">
            <h2 className="font-['Manrope'] font-extrabold text-2xl text-white tracking-tighter leading-tight mb-2">
              Выберите Ваш <br/><span className="text-primary italic">премиум</span>
            </h2>
            <div className="h-0.5 w-8 bg-primary rounded-full mx-auto"></div>
          </section>

          {/* Tariff options */}
          <div className="space-y-2.5">
            <label className="block group cursor-pointer active:scale-[0.98] transition-all duration-150">
              <input defaultChecked className="hidden peer" name="tariff" type="radio"/>
              <div className="bg-surface-container-low border border-outline-variant/5 peer-checked:border-primary/50 p-4 rounded-2xl flex items-center justify-between transition-all duration-200 shadow-sm peer-checked:shadow-primary/5">
                <div className="flex flex-col text-left">
                  <span className="text-on-surface-variant font-bold text-[9px] uppercase tracking-widest mb-0.5 opacity-60 underline decoration-primary/30">Оптимальный</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-['Manrope'] font-bold text-lg text-white">24 Часа</span>
                    <span className="text-primary font-black text-xl">— 150 ₽</span>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-outline-variant/50 flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary transition-all">
                  <span className="material-symbols-outlined text-on-primary text-[10px] scale-0 peer-checked:scale-100 transition-transform">check</span>
                </div>
              </div>
            </label>

            <label className="block group cursor-pointer active:scale-[0.98] transition-all duration-150">
              <input className="hidden peer" name="tariff" type="radio"/>
              <div className="bg-surface-container-low border border-outline-variant/5 peer-checked:border-primary/50 p-4 rounded-2xl flex items-center justify-between transition-all duration-200 shadow-sm peer-checked:shadow-primary/5">
                <div className="flex flex-col text-left">
                  <span className="text-on-surface-variant font-bold text-[9px] uppercase tracking-widest mb-0.5 opacity-60">Выгодный</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-['Manrope'] font-bold text-lg text-white">30 Дней</span>
                    <span className="text-primary font-black text-xl">— 3000 ₽</span>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-outline-variant/50 flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary transition-all">
                  <span className="material-symbols-outlined text-on-primary text-[10px] scale-0 peer-checked:scale-100 transition-transform">check</span>
                </div>
              </div>
            </label>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-container-lowest/50 border border-outline-variant/10">
            <div className="p-1.5 bg-primary/10 rounded-full shrink-0">
              <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
            </div>
            <p className="text-on-surface-variant/80 text-[10px] text-left leading-relaxed">
              Бесплатное ночное окно <span className="text-white font-bold">(01:00 — 08:00 МСК)</span>.<br/> Активно для владельцев подписки.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => alert('Переход к оплате ЮKassa...')}
              className="w-full h-14 bg-gradient-to-r from-primary to-[#FF5540] rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all duration-150 group"
            >
              <span className="material-symbols-outlined text-black text-xl group-hover:rotate-12 transition-transform">account_balance</span>
              <span className="text-black font-['Manrope'] font-bold uppercase tracking-widest text-xs">Оплатить через СБП</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
