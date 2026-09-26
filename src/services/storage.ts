import { INITIAL_TICKETS } from '../data/initialTickets';
import { NotificationItem, ServiceTicket, TicketStatus, TimelineEvent } from '../types/service';
import { buildNotificationItems, playNotificationSound } from './notificationService';

const STORAGE_KEY_TICKETS = 'republik_computer_service_tickets_v1';
const STORAGE_KEY_NOTIFS = 'republik_computer_service_notifications_v1';
const EVENT_TICKETS_UPDATED = 'republik_computer_tickets_updated';
const EVENT_NOTIF_RECEIVED = 'republik_computer_notif_received';

export function getTickets(): ServiceTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    return parsed;
  } catch {
    return INITIAL_TICKETS;
  }
}

export function saveTickets(tickets: ServiceTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
    window.dispatchEvent(new CustomEvent(EVENT_TICKETS_UPDATED, { detail: tickets }));
  } catch (err) {
    console.error('Failed to save tickets:', err);
  }
}

export function getTicketById(id: string): ServiceTicket | undefined {
  const tickets = getTickets();
  const cleanId = id.trim().toUpperCase();
  return tickets.find(t => t.id.toUpperCase() === cleanId);
}

export function findTicketsByQuery(query: string): ServiceTicket[] {
  const tickets = getTickets();
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // Match Ticket ID, Phone, Customer Name, Serial Number, or Brand/Model
  return tickets.filter(t => 
    t.id.toLowerCase().includes(q) ||
    t.customer.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) ||
    t.customer.name.toLowerCase().includes(q) ||
    (t.device.serialNumber && t.device.serialNumber.toLowerCase().includes(q)) ||
    t.device.model.toLowerCase().includes(q) ||
    t.device.brand.toLowerCase().includes(q)
  );
}

export function getNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (!raw) {
      // Seed some initial notifications from tickets
      const initialNotifs: NotificationItem[] = [];
      const tickets = getTickets();
      for (const t of tickets) {
        const notifs = buildNotificationItems(t, 'created');
        initialNotifs.push(...notifs.slice(0, 2));
      }
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(initialNotifs));
      return initialNotifs;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addNotifications(newItems: NotificationItem[]): void {
  try {
    const existing = getNotifications();
    const updated = [...newItems, ...existing].slice(0, 100); // keep last 100
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NOTIF_RECEIVED, { detail: newItems }));
    playNotificationSound();
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

export function generateNextTicketId(): string {
  const tickets = getTickets();
  const currentYear = new Date().getFullYear();
  const prefix = `RC-${currentYear}-`;
  
  // Find highest number
  let maxNum = 1200;
  for (const t of tickets) {
    if (t.id.startsWith(prefix)) {
      const numPart = parseInt(t.id.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }
  return `${prefix}${String(maxNum + 1).padStart(4, '0')}`;
}

export function createServiceTicket(data: Omit<ServiceTicket, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'qcChecks' | 'estimate' | 'warrantyInfo' | 'technician' | 'status'>): ServiceTicket {
  const newId = generateNextTicketId();
  const now = new Date().toISOString();

  const newTicket: ServiceTicket = {
    ...data,
    id: newId,
    createdAt: now,
    updatedAt: now,
    status: 'registered',
    technician: {
      id: 'TECH-AUTO',
      name: 'Tim Workshop Republik Computer',
      role: 'Hardware Diagnostic Team',
      phone: '0812-9900-8800'
    },
    estimate: {
      parts: [],
      serviceFee: 0,
      totalAmount: 0,
      estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      diagnosisNotes: 'Unit baru didaftarkan. Sedang dijadwalkan untuk penyerahan fisik ke meja diagnosis teknisi.',
      isApproved: null
    },
    timeline: [
      {
        id: `TL-${Date.now()}`,
        status: 'registered',
        title: 'Tiket Servis Dibuat Pelanggan',
        description: `Permohonan servis diajukan untuk perangkat ${data.device.brand} ${data.device.model} dengan metode ${data.deliveryMethod === 'pickup' ? 'Penjemputan Alamat' : 'Antar Sendiri ke Workshop'}.`,
        timestamp: now,
        technicianName: 'Sistem Otomatis Republik'
      }
    ],
    qcChecks: [
      { id: 'qc-pwr', name: 'Power & Voltage Input Check', status: 'pending' },
      { id: 'qc-disp', name: 'Display & Graphics Signal', status: 'pending' },
      { id: 'qc-io', name: 'Ports, Audio & Peripherals', status: 'pending' },
      { id: 'qc-thermal', name: 'Thermal Stability & Fan Operation', status: 'pending' }
    ],
    warrantyInfo: {
      durationDays: 90,
      terms: 'Garansi resmi pengerjaan servis & suku cadang Republik Computer selama 90 hari.',
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  };

  const tickets = getTickets();
  saveTickets([newTicket, ...tickets]);

  // Dispatch automated notifications
  const notifs = buildNotificationItems(newTicket, 'created');
  addNotifications(notifs);

  return newTicket;
}

export function updateTicketStatus(
  ticketId: string, 
  newStatus: TicketStatus, 
  note?: string,
  extraData?: Partial<Pick<ServiceTicket, 'estimate' | 'qcChecks' | 'technician'>>
): ServiceTicket | null {
  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index === -1) return null;

  const current = tickets[index];
  const now = new Date().toISOString();

  // Create timeline record
  const timelineTitles: Record<TicketStatus, string> = {
    registered: 'Tiket Didaftarkan',
    diagnosing: 'Unit Diterima & Diagnosa Dimulai',
    waiting_approval: 'Estimasi Biaya Selesai & Dikirim ke Pelanggan',
    in_progress: 'Persetujuan Diterima & Pengerjaan Dimulai',
    quality_control: 'Unit Masuk Tahap Quality Control & Stress Testing',
    completed: 'Servis Selesai & Unit Siap Diambil',
    cancelled: 'Servis Dibatalkan'
  };

  const newTimelineItem: TimelineEvent = {
    id: `TL-${Date.now()}`,
    status: newStatus,
    title: timelineTitles[newStatus] || `Status Diperbarui: ${newStatus}`,
    description: note || `Status perbaikan diubah menjadi ${newStatus}.`,
    timestamp: now,
    technicianName: extraData?.technician?.name || current.technician.name,
    note
  };

  const updatedTicket: ServiceTicket = {
    ...current,
    status: newStatus,
    updatedAt: now,
    estimate: extraData?.estimate ? { ...current.estimate, ...extraData.estimate } : current.estimate,
    qcChecks: extraData?.qcChecks || current.qcChecks,
    technician: extraData?.technician || current.technician,
    timeline: [...current.timeline, newTimelineItem]
  };

  // If status is completed, activate warranty validity
  if (newStatus === 'completed') {
    const validUntilDate = new Date(Date.now() + updatedTicket.warrantyInfo.durationDays * 24 * 60 * 60 * 1000);
    updatedTicket.warrantyInfo.validUntil = validUntilDate.toISOString().split('T')[0];
  }

  tickets[index] = updatedTicket;
  saveTickets(tickets);

  // Trigger automated notifications
  let eventType: 'created' | 'status_changed' | 'estimate_ready' | 'approved' | 'completed' = 'status_changed';
  if (newStatus === 'waiting_approval') eventType = 'estimate_ready';
  if (newStatus === 'completed') eventType = 'completed';

  const notifs = buildNotificationItems(updatedTicket, eventType, note);
  addNotifications(notifs);

  return updatedTicket;
}

export function customerApproveEstimate(ticketId: string, approved: boolean, note?: string): ServiceTicket | null {
  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index === -1) return null;

  const current = tickets[index];
  const now = new Date().toISOString();

  const newStatus: TicketStatus = approved ? 'in_progress' : 'cancelled';

  const timelineItem: TimelineEvent = {
    id: `TL-${Date.now()}`,
    status: newStatus,
    title: approved ? 'Persetujuan Biaya Disetujui Pelanggan' : 'Persetujuan Biaya Ditolak Pelanggan',
    description: approved 
      ? `Pelanggan telah menyetujui total estimasi biaya perbaikan dan menyetujui pengerjaan dimulai.`
      : `Pelanggan membatalkan perbaikan. Unit akan disiapkan untuk pengembalian.`,
    timestamp: now,
    technicianName: 'Konfirmasi Pelanggan',
    note: note || (approved ? 'Disetujui via Portal Online' : 'Ditolak via Portal Online')
  };

  const updatedTicket: ServiceTicket = {
    ...current,
    status: newStatus,
    updatedAt: now,
    estimate: {
      ...current.estimate,
      isApproved: approved,
      decisionAt: now,
      decisionNote: note || (approved ? 'Persetujuan online diberikan' : 'Dibatalkan oleh pelanggan')
    },
    timeline: [...current.timeline, timelineItem]
  };

  tickets[index] = updatedTicket;
  saveTickets(tickets);

  const notifs = buildNotificationItems(
    updatedTicket, 
    approved ? 'approved' : 'status_changed',
    approved ? 'Pelanggan telah menyetujui estimasi biaya secara resmi.' : 'Pelanggan membatalkan pengerjaan.'
  );
  addNotifications(notifs);

  return updatedTicket;
}

export function resetDemoData(): void {
  localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(INITIAL_TICKETS));
  localStorage.removeItem(STORAGE_KEY_NOTIFS);
  window.dispatchEvent(new CustomEvent(EVENT_TICKETS_UPDATED, { detail: INITIAL_TICKETS }));
}
