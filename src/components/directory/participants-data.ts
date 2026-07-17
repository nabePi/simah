export type Sector = "pendidikan" | "pengusaha" | "profesional";

export type Participant = {
  id: string;
  name: string;
  sector: Sector;
  role: string;
  organization: string;
  skills: string[];
  avatarUrl?: string;
  initials?: string;
  offering: string;
};
