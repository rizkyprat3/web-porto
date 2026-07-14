// Jangkar dunia: spawn, Serambi, lima pelita — dicari deterministik dari seed,
// lalu divalidasi flood-fill. Seed yang tidak bisa ditamatkan DIBUANG.

var LANTERN_DEFS = [
  { id: 'pasir',  nama: 'Pelita Pasir',  biome: 'SAND',   babak: 1 },
  { id: 'akar',   nama: 'Pelita Akar',   biome: 'JUNGLE', babak: 2 },
  { id: 'garam',  nama: 'Pelita Garam',  biome: 'ISLAND', babak: 3 },
  { id: 'tulang', nama: 'Pelita Tulang', biome: 'DESERT', babak: 4 },
  { id: 'abu',    nama: 'Pelita Abu',    biome: 'SNOW',   babak: 5 },
];

// flood-fill kasar (downsample 8×) dari Serambi.
// Salju & gunung dianggap bisa dilewati (pemain akhirnya bisa), air tidak.
function computeReach(world, sx, sy) {
  var DS = 8, N = CFG.WORLD / DS;
  var reach = new Uint8Array(N * N);
  var q = [[Math.floor(sx / DS), Math.floor(sy / DS)]];
  reach[q[0][1] * N + q[0][0]] = 1;
  while (q.length) {
    var cur = q.pop(), cx = cur[0], cy = cur[1];
    var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (var i = 0; i < 4; i++) {
      var nx = cx + dirs[i][0], ny = cy + dirs[i][1];
      if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
      var idx = ny * N + nx;
      if (reach[idx]) continue;
      var b = world.biomeAt(nx * DS + 4, ny * DS + 4);
      if (b.water) continue;
      reach[idx] = 1;
      q.push([nx, ny]);
    }
  }
  return { grid: reach, N: N, DS: DS };
}

function isReachable(reach, tx, ty) {
  var cx = Math.floor(tx / reach.DS), cy = Math.floor(ty / reach.DS);
  for (var dy = -3; dy <= 3; dy++) for (var dx = -3; dx <= 3; dx++) {
    var nx = cx + dx, ny = cy + dy;
    if (nx >= 0 && ny >= 0 && nx < reach.N && ny < reach.N && reach.grid[ny * reach.N + nx]) return true;
  }
  return false;
}

function findAnchors(world) {
  var W = CFG.WORLD, half = W / 2;

  // 1. spawn: pantai di sisi selatan
  var spawn = null;
  for (var attempt = 0; attempt < 200 && !spawn; attempt++) {
    var sx = Math.floor(half + (hash2(attempt, 7, world.seed) - 0.5) * W * 0.5);
    for (var sy = W - 8; sy > half; sy--) {
      var b = world.biomeAt(sx, sy);
      if (b === BIOME.SAND && world.biomeAt(sx, sy + 3).water) { spawn = { x: sx, y: sy - 2 }; break; }
      if (!b.water && b !== BIOME.SAND) break;
    }
  }
  if (!spawn) return null;

  // 2. Serambi: 150–280 tile ke utara. Seluruh tapak benteng (tembok ±14 +
  //    cincin duri ±18) HARUS di darat — desa tidak boleh tenggelam di laut.
  var serambi = null;
  for (var d = 150; d <= 320 && !serambi; d += 4) {
    for (var ox = 0; ox <= 90 && !serambi; ox += 6) {
      var xs = [spawn.x + ox, spawn.x - ox];
      for (var xi = 0; xi < 2; xi++) {
        var cx = xs[xi], cy = spawn.y - d, ok = true;
        for (var yy = -19 ; yy <= 19 && ok; yy += 2) for (var xx = -19; xx <= 19 && ok; xx += 2) {
          if (world.biomeAt(cx + xx, cy + yy).water) ok = false;   // tapak penuh bebas air
        }
        for (var y2 = -6; y2 <= 6 && ok; y2++) for (var x2 = -6; x2 <= 6 && ok; x2++) {
          var bb = world.biomeAt(cx + x2, cy + y2);
          if (bb.water || bb === BIOME.ROCK || bb === BIOME.SNOW) ok = false;   // interior datar
        }
        if (ok) { serambi = { x: cx, y: cy }; break; }
      }
    }
  }
  if (!serambi) return null;

  var reach = computeReach(world, serambi.x, serambi.y);
  if (!isReachable(reach, spawn.x, spawn.y)) return null;

  // 3. lima pelita di pita jarak yang naik bertahap
  var lanterns = [];
  for (var i = 0; i < LANTERN_DEFS.length; i++) {
    var def = LANTERN_DEFS[i], dist = CFG.LANTERN_DIST[i] * (CFG.WORLD / 4096);
    var found = null;
    for (var k = 0; k < 2400 && !found; k++) {
      var ang = hash2(k, i * 100, world.seed + 31) * Math.PI * 2;
      var r = dist * (0.72 + hash2(k, i * 100 + 1, world.seed + 32) * 0.55);
      var tx = Math.floor(serambi.x + Math.cos(ang) * r);
      var ty = Math.floor(serambi.y + Math.sin(ang) * r);
      if (tx < 12 || ty < 12 || tx >= W - 12 || ty >= W - 12) continue;
      var bio = world.biomeAt(tx, ty);
      if (def.biome === 'ISLAND') {
        // pulau: daratan kecil yang dikelilingi air
        if (bio.water || bio === BIOME.SNOW) continue;
        var waterRing = 0;
        for (var a2 = 0; a2 < 8; a2++) {
          var wx = tx + Math.round(Math.cos(a2 * 0.785) * 9), wy = ty + Math.round(Math.sin(a2 * 0.785) * 9);
          if (world.biomeAt(wx, wy).water) waterRing++;
        }
        if (waterRing < 5) continue;
        found = { x: tx, y: ty };
      } else {
        if (bio.id !== def.biome) continue;
        if (!isReachable(reach, tx, ty)) continue;
        found = { x: tx, y: ty };
      }
    }
    if (!found) return null;
    lanterns.push({ id: def.id, nama: def.nama, babak: def.babak, x: found.x, y: found.y });
  }
  lanterns.sort(function (a, b) { return a.babak - b.babak; });
  return { spawn: spawn, serambi: serambi, lanterns: lanterns, reach: reach };
}

// Tata letak Serambi: desa berbenteng. Dua ratus tahun dikepung Benih Kelam —
// tidak ada yang hidup di sini tanpa tembok, jebakan, dan jaga malam.
function buildSerambi(world) {
  var s = world.anchors.serambi, L = world.serambiLayout;
  function put(dx, dy, name) { L[(s.x + dx) + ',' + (s.y + dy)] = name; }
  var R = 14;

  // menara bara 2×2 di tengah + Titik Api (gerbang perjalanan api)
  put(0, 0, 'tower'); put(1, 0, 'towerPad'); put(0, 1, 'towerPad'); put(1, 1, 'towerPad');
  put(4, 3, 'waypoint');

  var hutSpots = [[-8, -6], [8, -7], [-9, 4], [9, 5], [-3, -10], [4, -10], [-10, -1], [10, 0], [2, 9]];
  for (var i = 0; i < hutSpots.length; i++) put(hutSpots[i][0], hutSpots[i][1], 'hut');
  put(-5, 8, 'farm'); put(-4, 8, 'farm'); put(-3, 8, 'farm'); put(-5, 9, 'farm'); put(-4, 9, 'farm'); put(-3, 9, 'farm');
  put(6, 8, 'forge');
  put(-1, 12, 'dock');

  // tembok keliling PENUH — gerbang selatan 3 tile (jalan masuk pemain), utara 1 tile
  for (var w = -R; w <= R; w++) {
    if (Math.abs(w) > 1) put(w, R, 'wall');       // sisi selatan, gerbang di -1..1
    if (w !== 0) put(w, -R, 'wall');              // sisi utara, gerbang di 0
    put(-R, w, 'wall'); put(R, w, 'wall');        // sisi barat & timur
  }
  // menara jaga di empat sudut (api penjagaan — terlihat dari jauh)
  put(-R, -R, 'watchtower'); put(R, -R, 'watchtower');
  put(-R, R, 'watchtower'); put(R, R, 'watchtower');
  // obor gerbang selatan
  put(-2, R, 'gatePost'); put(2, R, 'gatePost');

  // jebakan duri di luar tembok (radius 16–18), koridor gerbang dibiarkan bersih
  for (var ring = 16; ring <= 18; ring++) {
    for (var a = -ring; a <= ring; a++) {
      var edges = [[a, -ring], [a, ring], [-ring, a], [ring, a]];
      for (var e = 0; e < edges.length; e++) {
        var dx = edges[e][0], dy = edges[e][1];
        if (Math.abs(dx) <= 2 && dy > 0) continue;          // koridor gerbang selatan
        if (dx === 0 && dy < 0) continue;                    // koridor gerbang utara
        if (tileRandom(s.x + dx, s.y + dy, 321) < 0.4) put(dx, dy, 'spikes');
      }
    }
  }
}

// coba beberapa seed sampai dapat dunia yang tervalidasi
function buildWorld(seedWanted) {
  for (var s = seedWanted; s < seedWanted + 60; s++) {
    var w = new World(s);
    var a = findAnchors(w);
    if (a) {
      w.anchors = a;
      buildSerambi(w);
      return w;
    }
  }
  return null;
}
