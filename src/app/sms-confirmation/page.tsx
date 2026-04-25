'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    const digit = value.slice(-1);
    newCode[index] = digit;
    setCode(newCode);
    if (digit !== '' && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = () => {
    const fullCode = code.join('');
    if (fullCode === '123456') {
      localStorage.setItem('user-registered', 'true');
      router.push('/role-selection');
    } else {
      alert('Неверный код. Попробуйте 123456');
    }
  };

  return (
    <main className="min-h-dvh flex flex-col bg-surface relative">
      {/* Decorative blobs */}
      <div className="absolute -bottom-24 -right-24 size-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute -top-24 -left-24 size-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>

      {/* Back button */}
      <div className="flex items-center px-5 pb-2" style={{ paddingTop: 'calc(1rem + var(--sat))' }}>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-nav-drawer'))}
          className="mobile-menu-btn w-11 h-11 flex items-center justify-center rounded-full bg-surface-container-low text-primary transition-all hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Content */}
      <div className="page-content flex flex-col px-6 pt-6 flex-grow">
        <h1 className="font-['Manrope'] text-4xl font-black leading-tight text-white tracking-tight">
          Введите <span className="text-primary">код</span>
        </h1>
        <p className="mt-2 text-on-surface-variant text-sm font-medium opacity-60 leading-relaxed">
          Мы отправили SMS на<br/>+7 XXX XXX XX XX
        </p>

        {/* OTP Input */}
        <div className="mt-10">
          <div className="flex justify-between gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-full aspect-square text-center text-3xl font-black bg-surface-container-low border-2 border-outline-variant/10 rounded-2xl focus:border-primary focus:ring-0 transition-all text-white outline-none"
                placeholder="·"
                style={{ caretColor: '#FFB4A8' }}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest opacity-50">
            Запросить повторно через <span className="text-primary font-black tabular-nums">00:59</span>
          </p>
          <button className="mt-4 text-primary text-xs font-black uppercase tracking-[0.2em] opacity-30">
            Отправить снова
          </button>
        </div>
      </div>

      {/* CTA — flows with content on desktop, sticky bottom on mobile */}
      <div
        className="desktop-cta-wrapper sticky bottom-0 px-5 pt-6"
        style={{ paddingBottom: 'calc(1.5rem + var(--sab))', background: 'linear-gradient(to top, var(--surface) 65%, transparent)' }}
      >
        <button
          onClick={handleConfirm}
          className="w-full h-14 rounded-full bg-primary text-black font-['Manrope'] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
        >
          Подтвердить
        </button>
      </div>
    </main>
  );
}
