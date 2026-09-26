import { NotificationItem, ServiceTicket, STATUS_CONFIG } from '../types/service';
import { getWhatsAppConfig, generateWhatsAppUrl, sendWhatsAppMessage } from './whatsappConfigService';

// Web Audio API synthesizer for clean, subtle notification sound
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // Pleasant two-tone chime (E5 -> B5)
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.12);

    osc2.frequency.setValueAtTime(659.25, now);
    osc2.frequency.exponentialRampToValueAtTime(987.77, now + 0.12);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch {
    // Ignore audio autoplay restrictions gracefully
  }
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function generateNotificationMessage(
  ticket: ServiceTicket,
  event: 'created' | 'status_changed' | 'estimate_ready' | 'approved' | 'completed' | 'custom',
  customNote?: string
): { title: string; whatsappText: string; emailSubject: string; emailBody: string; inAppText: string } {
  const statusInfo = STATUS_CONFIG[ticket.status];
  const baseUrl = window.location.origin;
  const trackingLink = `${baseUrl}/?ticket=${ticket.id}`;
  const waConfig = getWhatsAppConfig();
  const officeNameUpper = (waConfig.officeName || 'REPUBLIK COMPUTER').toUpperCase();
  const officePhone = waConfig.officePhone || '0812-9900-8800';
  const officeAddress = waConfig.officeAddress || 'Jl. Raya Teknologi No. 102, Jakarta';

  if (event === 'created') {
    const title = `Tiket Servis Diterima: ${ticket.id}`;
    const whatsappText = 
`*${officeNameUpper} - SERVICE CENTER*
Halo Kak *${ticket.customer.name}*, terima kasih telah mempercayakan perbaikan perangkat Anda kepada kami.

*NOMOR RESI TIKET:* \`${ticket.id}\`
*Perangkat:* ${ticket.device.brand} ${ticket.device.model}
*Kategori:* ${ticket.device.category.toUpperCase()}
*Keluhan Utama:* ${ticket.complaints.slice(0, 2).join(', ')}
*Metode:* ${ticket.deliveryMethod === 'pickup' ? 'Layanan Pickup Kurir Kami' : 'Antar Langsung ke Workshop'}

Tim teknisi kami akan segera melakukan pengecekan awal & diagnosa mendalam. Anda dapat memantau status pengerjaan secara *real-time* melalui tautan berikut:
👉 ${trackingLink}

_Pusat Bantuan WA Kantor: ${officePhone}_
_Pesan ini dikirimkan secara resmi oleh ${waConfig.officeName}._`;

    const emailSubject = `[${waConfig.officeName}] Konfirmasi Pendaftaran Servis #${ticket.id} - ${ticket.device.model}`;
    const emailBody = `Yth. Sdr/i ${ticket.customer.name},

Permohonan servis perangkat Anda telah resmi tercatat di sistem kami:
- No. Tiket: ${ticket.id}
- Unit: ${ticket.device.brand} ${ticket.device.model}
- Waktu Registrasi: ${new Date(ticket.createdAt).toLocaleString('id-ID')}
- Keluhan: ${ticket.complaints.join(', ')}

Silakan simpan nomor tiket ini untuk pengambilan unit dan pelacakan status secara live di: ${trackingLink}

Kontak Resmi Servis: ${officePhone} (${officeAddress})

Salam hangat,
Customer Care ${waConfig.officeName}`;

    return {
      title,
      whatsappText,
      emailSubject,
      emailBody,
      inAppText: `Tiket servis baru ${ticket.id} (${ticket.device.model}) berhasil dibuat!`
    };
  }

  if (ticket.status === 'waiting_approval') {
    const partsList = ticket.estimate.parts
      .map((p, idx) => `  ${idx + 1}. ${p.name} (${formatRupiah(p.price)})`)
      .join('\n');

    const title = `Estimasi Biaya Siap: ${ticket.id}`;
    const whatsappText =
`*${officeNameUpper} - ESTIMASI BIAYA SERVIS*
Halo Kak *${ticket.customer.name}*, diagnosa unit Anda (*${ticket.device.model}*) telah selesai.

*Hasil Diagnosa Teknisi (${ticket.technician.name}):*
"${ticket.estimate.diagnosisNotes}"

*Rincian Estimasi Biaya:*
${partsList}
  Biaya Jasa & Pengerjaan: ${formatRupiah(ticket.estimate.serviceFee)}
*TOTAL ESTIMASI:* *${formatRupiah(ticket.estimate.totalAmount)}*
*Estimasi Selesai:* ${new Date(ticket.estimate.estimatedCompletion).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

Silakan lakukan persetujuan atau diskusi dengan teknisi melalui link tracking:
👉 ${trackingLink}

_Unit tidak akan dikerjakan sebelum Anda memberikan persetujuan._
_WhatsApp Kantor: ${officePhone}_`;

    const emailSubject = `[Persetujuan Diperlukan] Estimasi Biaya Servis #${ticket.id} - ${ticket.device.model}`;
    const emailBody = `Halo ${ticket.customer.name},

Diagnosa untuk perangkat ${ticket.device.model} (Tiket: ${ticket.id}) telah rampung.
Hasil diagnosa: ${ticket.estimate.diagnosisNotes}

Total Biaya Yang Diperlukan: ${formatRupiah(ticket.estimate.totalAmount)}
Estimasi Waktu: ${ticket.estimate.estimatedCompletion}

Harap tinjau dan klik persetujuan pengerjaan di portal pelacakan kami:
${trackingLink}

${waConfig.officeName} Service Division
Hubungi kami: ${officePhone}`;

    return {
      title,
      whatsappText,
      emailSubject,
      emailBody,
      inAppText: `Estimasi biaya servis untuk tiket ${ticket.id} (${formatRupiah(ticket.estimate.totalAmount)}) telah siap ditinjau.`
    };
  }

  if (ticket.status === 'completed') {
    const title = `Servis Selesai & Siap Diambil: ${ticket.id}`;
    const whatsappText =
`🎉 *UNIT SELESAI DIPERBAIKI - ${officeNameUpper}*
Halo Kak *${ticket.customer.name}*, kabar gembira! Perangkat Anda (*${ticket.device.model}*) telah selesai diperbaiki dan telah LOLOS seluruh tahapan Quality Control (QC).

*NOMOR RESI TIKET:* \`${ticket.id}\`
*Status:* *Selesai & Siap Diambil*
*Garansi:* ${ticket.warrantyInfo.durationDays} Hari Garansi Resmi
*Teknisi:* ${ticket.technician.name}

Silakan datang ke Workshop kami dengan menunjukkan bukti tiket servis:
📍 *${waConfig.officeName}*
${officeAddress}
WhatsApp Kantor: ${officePhone}

Cek nota dan sertifikat garansi Anda di:
👉 ${trackingLink}

Terima kasih atas kepercayaannya!`;

    const emailSubject = `[Selesai 100%] Perangkat Anda Siap Diambil #${ticket.id} - ${waConfig.officeName}`;
    const emailBody = `Yth. ${ticket.customer.name},

Perangkat ${ticket.device.brand} ${ticket.device.model} Anda telah selesai diperbaiki dan siap diambil.
Semua pengecekan Quality Control telah dinyatakan lolos.

Silakan unduh atau cetak Surat Tanda Terima & Sertifikat Garansi Anda pada link:
${trackingLink}

Alamat Workshop: ${officeAddress}
CS WhatsApp: ${officePhone}

Hormat kami,
${waConfig.officeName}`;

    return {
      title,
      whatsappText,
      emailSubject,
      emailBody,
      inAppText: `Unit ${ticket.device.model} (Tiket ${ticket.id}) telah selesai diperbaiki dan siap diambil!`
    };
  }

  // Generic status update
  const title = `Update Servis: ${statusInfo.label} (${ticket.id})`;
  const customDetail = customNote ? `\n\n*Catatan Teknisi:*\n"${customNote}"` : '';

  const whatsappText =
`*UPDATE STATUS SERVIS - ${officeNameUpper}*
Halo Kak *${ticket.customer.name}*, terdapat pembaruan status pengerjaan perangkat Anda (*${ticket.device.model}*):

*Status Terkini:* *${statusInfo.label}*
*Keterangan:* ${statusInfo.description}${customDetail}
*Teknisi Penanggung Jawab:* ${ticket.technician.name}

Pantau terus tahapan perbaikan secara berkala melalui link berikut:
👉 ${trackingLink}

_Info/CS WhatsApp Kantor: ${officePhone}_`;

  const emailSubject = `[Update Status: ${statusInfo.label}] Tiket #${ticket.id} - ${waConfig.officeName}`;
  const emailBody = `Halo ${ticket.customer.name},

Status perbaikan untuk ${ticket.device.model} (#${ticket.id}) telah diperbarui menjadi:
${statusInfo.label}

Keterangan: ${statusInfo.description}
${customNote ? `Catatan Tambahan: ${customNote}` : ''}

Tautan Pelacakan: ${trackingLink}

Hotline WhatsApp: ${officePhone}

Salam,
${waConfig.officeName}`;

  return {
    title,
    whatsappText,
    emailSubject,
    emailBody,
    inAppText: `Status tiket ${ticket.id} diperbarui: ${statusInfo.label}`
  };
}

export function buildNotificationItems(
  ticket: ServiceTicket,
  event: 'created' | 'status_changed' | 'estimate_ready' | 'approved' | 'completed' | 'custom',
  customNote?: string
): NotificationItem[] {
  const generated = generateNotificationMessage(ticket, event, customNote);
  const now = new Date().toISOString();
  const baseId = `notif-${Date.now()}`;

  const items: NotificationItem[] = [];

  // WhatsApp item
  items.push({
    id: `${baseId}-wa`,
    ticketId: ticket.id,
    customerName: ticket.customer.name,
    customerPhone: ticket.customer.phone,
    customerEmail: ticket.customer.email,
    channel: 'whatsapp',
    type: event === 'created' ? 'ticket_created' : (ticket.status === 'completed' ? 'service_completed' : 'status_changed'),
    title: generated.title,
    message: generated.whatsappText,
    timestamp: now,
    status: 'delivered',
    previewData: {
      deviceModel: `${ticket.device.brand} ${ticket.device.model}`,
      trackingUrl: `${window.location.origin}/?ticket=${ticket.id}`,
      estimatedCost: ticket.estimate.totalAmount,
      completionDate: ticket.estimate.estimatedCompletion
    }
  });

  // Email item
  items.push({
    id: `${baseId}-mail`,
    ticketId: ticket.id,
    customerName: ticket.customer.name,
    customerPhone: ticket.customer.phone,
    customerEmail: ticket.customer.email,
    channel: 'email',
    type: event === 'created' ? 'ticket_created' : 'status_changed',
    title: generated.emailSubject,
    message: generated.emailBody,
    timestamp: now,
    status: 'sent',
    previewData: {
      deviceModel: `${ticket.device.brand} ${ticket.device.model}`,
      trackingUrl: `${window.location.origin}/?ticket=${ticket.id}`,
      estimatedCost: ticket.estimate.totalAmount
    }
  });

  // In-App browser notification
  items.push({
    id: `${baseId}-app`,
    ticketId: ticket.id,
    customerName: ticket.customer.name,
    customerPhone: ticket.customer.phone,
    customerEmail: ticket.customer.email,
    channel: 'in_app',
    type: 'status_changed',
    title: generated.title,
    message: generated.inAppText,
    timestamp: now,
    status: 'read'
  });

  // If user configured auto-open on status update, execute dispatch
  const config = getWhatsAppConfig();
  if (config.autoOpenOnStatusUpdate && typeof window !== 'undefined') {
    sendWhatsAppMessage(ticket.customer.phone, generated.whatsappText).then((res) => {
      if (res.url) {
        window.open(res.url, '_blank');
      }
    });
  }

  return items;
}

export { generateWhatsAppUrl, sendWhatsAppMessage };
