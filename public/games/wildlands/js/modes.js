// Mode kematian, kesulitan, modifier, Batu Peringatan.

var MODES = {
  JEJAK: {
    nama: 'JEJAK', tag: 'Normal',
    desc: 'Mati bukan akhir. Barang jatuh di tempat kamu roboh — Nisan Bara menandainya, kompas menuntunmu kembali. Alat tetap dibawa.',
  },
  PADAM: {
    nama: 'PADAM', tag: 'Permadeath',
    desc: 'Mati sekali, dunia selesai. Save dihapus. Yang tersisa hanya satu baris di Batu Peringatan. Ketik PADAM untuk memilih ini.',
  },
  ZIARAH: {
    nama: 'ZIARAH', tag: 'Cerita',
    desc: 'Tanpa kematian. Roboh = pingsan dan bangun di Serambi. Untuk yang datang demi dunia, penduduk, dan lima pelita.',
  },
  MUSAFIR: {
    nama: 'MUSAFIR', tag: 'Seed Harian',
    desc: 'Benua yang sama untuk semua orang hari ini. Satu nyawa. Skor: pelita × 1000 + hari × 100 + emas.',
  },
};

function handleDeathByMode() {
  var p = G.player;
  if (G.mode === 'ZIARAH') {
    // pingsan tanpa penalti
    respawnAtSerambi();
    toast('Kau terbangun di Serambi. Seseorang menggotongmu pulang.');
    return;
  }
  if (G.mode === 'PADAM' || G.mode === 'MUSAFIR') {
    writeMemorial();
    if (G.mode === 'MUSAFIR') writeScore();
    LS.remove(CFG.SAVE_KEY);
    G.state = 'dead';
    uiDeathPermadeath();
    return;
  }
  // JEJAK: barang jatuh, nisan menyala
  var dropped = {};
  for (var i = 0; i < RES_LIST.length; i++) {
    var r = RES_LIST[i];
    if (p.inv[r] > 0) { dropped[r] = p.inv[r]; p.inv[r] = 0; }
  }
  // nisan lama pindah isinya ke nisan baru
  if (G.grave) {
    for (var k in G.grave.items) dropped[k] = (dropped[k] || 0) + G.grave.items[k];
  }
  G.grave = { x: p.x, y: p.y, items: dropped };
  G.state = 'dead';
  uiDeathJejak();
}

function respawnAtSerambi() {
  var p = G.player, s = G.anchors.serambi, T = CFG.TILE;
  p.x = s.x * T + 16; p.y = (s.y + 4) * T;
  p.hp = playerMaxHp(p) * 0.9;
  p.hunger = Math.max(p.hunger, 40);
  p.temp = 80; p.stam = CFG.MAXSTAM;
  G.time.t = 5;   // fajar
  G.state = 'play';
}

function respawnJejak() {
  var p = G.player;
  p.weakened = true;
  p.hunger = 50;
  respawnAtSerambi();
  p.hp = playerMaxHp(p);
  if (G.story.married) toast(G.story.married + ' menatapmu lama sekali, lalu memelukmu tanpa berkata apa-apa.');
  else toast('Ilma memarahimu selama menjahit. Sira tidak bicara sehari penuh.');
  toast('Nisan Bara berdiri di tempatmu roboh — ikuti kompas keduanya.');
  autoSave();
}

function pickupGrave() {
  var p = G.player;
  if (!G.grave) return;
  for (var k in G.grave.items) {
    p.inv[k] += G.grave.items[k];
  }
  toast('Barang-barangmu kembali. Semuanya.');
  unlockAch('roboh');
  SFX.chest();
  G.grave = null;
  autoSave();
}

// ---- Batu Peringatan ----
function loadMemorial() {
  try { return JSON.parse(LS.get(CFG.MEMORIAL_KEY)) || []; } catch (e) { return []; }
}

function writeMemorial() {
  var mem = loadMemorial();
  var line = 'Seed ' + G.world.seed +
    ' · bertahan ' + G.time.day + ' hari' +
    ' · ' + litCount() + ' dari 5 pelita menyala' +
    (G.story.married ? ' · menikah dengan ' + G.story.married : '') +
    ' · roboh pada ' + (isNight() ? 'malam' : 'siang') + ' hari ke-' + G.time.day + '.';
  mem.unshift(line);
  if (mem.length > 30) mem.length = 30;
  LS.set(CFG.MEMORIAL_KEY, JSON.stringify(mem));
}

// ---- skor MUSAFIR ----
function musafirSeed() {
  var d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function writeScore() {
  var score = litCount() * 1000 + G.time.day * 100 + (G.player.inv.emas || 0);
  var list = [];
  try { list = JSON.parse(LS.get(CFG.SCORE_KEY)) || []; } catch (e) {}
  list.push({ seed: G.world.seed, score: score, hari: G.time.day });
  list.sort(function (a, b) { return b.score - a.score; });
  if (list.length > 10) list.length = 10;
  LS.set(CFG.SCORE_KEY, JSON.stringify(list));
}
