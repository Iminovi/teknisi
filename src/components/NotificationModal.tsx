import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Mail, 
  CheckCheck, 
  Copy, 
  ExternalLink, 
  Smartphone, 
  Volume2, 
  Sparkles,
  Search,
  Settings,
  Phone,
  Send,
  CheckCircle2
} from 'lucide-react';
import { NotificationItem, ServiceTicket } from '../types/service';
import { getNotifications } from '../services/storage';
import { playNotificationSound } from '../services/notificationService';
import { 
  getWhatsAppConfig, 
  generateWhatsAppUrl, 
  sendWhatsAppMessage, 
  onWhatsAppConfigChanged, 
  WhatsAppConfig 
} from '../services/whatsappConfigService';
import { WhatsAppSettingsModal } from './WhatsAppSettingsModal';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicket?: ServiceTicket | null;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  selectedTicket
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'history'>('whatsapp');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeNotif, setActiveNotif] = useState<NotificationItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [waConfig, setWaConfig] = useState<WhatsAppConfig>(getWhatsAppConfig());
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);

  const loadNotifs = () => {
    const list = getNotifications();
    setNotifications(list);

    if (selectedTicket) {
      const match = list.find(n => n.ticketId === selectedTicket.id && n.channel === 'whatsapp');
      if (match) {
        setActiveNotif(match);
        return;
      }
    }
    if (list.length > 0 && !activeNotif) {
      setActiveNotif(list[0]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifs();
      setWaConfig(getWhatsAppConfig());
    }
    const unsub = onWhatsAppConfigChanged((cfg) => {
      setWaConfig(cfg);
    });
    return () => unsub();
  }, [isOpen, selectedTicket]);

  if (!isOpen) return null;

  const currentTicketNotifs = activeNotif || (notifications.length > 0 ? notifications[0] : null);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlaySoundTest = () => {
    playNotificationSound();
  };

  const handleDirectSendToCustomer = async () => {
    if (!currentTicketNotifs) return;
    const targetPhone = currentTicketNotifs.customerPhone;
    const message = currentTicketNotifs.message;

    const res = await sendWhatsAppMessage(targetPhone, message);
    if (res.url) {
      window.open(res.url, '_blank');
      setSendFeedback(`Membuka WhatsApp Web untuk mengirim ke ${targetPhone}...`);
    } else {
      setSendFeedback(res.message);
    }
    setTimeout(() => setSendFeedback(null), 4000);
  };

  const filteredHistory = notifications.filter(n => 
    !searchQuery ||
    n.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-zinc-950/80 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 text-left">
        <div className="w-full sm:max-w-4xl bg-white rounded-t-2xl sm:rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 flex flex-col max-h-[92dvh] sm:max-h-[88vh] my-0 sm:my-auto shrink-0">
          {/* Header (Sticky at top) */}
          <div className="px-4 sm:px-6 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-wider block">
                  Sistem Notifikasi Otomatis
                </span>
                <h3 className="text-sm sm:text-base font-bold text-zinc-950 truncate max-w-[180px] sm:max-w-md">
                  Pusat Gateway Notifikasi & WhatsApp Kantor
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="min-h-[40px] px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 hover:text-emerald-700 hover:border-emerald-300 rounded-xl transition-colors text-xs flex items-center gap-1.5 font-bold cursor-pointer shadow-xs"
                title="Ubah Nomor WA Kantor & Gateway"
              >
                <Settings className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Pengaturan WA Kantor</span>
              </button>

              <button
                onClick={handlePlaySoundTest}
                className="min-h-[40px] px-3 py-1.5 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-colors text-xs flex items-center gap-1 font-semibold cursor-pointer"
                title="Uji Suara Chime"
              >
                <Volume2 className="w-4 h-4 text-red-600" />
                <span className="hidden sm:inline">Uji Suara</span>
              </button>

              <button
                onClick={onClose}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Office WA Quick Banner */}
          <div className="px-4 sm:px-6 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-950">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">
                Nomor WA Kantor Aktif: <b className="font-mono">{waConfig.officePhone}</b> ({waConfig.officeName})
              </span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-emerald-700 font-bold underline hover:text-emerald-900 shrink-0 cursor-pointer ml-2"
            >
              Ubah Nomor WA
            </button>
          </div>

          {/* Tab Controls */}
          <div className="px-5 sm:px-6 pt-3 border-b border-zinc-200 bg-white flex items-center gap-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`min-h-[40px] pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'whatsapp'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Simulasi Layar WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`min-h-[40px] pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'email'
                  ? 'border-red-600 text-red-700 font-extrabold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Template Email Resmi</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`min-h-[40px] pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'border-zinc-950 text-zinc-950 font-extrabold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Log Pengiriman ({notifications.length})</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-zinc-50/50">
            {/* Feedback notification toast if user dispatches */}
            {sendFeedback && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{sendFeedback}</span>
              </div>
            )}

            {/* TAB 1: WHATSAPP SIMULATION */}
            {activeTab === 'whatsapp' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left: Chat selector */}
                <div className="md:col-span-5 space-y-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                    Pilih Pesan Notifikasi:
                  </span>
                  <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                    {notifications
                      .filter(n => n.channel === 'whatsapp')
                      .map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setActiveNotif(item)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            activeNotif?.id === item.id
                              ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'bg-white border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-mono font-bold text-zinc-900">{item.ticketId}</span>
                            <span className="text-zinc-400 font-mono text-[10px]">
                              {new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-zinc-800 line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">Penerima: {item.customerName} ({item.customerPhone})</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Right: Simulated WhatsApp Phone Screen */}
                <div className="md:col-span-7">
                  <div className="max-w-sm mx-auto bg-zinc-950 rounded-3xl p-3 shadow-2xl border-4 border-zinc-900">
                    {/* WhatsApp Header Bar */}
                    <div className="bg-[#075E54] text-white px-3 py-2.5 rounded-t-2xl flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center font-black text-xs text-white border border-white/30 shrink-0">
                          RC
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold leading-tight truncate">{waConfig.officeName}</span>
                            <span className="text-[9px] bg-emerald-400 text-emerald-950 px-1 rounded font-black shrink-0">✓ VERIFIED</span>
                          </div>
                          <span className="text-[10px] text-emerald-100 block leading-tight font-mono truncate">
                            Pengirim: {waConfig.officePhone}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-200 shrink-0">Online</span>
                    </div>

                    {/* Chat Canvas */}
                    <div className="bg-[#EFEAE2] p-3 rounded-b-2xl min-h-[360px] flex flex-col justify-between text-xs space-y-3 font-sans">
                      <div className="text-center">
                        <span className="bg-white/80 text-zinc-500 text-[10px] px-2 py-0.5 rounded-md shadow-xs font-medium">
                          HARI INI &bull; KEPADA {currentTicketNotifs?.customerName.toUpperCase()} ({currentTicketNotifs?.customerPhone})
                        </span>
                      </div>

                      {/* Chat Bubble */}
                      {currentTicketNotifs ? (
                        <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-xs max-w-[94%] space-y-2 border border-black/5 text-zinc-900 text-[12px] leading-relaxed">
                          <div className="whitespace-pre-wrap font-sans">
                            {currentTicketNotifs.message}
                          </div>
                          <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-400 pt-1">
                            <span>{new Date(currentTicketNotifs.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400 text-center">Pilih pesan di samping</p>
                      )}

                      {/* Bottom Action Bar (Touch-Friendly >= 44px) */}
                      <div className="pt-2 flex flex-col gap-2 text-xs">
                        {currentTicketNotifs && (
                          <>
                            {/* Primary Button: Kirim Langsung ke WA Pelanggan */}
                            <button
                              onClick={handleDirectSendToCustomer}
                              className="w-full min-h-[44px] bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa51] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Send className="w-4 h-4" />
                              <span>Kirim ke WhatsApp Pelanggan ({currentTicketNotifs.customerPhone})</span>
                            </button>

                            {/* Secondary Button: Salin Pesan */}
                            <button
                              onClick={() => handleCopyText(currentTicketNotifs.message)}
                              className="w-full min-h-[44px] bg-white hover:bg-zinc-50 text-zinc-800 font-bold rounded-xl shadow-xs border border-zinc-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copied ? 'Teks Disalin ke Clipboard!' : 'Salin Format Pesan WhatsApp'}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EMAIL PREVIEW */}
            {activeTab === 'email' && (
              <div className="max-w-2xl mx-auto bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="bg-red-600 text-white p-6 text-center space-y-1">
                  <span className="text-xs uppercase tracking-widest font-bold text-red-200">
                    {waConfig.officeName} Customer Care
                  </span>
                  <h3 className="text-xl font-black">Pembaruan Servis Perangkat Anda</h3>
                  <p className="text-xs text-red-100 font-mono">
                    No. Resi Tiket: {currentTicketNotifs?.ticketId || 'RC-2026-0842'}
                  </p>
                </div>

                <div className="p-6 space-y-4 text-xs text-zinc-700 leading-relaxed">
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
                    <div className="flex justify-between text-zinc-500">
                      <span>Kepada:</span>
                      <span className="font-bold text-zinc-900">{currentTicketNotifs?.customerEmail || 'pelanggan@gmail.com'}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Pengirim:</span>
                      <span className="font-bold text-zinc-900">{waConfig.officeEmail} ({waConfig.officePhone})</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Perihal:</span>
                      <span className="font-bold text-zinc-900">{currentTicketNotifs?.title || 'Update Servis'}</span>
                    </div>
                  </div>

                  <div className="whitespace-pre-line text-sm text-zinc-800 leading-relaxed">
                    {currentTicketNotifs?.message}
                  </div>

                  <div className="pt-4 border-t border-zinc-100 text-center">
                    <a
                      href={`/?ticket=${currentTicketNotifs?.ticketId}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onClose();
                      }}
                      className="min-h-[44px] inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs shadow-xs hover:bg-red-700 transition-colors"
                    >
                      <span>Buka Portal Pelacakan Live</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: OUTBOUND NOTIFICATION LOGS */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari log notifikasi..."
                      className="w-full min-h-[40px] pl-9 pr-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-red-600 font-mono"
                    />
                  </div>

                  <span className="text-xs text-zinc-500 font-semibold">
                    Total {filteredHistory.length} notifikasi keluar
                  </span>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
                      <tr>
                        <th className="py-3 px-4">Waktu</th>
                        <th className="py-3 px-4">No. Tiket</th>
                        <th className="py-3 px-4">Kanal</th>
                        <th className="py-3 px-4">Penerima</th>
                        <th className="py-3 px-4">Aksi Pengiriman</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-mono">
                      {filteredHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-3 px-4 text-zinc-500">
                            {new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="py-3 px-4 font-bold text-zinc-950">
                            {item.ticketId}
                          </td>
                          <td className="py-3 px-4 font-sans font-semibold">
                            {item.channel === 'whatsapp' ? (
                              <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold">
                                WhatsApp Gateway
                              </span>
                            ) : item.channel === 'email' ? (
                              <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded text-[11px] font-bold">
                                Email SMTP
                              </span>
                            ) : (
                              <span className="text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded text-[11px]">
                                Web Push
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-sans text-zinc-700">
                            {item.customerName} ({item.channel === 'email' ? item.customerEmail : item.customerPhone})
                          </td>
                          <td className="py-3 px-4 font-sans">
                            {item.channel === 'whatsapp' ? (
                              <a
                                href={generateWhatsAppUrl(item.customerPhone, item.message)}
                                target="_blank"
                                rel="noreferrer"
                                className="min-h-[32px] inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold text-[11px] bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                              >
                                <Send className="w-3 h-3" />
                                <span>Kirim via WA</span>
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                                <CheckCheck className="w-3.5 h-3.5" /> Terkirim
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded WhatsApp Settings Modal */}
      <WhatsAppSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => {
          setWaConfig(getWhatsAppConfig());
          loadNotifs();
        }}
      />
    </>
  );
};

