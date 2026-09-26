export interface WhatsAppConfig {
  officePhone: string;
  officeName: string;
  officeAddress: string;
  officeEmail: string;
  autoSendMode: 'direct_link' | 'gateway_api';
  gatewayProvider: 'fonnte' | 'wablas' | 'custom';
  gatewayApiKey: string;
  gatewayApiUrl: string;
  autoOpenOnStatusUpdate: boolean;
}

export const DEFAULT_WA_CONFIG: WhatsAppConfig = {
  officePhone: '0812-9900-8800',
  officeName: 'Republik Computer Service Center',
  officeAddress: 'Jl. Raya Teknologi No. 102, Jakarta Selatan',
  officeEmail: 'service@republikcomputer.id',
  autoSendMode: 'direct_link',
  gatewayProvider: 'fonnte',
  gatewayApiKey: '',
  gatewayApiUrl: 'https://api.fonnte.com/send',
  autoOpenOnStatusUpdate: false,
};

const STORAGE_KEY = 'republik_computer_wa_config_v1';
const EVENT_WA_CONFIG_UPDATED = 'republik_computer_wa_config_updated';

export function getWhatsAppConfig(): WhatsAppConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WA_CONFIG));
      return DEFAULT_WA_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_WA_CONFIG, ...parsed };
  } catch {
    return DEFAULT_WA_CONFIG;
  }
}

export function saveWhatsAppConfig(newConfig: WhatsAppConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    window.dispatchEvent(new CustomEvent(EVENT_WA_CONFIG_UPDATED, { detail: newConfig }));
  } catch (err) {
    console.error('Failed to save WhatsApp config:', err);
  }
}

export function resetWhatsAppConfig(): WhatsAppConfig {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WA_CONFIG));
    window.dispatchEvent(new CustomEvent(EVENT_WA_CONFIG_UPDATED, { detail: DEFAULT_WA_CONFIG }));
    return DEFAULT_WA_CONFIG;
  } catch {
    return DEFAULT_WA_CONFIG;
  }
}

export function onWhatsAppConfigChanged(cb: (config: WhatsAppConfig) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<WhatsAppConfig>;
    if (custom.detail) {
      cb(custom.detail);
    } else {
      cb(getWhatsAppConfig());
    }
  };
  window.addEventListener(EVENT_WA_CONFIG_UPDATED, handler);
  return () => window.removeEventListener(EVENT_WA_CONFIG_UPDATED, handler);
}

/**
 * Format local Indonesian phone (08xxx / +62xxx / 62xxx) to standard international format (628xxx)
 */
export function formatPhoneToInternational(phone: string): string {
  if (!phone) return '';
  // Remove non-digit chars
  let cleaned = phone.replace(/[^0-9]/g, '');

  // If starts with 08, replace with 628
  if (cleaned.startsWith('08')) {
    cleaned = '628' + cleaned.substring(2);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  } else if (!cleaned.startsWith('62') && cleaned.length > 8) {
    cleaned = '62' + cleaned;
  }

  return cleaned;
}

/**
 * Generate click-to-chat WhatsApp link
 */
export function generateWhatsAppUrl(targetPhone: string, message: string): string {
  const intlPhone = formatPhoneToInternational(targetPhone);
  return `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(message)}`;
}

/**
 * Dispatch message via WhatsApp Gateway API or trigger click-to-chat
 */
export async function sendWhatsAppMessage(
  targetPhone: string,
  message: string
): Promise<{ success: boolean; message: string; url?: string }> {
  const config = getWhatsAppConfig();
  const intlPhone = formatPhoneToInternational(targetPhone);

  if (config.autoSendMode === 'gateway_api' && config.gatewayApiKey.trim()) {
    try {
      if (config.gatewayProvider === 'fonnte') {
        // Fonnte API call
        const formData = new FormData();
        formData.append('target', intlPhone);
        formData.append('message', message);
        formData.append('countryCode', '62');

        const res = await fetch(config.gatewayApiUrl || 'https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            Authorization: config.gatewayApiKey.trim()
          },
          body: formData
        });

        const data = await res.json();
        if (res.ok && data.status) {
          return {
            success: true,
            message: `Notifikasi WhatsApp berhasil dikirim otomatis ke ${intlPhone} via Fonnte Gateway!`
          };
        } else {
          throw new Error(data.reason || data.message || 'Gagal mengirim pesan via Gateway API');
        }
      } else if (config.gatewayProvider === 'wablas') {
        // Wablas API call
        const res = await fetch(config.gatewayApiUrl || 'https://kudus.wablas.com/api/send-message', {
          method: 'POST',
          headers: {
            'Authorization': config.gatewayApiKey.trim(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phone: intlPhone,
            message: message
          })
        });

        const data = await res.json();
        if (res.ok && data.status) {
          return {
            success: true,
            message: `Notifikasi WhatsApp berhasil dikirim otomatis ke ${intlPhone} via Wablas!`
          };
        } else {
          throw new Error(data.message || 'Gagal mengirim via Wablas Gateway');
        }
      } else {
        // Custom Webhook POST
        const res = await fetch(config.gatewayApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.gatewayApiKey ? { 'Authorization': `Bearer ${config.gatewayApiKey.trim()}` } : {})
          },
          body: JSON.stringify({
            phone: intlPhone,
            message: message,
            sender: config.officePhone,
            timestamp: new Date().toISOString()
          })
        });

        if (res.ok) {
          return {
            success: true,
            message: `Notifikasi berhasil dikirimkan via Custom Gateway ke ${intlPhone}!`
          };
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Koneksi Gateway bermasalah';
      console.warn('Gateway dispatch warning:', errMsg);
      // Fallback url
      const fallbackUrl = generateWhatsAppUrl(targetPhone, message);
      return {
        success: false,
        message: `Gateway API gagal (${errMsg}). Mengalihkan ke WhatsApp Web langsung.`,
        url: fallbackUrl
      };
    }
  }

  // Default Direct Link mode
  const directUrl = generateWhatsAppUrl(targetPhone, message);
  return {
    success: true,
    message: `Format chat WhatsApp untuk nomor kantor siap dikirimkan ke pelanggan (${intlPhone}).`,
    url: directUrl
  };
}
