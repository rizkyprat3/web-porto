# WILDLANDS — Referensi Lengkap Semua Perintah

Semua input yang dikenali game, apa yang dilakukannya, dan syarat-syaratnya.

---

## 1. Gerakan

| Perintah | Aksi | Catatan |
|---|---|---|
| `W` / `↑` | Jalan ke atas | |
| `S` / `↓` | Jalan ke bawah | |
| `A` / `←` | Jalan ke kiri | |
| `D` / `→` | Jalan ke kanan | Kecepatan dasar 140 px/dtk; Kesatria −8%, Barbarian +8% |
| **Tahan `Shift`** | Sprint | 240 px/dtk. Menguras stamina 12/dtk dan mempercepat lapar 2,2× |
| `Spasi` | **Dodge roll** | Meluncur cepat ke arah gerakan. **Kebal 0,3 detik** (i-frame). Biaya 25 stamina (Pengembara: 18). Satu-satunya cara selamat dari terjangan Beruang dan Bayangan Kelam |

Perahu (setelah dibuat): masuk saja ke perairan dangkal — otomatis berlayar, kecepatan +50%. Mantel Bulu: syarat menginjak biome salju.

## 2. Serangan (mouse)

| Perintah | Aksi | Catatan |
|---|---|---|
| **Klik kiri** | Serangan ringan | Ayunan busur ke arah kursor. Biaya 8 stamina, cooldown 0,38 dtk |
| **Tahan klik kiri ≥ 0,5 dtk, lepas** | Serangan berat | Damage 2,5× (**Barbarian: 3×**), jangkauan lebih luas, menembus blok bandit. Biaya 22 stamina. Lingkaran oranye di karakter = charge siap |
| Gerakkan mouse | Arah bidik | Karakter menghadap kursor selama menyerang |

Damage dasar: tangan kosong 12 · Gada 18 · Pedang Besi 22 · Pedang Bara 34.

**Menebang / menambang:** serang (klik) ke arah pohon/batu/bijih. **Tangan kosong bisa, tapi 3× lebih lambat** — alat batu normal, alat besi 3× lebih cepat, serangan berat 2× lagi. Satu-satunya gerbang keras: **bijih bintang wajib Beliung Besi**. Panduan lokasi semua sumber daya ada di menu `Esc` → "Panduan".

## 3. `E` — Interaksi (satu tombol, konteks menentukan)

Prioritas dicek dari atas ke bawah; yang pertama cocok yang jalan:

| Dekat apa | Yang terjadi |
|---|---|
| **Nisan Bara** (pilar cahaya biru) | Ambil kembali semua barang yang jatuh saat mati |
| **NPC** (≤ 1,5 tile) | Buka menu NPC → lihat bagian 4 |
| **Pedagang Kapal** (dermaga, tiap hari ke-6/12/18…, hanya siang) | Buka toko: beli Kain (12 emas), Masakan (4), Besi (8); jual Makanan (2 emas) |
| **Pelita padam** | Menyalakan — butuh **Obor** (dimiliki) + **1 Bara Pelita** (drop dari Bayangan Kelam penjaganya) |
| **Pelita menyala** | Buka roda teleport |
| **Titik Api** (gerbang api berlabel di desa) | Buka roda teleport |
| **Menara Bara** — malam | **Tidur sampai fajar** (pulih penuh, lapar −15) |
| **Menara Bara** — 5 pelita menyala | **Pilihan ending** (NYALAKAN / PADAMKAN / BAGI) |
| **Menara Bara** — siang | Buka roda teleport |
| **Api unggun milikmu** | **Daftarkan jadi SUAR** — titik teleport pribadi (maks 3) |
| **Suar milikmu** | Buka roda teleport |
| **Peti** (di depan wajah) | Buka: emas + kadang besi/kain/bijih bintang. Sekali saja per peti |
| **Semak beri / kaktus** (di depan wajah) | Petik langsung tanpa alat |
| **Rua di bangkai kapal** (awal permainan) | Mulai diantar ke Serambi — ikuti dia, dia menunggu kalau kamu tertinggal |

## 4. Menu NPC (setelah menekan `E` pada penduduk)

| Tombol menu | Aksi | Batas |
|---|---|---|
| **Mengobrol** | NPC melempar situasi, kamu memilih jawaban. Jawaban yang **sesuai wataknya** = +1 keakraban (Rakyat Biasa: +2). Jawaban salah = tidak dapat apa-apa, tidak dihukum | 1× per NPC per hari |
| **Bekerja** (mis. "Menempa bersama Neyra") | Minigame timing → bagian 5 | 1× per NPC per hari |
| **Lamar** | Melamar. Hanya muncul jika: relasi **Terikat** + belum menikah. Diterima jika: **Perluasan Rumah** sudah dibuat + **Cincin Bijih Bintang** di tas + hari ≥ 24 + kepercayaan sudah matang ≥ 12 hari. Kurang salah satu = dia menjawab "belum" | sekali seumur dunia |
| **Pergi** | Tutup | |

Tingkat relasi (dilihat di `J`): Asing → **Rekan** (3) → **Dipercaya** (8) → **Terikat** (15).
Rekan membuka sistem NPC itu: Neyra = resep tier II–III, Marsa = perahu, Rua = lingkaran pencarian pelita di peta, Ayung = +1 kulit tiap buruan.

## 5. Minigame Kerja Bareng

| Perintah | Aksi |
|---|---|
| `Spasi` | Tekan saat garis kursor berada **di dalam zona terang** |

3 ronde, makin cepat tiap ronde. **Kena ≥ 2 dari 3** = +1 keakraban (Rakyat Biasa +2) + hadiah kecil (besi dari Neyra, makanan dari Marsa/Kanti, kulit dari Ayung, masakan dari Ilma, emas dari Sira).

## 6. Bertahan hidup

| Perintah | Aksi | Catatan |
|---|---|---|
| `Q` | Makan | Masakan didahulukan (+55 lapar, +20 HP, menghapus lemah pasca-mati), lalu makanan mentah (+25 lapar) |
| `F` | Letakkan api unggun | Butuh **Api Unggun** dari crafting (10 kayu + 5 batu). Sumber cahaya + kehangatan + tempat memasak |

Regen HP otomatis saat lapar > 60 **dan** suhu > 40. Lapar 0 = HP terkuras. Suhu 0 = HP terkuras 2× lebih cepat (Barbarian membeku 35% lebih cepat — bawa api).

## 7. Panel

| Perintah | Aksi | Isi |
|---|---|---|
| `C` | Crafting (buka/tutup) | Klik resep untuk membuat. Merah = bahan kurang / butuh NPC Rekan. "Makanan Matang" butuh berdiri dekat api |
| `J` | Buku Catatan | Petunjuk pelita dari Wenda · daftar penduduk + tingkat relasi (Hulan tidak ada di sini — itu bukan bug) · **daftar 16 achievement** (belum terbuka = `???`) · status run |
| `M` | Peta besar (buka/tutup) | Fog of war — hanya wilayah yang pernah kamu lihat. Penanda: Serambi, pelita yang ditemukan/menyala, Nisan Bara, posisimu. Lingkaran biru putus-putus = wilayah pencarian dari Rua (butuh Rua Rekan) |
| `Esc` | Jeda | Lanjut / Simpan & keluar ke menu |
| Tombol `🔊` (kanan atas) | Bisukan / bunyikan semua suara | |

## 8. Roda Teleport ("api memanggil api")

Terbuka lewat `E` di Titik Api, Menara, pelita menyala, atau suar milikmu.

**`T` — Jalur Api (teleport instan).** Setelah kamu **membantu warga 5 kali** (kerja bareng atau jawaban obrolan yang benar, dihitung gabungan), Rua memanggilmu dan mengajarkan rahasia kartografer: tekan `T` **dari mana saja** untuk membuka roda teleport tanpa harus berdiri di api. Aturan lain tetap: hanya siang, biaya 30 lapar, dan tujuannya hanya titik api yang sudah kau kenal (Titik Api Serambi, pelita yang sudah kau nyalakan, suar buatanmu). Membuka achievement *Rahasia Kartografer*.

| Perintah | Aksi |
|---|---|
| Klik ikon tujuan | Berpindah ke sana |
| Batal | Tutup tanpa pindah |

Aturan: **hanya siang** (fajar + siang) · biaya **30 lapar** · tujuan = Titik Api Serambi + tiap pelita yang sudah menyala + maks 3 suar buatanmu. Tiap ikon berbentuk siluet tempatnya — belajar mengenali dunia dari bentuk.

## 9. Layar awal & pemilihan

**Menu utama:** `Lanjutkan` (jika ada save) · `Dunia Baru` · `Batu Peringatan` (daftar run PADAM yang gugur).

**Layar "Pilih Jalanmu":**

| Pilihan | Opsi |
|---|---|
| **Siapa kamu?** | Kesatria · Rakyat Biasa · Barbarian · Pengembara (klik kartu) |
| **Bagaimana kamu mati?** | JEJAK (normal) · PADAM (permadeath — **wajib mengetik `PADAM`** di kolom konfirmasi) · ZIARAH (tanpa kematian) · MUSAFIR (seed harian, satu nyawa, skor) |
| Kesulitan | Tenang / Standar / Kelam |
| Modifier (centang) | Benua Luas (6144²) · Tanpa Peta · Musim Panjang · Sendirian (Serambi kosong) |
| Seed | **Kosong = Benua Standar (777)** — Serambi selalu di tempat yang sama. Isi angka untuk benua lain |

## 10. Perintah kontekstual yang tidak terlihat

Hal-hal yang terjadi tanpa tombol:

- **Prompt `[E] …`** di bawah layar selalu memberi tahu interaksi apa yang tersedia di posisimu.
- **Kompas kiri atas**: panah oranye selalu menunjuk Serambi; panah biru muncul hanya saat ada Nisan Bara.
- **Mati (mode JEJAK)**: otomatis — sumber daya & emas jatuh ke nisan, alat tetap dibawa, bangun di Serambi dengan HP maks −10% sampai makan masakan atau tidur.
- **Spora**: JANGAN dibunuh dari jarak dekat — pecah jadi 2 virus + ledakan. Pakai serangan berat dari tepi jangkauan, atau pancing ke jebakan duri desa.
- **Jebakan duri**: hanya melukai musuh, aman untuk kamu. Koridor gerbang selatan & utara bersih.
- **Autosave**: tiap fajar, tiap 45 detik, dan saat menutup tab.

---

*Referensi ini mencerminkan kode di `js/game.js` (input), `js/npc.js` (menu NPC), dan `js/ui.js` (panel). Kalau game dan dokumen ini berbeda, laporkan — itu bug.*
