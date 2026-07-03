# 📘 Panduan Penggunaan — Portfolio Website

Website portfolio pribadi dengan **Next.js 15**, **TypeScript**, **Tailwind CSS v4**, **Framer Motion**, dan **shadcn/ui**. Punya dua "dunia" tema: **dark = neon futuristik**, **light = game 8-bit retro**, plus arcade berisi game HTML yang bisa dimainkan langsung di browser.

Repo: https://github.com/rizkyprat3/web-porto

---

## 1. Menjalankan Project

**Prasyarat:** Node.js 18.18+ (disarankan 20+) dan npm.

```bash
git clone https://github.com/rizkyprat3/web-porto.git
cd web-porto
npm install
npm run dev        # buka http://localhost:3000
```

Perintah lain:

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server development (hot reload) |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan hasil build produksi |
| `npm run lint` | Cek kualitas kode (ESLint) |
| `npx tsc --noEmit` | Cek tipe TypeScript |

---

## 2. Struktur Folder

```
web-porto/
├── public/
│   ├── images/              # foto profil, thumbnail project, cover game
│   └── games/               # game HTML (1 folder = 1 game)
│       └── game-fable-5/
│           └── index.html
├── src/
│   ├── app/                 # halaman (App Router) + API route
│   ├── components/
│   │   ├── ui/              # komponen dasar (button, card, reveal, dll)
│   │   ├── layout/          # navbar, footer, cursor, tema, dll
│   │   ├── home/            # hero, about, featured projects
│   │   ├── projects/        # kartu & grid project
│   │   ├── arcade/          # kartu game & player iframe
│   │   ├── achievements/    # timeline
│   │   └── contact/         # form kontak
│   ├── data/                # ✏️ SEMUA KONTEN DIEDIT DI SINI
│   ├── lib/                 # animasi, util, validasi
│   ├── types/               # definisi TypeScript semua konten
│   └── styles/globals.css   # tema warna & skin 8-bit
└── PANDUAN.md               # file ini
```

**Prinsip utama:** konten dan tampilan terpisah total. Untuk mengubah isi website, kamu hampir tidak pernah perlu menyentuh komponen — cukup edit file di `src/data/`.

---

## 3. Mengedit Identitas & Foto Profil

Semua identitas ada di **`src/data/site.ts`**: nama, role, tagline, email, link GitHub/LinkedIn.

**Ganti foto About Me:**
1. Siapkan foto (disarankan rasio 4:5, misal 800×1000 px), simpan ke `public/images/`, contoh: `public/images/profile.jpg`.
2. Di `site.ts`, ubah:
   ```ts
   profileImage: "/images/profile.jpg",
   profileCaption: "Building in Medan, Indonesia",  // teks badge di foto
   ```
3. Hapus `public/images/profile-placeholder.svg` kalau sudah tidak dipakai.

---

## 4. Menambah / Mengedit Project

Edit **`src/data/projects.ts`** — tambah satu objek baru di array `projects`, dan project otomatis muncul di `/projects` (dengan filter + search) plus dapat halaman detail sendiri di `/projects/[slug]`.

```ts
{
  slug: "nama-unik-di-url",           // jadi alamat /projects/nama-unik-di-url
  title: "Judul Project",
  description: "Deskripsi singkat untuk kartu (1-2 kalimat).",
  category: "AI",                      // "AI" | "Game Development" | "Research" | "Web Development"
  techStack: ["Python", "Pandas"],
  status: "completed",                 // "completed" | "in-progress" | "planned"
  thumbnail: "/images/projects/foo.jpg",
  date: "2026-07-01",                  // dipakai untuk urutan (terbaru dulu)
  featured: true,                      // true = tampil di halaman Home
  longDescription: "Penjelasan lengkap...",
  problemStatement: "Masalah yang diselesaikan...",
  developmentProcess: ["Langkah 1", "Langkah 2"],
  challenges: ["Tantangan 1"],
  solutions: ["Solusi 1"],
  screenshots: ["/images/projects/foo-1.jpg"],
  links: { demo: "https://...", github: "https://..." },  // keduanya opsional
},
```

Simpan thumbnail/screenshot di `public/images/projects/`.

---

## 5. Menambah Game ke Arcade 🎮

Game harus berupa **HTML mandiri** (satu folder berisi `index.html` + asetnya, tanpa request ke luar).

1. Salin folder game ke `public/games/`, misal `public/games/space-shooter/` yang berisi `index.html`.
2. Daftarkan di **`src/data/games.ts`**:
   ```ts
   {
     id: "space-shooter",               // = nama folder, jadi URL /arcade/space-shooter
     title: "Space Shooter",
     genre: "Action",                   // Action | Puzzle | Arcade | Platformer | Strategy | Casual
     description: "Deskripsi singkat game.",
     coverImage: "/images/games/space-shooter.png",
     entryPath: "/games/space-shooter/index.html",
     tags: ["Singleplayer", "Keyboard"],
     controls: [
       { key: "← / →", action: "Gerak" },
       { key: "Space", action: "Tembak" },
     ],
     aspectRatio: 16 / 9,
   },
   ```

**⚠️ Catatan keamanan penting:** game dijalankan dalam iframe `sandbox="allow-scripts"` (origin terisolasi). Artinya `localStorage` **bisa error** di dalam game — selalu bungkus aksesnya:

```js
try { localStorage.setItem(KEY, data); } catch (e) { /* storage tidak tersedia */ }
```

---

## 6. Achievements & Skills

- **`src/data/achievements.ts`** — timeline di `/achievements`. Tipe: `competition`, `award`, `certification`, `academic`. Set `highlight: true` untuk milestone penting (dapat efek glow/emas).
- **`src/data/skills.ts`** — grid skill (grup: Languages, AI & Data, Game Dev, Web, Tools) dan learning journey di section About.

---

## 7. Sistem Tema: Dunia Neon & Dunia 8-bit

- **Dark (default)** — neon futuristik: glassmorphism, glow cyan/violet, font Outfit.
- **Light** — dunia game 8-bit: kertas krem, sudut kotak, border sprite + hard shadow, font pixel (Pixelify Sans), awan pixel berjalan, matahari koin, tanah rumput, scanline CRT.

Toggle lewat ikon 🎮/🌙 di navbar; pilihan tersimpan otomatis di browser.

**Mengubah warna:** semua token warna ada di `src/styles/globals.css` — blok `:root` untuk light, `.dark` untuk dark. Skin 8-bit (border, shadow, font pixel) ada di bagian `── 8-bit retro skin` di file yang sama.

---

## 8. Form Kontak & Supabase (Opsional)

Form kontak (`/contact`) sudah punya: validasi klien + server, honeypot anti-bot, dan rate limit (5 pesan / 10 menit / IP).

Tanpa konfigurasi apa pun, pesan hanya dicatat di log server. Untuk **menyimpan ke Supabase**:

1. Buat project di https://supabase.com, lalu buat tabel:
   ```sql
   create table contact_messages (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     email text not null,
     message text not null,
     "receivedAt" timestamptz not null default now()
   );

   -- Row Level Security: kunci total dari klien anonim.
   -- Hanya service role (server) yang bisa menulis.
   alter table contact_messages enable row level security;
   ```
   Jangan buat policy apa pun → anon key tidak bisa baca/tulis sama sekali.
2. Salin `.env.example` menjadi `.env.local`, isi:
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
3. **Jangan pernah** commit `.env.local` (sudah otomatis di-gitignore) dan jangan pakai prefix `NEXT_PUBLIC_` untuk service key.

---

## 9. Keamanan yang Sudah Terpasang

| Lapisan | Implementasi |
|---|---|
| CSP | `Content-Security-Policy` di `next.config.ts` — semua resource hanya dari origin sendiri |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` + `frame-ancestors 'self'` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Referrer & permissions | `Referrer-Policy`, `Permissions-Policy` (kamera/mikrofon/lokasi mati) |
| Game | iframe `sandbox="allow-scripts"` — game tidak bisa akses cookie/DOM situs |
| Form | Validasi Zod di server, sanitasi karakter kontrol, honeypot, rate limit per IP |
| Rahasia | Semua secret di env var server-side; tidak ada yang bocor ke klien |

---

## 10. Deploy ke Vercel

1. Push ke GitHub (sudah: `rizkyprat3/web-porto`).
2. Buka https://vercel.com → **Add New Project** → import repo `web-porto`.
3. Framework terdeteksi otomatis (Next.js). Tambahkan env var bila pakai Supabase:
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, dan `NEXT_PUBLIC_SITE_URL` (isi dengan URL produksi, misal `https://web-porto.vercel.app`).
4. Deploy. Setiap `git push` ke `main` otomatis men-deploy ulang.

---

## 11. Checklist Sebelum Publish

- [ ] Ganti foto profil placeholder (`site.ts` → `profileImage`)
- [ ] Perbarui link LinkedIn di `site.ts` (saat ini masih placeholder)
- [ ] Sesuaikan isi project Arduino IoT di `projects.ts` dengan kondisi asli, isi `links` saat sudah publish
- [ ] Ganti thumbnail SVG placeholder dengan screenshot asli
- [ ] Review isi `achievements.ts` (tanggal & nama organisasi)
- [ ] Set `NEXT_PUBLIC_SITE_URL` di environment produksi (dipakai sitemap & SEO)
