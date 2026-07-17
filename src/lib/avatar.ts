import { AVATAR_PREFIX } from "@/lib/r2";

// DB column users.avatar_url holds either:
//  - null (no avatar)
//  - an R2 object key like "avatars/4-uuid.webp" (current), or
//  - a legacy local path "/uploads/avatars/..." (pre-R2)
// <Image> needs a same-origin URL, so R2 keys are rewritten to /api/avatar/<key>.
// Legacy paths and already-absolute URLs pass through unchanged.
export function avatarUrlToSrc(
  u?: string | null,
): string | undefined {
  if (!u || u === "") return undefined;
  if (u.startsWith(AVATAR_PREFIX)) return `/api/avatar/${u}`;
  return u;
}
