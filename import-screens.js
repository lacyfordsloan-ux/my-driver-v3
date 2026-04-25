import fs from 'fs';
import path from 'path';

const listFile = 'C:/Users/user/.gemini/antigravity/brain/b33f1cf4-99eb-477e-8e90-a27797489804/.system_generated/steps/22/output.txt';
const data = JSON.parse(fs.readFileSync(listFile, 'utf8'));

const routeMap = {
  "Экран загрузки (Обновленный)": "/",
  "Выбор роли": "/role-selection",
  "Регистрация и онбординг": "/onboarding",
  "Подтверждение по SMS": "/sms-confirmation",
  "Главная (Пассажир)": "/passenger/home",
  "Создание заявки (Ищу водителя)": "/passenger/create-request",
  "Предложение цены от водителя": "/passenger/offers",
  "Активная поездка": "/active-ride",
  "Чат с водителем": "/chat",
  "Оценка поездки": "/rating",
  "Доступные заявки (Водитель)": "/driver/requests",
  "Подписка водителя": "/driver/subscription",
  "Настройки профиля (Исправленный цвет)": "/profile-settings",
  "Панель администратора: Города": "/admin/cities",
  "Ошибка подключения": "/error"
};

async function processScreens() {
  for (const screen of data.screens) {
    const title = screen.title;
    const route = routeMap[title];
    if (!route) {
      console.log(`No route mapped for ${title}`);
      continue;
    }
    
    if (!screen.htmlCode || !screen.htmlCode.downloadUrl) {
        console.log(`No html url for ${title}`);
        continue;
    }

    try {
      console.log(`Fetching ${title} for route ${route}...`);
      const response = await fetch(screen.htmlCode.downloadUrl);
      if (!response.ok) {
          console.error(`Failed to fetch ${title}: HTTP ${response.status}`);
          continue;
      }
      let html = await response.text();
      
      // JSX conversions
      html = html.replace(/class=/g, 'className=')
                 .replace(/for=/g, 'htmlFor=')
                 .replace(/<!--.*?-->/g, '')
                 .replace(/<img(.*?)>/g, (match, attrs) => {
                    if(attrs.endsWith('/')) return `<img${attrs}>`;
                    return `<img${attrs}/>`;
                 })
                 .replace(/<input(.*?)>/g, (match, attrs) => {
                    if(attrs.endsWith('/')) return `<input${attrs}>`;
                    return `<input${attrs}/>`;
                 })
                 .replace(/<br(.*?)>/g, '<br/>')
                 .replace(/<hr(.*?)>/g, '<hr/>');
                 
      html = html.replace(/style="([^"]*)"/g, (match, val) => {
         if(!val.trim()) return `style={{}}`;
         const styleObj = val.split(';').filter(Boolean).map(s => {
             const parts = s.split(':');
             if(parts.length < 2) return '';
             const key = parts[0].trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
             return `"${key}": "${parts.slice(1).join(':').trim().replace(/"/g, "'")}"`;
         }).filter(Boolean).join(', ');
         return `style={{${styleObj}}}`;
      });
      
      const componentCode = `export default function Page() {\n  return (\n    <main className="min-h-screen flex flex-col">\n      ${html}\n    </main>\n  );\n}\n`;
      
      const targetDir = path.join('src/app', route === '/' ? '' : route);
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, 'page.tsx'), componentCode);
      console.log(`Created component for ${title} at ${targetDir}/page.tsx`);
      
    } catch(err) {
      console.error(`Error processing ${title}:`, err);
    }
  }
}

processScreens();
