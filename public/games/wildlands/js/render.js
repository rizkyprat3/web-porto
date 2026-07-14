// SEMUA pemanggilan Canvas untuk dunia ada di sini.

var R = { cv: null, g: null, lightCv: null, lg: null, w: 0, h: 0, mapPreview: null };

function renderInit() {
  R.cv = document.getElementById('game');
  R.g = R.cv.getContext('2d');
  R.lightCv = document.createElement('canvas');
  R.lg = R.lightCv.getContext('2d');
  renderResize();
  window.addEventListener('resize', renderResize);
}

function renderResize() {
  R.w = R.cv.width = window.innerWidth;
  R.h = R.cv.height = window.innerHeight;
  R.lightCv.width = R.w; R.lightCv.height = R.h;
}

// peta preview 512×512 — dibuat sekali saat dunia lahir (di loading screen)
function buildMapPreview(world, onDone) {
  var N = 512, step = CFG.WORLD / N;
  var cv = document.createElement('canvas');
  cv.width = cv.height = N;
  var g = cv.getContext('2d');
  var row = 0;
  function chunkRows() {
    var end = Math.min(N, row + 32);
    for (; row < end; row++) {
      for (var x = 0; x < N; x++) {
        g.fillStyle = world.biomeAt(Math.floor(x * step), Math.floor(row * step)).color;
        g.fillRect(x, row, 1, 1);
      }
    }
    var el = document.getElementById('loadbar');
    if (el) el.style.width = Math.round(row / N * 100) + '%';
    if (row < N) setTimeout(chunkRows, 0);
    else { R.mapPreview = cv; onDone(); }
  }
  chunkRows();
}

function render(t) {
  var g = R.g, p = G.player, T = CFG.TILE;
  var shake = p.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
  var camX = G.camera.x = p.x - R.w / 2 + shake;
  var camY = G.camera.y = p.y - R.h / 2 + shake;

  // terrain: blit chunk
  g.fillStyle = '#0b2440';
  g.fillRect(0, 0, R.w, R.h);
  var CS = CFG.CHUNK * T;
  var c0x = Math.floor(camX / CS), c0y = Math.floor(camY / CS);
  var c1x = Math.ceil((camX + R.w) / CS), c1y = Math.ceil((camY + R.h) / CS);
  for (var cy = c0y; cy <= c1y; cy++) for (var cx = c0x; cx <= c1x; cx++) {
    if (cx < 0 || cy < 0 || cx >= CFG.WORLD / CFG.CHUNK || cy >= CFG.WORLD / CFG.CHUNK) continue;
    g.drawImage(G.world.getChunkCanvas(cx, cy), Math.round(cx * CS - camX), Math.round(cy * CS - camY));
  }

  // kumpulkan drawable untuk y-sorting
  var items = [];
  var t0x = Math.floor(camX / T) - 1, t0y = Math.floor(camY / T) - 2;
  var t1x = Math.ceil((camX + R.w) / T) + 1, t1y = Math.ceil((camY + R.h) / T) + 2;
  for (var ty = t0y; ty <= t1y; ty++) for (var tx = t0x; tx <= t1x; tx++) {
    var o = G.world.objectAt(tx, ty);
    if (o && o.draw && !o.lantern && !o.tower || (o && o.name === 'towerPad')) {
      if (o.name !== 'towerPad') items.push({ y: ty * T + 28, obj: o, x: tx * T, ty: ty * T, tx: tx });
    }
  }
  // anchor besar
  var a = G.anchors;
  items.push({ y: a.serambi.y * T + 60, tower: true, x: a.serambi.x * T, ty: a.serambi.y * T });
  for (var i = 0; i < a.lanterns.length; i++) {
    var L = a.lanterns[i];
    if (L.x * T > camX - 200 && L.x * T < camX + R.w + 200 && L.y * T > camY - 200 && L.y * T < camY + R.h + 200) {
      items.push({ y: L.y * T + 40, lantern: L, x: L.x * T, ty: L.y * T });
    }
  }
  // bangkai kapal spawn
  if (Math.abs(a.spawn.x * T - camX - R.w / 2) < R.w && Math.abs(a.spawn.y * T - camY - R.h / 2) < R.h) {
    items.push({ y: a.spawn.y * T + 34, wreck: true, x: a.spawn.x * T, ty: a.spawn.y * T });
  }
  // nisan bara
  if (G.grave) items.push({ y: G.grave.y + 20, grave: true, x: G.grave.x, ty: G.grave.y });
  // entity
  for (var e = 0; e < G.enemies.length; e++) items.push({ y: G.enemies[e].y, enemy: G.enemies[e] });
  for (var n = 0; n < G.npcs.length; n++) items.push({ y: G.npcs[n].y, npc: G.npcs[n] });
  if (G.guards) for (var gu = 0; gu < G.guards.length; gu++) items.push({ y: G.guards[gu].y, guardE: G.guards[gu] });
  items.push({ y: p.y, player: true });

  items.sort(function (A, B) { return A.y - B.y; });
  for (var k = 0; k < items.length; k++) {
    var it = items[k];
    if (it.obj) it.obj.draw(g, Math.round(it.x - camX), Math.round(it.ty - camY), t, it.tx || 0);
    else if (it.tower) drawTower(g, it.x - camX, it.ty - camY, t);
    else if (it.lantern) drawLantern(g, it.lantern, it.x - camX, it.ty - camY, t);
    else if (it.wreck) drawWreck(g, it.x - camX, it.ty - camY);
    else if (it.grave) drawGrave(g, it.x - camX, it.ty - camY, t);
    else if (it.enemy) drawEnemy(g, it.enemy, camX, camY, t);
    else if (it.npc) drawNpc(g, it.npc, camX, camY);
    else if (it.guardE) drawGuard(g, it.guardE, camX, camY, t);
    else if (it.player) drawPlayer(g, p, camX, camY, t);
  }

  // proyektil
  g.fillStyle = '#d8c088';
  for (var pr = 0; pr < G.projectiles.length; pr++) {
    var pj = G.projectiles[pr];
    g.save(); g.translate(pj.x - camX, pj.y - camY); g.rotate(Math.atan2(pj.vy, pj.vx));
    g.fillRect(-8, -1, 16, 2); g.restore();
  }

  // fx
  drawFx(g, camX, camY);
  drawLighting(t, camX, camY);
  g.drawImage(R.lightCv, 0, 0);
}

// ---- pemain & entity ----
// ---- figur manusia bersama: kepala, rambut, badan, lengan, kaki berayun ----
// opts: {skin, hair, hairStyle:'short'|'long'|'band'|'helmet'|'none', top (null = tanpa baju),
//        pants, dress, walk, flash, scale, scar}
function drawHuman(g, x, y, o) {
  var s = o.scale || 1;
  var step = Math.sin(o.walk || 0) * 3 * s;      // ayunan kaki
  var arm = -Math.sin(o.walk || 0) * 2.5 * s;    // lengan berlawanan arah

  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.beginPath(); g.ellipse(x, y + 11 * s, 8 * s, 3.5 * s, 0, 0, Math.PI * 2); g.fill();

  // kaki
  g.fillStyle = o.pants || '#4a3a2c';
  g.fillRect(x - 4.5 * s, y + 3 * s, 3.5 * s, 8 * s + step);
  g.fillRect(x + 1 * s, y + 3 * s, 3.5 * s, 8 * s - step);

  // badan (rok kalau dress)
  var topCol = o.flash ? '#ff6b5b' : (o.top || o.skin);
  if (o.dress) {
    g.fillStyle = topCol;
    g.beginPath();
    g.moveTo(x - 5 * s, y - 8 * s); g.lineTo(x + 5 * s, y - 8 * s);
    g.lineTo(x + 7 * s, y + 6 * s); g.lineTo(x - 7 * s, y + 6 * s);
    g.closePath(); g.fill();
  } else {
    g.fillStyle = topCol;
    g.fillRect(x - 5.5 * s, y - 8 * s, 11 * s, 12 * s);
    g.fillRect(x - 6.5 * s, y - 8 * s, 13 * s, 4 * s);   // bahu
  }
  if (!o.top && o.scar) {   // barbarian: dada terbuka + bekas luka
    g.strokeStyle = 'rgba(140,60,40,0.8)'; g.lineWidth = 1.5 * s;
    g.beginPath(); g.moveTo(x - 3 * s, y - 6 * s); g.lineTo(x + 3 * s, y + 1 * s); g.stroke();
  }

  // lengan
  g.fillStyle = o.sleeve || o.skin;
  g.fillRect(x - 8 * s, y - 7 * s + arm, 2.8 * s, 8.5 * s);
  g.fillRect(x + 5.2 * s, y - 7 * s - arm, 2.8 * s, 8.5 * s);

  // kepala
  g.fillStyle = o.flash ? '#ff8f7f' : o.skin;
  g.beginPath(); g.arc(x, y - 13 * s, 4.8 * s, 0, Math.PI * 2); g.fill();

  // rambut / helm
  if (o.hairStyle === 'helmet') {
    g.fillStyle = o.hair;
    g.beginPath(); g.arc(x, y - 14 * s, 5 * s, Math.PI, 0); g.fill();
    g.fillRect(x - 5 * s, y - 14.5 * s, 10 * s, 2.5 * s);
    g.fillStyle = '#c05a4a';
    g.fillRect(x - 1 * s, y - 20 * s, 2 * s, 4 * s);       // jambul
  } else if (o.hairStyle === 'long') {
    g.fillStyle = o.hair;
    g.beginPath(); g.arc(x, y - 14.5 * s, 5 * s, Math.PI * 0.95, Math.PI * 0.05); g.fill();
    g.fillRect(x - 5.5 * s, y - 14 * s, 2.6 * s, 11 * s);  // juntai kiri
    g.fillRect(x + 2.9 * s, y - 14 * s, 2.6 * s, 9 * s);   // juntai kanan
  } else if (o.hairStyle === 'band') {
    g.fillStyle = o.hair;
    g.beginPath(); g.arc(x, y - 14.5 * s, 4.6 * s, Math.PI, 0); g.fill();
    g.fillStyle = '#8a3a2a';
    g.fillRect(x - 5 * s, y - 14.5 * s, 10 * s, 1.8 * s);  // ikat kepala
  } else if (o.hairStyle !== 'none') {
    g.fillStyle = o.hair;
    g.beginPath(); g.arc(x, y - 14.5 * s, 4.6 * s, Math.PI, 0); g.fill();
  }
}

function drawPlayer(g, p, camX, camY, t) {
  var x = Math.round(p.x - camX), y = Math.round(p.y - camY);
  var ch = G.charId;
  var blink = p.iframe > 0 && Math.floor(t / 60) % 2 === 0;
  if (!blink) {
    var idle = Math.sin(t * 0.003) * 0.15;   // napas halus saat diam
    var opts =
      ch === 'kesatria' ? { skin: '#e8c8a8', hair: '#7d8590', hairStyle: 'helmet', top: '#9aa0ab', sleeve: '#7d8590', pants: '#4a4e58' } :
      ch === 'barbar' ? { skin: '#d8a06a', hair: '#3a2a1a', hairStyle: 'band', top: null, scar: true, pants: '#5d4630', scale: 1.15 } :
      ch === 'pengembara' ? { skin: '#c89878', hair: '#4a2f1a', hairStyle: 'long', top: '#8a5a6a', dress: true, pants: '#3a3040' } :
      { skin: '#e8c8a8', hair: '#5d4630', hairStyle: 'short', top: '#c8b89a', pants: '#4a3a2c' };
    if (p.has.coat) { opts.top = '#7a6248'; opts.sleeve = '#7a6248'; opts.dress = false; }
    opts.walk = (p.walkT || 0) + idle;
    opts.flash = p.flash > 0;
    drawHuman(g, x, y, opts);
    if (p.has.plate) {
      g.strokeStyle = '#9aa0ab'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x - 6, y - 4); g.lineTo(x + 6, y - 4); g.stroke();
    }
    // senjata mengayun
    if (p.swing > 0) {
      var prog = 1 - p.swing / 0.22;
      var ang = p.face - 0.9 + prog * 1.8;
      g.save(); g.translate(x, y - 6); g.rotate(ang);
      if (p.has.gada && !p.has.sword && !p.has.sword2) {
        g.fillStyle = '#6a5138'; g.fillRect(6, -1.5, 18, 3);
        g.fillStyle = '#5d5a55';
        g.beginPath(); g.arc(26, 0, 6, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#3f3d3a';
        for (var sp = 0; sp < 4; sp++) { var sa = sp * 1.57; g.fillRect(26 + Math.cos(sa) * 6 - 1, Math.sin(sa) * 6 - 1, 2.5, 2.5); }
      } else {
        g.fillStyle = p.has.sword2 ? '#ffb054' : p.has.sword ? '#cfd6de' : '#8a6a45';
        g.fillRect(8, -2, p.swingHeavy ? 26 : 20, 3);
      }
      g.restore();
    }
    // charge indicator
    if (p.charging && p.chargeT >= CFG.HEAVY_CHARGE) {
      g.strokeStyle = 'rgba(255,180,80,0.8)'; g.lineWidth = 2;
      g.beginPath(); g.arc(x, y - 4, 15, 0, Math.PI * 2); g.stroke();
    }
  }
}

var ENEMY_COLOR = { virus: '#7dd14f', bakteri: '#4fa66f', spora: '#b06fd1', wolf: '#8a8f9a', bandit: '#a05a3a', archer: '#7a5a8a', bear: '#5d4630', shade: '#2a2138' };

function drawEnemy(g, e, camX, camY, t) {
  var x = Math.round(e.x - camX), y = Math.round(e.y - camY);
  g.fillStyle = 'rgba(0,0,0,0.22)';
  g.beginPath(); g.ellipse(x, y + 8, 9, 4, 0, 0, Math.PI * 2); g.fill();
  var col = e.flash > 0 ? '#ffffff' : ENEMY_COLOR[e.type];
  g.fillStyle = col;
  if (e.type === 'virus') {
    // bola berduri kecil, bergetar gelisah
    var jit = Math.sin(t * 0.03 + e.x) * 1.2;
    g.beginPath(); g.arc(x + jit, y - 2, 6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = col; g.lineWidth = 1.6;
    for (var i = 0; i < 6; i++) {
      var a = i * 1.047 + t * 0.002;
      g.beginPath(); g.moveTo(x + jit + Math.cos(a) * 6, y - 2 + Math.sin(a) * 6);
      g.lineTo(x + jit + Math.cos(a) * 10, y - 2 + Math.sin(a) * 10); g.stroke();
    }
  } else if (e.type === 'bakteri') {
    // kapsul dengan flagela bergoyang
    g.save(); g.translate(x, y - 2); g.rotate(Math.atan2(G.player.y - e.y, G.player.x - e.x));
    g.beginPath(); g.ellipse(0, 0, 13, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.25)';
    g.beginPath(); g.ellipse(-3, -2, 6, 3, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = col; g.lineWidth = 1.5;
    var wig = Math.sin(t * 0.015) * 4;
    g.beginPath(); g.moveTo(-13, 0); g.quadraticCurveTo(-20, wig, -26, -wig); g.stroke();
    g.restore();
  } else if (e.type === 'spora') {
    // bola ungu berdenyut — makin cepat denyutnya makin dekat pecah
    var pulse = 1 + Math.sin(t * (e.hp < 10 ? 0.03 : 0.006)) * 0.18;
    g.beginPath(); g.arc(x, y - 2, 9 * pulse, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#7a3f9a';
    for (var d = 0; d < 5; d++) {
      var da = d * 1.256 + 0.5;
      g.beginPath(); g.arc(x + Math.cos(da) * 5 * pulse, y - 2 + Math.sin(da) * 5 * pulse, 1.8, 0, Math.PI * 2); g.fill();
    }
  } else if (e.type === 'shade') {
    g.globalAlpha = 0.75 + Math.sin(t * 0.005) * 0.15;
    g.beginPath(); g.arc(x, y - 4, 10, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
    g.fillStyle = '#c9b8ff';
    g.fillRect(x - 4, y - 8, 2, 2); g.fillRect(x + 2, y - 8, 2, 2);
  } else if (e.type === 'bear') {
    g.beginPath(); g.ellipse(x, y - 4, 15, 11, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x + 12, y - 10, 7, 0, Math.PI * 2); g.fill();
    if (e.telegraph > 0) {
      g.strokeStyle = 'rgba(255,60,40,0.9)'; g.lineWidth = 3;
      g.beginPath(); g.arc(x, y - 4, 20 + Math.sin(t * 0.03) * 3, 0, Math.PI * 2); g.stroke();
    }
  } else {
    g.beginPath(); g.arc(x, y - 4, e.type === 'bandit' ? 10 : 8, 0, Math.PI * 2); g.fill();
    if (e.type === 'archer') { g.strokeStyle = '#d8c088'; g.lineWidth = 1.5; g.beginPath(); g.arc(x + 8, y - 4, 6, -1.2, 1.2); g.stroke(); }
    if (e.type === 'wolf') { g.fillStyle = '#c9d2dd'; g.fillRect(x - 4, y - 8, 2, 2); g.fillRect(x + 2, y - 8, 2, 2); }
  }
  // health bar
  if (e.hp < e.maxhp) {
    g.fillStyle = '#1a1a1a'; g.fillRect(x - 12, y - 22, 24, 3);
    g.fillStyle = '#c0392b'; g.fillRect(x - 12, y - 22, 24 * (e.hp / e.maxhp), 3);
  }
}

// warna rambut & kulit per penduduk — semuanya manusia, semuanya berbeda
var NPC_LOOK = {
  Sira:  { skin: '#d8b090', hair: '#3a3a3f', hairStyle: 'short' },
  Neyra: { skin: '#c89878', hair: '#2a2530', hairStyle: 'short' },
  Ilma:  { skin: '#e0c0a0', hair: '#6a5a4a', hairStyle: 'long' },
  Kanti: { skin: '#d8a878', hair: '#4a2f1a', hairStyle: 'long' },
  Rua:   { skin: '#c8a888', hair: '#5d4630', hairStyle: 'short' },
  Wenda: { skin: '#e8d0b0', hair: '#8a5a3a', hairStyle: 'long' },
  Marsa: { skin: '#c08858', hair: '#1d1a15', hairStyle: 'band' },
  Ayung: { skin: '#b8875f', hair: '#2a2015', hairStyle: 'long' },
  Hulan: { skin: '#d0d0d8', hair: '#8a8a95', hairStyle: 'long' },
};

function drawNpc(g, n, camX, camY) {
  var x = Math.round(n.x - camX), y = Math.round(n.y - camY);
  var look = NPC_LOOK[n.nama] || { skin: '#e8d8b8', hair: '#4a3a2a', hairStyle: 'long' };
  drawHuman(g, x, y, {
    skin: look.skin, hair: look.hair, hairStyle: look.hairStyle,
    top: n.def.warna, dress: true, pants: '#3a3040',
    walk: n.walkT || 0, scale: 0.95,
  });
  // nameplate — Hulan: '—'
  var nm = npcDisplayName(n);
  g.font = '11px monospace'; g.textAlign = 'center';
  g.fillStyle = 'rgba(0,0,0,0.5)';
  g.fillRect(x - g.measureText(nm).width / 2 - 3, y - 30, g.measureText(nm).width + 6, 13);
  g.fillStyle = n.nama === 'Hulan' && !G.story.hulanNamed ? '#9a9aa5' : '#ffe9c9';
  g.fillText(nm, x, y - 20);
  if (G.story.married === n.nama) { g.fillStyle = '#ff8fa3'; g.fillText('♥', x + g.measureText(nm).width / 2 + 8, y - 20); }
}

// milisi Serambi: manusia berseragam Sira, helm, tombak, patroli tembok
function drawGuard(g, gd, camX, camY, t) {
  var x = Math.round(gd.x - camX), y = Math.round(gd.y - camY);
  drawHuman(g, x, y, {
    skin: '#d8b090', hair: '#5d6570', hairStyle: 'helmet',
    top: '#8a4535', sleeve: '#6d3628', pants: '#4a3a2c',
    walk: gd.walkT || 0, scale: 0.95,
  });
  // tombak
  g.strokeStyle = '#6a5138'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(x + 8, y + 8); g.lineTo(x + 10, y - 24); g.stroke();
  g.fillStyle = '#9aa0ab';
  g.beginPath(); g.moveTo(x + 10, y - 30); g.lineTo(x + 13, y - 23); g.lineTo(x + 7, y - 23); g.closePath(); g.fill();
}

// ---- anchor besar ----
function drawTower(g, x, y, t) {
  x = Math.round(x); y = Math.round(y);
  g.fillStyle = 'rgba(0,0,0,0.3)';
  g.beginPath(); g.ellipse(x + 32, y + 60, 30, 10, 0, 0, Math.PI * 2); g.fill();
  // menara miring sedikit
  g.save(); g.translate(x + 32, y + 56); g.rotate(-0.03);
  g.fillStyle = '#6b6863'; g.fillRect(-16, -100, 32, 100);
  g.fillStyle = '#7d7a74'; g.fillRect(-16, -100, 10, 100);
  g.fillStyle = '#4f6b4a';
  g.fillRect(-16, -30, 8, 14); g.fillRect(4, -70, 9, 10);   // lumut
  g.fillStyle = '#5d5a55'; g.fillRect(-20, -104, 40, 8);
  // api puncak: satu-satunya api hangat di dunia
  var f = Math.sin(t * 0.006) * 4;
  g.fillStyle = '#e8792b';
  g.beginPath(); g.moveTo(0, -134 - f); g.lineTo(14, -104); g.lineTo(-14, -104); g.closePath(); g.fill();
  g.fillStyle = '#ffd15c';
  g.beginPath(); g.moveTo(0, -124 - f * 0.5); g.lineTo(8, -104); g.lineTo(-8, -104); g.closePath(); g.fill();
  g.restore();
}

function drawWreck(g, x, y) {
  x = Math.round(x); y = Math.round(y);
  g.fillStyle = '#4a3828';
  g.beginPath(); g.moveTo(x - 30, y + 20); g.quadraticCurveTo(x, y + 34, x + 40, y + 16); g.lineTo(x + 34, y + 30); g.lineTo(x - 24, y + 32); g.closePath(); g.fill();
  g.strokeStyle = '#5d4630'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(x - 10, y + 24); g.lineTo(x - 14, y - 18); g.stroke();
  g.fillStyle = '#8a7a5a';
  g.beginPath(); g.moveTo(x - 14, y - 18); g.lineTo(x + 8, y - 6); g.lineTo(x - 13, y + 0); g.closePath(); g.fill();
}

function drawGrave(g, x, y, t) {
  x = Math.round(x); y = Math.round(y);
  // pilar cahaya menembus langit
  var grd = g.createLinearGradient(x, y - 400, x, y);
  grd.addColorStop(0, 'rgba(120,190,255,0)');
  grd.addColorStop(1, 'rgba(120,190,255,0.45)');
  g.fillStyle = grd;
  var w = 10 + Math.sin(t * 0.004) * 3;
  g.fillRect(x - w / 2, y - 400, w, 400);
  g.fillStyle = '#7d7a74';
  g.fillRect(x - 6, y - 14, 12, 16);
  g.fillStyle = '#9ecbff';
  g.fillRect(x - 2, y - 10, 4, 4);
}

// ---- LIMA PELITA: tidak ada dua yang berbentuk sama ----
function drawLantern(g, L, x, y, t) {
  var lit = !!G.story.lit[L.id];
  x = Math.round(x + 16); y = Math.round(y + 16);
  if (L.id === 'pasir') drawPelitaPasir(g, x, y, t, lit);
  else if (L.id === 'akar') drawPelitaAkar(g, x, y, t, lit);
  else if (L.id === 'garam') drawPelitaGaram(g, x, y, t, lit);
  else if (L.id === 'tulang') drawPelitaTulang(g, x, y, t, lit);
  else drawPelitaAbu(g, x, y, t, lit);
}

// 1. rusuk kapal + lentera kaca laut yang mengayun
function drawPelitaPasir(g, x, y, t, lit) {
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.beginPath(); g.ellipse(x, y + 26, 40, 10, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#5a4632'; g.lineWidth = 5;
  for (var i = -2; i <= 2; i++) {
    g.beginPath();
    g.moveTo(x + i * 16, y + 24);
    g.quadraticCurveTo(x + i * 22, y - 40, x + i * 8, y - 62);
    g.stroke();
  }
  // kerang batas pasang
  g.fillStyle = '#d8d0c0';
  for (var k = -2; k <= 2; k++) { g.beginPath(); g.arc(x + k * 15, y + 18, 2, 0, Math.PI * 2); g.fill(); }
  // lentera mengayun: kaku saat padam, hidup saat menyala
  var sw = Math.sin(t * (lit ? 0.0022 : 0.0009)) * (lit ? 9 : 4);
  g.strokeStyle = '#3a3028'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(x, y - 58); g.lineTo(x + sw, y - 34); g.stroke();
  g.fillStyle = lit ? 'rgba(190,230,255,0.95)' : 'rgba(60,90,80,0.8)';
  g.fillRect(x + sw - 6, y - 34, 12, 15);
  if (lit) {
    g.save(); g.shadowColor = '#bfe8ff'; g.shadowBlur = 24;
    g.fillStyle = '#eaf8ff'; g.fillRect(x + sw - 3, y - 30, 6, 8);
    g.restore();
  }
}

// 2. sangkar akar dengan cawan perunggu terkubur
function drawPelitaAkar(g, x, y, t, lit) {
  g.fillStyle = 'rgba(0,0,0,0.3)';
  g.beginPath(); g.ellipse(x, y + 24, 34, 10, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#3d2f1e'; g.lineWidth = 7;
  for (var i = 0; i < 5; i++) {
    var a0 = -0.9 + i * 0.45;
    g.beginPath();
    g.moveTo(x + Math.cos(a0 + Math.PI / 2) * 30, y + 22);
    g.quadraticCurveTo(x + Math.cos(a0) * 34, y - 26, x + Math.sin(a0) * 6, y - 44);
    g.stroke();
  }
  g.strokeStyle = '#4f6b4a'; g.lineWidth = 3;   // lumut & sulur
  g.beginPath(); g.moveTo(x - 18, y - 20); g.quadraticCurveTo(x - 22, y + 2, x - 14, y + 10); g.stroke();
  // cawan perunggu mengintip
  g.fillStyle = '#8a6b35';
  g.beginPath(); g.arc(x, y + 2, 8, 0, Math.PI); g.fill();
  if (lit) {
    var breath = 0.5 + Math.sin(t * 0.003) * 0.3;   // berdenyut seperti napas
    g.save(); g.shadowColor = '#9fdc6f'; g.shadowBlur = 30;
    g.fillStyle = 'rgba(190,230,120,' + breath.toFixed(2) + ')';
    g.beginPath(); g.arc(x, y - 2, 7, 0, Math.PI * 2); g.fill();
    g.restore();
    // berkas cahaya lewat celah akar
    g.fillStyle = 'rgba(190,230,120,0.18)';
    for (var b = 0; b < 4; b++) {
      g.save(); g.translate(x, y); g.rotate(-0.7 + b * 0.5);
      g.fillRect(-2, -50, 4, 40); g.restore();
    }
  } else {
    g.fillStyle = '#0c0c10';
    g.beginPath(); g.arc(x, y - 2, 7, 0, Math.PI * 2); g.fill();
  }
}

// 3. pilar kristal garam dengan api yang membias
function drawPelitaGaram(g, x, y, t, lit) {
  g.fillStyle = 'rgba(0,0,0,0.22)';
  g.beginPath(); g.ellipse(x, y + 22, 26, 8, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = lit ? 'rgba(235,240,248,0.92)' : 'rgba(180,186,196,0.85)';
  g.beginPath();
  g.moveTo(x - 18, y + 20); g.lineTo(x - 12, y - 30); g.lineTo(x - 2, y - 58);
  g.lineTo(x + 8, y - 34); g.lineTo(x + 16, y + 4); g.lineTo(x + 12, y + 20);
  g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(x - 8, y + 16); g.lineTo(x - 2, y - 50); g.stroke();
  g.beginPath(); g.moveTo(x + 4, y + 14); g.lineTo(x + 6, y - 28); g.stroke();
  if (lit) {
    // api di DALAM kristal
    g.save(); g.shadowColor = '#e8ecff'; g.shadowBlur = 26;
    g.fillStyle = 'rgba(255,255,255,0.9)';
    var f = Math.sin(t * 0.008) * 3;
    g.beginPath(); g.moveTo(x, y - 26 - f); g.lineTo(x + 6, y - 4); g.lineTo(x - 6, y - 4); g.closePath(); g.fill();
    g.restore();
    // refraksi: segitiga cahaya bersudut
    g.fillStyle = 'rgba(220,228,255,0.16)';
    for (var i = 0; i < 6; i++) {
      g.save(); g.translate(x, y - 12); g.rotate(i * 1.05 + Math.sin(t * 0.001) * 0.1);
      g.beginPath(); g.moveTo(0, 0); g.lineTo(46, -10); g.lineTo(46, 10); g.closePath(); g.fill();
      g.restore();
    }
  }
}

// 4. lengkung tulang iga + cawan tripod, api berkedip tersendat
function drawPelitaTulang(g, x, y, t, lit) {
  g.fillStyle = 'rgba(0,0,0,0.2)';
  g.beginPath(); g.ellipse(x, y + 24, 44, 9, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#d9d2c0'; g.lineWidth = 8;
  g.beginPath(); g.moveTo(x - 40, y + 22); g.quadraticCurveTo(x, y - 66, x + 40, y + 22); g.stroke();
  g.strokeStyle = '#c4bca8'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(x - 26, y + 22); g.quadraticCurveTo(x, y - 38, x + 26, y + 22); g.stroke();
  // tripod + cawan setengah tertimbun
  g.strokeStyle = '#6a5138'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(x - 8, y + 18); g.lineTo(x, y + 2); g.lineTo(x + 8, y + 18); g.stroke();
  g.fillStyle = '#8a6b35';
  g.beginPath(); g.arc(x, y + 2, 9, Math.PI, 0); g.fill();
  g.fillStyle = '#cfa85f';
  g.beginPath(); g.ellipse(x, y + 20, 18, 4, 0, 0, Math.PI * 2); g.fill();   // pasir mengalir
  if (lit) {
    // kedip tersendat seperti jantung lemah
    var flicker = (Math.sin(t * 0.02) + Math.sin(t * 0.047)) > 0.4 ? 1 : 0.35;
    g.save(); g.shadowColor = '#ff7a3a'; g.shadowBlur = 22 * flicker;
    g.fillStyle = 'rgba(255,110,50,' + (0.9 * flicker).toFixed(2) + ')';
    var f = Math.sin(t * 0.01) * 2;
    g.beginPath(); g.moveTo(x, y - 18 - f); g.lineTo(x + 7, y + 2); g.lineTo(x - 7, y + 2); g.closePath(); g.fill();
    g.restore();
  }
}

// 5. obelisk hitam retak, api biru pucat tanpa kehangatan
function drawPelitaAbu(g, x, y, t, lit) {
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.beginPath(); g.ellipse(x, y + 20, 22, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#eef2f6';   // salju menimbun dasar
  g.beginPath(); g.ellipse(x, y + 16, 26, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#15151c';
  g.beginPath();
  g.moveTo(x - 11, y + 14); g.lineTo(x - 7, y - 52); g.lineTo(x, y - 60);
  g.lineTo(x + 7, y - 52); g.lineTo(x + 11, y + 14);
  g.closePath(); g.fill();
  // retakan
  g.strokeStyle = lit ? 'rgba(150,200,255,0.9)' : 'rgba(60,60,75,0.9)';
  g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(x - 4, y + 8); g.lineTo(x - 1, y - 16); g.lineTo(x - 6, y - 34); g.stroke();
  g.beginPath(); g.moveTo(x + 5, y + 2); g.lineTo(x + 2, y - 26); g.lineTo(x + 6, y - 44); g.stroke();
  if (lit) {
    g.save(); g.shadowColor = '#bcd8ff'; g.shadowBlur = 18;
    g.fillStyle = 'rgba(210,230,255,0.55)';   // nyaris tak berwarna
    var f = Math.sin(t * 0.005) * 2;
    g.beginPath(); g.moveTo(x, y - 72 - f); g.lineTo(x + 5, y - 58); g.lineTo(x - 5, y - 58); g.closePath(); g.fill();
    g.restore();
  }
}

// ---- fx ----
function drawFx(g, camX, camY) {
  for (var i = 0; i < G.fx.length; i++) {
    var f = G.fx[i];
    var x = f.x - camX, y = f.y - camY;
    if (f.kind === 'dmg') {
      g.font = 'bold 13px monospace'; g.textAlign = 'center';
      g.fillStyle = 'rgba(255,90,70,' + Math.min(1, f.life * 2).toFixed(2) + ')';
      g.fillText(f.n, x, y);
    } else if (f.kind === 'blok') {
      g.font = 'bold 12px monospace'; g.textAlign = 'center';
      g.fillStyle = 'rgba(200,210,230,' + Math.min(1, f.life * 2).toFixed(2) + ')';
      g.fillText('BLOK', x, y);
    } else if (f.kind === 'wave') {
      f.r = (2.2 - f.life) * 900;
      g.strokeStyle = 'rgba(255,230,170,' + (f.life / 2.2 * 0.8).toFixed(2) + ')';
      g.lineWidth = 6;
      g.beginPath(); g.arc(x, y, f.r, 0, Math.PI * 2); g.stroke();
    } else {
      g.fillStyle = f.color || '#7d2b20';
      g.globalAlpha = Math.min(1, f.life * 2);
      g.fillRect(x - 2, y - 2, 4, 4);
      g.globalAlpha = 1;
    }
  }
}

// ---- lighting berlapis ----
function drawLighting(t, camX, camY) {
  var lg = R.lg, p = G.player, T = CFG.TILE;
  var phase = phaseOf(G.time.t);
  var darkness, tint;
  var season = seasonOf(G.time.day);
  if (phase === 'day') { darkness = 0; }
  else if (phase === 'dawn') { darkness = 0.45 * (1 - G.time.t / 60); tint = '20,30,60'; }
  else if (phase === 'dusk') { darkness = 0.55 * ((G.time.t - 480) / 60); tint = '60,30,15'; }
  else { darkness = season === 'Dingin' ? 0.9 : 0.84; tint = '8,12,32'; }

  lg.clearRect(0, 0, R.w, R.h);
  if (darkness <= 0.02) return;
  lg.globalCompositeOperation = 'source-over';
  lg.fillStyle = 'rgba(' + (tint || '10,14,34') + ',' + darkness.toFixed(2) + ')';
  lg.fillRect(0, 0, R.w, R.h);

  lg.globalCompositeOperation = 'destination-out';
  function hole(x, y, r, strength) {
    var grd = lg.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, 'rgba(0,0,0,' + (strength || 1) + ')');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    lg.fillStyle = grd;
    lg.beginPath(); lg.arc(x, y, r, 0, Math.PI * 2); lg.fill();
  }

  // cahaya pemain
  var pr = p.has.torch ? 190 : 70;
  if (p.has.sword2) pr = Math.max(pr, 210);
  hole(p.x - camX, p.y - camY, pr);

  // api di tile sekitar viewport
  var t0x = Math.floor(camX / T) - 8, t0y = Math.floor(camY / T) - 8;
  var t1x = Math.ceil((camX + R.w) / T) + 8, t1y = Math.ceil((camY + R.h) / T) + 8;
  for (var ty = t0y; ty <= t1y; ty += 1) for (var tx = t0x; tx <= t1x; tx += 1) {
    var o = G.world.objectAt(tx, ty);
    if (o && o.light) hole(tx * T + 16 - camX, ty * T + 16 - camY, o.light + Math.sin(t * 0.01 + tx) * 8);
  }
  // menara & pelita menyala
  var a = G.anchors;
  hole(a.serambi.x * T + 32 - camX, a.serambi.y * T - 60 - camY, 330 + Math.sin(t * 0.001) * 10);
  for (var i = 0; i < a.lanterns.length; i++) {
    var L = a.lanterns[i];
    if (G.story.lit[L.id]) hole(L.x * T + 16 - camX, L.y * T - 20 - camY, 260);
  }
  if (G.grave) hole(G.grave.x - camX, G.grave.y - camY, 120);
  lg.globalCompositeOperation = 'source-over';
}

// ---- minimap & peta besar ----
function drawMinimap(g2) {
  if (!R.mapPreview || G.mods.tanpaPeta) return;
  var S = 140, p = G.player, T = CFG.TILE;
  var scale = 512 / CFG.WORLD;
  var px = p.x / T * scale, py = p.y / T * scale;
  var view = 60;   // px preview
  g2.save();
  g2.beginPath(); g2.rect(R.w - S - 14, 14, S, S); g2.clip();
  g2.fillStyle = '#0b0e14';
  g2.fillRect(R.w - S - 14, 14, S, S);
  g2.drawImage(R.mapPreview, px - view / 2, py - view / 2, view, view, R.w - S - 14, 14, S, S);
  var f = S / view;
  // pelita yang diketahui
  var a = G.anchors;
  for (var i = 0; i < a.lanterns.length; i++) {
    var L = a.lanterns[i];
    if (!G.story.lit[L.id] && !G.seen['lantern_' + L.id]) continue;
    var lx = R.w - S - 14 + (L.x * scale - px + view / 2) * f;
    var ly = 14 + (L.y * scale - py + view / 2) * f;
    g2.fillStyle = G.story.lit[L.id] ? '#ffd15c' : '#8a8fa5';
    g2.beginPath(); g2.arc(lx, ly, 3, 0, Math.PI * 2); g2.fill();
  }
  // pemain
  g2.fillStyle = '#fff';
  g2.beginPath(); g2.arc(R.w - S - 14 + S / 2, 14 + S / 2, 3, 0, Math.PI * 2); g2.fill();
  g2.restore();
  g2.strokeStyle = 'rgba(255,233,201,0.4)'; g2.lineWidth = 1;
  g2.strokeRect(R.w - S - 14, 14, S, S);
}

function drawBigMap(g2) {
  if (!R.mapPreview) return;
  var S = Math.min(R.w, R.h) - 90;
  var ox = (R.w - S) / 2, oy = (R.h - S) / 2;
  g2.fillStyle = 'rgba(6,8,14,0.92)';
  g2.fillRect(0, 0, R.w, R.h);
  g2.drawImage(R.mapPreview, ox, oy, S, S);

  // fog of war
  if (G.fog) {
    var N = 128, cell = S / N;
    g2.fillStyle = 'rgba(6,8,14,0.88)';
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      if (!G.fog[y * N + x]) g2.fillRect(ox + x * cell, oy + y * cell, cell + 0.5, cell + 0.5);
    }
  }
  var scale = S / CFG.WORLD, T = CFG.TILE, a = G.anchors;
  function mark(tx, ty, color, label) {
    g2.fillStyle = color;
    g2.beginPath(); g2.arc(ox + tx * scale, oy + ty * scale, 4, 0, Math.PI * 2); g2.fill();
    if (label) { g2.font = '11px monospace'; g2.textAlign = 'left'; g2.fillText(label, ox + tx * scale + 7, oy + ty * scale + 3); }
  }
  mark(a.serambi.x, a.serambi.y, '#ff9a3c', 'Serambi');
  // lingkaran Rua: wilayah pencarian pelita berikutnya
  if (G.rel.Rua >= CFG.REL.Rekan) {
    var nx = nextUnlitLantern();
    if (nx) {
      g2.strokeStyle = 'rgba(120,170,255,0.5)'; g2.lineWidth = 2; g2.setLineDash([6, 6]);
      g2.beginPath(); g2.arc(ox + nx.x * scale, oy + nx.y * scale, 90 * scale * 8, 0, Math.PI * 2); g2.stroke();
      g2.setLineDash([]);
    }
  }
  for (var i = 0; i < a.lanterns.length; i++) {
    var L = a.lanterns[i];
    if (G.story.lit[L.id]) mark(L.x, L.y, '#ffd15c', L.nama);
    else if (G.seen['lantern_' + L.id]) mark(L.x, L.y, '#8a8fa5', L.nama + ' (padam)');
  }
  if (G.grave) mark(G.grave.x / T, G.grave.y / T, '#9ecbff', 'Nisan Bara');
  mark(G.player.x / T, G.player.y / T, '#ffffff', 'Kamu');
  g2.font = '13px monospace'; g2.textAlign = 'center';
  g2.fillStyle = '#c9b8a0';
  g2.fillText('[M] tutup peta — wilayah gelap belum pernah kau lihat', R.w / 2, oy + S + 26);
}

function updateFog() {
  if (!G.fog) G.fog = new Uint8Array(128 * 128);
  var N = 128, cellTiles = CFG.WORLD / N, T = CFG.TILE;
  var cx = Math.floor(G.player.x / T / cellTiles), cy = Math.floor(G.player.y / T / cellTiles);
  for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
    var x = cx + dx, y = cy + dy;
    if (x >= 0 && y >= 0 && x < N && y < N) G.fog[y * N + x] = 1;
  }
  // tandai pelita yang terlihat
  var a = G.anchors;
  for (var i = 0; i < a.lanterns.length; i++) {
    var L = a.lanterns[i];
    if (Math.hypot(G.player.x / T - L.x, G.player.y / T - L.y) < 30) {
      if (!G.seen['lantern_' + L.id]) { G.seen['lantern_' + L.id] = true; toast(L.nama + ' — tertanda di peta.'); }
    }
  }
}
