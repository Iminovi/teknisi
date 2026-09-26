import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { TrackingSection } from './components/TrackingSection';
import { ServiceSubmissionModal } from './components/ServiceSubmissionModal';
import { TechnicianPortal } from './components/TechnicianPortal';
import { NotificationModal } from './components/NotificationModal';
import { ServiceReceiptModal } from './components/ServiceReceiptModal';
import { NotificationToast } from './components/NotificationToast';
import { StandardWarrantySection } from './components/StandardWarrantySection';
import { WhatsAppSettingsModal } from './components/WhatsAppSettingsModal';
import { ServiceTicket } from './types/service';
import { getWhatsAppConfig, onWhatsAppConfigChanged, WhatsAppConfig } from './services/whatsappConfigService';
import { Wrench } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tracking' | 'submit' | 'technician' | 'about'>('tracking');
  const [isTechnicianMode, setIsTechnicianMode] = useState<boolean>(false);
  const [activeTicketId, setActiveTicketId] = useState<string>('RC-2026-0842');
  const [waConfig, setWaConfig] = useState<WhatsAppConfig>(getWhatsAppConfig());

  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [isWhatsAppSettingsOpen, setIsWhatsAppSettingsOpen] = useState<boolean>(false);
  const [ticketForReceipt, setTicketForReceipt] = useState<ServiceTicket | null>(null);
  const [ticketForWhatsApp, setTicketForWhatsApp] = useState<ServiceTicket | null>(null);

  // Read URL query parameter for ticket ID if present
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ticketParam = urlParams.get('ticket');
      if (ticketParam) {
        setActiveTicketId(ticketParam);
        setActiveTab('tracking');
      }
    } catch {
      // Ignore URL parsing errors
    }

    const unsub = onWhatsAppConfigChanged((cfg) => {
      setWaConfig(cfg);
    });
    return () => unsub();
  }, []);

  const handleTicketCreated = (newTicket: ServiceTicket) => {
    setActiveTicketId(newTicket.id);
    setActiveTab('tracking');
    try {
      window.history.pushState({}, '', `?ticket=${newTicket.id}`);
    } catch {}
  };

  const handleOpenReceipt = (ticket: ServiceTicket) => {
    setTicketForReceipt(ticket);
  };

  const handleOpenWhatsAppPreview = (ticket: ServiceTicket) => {
    setTicketForWhatsApp(ticket);
    setIsNotificationModalOpen(true);
  };

  const handleQuickTrack = (ticketId: string) => {
    setActiveTicketId(ticketId);
    setActiveTab('tracking');
    setIsTechnicianMode(false);
    const el = document.getElementById('tracking-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 flex flex-col font-sans selection:bg-red-600 selection:text-white antialiased">
      {/* 3-Zone Navigation Header with Mobile Drawer */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenQuickSubmit={() => setIsSubmitModalOpen(true)}
        onOpenWhatsAppSettings={() => setIsWhatsAppSettingsOpen(true)}
        isTechnicianMode={isTechnicianMode}
        setIsTechnicianMode={setIsTechnicianMode}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isTechnicianMode ? (
          /* Technician Admin Workbench */
          <TechnicianPortal
            onOpenWhatsAppPreview={handleOpenWhatsAppPreview}
            onOpenReceipt={handleOpenReceipt}
            onExitTechnicianMode={() => setIsTechnicianMode(false)}
          />
        ) : (
          /* Customer Facing Experience */
          <>
            {activeTab === 'submit' ? (
              <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl mx-auto text-center space-y-4">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider bg-red-50 border border-red-100 px-3 py-1 rounded-full">
                    Layanan Servis Resmi Republik Computer
                  </span>
                  <h1 className="text-3xl font-black text-zinc-950 tracking-tight">
                    Pengajuan Perbaikan Perangkat
                  </h1>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Daftarkan perbaikan unit laptop atau PC Anda untuk mendapatkan nomor resi tiket resmi serta jadwal penjemputan/penyerahan unit.
                  </p>
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="min-h-[48px] px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm rounded-xl shadow-md shadow-red-600/25 transition-all cursor-pointer"
                  >
                    Buka Formulir Pendaftaran Lengkap
                  </button>
                </div>
              </div>
            ) : activeTab === 'about' ? (
              <StandardWarrantySection
                onOpenSubmit={() => setIsSubmitModalOpen(true)}
              />
            ) : (
              /* Default: Tracking & Hero Experience */
              <>
                <HeroBanner
                  onStartTracking={() => {
                    const el = document.getElementById('tracking-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onOpenSubmit={() => setIsSubmitModalOpen(true)}
                  sampleTicketId={activeTicketId || 'RC-2026-0842'}
                  onQuickTrack={handleQuickTrack}
                />

                <TrackingSection
                  initialTicketId={activeTicketId}
                  onOpenReceipt={handleOpenReceipt}
                  onOpenWhatsAppPreview={handleOpenWhatsAppPreview}
                  onNavigateToSubmit={() => setIsSubmitModalOpen(true)}
                />
              </>
            )}
          </>
        )}
      </main>

      {/* Floating Live Notification Toast */}
      <NotificationToast
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
      />

      {/* Repair Request Submission Modal */}
      <ServiceSubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />

      {/* Simulated WhatsApp & Email Notification Log Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => {
          setIsNotificationModalOpen(false);
          setTicketForWhatsApp(null);
        }}
        selectedTicket={ticketForWhatsApp}
      />

      {/* Printable Service Invoice / SPK Receipt Modal */}
      <ServiceReceiptModal
        isOpen={!!ticketForReceipt}
        onClose={() => setTicketForReceipt(null)}
        ticket={ticketForReceipt}
      />

      {/* WhatsApp & Gateway Settings Modal */}
      <WhatsAppSettingsModal
        isOpen={isWhatsAppSettingsOpen}
        onClose={() => setIsWhatsAppSettingsOpen(false)}
        onSaved={() => setWaConfig(getWhatsAppConfig())}
      />

      {/* Minimalist Red & White Footer */}
      <footer className="bg-white border-t border-zinc-200 mt-16 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                  <Wrench className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-base font-extrabold text-zinc-950">
                  {waConfig.officeName.split(' ')[0]} <span className="text-red-600">{waConfig.officeName.split(' ').slice(1).join(' ') || 'Computer'}</span>
                </span>
              </div>
              <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
                Pusat perbaikan resmi laptop, PC gaming, kartu grafis (GPU), dan MacBook. Berkomitmen menghadirkan layanan cepat dengan pelacakan status transparan dan notifikasi otomatis WhatsApp.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-zinc-950 block">Layanan Service</span>
              <ul className="space-y-1.5 text-zinc-600">
                <li>Service Laptop & MacBook</li>
                <li>Perbaikan GPU / VGA Card</li>
                <li>Rakit & Optimalisasi PC Gaming</li>
                <li>Layanan Jemput Kurir Workshop</li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-zinc-950 block">Workshop Resmi</span>
              <div className="space-y-1 text-zinc-600 leading-relaxed">
                <p>{waConfig.officeAddress}</p>
                <p className="font-mono font-bold text-red-600">
                  WhatsApp: {waConfig.officePhone}
                </p>
                <button
                  onClick={() => setIsWhatsAppSettingsOpen(true)}
                  className="text-[11px] text-zinc-500 hover:text-red-600 underline font-medium cursor-pointer"
                >
                  Ubah Nomor WA Kantor
                </button>
                <p className="text-zinc-500">Jam: 09.00 - 20.00 WIB (Setiap Hari)</p>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-3">
            <p>&copy; {new Date().getFullYear()} {waConfig.officeName}. Hak Cipta Dilindungi.</p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-600">
              <span className="text-red-600 font-bold">Pelacakan Real-Time</span>
              <span>&bull;</span>
              <span>Notifikasi WhatsApp Resmi</span>
              <span>&bull;</span>
              <span>Garansi Resmi 90 Hari</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
