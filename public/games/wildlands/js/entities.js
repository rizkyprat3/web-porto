// Musuh, AI, spawner, proyektil, partikel. Bebas API Canvas.

function Enemy(type, x, y, guard) {
  var d = CFG.ENEMY[type];
  this.type = type; this.x = x; this.y = y;
  this.hp = d.hp; this.maxhp = d.hp;
  this.state = 'wander'; this.dir = Math.random() * Math.PI * 2;
  this.cd = 0; this.flash = 0; this.kx = 0; this.ky = 0;
  this.telegraph = 0; this.charging = false;
  this.guard = guard || null;   // id pelita yang dijaga (shade)
  this.wt = Math.random() * 2;
}

Enemy.prototype.update = function (dt) {
  var d = CFG.ENEMY[this.type], p = G.player;
  this.cd = Math.max(0, this.cd - dt);
  this.flash = Math.max(0, this.flash - dt);
  // knockback meluruh
  this.x += this.kx * dt; this.y += this.ky * dt;
  this.kx *= Math.pow(0.02, dt); this.ky *= Math.pow(0.02, dt);

  var dx = p.x - this.x, dy = p.y - this.y;
  var dist = Math.sqrt(dx * dx + dy * dy) || 1;

  if (this.state === 'wander') {
    this.wt -= dt;
    if (this.wt <= 0) { this.dir = Math.random() * Math.PI * 2; this.wt = 1 + Math.random() * 2.5; }
    this.move(Math.cos(this.dir) * d.speed * 0.35, Math.sin(this.dir) * d.speed * 0.35, dt);
    var passive = this.type === 'spora' && !this.provoked;
    if (!passive && dist < d.aggro) this.state = 'chase';
  } else {
    if (dist > d.aggro * 1.8) { this.state = 'wander'; return; }
    if (this.type === 'bear') {
      // telegraph sebelum menerjang
      if (this.telegraph > 0) {
        this.telegraph -= dt;
        if (this.telegraph <= 0) { this.charging = true; this.chargeT = 0.55; this.cdir = Math.atan2(dy, dx); }
        return;
      }
      if (this.charging) {
        this.chargeT -= dt;
        this.move(Math.cos(this.cdir) * d.speed * 2.6, Math.sin(this.cdir) * d.speed * 2.6, dt);
        if (dist < d.atkR) this.tryHit(d, dist);
        if (this.chargeT <= 0) { this.charging = false; this.cd = d.cd; }
        return;
      }
      if (dist < 190 && this.cd <= 0) { this.telegraph = 0.7; return; }
    }
    if (d.ranged) {
      // pemanah menjaga jarak
      var want = d.keep;
      var mx = dx / dist, my = dy / dist;
      if (dist > want + 30) this.move(mx * d.speed, my * d.speed, dt);
      else if (dist < want - 30) this.move(-mx * d.speed, -my * d.speed, dt);
      if (this.cd <= 0 && dist < d.atkR + 60) {
        G.projectiles.push({ x: this.x, y: this.y, vx: mx * 340, vy: my * 340, dmg: d.dmg, life: 1.6, hostile: true });
        this.cd = d.cd;
        SFX.arrow();
      }
    } else {
      // serigala mengepung dari sisi
      var ang = Math.atan2(dy, dx);
      if (this.type === 'wolf' && dist > 70) ang += Math.sin(perfNow() * 0.001 + this.wt * 7) * 0.6;
      this.move(Math.cos(ang) * d.speed, Math.sin(ang) * d.speed, dt);
      if (dist < d.atkR) this.tryHit(d, dist);
    }
  }
  this.separate(dt);
};

Enemy.prototype.tryHit = function (d, dist) {
  if (this.cd > 0) return;
  this.cd = d.cd;
  var p = G.player;
  if (p.iframe > 0) return;
  var mult = CFG.DIFF[G.diff].dmg;
  p.hurt(d.dmg * mult, this.x, this.y);
};

Enemy.prototype.move = function (vx, vy, dt) {
  var nx = this.x + vx * dt, ny = this.y + vy * dt;
  var T = CFG.TILE;
  // shade menembus objek; lainnya kena collision
  if (this.type === 'shade' || !G.world.isSolid(Math.floor(nx / T), Math.floor(this.y / T))) this.x = nx;
  if (this.type === 'shade' || !G.world.isSolid(Math.floor(this.x / T), Math.floor(ny / T))) this.y = ny;
};

Enemy.prototype.separate = function (dt) {
  for (var i = 0; i < G.enemies.length; i++) {
    var o = G.enemies[i];
    if (o === this) continue;
    var dx = this.x - o.x, dy = this.y - o.y;
    var d2 = dx * dx + dy * dy;
    if (d2 > 0 && d2 < 26 * 26) {
      var d = Math.sqrt(d2);
      this.x += (dx / d) * 40 * dt; this.y += (dy / d) * 40 * dt;
    }
  }
};

Enemy.prototype.hurt = function (dmg, fromX, fromY, heavy) {
  // bandit memblok serangan ringan dari depan
  if (this.type === 'bandit' && !heavy && Math.random() < 0.4) {
    addFx('blok', this.x, this.y - 20);
    SFX.block();
    this.state = 'chase';
    return;
  }
  this.hp -= dmg;
  this.flash = 0.12;
  this.provoked = true;
  this.state = 'chase';
  addDmg(dmg, this.x, this.y);
  if (this.type !== 'shade') {
    var d = Math.sqrt((this.x - fromX) * (this.x - fromX) + (this.y - fromY) * (this.y - fromY)) || 1;
    this.kx = (this.x - fromX) / d * 260; this.ky = (this.y - fromY) / d * 260;
  }
  SFX.hit();
  if (this.hp <= 0) this.die();
};

Enemy.prototype.die = function () {
  var d = CFG.ENEMY[this.type], p = G.player;
  if (d.gold) p.inv.emas += d.gold[0] + Math.floor(Math.random() * (d.gold[1] - d.gold[0] + 1));
  if (d.kulit) p.inv.kulit += d.kulit + (G.rel['Ayung'] >= CFG.REL.Rekan ? 1 : 0);
  if (d.makanan) p.inv.makanan += d.makanan;
  if (this.type === 'wolf') p.inv.makanan += 1;
  if (d.bara && this.guard) { p.inv.bara += 1; toast('Bara Pelita didapat — bawa ke pelita yang padam.'); }
  var splatColor = this.type === 'shade' ? '#3a2d4a' :
    (this.type === 'virus' || this.type === 'bakteri' || this.type === 'spora') ? '#5a8f3a' : '#7d2b20';
  for (var i = 0; i < 10; i++) addFx('splat', this.x, this.y, splatColor);
  // spora pecah: dua virus lahir dari kill yang ceroboh
  if (d.splits) {
    for (var s = 0; s < 2; s++) {
      var v = new Enemy('virus', this.x + (Math.random() - 0.5) * 40, this.y + (Math.random() - 0.5) * 40);
      v.state = 'chase'; v.provoked = true;
      G.enemies.push(v);
    }
    if (Math.hypot(p.x - this.x, p.y - this.y) < 60 && p.iframe <= 0) {
      p.hurt(CFG.ENEMY.spora.dmg * CFG.DIFF[G.diff].dmg, this.x, this.y);
    }
  }
  G.stats.kills = (G.stats.kills || 0) + 1;
  if (this.type === 'virus' || this.type === 'bakteri' || this.type === 'spora') unlockAch('benih_pertama');
  if (this.type === 'shade') unlockAch('bayangan');
  SFX.kill();
  var idx = G.enemies.indexOf(this);
  if (idx >= 0) G.enemies.splice(idx, 1);
};

// ---- spawner ----
var spawnTimer = 0;
function updateSpawner(dt) {
  spawnTimer -= dt;
  if (spawnTimer > 0) return;
  spawnTimer = CFG.SPAWN_EVERY;

  var p = G.player, T = CFG.TILE;
  var cap = CFG.ENEMY_CAP[CFG.DIFF[G.diff].density];
  if (G.mode === 'ZIARAH') cap = Math.floor(cap * 0.5);

  // penjaga pelita: selalu 3 shade di sekitar pelita yang belum menyala
  var ptx = p.x / T, pty = p.y / T;
  for (var i = 0; i < G.anchors.lanterns.length; i++) {
    var L = G.anchors.lanterns[i];
    if (G.story.lit[L.id]) continue;
    var dist = Math.hypot(ptx - L.x, pty - L.y);
    if (dist < 22) {
      var guards = G.enemies.filter(function (e) { return e.guard === L.id; }).length;
      while (guards < 3) {
        var a = Math.random() * Math.PI * 2;
        G.enemies.push(new Enemy('shade', (L.x + Math.cos(a) * 7) * T, (L.y + Math.sin(a) * 7) * T, L.id));
        guards++;
      }
    }
  }

  if (G.enemies.length >= cap) return;

  // aman di dalam Serambi (kecuali kesulitan Kelam)
  var inVillage = G.world.inSerambi(Math.floor(ptx), Math.floor(pty));
  if (inVillage && CFG.DIFF[G.diff].village !== 'often') return;

  var ang = Math.random() * Math.PI * 2;
  var r = 480 + Math.random() * 260;
  var ex = p.x + Math.cos(ang) * r, ey = p.y + Math.sin(ang) * r;
  var etx = Math.floor(ex / T), ety = Math.floor(ey / T);
  var b = G.world.biomeAt(etx, ety);
  if (b.water || b === BIOME.SNOW) return;
  if (G.world.inSerambi(etx, ety)) return;

  var near = G.world.structNear(etx, ety);
  var type = null;
  if (near && near.kind === 'ruins') type = Math.random() < 0.5 ? 'bandit' : 'archer';
  else if (isNight()) type = Math.random() < 0.75 ? 'wolf' : 'virus';
  else if (b === BIOME.FOREST || b === BIOME.JUNGLE) {
    var r2 = Math.random();
    type = r2 < 0.06 ? 'bear' : r2 < 0.35 ? 'spora' : r2 < 0.6 ? 'virus' : null;
  } else if (b === BIOME.PLAINS || b === BIOME.DESERT) {
    var r3 = Math.random();
    type = r3 < 0.35 ? 'virus' : r3 < 0.5 ? 'bakteri' : r3 < 0.62 ? 'spora' : null;
  }
  if (!type) return;

  if (type === 'wolf' || type === 'virus') {
    // serigala berburu berkelompok; virus datang sebagai swarm
    var pack = 2 + Math.floor(Math.random() * (type === 'virus' ? 3 : 3));
    for (var w = 0; w < pack && G.enemies.length < cap + 3; w++) {
      G.enemies.push(new Enemy(type, ex + (Math.random() - 0.5) * 90, ey + (Math.random() - 0.5) * 90));
    }
    if (type === 'wolf' && Math.random() < 0.4) SFX.howl();
  } else {
    G.enemies.push(new Enemy(type, ex, ey));
  }
}

function updateEnemies(dt) {
  updateSpawner(dt);
  updateGuards(dt);
  var p = G.player, T = CFG.TILE;
  for (var i = G.enemies.length - 1; i >= 0; i--) {
    var e = G.enemies[i];
    var dist = Math.hypot(e.x - p.x, e.y - p.y);
    if (dist > 1400 && !e.guard) { G.enemies.splice(i, 1); continue; } // despawn jauh
    e.update(dt);
    // jebakan duri desa: mencabik Benih Kelam (bayangan melayang di atasnya)
    if (e.type !== 'shade') {
      var ob = G.world.objectAt(Math.floor(e.x / T), Math.floor(e.y / T));
      if (ob && ob.name === 'spikes') {
        e.hp -= 32 * dt;
        e.flash = 0.1;
        if (e.hp <= 0) e.die();
      }
    }
  }
  // proyektil
  for (var j = G.projectiles.length - 1; j >= 0; j--) {
    var pr = G.projectiles[j];
    pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.life -= dt;
    if (pr.hostile && p.iframe <= 0 && Math.hypot(pr.x - p.x, pr.y - p.y) < 16) {
      p.hurt(pr.dmg * CFG.DIFF[G.diff].dmg, pr.x - pr.vx, pr.y - pr.vy);
      pr.life = 0;
    }
    var T = CFG.TILE;
    if (pr.life <= 0 || G.world.isSolid(Math.floor(pr.x / T), Math.floor(pr.y / T))) G.projectiles.splice(j, 1);
  }
}

// ---- milisi Serambi: patroli tembok, menghalau apa pun yang mendekat ----
function initGuards() {
  G.guards = [];
  if (G.mods.sendirian || !G.anchors) return;
  var s = G.anchors.serambi, T = CFG.TILE;
  var posts = [[-11, -11], [11, -11], [11, 11], [-11, 11]];
  for (var i = 0; i < 4; i++) {
    G.guards.push({
      x: (s.x + posts[i][0]) * T, y: (s.y + posts[i][1]) * T,
      post: i, cd: 0,
    });
  }
}

function updateGuards(dt) {
  if (!G.guards) return;
  var s = G.anchors.serambi, T = CFG.TILE;
  var posts = [[-11, -11], [11, -11], [11, 11], [-11, 11]];
  for (var i = 0; i < G.guards.length; i++) {
    var gd = G.guards[i];
    gd.cd = Math.max(0, gd.cd - dt);
    // musuh terdekat di sekitar desa
    var target = null, bd = 300;
    for (var e = 0; e < G.enemies.length; e++) {
      var en = G.enemies[e];
      var d = Math.hypot(en.x - gd.x, en.y - gd.y);
      if (d < bd) { bd = d; target = en; }
    }
    if (target) {
      var dx = target.x - gd.x, dy = target.y - gd.y, d2 = Math.hypot(dx, dy) || 1;
      if (d2 > 38) { gd.x += dx / d2 * 105 * dt; gd.y += dy / d2 * 105 * dt; gd.walkT = (gd.walkT || 0) + dt * 10; }
      else if (gd.cd <= 0) { gd.cd = 0.9; target.hurt(15, gd.x, gd.y, true); }
      // jangan mengejar terlalu jauh dari desa
      if (Math.hypot(gd.x - s.x * T, gd.y - s.y * T) > 20 * T) target = null;
    }
    if (!target) {
      // patroli: berputar antar sudut tembok
      var pp = posts[gd.post];
      var px = (s.x + pp[0]) * T, py = (s.y + pp[1]) * T;
      var ddx = px - gd.x, ddy = py - gd.y, dd = Math.hypot(ddx, ddy);
      if (dd < 12) gd.post = (gd.post + 1) % 4;
      else { gd.x += ddx / dd * 60 * dt; gd.y += ddy / dd * 60 * dt; gd.walkT = (gd.walkT || 0) + dt * 8; }
    }
  }
}

// ---- efek ----
function addFx(kind, x, y, color) {
  G.fx.push({ kind: kind, x: x, y: y, vx: (Math.random() - 0.5) * 120, vy: -40 - Math.random() * 80, life: 0.7, color: color });
}
function addDmg(n, x, y) {
  G.fx.push({ kind: 'dmg', n: Math.round(n), x: x + (Math.random() - 0.5) * 14, y: y - 18, vy: -46, life: 0.9 });
}
function updateFx(dt) {
  for (var i = G.fx.length - 1; i >= 0; i--) {
    var f = G.fx[i];
    f.life -= dt;
    f.y += (f.vy || 0) * dt;
    if (f.vx) { f.x += f.vx * dt; f.vy += 220 * dt; }
    if (f.life <= 0) G.fx.splice(i, 1);
  }
}

function perfNow() { return (typeof performance !== 'undefined') ? performance.now() : Date.now(); }
