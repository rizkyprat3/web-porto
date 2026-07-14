// Lima pelita, buku catatan, ending. Lihat STORY.md.

var LANTERN_HINT = {
  pasir: 'Wenda: "Yang pertama tidak jauh. Di pantai, di tempat sebuah kapal berhenti jadi kapal. Ikuti garis air ke arah matahari terbit atau terbenam — kau akan tahu saat suaranya hilang."',
  akar: 'Wenda: "Pelita Akar ada di rimba, tempat pohon tumbuh terlalu rapat untuk matahari. Arsip bilang: ia tidak lagi berbentuk pelita. Cari gundukan akar yang digenggam sesuatu."',
  garam: 'Wenda: "Yang ketiga di seberang air. Pulau kecil, lepas pantai. Tanpa perahu Marsa, jangan coba-coba. Laut di sana tidak memaafkan."',
  tulang: 'Wenda: "Di gurun ada tulang-tulang sesuatu yang mati sebelum ordo kami datang. Pelita keempat berlindung di bawah lengkungnya. Bawa air. Bawa banyak air."',
  abu: 'Wenda: "Yang terakhir di puncak salju. Arsip berhenti di kalimat: \'batu hitam yang bukan dari sini.\' Tanpa mantel bulu kau mati sebelum melihatnya. ...Hati-hati. Yang itu berbeda."',
};

var LANTERN_MEMORY = {
  pasir: 'INGATAN KEMBALI — Nama kapalmu. "Layar Fajar". Kau mengingatnya sekarang: tali yang kau ikat sendiri, dek yang kau pel. Ada yang mencuri ini darimu dan kau bahkan tidak sadar.',
  akar: 'INGATAN KEMBALI — Sebuah lagu. Malam ini seluruh Serambi menyanyikannya tanpa berkata-kata memutuskan untuk mulai. Delapan suara. Tidak ada yang ingat kapan terakhir mereka menyanyi.',
  garam: 'INGATAN KEMBALI — Bala bantuan tidak pernah datang karena tidak pernah dikirim. Surat terakhir ordo tidak pernah sampai; kapalnya karam di pulau ini. Mereka tidak dilupakan dunia. Dunia tidak pernah tahu.',
  tulang: 'INGATAN KEMBALI — Yang dijaga ordo ini bukan benua. Kelam tidak lahir di sini; ia DIKUBUR di sini, oleh orang-orang yang membangun pelita di atas kuburnya. Ordo bukan penjaga mercusuar. Ordo adalah penjaga makam.',
  abu: 'INGATAN KEMBALI — Seseorang. Namanya Hulan. Dia sudah berjalan di antara kalian selama bertahun-tahun, dan tidak seorang pun menyebut namanya. Sekarang seluruh Serambi mengingatnya — dan mereka menangis untuk waktu yang hilang.',
};

function questInit() {
  G.story.journal = ['Kapalmu karam. Ada menara dengan api oranye di utara. Mulai dari sana.'];
  addJournal(LANTERN_HINT.pasir);
}

function addJournal(text) {
  if (G.story.journal.indexOf(text) === -1) G.story.journal.push(text);
}

function litCount() {
  var n = 0;
  for (var k in G.story.lit) if (G.story.lit[k]) n++;
  return n;
}

function nextUnlitLantern() {
  for (var i = 0; i < G.anchors.lanterns.length; i++) {
    if (!G.story.lit[G.anchors.lanterns[i].id]) return G.anchors.lanterns[i];
  }
  return null;
}

function tryLightLantern(L) {
  var p = G.player;
  if (G.story.lit[L.id]) return;
  if (!p.has.torch) { toast('Kau butuh obor untuk membawa api.'); return; }
  if (p.inv.bara <= 0) { toast('Pelita butuh Bara — kalahkan bayangan yang menjaganya.'); return; }
  p.inv.bara--;
  G.story.lit[L.id] = true;
  G.lastEvent = 'lantern';
  G.stats.lit = litCount();
  // gelombang cahaya
  G.fx.push({ kind: 'wave', x: L.x * CFG.TILE + 16, y: L.y * CFG.TILE + 16, life: 2.2, r: 0 });
  SFX.lantern();
  uiMemory(L.nama, LANTERN_MEMORY[L.id]);
  toast(L.nama + ' menyala. Titik pindah baru terbuka.');
  unlockAch('pelita_1');
  if (litCount() >= 5) unlockAch('pelita_5');
  if (L.id === 'abu') {
    G.story.hulanNamed = true;
    unlockAch('hulan');
    G.rel['Hulan'] = G.rel['Hulan'] || 0;
  }
  var nxt = nextUnlitLantern();
  if (nxt) addJournal(LANTERN_HINT[nxt.id]);
  else addJournal('Kelima pelita menyala. Menara Bara menunggumu — dan harganya.');
  autoSave();
}

// ---- ending di Menara Bara ----
function endingAvailable() { return litCount() >= 5 && !G.story.endingSeen; }

function countTrusted() {
  var n = 0;
  for (var k in G.rel) if (G.rel[k] >= CFG.REL.Dipercaya) n++;
  return n;
}

var ENDINGS = {
  nyalakan: {
    judul: 'NYALAKAN',
    syarat: null,
    teks: 'Menara membutuhkan seseorang yang ingatannya utuh. Kau naik ke puncaknya, dan api menerimamu.\n\nBenua ini akan mengingat segalanya — kecuali, perlahan-lahan, dirimu. Bertahun-tahun kemudian, anak-anak Serambi bermain di bawah menara dan bertanya siapa yang menyalakannya. Tidak ada yang yakin. Tapi setiap malam, seseorang meletakkan sepiring makanan hangat di tangga menara.\n\nTidak ada yang ingat kenapa. Mereka melakukannya juga.',
  },
  padamkan: {
    judul: 'PADAMKAN',
    syarat: null,
    teks: 'Kau memadamkan semuanya. Kapal Marsa meninggalkan pantai saat fajar, sembilan orang di geladaknya menatap benua yang mengabu di belakang.\n\nMereka hidup. Mereka menua di negeri-negeri yang hangat. Tapi kadang, di tengah percakapan, salah satu dari mereka berhenti di tengah kalimat — mencoba mengingat nama sebuah tempat, dan gagal.\n\nKau tidak pernah memberi tahu mereka bahwa kau masih ingat semuanya.',
  },
  bagi: {
    judul: 'BAGI',
    syarat: function () { return countTrusted() >= 5; },
    syaratTeks: 'Butuh 5 penduduk di tingkat Dipercaya atau lebih.',
    teks: 'Kalian berdiri melingkar di kaki menara, dan membagi beban itu rata — sembilan ingatan, sembilan luka kecil.\n\nSetiap orang kehilangan sedikit: Marsa lupa lagu pertamanya, Sira lupa wajah gurunya, kau lupa nama kapalmu — lagi, dan kali ini selamanya.\n\nTapi Serambi bertahan. Pincang, berlubang, hidup. Dan di musim semi berikutnya, untuk pertama kali dalam dua ratus tahun, sebuah kapal asing merapat ke dermaga — dan seseorang ada di sana untuk menyambutnya.',
  },
};

function chooseEnding(key) {
  var e = ENDINGS[key];
  if (e.syarat && !e.syarat()) { toast(e.syaratTeks); return; }
  G.story.endingSeen = key;
  unlockAch('tamat');
  var spouse = G.story.married;
  var epilog = e.teks;
  if (spouse) {
    if (key === 'nyalakan') epilog += '\n\n' + spouse + ' adalah yang terakhir melupakanmu. Bertahun-tahun. Dan piring di tangga menara itu — selalu dia yang meletakkannya.';
    if (key === 'padamkan') epilog += '\n\n' + spouse + ' menggenggam tanganmu di geladak dan berkata: "Aku tidak setuju. Kau tahu itu. Tapi aku di sini." Dan itu cukup.';
    if (key === 'bagi') epilog += '\n\n' + spouse + ' kehilangan ingatan tentang hari pertama kalian bertemu. Jadi kau menceritakannya lagi, dari awal, dan dia tertawa di bagian yang sama.';
  }
  uiEnding(e.judul, epilog);
  autoSave();
}
