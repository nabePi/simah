import type { Participant } from "@/components/directory/participants-data";

export type ActionStatus = "todo" | "in_progress" | "done";

export type ActionItem = {
  id: string;
  title: string;
  description: string;
  status: ActionStatus;
  createdById: string;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  votes: number;
  background?: string;
  objectives?: string;
  needsFunding?: boolean;
  isPic?: boolean;
  skills?: string[];
  creator?: Participant;
  manifestasiId?: number;
  breakdownId?: number;
  manifestasiPoin?: string;
  contributorNames?: string[];
};

export type Contribution = {
  participantId: string;
  name: string;
  role?: string;
  types: string[];
  sector?: "pendidikan" | "ekonomi" | "profesional";
  avatarUrl?: string;
  initials?: string;
  organization?: string;
  skills?: string[];
  offering?: string;
};

export type DraftItem = {
  id: string;
  title: string;
  background: string;
  objectives: string;
  description: string;
  status: ActionStatus;
  needsFunding: boolean;
  isPic: boolean;
  skills: string[];
  hasDeadline: boolean;
  startDate?: string;
  hasEndDate?: boolean;
  endDate?: string;
  createdById: string;
  createdAt: string;
  manifestasiId?: number;
  breakdownId?: number;
};
