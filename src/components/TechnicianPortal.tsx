import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Plus, 
  MessageSquare, 
  FileEdit, 
  ShieldCheck, 
  RefreshCcw,
  Sparkles,
  LogOut,
  UserCheck,
  Settings,
  Phone
} from 'lucide-react';
import { ServiceTicket, STATUS_CONFIG, TicketStatus, PartItem } from '../types/service';
import { getTickets, updateTicketStatus, resetDemoData } from '../services/storage';
import { formatRupiah, generateNotificationMessage } from '../services/notificationService';
import { getCurrentTechnician, logoutTechnician, onAuthChanged, TechnicianUser } from '../services/authService';
import { TechnicianLogin } from './TechnicianLogin';
import { 
  getWhatsAppConfig, 
  saveWhatsAppConfig, 
  sendWhatsAppMessage, 
  onWhatsAppConfigChanged, 
  WhatsAppConfig 
} from '../services/whatsappConfigService';
import { WhatsAppSettingsModal } from './WhatsAppSettingsModal';

interface TechnicianPortalProps {
  onOpenWhatsAppPreview: (ticket: ServiceTicket) => void;
  onOpenReceipt: (ticket: ServiceTicket) => void;
  onExitTechnicianMode?: () => void;
}

export const TechnicianPortal: React.FC<TechnicianPortalProps> = ({
  onOpenWhatsAppPreview,
  onOpenReceipt,
  onExitTechnicianMode
}) => {
  const [currentTech, setCurrentTech] = useState<TechnicianUser | null>(getCurrentTechnician());
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const [targetStatus, setTargetStatus] = useState<TicketStatus>('in_progress');
  const [technicianNote, setTechnicianNote] = useState<string>('');
  const [newPartName, setNewPartName] = useState<string>('');
  const [newPartPrice, setNewPartPrice] = useState<number>(0);
  const [isWaSettingsOpen, setIsWaSettingsOpen] = useState<boolean>(false);
  const [waConfig, setWaConfig] = useState<WhatsAppConfig>(getWhatsAppConfig());

  const loadData = () => {
    const list = getTickets();
    setTickets(list);
    if (!selectedTicketId && list.length > 0) {
      setSelectedTicketId(list[0].id);
    }
  };

  useEffect(() => {
    loadData();
    setWaConfig(getWhatsAppConfig());
    const handleUpdate = () => loadData();
    window.addEventListener('republik_computer_tickets_updated', handleUpdate);
    const unsubAuth = onAuthChanged((tech) => {
      setCurrentTech(tech);
    });
    const unsubWa = onWhatsAppConfigChanged((cfg) => {
      setWaConfig(cfg);
    });

    return () => {
      window.removeEventListener('republik_computer_tickets_updated', handleUpdate);
      unsubAuth();
      unsubWa();
    };
  }, []);

  const handleLogout = () => {
    logoutTechnician();
    setCurrentTech(null);
  };

  const handleResetData = () => {
    if (window.confirm('Reset data tiket servis kembali ke status awal demo?')) {
      resetDemoData();
      loadData();
      setFeedbackMsg('Data tiket demo berhasil di-reset.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleDirectSendWA = async (ticket: ServiceTicket) => {
    const generated = generateNotificationMessage(ticket, ticket.status === 'completed' ? 'completed' : 'status_changed');
    const res = await sendWhatsAppMessage(ticket.customer.phone, generated.whatsappText);
    if (res.url) {
      window.open(res.url, '_blank');
      setFeedbackMsg(`Membuka WhatsApp Web untuk mengirim ke ${ticket.customer.phone}...`);
    } else {
      setFeedbackMsg(res.message);
    }
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  if (!currentTech) {
    return (
      <TechnicianLogin
        onSuccess={(user) => {
          setCurrentTech(user);
          setFeedbackMsg(`Berhasil login sebagai ${user.name} (${user.role})`);
          setTimeout(() => setFeedbackMsg(null), 4000);
        }}
        onBackToHome={onExitTechnicianMode || (() => {})}
      />
    );
  }

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || (tickets.length > 0 ? tickets[0] : null);

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch = !searchQuery || 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.device.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const countTotal = tickets.length;
  const countDiagnosing = tickets.filter(t => t.status === 'diagnosing').length;
  const countWaitingApproval = tickets.filter(t => t.status === 'waiting_approval').length;
  const countInProgress = tickets.filter(t => t.status === 'in_progress').length;
  const countQC = tickets.filter(t => t.status === 'quality_control').length;
  const countCompleted = tickets.filter(t => t.status === 'completed').length;

  const handleApplyStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const note = technicianNote.trim() || `Pembaruan status servis ke tahap: ${STATUS_CONFIG[targetStatus].label}`;
    const updated = updateTicketStatus(selectedTicket.id, targetStatus, note, {
      technician: {
        id: currentTech.id,
        name: currentTech.name,
        role: currentTech.role,
        phone: currentTech.phone,
        avatar: currentTech.avatar
      }
    });
    if (updated) {
      setFeedbackMsg(`Status ${selectedTicket.id} diupdate ke ${STATUS_CONFIG[targetStatus].label} oleh ${currentTech.name}. Notifikasi otomatis telah dikirim ke ${selectedTicket.customer.phone}!`);
      setTechnicianNote('');
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const handleAddPart = () => {
    if (!selectedTicket || !newPartName.trim() || newPartPrice <= 0) return;

    const newPart: PartItem = {
      id: `P-${Date.now()}`,
      name: newPartName.trim(),
      price: newPartPrice,
      warrantyPeriod: '90 Hari Garansi Sparepart'
    };

    const updatedParts = [...selectedTicket.estimate.parts, newPart];
    const newTotal = updatedParts.reduce((sum, p) => sum + p.price, 0) + selectedTicket.estimate.serviceFee;

    updateTicketStatus(selectedTicket.id, selectedTicket.status, `Penambahan sparepart: ${newPart.name}`, {
      estimate: {
        ...selectedTicket.estimate,
        parts: updatedParts,
        totalAmount: newTotal
      },
      technician: {
        id: currentTech.id,
        name: currentTech.name,
        role: currentTech.role,
        phone: currentTech.phone,
        avatar: currentTech.avatar
      }
    });

    setNewPartName('');
    setNewPartPrice(0);
    setFeedbackMsg(`Komponen ${newPart.name} berhasil ditambahkan ke estimasi biaya!`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleToggleQCCheck = (checkId: string) => {
    if (!selectedTicket) return;
    const updatedChecks = selectedTicket.qcChecks.map(qc => {
      if (qc.id === checkId) {
        return {
          ...qc,
          status: (qc.status === 'passed' ? 'pending' : 'passed') as 'passed' | 'pending'
        };
      }
      return qc;
    });

    updateTicketStatus(
      selectedTicket.id, 
      selectedTicket.status, 
      'Pembaruan checklist pengujian Quality Control (QC)',
      { 
        qcChecks: updatedChecks,
        technician: {
          id: currentTech.id,
          name: currentTech.name,
          role: currentTech.role,
          phone: currentTech.phone,
          avatar: currentTech.avatar
        }
      }
    );
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      {/* Top Banner (Red & Dark Slate Prestige) */}
      <div className="bg-zinc-950 text-white rounded-2xl p-5 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-t-4 border-red-600 text-left">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold mb-2">
            <Wrench className="w-3.5 h-3.5" />
            <span>Portal Manajemen Servis & Workshop</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Dashboard Workshop Republik Computer
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-xl">
            Input hasil diagnosa, tentukan estimasi komponen baru, ubah status pengerjaan, dan picu notifikasi otomatis WhatsApp ke pelanggan.
          </p>
        </div>

        {/* Active Technician Profile Card & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 sm:p-3 flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={currentTech.avatar}
                alt={currentTech.name}
                className="w-10 h-10 rounded-xl object-cover border border-zinc-700"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full animate-pulse" title="Aktif / On-Duty" />
            </div>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[180px]">
                  {currentTech.name}
                </span>
                <span className="text-[10px] font-mono font-bold bg-red-600/30 text-red-400 px-1.5 py-0.2 rounded">
                  {currentTech.id}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate max-w-[180px]">
                {currentTech.role}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsWaSettingsOpen(true)}
              className="min-h-[44px] px-3.5 py-2 text-xs font-bold text-emerald-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-emerald-900/60 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Atur nomor WA kantor & integrasi gateway"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pengaturan WA Kantor</span>
            </button>

            <button
              onClick={handleLogout}
              className="min-h-[44px] px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Keluar dari akun teknisi"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-400" />
              <span>Keluar</span>
            </button>

            <button
              onClick={handleResetData}
              className="min-h-[44px] px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row (Red & White High Contrast) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs text-left">
          <span className="text-[11px] text-zinc-400 font-bold uppercase block">Total Antrean</span>
          <span className="text-2xl font-black text-zinc-950 font-mono mt-1 block">{countTotal} Unit</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs text-left">
          <span className="text-[11px] text-red-600 font-bold uppercase block">Diagnosa Aktif</span>
          <span className="text-2xl font-black text-red-600 font-mono mt-1 block">{countDiagnosing} Unit</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs text-left">
          <span className="text-[11px] text-amber-700 font-bold uppercase block">Tunggu Approval</span>
          <span className="text-2xl font-black text-amber-800 font-mono mt-1 block">{countWaitingApproval} Unit</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-600/30 shadow-xs text-left">
          <span className="text-[11px] text-red-700 font-bold uppercase block">Pengerjaan</span>
          <span className="text-2xl font-black text-red-700 font-mono mt-1 block">{countInProgress} Unit</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-300 shadow-xs text-left">
          <span className="text-[11px] text-zinc-700 font-bold uppercase block">Quality Control</span>
          <span className="text-2xl font-black text-zinc-900 font-mono mt-1 block">{countQC} Unit</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs text-left">
          <span className="text-[11px] text-emerald-700 font-bold uppercase block">Selesai / Ambil</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">{countCompleted} Unit</span>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Main Workbench Layout: Left List & Right Workdesk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tickets Queue List */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 text-left">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">Daftar Antrean Servis</h3>
              <span className="text-xs font-mono font-bold text-zinc-400">{filteredTickets.length} Tiket</span>
            </div>

            {/* Search and filter controls */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari ID / Nama / Unit..."
                  className="w-full min-h-[44px] pl-8 pr-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:border-red-600 font-mono"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="min-h-[44px] px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-700 font-semibold focus:outline-none focus:border-red-600 cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="registered">Terdaftar</option>
                <option value="diagnosing">Diagnosa</option>
                <option value="waiting_approval">Tunggu Approval</option>
                <option value="in_progress">Pengerjaan</option>
                <option value="quality_control">Quality Control</option>
                <option value="completed">Selesai</option>
              </select>
            </div>
          </div>

          {/* List items */}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredTickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              const status = STATUS_CONFIG[t.status];
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-50/70 border-red-600 ring-2 ring-red-500/20 shadow-xs'
                      : 'bg-white border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono font-bold text-zinc-950">{t.id}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${status.badgeBg} ${status.badgeText}`}>
                      {status.label}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-zinc-800">{t.device.brand} {t.device.model}</p>
                  
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1 font-medium">
                    <span>{t.customer.name}</span>
                    <span className="font-mono font-bold text-zinc-900">{formatRupiah(t.estimate.totalAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Ticket Technician Workbench */}
        {selectedTicket ? (
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Quick Header */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xl font-black text-zinc-950">{selectedTicket.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_CONFIG[selectedTicket.status].badgeBg} ${STATUS_CONFIG[selectedTicket.status].badgeText}`}>
                      {STATUS_CONFIG[selectedTicket.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5 break-words">
                    {selectedTicket.device.brand} {selectedTicket.device.model} &bull; Pelanggan: <span className="font-bold text-zinc-800">{selectedTicket.customer.name}</span> ({selectedTicket.customer.phone})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleDirectSendWA(selectedTicket)}
                    className="min-h-[44px] px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa51] text-white border border-[#20ba59] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title={`Kirim chat WhatsApp resmi ke nomor pelanggan (${selectedTicket.customer.phone})`}
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim WA ke Pelanggan</span>
                  </button>

                  <button
                    onClick={() => onOpenWhatsAppPreview(selectedTicket)}
                    className="min-h-[44px] px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Log</span>
                  </button>

                  <button
                    onClick={() => onOpenReceipt(selectedTicket)}
                    className="min-h-[44px] px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileEdit className="w-4 h-4 text-zinc-600" />
                    <span>Cetak SPK</span>
                  </button>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleApplyStatusChange} className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider block">
                    Perbarui Status Servis & Kirim Notifikasi Otomatis
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsWaSettingsOpen(true)}
                    className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <Settings className="w-3 h-3 text-emerald-600" />
                    <span>WA Kantor: {waConfig.officePhone} (Ubah)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Ubah Status Menjadi:
                    </label>
                    <select
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value as TicketStatus)}
                      className="w-full min-h-[44px] px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 focus:outline-none focus:border-red-600"
                    >
                      <option value="diagnosing">2. Pemeriksaan & Diagnosa Laboratorium</option>
                      <option value="waiting_approval">3. Estimasi Biaya Siap (Tunggu Persetujuan)</option>
                      <option value="in_progress">4. Dalam Pengerjaan / Ganti Sparepart</option>
                      <option value="quality_control">5. Pengujian & Quality Control (QC)</option>
                      <option value="completed">6. Selesai 100% & Siap Diambil / Dikirim</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Catatan Teknisi (Masuk di WhatsApp Pelanggan):
                    </label>
                    <input
                      type="text"
                      value={technicianNote}
                      onChange={(e) => setTechnicianNote(e.target.value)}
                      placeholder="Contoh: Solder IC MOSFET rampung, ganti thermal paste"
                      className="w-full min-h-[44px] px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-800 focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Notif dikirim atas nama {waConfig.officeName} ({waConfig.autoSendMode === 'gateway_api' ? 'Auto Gateway API' : 'Direct WA Link'})
                  </span>

                  <button
                    type="submit"
                    className="min-h-[44px] px-5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Simpan Status & Kirim Notif</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Quality Control Checklist & Spareparts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* QC Check Manager */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                      Checklist QC (Klik untuk toggle)
                    </h4>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {selectedTicket.qcChecks.map((qc) => (
                    <button
                      key={qc.id}
                      type="button"
                      onClick={() => handleToggleQCCheck(qc.id)}
                      className={`w-full min-h-[44px] p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        qc.status === 'passed'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <span>{qc.name}</span>
                      {qc.status === 'passed' ? (
                        <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> PASS
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-bold">PENDING</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spareparts & Cost Editor */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Suku Cadang & Komponen
                  </h4>
                  <span className="font-mono text-xs font-black text-red-600">
                    Total: {formatRupiah(selectedTicket.estimate.totalAmount)}
                  </span>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedTicket.estimate.parts.map((p) => (
                    <div key={p.id} className="p-2.5 bg-zinc-50 rounded-xl text-xs flex justify-between">
                      <span className="text-zinc-800 font-semibold">{p.name}</span>
                      <span className="font-mono font-bold">{formatRupiah(p.price)}</span>
                    </div>
                  ))}
                </div>

                {/* Add part inline form */}
                <div className="pt-2 border-t border-zinc-100 space-y-2">
                  <span className="text-[11px] font-bold text-zinc-700 block">Tambah Komponen:</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Nama sparepart..."
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      className="flex-1 min-h-[44px] px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Harga (Rp)..."
                      value={newPartPrice || ''}
                      onChange={(e) => setNewPartPrice(Number(e.target.value))}
                      className="w-full sm:w-28 min-h-[44px] px-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddPart}
                      className="min-h-[44px] px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
                    >
                      + Tambah
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* WhatsApp & Gateway Settings Modal */}
      <WhatsAppSettingsModal
        isOpen={isWaSettingsOpen}
        onClose={() => setIsWaSettingsOpen(false)}
        onSaved={() => setWaConfig(getWhatsAppConfig())}
      />
    </div>
  );
};
