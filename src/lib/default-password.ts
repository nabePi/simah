export function generateDefaultPassword(name: string, waNumber: string): string {
  const namePart = name.replace(/\s+/g, "").slice(0, 4).toLowerCase();
  const waPart = waNumber.replace(/\D/g, "").slice(-4);
  return namePart + waPart;
}

export function generateInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
