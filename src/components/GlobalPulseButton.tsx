'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { NotificationModal } from './NotificationModal';

export const GlobalPulseButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<'idle' | 'notification' | 'active'>('idle');
  const [isExpanded, setIsExpanded] = useState(false);
  const [inIframe, setInIframe] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) {
      setInIframe(true);
    }
  }, []);
  const [offerData, setOfferData] = useState<any>(null);
  const socketRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundPlayedRef = useRef<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const joinedRoomsRef = useRef<Set<string>>(new Set());
  
  const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Core synchronization logic
  const syncState = () => {
    const isStartRoute = ['/', '/role-selection'].includes(pathname);
    const role = sessionStorage.getItem('tab-role') || localStorage.getItem('app-role');
    
    // Removed isStartRoute logic that was wrongfully resetting active rides.

    const savedOffer = localStorage.getItem('pending-driver-offer');
    const savedActiveRide = localStorage.getItem('active-ride-id');

    if (savedActiveRide) {
      if (status !== 'active') {
        console.log('GlobalButton: Sync -> ACTIVE (from storage)');
        setStatus('active');
      }
    } else if (savedOffer && (role === 'passenger' || !role)) {
      // Note: !role is a fallback for race conditions during hydration
      const data = JSON.parse(savedOffer);
      const offerId = `${data.rideId}-${data.price}`;
      
      if (status !== 'notification' || (offerData && offerData.rideId !== data.rideId)) {
        console.log('GlobalButton: Sync -> NOTIFICATION (from storage)', data.rideId);
        setOfferData(data);
        setStatus('notification');

        if (soundPlayedRef.current !== offerId && audioRef.current) {
          audioRef.current.play().catch(e => console.log('Audio error:', e));
          soundPlayedRef.current = offerId;
        }
      }
    } else if (status !== 'idle' && !savedActiveRide && !savedOffer) {
      console.log('GlobalButton: Sync -> IDLE (nothing in storage)');
      setStatus('idle');
      soundPlayedRef.current = null;
    }

    // Sync global modal blocking state
    setIsGlobalModalOpen(localStorage.getItem('global-modal-active') === 'true');

    // Sync drawer state
    setIsDrawerOpen(localStorage.getItem('app-drawer-open') === 'true');

    // Sync unread messages from history
    if (savedActiveRide || savedOffer) {
      const currentRideId = savedActiveRide || (savedOffer ? JSON.parse(savedOffer).rideId : null);
      if (currentRideId) {
        const history = JSON.parse(localStorage.getItem(`chat-messages-${currentRideId}`) || '[]');
        const unreadCount = history.filter((m: any) => m.senderId !== role && m.status !== 'read').length;
        setUnreadMessages(unreadCount);
      }
    } else {
      setUnreadMessages(0);
    }
  };

  // 1. Initial Socket Handlers
  useEffect(() => {
    const socketUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
    socketRef.current = io(socketUrl);

    socketRef.current.on('connect', () => {
      setSocketConnected(true);
      console.log('GlobalButton: Socket connected');
      joinedRoomsRef.current.clear(); // Re-join rooms on reconnect
    });

    socketRef.current.on('new_offer', (data: any) => {
      console.log('GlobalButton: Received new_offer via socket', data);
      localStorage.setItem('pending-driver-offer', JSON.stringify(data));
      syncState(); 
      
      setNotification({
        isOpen: true,
        title: 'Новый отклик!',
        message: `Водитель ${data.driverInfo?.name || ''} предложил поездку за ${data.price} ₽.`,
        type: 'success'
      });
    });

    socketRef.current.on('ride_started', (data: any) => {
      console.log('GlobalButton: Ride started', data);
      localStorage.setItem('active-ride-id', data.rideId);
      localStorage.removeItem('pending-driver-offer');
      syncState();
    });

    socketRef.current.on('new_message', (data: any) => {
      console.log('GlobalButton: New message notification', data);
      // Wait for syncState (which reads from localStorage updated by other components/tabs)
      // or trigger a manual scan.
      setTimeout(syncState, 100);
    });

    socketRef.current.on('ride_finished', (data: any) => {
      console.log('GlobalButton: Ride finished via socket', data);
      
      // 1. Recover data (Either from event payload or local fallback)
      const eventData = data?.rideData;
      const localData = localStorage.getItem('active-ride-data');
      const parsedData = eventData || (localData ? JSON.parse(localData) : null);
      
      const role = sessionStorage.getItem('tab-role') || localStorage.getItem('app-role');
      const finishedAt = new Date().toISOString();
      
      if (parsedData) {
        // 2. Record Reviews for BOTH roles (to support single-device multi-tab testing)
        // 2.1. Record for Passenger (They rate the driver)
        const passengerPending = {
          rideId: parsedData.rideId,
          targetName: parsedData.driverInfo?.name || 'Водитель',
          targetRole: 'driver',
          targetPhotoId: parsedData.driverInfo?.avatar || 'avatar1',
          targetRating: parsedData.driverInfo?.rating || '5.0',
          targetReviewCount: Math.floor(Number(parsedData.driverInfo?.tripCount || 10) * 0.8),
          targetTripCount: parsedData.driverInfo?.tripCount || '0',
          carInfo: {
            brand: parsedData.driverInfo?.carBrand || '',
            model: parsedData.driverInfo?.carModel || '',
            color: parsedData.driverInfo?.carColor || '',
            plate: parsedData.driverInfo?.carPlate || ''
          },
          finishedAt: finishedAt,
          timestamp: Date.now()
        };
        localStorage.setItem('pending-review-passenger', JSON.stringify(passengerPending));

        // 2.2. Record for Driver (They rate the passenger)
        const driverPending = {
          rideId: parsedData.rideId,
          targetName: parsedData.passengerInfo?.firstName || 'Пассажир',
          targetRole: 'passenger',
          targetPhotoId: parsedData.passengerInfo?.avatarId || 'avatar1',
          targetRating: parsedData.passengerInfo?.rating || '5.0',
          targetReviewCount: Math.floor(Number(parsedData.passengerInfo?.tripCount || 5) * 0.8),
          targetTripCount: parsedData.passengerInfo?.tripCount || '0',
          carInfo: undefined,
          finishedAt: finishedAt,
          timestamp: Date.now()
        };
        localStorage.setItem('pending-review-driver', JSON.stringify(driverPending));
        
        // 3. Add to History
        try {
          const historyData = JSON.parse(localStorage.getItem('ride-history') || '[]');
          if (!historyData.some((item: any) => item.id === parsedData.rideId)) {
            const newHistoryItem = {
              id: parsedData.rideId || `hist-${Date.now()}`,
              fromName: parsedData.fromName || 'Неизвестно',
              toName: parsedData.toName || 'Неизвестно',
              price: parsedData.price,
              passengerName: parsedData.passengerInfo?.firstName || (role === 'passenger' ? localStorage.getItem('user-name') : 'Пассажир'),
              passengerRating: parsedData.passengerInfo?.rating || (role === 'passenger' ? localStorage.getItem('user-rating') : '5.0'),
              passengerAvatarId: parsedData.passengerInfo?.avatarId || (role === 'passenger' ? localStorage.getItem('user-avatar') : 'avatar1'),
              driverName: parsedData.driverInfo?.name || 'Водитель',
              driverRating: parsedData.driverInfo?.rating || '4.8',
              driverAvatarId: parsedData.driverInfo?.avatar || 'avatar1',
              carSummary: parsedData.driverInfo?.carSummary,
              finishedAt: new Date().toISOString(),
              role: role 
            };
            historyData.unshift(newHistoryItem);
            localStorage.setItem('ride-history', JSON.stringify(historyData));
          }
        } catch (e) {
          console.warn('GlobalButton: Failed to save history', e);
        }
      }

      // 4. Cleanup (Defensive: wait slightly to ensure iframe or other components read data)
      // Only clear if another component hasn't cleared it yet, or clear it after recording.
      setTimeout(() => {
        if (parsedData?.rideId) {
          localStorage.removeItem(`chat-messages-${parsedData.rideId}`);
        }
        localStorage.removeItem('active-ride-id');
        localStorage.removeItem('active-ride-data');
        localStorage.removeItem('pending-driver-offer');
        setStatus('idle');
        setIsExpanded(false);
        window.dispatchEvent(new Event('storage'));
      }, 100);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [router]);

  // 2. Room Joining (Optimized)
  useEffect(() => {
    if (!socketRef.current || !socketConnected) return;

    const joinRooms = () => {
      const announcements = JSON.parse(localStorage.getItem('user-ride-announcements') || '[]');
      announcements.forEach((ann: any) => {
        if (!joinedRoomsRef.current.has(ann.id)) {
          console.log(`GlobalButton: Subscribing to ride_${ann.id}`);
          socketRef.current?.emit('join_chat', ann.id);
          joinedRoomsRef.current.add(ann.id);
        }
      });
    };

    joinRooms();
    const interval = setInterval(joinRooms, 3000); 
    return () => clearInterval(interval);
  }, [socketConnected, pathname]);

  // 3. Lifecycle & Route Sync
  useEffect(() => {
    syncState();
    window.addEventListener('storage', syncState);
    return () => window.removeEventListener('storage', syncState);
  }, [pathname]);

  // 4. Cleanup (REFINED: Don't clear pending offers just by route change)
  useEffect(() => {
    if (['/'].includes(pathname)) {
      // Only clear on the absolute root (start of whole app)
      localStorage.removeItem('pending-driver-offer');
      localStorage.removeItem('active-ride-id');
      localStorage.removeItem('active-ride-data');
      setStatus('idle');
      setIsExpanded(false);
    }
  }, [pathname]);

  const autoNavigatedRef = useRef(false);

  // 5. Auto-navigate on active (Only once per active ride)
  useEffect(() => {
    const isExcluded = ['/role-selection', '/chat', '/rating'].includes(pathname);
    if (status === 'active' && pathname !== '/active-ride' && !isExcluded && !autoNavigatedRef.current) {
      autoNavigatedRef.current = true;
      setTimeout(() => router.push('/active-ride'), 100);
    } else if (status !== 'active') {
      autoNavigatedRef.current = false;
    }
  }, [status, pathname, router]);

  // 6. Reset unread messages when in chat
  useEffect(() => {
    if (pathname === '/chat') {
      setUnreadMessages(0);
    }
  }, [pathname]);

  const handleClick = () => {
    if (status === 'notification') {
      router.push('/passenger/driver-offer');
    } else if (status === 'active') {
      if (pathname === '/active-ride') {
        const role = sessionStorage.getItem('tab-role') || localStorage.getItem('app-role');
        router.push(role === 'driver' ? '/driver/requests' : '/passenger/home');
      } else {
         router.push('/active-ride');
      }
    }
  };

  const isHiddenRoute = ['/', '/loading', '/error', '/passenger/driver-offer', '/role-selection'].includes(pathname);
  
  // Perimissive visibility: If there's a notification or active ride, show it!
  const shouldShow = !isHiddenRoute && status !== 'idle';

  if (inIframe || !shouldShow) return null;

  return (
    <>

      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[3000] pointer-events-none flex flex-col items-center gap-4">
        <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
        
        <motion.button
          onClick={handleClick}
          disabled={isGlobalModalOpen || notification.isOpen || pathname === '/passenger/driver-offer' || pathname === '/chat' || isDrawerOpen}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`relative size-16 rounded-full bg-primary text-black flex items-center justify-center group transition-all duration-300 ${
            (isGlobalModalOpen || notification.isOpen || pathname === '/passenger/driver-offer' || pathname === '/chat' || isDrawerOpen) ? 'opacity-0 scale-0 pointer-events-none translate-x-20' : 'opacity-100 scale-100 pointer-events-auto translate-x-0'
          }`}
          style={{ boxShadow: (isGlobalModalOpen || notification.isOpen || pathname === '/passenger/driver-offer' || pathname === '/chat' || isDrawerOpen) ? 'none' : '0 0 30px rgba(255,180,168,0.5)' }}
        >
          {(status === 'notification' || status === 'active') && (
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute inset-0 rounded-full ${status === 'notification' ? 'bg-primary' : 'bg-white'}`}
            />
          )}

          <span className="material-symbols-outlined font-black text-2xl relative z-10 transition-transform group-active:scale-95">
            {status === 'notification' ? 'notifications_active' : (pathname === '/active-ride' ? 'close_fullscreen' : 'directions_car')}
          </span>

          {status === 'notification' && (
            <span className="absolute -top-1 -right-1 size-5 bg-white rounded-full flex items-center justify-center border-2 border-primary overflow-hidden">
              <span className="text-[10px] font-black">1</span>
            </span>
          )}

          {status === 'active' && unreadMessages > 0 && pathname !== '/active-ride' && (
            <span className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-surface overflow-hidden shadow-lg animate-bounce">
              <span className="text-[9px] font-black text-white">{unreadMessages}</span>
            </span>
          )}
        </motion.button>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </>
  );
};
