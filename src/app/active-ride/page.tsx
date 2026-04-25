'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { getCarSvgPath } from '@/utils/carData';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { ClientOnly } from '@/components/ClientOnly';

const AVATAR_PRESETS = [
  { id: 'avatar1', icon: 'face', color: '#FFB4A8', bg: 'rgba(255,180,168,0.1)' },
  { id: 'avatar2', icon: 'face_5', color: '#B4E1FF', bg: 'rgba(180,225,255,0.1)' },
  { id: 'avatar3', icon: 'face_3', color: '#B4FFC7', bg: 'rgba(180,255,199,0.1)' },
  { id: 'avatar4', icon: 'face_6', color: '#E1B4FF', bg: 'rgba(225,180,255,0.1)' },
];

export default function Page() {
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  
  const [role, setRole] = useState<'passenger' | 'driver'>(() => {
    if (typeof window === 'undefined') return 'passenger';
    const urlRole = new URLSearchParams(window.location.search).get('role');
    const sessionRole = sessionStorage.getItem('tab-role');
    const localRole = localStorage.getItem('app-role');
    return (urlRole || sessionRole || localRole) === 'driver' ? 'driver' : 'passenger';
  });

  const [rideData, setRideData] = useState<any>(() => {
    if (typeof window === 'undefined') return null;
    const savedData = localStorage.getItem('active-ride-data');
    if (savedData) return JSON.parse(savedData);
    const savedOffer = localStorage.getItem('pending-driver-offer');
    return savedOffer ? JSON.parse(savedOffer) : null;
  });

  const socketRef = useRef<any>(null);
  const isExiting = useRef(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showSBPModal, setShowSBPModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);


  useEffect(() => {
    const checkUnread = () => {
      const currentRideId = rideData?.rideId;
      if (currentRideId) {
        const history = JSON.parse(localStorage.getItem(`chat-messages-${currentRideId}`) || '[]');
        const count = history.filter((m: any) => m.senderId !== role && m.status !== 'read').length;
        setUnreadCount(count);
      }
    };

    checkUnread();
    window.addEventListener('storage', checkUnread);
    const interval = setInterval(checkUnread, 1500); // Periodic check for socket updates

    return () => {
      window.removeEventListener('storage', checkUnread);
      clearInterval(interval);
    };
  }, [rideData?.rideId, role]);


  useEffect(() => {
    // Sync session storage
    sessionStorage.setItem('tab-role', role);

    // Initialize Socket
    const socketUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
    socketRef.current = io(socketUrl);

    socketRef.current.on('connect', () => {
      if (rideData?.rideId) {
        socketRef.current?.emit('join_chat', rideData.rideId);
      }
    });

    socketRef.current.on('ride_finished', () => {
      cleanupAndExit();
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [rideData?.rideId, role]);

  const cleanupAndExit = () => {
    if (isExiting.current) return;
    isExiting.current = true;

    const currentData = localStorage.getItem('active-ride-data');
    if (currentData) {
      try {
        const parsed = JSON.parse(currentData);
        const finishedAt = new Date().toISOString();
        
        const passengerPending = {
          rideId: rideData.rideId,
          targetName: rideData.driverInfo?.name || 'Водитель',
          targetRole: 'driver',
          targetPhotoId: rideData.driverInfo?.avatar || 'avatar (1)',
          targetRating: rideData.driverInfo?.rating || '5.0',
          targetReviewCount: Math.floor(Number(rideData.driverInfo?.tripCount || 10) * 0.8),
          targetTripCount: rideData.driverInfo?.tripCount || '10',
          carInfo: {
            brand: rideData.driverInfo?.carBrand || '',
            model: rideData.driverInfo?.carModel || '',
            color: rideData.driverInfo?.carColor || '',
            plate: rideData.driverInfo?.carPlate || ''
          },
          finishedAt: finishedAt,
          timestamp: Date.now()
        };
        localStorage.setItem('pending-review-passenger', JSON.stringify(passengerPending));

        const driverPending = {
          rideId: rideData.rideId,
          targetName: rideData.passengerInfo?.firstName || 'Пассажир',
          targetRole: 'passenger',
          targetPhotoId: rideData.passengerInfo?.avatarId || 'avatar (1)',
          targetRating: rideData.passengerInfo?.rating || '5.0',
          targetReviewCount: Math.floor(Number(rideData.passengerInfo?.tripCount || 5) * 0.8),
          targetTripCount: rideData.passengerInfo?.tripCount || '5',
          carInfo: undefined,
          finishedAt: finishedAt,
          timestamp: Date.now()
        };
        localStorage.setItem('pending-review-driver', JSON.stringify(driverPending));

        const historyData = JSON.parse(localStorage.getItem('ride-history') || '[]');
        if (!historyData.some((item: any) => item.id === parsed.rideId)) {
          const newHistoryItem = {
            id: parsed.rideId || `hist-${Date.now()}`,
            fromName: parsed.fromName || 'Неизвестно',
            toName: parsed.toName || 'Неизвестно',
            price: parsed.price,
            passengerName: parsed.passengerInfo?.firstName || (role === 'passenger' ? localStorage.getItem('user-name') : 'Пассажир'),
            passengerRating: parsed.passengerInfo?.rating || (role === 'passenger' ? localStorage.getItem('user-rating') : '5.0'),
            passengerAvatarId: parsed.passengerInfo?.avatarId || (role === 'passenger' ? localStorage.getItem('user-avatar') : 'avatar (1)'),
            driverName: parsed.driverInfo?.name || 'Водитель',
            driverRating: parsed.driverInfo?.rating || '4.8',
            driverAvatarId: parsed.driverInfo?.avatar || 'avatar (1)',
            carSummary: parsed.driverInfo?.carSummary,
            finishedAt: new Date().toISOString(),
            role: role
          };
          historyData.unshift(newHistoryItem);
          localStorage.setItem('ride-history', JSON.stringify(historyData));
        }
      } catch (e) {
        console.warn('ActiveRide: Failed to record trip end', e);
      }
    }

    localStorage.removeItem('active-ride-id');
    localStorage.removeItem('active-ride-data');
    localStorage.removeItem('pending-driver-offer');
    window.dispatchEvent(new Event('storage'));
    router.push(role === 'passenger' ? '/passenger/home' : '/driver/requests');
  };

  const handleFinish = () => {
    if (socketRef.current && rideData?.rideId) {
      socketRef.current.emit('ride_finished', { 
        rideId: rideData.rideId,
        rideData: rideData 
      });
    }
    cleanupAndExit();
  };

  const openMap = (type: 'yandex' | '2gis') => {
    const coords = '55.7558,37.6173';
    if (type === 'yandex') {
      window.open(`yandexmaps://maps.yandex.ru/?pt=${coords}&z=12&l=map`, '_blank');
    } else {
      window.open(`dgis://2gis.ru/routeSearch/rsType/car/to/${coords}`, '_blank');
    }
  };

  const counterpartAvatarId = role === 'passenger' 
    ? (rideData?.driverInfo?.avatar || 'avatar1')
    : (rideData?.passengerInfo?.avatarId || 'avatar1');
  
  const counterpartAvatar = AVATAR_PRESETS.find(a => a.id === counterpartAvatarId) || AVATAR_PRESETS[0];

  return (
    <ClientOnly>
      <main className="h-dvh flex flex-col bg-surface text-on-surface items-center py-4 pb-8 overflow-hidden">
        <div className="w-full max-w-md h-full px-4 flex flex-col justify-between overflow-y-auto custom-scrollbar">
            
            <div className="flex flex-col gap-3">
              {/* Header Title */}
              <div className="flex flex-col items-center mb-1 mt-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                  </span>
                  <h1 className="font-['Manrope'] text-lg font-black tracking-[0.2em] uppercase text-primary">Активная поездка</h1>
                </div>
              </div>
              
              {/* Driver/Passenger Profile Card */}
              <div className="bg-surface-container-low p-4 rounded-[2.5rem] border border-outline-variant/10 shadow-xl overflow-hidden relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="size-14 rounded-full flex items-center justify-center border shadow-inner flex-shrink-0 overflow-hidden"
                      style={{ background: counterpartAvatar.bg, color: counterpartAvatar.color, borderColor: counterpartAvatar.color + '33' }}
                    >
                      {counterpartAvatarId && (counterpartAvatarId.includes('(') || counterpartAvatarId.includes('avatar')) ? (
                        <img 
                          src={`/avatars/${counterpartAvatarId.includes('(') ? counterpartAvatarId : `avatar (${counterpartAvatarId.replace('avatar', '')})`}.svg`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined !text-4xl">{counterpartAvatar.icon}</span>
                      )}
                    </div>
                    <div>
                      <h2 className="font-['Manrope'] text-base font-black text-white leading-tight mb-0.5">
                        {role === 'passenger' 
                          ? (rideData?.driverInfo?.name || 'Загрузка...') 
                          : (rideData?.passengerInfo?.firstName || 'Пассажир')
                        }
                      </h2>
                      {role === 'passenger' && (
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-primary" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>star</span>
                          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{rideData?.driverInfo?.rating || '5.0'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <a 
                      href={`tel:${role === 'passenger' ? rideData?.driverInfo?.phone : '+70000000000'}`} 
                      className="size-11 rounded-2xl bg-surface-container-highest flex items-center justify-center text-white hover:bg-primary/10 hover:text-primary transition-all duration-300 border border-outline-variant/10 shadow-sm active:scale-90"
                    >
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>phone_in_talk</span>
                    </a>
                    <button 
                      onClick={() => router.push('/chat')} 
                      className="relative size-11 rounded-2xl bg-surface-container-highest flex items-center justify-center text-white hover:bg-primary/10 hover:text-primary transition-all duration-300 border border-outline-variant/10 shadow-sm active:scale-90"
                    >
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-surface overflow-hidden shadow-lg animate-bounce">
                          <span className="text-[9px] font-black text-white">{unreadCount}</span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Redesigned Vehicle Section - More Compact */}
                {role === 'passenger' && (
                  <div className="bg-surface-container-lowest/40 rounded-2xl p-3 border border-outline-variant/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-[0.03]">
                      <span className="material-symbols-outlined text-6xl">directions_car</span>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                       <div className="h-24 w-full mb-2 flex items-center justify-center relative">
                          <img 
                            src={getCarSvgPath(rideData?.driverInfo?.carBrand, rideData?.driverInfo?.carModel, rideData?.driverInfo?.carColor)} 
                            alt="Car" 
                            className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)]"
                          />
                       </div>
                       
                       <div className="flex flex-col items-center gap-2">
                          <h3 className="text-white font-black text-lg uppercase tracking-tight leading-none">
                            {rideData?.driverInfo?.carBrand} {rideData?.driverInfo?.carModel}
                          </h3>
                          
                          <div className="flex items-center gap-3">
                             <div className="flex items-center gap-1.5 opacity-50">
                                <div className="size-3 rounded-full border border-white/20" style={{ backgroundColor: rideData?.driverInfo?.carColor === 'Белый' ? '#FFFFFF' : rideData?.driverInfo?.carColor === 'Красный' ? '#FF0000' : '#444444' }}></div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{rideData?.driverInfo?.carColor}</span>
                             </div>
                             
                             {rideData?.driverInfo?.carPlate && (
                               <div className="bg-white px-2 py-0.5 rounded border border-black/10 flex items-center gap-1 shadow-sm">
                                  <span className="text-[11px] font-black text-black tracking-widest">{rideData?.driverInfo?.carPlate}</span>
                                  <div className="w-[1px] h-3 bg-black/10 mx-0.5"></div>
                                  <span className="text-[8px] font-black text-black/40">RUS</span>
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                  </div>
                )}
                
                {role === 'driver' && (
                   <div className="bg-surface-container-lowest/50 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-40 mb-1">Информация</p>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">Поездка по городу</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-40 mb-1">Сумма</p>
                        <p className="text-xl font-black text-white italic">{rideData?.price || '0'} ₽</p>
                      </div>
                   </div>
                )}
              </div>

              {/* Navigation Mini Block */}
              <div className="bg-surface-container-low p-4 rounded-[2.5rem] border border-outline-variant/5 shadow-lg">
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-50 mb-3 text-center">Навигация</p>
                 <div className="flex items-center gap-3">
                    <button onClick={() => openMap('yandex')} className="flex-1 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center gap-2 border border-outline-variant/5 hover:bg-surface-container-highest transition-all group">
                      <span className="material-symbols-outlined text-primary/60 group-hover:text-primary text-xl">explore</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Яндекс</span>
                    </button>
                    <button onClick={() => openMap('2gis')} className="flex-1 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center gap-2 border border-outline-variant/5 hover:bg-surface-container-highest transition-all group">
                       <span className="material-symbols-outlined text-primary/60 group-hover:text-primary text-xl">location_on</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">2ГИС</span>
                    </button>
                 </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pb-4 mt-2">
              {/* Payment (SBP) Card */}
              <div className="bg-surface-container-low p-3.5 rounded-[2.5rem] border border-primary/20 shadow-[0_8px_32px_rgba(255,180,168,0.1)] overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-[0.03]">
                  <span className="material-symbols-outlined text-6xl">payments</span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    <span className="text-[9px] font-black text-primary italic tracking-widest uppercase">СБП</span>
                  </div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">Перевод по СБП</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-black text-white tracking-widest mb-0.5 leading-none">
                        {rideData?.driverInfo?.phone || '+7 000 000-00-00'}
                      </p>
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">
                        {rideData?.driverInfo?.bank || 'Банк'} • {rideData?.driverInfo?.fullName || 'Имя Отчество'}
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-primary uppercase tracking-widest opacity-40 mb-0.5">К оплате</p>
                       <p className="text-xl font-black text-primary italic leading-none">{rideData?.price || '0'} ₽</p>
                    </div>
                  </div>

                  {role === 'passenger' && (
                    <button 
                      onClick={() => setShowSBPModal(true)}
                      className="w-full h-12 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                      Оплатить через СБП
                    </button>
                  )}
                </div>
              </div>

              {/* Driver-only Finish Button */}
              {role === 'driver' && (
                <div className="mt-2">
                   <button
                    onClick={() => setShowFinishModal(true)}
                    className="w-full h-12 rounded-[2rem] bg-gradient-to-br from-primary to-[#FF5540] text-black font-['Manrope'] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/40 active:scale-[0.98] transition-all"
                  >
                    Завершить поездку
                  </button>
                </div>
              )}
            </div>
          </div>


        <ConfirmationModal
          isOpen={showFinishModal}
          onClose={() => setShowFinishModal(false)}
          onConfirm={handleFinish}
          title="Завершение поездки"
          message="Вы уверены, что доехали до места назначения и хотите завершить поездку?"
          confirmText="Да, завершить"
          cancelText="Назад"
        />

        <ConfirmationModal
          isOpen={showSBPModal}
          onClose={() => setShowSBPModal(false)}
          onConfirm={() => {
            console.log('SBP Payment Confirmed');
          }}
          title="Перевод через СБП"
          message={`Вы подтверждаете перевод суммы ${rideData?.price || '0'} ₽ по номеру ${rideData?.driverInfo?.phone || ''}?`}
          confirmText="Подтвердить перевод"
          cancelText="Отмена"
        />
      </main>
    </ClientOnly>
  );
}
