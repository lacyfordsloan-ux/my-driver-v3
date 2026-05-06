import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { data: cities, error } = await supabase
    .from('settlements')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch cities:', error);
  }

  const citiesList = cities || [];

  return (
    <main className="min-h-screen flex flex-col">
      
<aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-[#1C1B1B] flex flex-col py-6 border-r border-[#603E39]/15 z-50">
<div className="px-6 mb-8">
<h1 className="text-lg font-black text-[#FFB4A8] leading-none">Админ-панель</h1>
<p className="text-xs text-[#E5E2E1]/40 mt-1 uppercase tracking-widest font-headline">Управление флотом</p>
</div>
<nav className="flex-1 space-y-1">
<a className="flex items-center gap-3 px-6 py-3 text-[#E5E2E1]/60 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all cursor-pointer" href="#">
<span className="material-symbols-outlined text-xl">dashboard</span>
<span className="font-headline text-sm font-medium">Дашборд</span>
</a>

<a className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#FFB4A8]/10 to-transparent text-[#FFB4A8] border-r-2 border-[#FFB4A8] cursor-pointer" href="#">
<span className="material-symbols-outlined text-xl" style={{"fontVariationSettings": "'FILL' 1"}}>location_city</span>
<span className="font-headline text-sm font-medium">Города</span>
</a>
<a className="flex items-center gap-3 px-6 py-3 text-[#E5E2E1]/60 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all cursor-pointer" href="#">
<span className="material-symbols-outlined text-xl">group</span>
<span className="font-headline text-sm font-medium">Пользователи</span>
</a>
<a className="flex items-center gap-3 px-6 py-3 text-[#E5E2E1]/60 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all cursor-pointer" href="#">
<span className="material-symbols-outlined text-xl">directions_car</span>
<span className="font-headline text-sm font-medium">Водители</span>
</a>
<a className="flex items-center gap-3 px-6 py-3 text-[#E5E2E1]/60 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all cursor-pointer" href="#">
<span className="material-symbols-outlined text-xl">payments</span>
<span className="font-headline text-sm font-medium">Тарифы</span>
</a>
<a className="flex items-center gap-3 px-6 py-3 text-[#E5E2E1]/60 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all cursor-pointer" href="#">
<span className="material-symbols-outlined text-xl">description</span>
<span className="font-headline text-sm font-medium">Юр. документы</span>
</a>
<a className="flex items-center gap-3 px-6 py-3 text-[#E5E2E1]/60 hover:bg-[#2A2A2A] hover:text-[#E5E2E1] transition-all cursor-pointer" href="#">
<span className="material-symbols-outlined text-xl">support_agent</span>
<span className="font-headline text-sm font-medium">Поддержка</span>
</a>
</nav>
<div className="mt-auto px-6">
<button className="flex items-center gap-3 w-full py-3 text-[#E5E2E1]/60 hover:text-error transition-colors">
<span className="material-symbols-outlined text-xl">logout</span>
<span className="font-headline text-sm font-medium">Выйти</span>
</button>
</div>
</aside>

<header className="w-full h-16 sticky top-0 z-40 bg-[#131313] flex items-center justify-between px-6 pl-72 shadow-[0px_10px_30px_rgba(0,0,0,0.5)]">
<div className="flex items-center gap-4 bg-[#1C1B1B] px-4 py-2 rounded-full w-96 border border-[#603E39]/10">
<span className="material-symbols-outlined text-[#E5E2E1]/40">search</span>
<input className="bg-transparent border-none focus:ring-0 text-sm text-[#E5E2E1] w-full placeholder-[#E5E2E1]/20" placeholder="Поиск по системе..." type="text"/>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-2">
<button className="p-2 rounded-full text-[#E5E2E1]/60 hover:bg-[#2A2A2A] transition-colors relative">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-[#FF5540] rounded-full border-2 border-[#131313]"></span>
</button>
<button className="p-2 rounded-full text-[#E5E2E1]/60 hover:bg-[#2A2A2A] transition-colors">
<span className="material-symbols-outlined">settings</span>
</button>
</div>
<div className="h-8 w-px bg-[#603E39]/20 mx-2"></div>
<div className="flex items-center gap-3 hover:bg-[#2A2A2A] p-1.5 pr-4 rounded-full transition-all cursor-pointer">
<img alt="Administrator Profile Avatar" className="w-8 h-8 rounded-full border border-[#FFB4A8]/30" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP097gRjg41_TnYDp0rkRLJiXpwPsmpUeGsfrx-hvUqBWpzHsm9W3czqFRlUCVGXNs8_1JLhqNh1SXrS5DMaM55QRTnRLykumVyzrjT64u0E8O1A40Xf93bUdTxle2xqqA8c9RAJAJEQu-U-U1RcuWygR7HXD9QnSac-cKM_m2fFQ2vGQGoo0r6LjvnabF2UjswqpMp32Tv6i5vlIFqNxu4xk0Xj4Xstoos4Fl6HZObbQbJJJpIGQlJ36K_jcGiX-LrqYMd5HyRcA"/>
<span className="font-headline font-bold text-sm text-[#FFB4A8]">Profile</span>
</div>
</div>
</header>

<main className="ml-64 p-8 min-h-screen">

<div className="flex justify-between items-end mb-10">
<div>
<nav className="flex text-xs font-headline font-medium text-[#E5E2E1]/30 mb-2 gap-2">
<span>Система</span>
<span>/</span>
<span className="text-[#FFB4A8]">Города</span>
</nav>
<h2 className="text-4xl font-headline font-extrabold tracking-tighter text-[#E5E2E1]">География сервиса</h2>
<p className="text-[#E5E2E1]/50 mt-1">Управление доступными регионами и мониторинг активности флота</p>
</div>
<button className="bg-[#FF0000] hover:bg-[#D40000] text-white px-8 py-3.5 rounded-full font-headline font-bold text-sm uppercase tracking-wider flex items-center gap-3 transition-all active:scale-95 shadow-[0px_10px_25px_rgba(255,0,0,0.3)]">
<span className="material-symbols-outlined">add_circle</span>
                Добавить город
            </button>
</div>

<div className="bg-[#1C1B1B] rounded-3xl overflow-hidden shadow-2xl border border-[#603E39]/10">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-[#181818] border-b border-[#603E39]/20">
<th className="px-8 py-5 font-headline font-bold text-[#E5E2E1]/40 text-xs uppercase tracking-widest">Название города</th>
<th className="px-8 py-5 font-headline font-bold text-[#E5E2E1]/40 text-xs uppercase tracking-widest">Регион</th>
<th className="px-8 py-5 font-headline font-bold text-[#E5E2E1]/40 text-xs uppercase tracking-widest">Статус</th>
<th className="px-8 py-5 font-headline font-bold text-[#E5E2E1]/40 text-xs uppercase tracking-widest text-center">Водители</th>
<th className="px-8 py-5 font-headline font-bold text-[#E5E2E1]/40 text-xs uppercase tracking-widest text-right">Действия</th>
</tr>
</thead>
<tbody className="divide-y divide-[#603E39]/10">

{citiesList.map((city: any) => {
  const parts = city.name.split(', ');
  const cityName = parts[0];
  const region = parts.length > 1 ? parts.slice(1).join(', ') : 'Не указан';

  return (
    <tr key={city.id} className="bg-[#212121] hover:bg-[#2A2A2A] transition-colors group">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#131313] flex items-center justify-center border border-[#603E39]/20">
            <span className={`material-symbols-outlined ${city.is_active ? 'text-[#FFB4A8]' : 'text-[#E5E2E1]/20'}`}>
              {city.is_active ? 'location_city' : 'pending'}
            </span>
          </div>
          <span className="font-headline font-bold text-[#E5E2E1]">{cityName}</span>
        </div>
      </td>
      <td className="px-8 py-6 text-[#E5E2E1]/60 font-medium">{region}</td>
      <td className="px-8 py-6">
        {city.is_active ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB4A8]/10 text-[#FFB4A8] text-[10px] font-black uppercase tracking-tighter border border-[#FFB4A8]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB4A8] animate-pulse"></span>
            Активен
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5E2E1]/5 text-[#E5E2E1]/40 text-[10px] font-black uppercase tracking-tighter border border-[#E5E2E1]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5E2E1]/20"></span>
            Скоро
          </span>
        )}
      </td>
      <td className="px-8 py-6 text-center font-headline font-black text-[#E5E2E1]">{city.is_active ? Math.floor(Math.random() * 500) : 0}</td>
      <td className="px-8 py-6 text-right">
        <div className="flex justify-end gap-2">
          <button className="p-2 rounded-lg bg-[#131313] text-[#E5E2E1]/40 hover:text-[#FFB4A8] hover:bg-[#FFB4A8]/10 transition-all">
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button className="p-2 rounded-lg bg-[#131313] text-[#E5E2E1]/40 hover:text-error hover:bg-error/10 transition-all">
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
})}

</tbody>
</table>

<div className="bg-[#181818] px-8 py-4 flex items-center justify-between">
<span className="text-xs font-headline text-[#E5E2E1]/30">Показано {citiesList.length} из {citiesList.length} городов</span>
<div className="flex gap-2">
<button className="w-8 h-8 flex items-center justify-center rounded bg-[#131313] border border-[#603E39]/10 text-[#E5E2E1]/40 cursor-not-allowed">
<span className="material-symbols-outlined text-sm">chevron_left</span>
</button>
<button className="w-8 h-8 flex items-center justify-center rounded bg-[#FFB4A8] text-[#690100] font-headline font-bold text-xs">1</button>
<button className="w-8 h-8 flex items-center justify-center rounded bg-[#131313] border border-[#603E39]/10 text-[#E5E2E1]/60 hover:bg-[#2A2A2A] transition-colors">
<span className="material-symbols-outlined text-sm">chevron_right</span>
</button>
</div>
</div>
</div>

<div className="mt-8 grid grid-cols-12 gap-6">
<div className="col-span-12 lg:col-span-8 bg-[#1C1B1B] p-8 rounded-3xl border border-[#603E39]/10 relative overflow-hidden">
<div className="relative z-10">
<h3 className="font-headline font-bold text-[#E5E2E1] text-lg mb-6">Распределение флота по регионам</h3>
<div className="flex items-end gap-4 h-32">
<div className="flex-1 bg-[#FFB4A8]/20 rounded-t-lg relative" style={{"height": "100%"}}>
<div className="absolute inset-0 bg-gradient-to-t from-[#FFB4A8] to-transparent opacity-40 rounded-t-lg"></div>
</div>
<div className="flex-1 bg-[#FFB4A8]/20 rounded-t-lg relative" style={{"height": "65%"}}></div>
<div className="flex-1 bg-[#FFB4A8]/20 rounded-t-lg relative" style={{"height": "40%"}}></div>
<div className="flex-1 bg-[#FFB4A8]/20 rounded-t-lg relative" style={{"height": "85%"}}></div>
<div className="flex-1 bg-[#FFB4A8]/20 rounded-t-lg relative" style={{"height": "20%"}}></div>
<div className="flex-1 bg-[#FFB4A8]/20 rounded-t-lg relative" style={{"height": "55%"}}></div>
</div>
<div className="flex justify-between mt-4 text-[10px] font-headline font-black text-[#E5E2E1]/20 uppercase tracking-widest">
<span>Центр</span>
<span>С-Запад</span>
<span>Приволж</span>
<span>Урал</span>
<span>Сибирь</span>
<span>Юг</span>
</div>
</div>
<div className="absolute top-0 right-0 w-64 h-64 bg-[#FFB4A8]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
</div>
<div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-[#FF5540] to-[#690100] p-8 rounded-3xl flex flex-col justify-between">
<div>
<span className="text-white/60 font-headline font-bold text-xs uppercase tracking-widest">Статус Сети</span>
<h3 className="text-white font-headline font-black text-3xl mt-2 leading-tight">Система работает стабильно</h3>
</div>
<div className="mt-8 flex items-center gap-4">
<div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
<span className="material-symbols-outlined text-white" style={{"fontVariationSettings": "'FILL' 1"}}>speed</span>
</div>
<div>
<p className="text-white/70 text-xs font-medium">Время отклика</p>
<p className="text-white font-headline font-bold">120мс</p>
</div>
</div>
</div>
</div>
</main>

    </main>
  );
}
