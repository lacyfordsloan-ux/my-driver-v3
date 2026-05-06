import crypto from 'crypto';

/**
 * Проверяет подпись параметров запуска VK Mini App.
 * @param searchParams Объект URLSearchParams с параметрами из URL.
 * @param secretKey Защищенный ключ вашего приложения VK.
 * @returns true, если подпись верна.
 */
export function verifyLaunchParams(searchParams: URLSearchParams, secretKey: string): boolean {
  const params: { key: string; value: string }[] = [];
  
  searchParams.forEach((value, key) => {
    if (key.startsWith('vk_')) {
      params.push({ key, value });
    }
  });

  const sign = searchParams.get('sign');
  if (!sign) return false;

  // 1. Сортируем параметры по ключу
  const queryString = params
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ key, value }) => `${key}=${value}`)
    .join('&');

  // 2. Вычисляем HMAC-SHA256
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(queryString)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=$/, '');

  return hash === sign;
}
