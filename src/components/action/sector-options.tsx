import type { Sector } from "@/components/directory/participants-data";

export const sectorOptions: { value: Sector; label: string; icon: string }[] = [
  { value: "pendidikan", label: "Pendidikan", icon: "school" },
  { value: "ekonomi", label: "Ekonomi", icon: "storefront" },
  { value: "profesional", label: "Profesional", icon: "work" },
];

export const sectorIconClass: Record<Sector, string> = {
  pendidikan: "text-sector-pendidikan",
  ekonomi: "text-sector-ekonomi",
  profesional: "text-sector-profesional",
};

export const sectorActiveCardClass: Record<Sector, string> = {
  pendidikan: "border-sector-pendidikan bg-sector-pendidikan/5 ring-1 ring-sector-pendidikan",
  ekonomi: "border-sector-ekonomi bg-sector-ekonomi/5 ring-1 ring-sector-ekonomi",
  profesional: "border-sector-profesional bg-sector-profesional/5 ring-1 ring-sector-profesional",
};

export const sectorActivePillClass: Record<Sector, string> = {
  pendidikan: "peer-checked:bg-sector-pendidikan/15 peer-checked:border-sector-pendidikan peer-checked:text-sector-pendidikan",
  ekonomi: "peer-checked:bg-sector-ekonomi/15 peer-checked:border-sector-ekonomi peer-checked:text-sector-ekonomi",
  profesional: "peer-checked:bg-sector-profesional/15 peer-checked:border-sector-profesional peer-checked:text-sector-profesional",
};

export const sectorLabel: Record<Sector, string> = {
  pendidikan: "Pendidikan",
  ekonomi: "Ekonomi",
  profesional: "Profesional",
};

export const sectorBadgeClass: Record<Sector, string> = {
  pendidikan: "bg-sector-pendidikan/10 text-sector-pendidikan border-sector-pendidikan/20",
  ekonomi: "bg-sector-ekonomi/10 text-sector-ekonomi border-sector-ekonomi/20",
  profesional: "bg-sector-profesional/10 text-sector-profesional border-sector-profesional/20",
};
