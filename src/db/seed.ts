import { db } from "./index";
import {
  users,
  adminAccounts,
  actions,
  contributions,
  connections,
  notifications,
} from "./schema";
import { hashPassword } from "../lib/password";
import {
  generateDefaultPassword,
  generateInitials,
} from "../lib/default-password";

async function seed() {
  console.log("Seeding database...");

  // Admin account
  const adminPw = await hashPassword("admin123");
  await db.delete(adminAccounts);
  await db
    .insert(adminAccounts)
    .values({
      username: "admin",
      passwordHash: adminPw,
      name: "Admin Simah",
    })
    .onConflictDoNothing();
  console.log("Admin account seeded: admin / admin123");

  // Users
  await db.delete(notifications);
  await db.delete(contributions);
  await db.delete(connections);
  await db.delete(actions);
  await db.delete(users);

  const sampleUsers = [
    {
      name: "Dr. Siti Aminah",
      waNumber: "081234567890",
      sector: "pendidikan" as const,
      role: "EdTech Specialist",
      organization: "Universitas Pendidikan Nusantara",
      skills: ["Desain Kurikulum", "Literasi Digital", "Pelatihan Guru"],
      offering: "Membantu menyusun modul pelatihan literasi digital",
    },
    {
      name: "Budi Wijaya",
      waNumber: "081298765432",
      sector: "pengusaha" as const,
      role: "Logistics & Supply Chain",
      organization: "PT Sinergi Logistik Nusantara",
      skills: ["Manajemen Distribusi", "Rantai Pasok", "Optimasi Armada"],
      offering: "Dukungan distribusi dan logistik untuk program sosial",
    },
    {
      name: "Ahmad Rahman",
      waNumber: "081311223344",
      sector: "profesional" as const,
      role: "Corporate Law",
      organization: "Rahman & Partners Law Firm",
      skills: ["Hukum Korporasi", "Legalitas NGO", "Kontrak Bisnis"],
      offering: "Konsultasi legalitas NGO dan kontrak kerja sama",
    },
    {
      name: "Reza Fahlevi",
      waNumber: "081455667788",
      sector: "pendidikan" as const,
      role: "Vocational Training",
      organization: "Yayasan Bina Talente Digital",
      skills: ["Pelatihan Vokasi", "Coding Bootcamp", "Pengembangan SDM"],
      offering: "Pelatihan vokasi dan bootcamp coding",
    },
  ];

  const finalUsers = await db
    .insert(users)
    .values(
      await Promise.all(
        sampleUsers.map(async (u) => ({
          ...u,
          passwordHash: await hashPassword(
            generateDefaultPassword(u.name, u.waNumber),
          ),
          mustChangePassword: true,
          initials: generateInitials(u.name),
          status: (u.name === "Ahmad Rahman" ? "blocked" : "active") as
            | "active"
            | "blocked",
        })),
      ),
    )
    .returning();

  console.log("Default passwords for users:");
  for (const u of finalUsers) {
    console.log(
      `  - ${u.name} (${u.waNumber}): ${generateDefaultPassword(u.name, u.waNumber)}`,
    );
  }

  // Actions
  const creatorMap = new Map(finalUsers.map((u) => [u.name, u.id]));
  await db.insert(actions).values([
    {
      title: "Kembangkan Modul Kurikulum Baru",
      description:
        "Menyusun modul kurikulum pelatihan literasi digital untuk guru sekolah menengah, mencakup struktur materi, panduan instruktur, dan latihan evaluasi.",
      status: "todo",
      createdById: creatorMap.get("Dr. Siti Aminah")!,
      createdAt: "2024-09-28",
      startDate: "2024-10-01",
      endDate: "2025-01-31",
      votes: 12,
      background:
        "Literasi digital guru sekolah menengah masih rendah berdasarkan survei awal 2024.",
      objectives:
        "Menghasilkan 3 modul pelatihan siap pakai + panduan instruktur.",
      needsFunding: false,
      isPic: true,
      skills: ["Desain Kurikulum", "Literasi Digital"],
      isPublished: true,
    },
    {
      title: "Finalisasi Alokasi Anggaran Q4",
      description:
        "Melakukan revisi dan finalisasi distribusi anggaran kuartal keempat untuk seluruh divisi program, termasuk ringkasan laporan untuk pengurus.",
      status: "in_progress",
      createdById: creatorMap.get("Budi Wijaya")!,
      createdAt: "2024-09-25",
      startDate: "2024-10-01",
      endDate: "2024-12-15",
      votes: 45,
      background: "Distribusi anggaran Q4 tertunda karena perubahan struktur divisi.",
      objectives: "Finalisasi alokasi anggaran Q4 dan ringkasan laporan untuk pengurus.",
      needsFunding: true,
      isPic: false,
      skills: ["Manajemen Distribusi"],
      isPublished: true,
    },
    {
      title: "Perencanaan Acara Gathering Sinergi Tahunan",
      description:
        "Menyusun konsep, lokasi, dan rundown acara gathering tahunan lintas sektor Simah, termasuk koordinasi narasumber dan logistik.",
      status: "done",
      createdById: creatorMap.get("Reza Fahlevi")!,
      createdAt: "2024-08-20",
      startDate: "2024-09-15",
      endDate: "2024-10-20",
      votes: 128,
      background: "Acara tahunan lintas sektor menjadi wadah sinergi antar peserta.",
      objectives: "Terselenggara gathering dengan minimal 100 peserta lintas sektor.",
      needsFunding: true,
      isPic: true,
      skills: ["Event Planning", "Koordinasi Logistik"],
      isPublished: true,
    },
  ]);

  // Notifications: a connect_request example for user 1 from user 2
  await db.insert(notifications).values([
    {
      userId: creatorMap.get("Dr. Siti Aminah")!,
      type: "connect_request",
      variant: "info",
      title: "Permintaan Koneksi",
      body: "Budi Wijaya ingin terhubung dengan Anda.",
      actorId: creatorMap.get("Budi Wijaya")!,
      read: false,
    },
    {
      userId: creatorMap.get("Dr. Siti Aminah")!,
      type: "broadcast",
      variant: "alert",
      title: "Sesi Pleno Dimulai",
      body: "Harap segera menuju ruang utama. Sesi pleno akan dimulai dalam 5 menit.",
      read: false,
    },
    {
      userId: creatorMap.get("Dr. Siti Aminah")!,
      type: "text",
      variant: "info",
      title: "Selamat Datang di Simah",
      body: "Akun Anda sudah aktif. Silakan lengkapi profil dan mulai berkolaborasi.",
      read: false,
    },
  ]);

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
