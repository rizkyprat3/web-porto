// Sistem achievement. Tersimpan global lintas-dunia (localStorage terpisah),
// popup ala Steam di pojok kiri bawah, dengan chime dua-nada yang di-synthesize.

var ACHS = [
  { id: 'kaki_darat',   icon: '🌊', nama: 'Kaki di Darat',        desc: 'Selamat dari karamnya kapal.' },
  { id: 'malam_pertama',icon: '🌙', nama: 'Malam Pertama',        desc: 'Bertahan hidup sampai fajar kedua.' },
  { id: 'alat_pertama', icon: '🪓', nama: 'Tangan yang Bekerja',  desc: 'Buat alat pertamamu.' },
  { id: 'benih_pertama',icon: '🦠', nama: 'Antibodi',             desc: 'Bunuh Benih Kelam pertamamu.' },
  { id: 'seratus_benih',icon: '🧫', nama: 'Wabah Berbalik',       desc: 'Bunuh 100 musuh.' },
  { id: 'bayangan',     icon: '👤', nama: 'Pemburu Bayangan',     desc: 'Kalahkan Bayangan Kelam.' },
  { id: 'pelita_1',     icon: '🕯', nama: 'Api Pertama',          desc: 'Nyalakan pelita pertama.' },
  { id: 'pelita_5',     icon: '🔥', nama: 'Penjaga Bara',         desc: 'Nyalakan kelima pelita.' },
  { id: 'rekan',        icon: '🤝', nama: 'Bukan Orang Asing Lagi', desc: 'Jadi Rekan seorang penduduk.' },
  { id: 'terikat',      icon: '💛', nama: 'Terikat',              desc: 'Capai hubungan Terikat.' },
  { id: 'menikah',      icon: '💍', nama: 'Rumah Berarti Seseorang', desc: 'Menikah di Serambi.' },
  { id: 'hulan',        icon: '🌫', nama: 'Namanya Hulan',        desc: 'Kembalikan nama yang dilupakan.' },
  { id: 'kaya',         icon: '🪙', nama: 'Saudagar Terdampar',   desc: 'Kumpulkan 100 emas.' },
  { id: 'penjelajah',   icon: '🗺', nama: 'Kaki yang Gatal',      desc: 'Singkap 10% peta benua.' },
  { id: 'jalur_api',    icon: '✨', nama: 'Rahasia Kartografer',  desc: 'Pelajari Jalur Api dari Rua — teleport instan dengan T.' },
  { id: 'roboh',        icon: '🪦', nama: 'Jalan Pulang',         desc: 'Ambil kembali isi Nisan Bara-mu.' },
  { id: 'tamat',        icon: '⭐', nama: 'Harga Sebuah Ingatan', desc: 'Selesaikan cerita.' },
];

function achUnlocked() {
  try { return JSON.parse(LS.get('wildlands.v1.ach')) || {}; } catch (e) { return {}; }
}

var achQueue = [], achShowing = false;

function unlockAch(id) {
  var got = achUnlocked();
  if (got[id]) return;
  got[id] = Date.now ? 1 : 1;
  LS.set('wildlands.v1.ach', JSON.stringify(got));
  var a = null;
  for (var i = 0; i < ACHS.length; i++) if (ACHS[i].id === id) a = ACHS[i];
  if (!a) return;
  achQueue.push(a);
  if (!achShowing) achShowNext();
}

function achShowNext() {
  var a = achQueue.shift();
  if (!a) { achShowing = false; return; }
  achShowing = true;
  var pop = el('ach-pop');
  el('ach-icon').textContent = a.icon;
  el('ach-nama').textContent = a.nama;
  el('ach-desc').textContent = a.desc;
  pop.classList.add('on');
  SFX.achievement();
  setTimeout(function () {
    pop.classList.remove('on');
    setTimeout(achShowNext, 600);
  }, 4200);
}

// hook ringan yang dicek berkala (emas, peta, kill count)
function achTick() {
  var p = G.player;
  if (!p) return;
  if (p.inv.emas >= 100) unlockAch('kaya');
  if ((G.stats.kills || 0) >= 100) unlockAch('seratus_benih');
  if (G.fog) {
    var seen = 0;
    for (var i = 0; i < G.fog.length; i++) seen += G.fog[i];
    if (seen / G.fog.length >= 0.1) unlockAch('penjelajah');
  }
}
