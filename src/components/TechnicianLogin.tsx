import React, { useState } from 'react';
import { 
  Wrench, 
  Lock, 
  User, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Cpu
} from 'lucide-react';
import { DEFAULT_TECHNICIANS, loginTechnician, TechnicianUser } from '../services/authService';

interface TechnicianLoginProps {
  onSuccess: (user: TechnicianUser) => void;
  onBackToHome: () => void;
}

export const TechnicianLogin: React.FC<TechnicianLoginProps> = ({
  onSuccess,
  onBackToHome
}) => {
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = loginTechnician(identifier, secret);
      setIsLoading(false);
      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setErrorMsg(res.message);
      }
    }, 350);
  };

  const handleQuickLogin = (tech: TechnicianUser) => {
    setIdentifier(tech.email);
    setSecret(tech.pin);
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = loginTechnician(tech.email, tech.pin);
      setIsLoading(false);
      if (res.success && res.user) {
        onSuccess(res.user);
      }
    }, 200);
  };

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 text-left">
      {/* Return button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors min-h-[44px] px-3 -ml-3 rounded-lg hover:bg-zinc-100 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pelacakan Pelanggan</span>
        </button>

        <span className="text-[11px] font-mono text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-md">
          Portal Internal v2.4 &bull; Area Terbatas
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Login Form Card */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-zinc-200/50">
          <div className="space-y-6">
            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                <span>Autentikasi Workshop & Lab Servis</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Login Portal Teknisi
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed">
                Akses khusus staf teknisi bersertifikasi Republik Computer untuk update diagnosa, persetujuan biaya, dan penugasan pengerjaan unit.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  ID Teknisi / Alamat Email Resmi
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Contoh: budi.teknisi@republikcomputer.id atau TECH-01"
                    required
                    className="w-full min-h-[48px] pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-red-600 focus:bg-white rounded-xl text-xs sm:text-sm text-zinc-900 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Password atau 4-Digit PIN
                  </label>
                  <span className="text-[11px] text-zinc-400">PIN 4 digit / sandi</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Masukkan sandi atau PIN (misal: 1234)"
                    required
                    className="w-full min-h-[48px] pl-10 pr-11 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-red-600 focus:bg-white rounded-xl text-xs sm:text-sm text-zinc-900 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                    aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 border-zinc-300 focus:ring-red-500 cursor-pointer"
                  />
                  <span className="text-xs text-zinc-600 font-medium">Ingat sesi teknisi di perangkat ini</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[48px] px-5 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi Kredensial...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Masuk ke Dashboard Teknisi</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-zinc-100 flex items-center gap-2 text-[11px] text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sesi diamankan dengan otentikasi role-based akses khusus operasional workshop.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Demo Quick-Select Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-950 text-white rounded-3xl p-6 border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Akses Cepat Pengujian (1-Klik)
                </h2>
              </div>
              <span className="text-[10px] bg-red-600/30 text-red-400 px-2 py-0.5 rounded font-mono font-bold">
                DEMO LOGIN
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Klik salah satu profil teknisi resmi di bawah ini untuk langsung masuk tanpa perlu mengetik manual:
            </p>

            <div className="space-y-2.5">
              {DEFAULT_TECHNICIANS.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => handleQuickLogin(tech)}
                  className="w-full text-left p-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-red-500/50 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-700 group-hover:border-red-500 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-red-400 transition-colors truncate">
                          {tech.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded">
                          {tech.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {tech.role}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        PIN: <span className="text-amber-400 font-bold">{tech.pin}</span> &bull; Shift: {tech.shift.split('(')[0]}
                      </p>
                    </div>
                  </div>

                  <span className="min-h-[32px] px-2.5 py-1 text-[11px] font-bold text-white bg-red-600 group-hover:bg-red-500 rounded-lg shrink-0 flex items-center gap-1 shadow-sm">
                    Pilih
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <Cpu className="w-4 h-4 text-amber-600" />
              <span>Informasi Kredensial Manual:</span>
            </div>
            <ul className="text-[11px] space-y-1 text-amber-800 list-disc list-inside">
              <li><strong>Lead Budi:</strong> <code className="bg-amber-100 px-1 py-0.5 rounded">budi.teknisi@republikcomputer.id</code> (PIN: 1234)</li>
              <li><strong>GPU Rian:</strong> <code className="bg-amber-100 px-1 py-0.5 rounded">rian.gpu@republikcomputer.id</code> (PIN: 2345)</li>
              <li><strong>QC Siti:</strong> <code className="bg-amber-100 px-1 py-0.5 rounded">siti.qc@republikcomputer.id</code> (PIN: 3456)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
