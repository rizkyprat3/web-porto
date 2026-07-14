// WILDLANDS — seluruh angka balancing dikumpulkan di sini.
// File lain tidak boleh menaruh angka gameplay hard-coded.

var CFG = {
  TILE: 32,
  WORLD: 4096,            // tile per sisi (Benua Luas: 6144)
  CHUNK: 16,              // tile per sisi chunk

  // waktu ------------------------------------------------------
  DAY_LEN: 720,           // detik nyata per hari (12 menit)
  PHASE: { dawn: [0, 60], day: [60, 480], dusk: [480, 540], night: [540, 720] },
  SEASON_DAYS: 12,
  SEASONS: ['Semi', 'Panas', 'Gugur', 'Dingin'],

  // pemain ------------------------------------------------------
  WALK: 140, SPRINT: 240,
  MAXHP: 100, MAXHUNGER: 100, MAXSTAM: 100, MAXTEMP: 100,
  HUNGER_RATE: 0.075,     // per detik
  HUNGER_SPRINT_MULT: 2.2,
  TEMP_NIGHT_DRAIN: 0.35,
  TEMP_SNOW_DRAIN: 0.9,
  TEMP_FIRE_GAIN: 3.0,
  TEMP_DAY_GAIN: 0.6,
  STARVE_DPS: 1.2, FREEZE_DPS: 2.0,
  REGEN_HPS: 1.0,         // saat kenyang & hangat
  STAM_SPRINT: 12, STAM_LIGHT: 8, STAM_HEAVY: 22, STAM_DODGE: 25,
  STAM_REGEN_IDLE: 20, STAM_REGEN_MOVE: 10,
  DODGE_IFRAME: 0.3, DODGE_SPEED: 520, DODGE_TIME: 0.22,
  LIGHT_DMG: 12, HEAVY_MULT: 2.5, LIGHT_RANGE: 62, HEAVY_RANGE: 84, LIGHT_ARC: 1.6,
  ATTACK_CD: 0.38, HEAVY_CHARGE: 0.55,

  // teleport ----------------------------------------------------
  TELEPORT_HUNGER: 30,
  MAX_BEACONS: 3,

  // regrow (hari) -----------------------------------------------
  REGROW: { bush: 2, tree: 6, ore: 10, star: 14 },

  // jarak pelita dari Serambi (tile) ------------------------------
  LANTERN_DIST: [400, 800, 1200, 1600, 1900],

  // musuh ---------------------------------------------------------
  ENEMY: {
    slime:  { hp: 20,  dmg: 8,  speed: 42,  aggro: 90,  atkR: 30, cd: 1.2, xp: 0, gold: [0, 1] },
    wolf:   { hp: 35,  dmg: 12, speed: 168, aggro: 420, atkR: 34, cd: 1.0, kulit: 1 },
    bandit: { hp: 55,  dmg: 16, speed: 122, aggro: 260, atkR: 40, cd: 1.1, gold: [3, 8] },
    archer: { hp: 35,  dmg: 11, speed: 112, aggro: 380, atkR: 300, cd: 1.8, gold: [2, 6], ranged: true, keep: 210 },
    bear:   { hp: 170, dmg: 34, speed: 150, aggro: 200, atkR: 46, cd: 1.6, kulit: 4 },
    shade:  { hp: 60,  dmg: 20, speed: 132, aggro: 320, atkR: 36, cd: 0.9, bara: true },
  },
  ENEMY_CAP: { rendah: 8, sedang: 14, tinggi: 22 },
  SPAWN_EVERY: 4.5,       // detik

  // kesulitan -----------------------------------------------------
  DIFF: {
    Tenang:  { dmg: 0.6, drain: 0.6, density: 'rendah', village: 'never' },
    Standar: { dmg: 1.0, drain: 1.0, density: 'sedang', village: 'rare' },
    Kelam:   { dmg: 1.6, drain: 1.4, density: 'tinggi', village: 'often' },
  },

  // relasi --------------------------------------------------------
  REL: { Rekan: 3, Dipercaya: 8, Terikat: 15 },
  MARRY_MIN_DAY: 24,

  // pedagang ------------------------------------------------------
  TRADER_EVERY: 6,

  SAVE_KEY: 'wildlands.v1.save',
  MEMORIAL_KEY: 'wildlands.v1.memorial',
  SCORE_KEY: 'wildlands.v1.musafir',
};

// resep — tier II butuh Neyra (Rekan), perahu butuh Marsa (Rekan)
var RECIPES = [
  { id: 'axe',      nama: 'Kapak Batu',    tier: 1, cost: { kayu: 5, batu: 3 }, desc: 'Menebang pohon.' },
  { id: 'pick',     nama: 'Beliung Batu',  tier: 1, cost: { kayu: 3, batu: 5 }, desc: 'Menambang batu.' },
  { id: 'torch',    nama: 'Obor',          tier: 1, cost: { kayu: 2 }, desc: 'Cahaya pribadi. Syarat menyalakan pelita.' },
  { id: 'campfire', nama: 'Api Unggun',    tier: 1, cost: { kayu: 10, batu: 5 }, desc: 'Letakkan dengan F. Hangat, cahaya, memasak.' },
  { id: 'cook',     nama: 'Makanan Matang',tier: 1, cost: { makanan: 1 }, nearFire: true, desc: 'Pulih jauh lebih banyak. Butuh dekat api.' },
  { id: 'axe2',     nama: 'Kapak Besi',    tier: 2, cost: { kayu: 3, besi: 6 }, npc: 'Neyra', desc: 'Menebang 3× lebih cepat.' },
  { id: 'pick2',    nama: 'Beliung Besi',  tier: 2, cost: { kayu: 3, besi: 6 }, npc: 'Neyra', desc: 'Syarat menambang bijih bintang.' },
  { id: 'sword',    nama: 'Pedang Besi',   tier: 2, cost: { kayu: 5, besi: 8 }, npc: 'Neyra', desc: 'Damage naik besar.' },
  { id: 'leather',  nama: 'Zirah Kulit',   tier: 2, cost: { kulit: 8 }, desc: '+25 HP maks, sedikit hangat.' },
  { id: 'sword2',   nama: 'Pedang Bara',   tier: 3, cost: { besi: 10, bintang: 3 }, npc: 'Neyra', desc: 'Damage besar & menyala dalam gelap.' },
  { id: 'plate',    nama: 'Zirah Lempeng', tier: 3, cost: { besi: 16, kulit: 4 }, npc: 'Neyra', desc: '+50 HP maks, gerak -10%.' },
  { id: 'coat',     nama: 'Mantel Bulu',   tier: 3, cost: { kulit: 10, kain: 4 }, desc: 'Syarat masuk Puncak Salju.' },
  { id: 'boat',     nama: 'Perahu',        tier: 3, cost: { kayu: 30, kain: 6 }, npc: 'Marsa', desc: 'Mengarungi perairan dangkal. Syarat Pelita Garam.' },
  { id: 'ring',     nama: 'Cincin Bijih Bintang', tier: 3, cost: { bintang: 3 }, npc: 'Neyra', desc: 'Untuk satu orang saja. Kamu tahu siapa.' },
  { id: 'house',    nama: 'Perluasan Rumah', tier: 3, cost: { kayu: 40, batu: 30, emas: 50 }, desc: 'Kamar kedua, tungku, atap baru. Syarat menikah.' },
];

var RES_LIST = ['kayu', 'batu', 'besi', 'bintang', 'makanan', 'masak', 'kulit', 'kain', 'bara', 'emas'];
var RES_NAMA = { kayu: 'Kayu', batu: 'Batu', besi: 'Besi', bintang: 'Bijih Bintang', makanan: 'Makanan', masak: 'Masakan', kulit: 'Kulit', kain: 'Kain', bara: 'Bara Pelita', emas: 'Emas' };

// state global game — satu sumber kebenaran
var G = {
  state: 'menu',          // menu | play | pause | dead | ending
  world: null, anchors: null,
  mode: 'JEJAK', diff: 'Standar', mods: {},
  time: { day: 1, t: 60 },   // mulai pagi hari pertama
  player: null, enemies: [], projectiles: [], fx: [], npcs: [],
  grave: null,            // {x, y, items}
  story: { lit: {}, married: null, hulanNamed: false, journal: [], houseUpgraded: false, spouseFollowing: false, endingSeen: null },
  rel: {}, relDay: {},    // trust per NPC, hari saat naik tingkat
  beacons: [],            // api unggun terdaftar [{x,y}]
  fog: null,              // Uint8Array 512*512
  seen: {},               // landmark ditemukan
  workedToday: {},        // npc -> day
  msg: [], camera: { x: 0, y: 0 },
};

// localStorage bisa dilarang (iframe sandbox / mode privat) — jangan pernah crash.
// Fallback ke memori: game tetap jalan, save hilang saat tab ditutup.
var LS = (function () {
  var mem = {};
  function ok() { try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; } catch (e) { return false; } }
  var usable = ok();
  return {
    persistent: usable,
    get: function (k) { if (usable) { try { return localStorage.getItem(k); } catch (e) {} } return mem[k] !== undefined ? mem[k] : null; },
    set: function (k, v) { if (usable) { try { localStorage.setItem(k, v); return; } catch (e) {} } mem[k] = v; },
    remove: function (k) { if (usable) { try { localStorage.removeItem(k); } catch (e) {} } delete mem[k]; },
  };
})();

function phaseOf(t) {
  if (t < CFG.PHASE.dawn[1]) return 'dawn';
  if (t < CFG.PHASE.day[1]) return 'day';
  if (t < CFG.PHASE.dusk[1]) return 'dusk';
  return 'night';
}
function isNight() { return phaseOf(G.time.t) === 'night'; }
function isDaytime() { var p = phaseOf(G.time.t); return p === 'day' || p === 'dawn'; }
function seasonOf(day) { return CFG.SEASONS[Math.floor((day - 1) / (G.mods.musimPanjang ? 24 : CFG.SEASON_DAYS)) % 4]; }
function toast(text, dur) { G.msg.push({ text: text, t: dur || 3.5 }); if (G.msg.length > 4) G.msg.shift(); }
