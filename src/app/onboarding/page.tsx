'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Page() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(name.trim().length > 0 && phone.length === 10 && agreed);
  }, [name, phone, agreed]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const handleContinue = () => {
    if (isFormValid) {
      localStorage.setItem('user-name', name);
      localStorage.setItem('user-phone', phone);
      router.push('/sms-confirmation');
    }
  };

  return (
    <main className="min-h-dvh flex flex-col bg-surface overflow-y-auto overflow-x-hidden scroll-smooth">
      {/* Header */}
      <header
        className="app-header app-header-fixed bg-surface-container-low/80 backdrop-blur-md flex items-center w-full px-5 h-16 sticky top-0 z-50 border-b border-outline-variant/10 gap-3 flex-shrink-0"
        style={{ paddingTop: 'var(--sat)' }}
      >
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-nav-drawer'))}
          className="mobile-menu-btn w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-primary flex-shrink-0"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>
        <span className="font-['Manrope'] font-black text-lg text-primary tracking-widest uppercase">Мой Водитель</span>
      </header>

      <div className="flex-grow flex flex-col">
        {/* Hero Image */}
        <div className="relative w-full h-[180px] lg:h-[240px] overflow-hidden flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/onboarding_hero_1775917961224.png"
            alt="Premium Car"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent"></div>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="bg-primary/10 border border-primary/20 backdrop-blur-sm self-start px-2 py-0.5 rounded-full mb-2 inline-block">
              <span className="text-primary font-bold text-[9px] uppercase tracking-wider">Premium Mobility</span>
            </div>
            <h1 className="font-['Manrope'] text-2xl font-extrabold text-white tracking-tight leading-tight">
              Добро пожаловать
            </h1>
          </div>
        </div>

        {/* Form */}
        <div className="page-content px-5 pb-6 pt-4 space-y-5">
          <p className="text-on-surface-variant text-xs opacity-70 leading-relaxed">
            Начните премиальное путешествие по городу с вашим персональным водителем.
          </p>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant/60 ml-1 uppercase tracking-wider block">Ваше имя</label>
            <input
              className="w-full h-12 bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 text-white placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-primary/30 transition-all outline-none text-sm"
              placeholder="Иван Иванов"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant/60 ml-1 uppercase tracking-wider block">Выберите город</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-primary text-lg">location_on</span>
              </div>
              <select className="w-full h-12 bg-surface-container-low border border-outline-variant/15 rounded-xl pl-11 pr-10 text-white appearance-none focus:ring-1 focus:ring-primary/30 transition-all outline-none text-sm">
                <option value="moscow">Москва</option>
                <option value="spb">Санкт-Петербург</option>
                <option value="kzn">Казань</option>
                <option value="ekb">Екатеринбург</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">expand_more</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant/60 ml-1 uppercase tracking-wider block">Номер телефона</label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-on-surface-variant/50 font-bold text-sm pointer-events-none">
                +7
              </div>
              <input
                className="w-full h-12 bg-surface-container-low border border-outline-variant/15 rounded-xl pl-10 px-4 text-white placeholder:text-on-surface-variant/20 focus:ring-1 focus:ring-primary/30 transition-all outline-none text-sm font-medium tracking-wider"
                placeholder=" (___) ___-__-__"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                autoComplete="tel"
              />
              {phone.length === 10 && (
                <div className="absolute right-4 text-emerald-500 animate-in fade-in zoom-in duration-300">
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                </div>
              )}
            </div>
          </div>

          {/* Stylish Agreement Slider */}
          <div className="p-4 bg-surface-container-lowest/30 rounded-2xl border border-outline-variant/10 flex items-center justify-between gap-4">
            <label className="text-[11px] leading-relaxed text-on-surface-variant/70 cursor-pointer select-none" onClick={() => setAgreed(!agreed)}>
              Я согласен с <span className="text-primary underline font-bold">Офертой</span> и <span className="text-primary underline font-bold">Политикой конфиденциальности</span>
            </label>
            
            {/* Toggle Switch */}
            <button
              onClick={() => setAgreed(!agreed)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${agreed ? 'bg-primary' : 'bg-surface-container-highest'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${agreed ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* CTA button — sticky on mobile, flows with content on desktop */}
      <div
        className="desktop-cta-wrapper sticky bottom-0 w-full px-5 pt-4 pb-5 flex-shrink-0"
        style={{
          background: 'linear-gradient(to top, var(--surface) 60%, transparent)',
          paddingBottom: 'calc(1.25rem + var(--sab))',
        }}
      >
        <button
          onClick={handleContinue}
          disabled={!isFormValid}
          style={{
            background: isFormValid ? 'var(--primary, #FFB4A8)' : 'rgba(255,255,255,0.05)',
            color: isFormValid ? '#000' : 'rgba(255,255,255,0.2)',
            opacity: isFormValid ? 1 : 0.6,
          }}
          className="w-full h-14 rounded-full font-['Manrope'] font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-[0.98]"
        >
          Продолжить
        </button>
        <p className="mt-3 text-[9px] text-on-surface-variant/40 uppercase tracking-widest font-bold text-center">
          Безопасный вход через OTP
        </p>
      </div>
    </main>
  );
}
