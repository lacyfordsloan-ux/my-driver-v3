'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationModal } from '@/components/NotificationModal';

export default function Page() {
  const router = useRouter();
  const [fromName, setFromName] = useState('');
  const [toName, setToName] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const handleSubmit = async () => {
    if (!fromName || !toName) {
      setNotification({
        isOpen: true,
        title: 'Заполните данные',
        message: 'Пожалуйста, заполните все адреса для построения маршрута.',
        type: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      // Save locally to localStorage to simulate real-time update
      const newRequest = {
        id: `user-${Date.now()}`,
        from: fromName,
        to: toName,
        price: 'Цена договорная',
        name: localStorage.getItem('user-name') || 'Я',
        rating: localStorage.getItem('user-rating') || '5.0',
        avatarId: localStorage.getItem('user-avatar') || 'avatar1',
        tripCount: localStorage.getItem('user-trip-count') || '0',
        time: 'Только что',
        avatar: (localStorage.getItem('user-name') || 'Я').charAt(0),
        isUserOwned: true,
      };

      const existingRequests = JSON.parse(localStorage.getItem('user-ride-announcements') || '[]');
      localStorage.setItem('user-ride-announcements', JSON.stringify([newRequest, ...existingRequests]));

      setNotification({
        isOpen: true,
        title: 'Успешно!',
        message: 'Объявление опубликовано! Ожидайте предложений от водителей.',
        type: 'success'
      });
    } catch (err) {
      setNotification({
        isOpen: true,
        title: 'Ошибка',
        message: 'Произошла ошибка при создании заявки. Попробуйте снова.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClose = () => {
    const isSuccess = notification.type === 'success';
    setNotification({ ...notification, isOpen: false });
    if (isSuccess) {
      router.push('/passenger/home');
    }
  };

  return (
    <main className="min-h-dvh flex flex-col bg-surface overflow-x-hidden relative">
      {/* Header */}
      <header
        className="app-header app-header-fixed bg-background/90 backdrop-blur-xl border-b border-outline-variant/15 flex items-center justify-between px-4 z-[1000] shrink-0"
        style={{ height: 'calc(3.5rem + var(--sat))', paddingTop: 'var(--sat)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-nav-drawer'))}
            className="mobile-menu-btn size-11 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-primary"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-baseline gap-3">
            <h1 className="font-['Manrope'] text-lg font-black tracking-widest uppercase text-primary">Создать объявление</h1>
          </div>
        </div>
      </header>

      <div 
        className="flex-grow flex flex-col px-5 page-content w-full z-10 max-w-md mx-auto relative"
        style={{ paddingTop: 'calc(4.5rem + var(--sat))', paddingBottom: 'calc(8rem + var(--sab))' }}
      >

        <div className="space-y-3 mb-4 w-full">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-primary text-base">location_on</span>
            </div>
            <input
              className="w-full h-12 pl-11 pr-4 bg-surface-container-low border border-outline-variant/5 rounded-xl text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/30 transition-all text-sm outline-none"
              placeholder="Откуда (Адрес)"
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
            />
          </div>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-primary-container text-base">trip_origin</span>
            </div>
            <input
              className="w-full h-12 pl-11 pr-4 bg-surface-container-low border border-outline-variant/5 rounded-xl text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary/30 transition-all text-sm outline-none"
              placeholder="Куда (Адрес)"
              type="text"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <div className="bg-surface-container-low p-1 rounded-xl flex items-center w-full">
            <button className="flex-1 py-1.5 px-3 rounded-lg bg-surface-container-high text-primary font-bold text-xs transition-all shadow-sm">
              Сейчас
            </button>
            <button className="flex-1 py-1.5 px-3 rounded-lg text-on-surface-variant/60 font-medium text-xs hover:bg-surface-container-highest/50 transition-all">
              Позже
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest/40 rounded-xl p-3 flex items-start gap-3 mb-4 border border-outline-variant/5">
          <div className="p-2 rounded-full bg-surface-container-highest shrink-0">
            <span className="material-symbols-outlined text-primary text-lg">payments</span>
          </div>
          <div>
            <p className="text-sm text-on-surface leading-snug font-semibold">Водитель предложит цену</p>
            <p className="text-[10px] text-on-surface-variant/40 mt-0.5">Вы сможете выбрать лучшее предложение из списка.</p>
          </div>
        </div>

        <div className="w-full h-24 rounded-xl overflow-hidden relative shadow-lg border border-outline-variant/10 group">
          <img 
            src="/map_visual_asset_1775917982703.png" 
            alt="Map Preview" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
          <div className="absolute bottom-2 left-3 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/50">Построение маршрута...</span>
          </div>
        </div>
      </div>

      {/* Action Button - Sticky at bottom */}
      <div
        className="fixed bottom-0 left-0 w-full px-4 z-50 pointer-events-none"
        style={{
          paddingBottom: 'calc(1.25rem + var(--sab))',
          background: 'linear-gradient(to top, var(--surface) 80%, transparent)',
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-14 bg-gradient-to-br from-[#FFB4A8] to-[#FF5540] rounded-full flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 pointer-events-auto"
        >
          <span className="material-symbols-outlined text-black text-xl">publish</span>
          <span className="text-black font-['Manrope'] font-black uppercase tracking-[0.2em] text-xs">
            {loading ? 'Публикация...' : 'Опубликовать'}
          </span>
        </button>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={handleNotificationClose}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </main>
  );
}
