'use client';

import React, { useState, useMemo, useEffect } from 'react';

const AVATAR_PRESETS = [
  { id: 'avatar1', icon: 'face', color: '#FFB4A8', bg: 'rgba(255,180,168,0.1)' },
  { id: 'avatar2', icon: 'face_5', color: '#B4E1FF', bg: 'rgba(180,225,255,0.1)' },
  { id: 'avatar3', icon: 'face_3', color: '#B4FFC7', bg: 'rgba(180,255,199,0.1)' },
  { id: 'avatar4', icon: 'face_6', color: '#E1B4FF', bg: 'rgba(225,180,255,0.1)' },
];

interface ReviewModalProps {
  targetName: string;
  targetRole: 'driver' | 'passenger';
  targetPhotoId?: string;
  targetRating?: string | number;
  targetReviewCount?: number;
  targetTripCount?: string | number;
  carInfo?: {
    brand: string;
    model: string;
    color: string;
    plate: string;
  };
  finishedAt?: string;
  onClose: () => void;
  onSubmit: (rating: number) => void;
}

export const ReviewModal = ({ 
  targetName, 
  targetRole, 
  targetPhotoId = 'avatar1',
  targetRating = '5.0',
  targetReviewCount = 8,
  targetTripCount = 10,
  carInfo,
  finishedAt,
  onClose, 
  onSubmit 
}: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  
  const avatar = AVATAR_PRESETS.find(a => a.id === targetPhotoId) || AVATAR_PRESETS[0];

  const formattedTime = useMemo(() => {
    if (!finishedAt) return '';
    const date = new Date(finishedAt);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }, [finishedAt]);

  useEffect(() => {
    localStorage.setItem('global-modal-active', 'true');
    document.body.classList.add('drawer-open');
    window.dispatchEvent(new Event('storage'));
    return () => {
      localStorage.removeItem('global-modal-active');
      document.body.classList.remove('drawer-open');
      window.dispatchEvent(new Event('storage'));
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md max-h-[92dvh] bg-surface-container-high rounded-[2.5rem] overflow-hidden shadow-[0px_20px_40px_rgba(0,0,0,0.6)] border border-outline-variant/15 flex flex-col animate-in zoom-in-95 duration-300">
        
        <div className="flex h-4 w-full items-center justify-center pt-3 flex-shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-outline-variant/30"></div>
        </div>

        <div className="px-6 pb-6 pt-4 flex flex-col items-center text-center overflow-y-auto custom-scrollbar">
          <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-4">
            {targetRole === 'driver' ? 'Оцените водителя' : 'Оцените пассажира'}
          </p>

          <h1 className="text-white font-['Manrope'] text-[22px] font-black leading-tight tracking-[-0.02em] mb-4 uppercase">
            Как прошла <span className="text-primary italic">поездка?</span>
          </h1>

          {/* User Profile Card */}
          <div className="w-full bg-surface-container-lowest/50 rounded-[2rem] p-4 mb-3 border border-outline-variant/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
              <span className="material-symbols-outlined text-8xl">verified</span>
            </div>
            
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div 
                className="size-24 rounded-full flex items-center justify-center border-2 border-primary/20 shadow-xl overflow-hidden"
                style={{ background: avatar.bg, color: avatar.color }}
              >
                {targetPhotoId && (targetPhotoId.includes('(') || targetPhotoId.includes('avatar')) ? (
                  <img 
                    src={`/avatars/${targetPhotoId.includes('(') ? targetPhotoId : `avatar (${targetPhotoId.replace('avatar', '')})`}.svg`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.target as any).style.display = 'none';
                      (e.target as any).parentElement.innerHTML = `<span class="material-symbols-outlined !text-5xl">${avatar.icon}</span>`;
                    }}
                  />
                ) : (
                  <span className="material-symbols-outlined !text-5xl">{avatar.icon}</span>
                )}
              </div>

              <div>
                <h2 className="text-white font-black text-xl uppercase tracking-tighter mb-1">
                  {targetName || 'Загрузка...'}
                </h2>
                <div className="flex items-center justify-center gap-2">
                   <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      <span className="material-symbols-outlined text-primary !text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-[10px] font-black text-white italic">{Number(targetRating).toFixed(1)}</span>
                   </div>
                   <span className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest leading-none">
                      {targetRole === 'driver' ? 'Водитель' : 'Пассажир'}
                   </span>
                </div>
              </div>

              <div className="grid grid-cols-2 w-full gap-3 pt-2">
                 <div className="bg-surface/30 rounded-2xl p-3 border border-outline-variant/5">
                    <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Поездок</p>
                    <p className="text-sm font-black text-white italic">{targetTripCount}</p>
                 </div>
                 <div className="bg-surface/30 rounded-2xl p-3 border border-outline-variant/5">
                    <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Отзывов</p>
                    <p className="text-sm font-black text-white italic">{targetReviewCount}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Car Info Card (Passenger rating Driver only) */}
          {targetRole === 'driver' && carInfo && carInfo.brand && (
            <div className="w-full bg-primary/5 rounded-2xl p-3 border border-primary/10 mb-4 flex items-center gap-4 text-left">
               <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined">directions_car</span>
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60 mb-0.5">Автомобиль</p>
                  <p className="text-xs font-black text-white uppercase leading-tight">
                    {carInfo.color} {carInfo.brand} {carInfo.model}
                  </p>
               </div>
               {carInfo.plate && (
                  <div className="bg-white px-2 py-1 rounded border border-black/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-black tracking-widest">{carInfo.plate}</span>
                  </div>
               )}
            </div>
          )}

          {/* Rating Stars Selection */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`transition-all duration-300 active:scale-75 ${rating >= star ? 'text-primary' : 'text-on-surface-variant opacity-20 hover:opacity-40'}`}
              >
                <span className="material-symbols-outlined !text-4xl lg:!text-5xl" style={{ fontVariationSettings: rating >= star ? "'FILL' 1" : "'FILL' 0" }}>
                  star
                </span>
              </button>
            ))}
          </div>

          {/* Footer Info */}
          {formattedTime && (
            <div className="mb-4 flex items-center gap-2 opacity-30">
               <span className="material-symbols-outlined !text-xs">schedule</span>
               <span className="text-[10px] font-black uppercase tracking-widest">Поездка завершена в {formattedTime}</span>
            </div>
          )}

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => onSubmit(rating)}
              disabled={rating === 0}
              className={`w-full h-14 rounded-full font-['Manrope'] text-sm font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] ${
                rating > 0 
                ? 'bg-primary text-black shadow-primary/30 hover:shadow-primary/50' 
                : 'bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed border border-outline-variant/5'
              }`}
            >
              Отправить отзыв
            </button>
            
            <button 
              onClick={onClose}
              className="mt-2 text-on-surface-variant/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
            >
              Пропустить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
