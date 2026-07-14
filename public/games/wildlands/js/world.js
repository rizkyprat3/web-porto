// Dunia dihitung, bukan disimpan. Yang disimpan hanya perubahan pemain.
// File ini bebas API Canvas kecuali cache chunk (getChunkCanvas) yang
// memang bagian render-side dan di-guard agar bisa dites di Node.

var BIOME = {
  DEEP:   { id: 'DEEP',   name: 'Laut Dalam',   color: '#0b2440', solid: true, water: true },
  WATER:  { id: 'WATER',  name: 'Perairan',     color: '#14507e', solid: true, water: true, boatable: true },
  SAND:   { id: 'SAND',   name: 'Pantai',       color: '#d8c088' },
  PLAINS: { id: 'PLAINS', name: 'Padang',       color: '#679f4c' },
  FOREST: { id: 'FOREST', name: 'Hutan',        color: '#3a7343' },
  JUNGLE: { id: 'JUNGLE', name: 'Rimba',        color: '#245c33' },
  DESERT: { id: 'DESERT', name: 'Gurun',        color: '#cfa85f' },
  ROCK:   { id: 'ROCK',   name: 'Pegunungan',   color: '#7c7a75' },
  SNOW:   { id: 'SNOW',   name: 'Puncak Salju', color: '#e3e9ee', cold: true, needCoat: true },
};

function World(seed) {
  this.seed = seed;
  this.chunks = {};      // "cx,cy" -> canvas
  this.chunkKeys = [];
  this.harvested = {};   // "tx,ty" -> hari dipanen (untuk regrow)
  this.placed = {};      // "tx,ty" -> nama objek buatan pemain
  this.looted = {};      // peti yang sudah dibuka
  this.anchors = null;   // diisi anchors.js
  this.serambiLayout = {}; // "tx,ty" -> nama objek desa
}

World.prototype.elevRaw = function (tx, ty) {
  var e = fbm(tx / 220, ty / 220, this.seed, 4) * 0.72 +
          fbm(tx / 45, ty / 45, this.seed + 500, 3) * 0.28;
  var half = CFG.WORLD / 2;
  var nx = (tx - half) / half, ny = (ty - half) / half;
  var d = Math.sqrt(nx * nx + ny * ny);
  // falloff radial: tepi benua selalu berakhir jadi laut
  e -= Math.max(0, d - 0.52) * 0.9;
  return e;
};

World.prototype.moist = function (tx, ty) {
  return fbm(tx / 130, ty / 130, this.seed + 9000, 3);
};

World.prototype.biomeAt = function (tx, ty) {
  if (tx < 0 || ty < 0 || tx >= CFG.WORLD || ty >= CFG.WORLD) return BIOME.DEEP;
  var e = this.elevRaw(tx, ty);
  if (e < 0.30) return BIOME.DEEP;
  if (e < 0.385) return BIOME.WATER;
  if (e < 0.42) return BIOME.SAND;
  if (e > 0.76) return BIOME.SNOW;
  if (e > 0.66) return BIOME.ROCK;
  var m = this.moist(tx, ty);
  if (m < 0.36) return e > 0.55 ? BIOME.ROCK : BIOME.DESERT;
  if (m < 0.50) return BIOME.PLAINS;
  if (m < 0.66) return BIOME.FOREST;
  return BIOME.JUNGLE;
};

World.prototype.inSerambi = function (tx, ty) {
  var a = this.anchors; if (!a) return false;
  return Math.abs(tx - a.serambi.x) <= 19 && Math.abs(ty - a.serambi.y) <= 19;
};

// Objek adalah fungsi murni dari posisi. Regrow: objek yang dipanen tumbuh
// kembali setelah N hari — kecuali batu dan bangunan.
World.prototype.objectAt = function (tx, ty) {
  var key = tx + ',' + ty;
  if (this.placed[key]) return OBJ[this.placed[key]];

  var natural = this.naturalObjectAt(tx, ty);
  if (this.harvested[key] !== undefined) {
    if (!natural || !natural.regrow) return null;
    var wait = CFG.REGROW[natural.regrow];
    if (G.time.day - this.harvested[key] >= wait) { delete this.harvested[key]; return natural; }
    return null;
  }
  return natural;
};

World.prototype.naturalObjectAt = function (tx, ty) {
  // pelita & bangkai kapal digambar sebagai anchor (render.js), bukan objek tile
  var a = this.anchors;
  if (a) {
    for (var i = 0; i < a.lanterns.length; i++) {
      var L = a.lanterns[i];
      if (Math.abs(tx - L.x) <= 1 && Math.abs(ty - L.y) <= 1) return OBJ.lanternBlock;
    }
    if (this.inSerambi(tx, ty)) return this.serambiLayout[tx + ',' + ty] ? OBJ[this.serambiLayout[tx + ',' + ty]] : null;
  }

  var s = this.structObjectAt(tx, ty);
  if (s) return s;

  var b = this.biomeAt(tx, ty);
  var r = tileRandom(tx, ty, 3);
  if (b === BIOME.FOREST && r < 0.26) return OBJ.tree;
  if (b === BIOME.JUNGLE && r < 0.34) return OBJ.jungleTree;
  if (b === BIOME.PLAINS && r < 0.025) return OBJ.tree;
  if ((b === BIOME.PLAINS || b === BIOME.FOREST) && r > 0.965) return OBJ.bush;
  if (b === BIOME.ROCK && r < 0.20) return OBJ.rock;
  if (b === BIOME.ROCK && r > 0.988) return OBJ.oreVein;
  if (b === BIOME.SNOW && r > 0.992) return OBJ.starVein;
  if (b === BIOME.DESERT && r < 0.015) return OBJ.cactus;
  if (b === BIOME.SAND && r > 0.993) return OBJ.rock;
  return null;
};

// Landmark pada grid kasar 64×64 — ±25% region terisi
World.prototype.structAt = function (rx, ry) {
  var r = tileRandom(rx, ry, 77);
  if (r > 0.25) return null;
  var cx = rx * 64 + 12 + Math.floor(tileRandom(rx, ry, 11) * 40);
  var cy = ry * 64 + 12 + Math.floor(tileRandom(rx, ry, 12) * 40);
  var b = this.biomeAt(cx, cy);
  if (b.solid || b === BIOME.SNOW || b === BIOME.SAND) return null;
  if (this.anchors && Math.abs(cx - this.anchors.serambi.x) < 40 && Math.abs(cy - this.anchors.serambi.y) < 40) return null;
  var kind = r < 0.09 ? 'village' : r < 0.18 ? 'ruins' : 'camp';
  return { cx: cx, cy: cy, kind: kind, radius: kind === 'village' ? 7 : 5, key: rx + ',' + ry };
};

World.prototype.structNear = function (tx, ty) {
  var rx = Math.floor(tx / 64), ry = Math.floor(ty / 64);
  for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
    var s = this.structAt(rx + dx, ry + dy);
    if (s && Math.abs(s.cx - tx) <= s.radius + 1 && Math.abs(s.cy - ty) <= s.radius + 1) return s;
  }
  return null;
};

World.prototype.structObjectAt = function (tx, ty) {
  var s = this.structNear(tx, ty);
  if (!s) return null;
  var dx = tx - s.cx, dy = ty - s.cy;
  var edge = Math.max(Math.abs(dx), Math.abs(dy));
  var r = tileRandom(tx, ty, 55);
  if (s.kind === 'village') {
    if (dx === 0 && dy === 0) return OBJ.chest;
    if (edge === s.radius && r < 0.5) return OBJ.wall;
    if (edge < s.radius - 1 && r < 0.09) return OBJ.hut;
  } else if (s.kind === 'ruins') {
    if (dx === 0 && dy === 0) return OBJ.chest;
    if (edge <= s.radius && r < 0.25) return OBJ.pillar;
  } else if (s.kind === 'camp') {
    if (dx === 0 && dy === 0) return OBJ.campfireWild;
    if (edge <= s.radius && r < 0.06) return OBJ.rock;
  }
  return null;
};

World.prototype.isSolid = function (tx, ty, p) {
  var b = this.biomeAt(tx, ty);
  if (b.water) {
    if (b.boatable && p && p.has && p.has.boat) return false;
    return true;
  }
  if (b.needCoat && (!p || !p.has || !p.has.coat)) return true;
  var o = this.objectAt(tx, ty);
  return !!(o && o.solid);
};

World.prototype.harvest = function (tx, ty) {
  var key = tx + ',' + ty;
  if (this.placed[key]) delete this.placed[key];
  else this.harvested[key] = G.time.day;
  this.invalidate(tx, ty);
};

World.prototype.place = function (tx, ty, name) {
  this.placed[tx + ',' + ty] = name;
  delete this.harvested[tx + ',' + ty];
};

World.prototype.invalidate = function (tx, ty) {
  var k = Math.floor(tx / CFG.CHUNK) + ',' + Math.floor(ty / CFG.CHUNK);
  if (this.chunks[k]) { delete this.chunks[k]; }
};

// ---- render-side: cache terrain per chunk ke offscreen canvas ----
World.prototype.getChunkCanvas = function (cx, cy) {
  var key = cx + ',' + cy;
  if (this.chunks[key]) return this.chunks[key];
  var T = CFG.TILE, N = CFG.CHUNK;
  var c = document.createElement('canvas');
  c.width = c.height = N * T;
  var g = c.getContext('2d');
  for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
    var tx = cx * N + x, ty = cy * N + y;
    var b = this.biomeAt(tx, ty);
    g.fillStyle = b.color;
    g.fillRect(x * T, y * T, T, T);
    var n = tileRandom(tx, ty, 1);
    g.fillStyle = n > 0.5 ? 'rgba(255,255,255,' + ((n - 0.5) * 0.09).toFixed(3) + ')'
                          : 'rgba(0,0,0,' + ((0.5 - n) * 0.11).toFixed(3) + ')';
    g.fillRect(x * T, y * T, T, T);
    if (b.water && tileRandom(tx, ty, 2) > 0.94) {
      g.fillStyle = 'rgba(255,255,255,0.15)';
      g.fillRect(x * T + 6, y * T + 14, 18, 2);
    }
  }
  this.chunkKeys.push(key);
  if (this.chunkKeys.length > 220) { delete this.chunks[this.chunkKeys.shift()]; }
  this.chunks[key] = c;
  return c;
};
