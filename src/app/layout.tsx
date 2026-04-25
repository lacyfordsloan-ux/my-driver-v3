import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { NavigationDrawer } from "@/components/NavigationDrawer";
import { ClientOnly } from "@/components/ClientOnly";
import { GlobalPulseButton } from "@/components/GlobalPulseButton";
import { ReviewChecker } from "@/components/ReviewChecker";
import Script from 'next/script';

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Мой Водитель",
  description: "Премиальный сервис заказа поездок",
  manifest: "/manifest.json?v=17",
  icons: {
    icon: [
      { url: "/apple-icon.svg?v=17", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg?v=17", type: "image/svg+xml" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Мой Водитель",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0A0A0A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${inter.variable}`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        
        {/* Simplified Unified Icon Strategy (v17) */}
        <link rel="icon" type="image/svg+xml" href="/apple-icon.svg?v=17" />
        <link rel="apple-touch-icon" href="/apple-icon.svg?v=17" />

        {/* Preload Splash Assets */}
        <link rel="preload" href="/Дома.png" as="image" />
        <link rel="preload" href="/Машина.png" as="image" />
        <link rel="preload" href="/Логотип.png" as="image" />
        <link rel="preload" href="/apple-icon.svg?v=17" as="image" />
        
        <style dangerouslySetInnerHTML={{ __html: `
          .material-symbols-outlined {
            opacity: 0;
            transition: opacity 0.2s ease;
          }
          .icons-loaded .material-symbols-outlined {
            opacity: 1;
          }
        `}} />
      </head>
      <body
        className="bg-[#0A0A0A] text-white selection:bg-primary/30 font-inter"
      >
        <div className="app-shell">
          <ClientOnly>
            <NavigationDrawer />
            <GlobalPulseButton />
            <ReviewChecker />
          </ClientOnly>
          <div className="app-content">
            {children}
          </div>
        </div>

        {/* PWA Activation & Font Flash Prevention (v17) - Use Next/Script outside head */}
        <Script id="pwa-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
          // Detect Material Symbols load
          if ('fonts' in document) {
            document.fonts.load('1em "Material Symbols Outlined"').then(() => {
              document.documentElement.classList.add('icons-loaded');
            });
          } else {
            document.documentElement.classList.add('icons-loaded');
          }

          // Ensure Service Worker is active for PWA Icons
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js?v=17').then(reg => {
                console.log('SW active for PWA icons (v17)');
                if (!localStorage.getItem('pwa-v17-ready')) {
                  localStorage.setItem('pwa-v17-ready', 'true');
                  window.location.reload();
                }
              });
            });
          }
        `}} />
      </body>
    </html>
  );
}
