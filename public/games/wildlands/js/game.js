// Game loop, input, orkestrasi. Fixed timestep 60 Hz.

var Input = { up: false, down: false, left: false, right: false, sprint: false, attackHeld: false, dodge: false };
var mouseX = 0, mouseY = 0;

function bindInput() {
  var map = { w: 'up', s: 'down', a: 'left', d: 'right', arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right' };
  document.addEventListener('keydown', function (e) {
    var k = e.key.toLowerCase();
    if (G.state === 'menu' || G.state === 'ending') return;
    if (k === 'escape') { togglePause(); return; }
    if (G.work && G.work.active) { if (k === ' ') { e.preventDefault(); workPress(); } return; }
    if (G.paused) {
      if (k === 'c' || k === 'j' || k === 'm') uiCloseAll();
      if (k === 'm') G.ui.mapOpen = false;
      return;
    }
    if (map[k]) { Input[map[k]] = true; e.preventDefault(); }
    else if (k === 'shift') Input.sprint = true;
    else if (k === ' ') { Input.dodge = true; e.preventDefault(); }
    else if (k === 'e') interact();
    else if (k === 't') {
      if (G.story.jalurApi) uiTeleport();
      else toast(G.stats && G.stats.helps >= 5 ? 'Rua ingin bicara denganmu — temui dia dulu.' : 'Api-api itu terasa jauh. Bantulah warga desa — mungkin ada yang tahu caranya.');
    }
    else if (k === 'q') eatFood();
    else if (k === 'f') placeCampfire();
    else if (k === 'c') uiToggleCraft();
    else if (k === 'j') uiToggleJournal();
    else if (k === 'm') { G.ui.mapOpen = !G.ui.mapOpen; G.paused = G.ui.mapOpen; }
  });
  document.addEventListener('keyup', function (e) {
    var k = e.key.toLowerCase();
    if (map[k]) Input[map[k]] = false;
    if (k === 'shift') Input.sprint = false;
  });
  var cv = document.getElementById('game');
  cv.addEventListener('mousedown', function (e) { if (G.state === 'play' && !G.paused) Input.attackHeld = true; });
  document.addEventListener('mouseup', function () { Input.attackHeld = false; });
  document.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });
}

function togglePause() {
  if (G.state === 'play' && !G.paused) { G.paused = true; show('panel-pause'); }
  else if (G.paused) { uiCloseAll(); G.ui.mapOpen = false; }
}

// ---- interaksi E: konteks menentukan segalanya ----
function interact() {
  var p = G.player, T = CFG.TILE, a = G.anchors;
  var ptx = p.x / T, pty = p.y / T;

  // nisan bara
  if (G.grave && Math.hypot(G.grave.x - p.x, G.grave.y - p.y) < 50) { pickupGrave(); return; }

  // NPC terdekat
  var n = npcNear(52);
  if (n) { uiNpcMenu(n); return; }

  // pedagang di dermaga
  if (traderActive() && Math.hypot(ptx - (a.serambi.x - 1), pty - (a.serambi.y + 12)) < 3) { uiTrader(); return; }

  // pelita
  for (var i = 0; i < a.lanterns.length; i++) {
    var L = a.lanterns[i];
    if (Math.hypot(ptx - L.x, pty - L.y) < 3.2) {
      if (G.story.lit[L.id]) uiTeleport();
      else tryLightLantern(L);
      return;
    }
  }

  // Titik Api (gerbang perjalanan api di desa)
  var wtx = Math.floor(ptx), wty = Math.floor(pty);
  for (var wy = -2; wy <= 2; wy++) for (var wx = -2; wx <= 2; wx++) {
    var wo = G.world.objectAt(wtx + wx, wty + wy);
    if (wo && wo.waypoint) { uiTeleport(); return; }
  }

  // menara bara
  if (Math.hypot(ptx - a.serambi.x, pty - a.serambi.y) < 4) {
    if (endingAvailable()) { uiEndingChoice(); return; }
    if (isNight()) { sleepToDawn(); return; }
    uiTeleport(); return;
  }

  // api unggun milik pemain: masak cepat / daftarkan suar / teleport
  var ftx = Math.floor(ptx), fty = Math.floor(pty);
  for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
    var key = (ftx + dx) + ',' + (fty + dy);
    var placedName = G.world.placed[key];
    if (placedName === 'campfire') {
      if (G.beacons.length < CFG.MAX_BEACONS) {
        G.world.placed[key] = 'beacon';
        G.beacons.push({ x: ftx + dx, y: fty + dy });
        G.world.invalidate(ftx + dx, fty + dy);
        toast('Api unggun ini kini SUAR — titik pindah milikmu (' + G.beacons.length + '/' + CFG.MAX_BEACONS + '). Cairn tersusun, kain terikat.');
      } else toast('Sudah ' + CFG.MAX_BEACONS + ' suar terdaftar. (Masak lewat panel C)');
      return;
    }
    if (placedName === 'beacon') { uiTeleport(); return; }
  }

  // peti / objek yang dihadapi
  var tx = Math.floor((p.x + Math.cos(p.face) * 40) / T);
  var ty = Math.floor((p.y + Math.sin(p.face) * 40) / T);
  var o = G.world.objectAt(tx, ty);
  if (o && o.chest) { openChest(tx, ty); return; }
  if (o && !o.solid && o.hp <= 2 && o.drops) {   // semak: petik langsung
    for (var res in o.drops) { p.inv[res] += o.drops[res]; toast('+' + o.drops[res] + ' ' + RES_NAMA[res]); }
    G.world.harvest(tx, ty);
    SFX.eat();
    return;
  }
}

function sleepToDawn() {
  var p = G.player;
  G.time.day++; G.time.t = 0;
  p.weakened = false;
  p.hp = playerMaxHp(p);
  p.temp = CFG.MAXTEMP;
  p.hunger = Math.max(10, p.hunger - 15);
  toast('Kau tidur di Serambi. Fajar hari ke-' + G.time.day + '.');
  autoSave();
}

function traderActive() {
  return G.time.day % CFG.TRADER_EVERY === 0 && isDaytime() && !G.mods.sendirian;
}

// ---- prompt kontekstual (pengganti tutorial teks) ----
function updatePrompt() {
  var p = G.player, T = CFG.TILE, a = G.anchors;
  var ptx = p.x / T, pty = p.y / T;
  G.prompt = '';
  if (G.grave && Math.hypot(G.grave.x - p.x, G.grave.y - p.y) < 60) { G.prompt = '[E] Ambil barang-barangmu'; return; }
  var n = npcNear(52);
  if (n) { G.prompt = '[E] ' + npcDisplayName(n); return; }
  if (traderActive() && Math.hypot(ptx - (a.serambi.x - 1), pty - (a.serambi.y + 12)) < 3) { G.prompt = '[E] Pedagang Kapal'; return; }
  for (var i = 0; i < a.lanterns.length; i++) {
    var L = a.lanterns[i];
    if (Math.hypot(ptx - L.x, pty - L.y) < 3.5) {
      G.prompt = G.story.lit[L.id] ? '[E] Perjalanan api' : '[E] ' + L.nama + ' — padam' +
        (G.player.inv.bara > 0 ? ' (bara siap)' : ' (butuh Bara dari penjaganya)');
      return;
    }
  }
  var wtx2 = Math.floor(ptx), wty2 = Math.floor(pty);
  for (var wy2 = -2; wy2 <= 2; wy2++) for (var wx2 = -2; wx2 <= 2; wx2++) {
    var wo2 = G.world.objectAt(wtx2 + wx2, wty2 + wy2);
    if (wo2 && wo2.waypoint) { G.prompt = '[E] Titik Api — perjalanan api'; return; }
  }
  if (Math.hypot(ptx - a.serambi.x, pty - a.serambi.y) < 4) {
    G.prompt = endingAvailable() ? '[E] Menara Bara — SEMUA PELITA MENYALA' : isNight() ? '[E] Tidur sampai fajar' : '[E] Menara Bara — perjalanan api';
    return;
  }
}

// ---- world-gen async dengan layar loading ----
function startWorldGen(seed, onDone) {
  show('screen-loading');
  el('loadtext').textContent = 'Membangun benua dari seed ' + seed + '…';
  setTimeout(function () {
    var world = buildWorld(seed);
    if (!world) { alert('Gagal membangun dunia. Coba seed lain.'); location.reload(); return; }
    el('loadtext').textContent = 'Menggambar peta…';
    buildMapPreview(world, function () {
      hide('screen-loading');
      onDone(world);
    });
  }, 60);
}

function newGame(seed) {
  startWorldGen(seed, function (world) {
    G.world = world; G.anchors = world.anchors;
    var T = CFG.TILE, sp = world.anchors.spawn;
    G.player = makePlayer(sp.x * T + 16, sp.y * T - 20);
    applyCharStart(G.player);
    G.time = { day: 1, t: 65 };
    G.stats = {};
    G.story = { lit: {}, married: null, hulanNamed: false, journal: [], houseUpgraded: false, endingSeen: null, guideMet: false, guideDone: !!G.mods.sendirian };
    G.rel = {}; G.relDay = {}; G.beacons = []; G.seen = {}; G.workedToday = {}; G.talkedToday = {};
    G.grave = null; G.enemies = []; G.fx = []; G.projectiles = [];
    npcInit();
    questInit();
    attachPlayerHooks();
    G.state = 'play';
    unlockAch('kaki_darat');
    toast(G.mods.sendirian ? 'Kapalmu karam. Ada menara dengan api oranye di utara.' : 'Kapalmu karam. Seseorang berdiri di antara puing — hampiri dia (E).');
    toast('WASD gerak · E interaksi · klik serang · C crafting · J catatan');
    if (!LS.persistent) toast('Penyimpanan browser tidak tersedia — progres hilang saat tab ditutup.', 8);
    saveGame();
  });
}

function continueGame() {
  loadGame(function () {
    attachPlayerHooks();
    G.state = 'play';
    toast('Kau kembali. Hari ke-' + G.time.day + '.');
  });
}

function attachPlayerHooks() {
  G.player.hurt = function (dmg, x, y) { playerHurt(dmg, x, y); };
}

// ---- loop utama: fixed timestep 60 Hz ----
var lastT = 0, acc = 0;
function loop(t) {
  requestAnimationFrame(loop);
  var dt = Math.min(0.1, (t - lastT) / 1000);
  lastT = t;

  if (G.state === 'play') {
    if (G.work && G.work.active) {
      uiUpdateWork(dt);
    } else if (!G.paused) {
      acc += dt;
      var STEP = 1 / 60;
      while (acc >= STEP) {
        // arah hadap mengikuti kursor saat menyerang
        if (Input.attackHeld || G.player.charging) {
          G.player.face = Math.atan2(mouseY - R.h / 2, mouseX - R.w / 2);
        }
        updatePlayer(STEP, Input);
        updateEnemies(STEP);
        npcUpdate(STEP);
        updateFx(STEP);
        updateTime(STEP);
        acc -= STEP;
      }
      updateFog();
      updatePrompt();
      G._achT = (G._achT || 0) + dt;
      if (G._achT > 5) { G._achT = 0; achTick(); }
      updateAutosave(dt);
    }
    render(t);
    if (G.ui.mapOpen) drawBigMap(R.g);
    else drawMinimap(R.g);
    drawTraderBoat(R.g, t);
    uiUpdateHUD();
    // toast timer
    for (var i = G.msg.length - 1; i >= 0; i--) { G.msg[i].t -= dt; if (G.msg[i].t <= 0) G.msg.splice(i, 1); }
  }
}

function updateTime(dt) {
  G.time.t += dt;
  if (G.time.t >= CFG.DAY_LEN) {
    G.time.t = 0;
    G.time.day++;
    G.workedToday = {}; G.talkedToday = {};
    if (G.time.day === 2) unlockAch('malam_pertama');
    saveGame();   // autosave tiap fajar
    if (G.time.day % CFG.TRADER_EVERY === 0 && !G.mods.sendirian) toast('Sebuah kapal dagang berlabuh di dermaga Serambi.');
  }
}

function drawTraderBoat(g, t) {
  if (!traderActive() || !G.anchors) return;
  var T = CFG.TILE, a = G.anchors;
  var x = (a.serambi.x - 1) * T - G.camera.x, y = (a.serambi.y + 13) * T - G.camera.y + Math.sin(t * 0.002) * 2;
  if (x < -80 || y < -80 || x > R.w + 80 || y > R.h + 80) return;
  g.fillStyle = '#6a4a2e';
  g.beginPath(); g.moveTo(x - 22, y); g.quadraticCurveTo(x, y + 14, x + 22, y); g.lineTo(x + 16, y + 8); g.lineTo(x - 16, y + 8); g.closePath(); g.fill();
  g.strokeStyle = '#4a3520'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 26); g.stroke();
  g.fillStyle = '#e8ddc0';
  g.beginPath(); g.moveTo(x, y - 26); g.lineTo(x + 16, y - 12); g.lineTo(x, y - 8); g.closePath(); g.fill();
}

// ---- menu utama ----
function uiMenu() {
  G.state = 'menu';
  el('btn-continue').style.display = hasSave() ? 'block' : 'none';
  var mem = loadMemorial();
  el('memorial-list').innerHTML = mem.length
    ? mem.map(function (m) { return '<p class="mem-line">' + m + '</p>'; }).join('')
    : '<p class="dim">Belum ada yang gugur. Batu ini masih kosong.</p>';
  show('screen-menu');
}

function uiModeSelect() {
  hide('screen-menu');
  show('screen-mode');
  var html = '';
  for (var k in MODES) {
    html += '<div class="mode-card" data-mode="' + k + '"><h3>' + MODES[k].nama + ' <small>' + MODES[k].tag + '</small></h3><p>' + MODES[k].desc + '</p></div>';
  }
  el('mode-cards').innerHTML = html;
  var nodes = el('mode-cards').querySelectorAll('.mode-card');
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].onclick = function () {
      var m = this.getAttribute('data-mode');
      var all = el('mode-cards').querySelectorAll('.mode-card');
      for (var j = 0; j < all.length; j++) all[j].classList.remove('sel');
      this.classList.add('sel');
      G.mode = m;
      el('padam-confirm').style.display = m === 'PADAM' ? 'block' : 'none';
      el('seed-row').style.display = m === 'MUSAFIR' ? 'none' : 'flex';
    };
  }
  nodes[0].classList.add('sel');

  // kartu karakter
  var chtml = '';
  for (var c = 0; c < CHARS.length; c++) {
    var cd = CHARS[c];
    chtml += '<div class="mode-card char-card' + (cd.id === G.charId ? ' sel' : '') + '" data-char="' + cd.id + '"><h3>' + cd.icon + ' ' + cd.nama + '</h3><p>' + cd.desc + '</p></div>';
  }
  el('char-cards').innerHTML = chtml;
  var cnodes = el('char-cards').querySelectorAll('.char-card');
  for (var ci = 0; ci < cnodes.length; ci++) {
    cnodes[ci].onclick = function () {
      G.charId = this.getAttribute('data-char');
      var all = el('char-cards').querySelectorAll('.char-card');
      for (var j = 0; j < all.length; j++) all[j].classList.remove('sel');
      this.classList.add('sel');
    };
  }
}

function startFromModeScreen() {
  if (G.mode === 'PADAM') {
    var typed = el('padam-input').value.trim().toUpperCase();
    if (typed !== 'PADAM') { alert('Ketik PADAM untuk mengonfirmasi. Mode ini menghapus save saat kau mati.'); return; }
  }
  G.diff = el('sel-diff').value;
  G.mods = {
    benuaLuas: el('mod-luas').checked,
    tanpaPeta: el('mod-peta').checked,
    musimPanjang: el('mod-musim').checked,
    sendirian: el('mod-sendiri').checked,
  };
  CFG.WORLD = G.mods.benuaLuas ? 6144 : 4096;
  var seed;
  if (G.mode === 'MUSAFIR') seed = musafirSeed();
  else {
    // benua standar: seed TETAP — Serambi dan kelima pelita selalu di tempat yang sama
    var sv = el('seed-input').value.trim();
    seed = sv ? (parseInt(sv, 10) || 777) : 777;
  }
  hide('screen-mode');
  newGame(seed);
}

// boot
window.addEventListener('load', function () {
  renderInit();
  bindInput();
  G.ui = { mapOpen: false };
  el('btn-new').onclick = uiModeSelect;
  el('btn-continue').onclick = function () { hide('screen-menu'); continueGame(); };
  el('btn-memorial').onclick = function () { el('memorial-wrap').style.display = el('memorial-wrap').style.display === 'block' ? 'none' : 'block'; };
  el('btn-start').onclick = startFromModeScreen;
  el('btn-mode-back').onclick = function () { hide('screen-mode'); show('screen-menu'); };
  el('memory-close').onclick = function () { hide('screen-memory'); G.paused = false; };
  el('btn-resume').onclick = function () { uiCloseAll(); };
  el('btn-controls').onclick = function () {
    var w = el('ctl-wrap');
    var open = w.style.display === 'block';
    w.style.display = open ? 'none' : 'block';
    el('btn-controls').textContent = open ? 'Kontrol ▾' : 'Kontrol ▴';
    if (!open) { el('about-wrap').style.display = 'none'; el('btn-about').textContent = 'Panduan — di mana mencari barang ▾'; }
  };
  el('btn-about').onclick = function () {
    var w = el('about-wrap');
    var open = w.style.display === 'block';
    w.style.display = open ? 'none' : 'block';
    el('btn-about').textContent = open ? 'Panduan — di mana mencari barang ▾' : 'Panduan — di mana mencari barang ▴';
    if (!open) { el('ctl-wrap').style.display = 'none'; el('btn-controls').textContent = 'Kontrol ▾'; }
  };
  el('btn-quit').onclick = function () { saveGame(); location.reload(); };
  el('btn-mute').onclick = function () { AudioSys.muted = !AudioSys.muted; el('btn-mute').textContent = AudioSys.muted ? '🔇' : '🔊'; };
  uiMenu();
  requestAnimationFrame(loop);
});
