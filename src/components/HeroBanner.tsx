import React from 'react';
import { Search, Shield, Zap, BellRing, ArrowRight, CheckCircle, ChevronRight } from 'lucide-react';

interface HeroBannerProps {
  onStartTracking: () => void;
  onOpenSubmit: () => void;
  sampleTicketId: string;
  onQuickTrack: (ticketId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onStartTracking,
  onOpenSubmit,
  sampleTicketId,
  onQuickTrack
}) => {
  return (
    <section className="relative bg-white border-b border-zinc-200 overflow-hidden">
      {/* Subtle brand ambient crimson glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
            {/* Kicker Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>Divisi Servis Resmi & Diagnosa Chip-Level</span>
            </div>

            {/* Main Headline (Anti-orphan text balance) */}
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 leading-[1.15]" 
              style={{ textWrap: 'balance' }}
            >
              Servis Komputer & Laptop Terpercaya dengan <span className="text-red-600 underline decoration-red-200 decoration-wavy decoration-2 underline-offset-8">Pelacakan Real-Time</span>
            </h1>

            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Ajukan perbaikan perangkat Anda dengan transparan. Pantau tahapan diagnosa, persetujuan biaya, hingga uji beban QC secara langsung dengan notifikasi otomatis di WhatsApp Anda.
            </p>

            {/* Action Buttons (Touch Target >= 44px, Full Width on Mobile, Inline on Desktop) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onOpenSubmit}
                className="min-h-[48px] px-6 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-md shadow-red-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Ajukan Servis Sekarang</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onStartTracking}
                className="min-h-[48px] px-6 py-3 text-sm font-bold text-zinc-800 hover:text-zinc-950 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Search className="w-4 h-4 text-red-600" />
                <span>Lacak Status Tiket</span>
              </button>
            </div>

            {/* Fast Demo Sample Track Link */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="font-medium">Coba cek status sampel:</span>
              <button
                onClick={() => onQuickTrack(sampleTicketId)}
                className="font-mono text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                {sampleTicketId} (ASUS Zephyrus)
              </button>
            </div>
          </div>

          {/* Right Column: Hero Feature Showcase Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-7 shadow-xl shadow-zinc-900/5 space-y-4">
              <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Standar Servis Republik Computer
                </span>
                <span className="text-xs text-red-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Garansi Resmi
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Pelacakan Live 6 Tahap</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                      Pantau proses mulai dari registrasi tiket, diagnosa mikroskop, estimasi biaya, pengerjaan, hingga uji QC 24 jam.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Gateway WhatsApp Otomatis</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                      Update status instan langsung dikirim ke WhatsApp tanpa perlu bertanya berulang kali kepada admin.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Garansi Komponen 90 Hari</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                      Setiap pergantian sparepart dan pengerjaan chip-level dilindungi jaminan garansi resmi tertulis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
