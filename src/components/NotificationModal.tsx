'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info'
}) => {
  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning'
  };

  const colors = {
    success: 'text-primary bg-primary/10 border-primary/20',
    error: 'text-red-500 bg-red-500/10 border-red-500/20',
    info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    warning: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
  };

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem('global-modal-active', 'true');
      document.body.classList.add('drawer-open');
      window.dispatchEvent(new Event('storage'));
    } else {
      localStorage.removeItem('global-modal-active');
      document.body.classList.remove('drawer-open');
      window.dispatchEvent(new Event('storage'));
    }
    return () => {
      localStorage.removeItem('global-modal-active');
      document.body.classList.remove('drawer-open');
      window.dispatchEvent(new Event('storage'));
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-surface-container-high rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-outline-variant/10 pointer-events-auto relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              
              <div className="flex flex-col items-center text-center">
                <div className={`size-20 rounded-[2rem] flex items-center justify-center mb-6 border shadow-2xl ${colors[type]}`}>
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="material-symbols-outlined text-4xl font-bold"
                  >
                    {icons[type]}
                  </motion.span>
                </div>
                
                <h3 className="font-['Manrope'] text-xl font-black text-white mb-2 uppercase tracking-tight">
                  {title}
                </h3>
                
                <p className="text-on-surface-variant/70 text-sm font-medium leading-relaxed mb-8">
                  {message}
                </p>
                
                <button
                  onClick={onClose}
                  className="w-full h-14 bg-primary text-black rounded-full font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  Понятно
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
