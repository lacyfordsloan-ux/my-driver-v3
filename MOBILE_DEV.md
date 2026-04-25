# 📱 Руководство: Запуск на мобильном устройстве

Этот файл описывает известные проблемы при тестировании на мобильном устройстве через локальную сеть и их решения.

---

## Симптомы проблемы

На мобильном устройстве при открытии `http://192.168.x.x:3000`:

- Загрузочный экран зависает на 0% и не двигается
- Кнопки не реагируют на нажатие
- На странице `/js-test.html` видно: **"Next.js chunk FAILED to load ✗"**
- В браузере на ПК всё работает нормально

---

## Причина

**Next.js 16+** блокирует кросс-доменные запросы к ресурсам `/_next/static/chunks/*` по умолчанию в целях безопасности.

Когда телефон подключается через IP локальной сети (например, `192.168.0.105`), Next.js считает запрос "кросс-доменным" и блокирует загрузку JavaScript-чанков. React не может инициализироваться — приложение зависает.

В консоли сервера (`npm run dev`) можно увидеть:
```
⚠ Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr from "192.168.0.105".
```

---

## Решение (уже применено)

В `next.config.ts` используется автоматическое определение IP:

```ts
import os from "os";

function getLocalNetworkOrigins(): string[] {
  const origins: string[] = [];
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;
    for (const config of iface) {
      if (config.family === "IPv4" && !config.internal) {
        origins.push(config.address);
      }
    }
  }
  return origins;
}

const nextConfig = {
  allowedDevOrigins: getLocalNetworkOrigins(),
};
```

Это решение **постоянное**: IP определяется автоматически при каждом старте сервера, поэтому даже если роутер выдаст новый IP после перезагрузки — всё будет работать.

---

## Если проблема вернулась

### Шаг 1: Убедись что `next.config.ts` содержит `allowedDevOrigins`

Открой `next.config.ts` и проверь что там есть вызов `getLocalNetworkOrigins()`. Если файл был случайно перезаписан — воспроизведи код выше.

### Шаг 2: Перезапусти сервер

Изменения в `next.config.ts` **не применяются через hot reload**. Нужен полный перезапуск:

```bash
# Остановить сервер: Ctrl+C
# Запустить заново:
npm run dev
```

### Шаг 3: Проверь логи запуска сервера

При старте сервер должен выводить:
```
[next.config] Allowing dev origin: 192.168.x.x
```

Если этой строки нет — проблема в `next.config.ts`.

### Шаг 4: Проверь подключение телефона

Убедись что телефон и компьютер **в одной Wi-Fi сети**. Определи актуальный IP:

```powershell
ipconfig
# Ищи: "IPv4-адрес" в разделе Wi-Fi или Ethernet
```

Открой на телефоне: `http://<IP>:3000`

### Шаг 5: Диагностическая страница

Открой на телефоне: `http://<IP>:3000/js-test.html`

- ✅ `Next.js chunk loaded ✓` — всё работает
- ❌ `Next.js chunk FAILED to load ✗` — проблема с `allowedDevOrigins` (вернись к Шагу 1)

---

## Другие известные причины зависания на мобильных

| Симптом | Причина | Исправление |
|---|---|---|
| Chunk FAILED to load | `allowedDevOrigins` не настроен | Шаги выше |
| 0% и кнопки мертвы, chunk OK | `alert()` в `<head>` блокирует JS | Убрать `dangerouslySetInnerHTML` с `alert()` из `layout.tsx` |
| Зависание через SW | Старый Service Worker с `client.navigate()` | Обновить `public/sw.js` (убрать `client.navigate`) |
| Всё виснет только после перезагрузки ПК | SW кэш на телефоне | Очистить кэш сайта в браузере телефона |
| **Скролл не работает (Chrome)** | Конфликт `overscroll-behavior: none` | См. раздел ниже |

---

## Проблемы со скроллом (Chrome Mobile)

Если на телефоне в браузере Chrome не работает скролл (нельзя пролистать вниз), это обычно вызвано комбинацией CSS свойств на корневых элементах.

### Как исправлено:
1. **`globals.css`**: Изменено `overscroll-behavior: none` на `overscroll-behavior-y: auto`.
2. **`layout.tsx`**: Удален класс `overscroll-none` с тега `body`.
3. **`html` tag**: Добавлен атрибут `data-scroll-behavior="smooth"`.

Если проблема вернется, убедитесь, что на тегах `html` или `body` нет `overflow: hidden` или `overscroll-behavior: none`, так как Chrome Mobile может "залипать" при касании, если считает что прокрутка запрещена на уровне всей страницы.

---

## Локальный адрес для телефона

Текущий IP компьютера (может измениться после перезагрузки роутера):

```
http://192.168.0.105:3000
```

Для проверки актуального IP выполни `ipconfig` в PowerShell.
