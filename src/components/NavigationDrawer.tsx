'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const NavigationDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<'passenger' | 'driver' | null>(null);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync theme with localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
    } else {
      setIsDarkMode(true);
      // Ensure it's set if empty
      if (!savedTheme) localStorage.setItem('app-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('app-theme', newMode ? 'dark' : 'light');
  };

  // Sync state with localStorage
  useEffect(() => {
    const sync = () => {
      const registered = localStorage.getItem('user-registered') === 'true';
      setIsRegistered(registered);
      
      const savedRole = (sessionStorage.getItem('tab-role') || localStorage.getItem('app-role')) as 'passenger' | 'driver';
      setRole(savedRole || 'passenger');

      const savedAvatar = localStorage.getItem('user-avatar');
      setAvatarId(savedAvatar);
    };
    
    sync();
    window.addEventListener('storage', sync);
    const interval = setInterval(sync, 500); // Fast interval for cross-page role selection
    
    return () => {
      window.removeEventListener('storage', sync);
      clearInterval(interval);
    };
  }, []);

  // Detect desktop vs mobile
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Close drawer on path change (mobile only)
  useEffect(() => {
    if (!isDesktop) setIsOpen(false);
  }, [pathname, isDesktop]);

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen && !isDesktop) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    return () => document.body.classList.remove('drawer-open');
  }, [isOpen, isDesktop]);

  // Listen for custom toggle event (mobile menu button)
  useEffect(() => {
    const handleToggle = () => {
      if (!isDesktop) setIsOpen(prev => !prev);
    };
    window.addEventListener('toggle-nav-drawer', handleToggle);
    return () => window.removeEventListener('toggle-nav-drawer', handleToggle);
  }, [isDesktop]);

  // Sync drawer state with localStorage for other components to react
  useEffect(() => {
    localStorage.setItem('app-drawer-open', isOpen ? 'true' : 'false');
    window.dispatchEvent(new Event('storage'));
  }, [isOpen]);

  // Hide drawer entirely if not registered, on splash screen, or on role selection screen
  if (!isRegistered || pathname === '/' || pathname === '/role-selection') return null;

  const navItems = role === 'driver' 
    ? [
        { icon: 'person', label: 'Профиль', href: '/profile-settings' },
        { icon: 'campaign', label: 'Объявления', href: '/driver/requests' },
        { icon: 'assignment', label: 'Анкета', href: '/driver/questionnaire' },
        { icon: 'payments', label: 'Подписка', href: '/driver/subscription' },
        { icon: 'history', label: 'История', href: '/history' },
        { icon: 'settings', label: 'Настройки', href: '/settings' },
        { icon: 'support_agent', label: 'Служба поддержки', href: '/support' },
      ]
    : [
        { icon: 'person', label: 'Профиль', href: '/profile-settings' },
        { icon: 'campaign', label: 'Объявления', href: '/passenger/home' },
        { icon: 'history', label: 'История', href: '/history' },
        { icon: 'settings', label: 'Настройки', href: '/settings' },
        { icon: 'support_agent', label: 'Служба поддержки', href: '/support' },
      ];

  // ── Desktop static sidebar ──
  if (isDesktop) {
    return (
      <aside style={{
        width: '340px',
        minWidth: '340px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'var(--surface, #131313)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        padding: '2.5rem 1.5rem',
        overflowY: 'auto',
      }}>
        {/* Logo Section (Desktop) */}
        <div style={{ 
          marginBottom: '1.5rem', 
          paddingLeft: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-manrope, sans-serif)',
            fontWeight: 900,
            fontSize: '2.1rem',
            color: '#FFFFFF',
            letterSpacing: '-0.06em',
            lineHeight: 1,
            marginBottom: '0rem',
            flex: 1,
            whiteSpace: 'nowrap'
          }}>
            Мой Водитель
          </h2>

          {/* Theme Toggle Slider */}
          <button 
            onClick={toggleTheme}
            style={{
              position: 'relative',
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              background: isDarkMode ? 'rgba(255,180,168,0.15)' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,180,168,0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isDarkMode ? '0 0 15px rgba(255,180,168,0.1)' : 'none',
              flexShrink: 0
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: isDarkMode ? '#FFB4A8' : 'rgba(255,255,255,0.4)',
              transform: isDarkMode ? 'translateX(20px)' : 'translateX(0)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isDarkMode ? '0 0 10px rgba(255,180,168,0.5)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <span className="material-symbols-outlined" style={{ 
                fontSize: '10px', 
                color: isDarkMode ? '#131313' : 'white',
                fontWeight: 900
              }}>
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
            </div>
          </button>
        </div>

        {/* Role Indicator Frame (Top moved up) */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.875rem',
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: '1.25rem',
          background: 'linear-gradient(135deg, rgba(255,180,168,0.1) 0%, rgba(255,180,168,0.03) 100%)',
          border: '1px solid rgba(255,180,168,0.25)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative glow */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,180,168,0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{
            width: '2.5rem', height: '2.5rem', borderRadius: '50%',
            background: 'rgba(255,180,168,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFB4A8',
            border: '1px solid rgba(255,180,168,0.3)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            position: 'relative',
            zIndex: 1,
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {avatarId ? (
              <img 
                src={`/avatars/${avatarId}${avatarId.includes('.svg') ? '' : '.svg'}`} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', fontVariationSettings: '"FILL" 1' }}>
                {role === 'driver' ? 'directions_car' : 'person'}
              </span>
            )}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0rem',
            position: 'relative',
            zIndex: 1,
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <span style={{
              fontFamily: 'var(--font-manrope, sans-serif)',
              fontWeight: 900,
              fontSize: '1.1rem',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}>
              Роль
            </span>
            <span style={{
              fontFamily: 'var(--font-manrope, sans-serif)',
              fontWeight: 900,
              fontSize: '1.4rem',
              color: '#FFB4A8',
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
              lineHeight: 1,
              filter: 'drop-shadow(0 0 15px rgba(255,180,168,0.4))'
            }}>
              {role === 'driver' ? 'Водитель' : 'Пассажир'}
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.625rem 1rem',
                  borderRadius: '0.875rem',
                  border: active ? '1px solid rgba(255,180,168,0.2)' : '1px solid transparent',
                  background: active ? 'rgba(255,180,168,0.1)' : 'transparent',
                  color: active ? '#FFB4A8' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                <span style={{ fontFamily: 'var(--font-manrope, sans-serif)', fontWeight: 600, fontSize: '0.875rem' }}>
                  {item.label}
                </span>
                {active && (
                  <span style={{
                    marginLeft: 'auto', width: '6px', height: '6px',
                    borderRadius: '50%', background: '#FFB4A8',
                    boxShadow: '0 0 8px rgba(255,180,168,0.5)', flexShrink: 0,
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => router.push('/role-selection')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.875rem 1rem',
              borderRadius: '0.875rem',
              border: '1px solid rgba(255,180,168,0.1)',
              background: 'rgba(255,180,168,0.05)',
              color: '#FFB4A8',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              marginBottom: '0.5rem',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>app_registration</span>
            <span style={{ fontFamily: 'var(--font-manrope, sans-serif)', fontWeight: 600, fontSize: '0.9rem' }}>
              Сменить роль
            </span>
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('user-registered');
              localStorage.removeItem('app-role');
              // Optionally keep user-data for "log back in" as requested later
              window.location.href = '/';
            }}
            style={{
              width: '100%', padding: '0.875rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              color: 'rgba(255,80,80,0.5)',
              background: 'transparent', border: 'none',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              transition: 'color 0.15s ease',
              borderRadius: '0.875rem',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,80,80,0.8)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,80,80,0.5)'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>logout</span>
            <span style={{ fontFamily: 'var(--font-manrope, sans-serif)', fontWeight: 600, fontSize: '0.875rem' }}>
              Выйти
            </span>
          </button>
        </div>
      </aside>
    );
  }

  // ── Mobile sliding drawer ──
  if (pathname === '/') return null;
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100dvh',
          width: '80%',
          maxWidth: '320px',
          background: 'var(--surface, #131313)',
          zIndex: 2001,
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
          overflow: 'hidden',
          overscrollBehavior: 'contain',
        }}
      >
        {/* Header Section (Mobile) */}
        <div style={{ 
          marginBottom: '1rem', 
          paddingLeft: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-manrope, sans-serif)',
            fontWeight: 900,
            fontSize: '1.65rem',
            color: '#FFFFFF',
            letterSpacing: '-0.05em',
            lineHeight: 1,
            marginBottom: '0rem',
            flex: 1,
            whiteSpace: 'nowrap'
          }}>
            Мой Водитель
          </h2>

          {/* Theme Toggle Slider (Mobile) */}
          <button 
            onClick={toggleTheme}
            style={{
              position: 'relative',
              width: '40px',
              height: '22px',
              borderRadius: '11px',
              background: isDarkMode ? 'rgba(255,180,168,0.15)' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,180,168,0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0 3px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isDarkMode ? '0 0 12px rgba(255,180,168,0.1)' : 'none',
              flexShrink: 0
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: isDarkMode ? '#FFB4A8' : 'rgba(255,255,255,0.4)',
              transform: isDarkMode ? 'translateX(18px)' : 'translateX(0)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isDarkMode ? '0 0 8px rgba(255,180,168,0.5)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <span className="material-symbols-outlined" style={{ 
                fontSize: '10px', 
                color: isDarkMode ? '#131313' : 'white',
                fontWeight: 900
              }}>
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
            </div>
          </button>
        </div>

        {/* Role Indicator Frame (Top moved up) */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.875rem',
          marginBottom: '1rem',
          padding: '0.625rem 1rem',
          borderRadius: '1.25rem',
          background: 'linear-gradient(135deg, rgba(255,180,168,0.1) 0%, rgba(255,180,168,0.03) 100%)',
          border: '1px solid rgba(255,180,168,0.25)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {/* Decorative glow */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,180,168,0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{
            width: '2.5rem', height: '2.5rem', borderRadius: '50%',
            background: 'rgba(255,180,168,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFB4A8',
            border: '1px solid rgba(255,180,168,0.3)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            position: 'relative',
            zIndex: 1,
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {avatarId ? (
              <img 
                src={`/avatars/${avatarId}${avatarId.includes('.svg') ? '' : '.svg'}`} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', fontVariationSettings: '"FILL" 1' }}>
                {role === 'driver' ? 'directions_car' : 'person'}
              </span>
            )}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0rem',
            position: 'relative',
            zIndex: 1,
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <span style={{
              fontFamily: 'var(--font-manrope, sans-serif)',
              fontWeight: 900,
              fontSize: '1rem',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
              lineHeight: 1
            }}>
              Роль
            </span>
            <span style={{
              fontFamily: 'var(--font-manrope, sans-serif)',
              fontWeight: 900,
              fontSize: '1.25rem',
              color: '#FFB4A8',
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
              lineHeight: 1,
              filter: 'drop-shadow(0 0 12px rgba(255,180,168,0.4))'
            }}>
              {role === 'driver' ? 'Водитель' : 'Пассажир'}
            </span>
          </div>
        </div>

        {/* Nav items - Scrollable */}
        <nav style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.125rem',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingRight: '0.25rem', // Space for potential scrollbar
          marginRight: '-0.25rem',
        }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.625rem 1rem',
                  borderRadius: '1rem',
                  border: active ? '1px solid rgba(255,180,168,0.2)' : '1px solid transparent',
                  background: active ? 'rgba(255,180,168,0.1)' : 'transparent',
                  color: active ? '#FFB4A8' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  WebkitTapHighlightColor: 'transparent',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span style={{ fontFamily: 'var(--font-manrope, sans-serif)', fontWeight: 600, fontSize: '0.875rem' }}>
                  {item.label}
                </span>
                {active && (
                  <span style={{
                    marginLeft: 'auto', width: '6px', height: '6px',
                    borderRadius: '50%', background: '#FFB4A8',
                    boxShadow: '0 0 8px rgba(255,180,168,0.5)'
                  }} />
                )}
              </button>
            );
          })}
        </nav>
 
        {/* Footer - Non-scrollable */}
        <div style={{ 
          paddingTop: '0.75rem', 
          marginTop: '0.75rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
          paddingBottom: 'var(--sab, 0px)' // Handle safe area bottom
        }}>
          <button
            onClick={() => {
              setIsOpen(false);
              router.push('/role-selection');
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255,180,168,0.15)',
              background: 'rgba(255,180,168,0.08)',
              color: '#FFB4A8',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              marginBottom: '0.5rem',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span className="material-symbols-outlined">app_registration</span>
            <span style={{ fontFamily: 'var(--font-manrope, sans-serif)', fontWeight: 600, fontSize: '0.875rem' }}>
              Сменить роль
            </span>
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('user-registered');
              localStorage.removeItem('app-role');
              window.location.href = '/';
            }}
            style={{
              width: '100%', padding: '1rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
              color: 'rgba(255,80,80,0.5)',
              background: 'transparent', border: 'none',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              transition: 'color 0.15s ease',
            }}
          >
            <span className="material-symbols-outlined">logout</span>
            <span style={{ fontFamily: 'var(--font-manrope, sans-serif)', fontWeight: 600, fontSize: '0.875rem' }}>
              Выйти
            </span>
          </button>
        </div>
      </div>
    </>
  );
};
