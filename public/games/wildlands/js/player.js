// Pemain: stat, inventory, crafting, combat, kematian. Bebas API Canvas.

function makePlayer(x, y) {
  return {
    x: x, y: y, face: 0,
    hp: CFG.MAXHP, maxhpMult: 1, weakened: false,
    hunger: CFG.MAXHUNGER, stam: CFG.MAXSTAM, temp: CFG.MAXTEMP,
    inv: { kayu: 0, batu: 0, besi: 0, bintang: 0, makanan: 2, masak: 0, kulit: 0, kain: 0, bara: 0, emas: 0 },
    has: {},                 // alat & perlengkapan: axe, pick, torch, sword, boat, coat, ring, ...
    iframe: 0, dodgeT: 0, dodgeDir: 0,
    atkCd: 0, chargeT: 0, charging: false, swing: 0, swingHeavy: false,
    flash: 0, shake: 0,
  };
}

function playerMaxHp(p) {
  var m = CFG.MAXHP + (charDef().hpBonus || 0);
  if (p.has.leather) m += 25;
  if (p.has.plate) m += 50;
  return Math.round(m * (p.weakened ? 0.9 : 1));
}

function playerDamage(p) {
  if (p.has.sword2) return 34;
  if (p.has.sword) return 22;
  if (p.has.gada) return 18;
  return CFG.LIGHT_DMG;
}

function applyCharStart(p) {
  var c = charDef();
  if (c.start) {
    for (var h in (c.start.has || {})) p.has[h] = true;
    for (var r in (c.start.inv || {})) p.inv[r] = (p.inv[r] || 0) + c.start.inv[r];
  }
  p.hp = playerMaxHp(p);
}

function updatePlayer(dt, input) {
  var p = G.player, T = CFG.TILE;
  var drain = CFG.DIFF[G.diff].drain;
  if (G.mode === 'ZIARAH') drain *= 0.35;

  p.iframe = Math.max(0, p.iframe - dt);
  p.atkCd = Math.max(0, p.atkCd - dt);
  p.flash = Math.max(0, p.flash - dt);
  p.shake = Math.max(0, p.shake - dt);
  p.swing = Math.max(0, p.swing - dt);

  // ---- gerak ----
  var mx = 0, my = 0;
  if (input.up) my -= 1; if (input.down) my += 1;
  if (input.left) mx -= 1; if (input.right) mx += 1;
  var moving = mx || my;
  var len = Math.hypot(mx, my) || 1;
  var ch = charDef();
  var sprinting = input.sprint && moving && p.stam > 1;
  var spd = (sprinting ? CFG.SPRINT : CFG.WALK) * (ch.spd || 1);
  if (p.has.plate) spd *= 0.9;
  var tb = G.world.biomeAt(Math.floor(p.x / T), Math.floor(p.y / T));
  if (tb.boatable && p.has.boat) spd *= 1.5;

  if (p.dodgeT > 0) {
    p.dodgeT -= dt;
    var dvx = Math.cos(p.dodgeDir) * CFG.DODGE_SPEED, dvy = Math.sin(p.dodgeDir) * CFG.DODGE_SPEED;
    tryMove(p, dvx * dt, dvy * dt);
  } else if (moving) {
    p.face = Math.atan2(my, mx);
    p.walkT = (p.walkT || 0) + dt * (sprinting ? 15 : 10);
    tryMove(p, (mx / len) * spd * dt, (my / len) * spd * dt);
  }

  // dodge
  var dodgeCost = ch.dodgeCost || CFG.STAM_DODGE;
  if (input.dodge && p.dodgeT <= 0 && p.stam >= dodgeCost) {
    p.dodgeT = CFG.DODGE_TIME;
    p.iframe = CFG.DODGE_IFRAME;
    p.dodgeDir = moving ? Math.atan2(my, mx) : p.face;
    p.stam -= dodgeCost;
    SFX.dodge();
  }
  input.dodge = false;

  // ---- serangan ----
  if (input.attackHeld && !p.charging && p.atkCd <= 0) { p.charging = true; p.chargeT = 0; }
  if (p.charging) {
    p.chargeT += dt;
    if (!input.attackHeld) {
      var heavy = p.chargeT >= CFG.HEAVY_CHARGE;
      doAttack(p, heavy);
      p.charging = false;
    }
  }

  // ---- survival drain ----
  var hungerRate = CFG.HUNGER_RATE * drain * (ch.hungerMult || 1) * (sprinting ? CFG.HUNGER_SPRINT_MULT : 1);
  p.hunger = Math.max(0, p.hunger - hungerRate * dt);

  var night = isNight();
  var cold = tb.cold;
  var nearFire = isNearFire(p);
  var tempMult = ch.tempMult || 1;   // barbarian tanpa baju: dingin lebih kejam
  if (nearFire) p.temp = Math.min(CFG.MAXTEMP, p.temp + CFG.TEMP_FIRE_GAIN * dt);
  else if (cold) p.temp = Math.max(0, p.temp - CFG.TEMP_SNOW_DRAIN * drain * tempMult * (p.has.coat ? 0.35 : 1) * dt);
  else if (night) p.temp = Math.max(0, p.temp - CFG.TEMP_NIGHT_DRAIN * drain * tempMult * (p.has.coat || p.has.leather ? 0.5 : 1) * dt);
  else p.temp = Math.min(CFG.MAXTEMP, p.temp + CFG.TEMP_DAY_GAIN * dt);

  if (p.hunger <= 0) p.hp -= CFG.STARVE_DPS * dt;
  if (p.temp <= 0) p.hp -= CFG.FREEZE_DPS * dt;
  if (p.hunger > 60 && p.temp > 40 && p.hp < playerMaxHp(p)) p.hp = Math.min(playerMaxHp(p), p.hp + CFG.REGEN_HPS * dt);

  // stamina
  var stamRegen = ch.stamRegenMult || 1;
  if (sprinting) p.stam = Math.max(0, p.stam - CFG.STAM_SPRINT * dt);
  else p.stam = Math.min(CFG.MAXSTAM, p.stam + (moving ? CFG.STAM_REGEN_MOVE : CFG.STAM_REGEN_IDLE) * stamRegen * dt);

  if (p.hp <= 0) playerDie();
}

function tryMove(p, dx, dy) {
  var T = CFG.TILE;
  var nx = p.x + dx, ny = p.y + dy;
  nx = Math.max(T, Math.min(CFG.WORLD * T - T, nx));
  ny = Math.max(T, Math.min(CFG.WORLD * T - T, ny));
  if (!G.world.isSolid(Math.floor(nx / T), Math.floor(p.y / T), p)) p.x = nx;
  if (!G.world.isSolid(Math.floor(p.x / T), Math.floor(ny / T), p)) p.y = ny;
}

function doAttack(p, heavy) {
  var cost = heavy ? CFG.STAM_HEAVY : CFG.STAM_LIGHT;
  if (p.stam < cost) { toast('Stamina habis.'); return; }
  p.stam -= cost;
  p.atkCd = CFG.ATTACK_CD * (heavy ? 1.8 : 1);
  p.swing = 0.22; p.swingHeavy = heavy;
  var dmg = playerDamage(p) * (heavy ? (charDef().heavyMult || CFG.HEAVY_MULT) : 1);
  var range = heavy ? CFG.HEAVY_RANGE : CFG.LIGHT_RANGE;
  SFX.swing();

  var hitAny = false;
  for (var i = G.enemies.length - 1; i >= 0; i--) {
    var e = G.enemies[i];
    var dx = e.x - p.x, dy = e.y - p.y;
    var dist = Math.hypot(dx, dy);
    if (dist > range) continue;
    var ang = Math.atan2(dy, dx);
    var diff = Math.abs(normAngle(ang - p.face));
    if (diff < CFG.LIGHT_ARC / 2 + (heavy ? 0.5 : 0)) { e.hurt(dmg, p.x, p.y, heavy); hitAny = true; }
  }
  if (!hitAny) harvestFacing(p, heavy);
}

function normAngle(a) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }

// menebang / menambang: serang tile yang dihadapi
function harvestFacing(p, heavy) {
  var T = CFG.TILE;
  var tx = Math.floor((p.x + Math.cos(p.face) * 40) / T);
  var ty = Math.floor((p.y + Math.sin(p.face) * 40) / T);
  var o = G.world.objectAt(tx, ty);
  if (!o || o.hp >= 999) return;
  if (o.tool && !p.has[o.tool] && !(o.tool === 'axe' && p.has.axe2) && !(o.tool === 'pick' && p.has.pick2)) {
    toast('Butuh ' + (o.tool.indexOf('pick') === 0 ? 'beliung' : 'kapak') + ' untuk ' + o.label + '.');
    return;
  }
  var key = tx + ',' + ty;
  G.objHp = G.objHp || {};
  var power = 1;
  if (o.tool === 'axe' && p.has.axe2) power = 3;
  if (o.tool === 'pick' && p.has.pick2) power = 3;
  if (heavy) power *= 2;
  G.objHp[key] = (G.objHp[key] === undefined ? o.hp : G.objHp[key]) - power;
  addFx('splat', tx * T + 16, ty * T + 16, '#9a8060');
  SFX.chop();
  if (G.objHp[key] <= 0) {
    delete G.objHp[key];
    if (o.chest) { openChest(tx, ty); return; }
    for (var res in o.drops) {
      p.inv[res] += o.drops[res];
      toast('+' + o.drops[res] + ' ' + RES_NAMA[res]);
    }
    // hapus dari suar jika suar dihancurkan
    if (o.beacon) G.beacons = G.beacons.filter(function (b) { return b.x !== tx || b.y !== ty; });
    G.world.harvest(tx, ty);
  }
}

function openChest(tx, ty) {
  var key = tx + ',' + ty;
  if (G.world.looted[key]) { toast('Peti ini sudah kosong.'); return; }
  G.world.looted[key] = true;
  var p = G.player;
  var gold = 5 + Math.floor(tileRandom(tx, ty, 500) * 12);
  p.inv.emas += gold;
  var bonus = tileRandom(tx, ty, 501);
  var extra = '';
  if (bonus < 0.3) { p.inv.besi += 3; extra = ', +3 Besi'; }
  else if (bonus < 0.5) { p.inv.kain += 2; extra = ', +2 Kain'; }
  else if (bonus < 0.6) { p.inv.bintang += 1; extra = ', +1 Bijih Bintang'; }
  toast('Peti terbuka: +' + gold + ' Emas' + extra);
  G.world.harvest(tx, ty);
  SFX.chest();
  G.stats.chests = (G.stats.chests || 0) + 1;
}

G.player_hurtShake = 0;
function playerHurt(dmg, fromX, fromY) {
  var p = G.player;
  if (p.iframe > 0) return;
  p.hp -= dmg;
  p.flash = 0.15; p.shake = 0.25; p.iframe = 0.35;
  addDmg(dmg, p.x, p.y - 10);
  SFX.hurt();
  var d = Math.hypot(p.x - fromX, p.y - fromY) || 1;
  tryMove(p, (p.x - fromX) / d * 20, (p.y - fromY) / d * 20);
  if (p.hp <= 0) playerDie();
}

function craft(id) {
  var r = null;
  for (var i = 0; i < RECIPES.length; i++) if (RECIPES[i].id === id) r = RECIPES[i];
  var p = G.player;
  if (!r || p.has[id]) return false;
  if (charDef().noArmor && (id === 'leather' || id === 'plate')) {
    toast('Barbarian tidak memakai zirah. Kulitnya adalah zirahnya.');
    return false;
  }
  if (r.npc && (G.rel[r.npc] || 0) < CFG.REL.Rekan && !G.mods.sendirian) {
    toast('Butuh bantuan ' + r.npc + ' — jadilah Rekan-nya dulu (bekerja bersamanya).');
    return false;
  }
  if (r.npc && G.mods.sendirian) { toast('Tidak ada yang bisa membantumu membuat ini. Serambi kosong.'); return false; }
  if (r.nearFire && !isNearFire(p)) { toast('Harus dekat api.'); return false; }
  for (var res in r.cost) {
    if ((p.inv[res] || 0) < r.cost[res]) { toast('Bahan kurang: ' + RES_NAMA[res] + ' (' + (p.inv[res] || 0) + '/' + r.cost[res] + ')'); return false; }
  }
  for (var res2 in r.cost) p.inv[res2] -= r.cost[res2];
  if (id === 'cook') { p.inv.masak += 1; toast('Masakan jadi.'); }
  else if (id === 'campfire') { p.inv.campfireKit = (p.inv.campfireKit || 0) + 1; toast('Api unggun siap diletakkan (F).'); }
  else if (id === 'house') { G.story.houseUpgraded = true; toast('Rumahmu kini layak dihuni dua orang.'); }
  else { p.has[id] = true; toast(r.nama + ' selesai dibuat.'); }
  if (id === 'axe' || id === 'pick' || id === 'torch') unlockAch('alat_pertama');
  SFX.craft();
  return true;
}

function eatFood() {
  var p = G.player;
  if (p.inv.masak > 0) {
    p.inv.masak--; p.hunger = Math.min(CFG.MAXHUNGER, p.hunger + 55); p.hp = Math.min(playerMaxHp(p), p.hp + 20);
    if (p.weakened) { p.weakened = false; toast('Badanmu pulih.'); }
    SFX.eat(); return;
  }
  if (p.inv.makanan > 0) {
    p.inv.makanan--; p.hunger = Math.min(CFG.MAXHUNGER, p.hunger + 25);
    SFX.eat(); return;
  }
  toast('Tidak ada makanan.');
}

function placeCampfire() {
  var p = G.player, T = CFG.TILE;
  if (!(p.inv.campfireKit > 0)) { toast('Buat api unggun dulu di panel crafting (C).'); return; }
  var tx = Math.floor(p.x / T), ty = Math.floor((p.y + 40) / T);
  if (G.world.objectAt(tx, ty) || G.world.biomeAt(tx, ty).water) { toast('Tidak bisa diletakkan di sini.'); return; }
  p.inv.campfireKit--;
  G.world.place(tx, ty, 'campfire');
  toast('Api unggun menyala. (E untuk memasak / mendaftarkan suar)');
  SFX.craft();
}

function isNearFire(p) {
  var T = CFG.TILE;
  var ptx = Math.floor(p.x / T), pty = Math.floor(p.y / T);
  for (var dy = -3; dy <= 3; dy++) for (var dx = -3; dx <= 3; dx++) {
    var o = G.world.objectAt(ptx + dx, pty + dy);
    if (o && o.fire) {
      // Pelita Abu tidak memberi kehangatan — tapi itu objek anchor, bukan tile fire
      return true;
    }
  }
  // dekat menara / pelita menyala (kecuali abu)
  var a = G.anchors;
  if (Math.hypot(ptx - a.serambi.x, pty - a.serambi.y) < 5) return true;
  for (var i = 0; i < a.lanterns.length; i++) {
    var L = a.lanterns[i];
    if (G.story.lit[L.id] && L.id !== 'abu' && Math.hypot(ptx - L.x, pty - L.y) < 5) return true;
  }
  return false;
}

function playerDie() {
  if (G.state === 'dead') return;
  SFX.death();
  G.stats.deaths = (G.stats.deaths || 0) + 1;
  handleDeathByMode();   // modes.js
}
