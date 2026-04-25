'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

export default function Page() {
  const router = useRouter();
  const [rideData, setRideData] = useState<any>(null);
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const socketRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Mark as Read Logic
  const markMessagesAsRead = (currentMessages: any[], currentRole: string, rideId: string) => {
    let hasChanges = false;
    const updatedMessages = currentMessages.map(msg => {
      if (msg.senderId !== currentRole && msg.status !== 'read') {
        hasChanges = true;
        return { ...msg, status: 'read' };
      }
      return msg;
    });

    if (hasChanges) {
      setMessages(updatedMessages);
      localStorage.setItem(`chat-messages-${rideId}`, JSON.stringify(updatedMessages));
      // Notify socket server
      socketRef.current?.emit('messages_read', { rideId, readerId: currentRole });
    }
  };

  useEffect(() => {
    const dataRaw = localStorage.getItem('active-ride-data');
    const rideId = localStorage.getItem('active-ride-id');
    const savedRole = (sessionStorage.getItem('tab-role') || localStorage.getItem('app-role')) as 'passenger' | 'driver' || 'passenger';
    
    setRole(savedRole);
    const currentRideId = rideId || (dataRaw ? JSON.parse(dataRaw).rideId : null);

    if (dataRaw) {
      const data = JSON.parse(dataRaw);
      setRideData(data);
      
      // Load history
      if (currentRideId) {
        const history = localStorage.getItem(`chat-messages-${currentRideId}`);
        if (history) {
          const parsedHistory = JSON.parse(history);
          setMessages(parsedHistory);
          // Initial check for unread messages
          setTimeout(() => markMessagesAsRead(parsedHistory, savedRole, currentRideId), 100);
        }
      }
    }
    
    // Initialize Socket
    const socketUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
    socketRef.current = io(socketUrl);

    socketRef.current.on('connect', () => {
      if (currentRideId) {
        socketRef.current.emit('join_chat', currentRideId);
      }
    });

    socketRef.current.on('new_message', (msg: any) => {
      console.log('Chat: Message received via socket', msg);
      setMessages((prev) => {
        // Robust deduplication: check ID or (content + exact timestamp)
        if (prev.some(m => (m.id && m.id === msg.id) || (m.text === msg.text && m.senderId === msg.senderId && m.createdAt === msg.createdAt))) {
          return prev;
        }
        
        const newMsgs = [...prev, msg];
        if (currentRideId) {
          localStorage.setItem(`chat-messages-${currentRideId}`, JSON.stringify(newMsgs));
          // Mark as read after state update to avoid loops
          if (msg.senderId !== savedRole) {
            setTimeout(() => markMessagesAsRead(newMsgs, savedRole, currentRideId), 50);
          }
        }
        return newMsgs;
      });
    });

    socketRef.current.on('messages_read', (data: any) => {
      if (data.readerId !== savedRole) {
        setMessages((prev) => {
          const updated = prev.map(m => m.senderId === savedRole ? { ...m, status: 'read' } : m);
          if (currentRideId) {
            localStorage.setItem(`chat-messages-${currentRideId}`, JSON.stringify(updated));
          }
          return updated;
        });
      }
    });

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === `chat-messages-${currentRideId}` && e.newValue) {
        const updated = JSON.parse(e.newValue);
        // Only update if fundamentally different to avoid jitter
        setMessages(prev => {
          if (prev.length === updated.length && prev[prev.length-1]?.status === updated[updated.length-1]?.status) {
            return prev;
          }
          return updated;
        });
      }
    };
    window.addEventListener('storage', handleStorageSync);

    return () => {
      socketRef.current?.disconnect();
      window.removeEventListener('storage', handleStorageSync);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !socketRef.current) return;

    const rideId = rideData?.rideId || localStorage.getItem('active-ride-id');
    if (!rideId) return;

    const messageData = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      rideId,
      text: inputText,
      senderId: role,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    // ONLY EMIT - reliance on socket echo or secondary sync to avoid duplication
    socketRef.current.emit('send_message', messageData);
    
    // Fallback: if server doesn't respond in 1s, add it locally? 
    // No, better to keep it clean. Duplication confirms server echo is active.
    
    setInputText('');
  };

  const counterpartName = role === 'passenger' 
    ? (rideData?.driverInfo?.name || 'Водитель') 
    : (rideData?.passengerInfo?.firstName || 'Пассажир');

  const counterpartAvatarId = role === 'passenger' 
    ? (rideData?.driverInfo?.avatar || 'avatar1')
    : (rideData?.passengerInfo?.avatarId || 'avatar1');

  const getAvatarUrl = (id: string) => {
    return `/avatars/${id.includes('(') ? id : `avatar (${id.replace('avatar', '')})`}.svg`;
  };

  return (
    <main className="h-dvh flex flex-col bg-surface relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-0">
        <svg width="100%" height="100%">
          <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40L40 0M-10 10L10 -10M30 50L50 30" stroke="white" strokeWidth="1" fill="none" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>

      {/* Header */}
      <header
        className="app-header app-header-fixed bg-background/80 backdrop-blur-2xl border-b border-outline-variant/10 flex items-center justify-between px-4 z-50 shrink-0 shadow-lg"
        style={{ height: 'calc(4.5rem + var(--sat))', paddingTop: 'var(--sat)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="size-10 flex items-center justify-center rounded-2xl hover:bg-surface-container-high transition-all active:scale-90 text-primary border border-outline-variant/5"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full border border-primary/20 bg-surface-container-low overflow-hidden">
                <img src={getAvatarUrl(counterpartAvatarId)} className="w-full h-full object-cover" alt="Avatar" />
            </div>
            <div>
              <h1 className="font-['Manrope'] font-black text-sm text-white tracking-tight">{counterpartName}</h1>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[9px] text-emerald-500/80 font-black uppercase tracking-[0.15em]">В сети</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <a
              href={`tel:${role === 'passenger' ? rideData?.driverInfo?.phone : (rideData?.passengerId || '+70000000000')}`}
              className="size-10 flex items-center justify-center rounded-2xl bg-surface-container-high text-white hover:bg-primary/20 transition-all border border-outline-variant/5"
            >
              <span className="material-symbols-outlined text-xl">call</span>
            </a>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-touch pb-32 pt-24 scroll-smooth relative z-10 px-4 flex flex-col gap-4 custom-scrollbar" 
      >
        <div className="flex justify-center my-4">
           <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface/30 font-black bg-surface-container-highest/10 px-4 py-1.5 rounded-full border border-outline-variant/5 backdrop-blur-md">
             Защищенное соединение
           </span>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === role;
            const isLastOfGroup = idx === messages.length - 1 || messages[idx+1]?.senderId !== msg.senderId;
            
            return (
              <motion.div 
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex flex-col gap-1 max-w-[82%] ${isMe ? 'self-end items-end' : 'items-start'}`}
              >
                <div className={`relative px-4 py-2.5 shadow-xl transition-all duration-300 border ${
                  isMe 
                    ? 'bg-primary text-black rounded-[22px] rounded-tr-[4px] border-white/10 shadow-primary/10' 
                    : 'bg-surface-container-high text-on-surface rounded-[22px] rounded-tl-[4px] border-outline-variant/10 backdrop-blur-md shadow-black/5'
                }`}>
                  <p className={`text-[15px] leading-[1.45] whitespace-pre-wrap font-['Inter'] ${isMe ? 'font-semibold tracking-tight' : 'font-medium tracking-tight'}`}>
                    {msg.text}
                  </p>
                </div>

                <div className={`flex items-center gap-1.5 mt-0.5 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-[9px] text-on-surface/30 font-bold tracking-widest uppercase">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  {isMe && (
                    <span 
                        className={`material-symbols-outlined text-[14px] transition-all duration-500 ${msg.status === 'read' ? 'text-primary' : 'text-on-surface/20'}`} 
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {msg.status === 'read' ? 'done_all' : 'done'}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Message input */}
      <div
        className="fixed bottom-0 left-0 w-full px-4 pb-8 pt-4 z-50 lg:max-w-md lg:left-1/2 lg:-translate-x-1/2"
        style={{ background: 'linear-gradient(to top, var(--surface) 80%, transparent)' }}
      >
        <div className="bg-surface-container-high/90 backdrop-blur-xl rounded-[2rem] p-1.5 pl-5 flex items-center gap-2 shadow-2xl border border-outline-variant/10">
          <input
            className="bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface/30 w-full text-sm font-medium py-2 outline-none"
            placeholder="Напишите сообщение..."
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="size-11 flex items-center justify-center bg-gradient-to-br from-primary to-[#FF5540] text-black rounded-full active:scale-90 transition-all duration-300 shadow-xl flex-shrink-0 disabled:opacity-20 disabled:grayscale"
          >
            <span className="material-symbols-outlined mr-0.5" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>send</span>
          </button>
        </div>
      </div>
    </main>
  );
}
