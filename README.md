# Simah

**Aksi, Sinergi, Berdaya**

Simah adalah aplikasi web mobile-first untuk mendukung pelaksanaan FGD (Focus Group Discussion) yang mempertemukan tiga sektor peserta — **Pendidikan**, **Ekonomi**, dan **Profesional** — agar saling mengenal, saling membantu antar sektor, berkolaborasi, dan menghasilkan *action item* / proyek nyata yang dapat dimonitor pasca-acara.

> *Minal Aqwal Ilal Af'al — Dari Narasi menuju Aksi*

---

## Fitur Utama

- **Autentikasi** — Login peserta dengan nomor WhatsApp + password, serta login admin terpisah.
- **Onboarding Profil** — Peserta melengkapi profil, sektor, keahlian, dan kontribusi yang bisa diberikan.
- **Direktori Peserta** — Jelajahi profil peserta, filter per sektor, dan kirim permintaan koneksi.
- **Action Items / Proyek Bersama** — Buat, kelola, dan monitor proyek kolaboratif lintas sektor.
- **Kontribusi Lintas Sektor** — Catat kontribusi dana, PIC, dan keahlian untuk setiap action item.
- **Notifikasi** — Permintaan koneksi, pengumuman, dan update action item.
- **Panel Admin** — Import peserta via CSV, kelola user, action item, broadcast notifikasi, dan pantau progress.
- **Avatar Upload** — Foto profil disimpan di Cloudflare R2 dan disajikan via same-origin route handler.

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, React Server Components)
- **UI:** React 19, Tailwind CSS 4, Material SymbolsOutlined icons
- **Auth:** [NextAuth.js v5](https://next-auth.js.org/) (beta)
- **Database:** PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/) + [drizzle-kit](https://orm.drizzle.team/kit-docs/overview)
- **Storage:** Cloudflare R2 (untuk avatar) via `@aws-sdk/client-s3`
- **Language:** TypeScript 5
- **Runtime:** Node.js (minimal versi 18)

---

## Struktur Direktori

```
fgd/
├── src/
│   ├── app/                 # Next.js App Router (pages, layouts, API routes)
│   ├── components/          # React components (layout, ui, features)
│   ├── actions/             # Server Actions (auth, profile, admin, action items)
│   ├── lib/                 # Helpers (DB queries, R2, avatar, password, CSV)
│   ├── db/                  # Drizzle schema, seed, dan koneksi database
│   ├── auth/                # Konfigurasi NextAuth
│   └── middleware.ts        # Route protection middleware
├── drizzle.config.ts        # Konfigurasi Drizzle Kit
├── next.config.ts           # Konfigurasi Next.js
└── package.json
```

---

## Persiapan & Instalasi

### 1. Prasyarat

- Node.js 18+
- PostgreSQL server yang dapat diakses (lokal atau cloud)
- (Opsional) Akun Cloudflare R2 untuk upload avatar

### 2. Instalasi Dependensi

```bash
npm install
```

### 3. Environment Variables

Buat file `.env.local` di root project dan isi dengan variabel berikut:

```env
# Wajib
DATABASE_URL=postgresql://user:password@host:port/dbname
AUTH_SECRET=random-secret-string-min-32-chars

# Cloudflare R2 (untuk avatar upload)
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET=your-r2-bucket-name

# OpenAI (opsional, untuk fitur AI)
OPENAI_KEY=your-openai-api-key
```

> `AUTH_SECRET` wajib di production. Untuk development, NextAuth bisa berjalan tanpa-nya tetapi akan menampilkan peringatan.

### 4. Setup Database

Jalankan migrasi dan seed data awal:

```bash
# Push schema ke database
npm run db:push

# (Opsional) Seed data manifestasi Iwa' dan akun admin awal
npm run db:seed
```

> Untuk perubahan skema, gunakan `npm run db:generate` lalu `npm run db:migrate`.

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Scripts

| Script | Keterangan |
|---|---|
| `npm run dev` | Menjalankan development server |
| `npm run build` | Build aplikasi untuk production |
| `npm run start` | Menjalankan production server |
| `npm run lint` | Menjalankan ESLint |
| `npm run db:push` | Push schema ke database (dev) |
| `npm run db:generate` | Generate file migrasi Drizzle |
| `npm run db:migrate` | Jalankan migrasi database |
| `npm run db:studio` | Buka Drizzle Studio untuk mengelola data |
| `npm run db:seed` | Seed data awal (manifestasi, admin) |

---

## Alur Pengguna

### Peserta

1. Login dengan nomor WhatsApp dan password awal.
2. Wajib ganti password saat pertama kali login.
3. Lengkapi profil (sektor, keahlian, kontribusi).
4. Jelajahi direktori peserta dan kirim permintaan koneksi.
5. Buat atau ikut berkontribusi pada action item.
6. Terima notifikasi permintaan koneksi dan update proyek.

### Admin

1. Login melalui `/admin/login` dengan akun admin.
2. Import peserta via CSV (`nama,no whatsapp,sektor`).
3. Kelola user, action item, status publish, dan broadcast notifikasi.
4. Pantau progress action item dan engagement peserta.

---

## Catatan Penting

- **Sektor yang tersedia:** `pendidikan` (Pendidikan), `pengusaha` (Ekonomi), `profesional` (Profesional).
  - UI menampilkan label **Ekonomi**, sementara nilai database dan CSV tetap menggunakan `pengusaha` untuk menjaga kompatibilitas.
  - CSV import sekarang juga menerima alias `ekonomi`.
- **Pendanaan tidak diproses di aplikasi.** Aplikasi hanya mencatat daftar pendukung/wakif dan status realisasinya.
- **Avatar disimpan di R2** dan diakses melalui `/api/avatar/[...key]` untuk menjaga bucket tetap private.

---

## Deploy

### Dokploy (Docker Compose)

1. Deploy PostgreSQL terlebih dahulu di Dokploy melalui menu **Databases** di project yang sama.
2. Buat service baru di Dokploy dan pilih tipe **Docker Compose**.
3. Hubungkan repository GitHub `nabePi/simah`.
4. Pilih branch `main` dan file `docker-compose.yml`.
5. Buka menu **Environment Settings** dan tambahkan variabel berikut:
   - `DATABASE_URL` (wajib — salin **Internal Connection URL** dari database Dokploy, contoh: `postgresql://user:pass@simah-postgres-xxxxxx:5432/dbname`)
   - `AUTH_SECRET` (wajib — minimal 32 karakter)
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` (untuk avatar)
   - `OPENAI_KEY` (opsional)
6. Deploy. Compose akan menggabungkan service `app` ke `dokploy-network` agar bisa berkomunikasi dengan database di project yang sama.

### Deploy Manual

```bash
npm run build
npm run start
```

---

## Dokumen Lengkap

- [PRD Aplikasi FGD](./PRD-Aplikasi-FGD.md) — Product Requirements Document
- [Plan R2 Avatar](./plan.md) — Implementasi avatar upload ke Cloudflare R2

---

Dibuat untuk mendukung FGD lintas sektor — dari narasi menuju aksi nyata.
