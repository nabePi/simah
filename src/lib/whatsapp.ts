function toInternationalWaNumber(waNumber: string): string {
  const digits = waNumber.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

export function buildWhatsAppLink(
  waNumber: string,
  targetName: string,
  senderName: string,
): string {
  const message = `Assalamu'alaikum Bapak/Ibu ${targetName}. Saya ${senderName}. Saya dapat kontak Anda dari simah.id (Daurah Iwa' SCI)`;
  return `https://wa.me/${toInternationalWaNumber(waNumber)}?text=${encodeURIComponent(message)}`;
}
