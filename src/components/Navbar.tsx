import React, { useState, useEffect } from 'react';
import { Bell, Wrench, Menu, X, PlusCircle, MessageSquare, ShieldCheck, ChevronRight, Lock, Settings, Phone } from 'lucide-react';
import { getNotifications } from '../services/storage';
import { NotificationItem } from '../types/service';
import { getCurrentTechnician, onAuthChanged, TechnicianUser } from '../services/authService';

interface NavbarProps {
  activeTab: 'tracking' | 'submit' | 'technician' | 'about';
  setActiveTab: (tab: 'tracking' | 'submit' | 'technician' | 'about') => void;
  onOpenNotifications: () => void;
  onOpenQuickSubmit: () => void;
  onOpenWhatsAppSettings?: () => void;
  isTechnicianMode: boolean;
  setIsTechnicianMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNotifications,
  onOpenQuickSubmit,
  onOpenWhatsAppSettings,
  isTechnicianMode,
  setIsTechnicianMode
}) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [recentNotifs, setRecentNotifs] = useState<NotificationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currentTech, setCurrentTech] = useState<TechnicianUser | null>(getCurrentTechnician());

  const loadNotifications = () => {
    const list = getNotifications();
    setRecentNotifs(list.slice(0, 5));
    setUnreadCount(list.length);
  };

  useEffect(() => {
    loadNotifications();
    const handleNotif = () => loadNotifications();
    window.addEventListener('republik_computer_notif_received', handleNotif);
    const unsubAuth = onAuthChanged((tech) => {
      setCurrentTech(tech);
    });

    return () => {
      window.removeEventListener('republik_computer_notif_received', handleNotif);
      unsubAuth();
    };
  }, []);

  const handleNavClick = (tab: 'tracking' | 'submit' | 'technician' | 'about', techMode = false) => {
    setActiveTab(tab);
    setIsTechnicianMode(techMode);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Zone 1: Brand Zone (Single text element wordmark with Red Emblem) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('tracking', false)}
              className="flex items-center gap-2.5 text-left focus:outline-none min-h-[44px] min-w-[44px] -ml-2 p-2 rounded-lg hover:bg-zinc-100/70 transition-colors cursor-pointer"
              aria-label="Republik Computer Beranda"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shadow-sm shadow-red-600/30 shrink-0">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-zinc-950 block leading-tight">
                  Republik <span className="text-red-600">Computer</span>
                </span>
                <span className="text-[11px] font-medium text-zinc-500 block leading-tight">
                  Pusat Layanan Servis Resmi
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Desktop 4-6 Clean Text Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => handleNavClick('tracking', false)}
              className={`min-h-[44px] inline-flex items-center transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'tracking' && !isTechnicianMode
                  ? 'text-red-600 font-bold border-b-2 border-red-600'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Pelacakan Servis
            </button>

            <button
              onClick={() => handleNavClick('submit', false)}
              className={`min-h-[44px] inline-flex items-center transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'submit' && !isTechnicianMode
                  ? 'text-red-600 font-bold border-b-2 border-red-600'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Ajukan Servis
            </button>

            <button
              onClick={() => handleNavClick('about', false)}
              className={`min-h-[44px] inline-flex items-center transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'about' && !isTechnicianMode
                  ? 'text-red-600 font-bold border-b-2 border-red-600'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Standar & Garansi
            </button>

            <button
              onClick={() => handleNavClick('technician', !isTechnicianMode)}
              className={`min-h-[44px] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                isTechnicianMode
                  ? 'text-zinc-950 font-bold border-b-2 border-zinc-950'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {currentTech ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Teknisi: <strong className="text-zinc-900">{currentTech.name.split(' ')[0]}</strong></span>
                  <span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-200">{currentTech.id}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Portal Teknisi (Login)</span>
                </>
              )}
            </button>
          </nav>

          {/* Zone 3: Actions (Notifications + CTA + Mobile Hamburger) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-colors focus:outline-none cursor-pointer"
                title="Pusat Notifikasi Otomatis"
                aria-label="Pusat Notifikasi Otomatis"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 p-3.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 mb-2">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-bold text-zinc-900">Notifikasi Otomatis Real-Time</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        onOpenNotifications();
                      }}
                      className="text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                    >
                      Buka Semua
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {recentNotifs.length === 0 ? (
                      <p className="text-xs text-zinc-400 text-center py-5">Belum ada riwayat notifikasi</p>
                    ) : (
                      recentNotifs.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setShowDropdown(false);
                            onOpenNotifications();
                          }}
                          className="p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors text-left border border-zinc-100"
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-semibold text-zinc-700 uppercase tracking-wider text-[10px]">
                              {n.channel === 'whatsapp' ? (
                                <span className="text-emerald-700 font-bold">WhatsApp Gateway</span>
                              ) : (
                                <span className="text-red-600 font-bold">Email Otomatis</span>
                              )}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-400">
                              {new Date(n.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-zinc-900 line-clamp-1">{n.title}</p>
                          <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-zinc-100 mt-2 space-y-1.5">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        onOpenNotifications();
                      }}
                      className="w-full min-h-[40px] text-xs text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-xl font-semibold transition-colors flex items-center justify-center cursor-pointer"
                    >
                      Buka Simulator WhatsApp & Log Lengkap
                    </button>

                    {onOpenWhatsAppSettings && (
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          onOpenWhatsAppSettings();
                        }}
                        className="w-full min-h-[38px] text-[11px] text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pengaturan Nomor WA Kantor & Gateway</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button (Red Theme) */}
            <button
              onClick={() => {
                setIsTechnicianMode(false);
                onOpenQuickSubmit();
              }}
              className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-sm shadow-red-600/30 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Ajukan Servis</span>
              <span className="sm:hidden">Servis</span>
            </button>

            {/* Mobile Hamburger Button (Touch-friendly >= 44x44px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Tutup Menu' : 'Buka Menu Navigasi'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-red-600" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Touch-Friendly, 48px Height Targets) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 px-4 pt-3 pb-5 space-y-2 shadow-xl animate-in slide-in-from-top-3 duration-200">
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('tracking', false)}
              className={`w-full min-h-[48px] px-4 rounded-xl flex items-center justify-between text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'tracking' && !isTechnicianMode
                  ? 'bg-red-50 text-red-600 font-bold'
                  : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <span>Pelacakan Servis</span>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>

            <button
              onClick={() => handleNavClick('submit', false)}
              className={`w-full min-h-[48px] px-4 rounded-xl flex items-center justify-between text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'submit' && !isTechnicianMode
                  ? 'bg-red-50 text-red-600 font-bold'
                  : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <span>Ajukan Servis Baru</span>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>

            <button
              onClick={() => handleNavClick('about', false)}
              className={`w-full min-h-[48px] px-4 rounded-xl flex items-center justify-between text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'about' && !isTechnicianMode
                  ? 'bg-red-50 text-red-600 font-bold'
                  : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <span>Standar & Garansi</span>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>

            <button
              onClick={() => handleNavClick('technician', !isTechnicianMode)}
              className={`w-full min-h-[48px] px-4 rounded-xl flex items-center justify-between text-sm font-semibold transition-colors cursor-pointer ${
                isTechnicianMode
                  ? 'bg-zinc-900 text-white font-bold'
                  : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Wrench className="w-4 h-4 text-red-500 shrink-0" />
                <div className="text-left min-w-0">
                  <span className="block truncate">
                    {currentTech ? `Portal Workshop (${currentTech.name.split(' ')[0]})` : 'Login Portal Teknisi'}
                  </span>
                  {currentTech ? (
                    <span className="text-[10px] text-emerald-400 font-mono block">
                      ● Aktif: {currentTech.id} &bull; {currentTech.role.split('&')[0]}
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400 block">
                      Akses terbatas staf teknisi
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </button>

            {onOpenWhatsAppSettings && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenWhatsAppSettings();
                }}
                className="w-full min-h-[48px] px-4 rounded-xl flex items-center justify-between text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Pengaturan WA Kantor & Gateway</span>
                </div>
                <Settings className="w-4 h-4 text-emerald-600" />
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuickSubmit();
              }}
              className="w-full min-h-[48px] px-4 bg-red-600 text-white rounded-xl font-bold text-sm shadow-sm shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Daftarkan Perangkat Sekarang</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
