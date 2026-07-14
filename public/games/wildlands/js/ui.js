// HUD, panel, layar mode, dialog, roda titik api. Semua DOM + canvas kecil.

function el(id) { return document.getElementById(id); }
function show(id) { el(id).style.display = 'flex'; }
function hide(id) { el(id).style.display = 'none'; }

// ---- HUD ----
function uiUpdateHUD() {
  var p = G.player;
  el('bar-hp').style.width = Math.max(0, p.hp / playerMaxHp(p) * 100) + '%';
  el('bar-hunger').style.width = Math.max(0, p.hunger) + '%';
  el('bar-stam').style.width = Math.max(0, p.stam) + '%';
  el('bar-temp').style.width = Math.max(0, p.temp) + '%';
  el('hud-day').textContent = 'Hari ' + G.time.day + ' · ' + seasonOf(G.time.day) + ' · ' +
    ({ dawn: 'Fajar', day: 'Siang', dusk: 'Senja', night: 'Malam' })[phaseOf(G.time.t)];

  // kompas Serambi
  var T = CFG.TILE, a = G.anchors;
  var angS = Math.atan2(a.serambi.y * T - p.y, a.serambi.x * T - p.x);
  el('compass-home').style.transform = 'rotate(' + (angS + Math.PI / 2) + 'rad)';
  // kompas nisan
  if (G.grave) {
    el('compass-grave-wrap').style.display = 'flex';
    var angG = Math.atan2(G.grave.y - p.y, G.grave.x - p.x);
    el('compass-grave').style.transform = 'rotate(' + (angG + Math.PI / 2) + 'rad)';
  } else el('compass-grave-wrap').style.display = 'none';

  // hotbar
  var hb = '';
  for (var i = 0; i < RES_LIST.length; i++) {
    var r = RES_LIST[i], v = p.inv[r] || 0;
    if (v > 0) hb += '<span class="res"><i style="background:' + RES_COLOR[r] + '"></i>' + v + '</span>';
  }
  if (p.inv.campfireKit) hb += '<span class="res"><i style="background:#e8792b"></i>api×' + p.inv.campfireKit + '</span>';
  el('hotbar').innerHTML = hb || '<span class="res dim">tas kosong</span>';

  // alat
  var tools = [];
  ['gada', 'axe', 'pick', 'torch', 'axe2', 'pick2', 'sword', 'sword2', 'leather', 'plate', 'coat', 'boat', 'ring'].forEach(function (t2) {
    if (p.has[t2]) tools.push(TOOL_LABEL[t2]);
  });
  el('tools').textContent = tools.length ? tools.join(' · ') : '';

  // toast
  var html = '';
  for (var m = 0; m < G.msg.length; m++) html += '<div>' + G.msg[m].text + '</div>';
  el('toasts').innerHTML = html;

  el('prompt').textContent = G.prompt || '';
}

var RES_COLOR = { kayu: '#8a6a45', batu: '#8d8b86', besi: '#a8763a', bintang: '#96d2ff', makanan: '#c0392b', masak: '#e8a33c', kulit: '#a0703f', kain: '#c9c2d8', bara: '#ff8c42', emas: '#ffd15c' };
var TOOL_LABEL = { gada: 'Gada', axe: 'Kapak', pick: 'Beliung', torch: 'Obor', axe2: 'Kapak Besi', pick2: 'Beliung Besi', sword: 'Pedang', sword2: 'Pedang Bara', leather: 'Zirah Kulit', plate: 'Zirah Lempeng', coat: 'Mantel', boat: 'Perahu', ring: 'Cincin✦' };

// ---- panel crafting ----
function uiToggleCraft() {
  if (el('panel-craft').style.display === 'flex') { hide('panel-craft'); G.paused = false; return; }
  uiCloseAll(); G.paused = true;
  var p = G.player, html = '';
  for (var i = 0; i < RECIPES.length; i++) {
    var r = RECIPES[i];
    if (p.has[r.id]) continue;
    if (r.id === 'house' && G.story.houseUpgraded) continue;
    var costs = [], can = true;
    for (var res in r.cost) {
      var have = p.inv[res] || 0;
      if (have < r.cost[res]) can = false;
      costs.push('<span class="' + (have >= r.cost[res] ? 'ok' : 'no') + '">' + r.cost[res] + ' ' + RES_NAMA[res] + '</span>');
    }
    var lock = '';
    if (r.npc && (G.rel[r.npc] || 0) < CFG.REL.Rekan) { lock = ' <span class="no">[butuh ' + r.npc + ' — Rekan]</span>'; can = false; }
    html += '<div class="recipe ' + (can ? '' : 'dim') + '" data-id="' + r.id + '">' +
      '<b>' + r.nama + '</b> <span class="tier">T' + r.tier + '</span>' + lock + '<br>' +
      '<small>' + r.desc + '</small><br>' + costs.join(' · ') + '</div>';
  }
  el('craft-list').innerHTML = html || '<p>Semua sudah dibuat.</p>';
  var nodes = el('craft-list').querySelectorAll('.recipe');
  for (var n = 0; n < nodes.length; n++) {
    nodes[n].onclick = function () { if (craft(this.getAttribute('data-id'))) uiToggleCraft(); };
  }
  show('panel-craft');
}

// ---- buku catatan + relasi ----
function uiToggleJournal() {
  if (el('panel-journal').style.display === 'flex') { hide('panel-journal'); G.paused = false; return; }
  uiCloseAll(); G.paused = true;
  var html = '<h3>Catatan</h3>';
  for (var i = G.story.journal.length - 1; i >= 0; i--) html += '<p class="hint">' + G.story.journal[i] + '</p>';
  html += '<h3>Penduduk Serambi</h3>';
  // Hulan TIDAK muncul di daftar ini sampai namanya kembali
  for (var n = 0; n < G.npcs.length; n++) {
    var npc = G.npcs[n];
    if (npc.nama === 'Hulan' && !G.story.hulanNamed) continue;
    var lvl = relLevel(npc.nama);
    html += '<p><b style="color:' + npc.def.warna + '">' + npc.nama + '</b> — ' + npc.def.sistem +
      ' · <span class="lvl-' + lvl + '">' + lvl + '</span>' +
      (G.story.married === npc.nama ? ' ♥' : '') + '</p>';
  }
  html += '<h3>Achievement</h3><div class="ach-grid">';
  var got = achUnlocked();
  for (var ai = 0; ai < ACHS.length; ai++) {
    var A = ACHS[ai];
    html += '<div class="ach' + (got[A.id] ? ' got' : '') + '" title="' + A.desc + '">' + A.icon + ' ' + (got[A.id] ? A.nama : '???') + '</div>';
  }
  html += '</div>';
  html += '<p class="dim">Pelita menyala: ' + litCount() + '/5 · Hari ' + G.time.day + ' · Mode ' + G.mode + '</p>';
  el('journal-body').innerHTML = html;
  show('panel-journal');
}

function uiCloseAll() {
  ['panel-craft', 'panel-journal', 'panel-npc', 'panel-teleport', 'panel-trader', 'panel-work', 'panel-ending', 'screen-memory', 'panel-pause'].forEach(hide);
  if (G.ui) G.ui.mapOpen = false;
  G.paused = false;
}

// ---- dialog & menu NPC ----
function uiDialog(nama, teks) {
  el('dlg-nama').textContent = nama;
  el('dlg-teks').textContent = teks;
  show('panel-npc');
  el('npc-actions').innerHTML = '<button onclick="uiCloseAll()">Tutup</button>';
  G.paused = true;
}

function uiNpcMenu(n) {
  uiCloseAll(); G.paused = true;

  // fase pemandu: Rua di bangkai kapal
  if (n.nama === 'Rua' && !G.story.guideDone) {
    if (!G.story.guideMet) {
      G.story.guideMet = true;
      uiDialog('Rua', '"Kau... hidup? Aku sedang memetakan garis pantai dan— tidak penting. Orang asing tidak bertahan semalam di luar sini. Ikut aku — Serambi di utara. Jangan jauh-jauh."');
    } else {
      uiDialog('Rua', '"Jangan jauh-jauh dariku. Lewat sini — desa kami di balik tembok itu."');
    }
    return;
  }

  // Rua mengajarkan Jalur Api: teleport instan dengan T
  if (n.nama === 'Rua' && G.story.jalurApiReady && !G.story.jalurApi) {
    G.story.jalurApi = true;
    unlockAch('jalur_api');
    uiDialog('Rua', '"Kau sudah banyak membantu kami — jadi kuajari satu rahasia kartografer. Api yang sudah mengenalmu bisa dipanggil dari mana saja. Tekan [T], di mana pun kau berdiri, dan pilih apinya. Tetap hanya siang, dan perutmu yang membayar ongkosnya. Jangan sia-siakan."');
    toast('JALUR API terbuka — tekan T untuk teleport instan ke titik api yang sudah kau kenal.');
    autoSave();
    return;
  }

  el('dlg-nama').textContent = npcDisplayName(n);
  el('dlg-teks').textContent = npcLine(n);
  var html = '';
  if (TALKS[n.nama] && G.talkedToday[n.nama] !== G.time.day) html += '<button id="btn-talk">Mengobrol</button>';
  if (G.workedToday[n.nama] !== G.time.day) html += '<button id="btn-work">' + WORK_LABEL[n.nama] + '</button>';
  if (relLevel(n.nama) === 'Terikat' && !G.story.married && !(n.nama === 'Hulan' && !G.story.hulanNamed)) {
    html += '<button id="btn-marry">Lamar</button>';
  }
  html += '<button onclick="uiCloseAll()">Pergi</button>';
  el('npc-actions').innerHTML = html;
  if (el('btn-talk')) el('btn-talk').onclick = function () { startTalk(n); };
  if (el('btn-work')) el('btn-work').onclick = function () { uiCloseAll(); startWork(n); };
  if (el('btn-marry')) el('btn-marry').onclick = function () { propose(n); };
  show('panel-npc');
}

// ---- kerja bareng: minigame timing ----
function uiShowWork() {
  uiCloseAll(); G.paused = true;
  el('work-title').textContent = WORK_LABEL[G.work.npc.nama];
  show('panel-work');
}
function uiHideWork() { hide('panel-work'); G.paused = false; }

function uiUpdateWork(dt) {
  var w = G.work;
  if (!w || !w.active) return;
  w.pos += w.speed * dt;
  if (w.pos > 1) w.pos = 0;
  var bar = el('work-bar'), zone = el('work-zone'), cursor = el('work-cursor');
  zone.style.left = (w.zone[0] * 100) + '%';
  zone.style.width = ((w.zone[1] - w.zone[0]) * 100) + '%';
  cursor.style.left = (w.pos * 100) + '%';
  el('work-round').textContent = 'Ronde ' + (w.round + 1) + '/3 · kena: ' + w.hits + ' — tekan [SPASI] di zona terang';
}

// ---- roda titik api ----
function uiTeleport() {
  if (!isDaytime()) { toast('Api hanya memanggil api di bawah matahari. Tunggu siang.'); return; }
  uiCloseAll(); G.paused = true;
  var a = G.anchors, T = CFG.TILE, dests = [];
  dests.push({ nama: 'Titik Api — Serambi', icon: 'tower', x: (a.serambi.x + 4) * T + 16, y: (a.serambi.y + 5) * T });
  for (var i = 0; i < a.lanterns.length; i++) {
    var L = a.lanterns[i];
    if (G.story.lit[L.id]) dests.push({ nama: L.nama, icon: L.id, x: L.x * T + 16, y: (L.y + 2) * T });
  }
  for (var b = 0; b < G.beacons.length; b++) {
    dests.push({ nama: 'Suar ' + (b + 1), icon: 'beacon', x: G.beacons[b].x * T + 16, y: (G.beacons[b].y + 1) * T });
  }
  var html = '';
  for (var d = 0; d < dests.length; d++) {
    html += '<div class="dest" data-i="' + d + '"><canvas width="44" height="44"></canvas><span>' + dests[d].nama + '</span></div>';
  }
  el('tp-list').innerHTML = html;
  var nodes = el('tp-list').querySelectorAll('.dest');
  for (var k = 0; k < nodes.length; k++) {
    drawTpIcon(nodes[k].querySelector('canvas'), dests[k].icon);
    nodes[k].onclick = (function (dest) {
      return function () {
        var p = G.player;
        if (p.hunger < CFG.TELEPORT_HUNGER + 5) { toast('Terlalu lapar untuk perjalanan api.'); return; }
        p.hunger -= CFG.TELEPORT_HUNGER;
        p.x = dest.x; p.y = dest.y;
        uiCloseAll();
        SFX.teleport();
        G.fx.push({ kind: 'wave', x: p.x, y: p.y, life: 1.0, r: 0 });
        toast('Api memanggil api.');
      };
    })(dests[d = k]);
  }
  show('panel-teleport');
}

// ikon siluet per titik api — pemain mengenali dunianya dari bentuk
function drawTpIcon(cv, id) {
  var g = cv.getContext('2d');
  g.clearRect(0, 0, 44, 44);
  g.strokeStyle = g.fillStyle = '#ffd7a0';
  g.lineWidth = 2;
  if (id === 'tower') {
    g.fillRect(18, 12, 8, 26);
    g.beginPath(); g.moveTo(22, 3); g.lineTo(27, 12); g.lineTo(17, 12); g.closePath(); g.fill();
  } else if (id === 'pasir') {
    for (var i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(22 + i * 10, 38); g.quadraticCurveTo(22 + i * 14, 14, 22 + i * 5, 8); g.stroke(); }
    g.fillRect(19, 18, 6, 8);
  } else if (id === 'akar') {
    for (var j = 0; j < 4; j++) { g.beginPath(); g.moveTo(10 + j * 8, 38); g.quadraticCurveTo(14 + j * 6, 14, 22, 8); g.stroke(); }
    g.beginPath(); g.arc(22, 26, 4, 0, Math.PI * 2); g.fill();
  } else if (id === 'garam') {
    g.beginPath(); g.moveTo(14, 38); g.lineTo(17, 14); g.lineTo(22, 5); g.lineTo(27, 16); g.lineTo(30, 38); g.closePath(); g.stroke();
  } else if (id === 'tulang') {
    g.beginPath(); g.moveTo(8, 38); g.quadraticCurveTo(22, 2, 36, 38); g.stroke();
    g.beginPath(); g.arc(22, 32, 4, Math.PI, 0); g.fill();
  } else if (id === 'abu') {
    g.beginPath(); g.moveTo(17, 38); g.lineTo(19, 10); g.lineTo(22, 5); g.lineTo(25, 10); g.lineTo(27, 38); g.closePath(); g.fill();
  } else { // beacon: cairn + kain
    g.beginPath(); g.arc(18, 34, 5, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(22, 27, 4, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(28, 30); g.lineTo(28, 8); g.stroke();
    g.beginPath(); g.moveTo(28, 8); g.lineTo(38, 12); g.lineTo(28, 16); g.closePath(); g.fill();
  }
}

// ---- pedagang ----
var TRADER_STOCK = [
  { nama: 'Kain', res: 'kain', harga: 12, n: 1 },
  { nama: 'Makanan Matang', res: 'masak', harga: 4, n: 1 },
  { nama: 'Besi', res: 'besi', harga: 8, n: 1 },
];
function uiTrader() {
  uiCloseAll(); G.paused = true;
  var p = G.player, html = '<p class="dim">Kapal ini berlabuh 6 hari sekali. Emasmu: ' + p.inv.emas + '</p>';
  for (var i = 0; i < TRADER_STOCK.length; i++) {
    var s = TRADER_STOCK[i];
    html += '<div class="recipe" data-i="' + i + '"><b>' + s.nama + '</b> — ' + s.harga + ' emas</div>';
  }
  html += '<div class="recipe" data-i="sell"><b>Jual Makanan</b> — 2 emas / buah (punya: ' + p.inv.makanan + ')</div>';
  el('trader-list').innerHTML = html;
  var nodes = el('trader-list').querySelectorAll('.recipe');
  for (var k = 0; k < nodes.length; k++) {
    nodes[k].onclick = function () {
      var idx = this.getAttribute('data-i');
      if (idx === 'sell') {
        if (p.inv.makanan > 0) { p.inv.makanan--; p.inv.emas += 2; toast('+2 emas'); }
        else toast('Tidak ada makanan untuk dijual.');
      } else {
        var s2 = TRADER_STOCK[idx];
        if (p.inv.emas >= s2.harga) { p.inv.emas -= s2.harga; p.inv[s2.res] += s2.n; toast('+' + s2.n + ' ' + s2.nama); SFX.craft(); }
        else toast('Emas kurang.');
      }
      uiTrader();
    };
  }
  show('panel-trader');
}

// ---- ingatan (puncak babak) ----
function uiMemory(judul, teks) {
  el('memory-title').textContent = judul + ' MENYALA';
  el('memory-body').textContent = teks;
  show('screen-memory');
  G.paused = true;
}

// ---- ending ----
function uiEndingChoice() {
  uiCloseAll(); G.paused = true;
  var html = '<p>Menara membutuhkan bahan bakar terakhir — dan harganya. Pilih.</p>';
  ['nyalakan', 'padamkan', 'bagi'].forEach(function (k) {
    var e = ENDINGS[k];
    var locked = e.syarat && !e.syarat();
    html += '<button class="' + (locked ? 'dim' : '') + '" data-k="' + k + '">' + e.judul +
      (locked ? ' — ' + e.syaratTeks : '') + '</button>';
  });
  html += '<button onclick="uiCloseAll()">Belum sekarang</button>';
  el('ending-body').innerHTML = html;
  var nodes = el('ending-body').querySelectorAll('button[data-k]');
  for (var i = 0; i < nodes.length; i++) nodes[i].onclick = function () { chooseEnding(this.getAttribute('data-k')); };
  show('panel-ending');
}

function uiEnding(judul, teks) {
  el('ending-body').innerHTML = '<h2>' + judul + '</h2><p class="epilog">' + teks.replace(/\n/g, '<br>') + '</p>' +
    '<button onclick="location.reload()">Kembali ke menu</button>';
  show('panel-ending');
  G.state = 'ending';
}

// ---- kematian ----
function uiDeathJejak() {
  el('death-title').textContent = 'KAU ROBOH';
  el('death-body').innerHTML = 'Barang-barangmu tertinggal di sana.<br>Sebuah Nisan Bara berdiri di tempatmu jatuh — pilar cahaya yang terlihat dari jauh.<br><br>' +
    '<button onclick="hide(\'screen-death\');respawnJejak()">Bangun di Serambi</button>';
  show('screen-death');
}

function uiDeathPermadeath() {
  el('death-title').textContent = 'DUNIA MELUPAKANMU';
  el('death-body').innerHTML = 'Save terhapus. Yang tersisa hanya satu baris di Batu Peringatan.<br><br>' +
    '<button onclick="location.reload()">Kembali ke menu</button>';
  show('screen-death');
}
