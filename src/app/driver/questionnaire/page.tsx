'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CAR_BRANDS, CAR_COLORS, getCarSvgPath } from '@/utils/carData';

export default function Page() {
  const router = useRouter();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [query, setQuery] = useState('');
  const [showModels, setShowModels] = useState(false);
  const [location, setLocation] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    setBrand(localStorage.getItem('driver-car-brand') || '');
    setModel(localStorage.getItem('driver-car-model') || '');
    setColor(localStorage.getItem('driver-car-color') || 'Белый');
    setLocation(localStorage.getItem('driver-location') || '');
    setPlateNumber(localStorage.getItem('driver-car-plate') || '');
    setIsPublished(localStorage.getItem('driver-published') === 'true');
  }, []);

  const filteredBrands = useMemo(() => {
    return CAR_BRANDS.filter(b => b.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const selectedBrand = useMemo(() => {
    return CAR_BRANDS.find(b => b.name === brand);
  }, [brand]);

  const handleSave = () => {
    localStorage.setItem('driver-car-brand', brand);
    localStorage.setItem('driver-car-model', model);
    localStorage.setItem('driver-car-color', color);
    localStorage.setItem('driver-car-summary', `${brand} ${model}, ${color}`);
    localStorage.setItem('driver-car-plate', plateNumber.toUpperCase().trim());
    localStorage.setItem('driver-location', location);
    localStorage.setItem('driver-published', String(isPublished));
    
    console.log('Questionnaire saved');
    router.back();
  };

  const carPreviewUrl = getCarSvgPath(brand, model, color);

  return (
    <main className="min-h-dvh flex flex-col bg-surface">
      {/* Header */}
      <header
        className="app-header app-header-fixed flex items-center px-5 gap-3 border-b border-outline-variant/10 bg-surface/80 backdrop-blur-md sticky top-0 z-30"
        style={{ height: 'calc(3.5rem + var(--sat))', paddingTop: 'var(--sat)' }}
      >
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-nav-drawer'))}
          className="mobile-menu-btn size-11 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-primary"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="font-['Manrope'] text-2xl font-black tracking-tight text-white uppercase">Анкета</h1>
      </header>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto scroll-touch">
        <div className="page-content px-5 py-6 space-y-4"
          style={{ paddingBottom: 'calc(8rem + var(--sab))' }}
        >
          {/* Car */}
          <section className="bg-surface-container-low/60 border border-outline-variant/10 rounded-3xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-['Manrope'] text-[10px] uppercase tracking-[0.3em] text-primary font-black opacity-80">Автомобиль</h2>
              <span className="material-symbols-outlined text-primary/30" style={{ fontSize: '16px' }}>directions_car</span>
            </div>

            {/* Car Preview SVG */}
            <div className="w-full aspect-video bg-surface-container-lowest rounded-3xl flex items-center justify-center p-4 relative overflow-hidden group border border-outline-variant/5">
               <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-50"></div>
               <img 
                 src={carPreviewUrl} 
                 alt="Car Preview" 
                 className="w-4/5 h-4/5 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105"
                 onError={(e) => {
                    (e.target as HTMLImageElement).src = '/cars/Lada Granta Белый.svg';
                 }}
               />
               <div className="absolute bottom-4 left-0 w-full text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Визуализация модели</p>
               </div>
            </div>
            
            <div className="space-y-4">
              {/* Brand Select */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-on-surface-variant/60 ml-1 uppercase tracking-widest">Марка</label>
                <div className="relative">
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant/5 rounded-2xl h-14 px-5 text-white placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-primary/30 transition-all outline-none" 
                    placeholder="Поиск марки..."
                    value={brand || query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (brand) setBrand('');
                    }}
                    onFocus={() => { if(!brand) setQuery(''); }}
                  />
                  {!brand && query.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-surface-container-high rounded-2xl border border-outline-variant/10 z-20 shadow-2xl max-h-48 overflow-y-auto overflow-x-hidden backdrop-blur-xl">
                      {filteredBrands.map(b => (
                        <button 
                          key={b.name}
                          onClick={() => {
                            setBrand(b.name);
                            setModel('');
                            setQuery('');
                          }}
                          className="w-full h-12 px-5 text-left text-sm font-bold text-white hover:bg-primary/10 transition-colors border-b border-outline-variant/5 last:border-0"
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Model Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant/60 ml-1 uppercase tracking-widest">Модель</label>
                <div className="relative">
                  <button 
                    onClick={() => setShowModels(!showModels)}
                    disabled={!brand}
                    className="w-full bg-surface-container-lowest border border-outline-variant/5 rounded-2xl h-14 px-5 text-white flex items-center justify-between disabled:opacity-30 transition-all outline-none"
                  >
                    <span className={model ? 'text-white' : 'text-on-surface-variant/30'}>
                      {model || 'Выберите модель'}
                    </span>
                    <span className="material-symbols-outlined text-primary/40">expand_more</span>
                  </button>
                  {showModels && selectedBrand && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-surface-container-high rounded-2xl border border-outline-variant/10 z-20 shadow-2xl max-h-48 overflow-y-auto backdrop-blur-xl">
                      {selectedBrand.models.map(m => (
                        <button 
                          key={m}
                          onClick={() => {
                            setModel(m);
                            setShowModels(false);
                          }}
                          className="w-full h-12 px-5 text-left text-sm font-bold text-white hover:bg-primary/10 transition-colors border-b border-outline-variant/5 last:border-0"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Color Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant/60 ml-1 uppercase tracking-widest">Цвет кузова</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {CAR_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        color === c 
                          ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20' 
                          : 'bg-surface-container-lowest text-white/40 border-outline-variant/5 hover:border-primary/30'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plate Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant/60 ml-1 uppercase tracking-widest">Гос. номер</label>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/5 rounded-2xl h-14 px-5 text-white placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-primary/30 transition-all outline-none font-bold uppercase" 
                  placeholder="А123БВ" 
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="bg-surface-container-low/60 border border-outline-variant/10 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-['Manrope'] text-[10px] uppercase tracking-[0.3em] text-primary font-black opacity-80">Локация</h2>
              <span className="material-symbols-outlined text-primary/30" style={{ fontSize: '16px' }}>location_on</span>
            </div>
            <input 
              className="w-full bg-surface-container-lowest border border-outline-variant/5 rounded-2xl h-14 px-5 text-white focus:ring-1 focus:ring-primary/30 transition-all outline-none" 
              placeholder="Москва, ул. Тверская 12" 
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <div className="w-full h-28 rounded-2xl overflow-hidden relative border border-outline-variant/5">
              <img className="w-full h-full object-cover" src="/map_visual_asset_1775917982703.png" alt="Map"/>
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
            </div>
          </section>

          {/* Publish toggle */}
          <div className="flex items-center justify-between p-5 bg-primary/5 border border-primary/10 rounded-3xl">
            <div>
              <p className="font-bold text-white text-sm">Опубликовать анкету</p>
              <p className="text-xs text-on-surface-variant/50 mt-0.5">Требуется активная подписка</p>
            </div>
            <label className="inline-flex items-center cursor-pointer flex-shrink-0">
              <input 
                className="sr-only peer" 
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <div className="relative w-12 h-7 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-primary after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div
        className="sticky bottom-0 w-full px-5 pt-6"
        style={{
          paddingBottom: 'calc(1.25rem + var(--sab))',
          background: 'linear-gradient(to top, var(--surface) 60%, transparent)',
        }}
      >
        <button
          onClick={handleSave}
          className="w-full h-14 rounded-full bg-primary text-black font-['Manrope'] font-black text-sm tracking-[0.2em] uppercase shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
        >
          Сохранить анкету
        </button>
      </div>
    </main>
  );
}
