export type ParsedCsvRow = {
  nama: string;
  wa: string;
  sektor: string;
  valid: boolean;
};

export type ValidCsvRow = {
  nama: string;
  wa: string;
  sektor: string;
};

const VALID_SECTORS = ["pendidikan", "pengusaha", "profesional"];
const SECTOR_ALIASES: Record<string, string> = {
  ekonomi: "pengusaha",
};

function normalizeSector(value: string): string {
  const lower = value.toLowerCase();
  return SECTOR_ALIASES[lower] ?? lower;
}

export function parseCsv(text: string): ParsedCsvRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length < 2) return [];

  const header = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase());

  const namaIdx = header.indexOf("nama");
  const waIdx = header.indexOf("no whatsapp");
  const sektorIdx = header.indexOf("sektor");

  if (namaIdx === -1 || waIdx === -1 || sektorIdx === -1) {
    return [];
  }

  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const nama = cells[namaIdx] ?? "";
    const wa = cells[waIdx] ?? "";
    const rawSektor = cells[sektorIdx] ?? "";
    const sektor = normalizeSector(rawSektor);
    const valid = nama.length > 0 && VALID_SECTORS.includes(sektor);
    return { nama, wa, sektor, valid };
  });
}

export function isValidSector(value: string): boolean {
  return VALID_SECTORS.includes(normalizeSector(value));
}
