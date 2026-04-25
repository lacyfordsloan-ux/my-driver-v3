'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { getCarSvgPath } from '@/utils/carData';
import { ConfirmationModal } from '@/components/ConfirmationModal';

const AVATAR_PRESETS = [
  { id: 'avatar1', icon: 'face', color: '#FFB4A8', bg: 'rgba(255,180,168,0.1)' },
  { id: 'avatar2', icon: 'face_5', color: '#B4E1FF', bg: 'rgba(180,225,255,0.1)' },
  { id: 'avatar3', icon: 'face_3', color: '#B4FFC7', bg: 'rgba(180,255,199,0.1)' },
  { id: 'avatar4', icon: 'face_6', color: '#E1B4FF', bg: 'rgba(225,180,255,0.1)' },
];

export default function Page() {
  const router = useRouter();
  const [offer, setOffer] = useState<any>(null);
  const [role, setRole] = useState<string>('passenger');
  const socketRef = React.useRef<any>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  useEffect(() => {
    const urlRole = new URLSearchParams(window.location.search).get('role');
    const sessionRole = sessionStorage.getItem('tab-role');
    const localRole = localStorage.getItem('app-role');
    const finalRole = (urlRole || sessionRole || localRole) === 'driver' ? 'driver' : 'passenger';
    setRole(finalRole);
    sessionStorage.setItem('tab-role', finalRole);
    
    const socketUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
    socketRef.current = io(socketUrl);
    
    const saved = localStorage.getItem('pending-driver-offer');
    if (saved) {
      setOffer(JSON.parse(saved));
    } else {
      // Mock for development if nothing in storage
      setOffer({
        price: '550',
        driverInfo: {
          name: 'Александр Д.',
          rating: '4.9',
          carBrand: 'Lada',
          carModel: 'Granta',
          carColor: 'Красный',
          car: 'Lada Granta',
          trips: '1,240',
          avatar: 'avatar1'
        }
      });
    }
  }, []);

  // Scroll locking
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

  const handleDecline = () => {
    if (offer?.rideId && socketRef.current) {
      socketRef.current.emit('offer_declined', { rideId: offer.rideId });
    }
    localStorage.removeItem('pending-driver-offer');
    router.back();
  };

  const handleAccept = () => {
    if (offer?.rideId && socketRef.current) {
      socketRef.current.emit('ride_started', { rideId: offer.rideId });
    }

    // 1. Remove the announcement from active announcements
    try {
      const activeAnnouncements = JSON.parse(localStorage.getItem('user-ride-announcements') || '[]');
      const updatedAnnouncements = activeAnnouncements.filter((ad: any) => ad.id !== offer?.rideId);
      localStorage.setItem('user-ride-announcements', JSON.stringify(updatedAnnouncements));
    } catch (e) {
      console.warn('Failed to update active announcements list', e);
    }

    // 2. Setup active ride
    localStorage.setItem('active-ride-id', offer?.rideId || 'ride-123');
    localStorage.setItem('active-ride-data', JSON.stringify(offer));
    localStorage.removeItem('pending-driver-offer');
    router.push('/passenger/home');
  };

  if (!offer) return null;

  const carSvg = getCarSvgPath(
    offer.driverInfo?.carBrand || '',
    offer.driverInfo?.carModel || '',
    offer.driverInfo?.carColor || ''
  );

  const preset = AVATAR_PRESETS.find(a => a.id === offer.driverInfo?.avatar) || AVATAR_PRESETS[0];

  return (
    <main className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface-container-low border border-outline-variant/10 rounded-[2.5rem] p-5 shadow-2xl overflow-y-auto max-h-[92dvh] relative flex flex-col custom-scrollbar">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0"></div>
        
        <div className="mb-4 text-center">
          <div 
            className="size-16 rounded-full mx-auto flex items-center justify-center border mb-3 shadow-inner shadow-black/20 flex-shrink-0 overflow-hidden"
            style={{ background: preset.bg, color: preset.color, borderColor: preset.color + '33' }}
          >
            {offer.driverInfo.avatar && (offer.driverInfo.avatar.includes('(') || offer.driverInfo.avatar.includes('avatar')) ? (
              <img 
                src={`/avatars/${offer.driverInfo.avatar.includes('(') ? offer.driverInfo.avatar : `avatar (${offer.driverInfo.avatar.replace('avatar', '')})`}.svg`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined !text-4xl">{preset.icon}</span>
            )}
          </div>
          <h1 className="font-['Manrope'] text-lg font-black text-white mb-1 uppercase tracking-tight text-center">
            {offer.driverInfo?.name || 'Водитель'}
          </h1>
          <div className="flex items-center justify-center gap-2 mb-3">
             <div className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
               <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
               <span className="text-[10px] font-black text-primary">{offer.driverInfo?.rating || '5.0'}</span>
             </div>
             <span className="text-on-surface-variant/40 text-[9px] font-bold uppercase tracking-widest">
               {offer.driverInfo?.trips || '0'} поездок
             </span>
          </div>

          {/* Compact Car SVG Display */}
          <div className="relative h-32 w-full mb-4 bg-surface-container-lowest rounded-3xl border border-outline-variant/5 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tl from-primary/5 via-transparent to-transparent opacity-50"></div>
            <img 
              src={carSvg} 
              alt="Car" 
              className="w-full h-full object-contain p-3 drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)] transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-2 right-4">
               <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">
                {offer.driverInfo?.carColor}
               </p>
            </div>
          </div>

          <p className="text-white font-black text-[11px] uppercase tracking-widest opacity-80 text-center">
            {offer.driverInfo?.car || 'Автомобиль'}
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/5 rounded-3xl p-4 mb-5 text-center">
          <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-0.5 opacity-50">Предложенная цена</p>
          <div className="text-4xl font-['Manrope'] font-black text-white">
            {offer.price} <span className="text-lg text-primary font-bold">₽</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-auto">
          <button
            onClick={() => setShowAcceptModal(true)}
            className="w-full h-14 bg-primary text-black rounded-3xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/30 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">check_circle</span>
            Подтвердить
          </button>
          <button
            onClick={() => setShowDeclineModal(true)}
            className="w-full h-14 bg-surface-container-high/50 border border-white/5 text-white/50 rounded-3xl font-black uppercase tracking-widest text-xs active:scale-[0.97] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">cancel</span>
            Отказаться
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        onConfirm={handleAccept}
        title="Подтверждение поездки"
        message={`Вы соглашаетесь на поездку с водителем ${offer.driverInfo?.name} за ${offer.price} ₽?`}
        confirmText="Да, поехали"
        cancelText="Отмена"
      />

      <ConfirmationModal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        onConfirm={handleDecline}
        title="Отказ от предложения"
        message="Вы уверены, что хотите отклонить это предложение?"
        confirmText="Да, отклонить"
        cancelText="Назад"
        type="danger"
      />
    </main>
  );
}
