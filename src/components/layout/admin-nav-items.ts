export const adminNavItems = [
  { icon: "space_dashboard", label: "Dashboard", href: "/admin/dashboard" },
  { icon: "assignment_turned_in", label: "Action", href: "/admin/dashboard?tab=actions" },
  { icon: "group", label: "User", href: "/admin/dashboard?tab=users" },
  { icon: "notifications", label: "Notifikasi", href: "/admin/dashboard?tab=notifications" },
] as const;
