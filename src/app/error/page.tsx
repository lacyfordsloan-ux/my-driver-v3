export default function Page() {
  return (
    <main className="min-h-screen flex flex-col">
      

<main className="w-full max-w-md flex flex-col items-center text-center">

<div className="relative mb-12">

<div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>

<div className="relative w-32 h-32 flex items-center justify-center bg-surface-container-high rounded-full border border-outline-variant/10 shadow-2xl">
<span className="material-symbols-outlined text-primary text-6xl" data-icon="signal_disconnected" style={{"fontVariationSettings": "'wght' 200"}}>
                    signal_disconnected
                </span>

<div className="absolute inset-0 rounded-full border-2 border-primary/20 scale-125"></div>
</div>
</div>

<div className="space-y-4 mb-16">
<h1 className="font-headline font-extrabold text-3xl tracking-tight text-[#E5E2E1]">
                Ошибка подключения
            </h1>
<p className="font-body text-[#AAAAAA] text-lg leading-relaxed max-w-[280px] mx-auto">
                Проверьте интернет. Если используется VPN — попробуйте временно отключить
            </p>
</div>

<div className="w-full space-y-4">
<button className="w-full h-16 bg-crimson-gradient text-on-primary-container font-headline font-extrabold text-sm uppercase tracking-widest rounded-full shadow-[0px_20px_40px_rgba(255,85,64,0.3)] active:scale-95 transition-transform duration-150">
                Повторить попытку
            </button>
<div className="flex items-center justify-center gap-2 py-4">
<span className="material-symbols-outlined text-[#AAAAAA] text-sm" data-icon="settings">settings</span>
<span className="text-[#AAAAAA] font-label text-xs uppercase tracking-wider">Настройки сети</span>
</div>
</div>
</main>

<div className="fixed top-0 left-0 w-full h-12 flex items-center justify-between px-8 text-on-surface/40 text-xs font-medium">
<span>12:45</span>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-sm" data-icon="wifi_off">wifi_off</span>
<span className="material-symbols-outlined text-sm" data-icon="battery_horiz_000">battery_horiz_000</span>
</div>
</div>

<div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
<div className="absolute -top-[20%] -right-[10%] w-[80%] h-[50%] bg-primary/5 blur-[120px] rounded-full rotate-12"></div>
<div className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[40%] bg-surface-container-highest/20 blur-[100px] rounded-full"></div>
</div>

    </main>
  );
}
