import React, { useState, useEffect } from 'react';
import { X, Printer, Wrench, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ServiceTicket, STATUS_CONFIG } from '../types/service';
import { formatRupiah } from '../services/notificationService';
import { getWhatsAppConfig, onWhatsAppConfigChanged, WhatsAppConfig } from '../services/whatsappConfigService';

interface ServiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: ServiceTicket | null;
}

export const ServiceReceiptModal: React.FC<ServiceReceiptModalProps> = ({
  isOpen,
  onClose,
  ticket
}) => {
  const [waConfig, setWaConfig] = useState<WhatsAppConfig>(getWhatsAppConfig());

  useEffect(() => {
    if (isOpen) {
      setWaConfig(getWhatsAppConfig());
    }
    const unsub = onWhatsAppConfigChanged((cfg) => {
      setWaConfig(cfg);
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen || !ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-zinc-950/80 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 print:p-0 print:bg-white print:block">
      <div className="w-full sm:max-w-3xl bg-white rounded-t-2xl sm:rounded-2xl border border-zinc-200 shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[90vh] overflow-hidden my-0 sm:my-auto shrink-0 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-none print:max-h-none print:rounded-none text-left">
        {/* Modal Controls (Hidden in print) */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 shrink-0 sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-red-600 shrink-0" />
            <span className="text-xs font-bold text-zinc-900 truncate">
              Surat Tanda Terima Servis & Garansi
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="min-h-[40px] px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-4 sm:p-8 space-y-6 text-zinc-900 bg-white overflow-y-auto flex-1 print:overflow-visible print:p-0">
          {/* Header Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b-2 border-red-600 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-sm">
                  RC
                </div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-950">
                  REPUBLIK <span className="text-red-600">COMPUTER</span>
                </h1>
              </div>
              <p className="text-xs text-zinc-600 font-semibold">
                {waConfig.officeName} &bull; Pusat Servis Komputer & Laptop Profesional
              </p>
              <p className="text-[11px] text-zinc-500">
                {waConfig.officeAddress} &bull; CS WhatsApp: <b className="text-zinc-800">{waConfig.officePhone}</b>
              </p>
            </div>

            {/* Ticket & Barcode */}
            <div className="text-left sm:text-right space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-zinc-400 block">
                SURAT TANDA TERIMA SERVIS (SPK)
              </span>
              <div className="font-mono text-2xl font-black text-red-600">
                {ticket.id}
              </div>
              <div className="inline-block py-1 px-3 bg-zinc-100 rounded text-center">
                <div className="h-6 flex items-center gap-0.5 justify-center">
                  <div className="w-1 h-full bg-zinc-900" />
                  <div className="w-0.5 h-full bg-zinc-900" />
                  <div className="w-1.5 h-full bg-zinc-900" />
                  <div className="w-0.5 h-full bg-zinc-900" />
                  <div className="w-1 h-full bg-zinc-900" />
                  <div className="w-2 h-full bg-zinc-900" />
                  <div className="w-0.5 h-full bg-zinc-900" />
                  <div className="w-1.5 h-full bg-zinc-900" />
                  <div className="w-1 h-full bg-zinc-900" />
                  <div className="w-0.5 h-full bg-zinc-900" />
                </div>
                <span className="text-[9px] font-mono text-zinc-500 block mt-0.5">SCAN-TO-TRACK</span>
              </div>
            </div>
          </div>

          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px] font-medium">Tanggal Registrasi:</span>
              <span className="font-bold text-zinc-800">
                {new Date(ticket.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px] font-medium">Status Terkini:</span>
              <span className="font-black text-red-600">
                {STATUS_CONFIG[ticket.status].label}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px] font-medium">Teknisi PIC:</span>
              <span className="font-bold text-zinc-800">{ticket.technician.name}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px] font-medium">Prioritas Pengerjaan:</span>
              <span className="font-bold text-zinc-800 uppercase">{ticket.priority}</span>
            </div>
          </div>

          {/* Customer & Device Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs">
            <div className="p-4 rounded-xl border border-zinc-200 space-y-2">
              <span className="font-bold text-zinc-900 block border-b pb-1">
                Data Pemilik Perangkat
              </span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Nama Lengkap:</span>
                  <span className="font-bold text-zinc-900">{ticket.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">No. WhatsApp:</span>
                  <span className="font-mono font-bold text-zinc-900">{ticket.customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Email:</span>
                  <span className="text-zinc-700">{ticket.customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Alamat:</span>
                  <span className="text-zinc-700 text-right max-w-[200px] truncate">{ticket.customer.address}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 space-y-2">
              <span className="font-bold text-zinc-900 block border-b pb-1">
                Spesifikasi & Kondisi Unit
              </span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tipe Perangkat:</span>
                  <span className="font-bold text-zinc-900">{ticket.device.brand} {ticket.device.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Serial Number:</span>
                  <span className="font-mono font-bold text-zinc-900">{ticket.device.serialNumber || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Kondisi Fisik:</span>
                  <span className="text-zinc-700 text-right max-w-[180px] truncate">{ticket.device.physicalCondition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Kelengkapan:</span>
                  <span className="text-zinc-700">{ticket.device.accessories.join(', ') || 'Unit only'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Complaints */}
          <div className="p-4 rounded-xl border border-zinc-200 text-xs space-y-2">
            <span className="font-bold text-zinc-900 block">Keluhan & Gejala Awal:</span>
            <div className="flex flex-wrap gap-1.5">
              {ticket.complaints.map((c, i) => (
                <span key={i} className="bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded font-semibold">
                  {c}
                </span>
              ))}
            </div>
            <p className="text-zinc-600 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 italic">
              "{ticket.complaintDetail}"
            </p>
          </div>

          {/* Itemized Cost Breakdown Table */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
            <div className="px-4 py-2 bg-zinc-100 font-bold text-zinc-800 flex justify-between">
              <span>Rincian Biaya Suku Cadang & Jasa Servis</span>
              <span>Harga (IDR)</span>
            </div>
            <div className="divide-y divide-zinc-100">
              {ticket.estimate.parts.map((p) => (
                <div key={p.id} className="px-4 py-2 flex justify-between">
                  <div>
                    <span className="font-semibold text-zinc-900">{p.name}</span>
                    <span className="text-[11px] text-zinc-400 block">{p.warrantyPeriod}</span>
                  </div>
                  <span className="font-mono font-bold">{formatRupiah(p.price)}</span>
                </div>
              ))}
              <div className="px-4 py-2 flex justify-between">
                <div>
                  <span className="font-semibold text-zinc-900">Jasa Servis & Laboratorium Chipset</span>
                  <span className="text-[11px] text-zinc-400 block">Garansi Pengerjaan Resmi</span>
                </div>
                <span className="font-mono font-bold">{formatRupiah(ticket.estimate.serviceFee)}</span>
              </div>
              <div className="px-4 py-2.5 bg-red-50/50 flex justify-between items-center font-bold text-sm">
                <span>TOTAL BIAYA:</span>
                <span className="font-mono text-base text-red-600">
                  {formatRupiah(ticket.estimate.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Signature Signoff */}
          <div className="grid grid-cols-2 pt-6 text-center text-xs">
            <div className="space-y-12">
              <span className="text-zinc-500 block">Tanda Tangan Pelanggan,</span>
              <div>
                <p className="font-bold text-zinc-900">{ticket.customer.name}</p>
                <span className="text-[10px] text-zinc-400">Pemilik Unit</span>
              </div>
            </div>

            <div className="space-y-12">
              <span className="text-zinc-500 block">Teknisi / Staff Republik Computer,</span>
              <div>
                <p className="font-bold text-zinc-900">{ticket.technician.name}</p>
                <span className="text-[10px] text-zinc-400">Diagnostic & Service Specialist</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
