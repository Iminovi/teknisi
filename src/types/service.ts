export type DeviceCategory = 
  | 'laptop'
  | 'pc'
  | 'gpu'
  | 'macbook'
  | 'monitor'
  | 'printer'
  | 'other';

export type TicketStatus =
  | 'registered'
  | 'diagnosing'
  | 'waiting_approval'
  | 'in_progress'
  | 'quality_control'
  | 'completed'
  | 'cancelled';

export interface TimelineEvent {
  id: string;
  status: TicketStatus;
  title: string;
  description: string;
  timestamp: string;
  technicianName: string;
  note?: string;
  photoUrl?: string;
}

export interface PartItem {
  id: string;
  name: string;
  brand?: string;
  price: number;
  warrantyPeriod: string;
}

export interface ServiceEstimate {
  parts: PartItem[];
  serviceFee: number;
  totalAmount: number;
  estimatedCompletion: string;
  diagnosisNotes: string;
  isApproved: boolean | null; // null = pending customer decision, true = approved, false = rejected
  decisionAt?: string;
  decisionNote?: string;
}

export interface QCCheckItem {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'pending';
  notes?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string; // WhatsApp number
  email: string;
  address: string;
  preferredChannel: 'whatsapp' | 'email' | 'both';
}

export interface DeviceInfo {
  category: DeviceCategory;
  brand: string;
  model: string;
  serialNumber?: string;
  pinOrPassword?: string;
  physicalCondition: string;
  accessories: string[];
  photoUrls?: string[];
}

export interface TechnicianInfo {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  phone: string;
}

export interface ServiceTicket {
  id: string; // e.g. "RC-2026-0842"
  createdAt: string;
  updatedAt: string;
  customer: CustomerInfo;
  device: DeviceInfo;
  complaints: string[];
  complaintDetail: string;
  deliveryMethod: 'dropoff' | 'pickup';
  pickupAddress?: string;
  status: TicketStatus;
  priority: 'normal' | 'express';
  technician: TechnicianInfo;
  estimate: ServiceEstimate;
  timeline: TimelineEvent[];
  qcChecks: QCCheckItem[];
  warrantyInfo: {
    durationDays: number;
    terms: string;
    validUntil?: string;
  };
}

export interface NotificationItem {
  id: string;
  ticketId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  channel: 'whatsapp' | 'email' | 'in_app';
  type: 
    | 'ticket_created'
    | 'diagnosis_started'
    | 'estimate_ready'
    | 'estimate_approved'
    | 'repair_started'
    | 'qc_in_progress'
    | 'service_completed'
    | 'status_changed'
    | 'custom_technician_message';
  title: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  previewData?: {
    deviceModel: string;
    trackingUrl: string;
    estimatedCost?: number;
    completionDate?: string;
  };
}

export interface StatusMeta {
  label: string;
  stepNumber: number;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  description: string;
  nextStepText?: string;
}

export const STATUS_CONFIG: Record<TicketStatus, StatusMeta> = {
  registered: {
    label: 'Tiket Terdaftar',
    stepNumber: 1,
    badgeBg: 'bg-zinc-100 border border-zinc-200',
    badgeText: 'text-zinc-800',
    dotColor: 'bg-zinc-400',
    description: 'Permohonan servis telah diterima sistem Republik Computer. Menunggu penyerahan unit ke workshop.',
    nextStepText: 'Terima Unit & Mulai Diagnosa'
  },
  diagnosing: {
    label: 'Pemeriksaan & Diagnosa',
    stepNumber: 2,
    badgeBg: 'bg-red-50 border border-red-200',
    badgeText: 'text-red-700',
    dotColor: 'bg-red-600',
    description: 'Unit sedang dibongkar dan diperiksa secara menyeluruh oleh teknisi spesialis untuk mengidentifikasi komponen rusak.',
    nextStepText: 'Kirim Estimasi Biaya ke Pelanggan'
  },
  waiting_approval: {
    label: 'Menunggu Persetujuan Biaya',
    stepNumber: 3,
    badgeBg: 'bg-amber-50 border border-amber-200',
    badgeText: 'text-amber-800',
    dotColor: 'bg-amber-500',
    description: 'Estimasi biaya sparepart & jasa telah dikirimkan ke pelanggan. Menunggu konfirmasi persetujuan pengerjaan.',
    nextStepText: 'Mulai Pengerjaan & Penggantian'
  },
  in_progress: {
    label: 'Dalam Proses Pengerjaan',
    stepNumber: 4,
    badgeBg: 'bg-red-600',
    badgeText: 'text-white shadow-xs',
    dotColor: 'bg-white',
    description: 'Teknisi sedang melakukan perbaikan solder, reballing, atau penggantian komponen sparepart baru.',
    nextStepText: 'Lanjut ke Quality Control (QC)'
  },
  quality_control: {
    label: 'Pengujian & Quality Control',
    stepNumber: 5,
    badgeBg: 'bg-zinc-900',
    badgeText: 'text-white',
    dotColor: 'bg-red-500',
    description: 'Perangkat sedang menjalani pengujian stabilitas suhu, benchmark performa, dan cek fungsi menyeluruh.',
    nextStepText: 'Selesaikan & Siap Diambil'
  },
  completed: {
    label: 'Selesai & Siap Diambil',
    stepNumber: 6,
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    dotColor: 'bg-white',
    description: 'Perbaikan telah selesai 100% dan lolos QC. Unit siap diambil di workshop atau dikirimkan ke alamat Anda.',
    nextStepText: 'Unit Sudah Diambil Pelanggan'
  },
  cancelled: {
    label: 'Dibatalkan',
    stepNumber: 0,
    badgeBg: 'bg-rose-50 border border-rose-200',
    badgeText: 'text-rose-700',
    dotColor: 'bg-rose-600',
    description: 'Proses servis dibatalkan atas permintaan pelanggan atau unit tidak dapat diperbaiki.',
  }
};

export const DEVICE_CATEGORIES: Array<{ id: DeviceCategory; label: string; icon: string; description: string }> = [
  { id: 'laptop', label: 'Laptop / Notebook', icon: 'Laptop', description: 'Gaming, Ultrabook, Office (Asus, Lenovo, Acer, HP, Dell)' },
  { id: 'pc', label: 'PC Desktop & Rig', icon: 'Monitor', description: 'PC Gaming Rakitan, All-in-One, Mini PC, Server Kantor' },
  { id: 'gpu', label: 'VGA / Kartu Grafis', icon: 'Cpu', description: 'NVIDIA RTX/GTX, AMD Radeon (Mati, Artifact, Reballing)' },
  { id: 'macbook', label: 'MacBook & iMac', icon: 'Laptop2', description: 'MacBook Air, MacBook Pro M1/M2/Intel, iMac, Mac Mini' },
  { id: 'monitor', label: 'Monitor Layar', icon: 'Tv', description: 'Monitor Gaming 144Hz+, Ultrawide, Panel LED/OLED' },
  { id: 'printer', label: 'Printer & Scanner', icon: 'Printer', description: 'Epson, Canon, HP (Head mampet, roller, infus)' },
  { id: 'other', label: 'Perangkat Lain', icon: 'Wrench', description: 'Console Game, Motherboard, Power Supply, Soundcard' },
];

export const COMMON_COMPLAINTS = [
  'Mati Total / Tidak Bisa Nyala',
  'Layar Blank / No Display',
  'Bluescreen (BSOD) Sering Restart',
  'Overheat / Suhu Sangat Panas & Bising',
  'Layar Pecah / Bergaris / Artifact',
  'Terkena Tumpahan Air (Water Damage)',
  'Engsel Patah / Casing Retak',
  'Keyboard Tidak Berfungsi / Ketik Sendiri',
  'Baterai Drop / Kembung / Tidak Mengisi',
  'Port USB / Type-C / HDMI Rusak',
  'Upgrade SSD NVMe & Tambah RAM',
  'Cleaning Deep Dust & Repaste Thermal'
];
