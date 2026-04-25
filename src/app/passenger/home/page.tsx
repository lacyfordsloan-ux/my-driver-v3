'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ConfirmationModal } from '@/components/ConfirmationModal';

export default function Page() {
  const router = useRouter();
  const [userRequests, setUserRequests] = useState<any[]>([]);

  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Москва');
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [idToCancel, setIdToCancel] = useState<string | null>(null);

  useEffect(() => {
    const savedCity = localStorage.getItem('user-city');
    if (savedCity) setSelectedCity(savedCity);
    
    sessionStorage.setItem('tab-role', 'passenger');
    const loadRequests = () => {
      const saved = JSON.parse(localStorage.getItem('user-ride-announcements') || '[]');
      setUserRequests(saved);
    };
    loadRequests();
    // Refresh if other tabs/windows change storage
    window.addEventListener('storage', loadRequests);
    return () => window.removeEventListener('storage', loadRequests);
  }, []);

  // Sync city modal state with global pulse button
  useEffect(() => {
    if (showCityModal) {
      localStorage.setItem('global-modal-active', 'true');
      document.body.classList.add('drawer-open');
      window.dispatchEvent(new Event('storage'));
    } else {
      localStorage.removeItem('global-modal-active');
      document.body.classList.remove('drawer-open');
      window.dispatchEvent(new Event('storage'));
    }
    return () => document.body.classList.remove('drawer-open');
  }, [showCityModal]);


  const handleCancelClick = (id: string) => {
    setIdToCancel(id);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (!idToCancel) return;
    const updated = userRequests.filter(req => req.id !== idToCancel);
    localStorage.setItem('user-ride-announcements', JSON.stringify(updated));
    setUserRequests(updated);
    setIdToCancel(null);
  };

  const mockRequests = [
    { id: '1', from: 'ул. Ленина, 10', to: 'Центральный Парк', price: '450 ₽', name: 'Дмитрий', time: '2 мин. назад', avatarId: 'avatar (2)' },
    { id: '2', from: 'ЖК «Маяк»', to: 'Аэропорт Шереметьево', price: '1 200 ₽', name: 'Елена', time: '5 мин. назад', avatarId: 'avatar (5)' },
    { id: '3', from: 'ТЦ «Атриум»', to: 'Метро Китай-город', price: '300 ₽', name: 'Максим', time: '12 мин. назад', avatarId: 'avatar (8)' },
    { id: '4', from: 'Варшавское ш.', to: 'Подольск, Центр', price: '850 ₽', name: 'Анна', time: '15 мин. назад', avatarId: 'avatar (12)' },
  ];

  // Combine user requests (first) and mock requests
  const allRequests = [...userRequests, ...mockRequests];

  const toggleMenu = () => window.dispatchEvent(new CustomEvent('toggle-nav-drawer'));

  return (
    <main className="min-h-dvh flex flex-col bg-surface overflow-hidden">
      {/* Header */}
      <header
        className="app-header app-header-fixed bg-background/90 backdrop-blur-xl border-b border-outline-variant/15 flex items-center justify-between px-4 z-[1000]"
        style={{ height: 'calc(3.5rem + var(--sat))', paddingTop: 'var(--sat)' }}
      >
        <div className="flex items-center gap-3">
          {/* Mobile menu button — hidden on desktop */}
          <button
            onClick={toggleMenu}
            className="mobile-menu-btn w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-primary"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-baseline gap-3">
            <h1 className="font-['Manrope'] text-lg font-black tracking-widest uppercase text-primary">Объявления</h1>
            <button 
              onClick={() => setShowCityModal(true)}
              className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>location_on</span>
              <span className="text-[11px] font-black text-primary uppercase tracking-widest">{selectedCity}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto scroll-touch"
        style={{ 
          paddingTop: 'calc(3.5rem + var(--sat))',
          paddingBottom: 'calc(8rem + var(--sab))' 
        }}
      >
        <div className="page-content py-6 px-4">
          <h2 className="font-['Manrope'] text-2xl lg:text-3xl font-black text-white leading-tight mb-1 tracking-tighter">
            Активные <span className="text-primary italic">Объявления</span>
          </h2>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-[0.15em] opacity-40 mb-5">
            Объявления в вашем городе
          </p>

          {/* Feed Grid */}
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {allRequests.map((request) => (
              <div 
                key={request.id} 
                className={`relative group bg-surface-container-low border ${request.isUserOwned ? 'border-primary/30' : 'border-outline-variant/5'} rounded-3xl p-5 transition-all shadow-lg overflow-hidden`}
              >
                {request.isUserOwned && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary px-3 py-1 rounded-bl-xl shadow-lg">
                      <span className="text-[10px] font-black text-black uppercase tracking-widest">Моё</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/10 flex-shrink-0 overflow-hidden">
                      {request.avatarId ? (
                        <img 
                          src={`/avatars/${request.avatarId.includes('(') ? request.avatarId : `avatar (${request.avatarId.replace('avatar', '')})`}.svg`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-base">{request.name?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white uppercase tracking-tight">{request.name}</p>
                      <p className="text-[10px] text-on-surface-variant font-bold opacity-40 uppercase tracking-widest">{request.time}</p>
                    </div>
                  </div>
                  {/* Price hidden per user request */}
                  {/* <p className="text-primary font-black text-lg">{request.price}</p> */}
                </div>

                <div className="space-y-2.5 relative pl-5 mb-4">
                  <div className="absolute left-2 top-1.5 bottom-1.5 w-0.5 bg-outline-variant/20 rounded-full"></div>
                  <div className="relative">
                    <div className="absolute -left-[14px] top-1 size-2 rounded-full bg-primary/60 border border-primary"></div>
                    <p className="text-xs font-bold text-on-surface-variant/80 uppercase tracking-tight truncate">{request.from}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[14px] top-1 size-2 rounded-full border-2 border-primary bg-surface"></div>
                    <p className="text-xs font-bold text-white uppercase tracking-tight truncate">{request.to}</p>
                  </div>
                </div>

                {request.isUserOwned && (
                  <button
                    onClick={() => handleCancelClick(request.id)}
                    className="w-full py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/10 text-primary-container font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 hover:border-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">cancel</span>
                    Отменить объявление
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center opacity-20">
            <span className="material-symbols-outlined text-3xl block mb-1">auto_awesome</span>
            <p className="text-[10px] font-black uppercase tracking-widest">Конец списка</p>
          </div>
        </div>
      </div>

      {/* Action Button - Fixed at bottom */}
      <div
        className="fixed bottom-0 left-0 w-full px-4 z-50 pointer-events-none"
        style={{
          paddingBottom: 'calc(1.25rem + var(--sab))',
          background: 'linear-gradient(to top, var(--surface) 80%, transparent)',
        }}
      >
        <div className="pointer-events-auto">
          <button
            onClick={() => router.push('/passenger/create-request')}
            className="w-full h-14 rounded-full bg-gradient-to-br from-[#FFB4A8] to-[#FF5540] text-black font-['Manrope'] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined font-black text-xl">add_circle</span>
            Создать объявление
          </button>
        </div>
      </div>

      {/* City Selection Modal */}
      {showCityModal && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowCityModal(false)}
          />
          <div className="relative w-full max-w-md bg-surface-container-high rounded-[2.5rem] shadow-2xl border border-outline-variant/10 p-8 pt-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-1.5 rounded-full bg-outline-variant/20" />
            </div>
            
            <h3 className="font-['Manrope'] text-2xl font-black text-white text-center mb-6 uppercase tracking-tight">
              Выберите <span className="text-primary italic">город</span>
            </h3>
            
            <div className="space-y-3 mb-8">
              {['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург'].map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${
                    selectedCity === city 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-surface-container-low border-outline-variant/5 text-on-surface-variant'
                  }`}
                >
                  <span className="font-bold uppercase tracking-widest text-xs">{city}</span>
                  {selectedCity === city && (
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                  )}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => {
                localStorage.setItem('user-city', selectedCity);
                setShowCityModal(false);
              }}
              className="w-full h-14 bg-primary text-black rounded-full font-['Manrope'] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              Подтвердить
            </button>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        title="Отмена объявления"
        message="Вы уверены, что хотите отменить это объявление? Это действие нельзя будет отменить."
        confirmText="Да, отменить"
        cancelText="Нет, оставить"
        type="danger"
      />
    </main>
  );
}
