import React from 'react';
import { ShieldCheck, Award, Cpu, Clock, MapPin } from 'lucide-react';

interface StandardWarrantySectionProps {
  onOpenSubmit: () => void;
}

export const StandardWarrantySection: React.FC<StandardWarrantySectionProps> = ({ onOpenSubmit }) => {
  return (
    <section className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-red-600 uppercase tracking-wider bg-red-50 border border-red-100 px-3 py-1 rounded-full">
          Komitmen Kualitas & Kepercayaan
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
          Standar Kerja & Jaminan Garansi Resmi Republik Computer
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
          Kami menjamin transparansi 100% pada setiap proses: diagnosa berbasis mikroskop & multimeter, komponen asli teruji, serta garansi resmi tertulis pada SPK digital Anda.
        </p>
      </div>

      {/* 4 Pillars of Excellence (Responsive Grid: 1 col on mobile, 2 on tablet, 4 on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold border border-red-100">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-zinc-900">Garansi Hingga 90 Hari</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Pergantian IC chip, power controller, keyboard, baterai, maupun VRAM dilindungi garansi resmi tertulis dengan sertifikat digital.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold border border-red-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-zinc-900">No Fix No Fee (Bebas Biaya)</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Jika unit tidak dapat diperbaiki karena kerusakan PCB terlalu parah atau Anda tidak menyetujui estimasi, tidak ada biaya perbaikan yang ditagihkan.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold border border-red-100">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-zinc-900">Stress Test Burn-in 24 Jam</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Unit yang selesai diperbaiki tidak langsung diserahkan, melainkan diuji kestabilan thermal Furmark, Cinebench, dan AIDA64 untuk memastikan 100% prima.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold border border-red-100">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-zinc-900">Notifikasi WhatsApp Real-Time</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Tak perlu repot menanyakan status berulang kali. Gateway otomatis kami mengirimkan progress ke WhatsApp begitu ada pembaruan teknis.
          </p>
        </div>
      </div>

      {/* Workshop Location & Visit Information */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Lokasi Workshop Resmi</span>
          </div>

          <h3 className="text-2xl font-black text-zinc-950">
            Republik Computer Service Hub
          </h3>

          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Kunjungi service center kami untuk konsultasi langsung dengan teknisi chip-level kami atau serahkan unit untuk diagnosa kilat di tempat.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="space-y-1">
              <span className="text-zinc-400 block font-medium">Alamat Workshop:</span>
              <p className="text-zinc-900 font-bold leading-relaxed">
                Jl. Raya Teknologi No. 102, Kebayoran Baru, Jakarta Selatan
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-zinc-400 block font-medium">Jam Operasional:</span>
              <p className="text-zinc-900 font-bold">
                Senin - Minggu: 09.00 - 20.00 WIB
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-zinc-400 block font-medium">WhatsApp Customer Care:</span>
              <p className="text-zinc-900 font-mono font-bold">
                0812-9900-8800 (Fast Response)
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-zinc-400 block font-medium">Layanan Antar-Jemput:</span>
              <p className="text-zinc-900 font-bold">
                Tersedia Area Jabodetabek
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-zinc-50 p-6 rounded-2xl border border-zinc-200 space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto shadow-md shadow-red-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-zinc-950">Punya Perangkat Bermasalah?</h4>
            <p className="text-xs text-zinc-500 mt-1">
              Konsultasikan kerusakan laptop atau PC Anda tanpa ragu. Dapatkan estimasi awal sekarang.
            </p>
          </div>
          <button
            onClick={onOpenSubmit}
            className="w-full min-h-[48px] py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Ajukan Servis Online Sekarang
          </button>
        </div>
      </div>
    </section>
  );
};
