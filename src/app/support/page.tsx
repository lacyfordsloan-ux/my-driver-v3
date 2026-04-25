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
            <h1 className="font-['Manrope'] text-lg font-black tracking-widest uppercase text-primary">Поддержка</h1>
          </div>
        </div>
      </header>

      <div 
        className="flex-grow flex flex-col justify-center px-6 page-content w-full z-10"
        style={{ paddingTop: 'calc(4rem + var(--sat))', paddingBottom: 'calc(2rem + var(--sab))' }}
      >
        <div className="w-full max-w-md mx-auto space-y-8">
          
          <section className="text-center space-y-2">
             <div className="size-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary mx-auto border border-primary/20 shadow-xl shadow-primary/10 mb-3">
                <span className="material-symbols-outlined text-3xl">support_agent</span>
             </div>
             <h2 className="font-['Manrope'] text-xl font-black text-white tracking-tight">
               Чем мы можем <span className="text-primary italic">помочь?</span>
             </h2>
             <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest opacity-40">
               Наша команда на связи 24/7
             </p>
          </section>

          <div className="space-y-4">
            {/* Primary Support Group */}
            <div className="bg-surface-container-low border border-outline-variant/5 rounded-3xl overflow-hidden">
              <button className="w-full flex items-center gap-4 p-4 hover:bg-surface-container-high transition-all active:scale-[0.98] group border-b border-outline-variant/5 text-left">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-xl">chat</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white uppercase tracking-tight">Написать в чат</p>
                  <p className="text-[9px] text-on-surface-variant font-bold opacity-40 uppercase tracking-widest">Ответим за 2 минуты</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-on-surface-variant/20">chevron_right</span>
              </button>

              <button className="w-full flex items-center gap-4 p-4 hover:bg-surface-container-high transition-all active:scale-[0.98] group text-left">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-xl">help</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white uppercase tracking-tight">База знаний</p>
                  <p className="text-[9px] text-on-surface-variant font-bold opacity-40 uppercase tracking-widest">Частые вопросы (FAQ)</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-on-surface-variant/20">chevron_right</span>
              </button>
            </div>

            {/* Independent Secondary Action */}
            <button className="w-full flex items-center gap-4 p-4 bg-surface-container-low border border-outline-variant/5 rounded-2xl hover:bg-surface-container-high transition-all active:scale-[0.98] group text-left">
              <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/60 border border-primary/5 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-xl">lightbulb</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white/90 uppercase tracking-tight">Идеи и предложения</p>
                <p className="text-[9px] text-on-surface-variant font-bold opacity-30 uppercase tracking-widest">Помогите нам стать лучше</p>
              </div>
              <span className="material-symbols-outlined ml-auto text-on-surface-variant/20">chevron_right</span>
            </button>
          </div>

          <p className="text-center text-[9px] text-on-surface-variant/30 font-bold uppercase tracking-[0.2em] pt-2">
            Версия приложения 1.0.17 (Premium)
          </p>
        </div>
      </div>
    </main>
  );
}
