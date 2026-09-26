export interface TechnicianUser {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  pin: string;
  password: string;
  avatar: string;
  badgeNumber: string;
  specialization: string;
  shift: string;
}

export const DEFAULT_TECHNICIANS: TechnicianUser[] = [
  {
    id: 'TECH-01',
    name: 'Budi Santoso, S.Kom',
    role: 'Lead Hardware & Chip-Level Specialist',
    email: 'budi.teknisi@republikcomputer.id',
    phone: '0812-3456-7890',
    pin: '1234',
    password: 'adminteknisi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    badgeNumber: 'RC-ENG-001',
    specialization: 'Motherboard Diagnostik & SMD Micro-Soldering',
    shift: 'Shift Pagi (08:00 - 17:00 WIB)'
  },
  {
    id: 'TECH-02',
    name: 'Rian Pratama',
    role: 'Senior GPU & Micro-Soldering Engineer',
    email: 'rian.gpu@republikcomputer.id',
    phone: '0813-9876-5432',
    pin: '2345',
    password: 'gpuspesialis',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    badgeNumber: 'RC-ENG-007',
    specialization: 'VRAM Replacement & GPU Power Stage Repair',
    shift: 'Shift Siang (12:00 - 21:00 WIB)'
  },
  {
    id: 'TECH-03',
    name: 'Siti Rahmawati',
    role: 'Quality Assurance & Firmware Specialist',
    email: 'siti.qc@republikcomputer.id',
    phone: '0857-1122-3344',
    pin: '3456',
    password: 'qcrepublik',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
    badgeNumber: 'RC-QC-003',
    specialization: 'Final Benchmarking, Thermal Tuning & BIOS Flashing',
    shift: 'Shift Full-Time (09:00 - 18:00 WIB)'
  }
];

const STORAGE_KEY_AUTH = 'republik_computer_auth_session_v1';
const EVENT_AUTH_CHANGED = 'republik_computer_auth_changed';

export function getCurrentTechnician(): TechnicianUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isTechnicianAuthenticated(): boolean {
  return getCurrentTechnician() !== null;
}

export function loginTechnician(identifier: string, secret: string): { success: boolean; message: string; user?: TechnicianUser } {
  const cleanId = identifier.trim().toLowerCase();
  const cleanSecret = secret.trim();

  if (!cleanId || !cleanSecret) {
    return { success: false, message: 'Harap isi ID/Email dan Password atau PIN Anda.' };
  }

  // Find matching user
  const found = DEFAULT_TECHNICIANS.find(tech => 
    tech.id.toLowerCase() === cleanId ||
    tech.email.toLowerCase() === cleanId ||
    tech.phone.replace(/[^0-9]/g, '') === cleanId.replace(/[^0-9]/g, '')
  );

  if (!found) {
    return {
      success: false,
      message: 'Akun teknisi tidak ditemukan. Periksa kembali ID atau Email Anda.'
    };
  }

  // Check either password or PIN
  if (found.password === cleanSecret || found.pin === cleanSecret) {
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(found));
      window.dispatchEvent(new CustomEvent(EVENT_AUTH_CHANGED, { detail: found }));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
    return {
      success: true,
      message: `Selamat datang kembali, ${found.name}!`,
      user: found
    };
  }

  return {
    success: false,
    message: 'Kata sandi atau PIN salah. Silakan coba lagi.'
  };
}

export function logoutTechnician(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_AUTH);
    window.dispatchEvent(new CustomEvent(EVENT_AUTH_CHANGED, { detail: null }));
  } catch (e) {
    console.error('Failed to remove session:', e);
  }
}

export function onAuthChanged(callback: (user: TechnicianUser | null) => void): () => void {
  const handler = () => {
    callback(getCurrentTechnician());
  };
  window.addEventListener(EVENT_AUTH_CHANGED, handler);
  return () => window.removeEventListener(EVENT_AUTH_CHANGED, handler);
}
