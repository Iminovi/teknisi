import React, { useState, useEffect } from 'react';
import { MessageSquare, X, ExternalLink } from 'lucide-react';
import { NotificationItem } from '../types/service';

interface NotificationToastProps {
  onOpenNotificationModal: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onOpenNotificationModal }) => {
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);

  useEffect(() => {
    const handleNewNotif = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationItem[]>;
      if (customEvent.detail && customEvent.detail.length > 0) {
        const waNotif = customEvent.detail.find(n => n.channel === 'whatsapp') || customEvent.detail[0];
        setActiveToast(waNotif);

        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 7000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('republik_computer_notif_received', handleNewNotif);
    return () => window.removeEventListener('republik_computer_notif_received', handleNewNotif);
  }, []);

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 z-40 sm:max-w-sm bg-zinc-950 text-white rounded-2xl shadow-2xl border-l-4 border-red-600 border border-zinc-800 p-4 animate-in slide-in-from-bottom-5 duration-300 text-left">
      <div className="flex items-start justify-between gap-3">
        <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center shrink-0 mt-0.5 border border-red-500/30">
          <MessageSquare className="w-4 h-4" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
              Notifikasi Otomatis Terkirim
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Baru Saja
            </span>
          </div>

          <p className="text-xs font-bold text-white line-clamp-1">
            {activeToast.title}
          </p>

          <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
            WhatsApp otomatis ke: <span className="font-mono font-bold text-red-400">{activeToast.customerPhone}</span> ({activeToast.customerName})
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => {
                setActiveToast(null);
                onOpenNotificationModal();
              }}
              className="min-h-[36px] text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Simulasi WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          onClick={() => setActiveToast(null)}
          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          aria-label="Tutup Notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
