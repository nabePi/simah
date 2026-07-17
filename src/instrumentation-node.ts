import { sql } from "drizzle-orm";
import { db } from "./db";

try {
  await db.execute(sql`select 1`);
} catch (error) {
  console.error("Gagal terhubung ke database. Server tidak dijalankan.", error);
  process.exit(1);
}
