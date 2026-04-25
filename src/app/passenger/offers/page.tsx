export default function Page() {
  return (
    <main className="min-h-screen flex flex-col">
      

<div className="relative flex h-screen w-full flex-col bg-surface overflow-hidden">

<div className="flex items-center bg-surface p-4 justify-between z-0">
<div className="text-on-surface flex size-12 shrink-0 items-center">
<span className="material-symbols-outlined">list</span>
</div>
<h2 className="text-on-surface text-lg font-headline font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Поиск поездки</h2>
<div className="flex w-12 items-center justify-end">
<button className="flex items-center justify-center rounded-lg h-12 bg-transparent text-on-surface p-0">
<span className="material-symbols-outlined">doorbell</span>
</button>
</div>
</div>

<div className="flex-1 relative">
<div className="absolute inset-0 bg-cover bg-center" data-alt="Detailed dark-themed city map with glowing crimson route lines and subtle street labels in a night urban setting" data-location="Moscow" style={{"backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAN06liIaJQ9QcfO79evPt97UOwda45i-kltFM2ggcNh0wQHdR7xqG1TulVjcik6zs1BUh7kiSRshLy9cTq8ZbUFt7269x1xDmrwXJfXqWoZisV5mgrboAbVk1PolkaWraLo9TlBWI3I04jEBEAfu8rwo6d4JOXnudjaKbFFo6KNQGSRHdEjh7r34GJsbFLpG_LP0n7jDaMIutv5zbHgCeoU7atb8o0Tw6OV7q6ftUT2IjojiseoAkZaeOHvoMcZ8Y1spRVeS022WI')"}}>
</div>

<div className="absolute top-4 left-4 right-4 z-10">
<div className="bg-surface-container-high p-4 rounded-xl shadow-2xl flex items-center gap-3">
<span className="material-symbols-outlined text-primary">location_on</span>
<span className="text-on-surface text-sm font-medium">Улица Тверская, 12</span>
</div>
</div>
</div>

<div className="flex gap-2 border-t border-outline-variant/20 bg-surface-container px-4 pb-3 pt-2 z-0">
<a className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-on-surface" href="#">
<div className="flex h-8 items-center justify-center">
<span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>magnification_large</span>
</div>
<p className="text-xs font-medium leading-normal tracking-[0.015em]">Поиск</p>
</a>
<a className="flex flex-1 flex-col items-center justify-end gap-1 text-on-surface-variant" href="#">
<div className="flex h-8 items-center justify-center">
<span className="material-symbols-outlined">car_gear</span>
</div>
<p className="text-xs font-medium leading-normal tracking-[0.015em]">Поездки</p>
</a>
<a className="flex flex-1 flex-col items-center justify-end gap-1 text-on-surface-variant" href="#">
<div className="flex h-8 items-center justify-center">
<span className="material-symbols-outlined">verified_user</span>
</div>
<p className="text-xs font-medium leading-normal tracking-[0.015em]">Профиль</p>
</a>
</div>

<div className="absolute inset-0 bg-black/60 z-20 flex flex-col justify-end">

<div className="bg-surface-container-high rounded-t-2xl px-6 pt-2 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-outline-variant/10">

<div className="flex w-full justify-center py-3">
<div className="h-1.5 w-12 rounded-full bg-outline-variant/30"></div>
</div>

<div className="mt-2 mb-6">
<h3 className="font-headline text-xl font-bold text-on-surface">Новое предложение</h3>
</div>

<div className="flex items-center gap-4 mb-8">
<div className="size-16 rounded-full overflow-hidden border-2 border-primary/20 bg-surface">
  <img src="/avatars/avatar (1).svg" alt="Driver" className="w-full h-full object-cover" />
</div>
<div className="flex flex-col flex-1">
<div className="flex items-center justify-between">
<p className="text-lg font-headline font-bold text-on-surface">Александр</p>
<div className="flex items-center gap-1 bg-surface-container-highest px-2 py-0.5 rounded-lg">
<span className="material-symbols-outlined text-primary text-[16px]" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
<span className="text-sm font-bold text-on-surface">5.0</span>
</div>
</div>
<p className="text-on-surface-variant text-sm font-medium">Toyota Camry, Черный</p>
</div>
</div>

<div className="flex flex-col items-center justify-center py-6 mb-8 bg-surface-container-low rounded-2xl border border-outline-variant/5">
<span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-1">Стоимость поездки</span>
<div className="flex items-baseline gap-1">
<span className="font-headline text-5xl font-extrabold text-on-surface tracking-tighter">350</span>
<span className="font-headline text-2xl font-bold text-primary">₽</span>
</div>
</div>

<div className="flex gap-4">
<button className="flex-1 py-4 px-6 rounded-full border border-outline-variant text-on-surface font-bold text-base transition-colors hover:bg-surface-container-highest">
                        Отказать
                    </button>
<button className="flex-1 py-4 px-6 rounded-full crimson-gradient text-on-primary font-headline font-extrabold text-base shadow-[0_10px_20px_rgba(255,85,64,0.3)]">
                        Согласиться
                    </button>
</div>
</div>
</div>
</div>

    </main>
  );
}
