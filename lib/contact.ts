// The number the platform's own team answers on WhatsApp (digits only, with country code).
export const WHATSAPP_NUMBER = "970598509088";

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
