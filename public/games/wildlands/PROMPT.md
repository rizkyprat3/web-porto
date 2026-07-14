# Prompt: "WILDLANDS" — Open-World Survival Web Game

## Instruksi utama

Bangun game **open-world top-down** yang berjalan penuh di browser. Vanilla JavaScript + Canvas 2D. **Tanpa dependensi, tanpa build step, tanpa file gambar/audio apa pun** — semua visual digambar prosedural lewat Canvas, semua suara di-generate lewat WebAudio oscillator. Harus jalan hanya dengan membuka `index.html` (protokol `file://` juga harus bisa — jangan pakai ES module `import`, gunakan `<script>` tag berurutan).

Nama game: **WILDLANDS**.

> Cerita, karakter, dialog, relasi, dan pernikahan didefinisikan di **`STORY.md`**. Dokumen ini dan `STORY.md` adalah satu spesifikasi utuh — baca dua-duanya sebelum menulis kode.

## Konsep

Pemain terdampar di sebuah benua terpencil yang benuanya dibangkitkan prosedural dari sebuah seed. Di tengahnya ada satu permukiman kecil bernama **Serambi**, sisa terakhir sebuah ordo penjaga mercusuar. Di luar gerbang Serambi, dunia luas, dingin, dan tidak peduli padamu.

**Nada yang dikejar — dan ini harus tegas:**
- **Di luar Serambi:** sunyi, luas, sedikit berbahaya. Bukan power fantasy. Kamu kecil dan dunia tidak menunggumu.
- **Di dalam Serambi:** hangat, sesak, hidup. Api, suara orang, bau masakan.

Kontras antara dua rasa inilah **inti emosional game ini**. Setiap kali pemain melangkah keluar gerbang, dia harus merasa kehilangan sesuatu; setiap kali pulang, harus merasa lega. Kalau kedua rasa itu tercampur jadi satu, game ini gagal.

## Pilar desain (jangan dilanggar)

1. **Dunia dihitung, bukan disimpan.** Terrain dan objek adalah fungsi murni dari koordinat + seed. Yang disimpan hanya *perubahan* pemain.
2. **Malam adalah tekanan.** Siang produktif, malam gelap dan berburu. Ekonomi game berputar di sekitar "aku harus siap sebelum gelap".
3. **Benua punya tepi.** Dunia besar tapi **terbatas** — bisa dihabiskan, bisa dihafal, bisa dimiliki. Dunia tak berujung terasa kosong; dunia bertepi terasa nyata.
4. **Tidak ada tutorial teks.** Pemain belajar dari feedback visual, ikon, dan omongan penduduk.

---

## MODE PERMAINAN

Layar pertama sebelum masuk game. Pemain memilih **Mode Kematian** (wajib, tidak bisa diubah setelah dunia dibuat) lalu opsional mengubah **Tingkat Kesulitan** dan **Modifier**.

### Mode Kematian

#### 1. `JEJAK` — Normal *(default)*

Mati bukan akhir. Mati adalah **kehilangan sementara dan perjalanan pulang yang panjang.**

- Saat mati, **semua sumber daya dan emas jatuh** di tempat kamu roboh.
- **Alat dan senjata yang terpasang tetap dibawa.** Ini disengaja: menghilangkan alat akan menciptakan spiral kematian di mana pemain miskin makin tidak bisa bangkit.
- Di titik kematian muncul **Nisan Bara** — pilar cahaya yang menembus ke langit, terlihat dari jauh, muncul di peta dan minimap, dan **kompas kedua** di HUD selalu menunjuk ke arahnya.
- **Hanya ada satu nisan pada satu waktu.** Kalau kamu mati lagi sebelum mengambil yang lama, isi nisan lama **otomatis berpindah** ke nisan baru. Barang tidak pernah hilang permanen di mode ini — yang hilang adalah waktu dan rasa aman.
- Nisan **tidak kadaluarsa**. Tidak ada timer yang menghukum pemain yang sedang tidak sempat main.
- Respawn di Serambi saat fajar. Penalti: hunger tersisa separuh, dan **max health turun 10%** sampai kamu makan makanan matang atau tidur semalam.

#### 2. `PADAM` — Permadeath

Mati sekali, dunia itu selesai.

- Save **dihapus**. Tidak ada undo, tidak ada backup, tidak ada tombol muat ulang.
- Sebelum dihapus, jalannya dicatat ke **Batu Peringatan** — daftar permanen di menu utama:

  > *Seed 8842 · bertahan 34 hari · 3 dari 5 pelita menyala · menikah dengan Neyra · roboh di Reruntuhan Tulang, malam ke-34, dibunuh beruang.*

- Ini bukan sekadar hardcore mode — ini **selaras dengan temanya.** Kelam memakan ingatan; saat kamu mati, dunia benar-benar melupakanmu. Yang tersisa hanya satu baris di batu.
- Autosave tetap berjalan (biar tutup tab tidak menghukum), tapi kematian **menghapus** save-nya. Jangan pernah menyimpan cadangan diam-diam.
- Peringatan jelas di layar pemilihan mode, dan **konfirmasi ketik** — pemain harus mengetik kata `PADAM` untuk memulai. Mode ini tidak boleh dipilih tidak sengaja.

### Tingkat Kesulitan (bisa diubah kapan saja di mode JEJAK, terkunci di mode PADAM)

| | Tenang | Standar | Kelam |
|---|---|---|---|
| Damage musuh | 60% | 100% | 160% |
| Laju lapar & dingin | 60% | 100% | 140% |
| Kepadatan musuh malam | rendah | sedang | tinggi |
| Musuh masuk Serambi | tidak pernah | jarang | sering |

### Mode tambahan yang saya sarankan

**`ZIARAH` — mode cerita.** Tidak ada kematian sama sekali; health nol = pingsan dan bangun di Serambi tanpa penalti. Musuh lebih jinak, lapar sangat pelan. Untuk pemain yang datang demi dunia, penduduk, dan lima pelita — bukan demi bertahan hidup. Ini mode yang membuat game-mu bisa dinikmati orang yang tidak suka survival, dan biayanya hampir nol karena cuma mengubah angka.

**`KELAM BANGKIT` — mode dengan jam berdetak.** Saran saya yang paling kuat, karena ini satu-satunya mode yang **mengubah cara main, bukan cuma angkanya.** Kelam tidak lagi diam menunggu: ia **merayap**. Setiap beberapa hari, tepi peta membusuk — tile berubah kelabu, pohon jadi abu, musuh di zona itu jadi bayangan yang jauh lebih ganas, dan zona busuk itu **tidak bisa dipulihkan kecuali dengan menyalakan pelita di wilayah tersebut.** Kamu tidak lagi bebas menjelajah santai; kamu berlomba. Dan kalau Kelam sampai ke Serambi, penduduk mulai dilupakan satu per satu — permanen, bahkan yang sudah kamu nikahi. Mode ini mengubah open world yang tenang jadi tragedi yang berdetak.

**`MUSAFIR` — seed harian.** Semua pemain dapat benua yang sama tiap hari (seed dari tanggal). Satu nyawa, satu hari nyata. Skor = pelita menyala + hari bertahan + emas. Papan skor lokal saja (`localStorage`), tidak butuh backend. Murah dibuat, dan memberi alasan untuk membuka game tiap hari.

**Modifier lepas (checkbox, bisa dikombinasikan dengan mode mana pun):**
- `Benua Luas` — dunia 6144² alih-alih 4096². Sudut ke sudut ≈ 36 menit jalan kaki. Untuk yang mau tersesat sungguhan.
- `Tanpa Peta` — minimap dan peta besar mati total. Hanya kompas dan matamu.
- `Musim Panjang` — satu musim 24 hari alih-alih 12, untuk yang mau hidup pelan dan bertani.
- `Sendirian` — Serambi kosong. Tidak ada penduduk, tidak ada cerita, tidak ada pernikahan. Murni bertahan hidup di benua sunyi. Untuk pemain yang cuma ingin nada dingin itu, tanpa kehangatan sama sekali.
- `Seed manual` — masukkan angka sendiri, bagikan benua yang bagus ke teman.

---

## Dunia

### Ukuran

**Default: 4096 × 4096 tile** (≈ 131.000 px per sisi, ≈ 16,8 juta tile, sekitar 9 juta di antaranya daratan setelah falloff laut).

Angka ini dipilih dari **waktu tempuh, bukan dari angka cantik.** Dengan jalan 140 px/detik dan sprint 240 px/detik, kecepatan lintas-alam efektif ≈ 4 tile/detik setelah memutari gunung dan danau:

| Ukuran | Sisi ke sisi | Sudut ke sudut |
|---|---|---|
| 2048² | ~8,5 menit | ~12 menit |
| **4096² (default)** | **~17 menit** | **~24 menit** |
| 6144² (`Benua Luas`) | ~26 menit | ~36 menit |

Ukuran dunia nyaris gratis secara teknis — dunia dihitung, bukan disimpan. Yang naik cuma fog of war (bitmask ~8 KB di 4096²), canvas preview minimap (512×512 px), dan daftar objek yang ditebang (ratusan KB) — semuanya jauh di bawah batas 5 MB `localStorage`. **Yang membatasi ukuran dunia bukan komputer, tapi kesabaran pemain.** Karena itu ukuran ini terkunci ke sistem perpindahan di bawah; jangan perbesar dunia tanpa memperkuat perpindahannya.

Sediakan **`Benua Luas` (6144²)** sebagai modifier opsional di layar mode, dengan peringatan jujur: perjalanan akan jauh lebih lama.

- Di luar tepi: **laut badai** — kabut, ombak, dan arus yang mendorong pemain balik. Bukan tembok tak terlihat; batasnya harus terasa seperti dunia, bukan seperti bug.
- Elevasi dari **value noise ber-seed + FBM (4 oktaf)**; noise kedua independen untuk kelembapan. Sebuah **falloff radial** ditambahkan ke elevasi agar tepi benua selalu berakhir jadi laut — ini yang membuat bentuknya benar-benar jadi *benua*, bukan potongan peta acak.
- Biome dari elevasi × kelembapan: **Laut Dalam, Perairan, Pantai, Padang Rumput, Hutan, Rimba, Gurun, Pegunungan, Puncak Salju**.
- Air dan puncak salju tidak bisa dilewati (sampai pemain punya perahu / mantel).

### Jangkar wajib (ini yang mendamaikan cerita dengan dunia prosedural)

Dunia boleh acak, tapi **tempat-tempat penting tidak boleh acak.** Saat dunia dibuat, jalankan langkah ini **sekali** dan simpan hasilnya:

1. **Spawn** — bangkai kapal di pantai, selalu di sisi selatan benua.
2. **Serambi** — dicari di darat 150–250 tile ke arah utara dari spawn; pilih tile yang datar dan dekat air tawar. Perjalanan pertama dari bangkai kapal ke Serambi ≈ 1 menit: cukup untuk memperkenalkan dunia, cukup pendek untuk tidak menyiksa.
3. **Lima Pelita** — masing-masing wajib berada di biome yang ditentukan (`pantai`, `rimba`, `pulau lepas pantai`, `gurun`, `puncak salju`) **dan** dalam pita jarak yang naik bertahap dari Serambi: **± 400 / 800 / 1200 / 1600 / 1900 tile** (skalakan proporsional kalau ukuran dunia diubah). Cari kandidat tile yang memenuhi syarat, pilih deterministik dari seed.
4. **Validasi keterjangkauan.** Lakukan **flood-fill kasar** (downsample 8×) dari Serambi. Setiap pelita harus terjangkau lewat darat — kecuali Pelita Garam yang memang butuh perahu. Kalau ada yang tidak terjangkau, **pilih kandidat berikutnya dan ulangi.** Kalau setelah sekian percobaan tetap gagal, **buang seed itu dan buat benua baru.** Jangan pernah kirim pemain ke dunia yang tidak bisa ditamatkan.

Landmark biasa (desa terbengkalai, reruntuhan, kamp) ditaburkan acak pada grid kasar **64×64 tile**, dengan peluang ≈ 25% per region — menghasilkan ± 1.000 landmark tersebar di benua, atau rata-rata satu tiap 2 menit perjalanan. Cukup rapat untuk membuat menjelajah selalu berbuah, cukup jarang untuk membuat dunia tetap terasa kosong dan besar.

### Perpindahan cepat — dan kenapa ia wajib

Dunia sebesar ini **akan mati kalau pemain harus berjalan kaki 20 menit tiap kali pulang.** Tapi fast travel yang diberikan gratis sejak awal akan membunuh rasa luas yang justru jadi alasan dunia ini dibesarkan. Jadi perpindahan cepat harus **diperoleh, terbatas, dan lahir dari ceritanya sendiri:**

- **Api memanggil api.** Pelita yang sudah kamu nyalakan menjadi **titik pindah**. Kamu hanya bisa berpindah **dari satu api ke api lain** — dari Menara Bara di Serambi, atau dari pelita yang menyala, atau dari **api unggun yang kamu bangun sendiri** (maksimal 3 yang bisa didaftarkan sebagai suar). Ini membuat jaringan perjalananmu adalah **jaringan yang kamu bangun sendiri**, dan tiap pelita yang menyala membuat benua terasa mengerut sedikit — hadiah eksplorasi yang paling manis.
- **Berpindah hanya bisa dilakukan saat siang**, dan **menghabiskan hunger dalam jumlah besar**. Malam, kamu terjebak di tempatmu berada. Itu menjaga malam tetap menakutkan.
- **Rua** membuka **jalur pintas** (jalan setapak lama) begitu dia jadi Rekan, memangkas waktu tempuh antar-wilayah tanpa teleport.
- **Marsa** dan perahunya membuka **pelayaran menyusuri pantai** — jauh lebih cepat daripada memutari pegunungan lewat darat.

Perhatikan polanya: **tiga dari empat cara bepergian cepat datang dari penduduk Serambi.** Dunia yang lebih luas justru membuat orang-orang itu makin penting.

---

## TITIK API — bentuk tiap pelita

Aturan utama: **tidak ada dua titik api yang berbentuk sama.** Pelita bukan objek yang ditanam ordo di lima tempat berbeda — pelita adalah objek yang sudah **dua ratus tahun hidup di tempatnya**, dan tempat itu sudah mengubahnya. Bentuk tiap pelita menceritakan biome-nya tanpa satu baris teks pun.

Semua digambar prosedural: bentuk dasar dari `path` + gradient, api dari beberapa lapis segitiga/kurva yang bergoyang pakai `sin(t)`, cahaya dari `shadowBlur` + radial gradient. Tanpa file gambar.

Tiap pelita punya **dua wujud**: **PADAM** (saat pemain menemukannya) dan **MENYALA** (setelah dinyalakan). Perbedaan keduanya harus dramatis — momen menyalakan pelita adalah puncak tiap babak.

### Menara Bara — Serambi (pusat jaringan)

Mercusuar batu tua, tinggi, miring sedikit karena tanah turun. Batu abu-abu berlumut, tangga besi berkarat melingkarinya. Di puncaknya **api oranye besar** yang tidak pernah padam, dengan asap yang selalu miring searah angin.

Ini **satu-satunya api yang terasa hangat** dalam palet game. Semua pelita lain berwarna dingin atau asing. Saat pemain pulang dan melihat pijar oranye itu di kejauhan menembus malam, dia harus merasa lega — dan itu efek yang dibangun murni lewat warna.

*Cahaya:* radius besar, oranye hangat, berdenyut sangat pelan seperti napas orang tidur.

### 1. Pelita Pasir — Pantai / bangkai kapal

Bukan tiang, melainkan **rusuk kapal**. Lambung sebuah kapal karam menancap tegak di pasir, tulang-tulang kayunya melengkung ke atas seperti tulang rusuk binatang mati, dan di antara lengkungan itu tergantung **sebuah lentera kaca laut** — kaca hijau keruh yang sudah dikikis pasir selama puluhan tahun. Tali temali menjuntai. Kerang menempel di kayunya sampai setinggi lutut, menandai batas air pasang.

Lenteranya **mengayun pelan mengikuti angin laut** — dan animasi ayunan ini yang membuatnya hidup.

- **PADAM:** kaca gelap dan buram. Lenteranya mengayun, tapi ayunannya kaku, seperti bandul jam yang mati. Tali berderit — satu-satunya bunyi.
- **MENYALA:** **api putih-kebiruan**, api garam, terlalu dingin untuk warna api. Kacanya jernih. Cahayanya membelah kabut pantai, dan buih ombak di sekitarnya jadi ikut berpendar.

### 2. Pelita Akar — Rimba dalam

Pelita ini **sudah ditelan.** Sebuah pohon raksasa tumbuh menembus dan mengelilinginya selama dua abad; yang tersisa dari buatan manusia hanya **secuil cawan perunggu yang mengintip dari sela akar**. Akar-akar melilitnya seperti jemari yang menggenggam sesuatu erat-erat, membentuk sangkar hidup. Lumut, jamur, sulur menjuntai.

Ini pelita yang **tidak berbentuk seperti pelita**. Pemain harus butuh beberapa detik untuk sadar bahwa gundukan akar itulah yang dia cari.

- **PADAM:** rongga di antara akar hitam pekat. Tidak ada serangga, tidak ada burung — hening total, padahal ini rimba.
- **MENYALA:** **api hijau-keemasan yang berdenyut dari dalam rongga akar**, seperti napas. Cahayanya merembes lewat celah akar dalam berkas-berkas tipis. Kunang-kunang dan spora terbang keluar, dan **suara hutan kembali sekaligus** — momen paling mendebarkan dari lima pelita.

### 3. Pelita Garam — Pulau lepas pantai

**Pilar kristal garam** setinggi tiga orang, tumbuh dari karang seperti stalagmit, permukaannya bersudut-sudut dan tembus pandang. Pelita aslinya ada di dalam sana — terkubur, terselubung, tumbuh tertutup garam selama dua abad. Dasarnya **tenggelam dan muncul mengikuti pasang surut**, jadi rupanya berubah tergantung jam.

- **PADAM:** kristal keruh keabu-abuan. Ombak menghantamnya dan pecah tanpa suara — Kelam memakan bahkan bunyi laut.
- **MENYALA:** apinya menyala **di dalam kristal**, dan cahayanya **membias keluar** — gambar api yang pecah jadi puluhan pantulan bersudut, **putih-perak**, memercik ke air di sekelilingnya. Efek refraksi ini digambar dengan menumpuk beberapa segitiga cahaya semi-transparan dengan sudut berbeda. Titik api paling indah di game.

### 4. Pelita Tulang — Reruntuhan gurun

**Lengkung tulang iga raksasa** — bangkai sesuatu yang mati di gurun ini jauh sebelum ordo datang — menancap dari pasir membentuk gerbang. Di bawah lengkungannya, sebuah **cawan perunggu di atas tripod**, setengah tertimbun. Pasir mengalir terus-menerus melintasi kakinya, dan kadang cawannya nyaris tertelan.

- **PADAM:** cawan kosong dan penuh pasir. **Badai pasir** sesekali lewat dan menutupi seluruh pelita — pemain bisa berdiri tepat di sampingnya dan tidak melihatnya.
- **MENYALA:** **api oranye-merah dalam**, dan yang khas: **api itu berkedip-kedip** karena pasir yang beterbangan terus menghalanginya. Cahayanya tidak stabil, tersendat, seperti jantung yang lemah. Tulang-tulang di sekelilingnya jadi memancarkan bayangan panjang yang bergerak.

### 5. Pelita Abu — Puncak salju

**Obelisk hitam retak**, hampir seluruhnya terkubur salju; hanya sepertiga bagian atasnya yang muncul. Permukaannya licin dan gelap — batu yang bukan berasal dari benua ini. Retakan-retakan halus menjalarinya.

Ini titik api yang **paling tidak ramah**, dan memang harus begitu: ini pelita Babak V.

- **PADAM:** salju di sekitarnya sempurna, tanpa jejak, tanpa angin. **Hening yang paling pekat di seluruh game** — matikan hampir seluruh audio saat pemain mendekat, sampai yang terdengar cuma langkah kakinya sendiri.
- **MENYALA:** **api biru sangat pucat, nyaris tak berwarna** — api yang **tidak memberi kehangatan** (mendekat tidak menaikkan suhu tubuh; satu-satunya pelita yang begitu). Salju di sekelilingnya **tidak meleleh**. Tapi saat ia menyala, retakan di obelisk **ikut menyala dari dalam**, seperti pembuluh darah. Dan seseorang yang selama ini berdiri di latar akhirnya punya nama.

### Suar buatan pemain

Api unggun biasa yang **didaftarkan** jadi titik pindah (maksimal 3). Bentuknya: api unggun biasa, plus **tumpukan batu (cairn)** yang kamu susun di sampingnya dan **sepotong kain yang berkibar di ranting**. Sederhana, kasar, jelas buatan tangan — kontras dengan lima pelita yang megah.

Kain kibarnya menandai bahwa ini **milikmu**. Dan itu penting: dari kejauhan, pemain harus bisa membedakan tempat yang dibangun peradaban dengan tempat yang dia bangun sendiri.

### Menyalakan & berpindah

**Menyalakan** butuh obor yang menyala dan **bahan bakar khusus tiap pelita** (didapat dari mengalahkan penjaganya). Momen menyala: layar meredup sesaat, api merambat, lalu **gelombang cahaya menyapu keluar** dari pelita — dan di sepanjang gelombang itu, kabut Kelam di wilayah tersebut terangkat.

**Berpindah:** berdiri di api mana pun, tekan `E`, dan muncul **roda titik api** — tiap titik ditampilkan sebagai **ikon kecil berbentuk pelitanya sendiri** (rusuk kapal, sangkar akar, pilar kristal, lengkung tulang, obelisk, mercusuar, cairn). Pemain belajar mengenali dunianya dari siluet.

Transisinya: kamera **masuk ke dalam api**, layar memutih sesaat, lalu keluar dari api tujuan. Hanya siang. Menghabiskan banyak hunger.

### Regenerasi sumber daya

Objek yang dipanen **jangan disimpan sebagai daftar "sudah hilang"** — simpan **kapan** ia dipanen. Ia tumbuh kembali:

| Objek | Tumbuh lagi setelah |
|---|---|
| Semak beri | 2 hari |
| Pohon | 6 hari |
| Urat bijih | 10 hari |
| Batu | tidak pernah |
| Bangunan (gubuk, pilar, tembok) | tidak pernah |

Tanpa ini, area di sekitar rumah pemain akan jadi gurun gundul permanen dalam beberapa jam — masalah yang menghancurkan basis di hampir semua game survival buatan sendiri.

---

## Survival

| Stat | Perilaku |
|---|---|
| **Health** | Turun kalau diserang, kelaparan, atau kedinginan. Regen pelan saat kenyang & hangat. |
| **Hunger** | Turun perlahan, lebih cepat saat sprint & bertarung. Nol = health terkuras. |
| **Stamina** | Habis saat sprint, menyerang, dan menghindar. Pulih saat diam. |
| **Suhu** | Turun di malam hari & biome salju, naik dekat api. Nol = health terkuras cepat. |

### Siklus siang-malam

- **Satu hari = 12 menit nyata:** fajar 1, siang 7, senja 1, malam 3.
- Satu **musim = 12 hari** (≈ 2,4 jam bermain). Empat musim. Musim mengubah warna dunia, hasil tani, dan seberapa kejam malamnya (malam musim dingin lebih panjang dan lebih dingin).
- **Lighting berlapis:** overlay gelap di canvas terpisah, "dilubangi" pakai `globalCompositeOperation = 'destination-out'` dengan radial gradient di tiap sumber cahaya. Warna overlay bergeser: oranye saat senja, biru dalam saat malam, putih pucat saat badai salju.

---

## Crafting, alat, & ekonomi

Sumber daya: **kayu, batu, besi, bijih bintang, makanan, emas.**

**Alat sebagai gerbang progresi** (tanpa beliung pegunungan sia-sia dikunjungi; tanpa obor malam mustahil dijelajahi):

| Tingkat | Alat / Senjata | Bahan | Efek |
|---|---|---|---|
| I | Kapak batu | 5 kayu + 3 batu | Menebang pohon |
| I | Beliung batu | 3 kayu + 5 batu | Menambang batu |
| I | Obor | 2 kayu | Cahaya pribadi |
| I | Api unggun | 10 kayu + 5 batu | Cahaya + hangat + memasak |
| II | Kapak & beliung besi | + 6 besi | Jauh lebih cepat; beliung besi syarat menambang **bijih** |
| II | Pedang besi | 5 kayu + 8 besi | Damage dasar |
| II | Zirah kulit | 8 kulit | +HP, sedikit hangat |
| III | Pedang bara | 10 besi + 3 bijih bintang | Damage besar + menyala (sumber cahaya) |
| III | Zirah lempeng | 16 besi + 4 kulit | +HP besar, gerak sedikit lebih lambat |
| III | Mantel bulu | 10 kulit + 4 kain | **Syarat masuk Puncak Salju** |
| III | Perahu | 30 kayu + 6 kain | **Syarat mencapai Pelita Garam** |

Tiga tingkat, bukan satu — supaya kurva progresi merentang sepanjang lima babak cerita, bukan habis dalam setengah jam.

**Emas harus punya tempat untuk dibelanjakan.** Kalau tidak, ia mata uang mati. Sumbernya: peti, bandit, menjual hasil tani & ikan. Penyerapnya:
- **Pedagang kapal** yang berlabuh di pantai Serambi **tiap 6 hari, hanya siang**, lalu pergi. Menjual: resep yang tidak bisa ditemukan sendiri, benih, kain, kunci reruntuhan, dan barang langka yang berganti tiap kunjungan. **Kelangkaan waktunya yang membuat emas terasa berharga.**
- Membangun & memperluas rumah (syarat menikah — lihat `STORY.md`).

---

## Musuh & combat

Combat harus cukup dalam untuk menopang dunia sebesar ini. Minimal:

- **Serangan ringan** — ayunan busur ke arah kursor, cepat, murah stamina.
- **Serangan berat** — ditahan lalu dilepas; lambat, damage besar, menembus blok.
- **Menghindar (dodge roll)** — `Space`. Ada **i-frame ~0,3 detik**, biaya stamina. Ini yang membuat "lari atau bertarung" jadi keputusan nyata dan bukan sekadar lomba lari.

| Musuh | Perilaku |
|---|---|
| **Slime** | Siang, lambat, pasif sampai diserang. Musuh latihan. |
| **Serigala** | Malam, berkelompok 2–4, cepat, mengepung dari sisi. |
| **Bandit penebas** | Dekat reruntuhan, agresif, bisa memblok serangan ringan |
| **Bandit pemanah** | **Serangan jarak jauh.** Menjaga jarak, memaksa pemain mendekat sambil menghindar. Ini yang mematahkan taktik "berdiri diam dan ayunkan pedang". |
| **Beruang** | Jarang, di hutan dalam. Damage brutal, tapi ada telegraph jelas sebelum menerjang — bisa dihindari kalau pemain sabar. |
| **Bayangan Kelam** | Hanya di zona busuk (mode `KELAM BANGKIT`) dan di sekitar pelita yang padam. Menembus, tidak bisa diblok, hanya bisa dihindari. |

AI: idle wander → deteksi radius → mengejar → serang, plus **separation** agar tidak menumpuk. Musuh punya knockback, hit-flash, telegraph sebelum serangan berat, dan damage number melayang.

---

## UI

- HUD: health, hunger, stamina, suhu, jam siang-malam, musim & hari ke-.
- **Dua kompas:** satu selalu menunjuk Serambi, satu menunjuk Nisan Bara (hanya muncul kalau ada nisan aktif).
- **Minimap** pojok + peta besar (`M`): sampling noise kasar, hanya menampilkan wilayah yang **sudah pernah dilihat** (fog of war). Landmark yang ditemukan tertandai permanen.
- Hotbar dengan ikon prosedural + jumlah.
- Panel crafting (`C`), pause (`Esc`), buku catatan (`J`) berisi petunjuk pelita dari Wenda.
- Layar mode di awal, dan **Batu Peringatan** (daftar run PADAM yang gugur) di menu utama.

## Kontrol

`WASD` gerak · `Shift` sprint · klik kiri serang ringan · tahan klik kiri serang berat · `Space` menghindar · `E` interaksi & panen · `C` crafting · `F` letakkan api unggun · `J` catatan · `M` peta · `Esc` pause.

---

## Arsitektur kode (WAJIB)

Jangan tulis satu file raksasa. Muat berurutan lewat `<script>`:

```
wildlands/
  index.html
  style.css
  js/
    noise.js       # value noise ber-seed, FBM, hash per-tile
    world.js       # biome, tile, objek, regenerasi, cache chunk
    anchors.js     # penempatan Serambi + 5 pelita + validasi flood-fill
    objects.js     # definisi objek: HP, drop, alat, fungsi draw
    entities.js    # musuh, AI, spawner, partikel
    player.js      # stat, inventory, crafting, combat, kematian
    npc.js         # penduduk: jadwal, dialog kontekstual, relasi  (lihat STORY.md)
    quest.js       # lima pelita, flag cerita, ending             (lihat STORY.md)
    modes.js       # mode kematian, kesulitan, modifier, Batu Peringatan
    render.js      # SEMUA pemanggilan Canvas ada di sini
    ui.js          # HUD, minimap, panel, layar mode
    save.js        # serialisasi + versioning
    game.js        # game loop, input, orkestrasi
```

Aturan keras:
- **Logika dan render terpisah total.** `world.js`, `entities.js`, `player.js`, `npc.js` **tidak boleh memanggil API Canvas sama sekali.**
- Chunk terrain di-cache ke **offscreen canvas** (16×16 tile) lalu di-blit.
- Objek dan entity digambar dengan **y-sorting** supaya pemain bisa berdiri di belakang pohon.
- **Fixed timestep 60 Hz** untuk update; game tidak boleh jadi cepat di monitor 144 Hz.
- Culling ketat: hanya proses & gambar viewport + margin. Entity jauh di-despawn.
- Semua angka balancing (HP, damage, laju lapar, panjang hari, regrowth, drop rate, pengali kesulitan) dikumpulkan di **satu blok konstanta** di puncak file.

---

## Save

`localStorage`, **dengan nomor versi skema** dan migrasi yang jelas (game ini akan berubah; save yang tidak bisa dimigrasi harus ditolak dengan sopan, bukan bikin crash).

Yang disimpan:
- `version`, `seed`, `mode` (JEJAK/PADAM/…), kesulitan, modifier aktif
- Posisi & stat pemain, inventory, alat & zirah yang dimiliki
- **Objek yang dipanen beserta hari saat dipanen** (untuk regrowth)
- Benda yang dibangun pemain, peti yang sudah dibuka
- **Nisan Bara aktif**: posisi + isinya
- Waktu: hari ke-, musim, jam
- **Seluruh state cerita:** tingkat relasi tiap penduduk, babak arc personal, flag quest lima pelita, status menikah & dengan siapa, apakah Hulan sudah dikembalikan, zona yang sudah dibusukkan Kelam
- Fog of war & landmark yang ditemukan
- **Batu Peringatan** disimpan di key terpisah agar selamat dari penghapusan save mode PADAM

Autosave tiap fajar dan tiap kali keluar. Di mode `PADAM`, kematian **menghapus** save dan menulis satu baris ke Batu Peringatan.

> Catatan `file://`: semua halaman `file://` berbagi origin yang sama, jadi beri prefix key (`wildlands.v1.…`) supaya tidak bentrok dengan proyek lain.

---

## Kriteria selesai

- [ ] Buka `index.html` langsung dari disk, tanpa server, tanpa error console.
- [ ] Seed yang sama selalu menghasilkan benua yang identik.
- [ ] **Setiap dunia yang dibuat dijamin bisa ditamatkan** — kelima pelita lolos validasi keterjangkauan.
- [ ] Jalan kaki 20 menit menyeberangi benua tetap 60 FPS dan memori tidak membengkak; tepi benua tercapai dan terasa disengaja, bukan seperti bug.
- [ ] Menyalakan pelita membuka titik pindah, dan benua terasa mengerut sedikit tiap kali itu terjadi.
- [ ] Loop lengkap terbukti bisa dimainkan: tebang pohon → beliung → tambang bijih → pedang → tembus reruntuhan → buka peti → nyalakan pelita.
- [ ] Malam pertama menegangkan tanpa obor, terkelola dengan api unggun.
- [ ] **Mode JEJAK:** mati → barang jatuh → nisan menyala & terlihat dari jauh → kompas menuntun pulang → barang kembali utuh. Mati dua kali → isi nisan lama pindah, tidak ada yang hilang.
- [ ] **Mode PADAM:** mati → save benar-benar hilang → satu baris muncul di Batu Peringatan → tidak ada jalan untuk memulihkan.
- [ ] Pohon yang ditebang tumbuh kembali setelah 6 hari.
- [ ] Save/load benar termasuk seluruh state cerita, relasi, dan pernikahan.

## Yang TIDAK dibuat

Tanpa multiplayer, tanpa backend, tanpa akun, tanpa framework, tanpa asset eksternal, tanpa iklan. Kedalaman datang dari dunia, tekanan malam, dan sembilan orang di Serambi — bukan dari menambah fitur.
