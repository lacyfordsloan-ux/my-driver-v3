'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HistoryItem {
  id: string;
  fromName: string;
  toName: string;
  price: string;
  
  passengerName: string;
  passengerRating?: string;
  passengerAvatarId?: string;
  
  driverName: string;
  driverRating?: string;
  driverAvatarId?: string;
  
  carSummary?: string;
  finishedAt: string;
  role: 'passenger' | 'driver';
}

const AVATAR_PRESETS = [
  { id: 'avatar1', icon: 'face', color: '#FFB4A8', bg: 'rgba(255,180,168,0.1)' },
  { id: 'avatar2', icon: 'face_5', color: '#B4E1FF', bg: 'rgba(180,225,255,0.1)' },
  { id: 'avatar3', icon: 'face_3', color: '#B4FFC7', bg: 'rgba(180,255,199,0.1)' },
  { id: 'avatar4', icon: 'face_6', color: '#E1B4FF', bg: 'rgba(225,180,255,0.1)' },
];

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger');
  const router = useRouter();

  useEffect(() => {
    const savedRole = (sessionStorage.getItem('tab-role') || localStorage.getItem('app-role')) as 'passenger' | 'driver';
    if (savedRole) setRole(savedRole);

    const savedHistory = localStorage.getItem('ride-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAvatar = (id: string | undefined, size: string = 'size-10') => {
    const preset = AVATAR_PRESETS.find(a => a.id === id) || AVATAR_PRESETS[0];
    const isSvg = id && (id.includes('(') || id.includes('avatar'));
    
    return (
      <div 
        className={`${size} rounded-full flex items-center justify-center border border-primary/10 flex-shrink-0 overflow-hidden`}
        style={{ background: preset.bg, color: preset.color }}
      >
        {isSvg ? (
          <img 
            src={`/avatars/${id.includes('(') ? id : `avatar (${id.replace('avatar', '')})`}.svg`} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined !text-xl">{preset.icon}</span>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-dvh flex flex-col bg-surface overflow-hidden">
      <header
        className="app-header app-header-fixed bg-background/90 backdrop-blur-xl border-b border-outline-variant/15 flex items-center justify-between px-4 z-50 shrink-0"
        style={{ height: 'calc(3.5rem + var(--sat))', paddingTop: 'var(--sat)' }}
      >
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-nav-drawer'))}
          className="mobile-menu-btn size-11 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-primary"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="font-['Manrope'] text-lg font-black text-primary uppercase tracking-tight">История поездок</h1>
        <div className="size-11"></div>
      </header>

      <div 
        className="flex-1 overflow-y-auto scroll-touch pb-10"
        style={{ paddingTop: 'calc(3.5rem + var(--sat))' }}
      >
        <div className="page-content py-5 px-4 max-w-2xl mx-auto">
          {history.length === 0 ? (
            <div className="text-center py-20 text-on-surface-variant opacity-30">
              <span className="material-symbols-outlined text-6xl block mb-3">history_toggle_off</span>
              <p className="font-bold text-sm">История пуста</p>
              <p className="text-xs pt-1">Ваши завершенные поездки появятся здесь</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-surface-container-low rounded-[2rem] overflow-hidden border border-outline-variant/5 shadow-xl transition-all"
                >
                  <div className="p-6 flex flex-col gap-5">
                    {/* Header: Date & Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">
                        {formatDate(item.finishedAt)}
                      </span>
                      <div className="bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                        <p className="text-lg font-black text-primary italic leading-none">{item.price} ₽</p>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="bg-surface-container-lowest/50 rounded-2xl p-4 border border-outline-variant/5">
                      <div className="relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary/40 before:to-primary/10">
                        <div className="relative mb-3">
                          <div className="absolute -left-[22px] top-1 size-3 rounded-full bg-primary border-2 border-surface shadow-[0_0_8px_rgba(255,180,168,0.4)]"></div>
                          <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-0.5">Откуда</p>
                          <h3 className="font-['Manrope'] text-sm font-bold text-white line-clamp-1">{item.fromName}</h3>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[22px] top-1 size-3 rounded-full bg-primary/20 border-2 border-surface"></div>
                          <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-0.5">Куда</p>
                          <h3 className="font-['Manrope'] text-sm font-bold text-primary/70 line-clamp-1">{item.toName}</h3>
                        </div>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                       {/* Driver Card */}
                       <div className="flex items-center gap-3">
                         {renderAvatar(item.driverAvatarId, 'size-11')}
                         <div className="min-w-0">
                           <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-0.5">Водитель</p>
                           <p className="text-[11px] font-bold text-white truncate mb-0.5">{item.driverName}</p>
                           <div className="flex items-center gap-1 opacity-60">
                             <span className="material-symbols-outlined !text-[10px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                             <span className="text-[10px] font-black text-on-surface-variant">{item.driverRating}</span>
                           </div>
                         </div>
                       </div>

                       {/* Passenger Card */}
                       <div className="flex items-center gap-3 justify-end text-right">
                         <div className="min-w-0">
                           <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-0.5">Пассажир</p>
                           <p className="text-[11px] font-bold text-white truncate mb-0.5">{item.passengerName}</p>
                           <div className="flex items-center gap-1 justify-end opacity-60">
                             <span className="text-[10px] font-black text-on-surface-variant">{item.passengerRating}</span>
                             <span className="material-symbols-outlined !text-[10px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                           </div>
                         </div>
                         {renderAvatar(item.passengerAvatarId, 'size-11')}
                       </div>
                    </div>

                    {item.carSummary && (
                      <div className="bg-surface-container-high/30 rounded-xl p-3 flex items-center justify-center gap-3 border border-outline-variant/5">
                        <span className="material-symbols-outlined text-primary/40 text-sm">directions_car</span>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest truncate">{item.carSummary}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
