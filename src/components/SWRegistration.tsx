'use client';

import { useEffect } from 'react';

/**
 * Handles Service Worker registration and aggressive cleanup of stale workers.
 * Stale Service Workers are a common cause of "hydration hang" on mobile browsers.
 */
export function SWRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Hard Cleanup: Unregister any existing service workers that might be causing cache issues
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(success => {
          if (success) console.log('[SW] Unregistered stale worker:', registration.scope);
        });
      }
    }).catch(err => {
      console.warn('[SW] Cleanup error (safe to ignore):', err);
    });
  }, []);

  return null;
}
