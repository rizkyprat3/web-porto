# WILDLANDS

Game open-world survival yang berjalan penuh di browser. Vanilla JavaScript + Canvas 2D — **tanpa framework, tanpa build step, tanpa satu pun file gambar atau audio**. Semua visual digambar prosedural, semua suara di-generate lewat WebAudio.

Kamu terdampar di benua yang dijaga sebuah ordo mercusuar. Sesuatu bernama **Kelam** memakan ingatan penghuninya — dan lima pelita yang menahannya mulai padam. Kamu satu-satunya yang ingatannya masih utuh.

**Main:** buka `index.html` di browser. Itu saja.

## Yang baru di versi ini

- **4 karakter**: Kesatria (pedang + HP), Rakyat Biasa (kepercayaan 2×), Barbarian (gada, tanpa zirah, takut dingin), Pengembara (stamina + obor). Playstyle beda nyata.
- **Benih Kelam**: virus (swarm cepat), bakteri (tank ber-flagela), spora (PECAH jadi 2 virus saat mati — jangan bunuh dari dekat).
- **Serambi berbenteng**: tembok keliling penuh, menara jaga berapi, jebakan duri, 4 milisi patroli.
- **Pembuka dengan pemandu**: Rua menemukanmu di bangkai kapal dan mengantarmu ke desa. Ikuti dia.
- **Titik Api**: gerbang teleport berlabel di desa (dekat menara). Pelita yang menyala & suar buatanmu menambah jaringannya.
- **Interaksi NPC hybrid**: naikkan keakraban lewat KERJA BARENG (minigame timing) atau MENGOBROL (pilih jawaban yang sesuai wataknya) — masing-masing sekali per hari.
- **16 achievement** dengan popup + chime dua-nada yang di-synthesize (tanpa file audio).

---

## Petunjuk Bermain

> **Referensi lengkap semua perintah** — setiap tombol, setiap interaksi `E`, menu NPC, roda teleport, dan layar mode — ada di **[`CONTROLS.md`](CONTROLS.md)**. Tabel di bawah hanya ringkasannya.

### Kontrol

| Tombol | Aksi |
|---|---|
| `WASD` / panah | Bergerak |
| `Shift` | Sprint (menguras stamina & lapar) |
| Klik kiri | Serangan ringan (ke arah kursor) |
| Tahan klik kiri | Serangan berat (charge ≥ 0,5 dtk — damage 2,5×) |
| `Spasi` | Menghindar / dodge roll (kebal 0,3 dtk) |
| `E` | Interaksi: bicara, panen semak, buka peti, pelita, teleport |
| `Q` | Makan (masakan didahulukan) |
| `F` | Letakkan api unggun (buat dulu di crafting) |
| `C` | Panel crafting |
| `J` | Buku catatan (petunjuk pelita + daftar penduduk) |
| `M` | Peta besar (fog of war) |
| `Esc` | Jeda |

### Cara bertahan hidup — jam pertama

1. **Kapalmu karam di pantai selatan.** Seseorang berdiri di antara puing — itu **Rua**. Sapa dia (`E`) dan **ikuti dia** ke Serambi, desa berbenteng satu-satunya tempat aman. Jangan tertinggal jauh; dia menunggumu.
2. **Pukul pohon dan batu dengan tangan kosong** (klik ke arahnya) — lambat tapi bisa. Kumpulkan 5 kayu + 3 batu, lalu buat **Kapak Batu** dan **Beliung Batu** (`C`). Bingung cari barang? `Esc` → **Panduan**.
3. **Buat Obor sebelum malam.** Malam itu gelap, dingin, dan serigala berburu dalam kawanan. Malam pertama tanpa obor = pelajaran yang menyakitkan.
4. **Semak beri** (`E`) untuk makanan. Masak di dekat api (`C` → Makanan Matang) supaya pulih jauh lebih banyak.
5. **Tidur di Menara Bara saat malam** (`E`) untuk melewati malam dengan aman — atau bertahan di luar kalau berani.

### Lima Pelita (tujuan utama)

Petunjuk ada di **Buku Catatan (`J`)** — dari arsip Wenda. Tidak ada panah penunjuk; petamu, kompasmu, dan petunjuk itulah alatmu.

- Tiap pelita **dijaga Bayangan Kelam**. Bunuh penjaganya → dapat **Bara Pelita** → nyalakan dengan `E` (butuh obor).
- Tiap pelita yang menyala = **titik teleport baru** ("api memanggil api") dan satu ingatan yang kembali.
- Pelita punya syarat progresi: Pelita Garam butuh **Perahu** (dan Marsa), Pelita Abu butuh **Mantel Bulu**.
- Setelah kelimanya menyala, kembali ke **Menara Bara**. Ada tiga pilihan ending — salah satunya butuh kepercayaan 5 penduduk.

### Penduduk Serambi

Sembilan penghuni, masing-masing memegang satu sistem: Neyra (tempaan tingkat II–III), Marsa (perahu), Rua (penanda pelita di peta), Ayung (bonus kulit), Ilma, Kanti, Sira, Wenda... dan seseorang di dekat sumur yang tidak disebut siapa pun.

- **Kedekatan tumbuh dari kerja bareng** (menu `E` → "Bekerja"), sekali per orang per hari: minigame timing 3 ronde — tekan `Spasi` di zona terang.
- Tingkat relasi: Asing → **Rekan** (buka sistemnya) → **Dipercaya** (syarat ending BAGI) → **Terikat**.
- **Pernikahan** ada, dan tidak bisa diburu-buru: Terikat + Perluasan Rumah + Cincin Bijih Bintang + waktu. Dia bisa menjawab "belum".

### Mode Kematian

| Mode | Aturan |
|---|---|
| **JEJAK** (normal) | Barang jatuh di tempatmu roboh. **Nisan Bara** — pilar cahaya — menandainya; kompas kedua menuntunmu kembali. Alat tetap dibawa. Tidak ada yang hilang permanen. |
| **PADAM** (permadeath) | Mati = save dihapus. Yang tersisa satu baris di **Batu Peringatan** di menu utama. Harus ketik `PADAM` untuk memilihnya. |
| **ZIARAH** (cerita) | Tanpa kematian — roboh berarti pingsan dan bangun di Serambi. Untuk yang datang demi cerita. |
| **MUSAFIR** (harian) | Seed dari tanggal hari ini — benua yang sama untuk semua orang. Satu nyawa. Skor lokal. |

Modifier: **Benua Luas** (6144²), **Tanpa Peta**, **Musim Panjang**, **Sendirian** (Serambi kosong — murni survival), seed manual.

---

## Dokumentasi Teknis

### Arsitektur

```
wildlands/
  index.html      ← buka ini
  style.css
  PROMPT.md       ← spesifikasi desain lengkap
  STORY.md        ← cerita, NPC, sistem relasi
  js/
    config.js     ← SEMUA angka balancing + state global G
    noise.js      ← value noise ber-seed, FBM, hash per-tile
    world.js      ← biome, objek, regrowth, cache chunk
    anchors.js    ← penempatan Serambi + 5 pelita + validasi flood-fill
    objects.js    ← definisi objek (HP, drop, alat, fungsi draw)
    entities.js   ← musuh, AI, spawner, proyektil, partikel
    player.js     ← stat, inventory, crafting, combat, kematian
    npc.js        ← 9 penduduk: dialog kontekstual, relasi, pernikahan
    quest.js      ← lima pelita, ingatan, tiga ending
    modes.js      ← mode kematian, kesulitan, Batu Peringatan
    achieve.js    ← 16 achievement + popup + penyimpanan lintas-dunia
    audio.js      ← SFX WebAudio (oscillator + noise burst + chime bel)
    render.js     ← SEMUA pemanggilan Canvas: terrain, y-sort, lighting, peta
    ui.js         ← HUD, panel, layar mode, roda teleport
    save.js       ← serialisasi localStorage + versioning
    game.js       ← fixed-timestep loop, input, orkestrasi
```

### Keputusan teknis penting

- **Dunia dihitung, bukan disimpan.** Benua 4096×4096 tile (16,8 juta tile) adalah fungsi murni dari `seed` — yang di-save hanya perubahan pemain (objek dipanen + hari panennya, bangunan, peti terbuka). Save utuh < 100 KB.
- **Jangkar tervalidasi.** Saat dunia dibuat: spawn dicari di pantai selatan, Serambi 150–250 tile ke utara, lima pelita di biome wajib (pantai/rimba/pulau/gurun/salju) pada pita jarak 400–1900 tile. **Flood-fill kasar (downsample 8×)** memastikan semua terjangkau; seed yang gagal dibuang otomatis. Tidak ada dunia yang mustahil ditamatkan.
- **Fixed timestep 60 Hz** — kecepatan game identik di monitor 60/144 Hz.
- **Chunk terrain di-cache** ke offscreen canvas 16×16 tile (LRU, maks 220 chunk) lalu di-blit.
- **Lighting berlapis:** overlay gelap di canvas kedua, "dilubangi" dengan `destination-out` + radial gradient per sumber cahaya. Warna bergeser per fase hari.
- **Y-sorting** objek + entity + pemain, jadi pemain bisa berdiri di belakang pohon.
- **Regrowth berbasis waktu:** semak 2 hari, pohon 6, bijih 10 — dicatat *kapan* dipanen, bukan *bahwa* dipanen.
- **Dialog tanpa pohon:** bank kalimat berlabel syarat (relasi, jam, terluka, event, musim) + prioritas; baris tertinggi yang lolos menang.

### Testing

- `node --check` untuk semua file JS.
- World-gen dites headless di Node (stub minimal): 12 seed → semua valid & deterministik.
- Smoke test headless Chrome: boot → 10 dtk gameplay → craft → NPC + kerja bareng → save → mati JEJAK → nisan → pelita menyala → load. (`_smoke` harness, tidak disertakan di produksi.)

### Deploy

Statis murni — bisa dihosting di mana saja (GitHub Pages, Vercel, Netlify) atau dibuka langsung dari disk (`file://`). Tidak ada backend, tidak ada dependensi.

---

Dibangun dari spesifikasi di `PROMPT.md` + `STORY.md`.
