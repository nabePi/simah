import Link from "next/link";
import { auth } from "@/auth/config";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Icon } from "@/components/ui/Icon";

export async function ProfileCompletenessBanner() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = Number(session.user.id);
  if (Number.isNaN(userId)) return null;

  const [user] = await db
    .select({
      role: users.role,
      organization: users.organization,
      skills: users.skills,
      offering: users.offering,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) return null;

  const hasRole = Boolean(user.role?.trim());
  const hasOrganization = Boolean(
    user.organization?.trim() && user.organization !== "-"
  );
  const hasSkills = Array.isArray(user.skills) && user.skills.length > 0;
  const hasOffering = Boolean(user.offering?.trim());

  if (hasRole && hasOrganization && hasSkills && hasOffering) return null;

  return (
    <div className="bg-tertiary-container text-on-tertiary-container border border-tertiary/20 rounded-xl p-4 flex items-start gap-3">
      <Icon name="info" filled className="text-[20px] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-label-md text-label-md">
          Profil Anda belum lengkap
        </p>
        <p className="font-body-sm text-body-sm mt-0.5">
          Lengkapi profil agar peserta lain lebih mudah mengenal dan berkolaborasi dengan Anda.
        </p>
      </div>
      <Link
        href="/profile"
        className="shrink-0 inline-flex items-center gap-1 px-3 h-9 rounded-lg bg-tertiary text-on-tertiary font-label-md text-label-md hover:bg-tertiary/90 transition-colors"
      >
        Lengkapi
      </Link>
    </div>
  );
}
