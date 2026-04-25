'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger');
  const [rideData, setRideData] = useState<any>(null);

  useEffect(() => {
    const savedRole = (sessionStorage.getItem('tab-role') || localStorage.getItem('app-role')) as 'passenger' | 'driver';
    setRole(savedRole || 'passenger');

    const savedOffer = localStorage.getItem('pending-driver-offer');
    if (savedOffer) {
      setRideData(JSON.parse(savedOffer));
    }
  }, []);

  const handleSubmit = () => {
    if (rating === 0) return;
    // Mock submit
    router.push(role === 'passenger' ? '/passenger/home' : '/driver/requests');
  };

  const handleClose = () => {
    router.push(role === 'passenger' ? '/passenger/home' : '/driver/requests');
  };

  return (
    <main className="min-h-screen flex flex-col bg-surface relative overflow-hidden">
      {/* Background visual */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-12 w-12 rounded-full bg-primary/20 animate-ping"></div>
            <div className="h-4 w-4 rounded-full bg-primary ring-4 ring-primary/20"></div>
          </div>
        </div>
      </div>

      {/* Close button */}
      <div className="fixed top-8 right-8 z-[60]">
        <button 
          onClick={handleClose}
          className="h-12 w-12 flex items-center justify-center rounded-full bg-surface-container-high/80 backdrop-blur-md text-on-surface-variant hover:text-white transition-all active:scale-90"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-md bg-surface-container-high rounded-[2.5rem] overflow-hidden shadow-[0px_20px_40px_rgba(0,0,0,0.6)] border border-outline-variant/15 flex flex-col">
          
          <div className="flex h-5 w-full items-center justify-center pt-4">
            <div className="h-1.5 w-12 rounded-full bg-outline-variant/30"></div>
          </div>

          <div className="px-8 pb-10 pt-6 flex flex-col items-center text-center">
            <h1 className="text-white font-['Manrope'] text-[28px] font-black leading-tight tracking-[-0.02em] mb-8 uppercase">
              Оцените <span className="text-primary italic">поездку</span>
            </h1>

            {/* Stars */}
            <div className="flex items-center justify-center gap-3 mb-10">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`transition-all duration-300 active:scale-75 ${rating >= star ? 'text-primary scale-110' : 'text-on-surface-variant opacity-30'}`}
                >
                  <span className="material-symbols-outlined !text-[48px]" style={{ fontVariationSettings: rating >= star ? "'FILL' 1" : "'FILL' 0" }}>
                    star
                  </span>
                </button>
              ))}
            </div>

            {/* Entity Card */}
            <div className="w-full bg-surface-container-lowest/50 rounded-[2rem] p-5 mb-8 flex items-center gap-4 text-left border border-outline-variant/10">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 border border-primary/20">
                <span className="material-symbols-outlined text-3xl">person</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-black text-sm uppercase tracking-tight">
                  {role === 'passenger' ? (rideData?.driverInfo?.name || 'Водитель') : 'Пассажир'}
                </p>
                <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest opacity-50">
                  {role === 'passenger' ? (rideData?.driverInfo?.car || 'Комфорт') : 'Попутчик'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              className={`w-full h-16 rounded-full font-['Manrope'] text-sm font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] ${
                rating > 0 
                ? 'bg-primary text-black shadow-primary/30 hover:shadow-primary/50' 
                : 'bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed border border-outline-variant/5'
              }`}
            >
              Отправить
            </button>

            <button className="mt-8 text-on-surface-variant/40 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest underline underline-offset-8 decoration-primary/20">
              Больше не показывать объявления
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
