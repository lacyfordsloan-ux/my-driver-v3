'use client';

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
        <span className="material-symbols-outlined text-primary text-5xl">wifi_off</span>
      </div>
      
      <h1 className="font-['Manrope'] font-bold text-3xl text-on-surface mb-3 tracking-tight">Вы не в сети</h1>
      <p className="font-['Inter'] text-on-surface-variant max-w-xs leading-relaxed opacity-80 mb-8">
        Проверьте подключение к интернету. Приложение заработает автоматически, как только связь восстановится.
      </p>
      
      <button 
        onClick={() => window.location.reload()}
        className="h-14 px-10 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full font-bold uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all"
      >
        Попробовать снова
      </button>
      
      <div className="fixed bottom-10 left-0 w-full flex justify-center opacity-30 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface">Мой Водитель • Оффлайн режим</span>
        </div>
      </div>
    </main>
  );
}
