import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

export const AVATAR_PREFIX = "avatars/";

function env(key: string): string {
  const v = process.env[key];
  if (!v || v.trim() === "") {
    throw new Error(
      `Konfigurasi R2 belum lengkap: variabel ${key} belum diisi.`,
    );
  }
  return v.trim();
}

let cached: S3Client | null = null;
export function r2Client(): S3Client {
  if (cached) return cached;
  const accountId = env("R2_ACCOUNT_ID");
  env("R2_ACCESS_KEY_ID");
  env("R2_SECRET_ACCESS_KEY");
  env("R2_BUCKET");
  cached = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return cached;
}

function bucket(): string {
  return env("R2_BUCKET");
}

export const AVATAR_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

// Upload a user avatar to R2. Returns the object key (e.g. "avatars/4-uuid.webp").
export async function uploadAvatar(input: {
  userId: number;
  file: File;
}): Promise<string> {
  const { userId, file } = input;
  if (!AVATAR_ALLOWED_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_TYPES)[number])) {
    throw new Error("Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.");
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error("Ukuran file maksimal 2MB.");
  }
  const ext = file.type.split("/")[1];
  const key = `${AVATAR_PREFIX}${userId}-${randomUUID()}.${ext}`;
  await r2Client().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return key;
}

// Guard: only keys under the avatars/ prefix are readable via the route handler.
// Prevents arbitrary R2 object enumeration.
export function isServableAvatarKey(key: string): boolean {
  return key.startsWith(AVATAR_PREFIX) && !key.includes("..");
}

export async function headAvatar(
  key: string,
): Promise<{ contentType: string | undefined; contentLength: number | undefined }> {
  const res = await r2Client().send(
    new HeadObjectCommand({ Bucket: bucket(), Key: key }),
  );
  return {
    contentType:
      res.ContentType ?? (key.endsWith(".png")
        ? "image/png"
        : key.endsWith(".webp")
          ? "image/webp"
          : key.endsWith(".jpg") || key.endsWith(".jpeg")
            ? "image/jpeg"
            : undefined),
    contentLength: res.ContentLength,
  };
}

export async function getAvatarObject(key: string): Promise<{
  body: ReadableStream<Uint8Array>;
  contentType: string | undefined;
  contentLength: number | undefined;
  etag: string | undefined;
}> {
  const res = await r2Client().send(
    new GetObjectCommand({ Bucket: bucket(), Key: key }),
  );
  const body = res.Body as
    | { transformToWebStream: () => ReadableStream<Uint8Array> }
    | undefined;
  if (!body || typeof body.transformToWebStream !== "function") {
    throw new Error("Gagal membaca objek dari R2.");
  }
  return {
    body: body.transformToWebStream(),
    contentType: res.ContentType,
    contentLength: res.ContentLength,
    etag: res.ETag,
  };
}
