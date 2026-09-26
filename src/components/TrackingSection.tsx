import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Wrench, 
  FileText, 
  MessageSquare, 
  Printer, 
  ShieldCheck, 
  Laptop, 
  ArrowRight, 
  ThumbsUp, 
  ThumbsDown, 
  User, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { ServiceTicket, STATUS_CONFIG, TicketStatus } from '../types/service';
import { getTickets, findTicketsByQuery, customerApproveEstimate, updateTicketStatus } from '../services/storage';
import { formatRupiah } from '../services/notificationService';
import { getWhatsAppConfig, generateWhatsAppUrl, onWhatsAppConfigChanged, WhatsAppConfig } from '../services/whatsappConfigService';

interface TrackingSectionProps {
  initialTicketId?: string;
  onOpenReceipt: (ticket: ServiceTicket) => void;
  onOpenWhatsAppPreview: (ticket: ServiceTicket) => void;
  onNavigateToSubmit: () => void;
}

export const TrackingSection: React.FC<TrackingSectionProps> = ({
  initialTicketId,
  onOpenReceipt,
  onOpenWhatsAppPreview,
  onNavigateToSubmit
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialTicketId || '');
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [allTickets, setAllTickets] = useState<ServiceTicket[]>([]);
  const [approvalLoading, setApprovalLoading] = useState<boolean>(false);
  const [statusActionNotice, setStatusActionNotice] = useState<string | null>(null);
  const [waConfig, setWaConfig] = useState<WhatsAppConfig>(getWhatsAppConfig());

  const refreshTickets = () => {
    const list = getTickets();
    setAllTickets(list);
    setWaConfig(getWhatsAppConfig());
    if (selectedTicket) {
      const refreshed = list.find(t => t.id === selectedTicket.id);
      if (refreshed) setSelectedTicket(refreshed);
    }
  };

  useEffect(() => {
    refreshTickets();
    const handleUpdate = () => refreshTickets();
    window.addEventListener('republik_computer_tickets_updated', handleUpdate);
    return () => window.removeEventListener('republik_computer_tickets_updated', handleUpdate);
  }, [selectedTicket?.id]);

  useEffect(() => {
    const list = getTickets();
    if (initialTicketId) {
      const found = list.find(t => t.id.toUpperCase() === initialTicketId.toUpperCase());
      if (found) {
        setSelectedTicket(found);
        setSearchQuery(found.id);
        return;
      }
    }
    if (list.length > 0 && !selectedTicket) {
      setSelectedTicket(list[0]);
      setSearchQuery(list[0].id);
    }

    const unsub = onWhatsAppConfigChanged((cfg) => {
      setWaConfig(cfg);
    });
    return () => unsub();
  }, [initialTicketId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const matches = findTicketsByQuery(searchQuery);
    if (matches.length > 0) {
      setSelectedTicket(matches[0]);
    } else {
      setSelectedTicket(null);
    }
  };

  const selectTicketDirectly = (ticket: ServiceTicket) => {
    setSelectedTicket(ticket);
    setSearchQuery(ticket.id);
  };

  const handleApprove = (approved: boolean) => {
    if (!selectedTicket) return;
    setApprovalLoading(true);
    setTimeout(() => {
      const updated = customerApproveEstimate(
        selectedTicket.id, 
        approved, 
        approved ? 'Disetujui oleh pelanggan melalui portal online Republik Computer' : 'Dibatalkan oleh pelanggan'
      );
      if (updated) {
        setSelectedTicket(updated);
        setStatusActionNotice(
          approved 
            ? 'Persetujuan biaya telah berhasil dikonfirmasi. Teknisi segera memulai pengerjaan.'
            : 'Pengerjaan dibatalkan. Unit akan disiapkan untuk pengembalian.'
        );
        setTimeout(() => setStatusActionNotice(null), 6000);
      }
      setApprovalLoading(false);
    }, 400);
  };

  const handleAdvanceSimulation = () => {
    if (!selectedTicket) return;
    const statusFlow: TicketStatus[] = [
      'registered',
      'diagnosing',
      'waiting_approval',
      'in_progress',
      'quality_control',
      'completed'
    ];
    const currentIndex = statusFlow.indexOf(selectedTicket.status);
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) {
      updateTicketStatus(selectedTicket.id, 'diagnosing', 'Simulasi: Unit diperiksa kembali di meja teknisi.');
      return;
    }
    const nextStatus = statusFlow[currentIndex + 1];
    const updated = updateTicketStatus(
      selectedTicket.id, 
      nextStatus, 
      `Simulasi pengerjaan otomatis Republik Computer: Melangkah ke tahap ${STATUS_CONFIG[nextStatus].label}.`
    );
    if (updated) {
      setSelectedTicket(updated);
      setStatusActionNotice(`Status diupdate ke: "${STATUS_CONFIG[nextStatus].label}". Notifikasi otomatis telah dikirim!`);
      setTimeout(() => setStatusActionNotice(null), 5000);
    }
  };

  const STEPS: Array<{ key: TicketStatus; label: string; number: number }> = [
    { key: 'registered', label: 'Tiket Didaftar', number: 1 },
    { key: 'diagnosing', label: 'Diagnosa & Uji', number: 2 },
    { key: 'waiting_approval', label: 'Estimasi Biaya', number: 3 },
    { key: 'in_progress', label: 'Pengerjaan', number: 4 },
    { key: 'quality_control', label: 'Quality Control', number: 5 },
    { key: 'completed', label: 'Selesai & Diambil', number: 6 },
  ];

  const getStepState = (stepIndex: number, currentStatus: TicketStatus) => {
    const currentStepNum = STATUS_CONFIG[currentStatus]?.stepNumber || 0;
    const stepTargetNum = stepIndex + 1;

    if (currentStatus === 'cancelled') return 'cancelled';
    if (currentStepNum > stepTargetNum) return 'completed';
    if (currentStepNum === stepTargetNum) return 'active';
    return 'upcoming';
  };

  return (
    <section id="tracking-section" className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Search Header Container */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-8 shadow-sm mb-8">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full">
            <Search className="w-3.5 h-3.5" />
            <span>Sistem Pelacakan Servis 24/7</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Lacak Status Servis Perangkat Anda
          </h2>

          <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto">
            Ketik nomor resi tiket servis Anda (contoh: <span className="font-mono font-bold text-zinc-800">RC-2026-0842</span>) atau nomor WhatsApp yang didaftarkan.
          </p>

          {/* Search Form (Mobile Touch-Friendly) */}
          <form onSubmit={handleSearch} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan Nomor Tiket atau No. WhatsApp..."
                className="w-full min-h-[48px] pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              className="min-h-[48px] px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Cari Tiket
            </button>
          </form>

          {/* Fast Demo Sample Selector */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-zinc-400 font-medium">Klik cepat sampel servis:</span>
            {allTickets.slice(0, 4).map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => selectTicketDirectly(ticket)}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  selectedTicket?.id === ticket.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                {ticket.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notice alert */}
      {statusActionNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{statusActionNotice}</span>
          </div>
          <button
            onClick={() => setStatusActionNotice(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 underline font-semibold ml-4 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Ticket Details View */}
      {selectedTicket ? (
        <div className="space-y-6 sm:space-y-8">
          {/* Main Status & Stepper Banner */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-8 shadow-sm">
            {/* Header info row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
              <div className="space-y-1 text-left">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">
                    Nomor Resi Tiket
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${STATUS_CONFIG[selectedTicket.status].badgeBg} ${STATUS_CONFIG[selectedTicket.status].badgeText}`}>
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${STATUS_CONFIG[selectedTicket.status].dotColor} animate-pulse`} />
                    {STATUS_CONFIG[selectedTicket.status].label}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-mono tracking-tight">
                  {selectedTicket.id}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600">
                  {selectedTicket.device.brand} {selectedTicket.device.model} &bull; Pemilik: <span className="font-bold text-zinc-900">{selectedTicket.customer.name}</span>
                </p>
              </div>

              {/* Actions row (Touch Target >= 44px) */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onOpenWhatsAppPreview(selectedTicket)}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                  title="Lihat pesan WhatsApp otomatis yang dikirim ke pelanggan"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Preview WhatsApp</span>
                </button>

                <button
                  onClick={() => onOpenReceipt(selectedTicket)}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-xl transition-colors cursor-pointer"
                  title="Cetak Surat Tanda Terima (SPK Servis)"
                >
                  <Printer className="w-4 h-4 text-zinc-600" />
                  <span>Cetak Nota / SPK</span>
                </button>

                {/* Quick Simulation Advancement Button */}
                <button
                  onClick={handleAdvanceSimulation}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer"
                  title="Simulasikan perpindahan ke status selanjutnya"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-red-600" />
                  <span>Simulasi Tahap Berikutnya</span>
                </button>
              </div>
            </div>

            {/* Visual Milestones Stepper */}
            <div className="py-6 sm:py-8">
              <div className="relative">
                {/* Connecting bar for desktop */}
                <div className="hidden lg:block absolute top-5 left-10 right-10 h-0.5 bg-zinc-200 -z-0" />

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {STEPS.map((step, idx) => {
                    const state = getStepState(idx, selectedTicket.status);

                    let iconBg = 'bg-zinc-100 text-zinc-400 border-zinc-200';
                    let textClass = 'text-zinc-400';
                    let statusLabel = 'Menunggu';

                    if (state === 'completed') {
                      iconBg = 'bg-emerald-600 text-white border-emerald-600 shadow-xs shadow-emerald-600/20';
                      textClass = 'text-zinc-900 font-bold';
                      statusLabel = 'Selesai';
                    } else if (state === 'active') {
                      iconBg = 'bg-red-600 text-white border-red-600 ring-4 ring-red-100 shadow-sm shadow-red-600/30';
                      textClass = 'text-red-600 font-extrabold';
                      statusLabel = 'Sedang Berjalan';
                    }

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${iconBg}`}>
                          {state === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <span className="font-mono">{step.number}</span>
                          )}
                        </div>
                        <div className="mt-2.5">
                          <p className={`text-xs ${textClass}`}>{step.label}</p>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">{statusLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current status description callout */}
              <div className="mt-6 sm:mt-8 p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-start gap-3.5 text-left">
                <div className="w-8 h-8 rounded-lg bg-red-600/10 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Tahapan Saat Ini: {STATUS_CONFIG[selectedTicket.status].label}
                  </h4>
                  <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                    {STATUS_CONFIG[selectedTicket.status].description}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Terakhir diperbarui: {new Date(selectedTicket.updatedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })} oleh <span className="text-zinc-800 font-semibold">{selectedTicket.technician.name}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Approval Action Card (Crucial for waiting_approval status) */}
            {selectedTicket.status === 'waiting_approval' && (
              <div className="mt-4 p-5 sm:p-6 bg-amber-50/70 border-2 border-amber-300 rounded-2xl space-y-4 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Persetujuan Estimasi Biaya Diperlukan
                    </span>
                    <h4 className="text-base font-bold text-zinc-900 mt-1">
                      Konfirmasi Pengerjaan Servis oleh Pemilik Perangkat
                    </h4>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Diagnosa selesai. Silakan periksa rincian biaya komponen dan jasa sebelum pengerjaan fisik dimulai oleh teknisi.
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-zinc-500 block">Total Estimasi Biaya</span>
                    <span className="text-2xl font-black text-zinc-950 font-mono">
                      {formatRupiah(selectedTicket.estimate.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Diagnosis note */}
                <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-xs space-y-1">
                  <span className="font-bold text-zinc-800">Catatan Diagnosa Teknisi:</span>
                  <p className="text-zinc-600 italic">"{selectedTicket.estimate.diagnosisNotes}"</p>
                </div>

                {/* Itemized parts breakdown */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                  <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 text-xs font-bold text-zinc-700 flex justify-between">
                    <span>Rincian Komponen / Sparepart</span>
                    <span>Harga & Garansi</span>
                  </div>
                  <div className="divide-y divide-zinc-100 text-xs">
                    {selectedTicket.estimate.parts.map((p) => (
                      <div key={p.id} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-zinc-900">{p.name}</p>
                          <span className="text-[11px] text-zinc-400">{p.warrantyPeriod}</span>
                        </div>
                        <span className="font-mono font-bold text-zinc-900">{formatRupiah(p.price)}</span>
                      </div>
                    ))}
                    <div className="p-3 flex items-center justify-between bg-zinc-50/50">
                      <div>
                        <p className="font-semibold text-zinc-900">Jasa Perbaikan & Laboratorium Chipset</p>
                        <span className="text-[11px] text-zinc-400">Garansi Pengerjaan 90 Hari</span>
                      </div>
                      <span className="font-mono font-bold text-zinc-900">{formatRupiah(selectedTicket.estimate.serviceFee)}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons (Touch-Friendly >= 44px) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleApprove(false)}
                    disabled={approvalLoading}
                    className="min-h-[44px] px-4 py-2.5 text-xs font-bold text-zinc-700 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Batalkan Servis</span>
                  </button>

                  <button
                    onClick={() => handleApprove(true)}
                    disabled={approvalLoading}
                    className="min-h-[44px] px-6 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-sm shadow-red-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Setujui Estimasi & Mulai Perbaikan</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Two-Column Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Left Column: Device & Diagnostic Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Device Specs Card */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-red-600" />
                    <h4 className="text-sm font-bold text-zinc-900">Informasi Perangkat</h4>
                  </div>
                  <span className="text-xs font-mono text-zinc-500 uppercase">
                    Kategori: {selectedTicket.device.category}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-400 block font-medium">Merk & Model</span>
                    <span className="font-bold text-zinc-900 block mt-0.5 text-sm">
                      {selectedTicket.device.brand} {selectedTicket.device.model}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block font-medium">Nomor Seri (SN)</span>
                    <span className="font-mono font-bold text-zinc-800 block mt-0.5">
                      {selectedTicket.device.serialNumber || 'Tidak tercantum'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block font-medium">Kondisi Fisik Unit</span>
                    <span className="text-zinc-700 block mt-0.5">
                      {selectedTicket.device.physicalCondition}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block font-medium">Kelengkapan Diserahkan</span>
                    <span className="text-zinc-700 block mt-0.5">
                      {selectedTicket.device.accessories.length > 0
                        ? selectedTicket.device.accessories.join(', ')
                        : 'Hanya unit saja'}
                    </span>
                  </div>
                </div>

                {/* Complaints */}
                <div className="pt-3 border-t border-zinc-100">
                  <span className="text-xs text-zinc-400 block mb-1.5 font-medium">Keluhan Utama:</span>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedTicket.complaints.map((c, i) => (
                      <span key={i} className="text-xs bg-zinc-100 text-zinc-800 font-semibold px-2.5 py-1 rounded-md">
                        {c}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100 leading-relaxed">
                    "{selectedTicket.complaintDetail}"
                  </p>
                </div>
              </div>

              {/* Quality Control & Diagnostic Checks */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-bold text-zinc-900">Pengecekan Quality Control (QC)</h4>
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">Standar Uji 24 Jam</span>
                </div>

                <div className="space-y-2">
                  {selectedTicket.qcChecks.map((qc) => (
                    <div
                      key={qc.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs"
                    >
                      <span className="font-semibold text-zinc-800">{qc.name}</span>
                      {qc.status === 'passed' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Lolos Pengujian
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-400 font-medium">
                          <Clock className="w-3.5 h-3.5" /> Dalam Antrean Uji
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Warranty info */}
                <div className="p-3.5 bg-red-50/60 border border-red-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-950">Perlindungan Garansi Resmi</span>
                    <span className="font-mono font-black text-red-700">{selectedTicket.warrantyInfo.durationDays} Hari</span>
                  </div>
                  <p className="text-red-900 text-[11px] leading-relaxed">
                    {selectedTicket.warrantyInfo.terms}
                  </p>
                  {selectedTicket.warrantyInfo.validUntil && (
                    <p className="text-[11px] font-bold text-red-950 pt-1">
                      Berlaku Hingga: {selectedTicket.warrantyInfo.validUntil}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Timeline Log & Technician Profile */}
            <div className="lg:col-span-5 space-y-6 text-left">
              {/* Technician In Charge */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-3">
                  Teknisi Penanggung Jawab
                </span>

                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold text-base">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-sm font-bold text-zinc-950">{selectedTicket.technician.name}</h5>
                    <p className="text-xs text-red-600 font-semibold">{selectedTicket.technician.role}</p>
                    <p className="text-[11px] text-zinc-400 font-mono">Republik Computer Diagnostic Lab</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">Metode Pengiriman:</span>
                  <span className="font-bold text-zinc-900">
                    {selectedTicket.deliveryMethod === 'pickup' ? 'Layanan Jemput Kurir' : 'Antar Sendiri ke Toko'}
                  </span>
                </div>

                {/* Direct WA Contact with Office CS */}
                <a
                  href={generateWhatsAppUrl(
                    waConfig.officePhone, 
                    `Halo ${waConfig.officeName}, saya ${selectedTicket.customer.name}. Saya ingin berkonsultasi mengenai status pengerjaan tiket ${selectedTicket.id} (${selectedTicket.device.brand} ${selectedTicket.device.model}).`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Chat WhatsApp Hotline ({waConfig.officePhone})</span>
                </a>
              </div>

              {/* Chronological Activity Log */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <h4 className="text-sm font-bold text-zinc-900">Riwayat & Log Pengerjaan</h4>
                  <span className="text-xs text-zinc-400 font-mono">{selectedTicket.timeline.length} Aktivitas</span>
                </div>

                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-zinc-200">
                  {selectedTicket.timeline.slice().reverse().map((item, idx) => (
                    <div key={item.id || idx} className="relative pl-7 text-xs space-y-1">
                      <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-red-600 border-2 border-white shadow-xs" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-900">{item.title}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-zinc-600 text-[11px] leading-relaxed">{item.description}</p>
                      <span className="text-[10px] text-zinc-400 block font-medium">
                        Oleh: {item.technicianName} &bull; {new Date(item.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Not Found State */
        <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900">Tiket Tidak Ditemukan</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Nomor tiket atau nomor WhatsApp yang Anda masukkan belum terdaftar dalam sistem servis kami.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                if (allTickets.length > 0) selectTicketDirectly(allTickets[0]);
              }}
              className="min-h-[44px] px-4 py-2 text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
            >
              Lihat Tiket Demo
            </button>
            <button
              onClick={onNavigateToSubmit}
              className="min-h-[44px] px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Ajukan Servis Baru
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
