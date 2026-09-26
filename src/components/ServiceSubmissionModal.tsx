import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { COMMON_COMPLAINTS, DEVICE_CATEGORIES, DeviceCategory, ServiceTicket } from '../types/service';
import { createServiceTicket } from '../services/storage';

interface ServiceSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: (ticket: ServiceTicket) => void;
}

export const ServiceSubmissionModal: React.FC<ServiceSubmissionModalProps> = ({
  isOpen,
  onClose,
  onTicketCreated
}) => {
  const [step, setStep] = useState<number>(1);
  const [category, setCategory] = useState<DeviceCategory>('laptop');
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [pinOrPassword, setPinOrPassword] = useState<string>('');
  const [physicalCondition, setPhysicalCondition] = useState<string>('Unit terawat dengan baret pemakaian wajar.');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(['Adaptor / Charger Original']);

  const [selectedComplaints, setSelectedComplaints] = useState<string[]>(['Mati Total / Tidak Bisa Nyala']);
  const [complaintDetail, setComplaintDetail] = useState<string>('');

  const [deliveryMethod, setDeliveryMethod] = useState<'dropoff' | 'pickup'>('dropoff');
  const [pickupAddress, setPickupAddress] = useState<string>('');

  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');

  const [createdTicket, setCreatedTicket] = useState<ServiceTicket | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lock body scroll when modal is open to prevent double scrollbars
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleComplaint = (item: string) => {
    if (selectedComplaints.includes(item)) {
      setSelectedComplaints(selectedComplaints.filter(c => c !== item));
    } else {
      setSelectedComplaints([...selectedComplaints, item]);
    }
  };

  const toggleAccessory = (acc: string) => {
    if (selectedAccessories.includes(acc)) {
      setSelectedAccessories(selectedAccessories.filter(a => a !== acc));
    } else {
      setSelectedAccessories([...selectedAccessories, acc]);
    }
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!brand.trim() || !model.trim()) {
        setErrorMsg('Mohon isi merk dan tipe/seri model perangkat Anda.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedComplaints.length === 0 && !complaintDetail.trim()) {
        setErrorMsg('Pilih minimal 1 keluhan atau tuliskan detail gejala kerusakan.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Nama lengkap dan nomor WhatsApp wajib diisi untuk notifikasi pengerjaan.');
      return;
    }

    if (deliveryMethod === 'pickup' && !pickupAddress.trim() && !customerAddress.trim()) {
      setErrorMsg('Mohon masukkan alamat penjemputan unit untuk kurir Republik Computer.');
      return;
    }

    const ticket = createServiceTicket({
      customer: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail || `${customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        address: customerAddress || pickupAddress || 'Alamat diserahkan di workshop',
        preferredChannel: 'whatsapp'
      },
      device: {
        category,
        brand,
        model,
        serialNumber: serialNumber || undefined,
        pinOrPassword: pinOrPassword || undefined,
        physicalCondition,
        accessories: selectedAccessories,
        photoUrls: []
      },
      complaints: selectedComplaints.length > 0 ? selectedComplaints : ['Pengecekan Komprehensif'],
      complaintDetail: complaintDetail || 'Pengecekan komponen & penanganan keluhan teknisi Republik Computer.',
      deliveryMethod,
      pickupAddress: deliveryMethod === 'pickup' ? (pickupAddress || customerAddress) : undefined,
      priority: 'normal'
    });

    setCreatedTicket(ticket);
  };

  const handleCloseModal = () => {
    setStep(1);
    setCreatedTicket(null);
    setErrorMsg(null);
    onClose();
  };

  const handleViewTicket = () => {
    if (createdTicket) {
      onTicketCreated(createdTicket);
      handleCloseModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-y-auto overflow-x-hidden">
      <div className="w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl border border-zinc-200 shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden my-0 sm:my-auto shrink-0 text-left animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        {/* Modal Header (Fixed at top of modal, always visible on mobile & desktop) */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 shrink-0 sticky top-0 z-20">
          <div>
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">
              Formulir Servis Resmi
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-zinc-950">
              {createdTicket ? 'Permohonan Servis Diterbitkan' : 'Ajukan Perbaikan Perangkat'}
            </h3>
          </div>
          <button
            onClick={handleCloseModal}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Tutup Formulir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
          {createdTicket ? (
            /* SUCCESS STATE */
            <div className="text-center py-4 sm:py-6 space-y-4 sm:space-y-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>

              <div>
                <span className="text-xs font-bold text-red-700 bg-red-50 px-3 py-1 rounded-full uppercase tracking-wider border border-red-100">
                  Tiket Resmi Diterbitkan
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono mt-2">
                  {createdTicket.id}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-md mx-auto leading-relaxed">
                  Terima kasih, Kak <span className="font-bold text-zinc-900">{createdTicket.customer.name}</span>! Permohonan servis untuk unit <span className="font-bold text-zinc-900">{createdTicket.device.brand} {createdTicket.device.model}</span> telah tersimpan di sistem Republik Computer.
                </p>
              </div>

              {/* Notification info card */}
              <div className="p-3.5 sm:p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-zinc-900">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <span>Sistem Notifikasi WhatsApp Aktif</span>
                </div>
                <p className="text-zinc-600 leading-relaxed text-[11px]">
                  Tanda terima servis dan tautan pelacakan live telah otomatis dikirim ke nomor WhatsApp <span className="font-mono font-bold text-red-600">{createdTicket.customer.phone}</span>.
                </p>
              </div>

              {/* Action buttons (Touch target >= 44px) */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={handleViewTicket}
                  className="min-h-[44px] px-6 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Buka Pelacakan Real-Time</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="min-h-[44px] px-5 py-2.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          ) : (
            /* WIZARD FORM */
            <form onSubmit={handleSubmit} id="repair-form" className="space-y-5 text-left">
              {/* Stepper indicator */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 text-[11px] sm:text-xs">
                <span className={`font-bold ${step >= 1 ? 'text-red-600' : 'text-zinc-400'}`}>
                  1. Perangkat & Tipe
                </span>
                <span className="text-zinc-300">&bull;</span>
                <span className={`font-bold ${step >= 2 ? 'text-red-600' : 'text-zinc-400'}`}>
                  2. Keluhan
                </span>
                <span className="text-zinc-300">&bull;</span>
                <span className={`font-bold ${step >= 3 ? 'text-red-600' : 'text-zinc-400'}`}>
                  3. Pengantaran & Kontak
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* STEP 1: Device Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-2">
                      Pilih Kategori Perangkat:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {DEVICE_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`min-h-[48px] p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer w-full min-w-0 ${
                            category === cat.id
                              ? 'border-red-600 bg-red-50/70 text-red-950 ring-2 ring-red-500/20'
                              : 'border-zinc-200 hover:border-zinc-300 text-zinc-700 bg-white'
                          }`}
                        >
                          <span className="font-bold block leading-tight truncate">{cat.label}</span>
                          <span className="text-[10px] text-zinc-400 block truncate mt-0.5">{cat.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">
                        Merk / Brand <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="Contoh: ASUS, Lenovo, Apple, Dell"
                        className="w-full min-h-[44px] px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-500/10"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">
                        Tipe / Seri Model <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="Contoh: ROG Zephyrus G14, RTX 4070"
                        className="w-full min-h-[44px] px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-500/10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">
                        Nomor Seri (Serial Number / SN) <span className="text-zinc-400 font-normal">(Opsional)</span>
                      </label>
                      <input
                        type="text"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        placeholder="Tertera di stiker bawah unit atau box"
                        className="w-full min-h-[44px] px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-red-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">
                        PIN / Password Unit <span className="text-zinc-400 font-normal">(Untuk uji software)</span>
                      </label>
                      <input
                        type="text"
                        value={pinOrPassword}
                        onChange={(e) => setPinOrPassword(e.target.value)}
                        placeholder="Contoh: PIN 1234 atau Kosongkan"
                        className="w-full min-h-[44px] px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1">
                      Kondisi Fisik Awal Unit
                    </label>
                    <input
                      type="text"
                      value={physicalCondition}
                      onChange={(e) => setPhysicalCondition(e.target.value)}
                      placeholder="Contoh: Baret halus cover, layar mulus, segel utuh"
                      className="w-full min-h-[44px] px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1">
                      Kelengkapan yang Disertakan:
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {['Adaptor / Charger Original', 'Kabel Power', 'Tas / Sleeve', 'Box Asli', 'Hanya Unit Saja'].map((acc) => (
                        <button
                          key={acc}
                          type="button"
                          onClick={() => toggleAccessory(acc)}
                          className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                            selectedAccessories.includes(acc)
                              ? 'bg-red-50 border-red-600 text-red-900'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                          }`}
                        >
                          {acc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Complaints & Issues */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-2">
                      Pilih Masalah / Gejala Kerusakan:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {COMMON_COMPLAINTS.map((complaint) => {
                        const isSelected = selectedComplaints.includes(complaint);
                        return (
                          <button
                            key={complaint}
                            type="button"
                            onClick={() => toggleComplaint(complaint)}
                            className={`min-h-[44px] p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-red-50 border-red-600 text-red-950 font-bold'
                                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                            }`}
                          >
                            <span>{complaint}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 ml-1.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1">
                      Kronologi Tambahan:
                    </label>
                    <textarea
                      rows={3}
                      value={complaintDetail}
                      onChange={(e) => setComplaintDetail(e.target.value)}
                      placeholder="Jelaskan secara singkat kronologinya, misal: terkena tumpahan cairan saat bekerja, atau kipas berbunyi kasar saat render..."
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="p-3.5 bg-red-50/60 border border-red-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-red-950">Kebijakan Diagnosa Transparan</span>
                    <p className="text-red-900 text-[11px] leading-relaxed">
                      Pemeriksaan awal dilakukan gratis tanpa biaya jika perbaikan dibatalkan sebelum persetujuan estimasi pengerjaan.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: Delivery & Customer Info */}
              {step === 3 && (
                <div className="space-y-4">
                  {/* Delivery Method Selection */}
                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-2">
                      Metode Penyerahan Unit:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('dropoff')}
                        className={`min-h-[48px] p-3 rounded-xl border text-left text-xs cursor-pointer ${
                          deliveryMethod === 'dropoff'
                            ? 'border-red-600 bg-red-50/70 text-red-950 ring-2 ring-red-500/20'
                            : 'border-zinc-200 bg-white text-zinc-700'
                        }`}
                      >
                        <span className="font-bold block">Antar Langsung ke Workshop</span>
                        <span className="text-[11px] text-zinc-500 block mt-0.5">
                          Jl. Raya Teknologi No. 102, Jakarta (Buka Setiap Hari 09.00 - 20.00)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`min-h-[48px] p-3 rounded-xl border text-left text-xs cursor-pointer ${
                          deliveryMethod === 'pickup'
                            ? 'border-red-600 bg-red-50/70 text-red-950 ring-2 ring-red-500/20'
                            : 'border-zinc-200 bg-white text-zinc-700'
                        }`}
                      >
                        <span className="font-bold block">Layanan Jemput Kurir Workshop</span>
                        <span className="text-[11px] text-zinc-500 block mt-0.5">
                          Kurir menjemput unit ke alamat Anda dengan kemasan busa pengaman
                        </span>
                      </button>
                    </div>
                  </div>

                  {deliveryMethod === 'pickup' && (
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">
                        Alamat Lengkap Penjemputan <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        placeholder="Contoh: Jl. Sudirman Kav 21, Tower B Lt 10, Jakarta Selatan"
                        className="w-full min-h-[44px] px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-red-600"
                        required
                      />
                    </div>
                  )}

                  {/* Customer Information */}
                  <div className="pt-2 border-t border-zinc-100 space-y-3">
                    <span className="text-xs font-bold text-zinc-800 block">
                      Data Pemilik (Untuk Notifikasi WhatsApp Otomatis):
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-zinc-700 block mb-1">
                          Nama Lengkap <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Nama Anda"
                          className="w-full min-h-[44px] px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-red-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-700 block mb-1">
                          Nomor WhatsApp <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Contoh: 081234567890"
                          className="w-full min-h-[44px] px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-red-600 font-mono"
                          required
                        />
                        <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                          ✓ Resi tiket & update status dikirim langsung ke WhatsApp ini
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-zinc-700 block mb-1">
                          Alamat Email <span className="text-zinc-400 font-normal">(Opsional)</span>
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full min-h-[44px] px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-red-600"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-700 block mb-1">
                          Kota / Wilayah Domisili
                        </label>
                        <input
                          type="text"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Contoh: Jakarta Selatan / Tangerang"
                          className="w-full min-h-[44px] px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Modal Fixed Footer with Navigation Controls (Always visible, thumb-friendly) */}
        {!createdTicket && (
          <div className="px-4 sm:px-6 py-3 border-t border-zinc-100 bg-zinc-50/80 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="min-h-[44px] px-4 py-2 text-xs font-bold text-zinc-700 hover:text-zinc-950 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="min-h-[44px] px-6 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Lanjutkan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                form="repair-form"
                className="min-h-[44px] px-6 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-md shadow-red-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Terbitkan Tiket Servis</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
