'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'primary' | 'danger' | 'warning';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  type = 'primary'
}) => {
  const icons = {
    primary: 'help_outline',
    danger: 'report_problem',
    warning: 'warning'
  };

  const colors = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    danger: 'text-red-500 bg-red-500/10 border-red-500/20',
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
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-[340px] sm:max-w-sm bg-surface-container-high rounded-[2.5rem] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-outline-variant/10 pointer-events-auto relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              
              <div className="flex flex-col items-center text-center">
                <div className={`size-20 rounded-[2rem] flex items-center justify-center mb-6 border shadow-2xl ${colors[type]}`}>
                  <motion.span 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="material-symbols-outlined text-4xl font-bold"
                  >
                    {icons[type]}
                  </motion.span>
                </div>
                
                <h3 className="font-['Manrope'] text-xl font-black text-white mb-2 uppercase tracking-tight">
                  {title}
                </h3>
                
                <p className="text-on-surface-variant/70 text-sm font-medium leading-relaxed mb-8 px-4">
                  {message}
                </p>
                
                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={`w-full h-14 rounded-full font-black uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                      type === 'danger' 
                        ? 'bg-red-500 text-white shadow-red-500/20' 
                        : 'bg-primary text-black shadow-primary/20'
                    }`}
                  >
                    {confirmText}
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="w-full h-14 bg-surface-container-highest/50 text-on-surface-variant font-black uppercase tracking-widest text-xs rounded-full border border-outline-variant/10 transition-all active:scale-95 hover:bg-surface-container-highest"
                  >
                    {cancelText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
