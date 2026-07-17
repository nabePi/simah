# R2 Avatar Upload — Implementation Plan

## Goal
Replace local-disk avatar upload with Cloudflare R2. Store object key in `users.avatar_url`; serve images through a same-origin Next route handler so the R2 bucket stays private (no public bucket, no hostname allowlist needed for next/image).

## Key constraint (MUST READ)
You provided the R2 **account id** + S3 endpoint, but R2 uploads require an **Access Key ID + Secret Access Key** (created under R2 → "Manage R2 API Tokens"). You chose "Saya berikan Access Key + Secret" but haven't pasted them yet. The code below is written to read them from env vars; until you fill `.env.local`, uploads will return a config error at runtime. **No code changes are needed once you add the keys — just fill the env.**

## Env vars (R2 creds come from you)
Add to `.env.local`:
```
R2_ACCOUNT_ID=470e879b368ba45629cfc3295daf9cb1
R2_ACCESS_KEY_ID=<you fill>
R2_SECRET_ACCESS_KEY=<you fill>
R2_BUCKET=<bucket name you created in R2 dashboard, e.g. simah-avatars>
```
Endpoint derived as `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` (given).

## Dependency
Add `@aws-sdk/client-s3` (v3, R2-compatible S3 API). This is the only new dep. No image-compression lib — keep current validation (jpeg/png/webp, ≤2MB); a later iteration can add `sharp` resizing if desired.

## Files to change

### 1. `src/lib/r2.ts` (NEW) — shared R2 client + upload helper
- Lazily build a single `S3Client` with `region: "auto"`, `endpoint`, `credentials` from env.
- `uploadAvatar({ userId, file })`:
  - Validate type (jpeg/png/webp) + size ≤2MB (same rules as today).
  - Key: `avatars/${userId}-${randomUUID()}.${ext}`.
  - `PutObjectCommand` with `Body: Buffer`, `ContentType`, `CacheControl: "public, max-age=31536000, immutable"`.
  - Return the key (NOT a full URL).
- `getObjectStream(key)` / `headObject(key)` → used by the route handler.
- Throw a typed error if env missing, surfaced as a friendly user-facing message by the action.

### 2. `src/app/api/avatar/[...key]/route.ts` (NEW) — private image proxy
- `GET /api/avatar/avatars/4-uuid.webp` → stream object from R2 via `GetObjectCommand`.
- Auth: verify `auth()` session; reject 401 if no user. (Avatars shown to logged-in users only; acceptable since this app is login-gated. If public directory should show avatars to logged-out users later, revisit.)
- Response: set `Content-Type` from R2 metadata/head, `Cache-Control: public, max-age=31536000, immutable`, stream body.
- Scope guard: only serve keys under `avatars/` prefix (reject path traversal / arbitrary keys).
- Only the `avatars/` prefix is served; any other key → 404.

### 3. `src/actions/profile.ts` — rewrite `updateAvatar`
- Replace `fs`/`mkdir`/`writeFile` logic with `uploadAvatar({ userId, file })` from `src/lib/r2.ts`.
- Store the **key** in `users.avatar_url` (e.g. `avatars/4-uuid.webp`).
- Return `{ avatarUrl: "/api/avatar/" + key }` so the client `<Image src>` uses same-origin URL (works with next/image, no allowlist needed).
- Keep existing validation/error UX; `revalidatePath` calls unchanged.

### 4. `src/app/page.tsx` (beranda) + `src/app/profile/page.tsx` — DB url → render url
- The DB column now holds a key like `avatars/4-uuid.webp`, but `<Image>` needs `/api/avatar/avatars/4-uuid.webp`.
- Add a tiny helper `src/lib/avatar.ts`: `avatarUrlToSrc(u?: string | null)` → returns `/api/avatar/${u}` if it looks like an R2 key (starts with `avatars/`), else returns `u` as-is (so existing `/uploads/...` legacy paths still resolve during transition, and admin/google avatars pass through).
- In the pages that read `users.avatarUrl` and pass to components: `beranda` (`src/app/page.tsx:36`) and `profile` (`src/app/profile/page.tsx` initialAvatarUrl). Wrap with the helper.
- Components rendering avatars elsewhere (directory, action detail, notifications) read avatarUrl that comes from `users.avatarUrl` via queries → also need the helper applied at the data-fetch layer. To keep blast radius small, apply the helper inside `src/lib/queries.ts` mapping functions where `users.avatarUrl` (or aliases like `actorAvatarUrl`, `creatorAvatarUrl`) is returned to the client. This centralizes the transform so UI components stay unchanged.

### 5. Migrate DB (existing rows) — optional but recommended
Existing rows in `users.avatar_url` are either NULL or legacy `/uploads/avatars/...`. Leave as-is; the helper handles legacy paths. No DB migration required for the column itself (already `text`, nullable).

### 6. `next.config.ts` — NO change needed
Same-origin `/api/avatar/...` URLs don't need `remotePatterns`. The existing google entry stays.

## Trade-offs / notes
- **Private + route handler** means every avatar view hits our Next server (which proxies to R2) instead of the browser talking to a CDN directly — slightly more latency + server bandwidth, but keeps the bucket private (your choice). Mitigate with long `Cache-Control` (browser caches the response for a year keyed by object key; new upload = new key = cache miss, correct).
- Avatars only visible to logged-in users (route checks session). The participant directory is login-gated too, so fine.
- No image resizing/compression yet (current 2MB cap stays). Can add `sharp` later.
- Storing the key (not full URL) keeps R2 endpoint/host swappable without a data migration.

## Verification
1. `npx tsc --noEmit` → 0 errors.
2. Fill `.env.local` with real R2 creds + bucket name.
3. `npm run dev`, log in as a peserta, go to `/profile`, upload a photo.
4. Confirm: file lands in R2 bucket (`avatars/...`), `users.avatar_url` holds the key, avatar renders on `/profile`, `/` (beranda greeting), `/directory` cards, action detail creator avatar.
5. Logged-out request to `/api/avatar/...` → 401.

## Sequencing
After approval I'll implement 1→2→3→4, then typecheck. I will NOT run the live upload test (needs your R2 creds); once you add them, step 3-4 above is on you to verify in the browser.
