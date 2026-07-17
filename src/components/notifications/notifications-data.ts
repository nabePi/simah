export type NotificationType = "text" | "connect_request" | "broadcast";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read?: boolean;
  actorId?: string;
  actorName?: string;
  actorAvatarUrl?: string;
  actorInitials?: string;
  actorSector?: "pendidikan" | "ekonomi" | "profesional";
  actorRole?: string;
  actorOrganization?: string;
  actorSkills?: string[];
  actorOffering?: string;
  connectionId?: number;
  variant?: "alert" | "info";
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatNotificationDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}
