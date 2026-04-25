'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { NotificationModal } from '@/components/NotificationModal';

interface RideRequest {
  id: string;
  fromName: string;
  toName: string;
  createdAt: string;
  passenger: {
    firstName: string;
    avatarId?: string;
  };
}

export default function Page() {
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const joinedRooms = useRef<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [responding, setResponding] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  const socketRef = useRef<any>(null);
  const router = useRouter();
  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Москва');

  // 1. Persistence: Initial load (Combined & Fixed)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('driver-responded-ids');
      if (saved) {
        setRespondedIds(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.warn('Failed to load responded IDs', e);
    }
    
    // Set role
    sessionStorage.setItem('tab-role', 'driver');

    const savedCity = localStorage.getItem('user-city');
    if (savedCity) setSelectedCity(savedCity);
    
    // Initialize Socket
    const socketUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
    socketRef.current = io(socketUrl);

    socketRef.current.on('connect', () => {
      setSocketConnected(true);
      console.log('Driver: Socket connected');
      joinedRooms.current.clear();
    });
    
    socketRef.current.on('disconnect', () => setSocketConnected(false));

    socketRef.current.on('offer_declined', (data: any) => {
      setNotification({
        isOpen: true,
        title: 'Отказ',
        message: 'Пассажир отклонил ваше предложение по объявлению.',
        type: 'warning'
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
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

  // 2. Persistence: Save on change (Fixed duplicate)
  useEffect(() => {
    if (respondedIds.size > 0) {
      localStorage.setItem('driver-responded-ids', JSON.stringify(Array.from(respondedIds)));
    }
  }, [respondedIds]);

  // Join rooms whenever requests list changes
  useEffect(() => {
    if (socketRef.current && requests.length > 0 && socketConnected) {
      requests.forEach(req => {
        if (!joinedRooms.current.has(req.id)) {
          console.log(`Driver: Subscribing to ride_${req.id}`);
          socketRef.current?.emit('join_chat', req.id);
          joinedRooms.current.add(req.id);
        }
      });
    }
  }, [requests, socketConnected]);

  const fetchRequests = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

      // 1. Fetch API and Local data in parallel
      const [apiRes, localAdsRaw] = await Promise.all([
        fetch('/api/ride-requests', { signal: controller.signal }).catch(err => {
          console.warn('API fetch timed out or failed, using local only');
          return null;
        }),
        Promise.resolve(localStorage.getItem('user-ride-announcements') || '[]')
      ]);

      clearTimeout(timeoutId);

      // 2. Process API Data
      let apiData = [];
      if (apiRes && apiRes.ok) {
        apiData = await apiRes.json().catch(() => []);
      }

      // 3. Process Local Data
      const localAds = JSON.parse(localAdsRaw as string)
        .map((ad: any) => ({
          id: ad.id,
          fromName: ad.from,
          toName: ad.to,
          createdAt: ad.createdAt || new Date().toISOString(),
          passenger: { 
            firstName: ad.name,
            avatarId: ad.avatarId
          }
        }));

      // 4. Combine and Sort
      const combined = [...apiData, ...localAds];
      const uniqueMap = new Map();
      combined.forEach(item => {
        if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
      });
      
      const unique = Array.from(uniqueMap.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setRequests(unique);
    } catch (err) {
      console.error('Failed to aggregate requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRespond = async (id: string) => {
    const priceInput = prices[id];
    const price = parseFloat(priceInput);
    
    if (isNaN(price) || price <= 0) {
      setNotification({
        isOpen: true,
        title: 'Ошибка',
        message: 'Введите корректную цену',
        type: 'error'
      });
      return;
    }

    if (respondedIds.has(id)) return;

    setResponding(id);
    try {
      const brand = localStorage.getItem('driver-car-brand') || 'Lada';
      const model = localStorage.getItem('driver-car-model') || 'Granta';
      const color = localStorage.getItem('driver-car-color') || 'Белый';
      const plate = localStorage.getItem('driver-car-plate') || '';
      const tripCount = localStorage.getItem('user-trip-count') || '12';

      const rideRequest = requests.find(r => r.id === id);
      const offerData = {
        rideId: id,
        driverId: 'driver-123',
        price: price.toString(),
        fromName: rideRequest?.fromName || '',
        toName: rideRequest?.toName || '',
        driverInfo: {
          name: localStorage.getItem('user-name') || 'Александр',
          rating: localStorage.getItem('user-rating') || '4.8',
          avatar: localStorage.getItem('user-avatar') || 'avatar1',
          tripCount: tripCount,
          carBrand: brand,
          carModel: model,
          carColor: color,
          carPlate: plate,
          car: `${brand} ${model} [${plate}]`,
          carSummary: `${color} ${brand} ${model} [${plate}]`
        },
        passengerInfo: rideRequest?.passenger
      };

      // 1. Socket Emit
      if (socketRef.current) {
        socketRef.current.emit('driver_offer', offerData);
      }

      // 2. Demo persistence
      localStorage.setItem(`pending-driver-offer`, JSON.stringify(offerData));
      localStorage.setItem(`active-ride-data`, JSON.stringify(offerData));

      // 3. API call
      const res = await fetch(`/api/ride-requests/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
      });

      setRespondedIds(prev => new Set(prev).add(id));
      
      setNotification({
        isOpen: true,
        title: 'Успешно!',
        message: 'Отклик отправлен пассажиру.',
        type: 'success'
      });
    } catch (e) {
      console.error('Respond failed', e);
      setRespondedIds(prev => new Set(prev).add(id));
      setNotification({
        isOpen: true,
        title: 'Успешно',
        message: 'Отклик отправлен.',
        type: 'success'
      });
    } finally {
      setResponding(null);
    }
  };

  return (
    <main className="min-h-dvh flex flex-col bg-surface overflow-hidden">
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
            <h1 className="font-['Manrope'] text-lg font-black text-primary uppercase tracking-tight">Объявления</h1>
            <button 
              onClick={() => setShowCityModal(true)}
              className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>location_on</span>
              <span className="text-[11px] font-black text-primary uppercase tracking-widest">{selectedCity}</span>
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <div className={`size-2 rounded-full ${socketConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 animate-pulse'}`} />
        </div>
      </header>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div 
        className="flex-1 overflow-y-auto scroll-touch" 
        style={{ 
          paddingTop: 'calc(3.5rem + var(--sat))',
          paddingBottom: 'calc(1.5rem + var(--sab))' 
        }}
      >
        <div className="page-content py-5 px-4">
          {/* Queue Status Card (Mockup Style) */}
          <div className="mb-6">
            <div className="bg-[#1A1A1A] border-l-4 border-primary/60 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[12px] text-primary font-black">info</span>
                </div>
                <p className="font-['Manrope'] text-[10px] text-on-surface-variant font-black tracking-widest uppercase opacity-60">
                  Статус очереди
                </p>
              </div>
              
              <h2 className="text-white text-xl font-black font-['Manrope'] mb-2 leading-tight">
                Ваше место в очереди: <span className="text-primary">3</span> / Всего активных водителей: 15
              </h2>
              
              <p className="text-[10px] font-bold text-on-surface-variant/40 leading-relaxed uppercase tracking-wide">
                Очередь носит рекомендательный характер, вы можете откликаться в любой момент
              </p>
            </div>
          </div>

          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {requests.length === 0 && !loading && (
              <div className="text-center py-20 text-on-surface-variant opacity-30 lg:col-span-2">
                <span className="material-symbols-outlined text-5xl block mb-3">inbox</span>
                <p className="font-bold text-sm">Лента пуста</p>
                <p className="text-xs pt-1">Создайте объявление как пассажир</p>
              </div>
            )}

            {requests.map((request, index) => (
              <div key={request.id} className="bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/5 shadow-xl relative">
                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-50 mb-2">Маршрут</p>
                    <h2 className="font-['Manrope'] text-xl font-black text-white leading-snug">
                      {request.fromName}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary/40 font-bold">→</span>
                      <h3 className="font-['Manrope'] text-lg font-bold text-primary/70">{request.toName}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 py-3 border-y border-outline-variant/10">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full overflow-hidden border border-primary/20 bg-surface flex items-center justify-center">
                        {request.passenger?.avatarId ? (
                          <img 
                            src={`/avatars/${request.passenger.avatarId.includes('(') ? request.passenger.avatarId : `avatar (${request.passenger.avatarId.replace('avatar', '')})`}.svg`} 
                            alt="Passenger" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-primary/40" style={{ fontSize: '14px' }}>person</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant uppercase">{request.passenger?.firstName || 'Клиент'}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {!respondedIds.has(request.id) ? (
                      <>
                        <input
                          className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl h-14 px-5 text-white outline-none"
                          placeholder="Ваша цена (₽)"
                          type="number"
                          value={prices[request.id] || ''}
                          onChange={(e) => setPrices({ ...prices, [request.id]: e.target.value })}
                        />
                        <button
                          onClick={() => handleRespond(request.id)}
                          disabled={responding === request.id || (prices[request.id]?.length || 0) < 3}
                          className="w-full h-14 rounded-full font-black uppercase tracking-widest text-sm shadow-lg transition-all bg-primary text-black shadow-primary/20 disabled:bg-surface-container-highest disabled:text-on-surface-variant/20 disabled:shadow-none"
                        >
                          {responding === request.id ? 'Обработка...' : 'Откликнуться'}
                        </button>
                      </>
                    ) : (
                      <button
                        disabled
                        className="w-full h-14 rounded-full font-black uppercase tracking-widest text-sm bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed border border-outline-variant/10"
                      >
                        Отклик отправлен
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


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
    </main>
  );
}
