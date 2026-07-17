import type { Sector } from "@/components/directory/participants-data";
import type { ActionStatus } from "@/components/action/action-items-data";

export const sectorLabel: Record<Sector, string> = {
  pendidikan: "Pendidikan",
  ekonomi: "Ekonomi",
  profesional: "Profesional",
};

export const sectorBadgeClass: Record<Sector, string> = {
  pendidikan:
    "bg-sector-pendidikan/10 text-sector-pendidikan border-sector-pendidikan/20",
  ekonomi:
    "bg-sector-ekonomi/10 text-sector-ekonomi border-sector-ekonomi/20",
  profesional:
    "bg-sector-profesional/10 text-sector-profesional border-sector-profesional/20",
};

export const statusLabel: Record<ActionStatus, string> = {
  todo: "Belum Dimulai",
  in_progress: "Sedang Berjalan",
  done: "Selesai",
};

export const statusBadgeClass: Record<ActionStatus, string> = {
  todo: "bg-status-todo/15 text-status-todo",
  in_progress: "bg-status-progress/15 text-status-progress",
  done: "bg-status-done/15 text-status-done",
};
