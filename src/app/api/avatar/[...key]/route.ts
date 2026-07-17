import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth/config";
import {
  getAvatarObject,
  headAvatar,
  isServableAvatarKey,
} from "@/lib/r2";

// Avoid static optimization: this route reads the session + R2 per request.
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ key: string[] }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { key: segments } = await ctx.params;
  const key = segments.map((s) => decodeURIComponent(s)).join("/");
  if (!key || !isServableAvatarKey(key)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const meta = await headAvatar(key).catch(() => null);
    if (!meta) return new NextResponse("Not found", { status: 404 });
    const obj = await getAvatarObject(key);
    const headers = new Headers();
    headers.set(
      "Content-Type",
      obj.contentType ?? meta.contentType ?? "application/octet-stream",
    );
    if (obj.contentLength != null) {
      headers.set("Content-Length", String(obj.contentLength));
    }
    if (obj.etag) headers.set("ETag", obj.etag);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return new NextResponse(obj.body, { headers });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "unknown error";
    if (msg.startsWith("Konfigurasi R2")) {
      return new NextResponse("R2 not configured", { status: 503 });
    }
    return new NextResponse("Not found", { status: 404 });
  }
}
