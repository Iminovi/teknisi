import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  MessageSquare, 
  Key, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  RotateCcw, 
  HelpCircle,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { 
  WhatsAppConfig, 
  getWhatsAppConfig, 
  saveWhatsAppConfig, 
  resetWhatsAppConfig,
  formatPhoneToInternational,
  sendWhatsAppMessage
} from '../services/whatsappConfigService';

interface WhatsAppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const WhatsAppSettingsModal: React.FC<WhatsAppSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [config, setConfig] = useState<WhatsAppConfig>(getWhatsAppConfig());
  const [testPhone, setTestPhone] = useState<string>('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);
  const [testing, setTesting] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const current = getWhatsAppConfig();
      setConfig(current);
      setTestPhone(current.officePhone.replace(/[^0-9]/g, ''));
      setTestResult(null);
      setSavedNotice(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveWhatsAppConfig(config);
    setSavedNotice(true);
    if (onSaved) onSaved();
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    if (window.confirm('Kembalikan konfigurasi nomor WhatsApp ke pengaturan bawaan?')) {
      const def = resetWhatsAppConfig();
      setConfig(def);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  const handleTestDispatch = async () => {
    if (!testPhone.trim()) {
      setTestResult({ success: false, message: 'Masukkan nomor WhatsApp tujuan uji coba terlebih dahulu.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const testMessage = `*UJI COBA NOTIFIKASI WHATSAPP - ${config.officeName.toUpperCase()}*\n\nHalo! Ini adalah pesan uji coba dari sistem servis komputer. Jika Anda membaca pesan ini, konfigurasi nomor WhatsApp kantor telah berfungsi dengan baik.\n\nNomor Kantor: ${config.officePhone}\nWaktu: ${new Date().toLocaleTimeString('id-ID')}`;

    try {
      // Temporarily save current form state so test uses it
      saveWhatsAppConfig(config);
      const res = await sendWhatsAppMessage(testPhone, testMessage);
      setTestResult(res);

      if (res.url && config.autoSendMode === 'direct_link') {
        window.open(res.url, '_blank');
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Terjadi kegagalan koneksi ke API.'
      });
    } finally {
      setTesting(false);
    }
  };

  const intlOfficePhone = formatPhoneToInternational(config.officePhone);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-zinc-950/80 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 text-left">
      <div className="w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 flex flex-col max-h-[92dvh] sm:max-h-[88vh] my-0 sm:my-auto shrink-0">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                Pengaturan WhatsApp & Gateway
              </span>
              <h3 className="text-sm sm:text-base font-bold text-zinc-950 truncate max-w-[220px] sm:max-w-md">
                Nomor WhatsApp Kantor & Pengiriman Otomatis
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs text-zinc-800">
          
          {savedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pengaturan WhatsApp kantor berhasil disimpan!</span>
            </div>
          )}

          {/* Section 1: Office WhatsApp Identity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <span className="font-extrabold text-zinc-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-600" />
                1. Identitas & Nomor WhatsApp Kantor
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Format Intl: +{intlOfficePhone || '62...'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-zinc-700 block mb-1">
                  Nomor WhatsApp Kantor / CS: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={config.officePhone}
                  onChange={(e) => setConfig({ ...config, officePhone: e.target.value })}
                  placeholder="Contoh: 0812-9900-8800"
                  className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:border-red-600 focus:bg-white"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Nomor ini akan tercantum di pesan notifikasi pelanggan, tanda terima (SPK), dan footer website.
                </p>
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">
                  Nama Resmi Workshop / Bisnis: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={config.officeName}
                  onChange={(e) => setConfig({ ...config, officeName: e.target.value })}
                  placeholder="Contoh: Republik Computer Service Center"
                  className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-red-600 focus:bg-white"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Digunakan pada kop surat, judul pesan WhatsApp, dan subjek email.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-zinc-700 block mb-1">
                  Alamat Fisik Workshop / Service Center:
                </label>
                <input
                  type="text"
                  value={config.officeAddress}
                  onChange={(e) => setConfig({ ...config, officeAddress: e.target.value })}
                  placeholder="Contoh: Jl. Raya Teknologi No. 102, Jakarta Selatan"
                  className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-red-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: How Notifications Are Sent to Customers */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-zinc-100 pb-2">
              <span className="font-extrabold text-zinc-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                2. Metode Pengiriman Notifikasi ke Pelanggan
              </span>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Pilih bagaimana pesan otomatis dikirimkan ke nomor WhatsApp pelanggan:
              </p>
            </div>

            {/* Radio Mode Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Direct WhatsApp Web / Click-to-Send */}
              <label 
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  config.autoSendMode === 'direct_link'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      Mode 1: Direct Web / Klik-Kirim
                    </span>
                    <input
                      type="radio"
                      name="autoSendMode"
                      value="direct_link"
                      checked={config.autoSendMode === 'direct_link'}
                      onChange={() => setConfig({ ...config, autoSendMode: 'direct_link' })}
                      className="accent-emerald-600"
                    />
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Gratis & Tanpa Perlu Langganan API
                  </span>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    Sistem membuat format pesan otomatis. Cukup 1-klik tombol <b>"Kirim via WhatsApp Kantor"</b> di tiket atau log, browser akan membuka WhatsApp Web / WhatsApp Desktop nomor kantor Anda ke nomor pelanggan.
                  </p>
                </div>
              </label>

              {/* Option B: WhatsApp Gateway API (Automated Background) */}
              <label 
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  config.autoSendMode === 'gateway_api'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      Mode 2: Otomatis via Gateway API
                    </span>
                    <input
                      type="radio"
                      name="autoSendMode"
                      value="gateway_api"
                      checked={config.autoSendMode === 'gateway_api'}
                      onChange={() => setConfig({ ...config, autoSendMode: 'gateway_api' })}
                      className="accent-emerald-600"
                    />
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    Otomatis 100% di Latar Belakang
                  </span>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    Pesan terkirim otomatis di latar belakang saat teknisi mengupdate status tanpa perlu buka tab WhatsApp. Memerlukan akun API Gateway (Fonnte, Wablas, atau Twilio).
                  </p>
                </div>
              </label>
            </div>

            {/* Sub-config for Mode 1 */}
            {config.autoSendMode === 'direct_link' && (
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoOpenOnStatusUpdate}
                    onChange={(e) => setConfig({ ...config, autoOpenOnStatusUpdate: e.target.checked })}
                    className="accent-emerald-600 w-4 h-4 rounded"
                  />
                  <span className="font-semibold text-zinc-800 text-[11px]">
                    Buka otomatis tab WhatsApp Web ke nomor pelanggan saat teknisi klik "Simpan Status"
                  </span>
                </label>
                <p className="text-[10px] text-zinc-500 pl-6">
                  Pastikan komputer teknisi/kantor sudah login ke WhatsApp Web (web.whatsapp.com) dengan nomor kantor.
                </p>
              </div>
            )}

            {/* Sub-config for Mode 2 (Gateway API Credentials) */}
            {config.autoSendMode === 'gateway_api' && (
              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-600" />
                    Kredensial WhatsApp Gateway API
                  </span>
                  <span className="text-[10px] text-emerald-800 font-medium">
                    Penyedia API WhatsApp Indonesia
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-700 block mb-1">
                      Penyedia / Gateway:
                    </label>
                    <select
                      value={config.gatewayProvider}
                      onChange={(e) => {
                        const val = e.target.value as 'fonnte' | 'wablas' | 'custom';
                        let url = config.gatewayApiUrl;
                        if (val === 'fonnte') url = 'https://api.fonnte.com/send';
                        if (val === 'wablas') url = 'https://kudus.wablas.com/api/send-message';
                        setConfig({ ...config, gatewayProvider: val, gatewayApiUrl: url });
                      }}
                      className="w-full min-h-[44px] px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                    >
                      <option value="fonnte">Fonnte (Rekomendasi - fonnte.com)</option>
                      <option value="wablas">Wablas (wablas.com)</option>
                      <option value="custom">Custom Webhook / REST API</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-zinc-700 block mb-1">
                      API Token / Authorization Key:
                    </label>
                    <input
                      type="text"
                      value={config.gatewayApiKey}
                      onChange={(e) => setConfig({ ...config, gatewayApiKey: e.target.value })}
                      placeholder="Masukkan token API..."
                      className="w-full min-h-[44px] px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-zinc-700 block mb-1">
                      Endpoint URL:
                    </label>
                    <input
                      type="url"
                      value={config.gatewayApiUrl}
                      onChange={(e) => setConfig({ ...config, gatewayApiUrl: e.target.value })}
                      placeholder="https://api.fonnte.com/send"
                      className="w-full min-h-[44px] px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-mono text-zinc-600 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                  <span>📌 Belum punya token? Daftarkan nomor kantor di <a href="https://fonnte.com" target="_blank" rel="noreferrer" className="underline font-bold">fonnte.com</a> (Scan QR nomor kantor di HP).</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Test Dispatch Tool */}
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
            <span className="font-bold text-zinc-900 block text-xs">
              Uji Coba Pengiriman Notifikasi WhatsApp:
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Nomor HP/WA penerima tes (contoh: 0812xxxxxxxx)"
                className="flex-1 min-h-[44px] px-3.5 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-mono text-zinc-900"
              />
              <button
                type="button"
                onClick={handleTestDispatch}
                disabled={testing}
                className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testing ? 'Mengirim...' : 'Tes Kirim Pesan'}</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-[11px] font-medium flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{testResult.message}</p>
                  {testResult.url && (
                    <a
                      href={testResult.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-emerald-700 underline font-bold"
                    >
                      <span>Buka Chat di WhatsApp Web Sekarang</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Quick Explanation in Indonesian */}
          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 text-amber-950 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-xs">
              <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
              Bagaimana cara kerja pengiriman pakai nomor kantor?
            </span>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-amber-900">
              <li>
                <b>Jika pakai Mode 1 (Gratis)</b>: Buka WhatsApp Web di komputer kasir/teknisi dengan scan QR dari nomor WA kantor. Saat ada notifikasi, klik tombol <b>"Kirim ke WA Pelanggan"</b>, WhatsApp akan terbuka dan Anda tinggal menekan tombol <i>Enter/Send</i>.
              </li>
              <li>
                <b>Jika pakai Mode 2 (Gateway)</b>: Daftarkan nomor WA kantor Anda di gateway seperti Fonnte. Pasang token di atas, maka setiap perubahan status tiket akan <b>otomatis terkirim dari nomor kantor tanpa intervensi manual</b>.
              </li>
            </ol>
          </div>

          {/* Bottom Actions Bar */}
          <div className="pt-3 border-t border-zinc-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] px-4 py-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Bawaan</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 border border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none min-h-[44px] px-6 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl transition-colors font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
