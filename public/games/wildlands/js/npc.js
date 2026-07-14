// Sembilan penduduk Serambi — lihat STORY.md.
// Dialog: bank kalimat berlabel konteks + prioritas. Tidak ada pohon dialog.
// Relasi tumbuh dari KERJA BARENG, bukan dari hadiah.

var NPCS = [
  { nama: 'Sira',  warna: '#b0452f', home: [-8, -6],  work: [0, -13],  sistem: 'Pertahanan malam' },
  { nama: 'Neyra', warna: '#7a6a8f', home: [8, -7],   work: [6, 8],    sistem: 'Tempaan tingkat lanjut' },
  { nama: 'Ilma',  warna: '#4a7a5c', home: [-9, 4],   work: [-9, 2],   sistem: 'Ramuan & penyembuhan' },
  { nama: 'Kanti', warna: '#c9963f', home: [9, 5],    work: [-4, 8],   sistem: 'Pertanian & masakan' },
  { nama: 'Rua',   warna: '#3f6a9a', home: [-3, -10], work: [12, -12], sistem: 'Peta & penanda pelita' },
  { nama: 'Wenda', warna: '#8a5a7a', home: [4, -10],  work: [3, -9],   sistem: 'Arsip & petunjuk' },
  { nama: 'Marsa', warna: '#2f7a8a', home: [-10, -1], work: [-1, 12],  sistem: 'Laut & perahu' },
  { nama: 'Ayung', warna: '#5c6b3f', home: [10, 0],   work: [14, 10],  sistem: 'Berburu & kulit' },
  { nama: 'Hulan', warna: '#9a9aa5', home: [2, 9],    work: [-2, 6],   sistem: '?', hidden: true },
];

// bank dialog: prio tinggi menang; syarat semua harus terpenuhi.
// when: {rel, night, day, hurt, event, married, season}
var DIALOG = {
  Sira: [
    { prio: 90, when: { hurt: true }, line: 'Kau berdarah. Lain kali, mati saja sekalian di luar sana — lebih hemat perban.' },
    { prio: 80, when: { night: true }, line: 'Malam bukan waktunya jalan-jalan. Kembali ke dalam tembok, orang asing.' },
    { prio: 70, when: { event: 'lantern' }, line: 'Satu api menyala lagi. Dua ratus tahun kami menunggu... dan yang datang malah kau.' },
    { prio: 60, when: { rel: 8 }, line: 'Tanganku penuh bekas luka bakar. Setiap satu adalah malam ketika api hampir padam. Jangan tambah lagi.' },
    { prio: 40, when: { rel: 3 }, line: 'Kalau kau mau berguna, jaga sektor selatan malam ini. Aku tidak minta dua kali.' },
    { prio: 20, when: {}, line: 'Serambi bertahan karena semua orang bekerja. Kau juga, orang asing.' },
    { prio: 10, when: {}, line: 'Hm.' },
  ],
  Neyra: [
    { prio: 80, when: { event: 'lantern' }, line: '...Apinya beda warna. Aku dengar dari Wenda. Bagus.' },
    { prio: 60, when: { rel: 8 }, line: 'Telinga kiriku mati sejak umur dua belas. Palu ini yang bicara untukku sekarang.' },
    { prio: 45, when: { rel: 3 }, line: 'Kalau bawa besi, taruh di situ. Kalau tidak, pegang jepitnya. Kerja.' },
    { prio: 20, when: {}, line: '...' },
    { prio: 10, when: {}, line: '*mengangguk sekali, lalu kembali menempa*' },
  ],
  Ilma: [
    { prio: 95, when: { hurt: true, night: true }, line: 'Duduk. Jangan bicara. ...Ini akan perih.' },
    { prio: 90, when: { hurt: true }, line: 'Lagi? Tubuhmu bukan barang pinjaman yang boleh kau rusak seenaknya.' },
    { prio: 60, when: { rel: 8 }, line: 'Dulu aku mengambil barang orang mati. Sekarang aku menjahit orang hidup. Jangan tanya mana yang lebih jujur.' },
    { prio: 40, when: { rel: 3 }, line: 'Rak ketiga, jamur kering. Ambilkan. Cepat, sebelum rebusannya rusak.' },
    { prio: 20, when: {}, line: 'Aku sibuk.' },
    { prio: 10, when: {}, line: 'Kalau tidak sakit, jangan berdiri di dekat klinikku.' },
  ],
  Kanti: [
    { prio: 80, when: { season: 'Dingin' }, line: 'Tanahku tidur di musim dingin. Aku tidak. Ada saja yang harus dikerjakan.' },
    { prio: 60, when: { rel: 8 }, line: 'Semua orang pikir bertani itu menunggu. Bukan. Bertani itu bertengkar dengan langit setiap hari.' },
    { prio: 45, when: { rel: 3 }, line: 'Sini, bantu panen! Empat tangan lebih cepat dari dua — itu matematika petani.' },
    { prio: 30, when: {}, line: 'Jangan injak bedenganku. Aku serius. Aku pernah melempar Sira dengan cangkul.' },
    { prio: 10, when: {}, line: 'Hari yang baik untuk menanam sesuatu!' },
  ],
  Rua: [
    { prio: 80, when: { event: 'lantern' }, line: 'Api baru menyala. Aku sudah menandainya. Petaku hari ini lebih benar daripada kemarin — itu definisi hari yang baik.' },
    { prio: 60, when: { rel: 8 }, line: 'Orang bertanya kenapa aku sering menghilang. Peta tidak menggambar dirinya sendiri, itu jawabannya.' },
    { prio: 45, when: { rel: 3 }, line: 'Kau mau ke mana pun kau mau pergi, lihat petaku dulu. Aku sudah melingkari wilayah yang perlu kau cari.' },
    { prio: 20, when: {}, line: 'Jangan berdiri di cahayaku. Aku sedang menggambar garis pantai.' },
    { prio: 10, when: {}, line: 'Hm? Oh. Kau. Ya.' },
  ],
  Wenda: [
    { prio: 80, when: { event: 'lantern' }, line: 'A-arsipnya benar! Maksudku — tentu saja benar, arsip selalu... maksudku, selamat. Untuk apinya.' },
    { prio: 60, when: { rel: 8 }, line: 'Aku hafal delapan ribu halaman. Tapi kalau kau menatapku seperti itu aku lupa cara menyusun kalimat.' },
    { prio: 45, when: { rel: 3 }, line: 'Petunjuk pelita berikutnya... k-kutulis di catatanmu. Halaman terakhir. Sudah kubaca tiga kali supaya tidak salah.' },
    { prio: 20, when: {}, line: 'Arsip bilang orang asing terakhir datang tiga puluh tahun lalu. Kau... kau nyata, kan?' },
    { prio: 10, when: {}, line: 'M-maaf, aku sedang membaca.' },
  ],
  Marsa: [
    { prio: 80, when: { night: true }, line: 'Laut malam-malam? HA! Aku suka nyalimu. Aku tidak suka peluangmu.' },
    { prio: 60, when: { rel: 8 }, line: 'Kapal terakhir yang kubangun kubakar sendiri. Jangan tanya. ...Oke, tanya saja, ceritanya bagus.' },
    { prio: 45, when: { rel: 3 }, line: 'Tarik jalanya yang benar! Lepas pas tegang! Kau menarik seperti anak kucing!' },
    { prio: 20, when: {}, line: 'Angin dari selatan. Ikan lari ke utara. Semua lari dari sesuatu, kawan.' },
    { prio: 10, when: {}, line: 'HAHA! Lihat siapa yang datang!' },
  ],
  Ayung: [
    { prio: 60, when: { rel: 8 }, line: '*menunjuk hutan, lalu jantungnya, lalu kamu. Serigalanya mengendus tanganmu — itu tanda diterima.*' },
    { prio: 45, when: { rel: 3 }, line: '*menunjuk jejak di tanah: rumput rebah ke timur. Dia menunggumu membaca sisanya.*' },
    { prio: 20, when: {}, line: '*mengamatimu sebentar, lalu kembali mengasah pisau*' },
    { prio: 10, when: {}, line: '*mengangguk*' },
  ],
  Hulan: [
    { prio: 70, when: { named: true }, line: 'Kau memanggilku dengan namaku. Kau tidak akan pernah tahu rasanya... setelah selama itu tidak dipanggil siapa-siapa.' },
    { prio: 40, when: { rel: 3 }, line: 'Aku selalu di sini. Di dekat sumur. Kau satu-satunya yang berhenti.' },
    { prio: 20, when: {}, line: 'Kau bisa melihatku. ...Maaf. Maksudku — selamat pagi.' },
    { prio: 10, when: {}, line: 'Namaku... maaf. Kalimatnya selalu berhenti di situ.' },
  ],
};

function npcInit() {
  G.npcs = [];
  initGuards();
  if (G.mods.sendirian) return;
  var s = G.anchors.serambi, T = CFG.TILE;
  for (var i = 0; i < NPCS.length; i++) {
    var d = NPCS[i];
    G.npcs.push({
      def: d, nama: d.nama,
      x: (s.x + d.home[0]) * T + 16, y: (s.y + d.home[1]) * T + 16,
      tx: 0, ty: 0, wanderT: Math.random() * 4,
    });
    if (G.rel[d.nama] === undefined) G.rel[d.nama] = 0;
  }
  // Rua sang pemandu: sedang memetakan pantai saat kapalmu karam,
  // dan "tidak sengaja" jadi orang pertama yang menemukanmu.
  if (!G.story.guideDone) {
    var rua = npcByName('Rua');
    if (rua) { rua.x = (G.anchors.spawn.x + 3) * T; rua.y = (G.anchors.spawn.y - 3) * T; }
  }
}

function npcByName(nama) {
  for (var i = 0; i < G.npcs.length; i++) if (G.npcs[i].nama === nama) return G.npcs[i];
  return null;
}

function npcUpdate(dt) {
  var s = G.anchors.serambi, T = CFG.TILE;
  var hour = G.time.t / CFG.DAY_LEN;
  var p = G.player;
  for (var i = 0; i < G.npcs.length; i++) {
    var n = G.npcs[i];

    // ---- mode pemandu: Rua mengantarmu ke Serambi ----
    if (n.nama === 'Rua' && !G.story.guideDone) {
      if (!G.story.guideMet) {
        // menunggu di dekat bangkai kapal, mondar-mandir memetakan
        n.wanderT -= dt;
        if (n.wanderT <= 0) { n.ox = (Math.random() - 0.5) * 50; n.oy = (Math.random() - 0.5) * 30; n.wanderT = 2 + Math.random() * 3; }
        var hx = (G.anchors.spawn.x + 3) * T + (n.ox || 0), hy = (G.anchors.spawn.y - 3) * T + (n.oy || 0);
        var hdx = hx - n.x, hdy = hy - n.y, hd = Math.hypot(hdx, hdy);
        if (hd > 8) { n.x += hdx / hd * 50 * dt; n.y += hdy / hd * 50 * dt; n.walkT = (n.walkT || 0) + dt * 8; }
      } else {
        // mengantar: jalan ke gerbang selatan, menunggu kalau pemain tertinggal
        var gateX = s.x * T + 16, gateY = (s.y + 13) * T;
        var distToPlayer = Math.hypot(n.x - p.x, n.y - p.y);
        if (distToPlayer < 260) {
          var gdx = gateX - n.x, gdy = gateY - n.y, gd = Math.hypot(gdx, gdy);
          if (gd > 10) { n.x += gdx / gd * 118 * dt; n.y += gdy / gd * 118 * dt; n.walkT = (n.walkT || 0) + dt * 11; }
          else {
            G.story.guideDone = true;
            toast('Rua: "Selamat datang di Serambi. Menara di tengah itu — mulai dari sana."');
            toast('Titik Api di dekat menara adalah gerbang perjalananmu.');
          }
        }
      }
      continue;
    }

    // jadwal normal: kerja saat siang, pulang saat gelap
    var spot = (hour > 0.1 && hour < 0.65) ? n.def.work : n.def.home;
    var gx = (s.x + spot[0]) * T + 16, gy = (s.y + spot[1]) * T + 16;
    n.wanderT -= dt;
    if (n.wanderT <= 0) { n.ox = (Math.random() - 0.5) * 60; n.oy = (Math.random() - 0.5) * 60; n.wanderT = 3 + Math.random() * 5; }
    var dx = gx + (n.ox || 0) - n.x, dy = gy + (n.oy || 0) - n.y;
    var dist = Math.hypot(dx, dy);
    if (dist > 8) { n.x += dx / dist * 55 * dt; n.y += dy / dist * 55 * dt; n.walkT = (n.walkT || 0) + dt * 8; }
  }
}

function relLevel(nama) {
  var t = G.rel[nama] || 0;
  if (t >= CFG.REL.Terikat) return 'Terikat';
  if (t >= CFG.REL.Dipercaya) return 'Dipercaya';
  if (t >= CFG.REL.Rekan) return 'Rekan';
  return 'Asing';
}

function npcNear(maxDist) {
  var p = G.player, best = null, bd = maxDist || 48;
  for (var i = 0; i < G.npcs.length; i++) {
    var n = G.npcs[i];
    var d = Math.hypot(n.x - p.x, n.y - p.y);
    if (d < bd) { bd = d; best = n; }
  }
  return best;
}

function npcLine(n) {
  var bank = DIALOG[n.nama] || [];
  var p = G.player;
  var ctx = {
    rel: G.rel[n.nama] || 0,
    night: isNight(),
    hurt: p.hp < playerMaxHp(p) * 0.35,
    event: G.lastEvent || null,
    season: seasonOf(G.time.day),
    named: n.nama === 'Hulan' && G.story.hulanNamed,
  };
  var candidates = [];
  var topPrio = -1;
  for (var i = 0; i < bank.length; i++) {
    var d = bank[i], w = d.when, ok = true;
    if (w.rel !== undefined && ctx.rel < w.rel) ok = false;
    if (w.night !== undefined && ctx.night !== w.night) ok = false;
    if (w.hurt !== undefined && ctx.hurt !== w.hurt) ok = false;
    if (w.event !== undefined && ctx.event !== w.event) ok = false;
    if (w.season !== undefined && ctx.season !== w.season) ok = false;
    if (w.named !== undefined && ctx.named !== w.named) ok = false;
    if (!ok) continue;
    if (d.prio > topPrio) { topPrio = d.prio; candidates = [d]; }
    else if (d.prio === topPrio) candidates.push(d);
  }
  if (!candidates.length) return '...';
  var pick = candidates[Math.floor(Math.random() * candidates.length)];
  if (pick === n.lastLine && candidates.length > 1) pick = candidates[(candidates.indexOf(pick) + 1) % candidates.length];
  n.lastLine = pick;
  return pick.line;
}

// nama yang ditampilkan: Hulan tanpa nama sampai Pelita Abu menyala
function npcDisplayName(n) {
  if (n.nama === 'Hulan' && !G.story.hulanNamed) return '—';
  return n.nama;
}

// ---- mengobrol: pilih jawaban yang sesuai wataknya ----
// Hybrid dengan kerja bareng: dua jalur keakraban, masing-masing sekali sehari.
var TALKS = {
  Sira: [
    { q: '"Kenapa kau membantu desa ini? Jawab jujur."',
      opts: [{ t: 'Karena kalian butuh bantuan.', ok: false }, { t: 'Karena ada tugas yang harus selesai.', ok: true }, { t: 'Supaya kalian berutang padaku.', ok: false }],
      good: '"...Jawaban yang bisa kuhormati." *Dia mengangguk sekali.*', bad: '"Hm. Kata-kata." *Dia kembali menatap tembok.*' },
    { q: '"Malam ini giliran jagaku. Lagi."',
      opts: [{ t: 'Istirahatlah, biar aku yang jaga.', ok: true }, { t: 'Kau memang paling kuat di sini.', ok: false }],
      good: '"...Kau serius? Baik. Satu malam." *Untuk sekali, bahunya turun.*', bad: '"Aku tahu. Itu bukan pujian, itu beban."' },
  ],
  Neyra: [
    { q: '*Dia menunjuk dua bilah di landasan: satu berkilau, satu kusam tapi tebal.*',
      opts: [{ t: 'Yang berkilau lebih bagus.', ok: false }, { t: 'Yang tebal — itu yang akan pulang dari perang.', ok: true }],
      good: '*Sudut mulutnya bergerak. Hampir senyum.*', bad: '*Dia menaruh bilah berkilau itu di tumpukan rongsok.*' },
    { q: '"..." *Dia bekerja. Kau berdiri di situ.*',
      opts: [{ t: '(Bicara untuk mengisi keheningan)', ok: false }, { t: '(Diam, dan mengangsurkan jepit besi)', ok: true }],
      good: '*Dia menerima jepit itu tanpa menoleh. Itu artinya kau boleh tinggal.*', bad: '*Suara palunya makin keras sampai kau berhenti bicara.*' },
  ],
  Ilma: [
    { q: '"Lukamu kemarin. Masih perih?"',
      opts: [{ t: 'Sudah tidak apa-apa, jangan khawatir.', ok: false }, { t: 'Perih. Jahitanmu kasar.', ok: true }],
      good: '"HA! Akhirnya ada yang jujur di desa ini." *Dia melempar salep padamu.*', bad: '"Jangan khawatir, katanya. Aku tabib, bukan ibumu."' },
    { q: '"Orang bilang aku dulu penjarah. Kau dengar itu?"',
      opts: [{ t: 'Masa lalu bukan urusanku.', ok: true }, { t: 'Aku yakin kau punya alasan baik.', ok: false }],
      good: '"...Bagus. Karena memang bukan." *Tapi dia meraciknya lebih pelan, lebih rapi.*', bad: '"Alasan baik? Aku lapar dan mereka mati. Itu alasannya."' },
  ],
  Kanti: [
    { q: '"Menurutmu bedengan baruku kurang apa?"',
      opts: [{ t: 'Kelihatannya sudah sempurna!', ok: false }, { t: 'Parit airnya. Hujan deras bisa menggenang.', ok: true }],
      good: '"NAH! Itu! Kau petani juga rupanya!" *Dia langsung mengambil cangkul.*', bad: '"Sempurna itu kata orang yang tidak pernah menanam."' },
  ],
  Rua: [
    { q: '"Peta lama bilang di timur ada danau. Kakiku bilang tidak ada. Mana yang benar?"',
      opts: [{ t: 'Peta — arsip tidak berbohong.', ok: false }, { t: 'Kakimu. Peta cuma kertas yang menunggu dikoreksi.', ok: true }],
      good: '"YA. Persis." *Dia mencoret danau itu dengan puas.*', bad: '"Arsip ditulis orang yang tidak pernah ke timur."' },
  ],
  Wenda: [
    { q: '"A-aku bicara terlalu cepat lagi ya? Sira bilang aku... maaf—"',
      opts: [{ t: 'Pelan-pelan saja. Aku tidak ke mana-mana.', ok: true }, { t: 'Iya, coba diatur ritmenya.', ok: false }],
      good: '*Dia menarik napas, dan untuk pertama kalinya menyelesaikan kalimat tanpa tersandung.*', bad: '"O-oh. Iya. Maaf. Diatur. Iya." *Dia menunduk ke bukunya.*' },
  ],
  Marsa: [
    { q: '"HA! Ombak besok setinggi gubuk. Ikut melaut atau takut?"',
      opts: [{ t: 'Ikut. Kalau tenggelam, itu salahmu.', ok: true }, { t: 'Sebaiknya kita tunggu ombak tenang.', ok: false }],
      good: '"HAHAHA! Salahku! Aku suka itu! Berangkat fajar, jangan telat!"', bad: '"Menunggu? Laut tidak menghormati orang yang menunggu, kawan."' },
  ],
  Ayung: [
    { q: '*Dia menunjuk jejak di lumpur, lalu menatapmu. Menunggu.*',
      opts: [{ t: '(Menebak cepat: "Serigala?")', ok: false }, { t: '(Berjongkok, mengamati dulu, baru menunjuk arah timur)', ok: true }],
      good: '*Dia mengangguk dalam. Serigalanya duduk di sebelahmu — itu belum pernah terjadi.*', bad: '*Dia menggeleng pelan. Bukan soal jawabannya. Soal caramu menjawab.*' },
  ],
  Hulan: [
    { q: '"Kau... mau duduk di sini? Di dekat sumur? Tidak ada yang pernah duduk di sini."',
      opts: [{ t: '(Duduk tanpa berkata apa-apa)', ok: true }, { t: 'Kenapa tidak ada yang duduk di sini?', ok: false }],
      good: '*Kalian duduk. Lama. Dan untuk pertama kalinya dia tidak terlihat seperti bayangan.*', bad: '"...Aku tidak ingat. Maaf. Aku benar-benar tidak ingat."' },
  ],
};

function startTalk(n) {
  var bank = TALKS[n.nama];
  if (!bank || G.talkedToday[n.nama] === G.time.day) return;
  var item = bank[Math.floor(Math.random() * bank.length)];
  G.talkedToday[n.nama] = G.time.day;
  el('dlg-nama').textContent = npcDisplayName(n);
  el('dlg-teks').textContent = item.q;
  var html = '';
  for (var i = 0; i < item.opts.length; i++) html += '<button data-i="' + i + '">' + item.opts[i].t + '</button>';
  el('npc-actions').innerHTML = html;
  var nodes = el('npc-actions').querySelectorAll('button');
  for (var k = 0; k < nodes.length; k++) {
    nodes[k].onclick = function () {
      var opt = item.opts[this.getAttribute('data-i')];
      if (opt.ok) {
        gainTrust(n);
        uiDialog(npcDisplayName(n), item.good);
        SFX.workGood();
      } else {
        uiDialog(npcDisplayName(n), item.bad);
        SFX.workBad();
      }
    };
  }
}

function gainTrust(n) {
  G.rel[n.nama] = (G.rel[n.nama] || 0) + 1 + (charDef().trustBonus || 0);
  // setiap bantuan dihitung — 5 kali membantu warga membuka pelajaran Rua
  G.stats.helps = (G.stats.helps || 0) + 1;
  if (G.stats.helps >= 5 && !G.story.jalurApi && !G.story.jalurApiReady) {
    G.story.jalurApiReady = true;
    toast('Rua mendengar kau rajin membantu warga. Dia ingin bicara denganmu.');
    addJournal('Rua ingin menunjukkan sesuatu — temui dia. (Rahasia kartografer, katanya.)');
  }
  if (G.rel[n.nama] === CFG.REL.Rekan || (charDef().trustBonus && G.rel[n.nama] === CFG.REL.Rekan + 1)) {
    toast(npcDisplayName(n) + ' kini menganggapmu Rekan.');
    G.relDay[n.nama + '_rekan'] = G.time.day;
    unlockAch('rekan');
  }
  if (G.rel[n.nama] >= CFG.REL.Dipercaya && !G.relDay[n.nama + '_percaya']) {
    toast(npcDisplayName(n) + ' mulai mempercayaimu.');
    G.relDay[n.nama + '_percaya'] = G.time.day;
  }
  if (G.rel[n.nama] >= CFG.REL.Terikat && !G.relDay[n.nama + '_terikat']) {
    toast('Kalian kini Terikat — persahabatan sejati, atau mungkin lebih.');
    G.relDay[n.nama + '_terikat'] = G.time.day;
    unlockAch('terikat');
  }
}

// ---- kerja bareng: minigame timing 3 ronde ----
// Bar berjalan; tekan pada zona hijau. Berhasil 2/3 → +1 trust + hadiah kecil.
var WORK_LABEL = {
  Sira: 'Jaga malam bersama Sira', Neyra: 'Menempa bersama Neyra', Ilma: 'Meracik bersama Ilma',
  Kanti: 'Panen bersama Kanti', Rua: 'Memetakan bersama Rua', Wenda: 'Menyalin arsip bersama Wenda',
  Marsa: 'Menarik jala bersama Marsa', Ayung: 'Melacak bersama Ayung', Hulan: 'Menimba air bersamanya',
};
var WORK_REWARD = {
  Sira: { emas: 3 }, Neyra: { besi: 2 }, Ilma: { masak: 1 }, Kanti: { makanan: 3 },
  Rua: {}, Wenda: {}, Marsa: { makanan: 2 }, Ayung: { kulit: 1 }, Hulan: {},
};

function startWork(n) {
  if (G.workedToday[n.nama] === G.time.day) { toast(npcDisplayName(n) + ' sudah selesai bekerja hari ini.'); return; }
  G.work = { npc: n, round: 0, hits: 0, pos: 0, speed: 1.4 + Math.random() * 0.5, zone: [0.4, 0.62], active: true };
  uiShowWork();
}

function workPress() {
  var w = G.work; if (!w || !w.active) return;
  var inZone = w.pos >= w.zone[0] && w.pos <= w.zone[1];
  if (inZone) { w.hits++; SFX.workGood(); } else SFX.workBad();
  w.round++;
  w.pos = 0; w.speed += 0.35;
  w.zone = [0.3 + Math.random() * 0.35, 0]; w.zone[1] = w.zone[0] + 0.16;
  if (w.round >= 3) finishWork();
}

function finishWork() {
  var w = G.work, n = w.npc;
  w.active = false;
  G.workedToday[n.nama] = G.time.day;
  uiHideWork();
  if (w.hits >= 2) {
    gainTrust(n);
    var rw = WORK_REWARD[n.nama];
    for (var res in rw) { G.player.inv[res] += rw[res]; toast('+' + rw[res] + ' ' + RES_NAMA[res] + ' dari ' + npcDisplayName(n)); }
    if (n.nama === 'Rua' && G.rel.Rua >= CFG.REL.Rekan) toast('Rua melingkari wilayah pelita di petamu (M).');
    toast('Kerja yang baik. Kepercayaan tumbuh dari keringat bersama.');
  } else {
    toast(n.nama === 'Neyra' ? 'Neyra mendengus. Besinya rusak.' : 'Hari ini kerjamu berantakan. Besok lagi.');
  }
}

// ---- pernikahan ----
function canMarry(n) {
  if (G.story.married) return { ok: false, why: 'Kamu sudah menikah.' };
  if (relLevel(n.nama) !== 'Terikat') return { ok: false, why: 'Kalian belum Terikat.' };
  if (n.nama === 'Hulan' && !G.story.hulanNamed) return { ok: false, why: 'Dia bahkan belum punya nama untuk diucapkan.' };
  if (!G.story.houseUpgraded) return { ok: false, why: 'Rumahmu belum layak dihuni dua orang (buat Perluasan Rumah).' };
  if (G.time.day < CFG.MARRY_MIN_DAY) return { ok: false, why: 'Terlalu cepat. Ini tidak bisa diburu-buru.' };
  var d = G.relDay[n.nama + '_percaya'] || 0;
  if (G.time.day - d < 12) return { ok: false, why: 'Beri waktu. Kepercayaan kalian masih muda.' };
  if (!G.player.has.ring) return { ok: false, why: 'Kamu butuh sesuatu yang hanya masuk akal untuk dia. Cincin bijih bintang, ditempa sendiri.' };
  return { ok: true };
}

function propose(n) {
  var c = canMarry(n);
  if (!c.ok) { uiDialog(npcDisplayName(n), '"Belum." — ' + c.why); return; }
  G.story.married = n.nama;
  unlockAch('menikah');
  G.player.has.ring = false;
  G.lastEvent = 'married';
  uiDialog(n.nama, n.nama === 'Neyra'
    ? '*Dia menimbang cincin itu di telapaknya, lama. Lalu mengangguk sekali — dan untuk pertama kalinya kau melihatnya tersenyum.* "...Tempaanmu jelek. Tapi niatnya bagus. Ya."'
    : '"Ya. ...Ya, aku mau." *Dan Serambi malam itu lebih hangat dari biasanya.*');
  toast('Kamu menikah dengan ' + n.nama + '. Dia pindah ke rumahmu, membawa sistemnya.');
}
