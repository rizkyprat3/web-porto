'use strict';
/* ============================================================
   OPEN WORLD ADVENTURE
   A 2D anime-style open-world RPG — vanilla JS + HTML5 Canvas
   ------------------------------------------------------------
   Systems: seamless tile world (5 zones), 20 NPCs (12 heroines),
   quests, friendship, fishing, shop, day/night, save/load.
   ============================================================ */

/* ================= tiny helpers ================= */
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const TAU = Math.PI * 2;

// Deterministic PRNG so the generated world is identical every run
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
// Stable per-tile noise for texture variation
const hash2 = (x, y) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ h >>> 13, 1274126177) | 0;
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
};
// Rounded-rect path helper
function rrect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/* ================= constants ================= */
const TILE = 32;
const MAP_W = 200, MAP_H = 150;
const WORLD_PW = MAP_W * TILE, WORLD_PH = MAP_H * TILE;

// Tile types
const T = { GRASS: 0, WATER: 1, SAND: 2, PATH: 3, ROCK: 4, WALL: 5, FOREST: 6, SECRET: 7, BRIDGE: 8 };

const DAY_LENGTH = 240;           // real seconds for a full 24h cycle
const HOURS_PER_SEC = 24 / DAY_LENGTH;

const FRIEND_THRESHOLDS = [0, 10, 25, 50, 80, 120]; // pts → level 0..5
const FRIEND_NAMES = ['Stranger', 'Acquaintance', 'Friend', 'Good Friend', 'Close Friend', 'Beloved'];

const ITEMS = {
  wood:     { name: 'Wood',     icon: '🪵', sell: 5 },
  stone:    { name: 'Stone',    icon: '🪨', sell: 6 },
  fish:     { name: 'Fish',     icon: '🐟', sell: 8 },
  flower:   { name: 'Flower',   icon: '🌸', sell: 4 },
  potion:   { name: 'Potion',   icon: '🧪', sell: 15, buy: 30, usable: true },
  treasure: { name: 'Treasure', icon: '💎', sell: 500 },
  package:  { name: 'Package',  icon: '📦', sell: 0 },
  book:     { name: 'Book',     icon: '📕', sell: 0 },
};

/* ================= global state ================= */
const cvs = $('game');
const ctx = cvs.getContext('2d');
let VW = 0, VH = 0;               // viewport size in px

const WORLD = {
  map: new Uint8Array(MAP_W * MAP_H),
  trees: [], houses: [], rocks: [], thorns: [], lamps: [],
  nodes: [], chests: [], fishSpots: [], deco: [], solids: [],
};

const cam = { x: 0, y: 0 };
const game = {
  started: false, paused: false,
  time: 8, day: 1,              // in-game clock (hours)
  autosaveT: 0, zone: '', lastHurt: -99,
};

let player = null;
let npcs = [];
let questState = {};             // id -> 'active' | 'done'
let friendship = {};             // npcId -> points
let talkCooldown = {};           // npcId -> real-time seconds of last friendship gain
let particles = [];
let fishing = null;              // { spot, phase:'wait'|'bite', t }
const keys = {};
let interactPressed = false;
let trackerDirty = true;

function makePlayer() {
  return {
    x: 75.5 * TILE, y: 78 * TILE,   // feet position (px), village plaza
    dir: 0,                          // 0 down, 1 left, 2 right, 3 up
    walk: 0, moving: false,
    hp: 100, hpMax: 100,
    st: 100, stMax: 100,
    coins: 20,
    inv: { wood: 0, stone: 0, fish: 0, flower: 0, potion: 1, treasure: 0, package: 0, book: 0 },
    spr: {
      skin: '#ffd9b8', hair: '#6b4a2f', style: 'spiky', eye: '#3d6b8f',
      outfit: { type: 'tunic', main: '#3f7d4e', accent: '#2c5738', pants: '#4a3b2f' },
      acc: 'headband', accColor: '#e8c05a', expr: 'happy',
    },
  };
}

/* ================= world generation ================= */
const tileAt = (tx, ty) => (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) ? T.WALL : WORLD.map[ty * MAP_W + tx];
const setTile = (tx, ty, t) => { if (tx >= 0 && ty >= 0 && tx < MAP_W && ty < MAP_H) WORLD.map[ty * MAP_W + tx] = t; };
const solidTile = t => t === T.WATER || t === T.WALL;

const inLake = (tx, ty) => {
  const dx = (tx - 40) / 20, dy = (ty - 112) / 14;
  return dx * dx + dy * dy <= 1;
};
const nearLake = (tx, ty) => {
  const dx = (tx - 40) / 23, dy = (ty - 112) / 17;
  return dx * dx + dy * dy <= 1;
};

function zoneAt(tx, ty) {
  if (tx >= 149 && tx <= 173 && ty >= 3 && ty <= 19) return '✨ Secret Grove';
  if (ty <= 30) return '🏔 Frostpeak Mountain';
  if (nearLake(tx, ty)) return '🌊 Crystal Lake';
  if (tx >= 125 && ty >= 35) return '🌲 Whispering Forest';
  if (tx >= 48 && tx <= 102 && ty >= 48 && ty <= 102) return '🏡 Sunhaven Village';
  return '🌿 Green Meadows';
}

function genWorld() {
  const rng = mulberry32(1337);
  const m = WORLD.map;
  m.fill(T.GRASS);

  /* --- Mountain (north band) --- */
  for (let ty = 0; ty <= 30; ty++)
    for (let tx = 0; tx < MAP_W; tx++) setTile(tx, ty, T.ROCK);
  // south ridge with a pass at tx 94..100
  for (let tx = 0; tx < MAP_W; tx++)
    for (let ty = 29; ty <= 30; ty++)
      if (tx < 94 || tx > 100) setTile(tx, ty, T.WALL);
  // random inner walls (skip the pass corridor and the carved routes)
  for (let ty = 3; ty < 27; ty++)
    for (let tx = 2; tx < MAP_W - 2; tx++) {
      if (tx >= 92 && tx <= 102) continue;            // pass corridor
      if (ty >= 7 && ty <= 12 && tx >= 16 && tx <= 150) continue; // east-west route to chest & secret
      if (rng() < 0.10) setTile(tx, ty, T.WALL);
    }
  // hard border walls all around the world
  for (let tx = 0; tx < MAP_W; tx++) { setTile(tx, 0, T.WALL); setTile(tx, 1, T.WALL); setTile(tx, MAP_H - 1, T.WALL); }
  for (let ty = 0; ty < MAP_H; ty++) { setTile(0, ty, T.WALL); setTile(1, ty, T.WALL); setTile(MAP_W - 1, ty, T.WALL); setTile(MAP_W - 2, ty, T.WALL); }

  /* --- Secret Grove (walled pocket inside the mountain) --- */
  for (let ty = 3; ty <= 19; ty++)
    for (let tx = 149; tx <= 173; tx++) {
      const border = tx === 149 || tx === 173 || ty === 3 || ty === 19;
      if (border && !(tx === 149 && (ty === 10 || ty === 11))) setTile(tx, ty, T.WALL);
      else setTile(tx, ty, T.SECRET);
    }
  setTile(148, 10, T.ROCK); setTile(148, 11, T.ROCK); // keep the entrance clear

  /* --- Forest (east) --- */
  for (let ty = 35; ty <= 140; ty++)
    for (let tx = 125; tx < MAP_W - 2; tx++) setTile(tx, ty, T.FOREST);

  /* --- Lake (southwest) --- */
  for (let ty = 90; ty < 135; ty++)
    for (let tx = 12; tx < 70; tx++) {
      if (inLake(tx, ty)) setTile(tx, ty, T.WATER);
      else if (nearLake(tx, ty)) setTile(tx, ty, T.SAND);
    }
  // wooden pier into the lake
  for (let ty = 99; ty <= 106; ty++) { setTile(44, ty, T.BRIDGE); setTile(45, ty, T.BRIDGE); }

  /* --- Paths --- */
  const path = (tx, ty) => { const t = tileAt(tx, ty); if (t === T.GRASS || t === T.FOREST || t === T.SAND) setTile(tx, ty, T.PATH); };
  for (let tx = 20; tx <= 170; tx++) { path(tx, 74); path(tx, 75); }          // main east-west road
  for (let ty = 33; ty <= 120; ty++) { path(74, ty); path(75, ty); }          // main north-south road
  for (let tx = 74; tx <= 100; tx++) { path(tx, 32); path(tx, 33); }          // road to the mountain pass
  for (let ty = 76; ty <= 98; ty++) { path(44, ty); path(45, ty); }           // road to the lake pier
  for (let ty = 68; ty <= 82; ty++) for (let tx = 68; tx <= 82; tx++) path(tx, ty); // village plaza

  /* --- Houses (village) --- */
  WORLD.houses = [
    { tx: 60, ty: 63, w: 6, h: 5, wall: '#efe0c0', roof: '#c0553d', label: 'Shop', awning: true },
    { tx: 83, ty: 63, w: 6, h: 5, wall: '#e7e2f0', roof: '#3d6ec0', label: 'Library' },
    { tx: 52, ty: 77, w: 5, h: 4, wall: '#e8d8b5', roof: '#8a9a3f', label: 'Farm' },
    { tx: 56, ty: 69, w: 4, h: 4, wall: '#cbb9a5', roof: '#555a66', label: 'Smithy' },
    { tx: 86, ty: 82, w: 5, h: 4, wall: '#f2ddc7', roof: '#d98a56', label: 'Tavern' },
    { tx: 64, ty: 86, w: 5, h: 4, wall: '#e5d5c8', roof: '#a05a78', label: '' },
    { tx: 78, ty: 86, w: 5, h: 4, wall: '#ddd8c4', roof: '#5a8a7a', label: '' },
    { tx: 68, ty: 52, w: 6, h: 3, wall: '#f0e6e6', roof: '#c03040', label: 'Shrine', shrine: true },
  ];
  for (const h of WORLD.houses)
    WORLD.solids.push({ x: h.tx * TILE, y: h.ty * TILE, w: h.w * TILE, h: h.h * TILE });

  /* --- Trees --- */
  const clearings = [
    [150, 70, 5], [168, 45, 4], [120, 60, 4], [190, 120, 4],   // NPC & chest clearings
  ];
  const inClearing = (tx, ty) => clearings.some(c => dist(tx, ty, c[0], c[1]) < c[2]);
  const nearPath = (tx, ty) => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++)
      if (tileAt(tx + dx, ty + dy) === T.PATH || tileAt(tx + dx, ty + dy) === T.BRIDGE) return true;
    return false;
  };
  for (let ty = 3; ty < MAP_H - 3; ty++)
    for (let tx = 3; tx < MAP_W - 3; tx++) {
      const t = tileAt(tx, ty);
      if (nearPath(tx, ty) || inClearing(tx, ty)) continue;
      let make = false, variant = 0;
      if (t === T.FOREST && rng() < 0.10) { make = true; variant = rng() < 0.85 ? 0 : 1; }
      else if (t === T.GRASS && rng() < 0.012 && (tx < 50 || tx > 100 || ty < 50 || ty > 100)) { make = true; variant = 0; }
      else if (t === T.ROCK && rng() < 0.025) { make = true; variant = 2; }   // mountain pines
      else if (t === T.SECRET && rng() < 0.06) { make = true; variant = 3; }  // glowing sakura
      if (make) {
        const tree = { x: tx * TILE + TILE / 2, y: ty * TILE + TILE - 4, variant, sway: rng() * TAU };
        WORLD.trees.push(tree);
        WORLD.solids.push({ x: tree.x - 9, y: tree.y - 10, w: 18, h: 10 });
      }
    }

  /* --- Mountain boulders + thorn bushes --- */
  for (let ty = 4; ty < 28; ty++)
    for (let tx = 4; tx < MAP_W - 4; tx++) {
      if (tileAt(tx, ty) === T.ROCK && rng() < 0.02 && !(tx >= 92 && tx <= 102)) {
        const r = { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2, s: 8 + rng() * 8 };
        WORLD.rocks.push(r);
        WORLD.solids.push({ x: r.x - r.s, y: r.y - r.s / 2, w: r.s * 2, h: r.s });
      }
    }
  for (let ty = 38; ty < 138; ty++)
    for (let tx = 128; tx < MAP_W - 4; tx++)
      if (tileAt(tx, ty) === T.FOREST && rng() < 0.012 && !nearPath(tx, ty) && !inClearing(tx, ty))
        WORLD.thorns.push({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 });

  /* --- Resource nodes --- */
  const addNodes = (type, count, ok) => {
    let placed = 0, guard = 0;
    while (placed < count && guard++ < 5000) {
      const tx = 3 + Math.floor(rng() * (MAP_W - 6));
      const ty = 3 + Math.floor(rng() * (MAP_H - 6));
      if (!ok(tx, ty)) continue;
      const px = tx * TILE + TILE / 2, py = ty * TILE + TILE / 2;
      if (WORLD.solids.some(s => px > s.x - 10 && px < s.x + s.w + 10 && py > s.y - 10 && py < s.y + s.h + 10)) continue;
      if (WORLD.nodes.some(n => dist(n.x, n.y, px, py) < 64)) continue;
      WORLD.nodes.push({ type, x: px, y: py, takenAt: -999 });
      placed++;
    }
  };
  addNodes('wood', 30, (tx, ty) => tileAt(tx, ty) === T.FOREST);
  addNodes('stone', 20, (tx, ty) => tileAt(tx, ty) === T.ROCK && ty < 28);
  addNodes('flower', 18, (tx, ty) => tileAt(tx, ty) === T.GRASS && tx > 36 && tx < 118 && ty > 46 && ty < 122);
  addNodes('potion', 6, (tx, ty) => {
    const t = tileAt(tx, ty);
    return (t === T.GRASS || t === T.FOREST || t === T.SECRET) && !(tx >= 55 && tx <= 95 && ty >= 55 && ty <= 95);
  });

  /* --- Treasure chests --- */
  WORLD.chests = [
    { id: 'mount',  x: 20.5 * TILE, y: 8.5 * TILE,  coins: 150, items: { potion: 2 }, opened: false },
    { id: 'secret', x: 162.5 * TILE, y: 10.5 * TILE, coins: 300, items: { treasure: 1, potion: 1 }, opened: false, big: true },
    { id: 'forest', x: 190.5 * TILE, y: 120.5 * TILE, coins: 80, items: { flower: 2 }, opened: false },
  ];
  for (const ch of WORLD.chests) WORLD.solids.push({ x: ch.x - 12, y: ch.y - 6, w: 24, h: 12 });

  /* --- Fishing spots (lake) --- */
  WORLD.fishSpots = [
    { x: 44.5 * TILE, y: 108.5 * TILE },   // end of the pier
    { x: 21 * TILE, y: 112 * TILE },       // west shore
    { x: 48 * TILE, y: 125 * TILE },       // south shore
  ];

  /* --- Lamps & decoration --- */
  WORLD.lamps = [
    { x: 68 * TILE, y: 68 * TILE }, { x: 82 * TILE, y: 68 * TILE },
    { x: 68 * TILE, y: 83 * TILE }, { x: 82 * TILE, y: 83 * TILE },
    { x: 75 * TILE, y: 93 * TILE }, { x: 45 * TILE, y: 98 * TILE },
    { x: 97 * TILE, y: 34 * TILE }, { x: 71 * TILE, y: 56 * TILE },
  ];
  for (const l of WORLD.lamps) WORLD.solids.push({ x: l.x - 3, y: l.y - 4, w: 6, h: 6 });
  WORLD.deco.push({ type: 'well', x: 71 * TILE, y: 71.5 * TILE });
  WORLD.solids.push({ x: 71 * TILE - 12, y: 71.5 * TILE - 10, w: 24, h: 14 });
  WORLD.deco.push({ type: 'torii', x: 71 * TILE, y: 58 * TILE });

  /* --- keep NPC home tiles clear of randomly generated walls --- */
  for (const def of NPC_DEFS)
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const tx = def.tx + dx, ty = def.ty + dy;
        if (tx > 2 && ty > 2 && tx < MAP_W - 3 && ty < MAP_H - 3 && tileAt(tx, ty) === T.WALL)
          setTile(tx, ty, ty <= 30 ? T.ROCK : T.GRASS);
      }
}

/* ================= collision ================= */
function rectHitsSolid(x, y, w, h) {
  // tile collision
  const tx0 = Math.floor(x / TILE), ty0 = Math.floor(y / TILE);
  const tx1 = Math.floor((x + w) / TILE), ty1 = Math.floor((y + h) / TILE);
  for (let ty = ty0; ty <= ty1; ty++)
    for (let tx = tx0; tx <= tx1; tx++)
      if (solidTile(tileAt(tx, ty))) return true;
  // static object collision
  for (const s of WORLD.solids)
    if (x < s.x + s.w && x + w > s.x && y < s.y + s.h && y + h > s.y) return true;
  return false;
}

// Entity feet hitbox: 16x10 centered under (x, y)
function tryMove(ent, dx, dy) {
  const HW = 8, HH = 10;
  if (dx !== 0 && !rectHitsSolid(ent.x - HW + dx, ent.y - HH, HW * 2, HH)) ent.x += dx;
  if (dy !== 0 && !rectHitsSolid(ent.x - HW, ent.y - HH + dy, HW * 2, HH)) ent.y += dy;
}

/* ================= NPC roster =================
   spr: skin, hair color, hairstyle, eye color, outfit, accessory, expression
   lines: dialogue per friendship tier 0..3 (higher levels reuse tier 3)   */
const NPC_DEFS = [
  /* ---------- Sunhaven Village (the heroines) ---------- */
  {
    id: 'hana', name: 'Hana', role: 'Cheerful Village Girl', gender: 'f', personality: 'Sunny & energetic',
    tx: 72, ty: 78, wander: 3,
    spr: { skin: '#ffdcc2', hair: '#8a5a3a', style: 'twintails', eye: '#4a8a3f', outfit: { type: 'dress', main: '#ff8fb3', accent: '#fff0f5' }, acc: 'ribbon', accColor: '#ff4f7e', expr: 'happy' },
    quest: 'q_hana',
    lines: {
      0: ["Oh! A new face in Sunhaven! Hi hi, I'm Hana! ♪", "You should look around the plaza — everyone here is super friendly!"],
      1: ["You're back! I was juuust thinking about you. Really!", "Did you know the lake sparkles at sunset? We should watch it sometime!"],
      2: ["Hehe, you're basically a villager now. I decided. No refunds!", "When you're around, even chores feel like an adventure!"],
      3: ["Honestly... Sunhaven felt small before you arrived. Now it feels just right.", "Promise you'll always come back from your adventures, okay? Pinky promise!"],
    },
  },
  {
    id: 'seraphina', name: 'Seraphina', role: 'Elegant Merchant Lady', gender: 'f', personality: 'Graceful & shrewd',
    tx: 62, ty: 70, wander: 2, shop: true,
    spr: { skin: '#ffe3cf', hair: '#7a4fbf', style: 'long', eye: '#9a5fd0', outfit: { type: 'dress', main: '#5b3a8e', accent: '#e8c05a' }, acc: 'hairpin', accColor: '#ffd166', expr: 'smug' },
    quest: 'q_deliver',
    lines: {
      0: ["Welcome to my boutique, traveler. Finest goods in three regions~", "Everything has a price. Fortunately for you, mine are fair. Mostly."],
      1: ["Ah, my favorite customer returns. I saved something nice for you... perhaps.", "A merchant remembers every face. Yours, I remember fondly."],
      2: ["Between us? I give you my *actual* fair prices now. Don't tell the others.", "You have a good eye. Ever considered a life of commerce?"],
      3: ["Gold is lovely, but rare things are lovelier. You, dear, are quite rare.", "One day I'll show you my private collection. Only my dearest may see it."],
    },
  },
  {
    id: 'miko', name: 'Miko', role: 'Calm Shrine Maiden', gender: 'f', personality: 'Serene & wise',
    tx: 70, ty: 57, wander: 2,
    spr: { skin: '#ffe8d8', hair: '#2a2a3a', style: 'hime', eye: '#b04a5a', outfit: { type: 'miko', main: '#e8e2da', accent: '#d03a4a' }, acc: 'ribbonback', accColor: '#d03a4a', expr: 'gentle' },
    quest: 'q_potion',
    lines: {
      0: ["Welcome to the shrine. May the spirits watch over your journey.", "Take a breath. The world moves gently here."],
      1: ["The spirits speak kindly of you. That is... uncommon.", "I prayed for your safety this morning. I hope you do not mind."],
      2: ["Sit with me a while. Even heroes need stillness.", "The wind changes when you arrive. A warm wind. I like it."],
      3: ["I once served only the spirits. Now my prayers hold your name too.", "Whatever storm may come... I will be your calm, if you'll have me."],
    },
  },
  {
    id: 'elise', name: 'Elise', role: 'Smart Librarian', gender: 'f', personality: 'Bookish & curious',
    tx: 85, ty: 70, wander: 2,
    spr: { skin: '#ffe3cf', hair: '#b8743f', style: 'bun', eye: '#3f6ab8', outfit: { type: 'dress', main: '#4a6a8f', accent: '#f0ead8' }, acc: 'glasses', accColor: '#333', expr: 'gentle' },
    quest: 'q_book',
    lines: {
      0: ["Shh— oh, pardon, habit. Welcome to the library. Do you read?", "Every answer you seek is written somewhere. Finding it is the adventure."],
      1: ["I set aside a book on local legends for you. Page 42 is... interesting.", "You ask better questions than most. I appreciate that."],
      2: ["I read about faraway places, but you actually go. Tell me everything!", "My research says the mountain hides more than snow. Do be careful."],
      3: ["I used to prefer books to people. You are the exception that rewrote my thesis.", "Someday, someone will write a book about you. I'd like to be its author."],
    },
  },
  {
    id: 'sakura', name: 'Sakura', role: 'Flower Shop Girl', gender: 'f', personality: 'Sweet & shy',
    tx: 66, ty: 82, wander: 2,
    spr: { skin: '#ffe8dc', hair: '#f0a0c0', style: 'braid', eye: '#d06a8a', outfit: { type: 'dress', main: '#f8c8d8', accent: '#fff' }, acc: 'flower', accColor: '#ff7fa8', expr: 'shy' },
    quest: 'q_flower',
    lines: {
      0: ["O-oh, hello! Would you... maybe like a flower? No pressure!", "Flowers grow best when spoken to kindly. People too, I think."],
      1: ["You came back! I, um, saved the prettiest bloom for you today.", "The meadows past the village are full of wildflowers. It's my favorite walk."],
      2: ["Talking with you is easy now. That's... very new for me. Thank you.", "I named a new flower breed today. Its name is a secret. (It's yours.)"],
      3: ["In flower language, camellia means 'my destiny is in your hands'... a-anyway!!", "When you're near, I don't feel shy. Just... warm. Like sunlight on petals."],
    },
  },
  {
    id: 'aurelia', name: 'Aurelia', role: 'Noble Princess', gender: 'f', personality: 'Regal & secretly kind',
    tx: 78, ty: 68, wander: 2,
    spr: { skin: '#ffeede', hair: '#f2d16b', style: 'longwavy', eye: '#4f7fd0', outfit: { type: 'gown', main: '#f0f0fa', accent: '#c9a227' }, acc: 'crown', accColor: '#ffd166', expr: 'cool' },
    quest: 'q_aurelia',
    lines: {
      0: ["You may address me as Princess Aurelia. ...Yes, a *real* princess, thank you.", "I am observing how the common folk live. It is called 'research'."],
      1: ["Ah. You again. I suppose your company is... acceptable.", "At the palace, no one speaks honestly to me. Here, everyone does. It's refreshing."],
      2: ["Don't bow. Friends need not bow. ...We are friends, are we not?", "I snuck out again. If the royal guard asks, you saw nothing."],
      3: ["A princess must one day choose her own court. I would choose people like you.", "Titles are heavy. With you, I am simply Aurelia. That is my favorite version of me."],
    },
  },
  /* ---------- Sunhaven Village (townsfolk) ---------- */
  {
    id: 'tom', name: 'Farmer Tom', role: 'Farmer', gender: 'm', personality: 'Hard-working',
    tx: 54, ty: 82, wander: 3,
    spr: { skin: '#f0c8a0', hair: '#7a5a3a', style: 'short', eye: '#5a4a3a', outfit: { type: 'tunic', main: '#8a6f4a', accent: '#6a543a', pants: '#4f4234' }, acc: 'strawhat', accColor: '#e0c060', expr: 'happy' },
    quest: 'q_wood',
    lines: {
      0: ["Howdy! Fields don't plow themselves, but I can spare a minute.", "Good soil, good folk — that's Sunhaven for ya."],
      1: ["Back again? Ha! You've got a farmer's persistence.", "Crops are coming in nice this season. Rain's been kind."],
      2: ["You ever want a plot of land, I'll teach ya everything I know.", "My scarecrow's named Gerald. Don't ask. Long story."],
      3: ["You're good people. Salt of the earth. And I know my earth!", "Harvest festival ain't the same without you around, friend."],
    },
  },
  {
    id: 'garrett', name: 'Garrett', role: 'Village Guard', gender: 'm', personality: 'Stern but fair',
    tx: 75, ty: 91, wander: 1,
    spr: { skin: '#e8b890', hair: '#3a3a42', style: 'short', eye: '#4a4a55', outfit: { type: 'armor', main: '#8a90a0', accent: '#5a6070', pants: '#3f4450' }, acc: 'helmet', accColor: '#9aa0b0', expr: 'serious' },
    quest: null,
    lines: {
      0: ["Halt— ah, you're the newcomer. Move along, stay out of trouble.", "South gate's my post. Nothing gets past me. Except cats. Cats do."],
      1: ["You again. Hmph. At least you're polite.", "Watch the forest thorns. I'm not carrying you back if you get scratched."],
      2: ["Truth is, guard duty's dull. Your stories are the highlight of my week.", "You handle yourself well. Ever consider joining the watch?"],
      3: ["I don't say this lightly: I'd stand beside you in any fight.", "You've earned this village's trust. And mine. That's harder to get."],
    },
  },
  {
    id: 'theo', name: 'Old Theo', role: 'Village Elder', gender: 'm', personality: 'Mysterious storyteller',
    tx: 80, ty: 80, wander: 1,
    spr: { skin: '#eec8a8', hair: '#e8e8e8', style: 'elder', eye: '#5a6a7a', outfit: { type: 'robe', main: '#6a5a8a', accent: '#c9b26a' }, acc: null, expr: 'gentle' },
    quest: 'q_treasure',
    lines: {
      0: ["Ah... a wanderer. Sit, sit. Old Theo has seen many like you. Well. A few.", "These bones remember when the mountain still whispered secrets."],
      1: ["Back for more stories? Good. Stories die if no one listens.", "They say a hidden grove lies where the peaks bend east... or was it west?"],
      2: ["You listen well. That is rarer than any treasure. ...Speaking of treasure...", "The old paths reward the curious. And punish the careless. Heh heh."],
      3: ["I've told you tales all winter. You, child, are becoming one worth telling.", "When I'm gone, remember the stories. That is how old men live forever."],
    },
  },
  {
    id: 'bram', name: 'Bram', role: 'Blacksmith', gender: 'm', personality: 'Gruff & warm-hearted',
    tx: 58, ty: 74, wander: 1,
    spr: { skin: '#d8a880', hair: '#8a4a2a', style: 'short', eye: '#4a3a2a', outfit: { type: 'tunic', main: '#5a4a42', accent: '#3a2f2a', pants: '#33291f' }, acc: null, expr: 'serious' },
    quest: null,
    lines: {
      0: ["Forge's hot, talk fast. ...Kidding. Mostly. What d'you need?", "Steel doesn't lie. People could learn from steel."],
      1: ["Hmph. You keep showing up. Guess you're alright.", "Freya up the mountain buys my best blades. Woman's got taste."],
      2: ["Here's a trade secret: it's all in the cooling. Don't tell the city smiths.", "Your gear could use work. Bring me good stone sometime."],
      3: ["I don't smile much. But you make it harder not to.", "Anything you carry into danger, let me forge it. Family discount."],
    },
  },
  {
    id: 'remy', name: 'Chef Remy', role: 'Tavern Chef', gender: 'm', personality: 'Passionate foodie',
    tx: 88, ty: 81, wander: 2,
    spr: { skin: '#f0cfae', hair: '#4a342a', style: 'short', eye: '#5a4a3a', outfit: { type: 'tunic', main: '#f0f0f0', accent: '#d0d0d0', pants: '#3a3a44' }, acc: 'chefhat', accColor: '#ffffff', expr: 'happy' },
    quest: null,
    lines: {
      0: ["Welcome, welcome! You look hungry. Everyone looks hungry to me.", "Tonight's special: lake fish with meadow herbs. *Chef's kiss*"],
      1: ["My friend! Sit! Eat! No arguments in my tavern, only seconds.", "Fresh fish makes the dish. Nami brings me the best catches."],
      2: ["I shall name a dish after you. Something bold. With garlic.", "The secret ingredient is— no no, you must earn that knowledge."],
      3: ["You, my friend, have the palate of a poet. Marry into my family. I have cousins.", "The secret ingredient... is patience. And also butter. Mostly butter."],
    },
  },
  {
    id: 'milo', name: 'Milo', role: 'Wandering Bard', gender: 'm', personality: 'Dramatic & cheerful',
    tx: 74, ty: 72, wander: 3,
    spr: { skin: '#ffdcc2', hair: '#c88a3a', style: 'wavy', eye: '#7a5fd0', outfit: { type: 'tunic', main: '#7a4fbf', accent: '#e8c05a', pants: '#4a3a6a' }, acc: 'cap', accColor: '#5b3a8e', expr: 'happy' },
    quest: null,
    lines: {
      0: ["🎵 A stranger strolls to Sunhaven's heart~ ...I improvise. Constantly.", "Every hero needs a bard! I volunteer. Fees negotiable."],
      1: ["Ah, my muse returns! I've written two ballads about you. One rhymes.", "The plaza acoustics are magnificent. The pigeons disagree."],
      2: ["Your legend grows! Verse three now features a dragon. Artistic license.", "Between songs — you're the most interesting tale this town's had in years."],
      3: ["Forget the ballads. Your friendship is the finest song I know. 🎵", "When bards sing of this era, I'll make sure they sing it right."],
    },
  },
  {
    id: 'oliver', name: 'Oliver', role: 'Village Kid', gender: 'm', personality: 'Hyper & adventurous',
    tx: 70, ty: 85, wander: 4,
    spr: { skin: '#ffdcc2', hair: '#5a3a2a', style: 'spiky', eye: '#4a8a3f', outfit: { type: 'tunic', main: '#e05561', accent: '#a03a44', pants: '#3a4a6a' }, acc: null, expr: 'happy', small: true },
    quest: null,
    lines: {
      0: ["Whoa!! Are you a REAL adventurer?! Do you fight dragons?! Can I see?!", "I'm gonna explore the WHOLE map someday. Mom says after dinner."],
      1: ["Teach me a hero move! Just one! I won't tell mom!", "I found a frog yesterday. His name is Sir Hoppington. He's my squire."],
      2: ["When I grow up I wanna be exactly like you! But taller!", "I drew you fighting a monster! The monster is losing SO bad!"],
      3: ["You're my hero. Like, for real. Don't tell the other kids I said that!", "Someday we'll go on a quest together, right? RIGHT?! Promise!!"],
    },
  },
  /* ---------- Forest ---------- */
  {
    id: 'sylvia', name: 'Sylvia', role: 'Forest Guardian', gender: 'f', personality: 'Mysterious & gentle',
    tx: 150, ty: 70, wander: 2,
    spr: { skin: '#f5e0d0', hair: '#3f8a5f', style: 'longwavy', eye: '#5fd08a', outfit: { type: 'dress', main: '#2f6a4a', accent: '#a8e0b8' }, acc: 'leaf', accColor: '#7fd08f', expr: 'cool' },
    quest: 'q_sylvia',
    lines: {
      0: ["Few humans walk this deep. The trees told me you were coming.", "Step lightly, traveler. The forest remembers every footfall."],
      1: ["You return, and the birds do not scatter. Interesting.", "Listen... beyond the peaks, north and east, stone hides a gap only the patient find."],
      2: ["The forest has accepted you. I confess... so have I.", "The secret grove blooms for kind hearts. Seek the mountain's eastern hollow."],
      3: ["I have guarded these woods alone for a long time. 'Alone' feels different now.", "If ever you are lost, whisper to the leaves. I will hear. I will come."],
    },
  },
  {
    id: 'rin', name: 'Rin', role: 'Energetic Adventurer', gender: 'f', personality: 'Bold & competitive',
    tx: 120, ty: 60, wander: 4,
    spr: { skin: '#ffd8b8', hair: '#e86a3a', style: 'sidepony', eye: '#e8a03a', outfit: { type: 'tunic', main: '#d0503a', accent: '#f0c05a', pants: '#5a4a3a' }, acc: 'headband', accColor: '#f0c05a', expr: 'happy' },
    quest: 'q_rin',
    lines: {
      0: ["Yo! Another adventurer? Finally! Everyone here just *farms*.", "Race you to the lake! Kidding. Unless...?"],
      1: ["Heya rival! Found anything cool? I found three caves and a very angry goose.", "The mountain's the real challenge. Terrain's rough — pack stamina!"],
      2: ["Okay, you're officially my rival-slash-best-friend. Rival-friend. Frival!", "Someday we tackle the peak together. Deal? Deal. No take-backs!"],
      3: ["Real talk? Exploring alone was getting lonely. Glad it's 'us' now.", "You're the only one who keeps up with me. Don't you dare stop."],
    },
  },
  {
    id: 'luna', name: 'Luna', role: 'Mage of the Glade', gender: 'f', personality: 'Dreamy & brilliant',
    tx: 168, ty: 45, wander: 2,
    spr: { skin: '#f8e8e0', hair: '#8a7fd8', style: 'long', eye: '#b48fe8', outfit: { type: 'robe', main: '#3a3568', accent: '#c9a7ff' }, acc: 'witchhat', accColor: '#2a2650', expr: 'gentle' },
    quest: null,
    lines: {
      0: ["Oh! A visitor. I was just... talking to the moths. They're good listeners.", "Magic is only organized curiosity. I am *very* organized. Sometimes."],
      1: ["Stardust readings say you'll do something important. Or eat something important.", "Elise sends me books. If you see her, tell her chapter nine changed my life."],
      2: ["I enchanted a pebble to glow when you're near. For science. Obviously.", "The night sky over the forest is my laboratory. Come stargaze sometime."],
      3: ["Every spell needs a focus. Lately... my spells keep focusing on you.", "The moths approve of you. That's the highest honor I can bestow."],
    },
  },
  /* ---------- Lake ---------- */
  {
    id: 'nami', name: 'Nami', role: 'Playful Fisher Girl', gender: 'f', personality: 'Teasing & free-spirited',
    tx: 43, ty: 97, wander: 2,
    spr: { skin: '#ffd8b8', hair: '#3a7fd0', style: 'bob', eye: '#3ab0d0', outfit: { type: 'tunic', main: '#f0f0e0', accent: '#3a7fd0', pants: '#3a5a7a' }, acc: 'strawhat', accColor: '#e8d080', expr: 'happy' },
    quest: 'q_fish',
    lines: {
      0: ["New face! Do you fish? No? Tragic. I'll fix that. Grab a line at the pier!", "Rule one of Crystal Lake: the fish hear EVERYTHING. Be cool."],
      1: ["Heyy, it's my favorite landlubber! The fish were asking about you.", "Press E by the water and wait for the '!' — then strike! Easy. Ish."],
      2: ["You've got fisher's patience now. I'm genuinely proud. And a little smug.", "Sunset fishing is best fishing. The lake turns to gold. Meet me here?"],
      3: ["The lake's big, but honestly? More fun since you showed up.", "I tell the fish about you. Good things. Mostly. Hehe~"],
    },
  },
  {
    id: 'finn', name: 'Finn', role: 'Old Fisherman', gender: 'm', personality: 'Patient & calm',
    tx: 52, ty: 105, wander: 2,
    spr: { skin: '#e0b088', hair: '#c8c8c8', style: 'short', eye: '#4a6a7a', outfit: { type: 'tunic', main: '#4a6a5a', accent: '#3a5548', pants: '#3f4a42' }, acc: 'cap', accColor: '#3a5a4a', expr: 'gentle' },
    quest: null,
    lines: {
      0: ["Forty years I've fished this lake. She still surprises me.", "The water teaches patience. Free lessons, every day."],
      1: ["Back again? The lake likes familiar faces.", "Nami's the best angler I ever taught. Don't tell her — hat's big enough."],
      2: ["Some days you catch fish. Some days you catch peace. Both feed you.", "Deep center of the lake... old nets come up torn. Something big lives down there."],
      3: ["You've got still water in you now. That's the highest praise I know.", "When I hang up my rod, someone should watch this lake. I nominate you."],
    },
  },
  /* ---------- Mountain ---------- */
  {
    id: 'freya', name: 'Freya', role: 'Warrior Woman', gender: 'f', personality: 'Fierce & honorable',
    tx: 96, ty: 33, wander: 2,
    spr: { skin: '#f0c8a8', hair: '#c03a3a', style: 'ponytail', eye: '#d05a3a', outfit: { type: 'armor', main: '#a05a5a', accent: '#e0c060', pants: '#5a3a3a' }, acc: null, expr: 'serious' },
    quest: 'q_stone',
    lines: {
      0: ["Hold. The mountain is no stroll, traveler. Rough ground drains the legs.", "I guard this pass. Bandits fear my name. You may simply use 'Freya'."],
      1: ["You climb well for a lowlander. That is a compliment. I give few.", "Bram's steel is the only steel I trust. Good smith, that one."],
      2: ["Spar with me someday. I promise to hold back. ...Sixty percent.", "Strength is not the arm. It is showing up again. You show up."],
      3: ["I have fought beside many. Few I would call shield-kin. You, I would.", "The mountain respects you now. So does its guardian."],
    },
  },
  {
    id: 'yuki', name: 'Yuki', role: 'Snow Herbalist', gender: 'f', personality: 'Soft-spoken & kind',
    tx: 60, ty: 13, wander: 2,
    spr: { skin: '#fdf0e8', hair: '#e8ecf5', style: 'hime', eye: '#7aa0d8', outfit: { type: 'dress', main: '#b8d0e8', accent: '#f0f5fa' }, acc: 'scarf', accColor: '#d05a6a', expr: 'shy' },
    quest: null,
    lines: {
      0: ["Oh... a visitor, up here? The cold usually keeps everyone away.", "I gather snow herbs. They only bloom where the air bites."],
      1: ["You came back... through all that rock and wind? For a chat? ...I'm glad.", "There's an old chest west of here, past the boulders. The miners left it, I think."],
      2: ["I made you warm tea. I... may have made it every day, just in case.", "The mountain is quiet, but it's a gentle quiet. Like you."],
      3: ["Winter up here used to feel endless. Your visits... they feel like spring.", "Snow melts. Seasons turn. Some warmth stays. Yours stayed."],
    },
  },
];

/* ================= quests ================= */
const QUESTS = {
  q_wood: {
    giver: 'tom', title: 'Timber Trouble', type: 'collect', items: { wood: 5 },
    desc: 'Gather 5 wood from the Whispering Forest for Tom\'s fence.',
    intro: "My fence is more hole than fence! Fetch me 5 wood from the forest east of here, and I'll pay honest coin.",
    reward: { coins: 50 },
  },
  q_fish: {
    giver: 'nami', title: 'Fresh Catch', type: 'collect', items: { fish: 3 },
    desc: 'Catch 3 fish at Crystal Lake.',
    intro: "Chef Remy ordered three fish and my arms are nooodles today. Catch 3 for me? I'll make it worth your while~",
    reward: { coins: 60, items: { potion: 1 } },
  },
  q_deliver: {
    giver: 'seraphina', title: 'Special Delivery', type: 'deliver', item: 'package', to: 'garrett',
    desc: 'Deliver Seraphina\'s package to Garrett at the south gate.',
    intro: "A package for Garrett at the south gate — new whetstones, terribly heavy, terribly boring. Deliver it for me, would you, dear?",
    reward: { coins: 80 },
  },
  q_stone: {
    giver: 'freya', title: 'Stone for the Forge', type: 'collect', items: { stone: 5 },
    desc: 'Gather 5 stone from Frostpeak Mountain.',
    intro: "Bram needs mountain stone for my new blade. Bring 5 chunks from the peaks. Mind the rough ground — pace your stamina.",
    reward: { coins: 40, stMax: 20 },
  },
  q_flower: {
    giver: 'sakura', title: 'Blooming Business', type: 'collect', items: { flower: 4 },
    desc: 'Pick 4 wildflowers from the meadows.',
    intro: "A big order came in and my garden's bare! Could you pick 4 wildflowers from the meadows? I'd be so grateful!",
    reward: { coins: 45 },
  },
  q_book: {
    giver: 'elise', title: 'Overdue Delivery', type: 'deliver', item: 'book', to: 'luna',
    desc: 'Deliver the spellbook to Luna in the forest glade.',
    intro: "Luna's spellbook arrived — 'Applied Moonlight, Vol. III'. She lives in the forest glade, north-east. Books hate rain, so do hurry.",
    reward: { coins: 70 },
  },
  q_potion: {
    giver: 'miko', title: 'Herbal Offering', type: 'collect', items: { potion: 2 },
    desc: 'Bring 2 potions to Miko for the shrine ritual.',
    intro: "The autumn ritual requires two potions as an offering. Bottles rest in wild places... or Seraphina sells them, if your purse allows.",
    reward: { coins: 90 },
  },
  q_treasure: {
    giver: 'theo', title: 'The Lost Treasure', type: 'collect', items: { treasure: 1 },
    desc: 'Find the legendary treasure hidden in a secret place.',
    intro: "Legend speaks of a treasure in a grove hidden by stone. East through the peaks, where the rocks leave a gap... find it, and half the tale is yours!",
    reward: { coins: 250 },
  },
  /* friendship-locked quests (level 2+) */
  q_hana: {
    giver: 'hana', needLv: 2, title: "Hana's Picnic", type: 'collect', items: { fish: 2, flower: 2 },
    desc: 'Bring 2 fish and 2 flowers for the picnic.',
    intro: "Picnic time!! I'm inviting EVERYONE. I need 2 fish and 2 flowers for the baskets — help me out, bestie?",
    reward: { coins: 120 },
  },
  q_aurelia: {
    giver: 'aurelia', needLv: 2, title: "The Princess's Request", type: 'collect', items: { flower: 3, fish: 2 },
    desc: 'Gather 3 flowers and 2 fish for a royal banquet.',
    intro: "I wish to host a banquet — a *common* one, with real food and real people. I require 3 flowers and 2 fish. Discreetly, of course.",
    reward: { coins: 150 },
  },
  q_rin: {
    giver: 'rin', needLv: 2, title: 'Rival Supply Run', type: 'collect', items: { wood: 3, stone: 3 },
    desc: 'Collect 3 wood and 3 stone for Rin\'s base camp.',
    intro: "I'm building a base camp — HQ of Team Frival! Bring 3 wood and 3 stone and you get naming rights to the flag. Maybe.",
    reward: { coins: 110, stMax: 15 },
  },
  q_sylvia: {
    giver: 'sylvia', needLv: 2, title: 'Gift of the Grove', type: 'collect', items: { flower: 5 },
    desc: 'Bring 5 flowers as an offering to the forest.',
    intro: "The forest gives much and asks little. Bring five meadow flowers as an offering, and the woods will remember your kindness.",
    reward: { coins: 130 },
  },
};

/* ================= NPC runtime ================= */
let NPC_BY_ID = {};
function initNPCs() {
  npcs = NPC_DEFS.map(def => ({
    def,
    x: def.tx * TILE + TILE / 2, y: def.ty * TILE + TILE / 2,
    homeX: def.tx * TILE + TILE / 2, homeY: def.ty * TILE + TILE / 2,
    targetX: def.tx * TILE + TILE / 2, targetY: def.ty * TILE + TILE / 2,
    dir: 0, walk: 0, moving: false, pauseT: 1 + Math.random() * 3,
  }));
  NPC_BY_ID = {};
  for (const n of npcs) NPC_BY_ID[n.def.id] = n;
}

function friendLevel(id) {
  const pts = friendship[id] || 0;
  let lv = 0;
  for (let i = 0; i < FRIEND_THRESHOLDS.length; i++) if (pts >= FRIEND_THRESHOLDS[i]) lv = i;
  return lv;
}

function updateNPCs(dt) {
  for (const n of npcs) {
    if (dialog.npc === n) { n.moving = false; continue; }  // freeze while talking
    if (n.pauseT > 0) {
      n.pauseT -= dt; n.moving = false;
      if (n.pauseT <= 0) {
        // pick a new wander target near home
        const r = n.def.wander * TILE;
        const a = Math.random() * TAU;
        const d = Math.random() * r;
        n.targetX = n.homeX + Math.cos(a) * d;
        n.targetY = n.homeY + Math.sin(a) * d;
      }
      continue;
    }
    const dx = n.targetX - n.x, dy = n.targetY - n.y;
    const d = Math.hypot(dx, dy);
    if (d < 3) { n.pauseT = 2 + Math.random() * 4; n.moving = false; continue; }
    const sp = 38 * dt;
    const mx = dx / d * sp, my = dy / d * sp;
    const ox = n.x, oy = n.y;
    tryMove(n, mx, my);
    if (Math.abs(n.x - ox) < 0.01 && Math.abs(n.y - oy) < 0.01) { n.pauseT = 1.5; n.moving = false; continue; }
    n.moving = true; n.walk += dt * 8;
    n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
  }
}

/* ================= input ================= */
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (k === 'escape') { e.preventDefault(); togglePause(); }
  if (!game.started || game.paused) return;
  if (k === 'e' || k === 'enter' || k === ' ') {
    e.preventDefault();
    if (dialog.npc) advanceDialog();
    else interactPressed = true;
  }
  if (k === 'i') toggleInventory();
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

const now = () => performance.now() / 1000;

/* ================= toasts ================= */
function toast(msg, gold) {
  const el = document.createElement('div');
  el.className = 'toast' + (gold ? ' gold' : '');
  el.innerHTML = msg;
  $('toasts').appendChild(el);
  setTimeout(() => el.classList.add('fadeout'), 2600);
  setTimeout(() => el.remove(), 3200);
}

/* ================= player update ================= */
function updatePlayer(dt) {
  const p = player;
  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;

  const wantSprint = (keys['shift']) && (dx || dy);
  const sprinting = wantSprint && p.st > 1;
  let speed = sprinting ? 245 : 150;

  // rough mountain terrain slows you down and tires you faster
  const tHere = tileAt(Math.floor(p.x / TILE), Math.floor(p.y / TILE));
  const onRough = tHere === T.ROCK;
  if (onRough) speed *= 0.68;

  if (dx || dy) {
    const inv = 1 / Math.hypot(dx, dy);
    const cancelFish = fishing && (dx || dy);
    if (cancelFish) stopFishing(false);
    tryMove(p, dx * inv * speed * dt, dy * inv * speed * dt);
    p.moving = true;
    p.walk += dt * (sprinting ? 13 : 9);
    p.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
    if (sprinting && Math.random() < 0.35) spawnParticle('dust', p.x, p.y);
  } else {
    p.moving = false;
  }

  // stamina
  if (sprinting) p.st = Math.max(0, p.st - dt * (onRough ? 26 : 16));
  else p.st = Math.min(p.stMax, p.st + dt * 12);
  if (onRough && p.moving && !sprinting) p.st = Math.max(0, p.st - dt * 3);

  // slow health regen when out of combat
  if (now() - game.lastHurt > 8) p.hp = Math.min(p.hpMax, p.hp + dt * 2.5);

  // thorn bushes hurt
  if (now() - game.lastHurt > 1.2) {
    for (const th of WORLD.thorns) {
      if (dist(p.x, p.y - 6, th.x, th.y) < 16) {
        game.lastHurt = now();
        p.hp -= 8;
        const kx = p.x - th.x, ky = p.y - th.y, kd = Math.hypot(kx, ky) || 1;
        tryMove(p, kx / kd * 20, ky / kd * 20);
        $('flash').classList.add('on');
        setTimeout(() => $('flash').classList.remove('on'), 180);
        toast('🌵 Ouch! Thorns! <b>-8 HP</b>');
        if (p.hp <= 0) faint();
        break;
      }
    }
  }
}

function faint() {
  toast('💫 You fainted and woke up at the plaza...');
  player.hp = 50; player.st = 30;
  player.x = 75.5 * TILE; player.y = 78 * TILE;
  stopFishing(false);
}

/* ================= fishing ================= */
function startFishing(spot) {
  fishing = { spot, phase: 'wait', t: 1.5 + Math.random() * 2.2 };
  toast('🎣 Fishing... wait for the <b>!</b> then press <b>E</b>');
}
function stopFishing(caught) {
  if (!fishing) return;
  if (!caught && fishing.phase === 'bite') toast('💨 It got away...');
  fishing = null;
}
function updateFishing(dt) {
  if (!fishing) return;
  fishing.t -= dt;
  if (fishing.phase === 'wait') {
    if (Math.random() < dt * 2) spawnParticle('ripple', fishing.spot.x, fishing.spot.y);
    if (fishing.t <= 0) { fishing.phase = 'bite'; fishing.t = 0.9; }
  } else if (fishing.t <= 0) {
    stopFishing(false);
  }
}
function fishingStrike() {
  if (!fishing) return;
  if (fishing.phase === 'bite') {
    player.inv.fish++;
    toast(`🐟 Caught a fish! <b>Fish ×${player.inv.fish}</b>`, true);
    for (let i = 0; i < 6; i++) spawnParticle('sparkle', fishing.spot.x, fishing.spot.y);
    trackerDirty = true;
    fishing = null;
    renderInventory();
  } else {
    stopFishing(false); // struck too early
    toast('💨 Too early! The fish spooked.');
  }
}

/* ================= interaction ================= */
function findInteractable() {
  const p = player;
  // NPCs first
  let best = null, bestD = 46;
  for (const n of npcs) {
    const d = dist(p.x, p.y, n.x, n.y);
    if (d < bestD) { bestD = d; best = { kind: 'npc', npc: n, label: 'Talk to ' + n.def.name }; }
  }
  if (best) return best;
  // chests
  for (const ch of WORLD.chests) {
    if (!ch.opened && dist(p.x, p.y, ch.x, ch.y) < 42)
      return { kind: 'chest', chest: ch, label: 'Open Chest' };
  }
  // resource nodes
  for (const nd of WORLD.nodes) {
    if (now() - nd.takenAt < 45) continue;   // respawning
    if (dist(p.x, p.y, nd.x, nd.y) < 36)
      return { kind: 'node', node: nd, label: 'Collect ' + ITEMS[nd.type].name };
  }
  // fishing spots
  if (!fishing) {
    for (const fs of WORLD.fishSpots)
      if (dist(p.x, p.y, fs.x, fs.y) < 58)
        return { kind: 'fish', spot: fs, label: 'Fish' };
  }
  return null;
}

function doInteract() {
  if (fishing) { fishingStrike(); return; }
  const it = findInteractable();
  if (!it) return;
  if (it.kind === 'npc') openDialog(it.npc);
  else if (it.kind === 'chest') openChest(it.chest);
  else if (it.kind === 'node') collectNode(it.node);
  else if (it.kind === 'fish') startFishing(it.spot);
}

function collectNode(nd) {
  nd.takenAt = now();
  player.inv[nd.type]++;
  toast(`${ITEMS[nd.type].icon} +1 <b>${ITEMS[nd.type].name}</b> (×${player.inv[nd.type]})`, true);
  for (let i = 0; i < 5; i++) spawnParticle('sparkle', nd.x, nd.y - 8);
  trackerDirty = true;
  renderInventory();
}

function openChest(ch) {
  ch.opened = true;
  let msg = `🎁 <b>Chest opened!</b> +${ch.coins} coins`;
  player.coins += ch.coins;
  for (const [k, v] of Object.entries(ch.items || {})) {
    player.inv[k] += v;
    msg += `, ${ITEMS[k].icon}×${v}`;
  }
  toast(msg, true);
  for (let i = 0; i < 16; i++) spawnParticle('confetti', ch.x, ch.y - 10);
  trackerDirty = true;
  renderInventory();
  saveGame(true);
}

/* ================= dialogue system ================= */
const dialog = { npc: null, lines: [], idx: 0, typing: null, choicesShown: false };

function heartsHTML(id) {
  const lv = friendLevel(id);
  let s = '';
  for (let i = 0; i < 5; i++) s += i < lv ? '💗' : '🤍';
  return s + ` <small style="color:#cfc8ff">${FRIEND_NAMES[lv]}</small>`;
}

function openDialog(npc) {
  const p = player;
  dialog.npc = npc; dialog.idx = 0; dialog.choicesShown = false;
  npc.dir = Math.abs(p.x - npc.x) > Math.abs(p.y - npc.y) ? (p.x < npc.x ? 1 : 2) : (p.y < npc.y ? 3 : 0);
  p.moving = false;

  const tier = Math.min(friendLevel(npc.def.id), 3);
  dialog.lines = [...npc.def.lines[tier]];

  // friendship for chatting (with a per-NPC cooldown)
  const t = now();
  if (!talkCooldown[npc.def.id] || t - talkCooldown[npc.def.id] > 45) {
    talkCooldown[npc.def.id] = t;
    const before = friendLevel(npc.def.id);
    friendship[npc.def.id] = (friendship[npc.def.id] || 0) + 2;
    if (friendLevel(npc.def.id) > before)
      setTimeout(() => toast(`💗 <b>${npc.def.name}</b> is now your <b>${FRIEND_NAMES[friendLevel(npc.def.id)]}</b>!`, true), 400);
  }

  $('dName').textContent = npc.def.name;
  $('dRole').textContent = npc.def.role + ' · ' + npc.def.personality;
  $('dHearts').innerHTML = heartsHTML(npc.def.id);
  $('dChoices').innerHTML = '';
  drawPortrait(npc.def);
  $('dialog').classList.remove('hidden');
  showLine();
}

function showLine() {
  const text = dialog.lines[dialog.idx];
  const el = $('dText');
  el.innerHTML = '';
  clearInterval(dialog.typing);
  let i = 0;
  dialog.typing = setInterval(() => {
    i++;
    el.innerHTML = text.slice(0, i) + (i < text.length ? '<span class="cursor">▌</span>' : ' <span class="cursor">▼</span>');
    if (i >= text.length) clearInterval(dialog.typing);
  }, 16);
}

function advanceDialog() {
  const text = dialog.lines[dialog.idx];
  const el = $('dText');
  // finish typewriter first
  if (el.textContent.replace('▌', '').replace(' ▼', '').length < text.length) {
    clearInterval(dialog.typing);
    el.innerHTML = text + ' <span class="cursor">▼</span>';
    return;
  }
  if (dialog.idx < dialog.lines.length - 1) { dialog.idx++; showLine(); return; }
  if (!dialog.choicesShown) showChoices();
}

function questsFor(npcId) {
  const out = { available: [], completable: [], deliveries: [] };
  for (const [id, q] of Object.entries(QUESTS)) {
    if (q.giver === npcId && !questState[id] && (!q.needLv || friendLevel(npcId) >= q.needLv))
      out.available.push(id);
    if (q.giver === npcId && questState[id] === 'active' && q.type === 'collect' && canComplete(q))
      out.completable.push(id);
    if (q.type === 'deliver' && q.to === npcId && questState[id] === 'active' && player.inv[q.item] >= 1)
      out.deliveries.push(id);
  }
  return out;
}

function canComplete(q) {
  return Object.entries(q.items).every(([k, v]) => player.inv[k] >= v);
}

function showChoices() {
  dialog.choicesShown = true;
  const npc = dialog.npc;
  const wrap = $('dChoices');
  wrap.innerHTML = '';
  const qs = questsFor(npc.def.id);

  const addBtn = (label, cls, fn) => {
    const b = document.createElement('button');
    b.className = 'btn ' + cls; b.innerHTML = label;
    b.onclick = fn;
    wrap.appendChild(b);
  };

  for (const id of qs.completable)
    addBtn('✅ Complete: ' + QUESTS[id].title, 'done', () => completeQuest(id));
  for (const id of qs.deliveries)
    addBtn('📦 Hand over: ' + ITEMS[QUESTS[id].item].name, 'done', () => completeDelivery(id));
  for (const id of qs.available)
    addBtn('❗ Quest: ' + QUESTS[id].title, 'quest', () => offerQuest(id));
  if (npc.def.shop)
    addBtn('🛒 Shop', '', () => { closeDialog(); openShop(); });
  addBtn('👋 Goodbye', '', closeDialog);
}

function offerQuest(id) {
  const q = QUESTS[id];
  dialog.lines = [q.intro];
  dialog.idx = 0; dialog.choicesShown = true;
  showLine();
  const wrap = $('dChoices');
  wrap.innerHTML = '';
  const accept = document.createElement('button');
  accept.className = 'btn quest'; accept.textContent = '✔ Accept Quest';
  accept.onclick = () => acceptQuest(id);
  const later = document.createElement('button');
  later.className = 'btn'; later.textContent = 'Maybe later';
  later.onclick = closeDialog;
  wrap.append(accept, later);
}

function acceptQuest(id) {
  const q = QUESTS[id];
  questState[id] = 'active';
  if (q.type === 'deliver') {
    player.inv[q.item]++;
    toast(`${ITEMS[q.item].icon} Received: <b>${ITEMS[q.item].name}</b>`);
  }
  toast(`📜 Quest accepted: <b>${q.title}</b>`, true);
  trackerDirty = true;
  renderInventory();
  closeDialog();
}

function grantReward(q, giverId) {
  player.coins += q.reward.coins || 0;
  let msg = `🏆 <b>${q.title}</b> complete! +${q.reward.coins}🪙`;
  for (const [k, v] of Object.entries(q.reward.items || {})) {
    player.inv[k] += v;
    msg += ` ${ITEMS[k].icon}×${v}`;
  }
  if (q.reward.stMax) {
    player.stMax += q.reward.stMax;
    player.st = player.stMax;
    msg += ` ⚡Max stamina +${q.reward.stMax}!`;
  }
  friendship[giverId] = (friendship[giverId] || 0) + 15;
  toast(msg, true);
  for (let i = 0; i < 20; i++) spawnParticle('confetti', player.x, player.y - 20);
}

function completeQuest(id) {
  const q = QUESTS[id];
  for (const [k, v] of Object.entries(q.items)) player.inv[k] -= v;  // hand items over
  questState[id] = 'done';
  grantReward(q, q.giver);
  trackerDirty = true;
  renderInventory();
  saveGame(true);
  closeDialog();
}

function completeDelivery(id) {
  const q = QUESTS[id];
  player.inv[q.item]--;
  questState[id] = 'done';
  grantReward(q, q.giver);
  friendship[q.to] = (friendship[q.to] || 0) + 8;   // the receiver appreciates it too
  trackerDirty = true;
  renderInventory();
  saveGame(true);
  closeDialog();
}

function closeDialog() {
  clearInterval(dialog.typing);
  dialog.npc = null;
  $('dialog').classList.add('hidden');
}

/* ================= shop ================= */
function openShop() {
  const rows = $('shopRows');
  rows.innerHTML = '';
  const addRow = (icon, label, sub, btnLabel, cls, fn, disabled) => {
    const row = document.createElement('div');
    row.className = 'shopRow';
    row.innerHTML = `<span class="icon">${icon}</span><span class="label">${label}<small>${sub}</small></span>`;
    const b = document.createElement('button');
    b.className = 'btn ' + cls; b.textContent = btnLabel; b.disabled = !!disabled;
    if (disabled) b.style.opacity = 0.45;
    b.onclick = () => { fn(); openShop(); };
    row.appendChild(b);
    rows.appendChild(row);
  };
  // buy
  addRow('🧪', 'Potion', 'Restores 40 HP & 40 stamina', 'Buy 30🪙', 'quest', () => {
    player.coins -= 30; player.inv.potion++;
    toast('🧪 Bought a potion!'); trackerDirty = true; renderInventory(); updateHUD();
  }, player.coins < 30);
  // sell
  for (const k of ['wood', 'stone', 'fish', 'flower', 'treasure']) {
    const have = player.inv[k];
    addRow(ITEMS[k].icon, `Sell ${ITEMS[k].name}`, `You have ×${have}`, `Sell ${ITEMS[k].sell}🪙`, 'done', () => {
      player.inv[k]--; player.coins += ITEMS[k].sell;
      toast(`${ITEMS[k].icon} Sold for ${ITEMS[k].sell}🪙`); trackerDirty = true; renderInventory(); updateHUD();
    }, have <= 0);
  }
  $('shopPanel').classList.remove('hidden');
}
$('shopClose').onclick = () => $('shopPanel').classList.add('hidden');

/* ================= inventory ================= */
let invOpen = false;
function toggleInventory() {
  invOpen = !invOpen;
  $('invPanel').classList.toggle('hidden', !invOpen);
  if (invOpen) renderInventory();
}
function renderInventory() {
  if (!invOpen) return;
  const grid = $('invGrid');
  grid.innerHTML = '';
  for (const [k, def] of Object.entries(ITEMS)) {
    const n = player.inv[k];
    if (n <= 0) continue;
    const slot = document.createElement('div');
    slot.className = 'invSlot' + (def.usable ? ' usable' : '');
    slot.title = def.name + (def.usable ? ' (click to use)' : '');
    slot.innerHTML = `${def.icon}<span class="count">${n}</span>`;
    if (def.usable) slot.onclick = () => useItem(k);
    grid.appendChild(slot);
  }
  if (!grid.children.length) grid.innerHTML = '<em style="grid-column:1/-1;color:#b9b3d9;font-size:13px">Empty... go explore!</em>';
}
function useItem(k) {
  if (k === 'potion' && player.inv.potion > 0) {
    player.inv.potion--;
    player.hp = Math.min(player.hpMax, player.hp + 40);
    player.st = Math.min(player.stMax, player.st + 40);
    toast('🧪 Glug glug... <b>+40 HP, +40 stamina!</b>', true);
    renderInventory();
  }
}

/* ================= quest tracker HUD ================= */
function renderTracker() {
  const list = $('trackerList');
  const active = Object.keys(questState).filter(id => questState[id] === 'active');
  if (!active.length) { list.innerHTML = '<em>No active quests</em>'; return; }
  list.innerHTML = '';
  for (const id of active) {
    const q = QUESTS[id];
    let prog, ready = false;
    if (q.type === 'deliver') {
      prog = `Bring ${ITEMS[q.item].icon} to ${NPC_BY_ID[q.to].def.name}`;
      ready = player.inv[q.item] >= 1;
    } else {
      prog = Object.entries(q.items)
        .map(([k, v]) => `${ITEMS[k].icon} ${Math.min(player.inv[k], v)}/${v}`).join('  ');
      ready = canComplete(q);
    }
    const el = document.createElement('div');
    el.className = 'questItem' + (ready ? ' ready' : '');
    el.innerHTML = `<div class="qt">${q.title}</div><div class="qp">${prog}${ready ? ' — return to ' + NPC_BY_ID[q.type === 'deliver' ? q.to : q.giver].def.name + '!' : ''}</div>`;
    list.appendChild(el);
  }
}

/* ================= pause menu ================= */
function togglePause() {
  if (!game.started) return;
  if (dialog.npc) { closeDialog(); return; }
  if (!$('shopPanel').classList.contains('hidden')) { $('shopPanel').classList.add('hidden'); return; }
  game.paused = !game.paused;
  $('pauseMenu').classList.toggle('hidden', !game.paused);
}
$('btnResume').onclick = togglePause;
$('btnSave').onclick = () => { saveGame(false); };
$('btnNewGame').onclick = () => {
  if (confirm('Start a brand new adventure? Your save will be erased.')) {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* storage may be unavailable */ }
    location.reload();
  }
};

/* ================= save / load ================= */
const SAVE_KEY = 'owa_save_v1';
function saveGame(silent) {
  const data = {
    v: 1,
    p: {
      x: player.x, y: player.y, hp: player.hp, st: player.st, stMax: player.stMax,
      coins: player.coins, inv: player.inv,
    },
    time: game.time, day: game.day,
    friendship, questState,
    chests: WORLD.chests.filter(c => c.opened).map(c => c.id),
  };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { /* storage may be unavailable */ }
  if (!silent) toast('💾 Game saved!');
}
function loadGame() {
  let data;
  try { data = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return false; }
  if (!data || data.v !== 1) return false;
  Object.assign(player, {
    x: data.p.x, y: data.p.y, hp: data.p.hp, st: data.p.st,
    stMax: data.p.stMax, coins: data.p.coins,
  });
  Object.assign(player.inv, data.p.inv);
  game.time = data.time; game.day = data.day;
  friendship = data.friendship || {};
  questState = data.questState || {};
  for (const id of data.chests || []) {
    const ch = WORLD.chests.find(c => c.id === id);
    if (ch) ch.opened = true;
  }
  trackerDirty = true;
  return true;
}
const hasSave = () => { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } };

/* ================= HUD ================= */
function updateHUD() {
  $('hpfill').style.width = (player.hp / player.hpMax * 100) + '%';
  $('stfill').style.width = (player.st / player.stMax * 100) + '%';
  $('coinN').textContent = player.coins;
  const h = Math.floor(game.time), m = Math.floor((game.time % 1) * 60);
  const icon = (game.time >= 6 && game.time < 18) ? '☀️' : '🌙';
  $('clock').textContent = `${icon} Day ${game.day} — ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  if (trackerDirty) { renderTracker(); trackerDirty = false; }
}

function updateZoneBanner() {
  const z = zoneAt(Math.floor(player.x / TILE), Math.floor(player.y / TILE));
  if (z !== game.zone) {
    game.zone = z;
    const b = $('zoneBanner');
    b.textContent = z;
    b.classList.remove('show');
    void b.offsetWidth;      // restart CSS animation
    b.classList.add('show');
  }
}

function updateHint() {
  const el = $('hint');
  if (dialog.npc || fishing) { el.classList.add('hidden'); return; }
  const it = findInteractable();
  if (it) { $('hintText').textContent = it.label; el.classList.remove('hidden'); }
  else el.classList.add('hidden');
}

/* ================= color helpers ================= */
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (f >= 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  else { r *= 1 + f; g *= 1 + f; b *= 1 + f; }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

/* ================= particles ================= */
const PARTICLE_COLORS = ['#ffd166', '#ff8fb3', '#7ef9e0', '#b3c7ff', '#c9f97e'];
function spawnParticle(type, x, y) {
  if (particles.length > 220) return;
  const p = { type, x, y, t: 0 };
  switch (type) {
    case 'sparkle': p.life = 0.8; p.vx = (Math.random() - 0.5) * 30; p.vy = -30 - Math.random() * 30; break;
    case 'dust': p.life = 0.5; p.vx = (Math.random() - 0.5) * 20; p.vy = -8; break;
    case 'confetti': p.life = 1.3; p.vx = (Math.random() - 0.5) * 120; p.vy = -80 - Math.random() * 80;
      p.color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]; break;
    case 'ripple': p.life = 1.1; break;
    case 'leaf': p.life = 3.5; p.vy = 18 + Math.random() * 10; p.ph = Math.random() * TAU;
      p.color = Math.random() < 0.5 ? '#7fb069' : '#d4a24e'; break;
    case 'firefly': p.life = 4; p.ph = Math.random() * TAU; break;
  }
  particles.push(p);
}
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.t += dt;
    if (p.t >= p.life) { particles.splice(i, 1); continue; }
    if (p.vx !== undefined) p.x += p.vx * dt;
    if (p.vy !== undefined) p.y += p.vy * dt;
    if (p.type === 'confetti') p.vy += 220 * dt;
    if (p.type === 'leaf') p.x += Math.sin(p.t * 3 + p.ph) * 24 * dt;
    if (p.type === 'firefly') { p.x += Math.sin(p.t * 1.7 + p.ph) * 18 * dt; p.y += Math.cos(p.t * 1.3 + p.ph) * 14 * dt; }
  }
}
function drawParticles(c, t) {
  for (const p of particles) {
    const k = 1 - p.t / p.life;
    c.globalAlpha = Math.min(1, k * 2);
    switch (p.type) {
      case 'sparkle': {
        c.fillStyle = '#fff7cf';
        const s = 2.5 * k;
        c.save(); c.translate(p.x, p.y); c.rotate(p.t * 4);
        c.fillRect(-s, -s / 3, s * 2, s / 1.5); c.fillRect(-s / 3, -s, s / 1.5, s * 2);
        c.restore(); break;
      }
      case 'dust':
        c.fillStyle = 'rgba(180,170,150,0.7)';
        c.beginPath(); c.arc(p.x, p.y, 3 * k, 0, TAU); c.fill(); break;
      case 'confetti':
        c.fillStyle = p.color;
        c.fillRect(p.x - 2, p.y - 2, 4, 4); break;
      case 'ripple':
        c.strokeStyle = 'rgba(220,240,255,0.8)'; c.lineWidth = 1.5;
        c.beginPath(); c.ellipse(p.x, p.y, 4 + p.t * 16, (4 + p.t * 16) * 0.45, 0, 0, TAU); c.stroke(); break;
      case 'leaf':
        c.fillStyle = p.color;
        c.save(); c.translate(p.x, p.y); c.rotate(p.t * 2 + p.ph);
        c.beginPath(); c.ellipse(0, 0, 3.5, 1.8, 0, 0, TAU); c.fill(); c.restore(); break;
      case 'firefly': {
        const pulse = 0.5 + 0.5 * Math.sin(p.t * 6 + p.ph);
        c.fillStyle = `rgba(200,255,140,${0.5 + pulse * 0.5})`;
        c.beginPath(); c.arc(p.x, p.y, 1.6 + pulse, 0, TAU); c.fill();
        c.fillStyle = `rgba(200,255,140,0.12)`;
        c.beginPath(); c.arc(p.x, p.y, 6, 0, TAU); c.fill(); break;
      }
    }
  }
  c.globalAlpha = 1;
}

/* ================= tile rendering ================= */
const TILE_BASE = {
  [T.GRASS]: '#6db663', [T.WATER]: '#3a7ac8', [T.SAND]: '#e6d494', [T.PATH]: '#d2b083',
  [T.ROCK]: '#96939e', [T.WALL]: '#565064', [T.FOREST]: '#4c8a4e', [T.SECRET]: '#5e4a8a', [T.BRIDGE]: '#a5762f',
};
function drawTiles(c, t) {
  const tx0 = Math.max(0, Math.floor(cam.x / TILE)), ty0 = Math.max(0, Math.floor(cam.y / TILE));
  const tx1 = Math.min(MAP_W - 1, Math.ceil((cam.x + VW) / TILE)), ty1 = Math.min(MAP_H - 1, Math.ceil((cam.y + VH) / TILE));
  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      const tt = tileAt(tx, ty);
      const h = hash2(tx, ty);
      const px = tx * TILE, py = ty * TILE;
      let col = TILE_BASE[tt];

      if (tt === T.WATER) {
        const wave = Math.sin(t * 1.6 + (tx + ty) * 0.9) * 0.05;
        col = shade('#3a7ac8', wave + (h - 0.5) * 0.05);
        c.fillStyle = col; c.fillRect(px, py, TILE, TILE);
        // moving highlights
        if ((tx * 7 + ty * 13 + Math.floor(t * 2.5)) % 9 === 0) {
          c.strokeStyle = 'rgba(200,230,255,0.5)'; c.lineWidth = 1.5;
          c.beginPath(); c.arc(px + 16, py + 16, 6, Math.PI * 0.15, Math.PI * 0.85); c.stroke();
        }
        // shore foam
        if (tileAt(tx, ty - 1) === T.SAND || tileAt(tx, ty - 1) === T.BRIDGE) {
          c.fillStyle = `rgba(230,245,255,${0.35 + 0.2 * Math.sin(t * 2 + tx)})`;
          c.fillRect(px, py, TILE, 4);
        }
        continue;
      }

      c.fillStyle = shade(col, (h - 0.5) * 0.09);
      c.fillRect(px, py, TILE, TILE);

      if (tt === T.GRASS || tt === T.FOREST) {
        if (h < 0.28) {  // grass tufts
          c.strokeStyle = shade(col, -0.18); c.lineWidth = 1;
          const gx = px + 6 + h * 60, gy = py + 8 + hash2(ty, tx) * 18;
          c.beginPath(); c.moveTo(gx, gy + 5); c.lineTo(gx, gy); c.moveTo(gx + 3, gy + 5); c.lineTo(gx + 4, gy + 1); c.stroke();
        } else if (tt === T.GRASS && h > 0.965) {  // tiny meadow flowers
          c.fillStyle = ['#ffd6e8', '#fff3b8', '#d6e4ff'][Math.floor(h * 100) % 3];
          c.beginPath(); c.arc(px + 10 + h * 12, py + 10 + hash2(ty, tx) * 12, 2.2, 0, TAU); c.fill();
        }
      } else if (tt === T.PATH || tt === T.SAND) {
        if (h < 0.15) { c.fillStyle = shade(col, -0.12); c.beginPath(); c.arc(px + 8 + h * 100, py + 12 + hash2(ty, tx) * 12, 1.8, 0, TAU); c.fill(); }
      } else if (tt === T.ROCK) {
        if (h < 0.2) { c.fillStyle = shade(col, -0.15); c.fillRect(px + 6 + h * 80, py + 10 + hash2(ty, tx) * 14, 4, 3); }
        if (ty < 9 && h > 0.6) { c.fillStyle = 'rgba(240,245,255,0.55)'; c.beginPath(); c.arc(px + 16, py + 16, 7 + h * 6, 0, TAU); c.fill(); } // snow patches
      } else if (tt === T.WALL) {
        c.fillStyle = shade(col, 0.18); c.fillRect(px, py, TILE, 6);           // lit top edge
        c.fillStyle = shade(col, -0.28); c.fillRect(px, py + TILE - 4, TILE, 4);
        if (h < 0.3) { c.strokeStyle = 'rgba(0,0,0,0.25)'; c.strokeRect(px + 5, py + 9 + h * 20, 9, 6); }
      } else if (tt === T.SECRET) {
        if (h > 0.9) {
          const pulse = 0.4 + 0.3 * Math.sin(t * 2 + h * 20);
          c.fillStyle = `rgba(190,150,255,${pulse})`;
          c.beginPath(); c.arc(px + 8 + h * 14, py + 8 + hash2(ty, tx) * 14, 2, 0, TAU); c.fill();
        }
      } else if (tt === T.BRIDGE) {
        c.strokeStyle = 'rgba(70,45,15,0.5)'; c.lineWidth = 1;
        for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(px, py + i * 8); c.lineTo(px + TILE, py + i * 8); c.stroke(); }
      }
    }
  }
}

/* ================= world object rendering ================= */
function drawShadow(c, x, y, rx, ry) {
  c.fillStyle = 'rgba(20,25,20,0.28)';
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill();
}

function drawTree(c, tr, t) {
  const sway = Math.sin(t * 1.3 + tr.sway) * 1.6;
  const x = tr.x, y = tr.y;
  drawShadow(c, x, y + 2, 13, 5);
  if (tr.variant === 2) { // mountain pine
    c.fillStyle = '#5d4530'; c.fillRect(x - 3, y - 12, 6, 12);
    c.fillStyle = '#2f5d50';
    for (let i = 0; i < 3; i++) {
      const w = 16 - i * 4, ty = y - 10 - i * 9;
      c.beginPath(); c.moveTo(x - w + sway * i * 0.3, ty); c.lineTo(x + w + sway * i * 0.3, ty); c.lineTo(x + sway * (i + 1) * 0.4, ty - 13); c.closePath(); c.fill();
    }
    c.fillStyle = 'rgba(240,246,255,0.8)';
    c.beginPath(); c.arc(x + sway, y - 38, 4, 0, TAU); c.fill();
    return;
  }
  const pal = tr.variant === 0 ? ['#3f8a3f', '#57a54f', '#7cc46a']
    : tr.variant === 1 ? ['#2b5e33', '#3d7542', '#578a52']
    : ['#c46a9a', '#e08cb8', '#f5b8d5'];   // sakura
  c.fillStyle = '#6b4a2f'; c.fillRect(x - 4, y - 16, 8, 16);
  c.fillStyle = pal[0];
  c.beginPath(); c.arc(x - 8 + sway * 0.4, y - 20, 10, 0, TAU); c.arc(x + 8 + sway * 0.4, y - 20, 10, 0, TAU); c.fill();
  c.fillStyle = pal[1];
  c.beginPath(); c.arc(x + sway * 0.7, y - 29, 12, 0, TAU); c.fill();
  c.fillStyle = pal[2];
  c.beginPath(); c.arc(x - 3 + sway, y - 32, 6, 0, TAU); c.fill();
  if (tr.variant === 3 && Math.random() < 0.01) spawnParticle('sparkle', x + (Math.random() - 0.5) * 20, y - 24);
}

function drawHouse(c, h, dark) {
  const x = h.tx * TILE, y = h.ty * TILE, w = h.w * TILE, hh = h.h * TILE;
  drawShadow(c, x + w / 2, y + hh + 3, w / 2, 6);
  // walls
  c.fillStyle = h.wall; c.fillRect(x + 2, y + hh * 0.35, w - 4, hh * 0.65);
  c.strokeStyle = 'rgba(60,40,20,0.35)'; c.lineWidth = 2;
  c.strokeRect(x + 2, y + hh * 0.35, w - 4, hh * 0.65);
  // roof
  c.fillStyle = h.roof;
  c.beginPath();
  c.moveTo(x - 6, y + hh * 0.4); c.lineTo(x + w * 0.18, y); c.lineTo(x + w * 0.82, y); c.lineTo(x + w + 6, y + hh * 0.4);
  c.closePath(); c.fill();
  c.fillStyle = shade(h.roof, -0.2);
  c.fillRect(x - 6, y + hh * 0.4 - 3, w + 12, 5);
  // door
  const dx = x + w / 2 - 8, dy = y + hh - 22;
  c.fillStyle = '#6b4a2f'; rrect(c, dx, dy, 16, 22, 4); c.fill();
  c.fillStyle = '#e8c05a'; c.beginPath(); c.arc(dx + 12, dy + 12, 1.6, 0, TAU); c.fill();
  // windows (they glow at night)
  c.fillStyle = dark > 0.2 ? '#ffe9a0' : '#bcd8e8';
  const wy = y + hh * 0.55;
  c.fillRect(x + w * 0.18, wy, 12, 11);
  c.fillRect(x + w * 0.72, wy, 12, 11);
  c.strokeStyle = 'rgba(60,40,20,0.5)'; c.lineWidth = 1.5;
  c.strokeRect(x + w * 0.18, wy, 12, 11); c.strokeRect(x + w * 0.72, wy, 12, 11);
  // awning for the shop
  if (h.awning) {
    for (let i = 0; i < Math.floor(w / 14); i++) {
      c.fillStyle = i % 2 ? '#e05561' : '#f5f0e5';
      c.fillRect(x + 4 + i * 14, y + hh * 0.38, 14, 8);
    }
  }
  if (h.shrine) {
    c.fillStyle = '#c03040';
    c.fillRect(x + w * 0.1, y - 4, w * 0.8, 5);
  }
  if (h.label) {
    c.fillStyle = 'rgba(30,22,14,0.75)';
    rrect(c, x + w / 2 - 26, y + hh + 4, 52, 13, 4); c.fill();
    c.fillStyle = '#ffe9c0'; c.font = 'bold 9px sans-serif'; c.textAlign = 'center';
    c.fillText(h.label, x + w / 2, y + hh + 13.5);
  }
}

function drawNode(c, nd, t) {
  if (now() - nd.takenAt < 45) return;
  const bob = Math.sin(t * 2.2 + nd.x * 0.05) * 1.5;
  const x = nd.x, y = nd.y + bob * 0.3;
  drawShadow(c, x, nd.y + 6, 8, 3);
  switch (nd.type) {
    case 'wood':
      c.save(); c.translate(x, y); c.rotate(0.25);
      c.fillStyle = '#8a5a2f'; rrect(c, -10, -5, 20, 10, 4); c.fill();
      c.fillStyle = '#c89858'; c.beginPath(); c.ellipse(9, 0, 3, 4.5, 0, 0, TAU); c.fill();
      c.strokeStyle = '#a87840'; c.lineWidth = 1; c.beginPath(); c.arc(9, 0, 1.8, 0, TAU); c.stroke();
      c.restore(); break;
    case 'stone':
      c.fillStyle = '#9a97a5';
      c.beginPath(); c.moveTo(x - 9, y + 5); c.lineTo(x - 6, y - 5); c.lineTo(x + 2, y - 8); c.lineTo(x + 9, y - 2); c.lineTo(x + 8, y + 5); c.closePath(); c.fill();
      c.fillStyle = '#c5c2d0'; c.beginPath(); c.moveTo(x - 4, y - 4); c.lineTo(x + 2, y - 6); c.lineTo(x + 4, y - 2); c.closePath(); c.fill();
      break;
    case 'flower': {
      const fc = ['#ff8fb3', '#ffd166', '#b3c7ff'][Math.floor(hash2(nd.x, nd.y) * 3)];
      c.strokeStyle = '#4a8a3f'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x, y + 6); c.quadraticCurveTo(x + 2, y, x, y - 4 + bob); c.stroke();
      c.fillStyle = fc;
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * TAU + t * 0.4;
        c.beginPath(); c.arc(x + Math.cos(a) * 4, y - 6 + bob + Math.sin(a) * 4, 3, 0, TAU); c.fill();
      }
      c.fillStyle = '#fff4c0'; c.beginPath(); c.arc(x, y - 6 + bob, 2.5, 0, TAU); c.fill();
      break;
    }
    case 'potion':
      c.fillStyle = 'rgba(255,120,200,0.25)';
      c.beginPath(); c.arc(x, y - 4 + bob, 11, 0, TAU); c.fill();
      c.fillStyle = '#d54fa0'; rrect(c, x - 5, y - 6 + bob, 10, 11, 4); c.fill();
      c.fillStyle = '#8fd8e8'; c.fillRect(x - 2.5, y - 11 + bob, 5, 6);
      c.fillStyle = '#8a5a2f'; c.fillRect(x - 3, y - 13 + bob, 6, 3);
      c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.arc(x - 2, y - 2 + bob, 1.5, 0, TAU); c.fill();
      if (Math.random() < 0.02) spawnParticle('sparkle', x, y - 8);
      break;
  }
}

function drawChest(c, ch, t) {
  const x = ch.x, y = ch.y;
  const s = ch.big ? 1.4 : 1;
  drawShadow(c, x, y + 7 * s, 14 * s, 5 * s);
  c.save(); c.translate(x, y); c.scale(s, s);
  if (!ch.opened) {
    c.fillStyle = '#8a5a2f'; rrect(c, -13, -8, 26, 15, 3); c.fill();
    c.fillStyle = '#a5713f'; rrect(c, -13, -12, 26, 8, 4); c.fill();
    c.fillStyle = '#e8c05a'; c.fillRect(-2.5, -12, 5, 19);
    c.fillStyle = '#ffd166'; rrect(c, -3.5, -4, 7, 7, 2); c.fill();
    c.fillStyle = '#7a4a20'; c.beginPath(); c.arc(0, -0.5, 1.5, 0, TAU); c.fill();
    if (Math.random() < (ch.big ? 0.06 : 0.02)) spawnParticle('sparkle', x + (Math.random() - 0.5) * 24, y - 12);
  } else {
    c.fillStyle = '#6a4522'; rrect(c, -13, -8, 26, 15, 3); c.fill();
    c.fillStyle = '#3a2512'; c.fillRect(-10, -7, 20, 8);
    c.fillStyle = '#a5713f'; rrect(c, -13, -20, 26, 8, 4); c.fill();
  }
  c.restore();
}

function drawRock(c, r) {
  drawShadow(c, r.x, r.y + r.s * 0.45, r.s, r.s * 0.35);
  c.fillStyle = '#8d8a98';
  c.beginPath();
  c.moveTo(r.x - r.s, r.y + r.s * 0.4); c.lineTo(r.x - r.s * 0.6, r.y - r.s * 0.6);
  c.lineTo(r.x + r.s * 0.2, r.y - r.s); c.lineTo(r.x + r.s, r.y - r.s * 0.1); c.lineTo(r.x + r.s * 0.8, r.y + r.s * 0.4);
  c.closePath(); c.fill();
  c.fillStyle = '#b5b2c0';
  c.beginPath(); c.moveTo(r.x - r.s * 0.4, r.y - r.s * 0.5); c.lineTo(r.x + r.s * 0.15, r.y - r.s * 0.85); c.lineTo(r.x + r.s * 0.4, r.y - r.s * 0.3); c.closePath(); c.fill();
}

function drawThorn(c, th, t) {
  const x = th.x, y = th.y;
  drawShadow(c, x, y + 5, 10, 3);
  c.fillStyle = '#2a4a2a';
  c.beginPath(); c.arc(x - 5, y, 6, 0, TAU); c.arc(x + 5, y, 6, 0, TAU); c.arc(x, y - 4, 6, 0, TAU); c.fill();
  c.strokeStyle = '#1a301a'; c.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * TAU + 0.4;
    c.beginPath(); c.moveTo(x + Math.cos(a) * 6, y - 2 + Math.sin(a) * 5);
    c.lineTo(x + Math.cos(a) * 11, y - 2 + Math.sin(a) * 9); c.stroke();
  }
  c.fillStyle = '#d04a5a';
  c.beginPath(); c.arc(x - 3, y - 3, 1.5, 0, TAU); c.arc(x + 4, y + 1, 1.5, 0, TAU); c.fill();
}

function drawLamp(c, l, dark, t) {
  drawShadow(c, l.x, l.y + 4, 5, 2);
  c.fillStyle = '#4a4550'; c.fillRect(l.x - 2, l.y - 26, 4, 30);
  c.fillStyle = '#5a5566'; c.beginPath(); c.arc(l.x, l.y - 28, 5, 0, TAU); c.fill();
  c.fillStyle = dark > 0.15 ? '#ffe9a0' : '#d8e8f0';
  c.beginPath(); c.arc(l.x, l.y - 28, 3.2, 0, TAU); c.fill();
  if (dark > 0.15) {
    c.fillStyle = `rgba(255,225,150,${0.12 + 0.03 * Math.sin(t * 5 + l.x)})`;
    c.beginPath(); c.arc(l.x, l.y - 28, 22, 0, TAU); c.fill();
  }
}

function drawWell(c, d) {
  drawShadow(c, d.x, d.y + 8, 15, 5);
  c.fillStyle = '#8d8a98'; c.beginPath(); c.ellipse(d.x, d.y, 14, 9, 0, 0, TAU); c.fill();
  c.fillStyle = '#2a3a5a'; c.beginPath(); c.ellipse(d.x, d.y - 1, 9, 5.5, 0, 0, TAU); c.fill();
  c.fillStyle = '#6b4a2f'; c.fillRect(d.x - 13, d.y - 26, 4, 26); c.fillRect(d.x + 9, d.y - 26, 4, 26);
  c.fillStyle = '#c0553d';
  c.beginPath(); c.moveTo(d.x - 18, d.y - 24); c.lineTo(d.x, d.y - 36); c.lineTo(d.x + 18, d.y - 24); c.closePath(); c.fill();
}

function drawTorii(c, d) {
  c.fillStyle = '#c03040';
  c.fillRect(d.x - 16, d.y - 34, 5, 34); c.fillRect(d.x + 11, d.y - 34, 5, 34);
  c.fillRect(d.x - 22, d.y - 38, 44, 5); c.fillRect(d.x - 17, d.y - 30, 34, 4);
}

/* ================= character rendering =================
   Chibi anime sprite, drawn fully procedurally.
   (x, y) = feet position. dir: 0 down, 1 left, 2 right, 3 up. */

function bangs(c, C) {   // shared jagged fringe + top of head
  c.fillStyle = C;
  c.beginPath();
  c.arc(0, -24, 8.8, Math.PI, 0);
  c.lineTo(8.8, -22);
  c.lineTo(6.5, -19); c.lineTo(4.3, -22); c.lineTo(2.2, -19.5); c.lineTo(0, -22);
  c.lineTo(-2.2, -19.5); c.lineTo(-4.3, -22); c.lineTo(-6.5, -19); c.lineTo(-8.8, -22);
  c.closePath(); c.fill();
}

const HAIR = {
  short: {
    front(c, C) { bangs(c, C); c.fillStyle = C; c.fillRect(-9, -25, 2.2, 6); c.fillRect(6.8, -25, 2.2, 6); },
  },
  spiky: {
    front(c, C) {
      bangs(c, C); c.fillStyle = C;
      for (let i = 0; i < 5; i++) {
        const a = Math.PI + (i + 0.5) / 5 * Math.PI;
        const bx = Math.cos(a) * 8, by = -24 + Math.sin(a) * 8;
        c.beginPath(); c.moveTo(bx - 2.4, by + 1); c.lineTo(bx + 2.4, by + 1); c.lineTo(bx * 1.55, by * 1.28 + 6); c.closePath(); c.fill();
      }
    },
  },
  twintails: {
    back(c, C, walk) {
      const sw = Math.sin(walk * 0.5) * 1.5;
      c.fillStyle = shade(C, -0.12);
      c.save(); c.translate(-11, -17 + sw); c.rotate(0.25); c.beginPath(); c.ellipse(0, 0, 3.6, 9.5, 0, 0, TAU); c.fill(); c.restore();
      c.save(); c.translate(11, -17 - sw); c.rotate(-0.25); c.beginPath(); c.ellipse(0, 0, 3.6, 9.5, 0, 0, TAU); c.fill(); c.restore();
    },
    front(c, C) { bangs(c, C); },
  },
  ponytail: {
    back(c, C, walk) {
      const sw = Math.sin(walk * 0.5) * 2;
      c.fillStyle = shade(C, -0.12);
      c.beginPath(); c.arc(0, -30, 4.5, 0, TAU); c.fill();
      c.save(); c.translate(1 + sw * 0.4, -18); c.rotate(0.12 + sw * 0.06);
      c.beginPath(); c.ellipse(0, 0, 3.4, 11, 0, 0, TAU); c.fill(); c.restore();
    },
    front(c, C) { bangs(c, C); },
  },
  long: {
    back(c, C) {
      c.fillStyle = shade(C, -0.12);
      rrect(c, -9, -28, 18, 21, 7); c.fill();
    },
    front(c, C) { bangs(c, C); c.fillStyle = C; c.fillRect(-9.3, -25, 2.6, 9); c.fillRect(6.7, -25, 2.6, 9); },
  },
  longwavy: {
    back(c, C, walk) {
      c.fillStyle = shade(C, -0.12);
      rrect(c, -8.5, -28, 17, 16, 7); c.fill();
      for (let i = 0; i < 3; i++) {
        const yy = -14 + i * 4.5, sw = Math.sin(walk * 0.5 + i) * 0.8;
        c.beginPath(); c.ellipse(-7 - i * 0.6 + sw, yy, 3.4, 4, 0, 0, TAU); c.fill();
        c.beginPath(); c.ellipse(7 + i * 0.6 + sw, yy, 3.4, 4, 0, 0, TAU); c.fill();
      }
    },
    front(c, C) { bangs(c, C); },
  },
  bob: {
    back(c, C) {
      c.fillStyle = shade(C, -0.1);
      c.beginPath(); c.arc(0, -22.5, 9.8, 0, TAU); c.fill();
    },
    front(c, C) { bangs(c, C); },
  },
  braid: {
    back(c, C, walk) {
      c.fillStyle = shade(C, -0.1);
      c.beginPath(); c.arc(0, -24, 9, 0, TAU); c.fill();
      const sw = Math.sin(walk * 0.5) * 1;
      for (let i = 0; i < 4; i++) {
        c.beginPath(); c.arc(6.5 + (i % 2 ? 1.2 : -1.2) + sw * i * 0.2, -14 + i * 3.6, 2.6, 0, TAU); c.fill();
      }
    },
    front(c, C) { bangs(c, C); },
  },
  hime: {
    back(c, C) {
      c.fillStyle = shade(C, -0.12);
      rrect(c, -9, -28, 18, 19, 6); c.fill();
      c.fillRect(-10.5, -25, 3.2, 11); c.fillRect(7.3, -25, 3.2, 11);   // side locks
    },
    front(c, C) {  // straight-cut princess fringe
      c.fillStyle = C;
      c.beginPath(); c.arc(0, -24, 8.8, Math.PI, 0);
      c.lineTo(8.8, -20); c.lineTo(-8.8, -20); c.closePath(); c.fill();
    },
  },
  bun: {
    back(c, C) {
      c.fillStyle = shade(C, -0.1);
      c.beginPath(); c.arc(0, -33, 4.2, 0, TAU); c.fill();
      c.beginPath(); c.arc(0, -23, 9, 0, TAU); c.fill();
    },
    front(c, C) { bangs(c, C); },
  },
  wavy: {
    front(c, C) {
      bangs(c, C); c.fillStyle = C;
      c.beginPath(); c.arc(-8, -21, 3, 0, TAU); c.arc(8, -21, 3, 0, TAU); c.arc(-6, -29, 3.5, 0, TAU); c.arc(6, -29, 3.5, 0, TAU); c.fill();
    },
  },
  sidepony: {
    back(c, C, walk) {
      const sw = Math.sin(walk * 0.5) * 1.5;
      c.fillStyle = shade(C, -0.12);
      c.save(); c.translate(10, -16 + sw); c.rotate(-0.35);
      c.beginPath(); c.ellipse(0, 0, 3.4, 10, 0, 0, TAU); c.fill(); c.restore();
    },
    front(c, C) { bangs(c, C); },
  },
  elder: {
    back(c, C) { c.fillStyle = C; c.fillRect(-9, -24, 2.5, 7); c.fillRect(6.5, -24, 2.5, 7); },
    front(c, C) {
      c.fillStyle = C;
      c.beginPath(); c.arc(-6, -28, 3, 0, TAU); c.arc(6, -28, 3, 0, TAU); c.fill();
      // beard
      c.beginPath(); c.ellipse(0, -16, 5, 4.5, 0, 0, Math.PI); c.fill();
    },
  },
};

const ACC = {
  ribbon(c, col) {
    for (const sx of [-1, 1]) {
      c.fillStyle = col;
      c.save(); c.translate(9 * sx, -28);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(-4 * sx, -3.5); c.lineTo(-4 * sx, 3.5); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(0, 0); c.lineTo(3 * sx, -3); c.lineTo(3 * sx, 3); c.closePath(); c.fill();
      c.beginPath(); c.arc(0, 0, 1.5, 0, TAU); c.fill();
      c.restore();
    }
  },
  ribbonback(c, col) {
    c.fillStyle = col;
    c.beginPath(); c.moveTo(0, -32); c.lineTo(-5, -36); c.lineTo(-5, -29); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(0, -32); c.lineTo(5, -36); c.lineTo(5, -29); c.closePath(); c.fill();
    c.beginPath(); c.arc(0, -32, 1.8, 0, TAU); c.fill();
  },
  hairpin(c, col) {
    c.fillStyle = col;
    c.beginPath(); c.arc(6.5, -27.5, 2, 0, TAU); c.fill();
    c.fillRect(5.8, -26, 1.4, 5);
  },
  glasses(c, col) {
    c.strokeStyle = col; c.lineWidth = 1.2;
    c.beginPath(); c.arc(-3.4, -22.5, 3, 0, TAU); c.stroke();
    c.beginPath(); c.arc(3.4, -22.5, 3, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(-0.6, -22.5); c.lineTo(0.6, -22.5); c.stroke();
  },
  flower(c, col) {
    c.fillStyle = col;
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * TAU;
      c.beginPath(); c.arc(7 + Math.cos(a) * 2.6, -28.5 + Math.sin(a) * 2.6, 2, 0, TAU); c.fill();
    }
    c.fillStyle = '#fff4c0'; c.beginPath(); c.arc(7, -28.5, 1.6, 0, TAU); c.fill();
  },
  crown(c, col) {
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(-5.5, -31); c.lineTo(-5.5, -36); c.lineTo(-2.7, -33); c.lineTo(0, -37); c.lineTo(2.7, -33); c.lineTo(5.5, -36); c.lineTo(5.5, -31);
    c.closePath(); c.fill();
    c.fillStyle = '#e05561'; c.beginPath(); c.arc(0, -33, 1.2, 0, TAU); c.fill();
  },
  witchhat(c, col) {
    c.fillStyle = col;
    c.beginPath(); c.ellipse(0, -30, 11.5, 3.4, 0, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(-7, -30); c.lineTo(7, -30); c.lineTo(3.5, -44); c.lineTo(-1, -43); c.closePath(); c.fill();
    c.fillStyle = '#c9a7ff'; c.fillRect(-6.5, -33, 13, 2.4);
  },
  helmet(c, col) {
    c.fillStyle = col;
    c.beginPath(); c.arc(0, -24.5, 9.4, Math.PI * 0.95, Math.PI * 2.05); c.fill();
    c.fillRect(-9.6, -25.5, 19.2, 3);
    c.fillStyle = '#e05561'; c.fillRect(-1.2, -37, 2.4, 5);
  },
  strawhat(c, col) {
    c.fillStyle = col;
    c.beginPath(); c.ellipse(0, -29, 12.5, 3.6, 0, 0, TAU); c.fill();
    c.beginPath(); c.arc(0, -29.5, 7, Math.PI, 0); c.fill();
    c.fillStyle = '#d05a6a'; c.fillRect(-7, -31.5, 14, 2.2);
  },
  chefhat(c, col) {
    c.fillStyle = col;
    c.fillRect(-5, -35, 10, 6);
    c.beginPath(); c.arc(-3.5, -36, 3.4, 0, TAU); c.arc(0, -38, 3.8, 0, TAU); c.arc(3.5, -36, 3.4, 0, TAU); c.fill();
  },
  cap(c, col) {
    c.fillStyle = col;
    c.beginPath(); c.ellipse(1.5, -30.5, 8, 3.6, -0.15, 0, TAU); c.fill();
    c.fillStyle = '#ffd166'; c.beginPath(); c.arc(8, -32, 1.5, 0, TAU); c.fill();
  },
  headband(c, col) {
    c.fillStyle = col; c.fillRect(-8.8, -27.5, 17.6, 2.6);
  },
  scarf(c, col) {
    c.fillStyle = col;
    rrect(c, -6, -17.5, 12, 4.5, 2); c.fill();
    c.fillRect(2, -15, 4, 7);
  },
  leaf(c, col) {
    c.fillStyle = col;
    c.save(); c.translate(7.5, -29); c.rotate(-0.6);
    c.beginPath(); c.ellipse(0, 0, 4.5, 2, 0, 0, TAU); c.fill(); c.restore();
  },
};

function drawFace(c, spr, dir, detail) {
  if (dir === 3) return;    // facing away
  const ex = dir === 1 ? -1.8 : dir === 2 ? 1.8 : 0;
  const ey = -22.8;
  if (detail) {
    for (const sx of [-1, 1]) {
      const cx = sx * 3.4 + ex;
      // sclera
      c.fillStyle = '#fff';
      c.beginPath(); c.ellipse(cx, ey, 2.4, 3, 0, 0, TAU); c.fill();
      // iris + pupil + highlights
      const g = c.createRadialGradient(cx, ey - 0.5, 0.3, cx, ey, 2.2);
      g.addColorStop(0, shade(spr.eye, 0.35)); g.addColorStop(1, shade(spr.eye, -0.25));
      c.fillStyle = g;
      c.beginPath(); c.ellipse(cx, ey + 0.3, 1.9, 2.5, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(20,15,30,0.9)';
      c.beginPath(); c.ellipse(cx, ey + 0.5, 0.9, 1.3, 0, 0, TAU); c.fill();
      c.fillStyle = '#fff';
      c.beginPath(); c.arc(cx - 0.7, ey - 1, 0.7, 0, TAU); c.fill();
      c.beginPath(); c.arc(cx + 0.8, ey + 1.2, 0.4, 0, TAU); c.fill();
      // upper lash
      c.strokeStyle = 'rgba(40,25,35,0.85)'; c.lineWidth = 0.9;
      c.beginPath(); c.arc(cx, ey - 0.4, 2.6, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
      // brow
      c.strokeStyle = shade(spr.hair, -0.3); c.lineWidth = 0.8;
      const browTilt = spr.expr === 'serious' ? 0.7 : spr.expr === 'cool' ? 0.4 : 0;
      c.beginPath();
      c.moveTo(cx - 2.2, ey - 4.6 + browTilt * (sx < 0 ? -0.5 : 0.5) * -sx);
      c.quadraticCurveTo(cx, ey - 5.4, cx + 2.2, ey - 4.6 + browTilt * sx * (sx < 0 ? -1 : 1) * 0.5);
      c.stroke();
    }
    // mouth
    c.strokeStyle = 'rgba(170,80,90,0.95)'; c.lineWidth = 1;
    c.beginPath();
    const my = -17.6;
    if (spr.expr === 'happy') { c.arc(ex, my - 0.8, 2, Math.PI * 0.15, Math.PI * 0.85); }
    else if (spr.expr === 'gentle') { c.arc(ex, my - 0.6, 1.4, Math.PI * 0.2, Math.PI * 0.8); }
    else if (spr.expr === 'smug') { c.arc(ex + 0.8, my - 0.6, 1.6, Math.PI * 0.1, Math.PI * 0.7); }
    else if (spr.expr === 'shy') { c.arc(ex, my, 0.9, 0, TAU); }
    else { c.moveTo(ex - 1.4, my); c.lineTo(ex + 1.4, my); }   // serious / cool
    c.stroke();
    // blush
    if (spr.expr === 'shy' || spr.expr === 'happy' || spr.expr === 'gentle') {
      c.fillStyle = spr.expr === 'shy' ? 'rgba(255,120,140,0.4)' : 'rgba(255,140,150,0.22)';
      c.beginPath(); c.ellipse(-5.8 + ex, -19.5, 1.9, 1.1, 0, 0, TAU); c.fill();
      c.beginPath(); c.ellipse(5.8 + ex, -19.5, 1.9, 1.1, 0, 0, TAU); c.fill();
    }
  } else {
    // compact in-world eyes
    c.fillStyle = shade(spr.eye, -0.2);
    for (const sx of [-1, 1]) {
      c.beginPath(); c.ellipse(sx * 3.2 + ex, ey, 1.3, 2, 0, 0, TAU); c.fill();
    }
    c.fillStyle = '#fff';
    for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * 3.2 + ex - 0.4, ey - 0.6, 0.5, 0, TAU); c.fill(); }
    if (dir === 0) {
      c.strokeStyle = 'rgba(170,80,90,0.8)'; c.lineWidth = 0.8;
      c.beginPath(); c.arc(ex, -18.4, 1.3, Math.PI * 0.2, Math.PI * 0.8); c.stroke();
    }
  }
}

function drawOutfit(c, spr, leg) {
  const o = spr.outfit;
  const pants = o.pants || '#5a4a42';
  // legs / shoes
  const skirted = o.type === 'dress' || o.type === 'gown' || o.type === 'robe' || o.type === 'miko';
  c.fillStyle = skirted ? spr.skin : pants;
  c.fillRect(-5, -9 + Math.max(0, -leg), 4, 9 - Math.max(0, -leg));
  c.fillRect(1, -9 + Math.max(0, leg), 4, 9 - Math.max(0, leg));
  c.fillStyle = '#3a3038';
  c.fillRect(-5.5, -2.5 - Math.max(0, -leg) * 0.4, 5, 2.5);
  c.fillRect(0.5, -2.5 - Math.max(0, leg) * 0.4, 5, 2.5);

  switch (o.type) {
    case 'dress':
      c.fillStyle = o.main;
      c.beginPath(); c.moveTo(-5, -18); c.lineTo(5, -18); c.lineTo(8, -4); c.lineTo(-8, -4); c.closePath(); c.fill();
      c.fillStyle = o.accent;
      c.beginPath(); c.moveTo(-7.4, -6.5); c.lineTo(7.4, -6.5); c.lineTo(8, -4); c.lineTo(-8, -4); c.closePath(); c.fill();
      break;
    case 'gown':
      c.fillStyle = o.main;
      c.beginPath(); c.moveTo(-5, -18); c.lineTo(5, -18); c.lineTo(10, -1); c.lineTo(-10, -1); c.closePath(); c.fill();
      c.fillStyle = o.accent;
      c.fillRect(-1, -18, 2, 15);
      c.beginPath(); c.moveTo(-9.4, -3.2); c.lineTo(9.4, -3.2); c.lineTo(10, -1); c.lineTo(-10, -1); c.closePath(); c.fill();
      break;
    case 'robe':
      c.fillStyle = o.main;
      c.beginPath(); c.moveTo(-5.5, -18); c.lineTo(5.5, -18); c.lineTo(8.5, -0.5); c.lineTo(-8.5, -0.5); c.closePath(); c.fill();
      c.strokeStyle = o.accent; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-2.5, -18); c.lineTo(-4, -1); c.moveTo(2.5, -18); c.lineTo(4, -1); c.stroke();
      break;
    case 'miko':
      c.fillStyle = o.accent;   // red hakama
      c.beginPath(); c.moveTo(-5.5, -12); c.lineTo(5.5, -12); c.lineTo(8, -0.5); c.lineTo(-8, -0.5); c.closePath(); c.fill();
      c.fillStyle = o.main;     // white kimono top
      c.fillRect(-5.5, -18, 11, 6.5);
      c.strokeStyle = 'rgba(120,100,90,0.5)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, -18); c.lineTo(2.5, -12); c.stroke();
      break;
    case 'armor':
      c.fillStyle = o.main;
      rrect(c, -5.5, -18, 11, 10.5, 2.5); c.fill();
      c.fillStyle = shade(o.main, 0.3);
      c.beginPath(); c.arc(-6.2, -16.5, 2.9, 0, TAU); c.arc(6.2, -16.5, 2.9, 0, TAU); c.fill();
      c.strokeStyle = shade(o.main, -0.3); c.lineWidth = 1;
      c.beginPath(); c.moveTo(-5, -13); c.lineTo(5, -13); c.stroke();
      c.fillStyle = o.accent; c.fillRect(-5.5, -9, 11, 2);
      break;
    default:  // tunic
      c.fillStyle = o.main;
      rrect(c, -5.5, -18, 11, 10.5, 2.5); c.fill();
      c.fillStyle = o.accent; c.fillRect(-5.5, -9.5, 11, 2);
  }
}

function drawCharacter(c, x, y, spr, dir, walk, moving, detail) {
  const scale = spr.small ? 0.8 : 1;
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  if (!detail) drawShadow(c, 0, 1.5, 9, 3.2);

  const leg = moving ? Math.sin(walk) * 3 : 0;
  const bob = moving ? Math.abs(Math.sin(walk)) * 1.4 : 0;
  c.translate(0, -bob);

  const style = HAIR[spr.style] || HAIR.short;
  if (style.back) style.back(c, spr.hair, walk);

  drawOutfit(c, spr, leg);

  // arms
  const arm = moving ? Math.sin(walk) * 2.2 : 0;
  c.fillStyle = spr.skin;
  c.beginPath(); c.arc(-7.2, -12.5 + arm, 2.4, 0, TAU); c.fill();
  c.beginPath(); c.arc(7.2, -12.5 - arm, 2.4, 0, TAU); c.fill();

  // head
  c.fillStyle = spr.skin;
  c.beginPath(); c.arc(0, -24, 8, 0, TAU); c.fill();

  drawFace(c, spr, dir, detail);
  if (style.front) style.front(c, spr.hair, walk);
  if (spr.acc && ACC[spr.acc]) ACC[spr.acc](c, spr.accColor || '#fff');

  c.restore();
}

/* ================= portrait ================= */
function drawPortrait(def) {
  const pc = $('portrait').getContext('2d');
  const spr = def.spr || def;   // accept an NPC def or a raw sprite
  pc.clearRect(0, 0, 132, 132);
  // themed backdrop
  const main = (spr.outfit && spr.outfit.main) || '#5b3a8e';
  const g = pc.createRadialGradient(66, 55, 10, 66, 66, 100);
  g.addColorStop(0, shade(main, 0.45)); g.addColorStop(1, shade(main, -0.35));
  pc.fillStyle = g; pc.fillRect(0, 0, 132, 132);
  pc.globalAlpha = 0.16; pc.fillStyle = '#fff';
  for (let i = 0; i < 5; i++) { pc.beginPath(); pc.arc(18 + i * 24, 116 - (i % 2) * 88, 9 + (i % 3) * 5, 0, TAU); pc.fill(); }
  pc.globalAlpha = 1;
  // bust shot: scale the same procedural sprite up, with detailed face
  pc.save();
  pc.translate(66, 138); pc.scale(3.4, 3.4);
  drawCharacter(pc, 0, 0, spr, 0, 0, false, true);
  pc.restore();
}

/* ================= day / night ================= */
function darknessAt(h) {
  if (h >= 7 && h < 17) return 0;
  if (h >= 17 && h < 21) return (h - 17) / 4 * 0.62;
  if (h >= 21 || h < 5) return 0.62;
  return (1 - (h - 5) / 2) * 0.62;   // 5..7 dawn
}
function duskGlowAt(h) {
  if (h >= 16.5 && h <= 19.5) return 0.16 * (1 - Math.abs(h - 18) / 1.5);
  if (h >= 5 && h <= 7.5) return 0.13 * (1 - Math.abs(h - 6.2) / 1.3);
  return 0;
}

let lightCvs = document.createElement('canvas');
let lightCtx = lightCvs.getContext('2d');

function punchLight(x, y, r, strength) {
  const sx = x - cam.x, sy = y - cam.y;
  if (sx < -r || sy < -r || sx > VW + r || sy > VH + r) return;
  const g = lightCtx.createRadialGradient(sx, sy, 0, sx, sy, r);
  g.addColorStop(0, `rgba(255,255,255,${strength})`);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  lightCtx.fillStyle = g;
  lightCtx.beginPath(); lightCtx.arc(sx, sy, r, 0, TAU); lightCtx.fill();
}

function drawLighting() {
  const d = darknessAt(game.time);
  const glow = duskGlowAt(game.time);
  if (glow > 0.01) {
    ctx.fillStyle = `rgba(255,150,70,${glow})`;
    ctx.fillRect(0, 0, VW, VH);
  }
  if (d < 0.02) return;
  lightCtx.clearRect(0, 0, VW, VH);
  lightCtx.globalCompositeOperation = 'source-over';
  lightCtx.fillStyle = `rgba(14,18,66,${d})`;
  lightCtx.fillRect(0, 0, VW, VH);
  lightCtx.globalCompositeOperation = 'destination-out';
  punchLight(player.x, player.y - 10, 105, 0.75);
  for (const l of WORLD.lamps) punchLight(l.x, l.y - 28, 115, 0.95);
  for (const h of WORLD.houses) {
    const hx = h.tx * TILE, hy = h.ty * TILE;
    punchLight(hx + h.w * TILE * 0.24, hy + h.h * TILE * 0.62, 46, 0.6);
    punchLight(hx + h.w * TILE * 0.78, hy + h.h * TILE * 0.62, 46, 0.6);
  }
  lightCtx.globalCompositeOperation = 'source-over';
  ctx.drawImage(lightCvs, 0, 0);
}

/* ================= minimap ================= */
const MM_COLORS = {
  [T.GRASS]: '#69b558', [T.WATER]: '#3a7ac8', [T.SAND]: '#e0cf90', [T.PATH]: '#cbb083',
  [T.ROCK]: '#8d8d99', [T.WALL]: '#4a4555', [T.FOREST]: '#3f7a3f', [T.SECRET]: '#6a4a9a', [T.BRIDGE]: '#a5762f',
};
let mmBase = document.createElement('canvas');
function buildMinimapBase() {
  mmBase.width = MAP_W; mmBase.height = MAP_H;
  const c = mmBase.getContext('2d');
  for (let ty = 0; ty < MAP_H; ty++)
    for (let tx = 0; tx < MAP_W; tx++) {
      c.fillStyle = MM_COLORS[tileAt(tx, ty)];
      c.fillRect(tx, ty, 1, 1);
    }
  for (const h of WORLD.houses) { c.fillStyle = h.roof; c.fillRect(h.tx, h.ty, h.w, h.h); }
}
function drawMinimap() {
  const mm = $('minimap').getContext('2d');
  const W = 164, H = 123;
  mm.imageSmoothingEnabled = false;
  mm.drawImage(mmBase, 0, 0, W, H);
  const kx = W / WORLD_PW, ky = H / WORLD_PH;
  // NPC dots (gold = has a quest for you)
  for (const n of npcs) {
    const qs = questsFor(n.def.id);
    const busy = qs.available.length || qs.completable.length || qs.deliveries.length;
    mm.fillStyle = busy ? '#ffd166' : '#ff8fb3';
    mm.fillRect(n.x * kx - 1.5, n.y * ky - 1.5, 3, 3);
  }
  // player
  mm.fillStyle = '#fff';
  mm.beginPath(); mm.arc(player.x * kx, player.y * ky, 2.6, 0, TAU); mm.fill();
  mm.strokeStyle = '#222'; mm.lineWidth = 1;
  mm.beginPath(); mm.arc(player.x * kx, player.y * ky, 2.6, 0, TAU); mm.stroke();
  // viewport
  mm.strokeStyle = 'rgba(255,255,255,0.55)';
  mm.strokeRect(cam.x * kx, cam.y * ky, VW * kx, VH * ky);
}

/* ================= scene render ================= */
function drawNPCLabel(c, n) {
  const d = dist(player.x, player.y, n.x, n.y);
  const qs = questsFor(n.def.id);
  const mark = qs.completable.length || qs.deliveries.length ? '✔' : qs.available.length ? '!' : '';
  if (mark) {
    const bob = Math.sin(performance.now() / 250) * 2.5;
    c.font = 'bold 15px sans-serif'; c.textAlign = 'center';
    c.fillStyle = mark === '!' ? '#ffd166' : '#7ef9a0';
    c.strokeStyle = 'rgba(0,0,0,0.7)'; c.lineWidth = 3;
    c.strokeText(mark, n.x, n.y - 44 + bob);
    c.fillText(mark, n.x, n.y - 44 + bob);
  }
  if (d < 110) {
    c.font = 'bold 10px sans-serif'; c.textAlign = 'center';
    c.strokeStyle = 'rgba(0,0,0,0.7)'; c.lineWidth = 3;
    c.strokeText(n.def.name, n.x, n.y - 36);
    c.fillStyle = '#fff';
    c.fillText(n.def.name, n.x, n.y - 36);
  }
}

function render(t) {
  ctx.clearRect(0, 0, VW, VH);
  ctx.save();
  ctx.translate(-Math.round(cam.x), -Math.round(cam.y));

  drawTiles(ctx, t);

  const dark = darknessAt(game.time);
  const view = { x0: cam.x - 80, y0: cam.y - 80, x1: cam.x + VW + 80, y1: cam.y + VH + 80 };
  const inView = (x, y) => x > view.x0 && x < view.x1 && y > view.y0 && y < view.y1;

  // y-sorted draw list
  const list = [];
  for (const tr of WORLD.trees) if (inView(tr.x, tr.y)) list.push({ y: tr.y, f: () => drawTree(ctx, tr, t) });
  for (const h of WORLD.houses) { const hy = (h.ty + h.h) * TILE; if (inView(h.tx * TILE, hy)) list.push({ y: hy, f: () => drawHouse(ctx, h, dark) }); }
  for (const r of WORLD.rocks) if (inView(r.x, r.y)) list.push({ y: r.y, f: () => drawRock(ctx, r) });
  for (const th of WORLD.thorns) if (inView(th.x, th.y)) list.push({ y: th.y, f: () => drawThorn(ctx, th, t) });
  for (const l of WORLD.lamps) if (inView(l.x, l.y)) list.push({ y: l.y, f: () => drawLamp(ctx, l, dark, t) });
  for (const d of WORLD.deco) if (inView(d.x, d.y)) list.push({ y: d.y, f: () => (d.type === 'well' ? drawWell(ctx, d) : drawTorii(ctx, d)) });
  for (const nd of WORLD.nodes) if (inView(nd.x, nd.y)) list.push({ y: nd.y, f: () => drawNode(ctx, nd, t) });
  for (const ch of WORLD.chests) if (inView(ch.x, ch.y)) list.push({ y: ch.y, f: () => drawChest(ctx, ch, t) });
  for (const n of npcs) if (inView(n.x, n.y)) list.push({ y: n.y, f: () => { drawCharacter(ctx, n.x, n.y, n.def.spr, n.dir, n.walk, n.moving, false); drawNPCLabel(ctx, n); } });
  if (game.started) list.push({ y: player.y, f: () => drawCharacter(ctx, player.x, player.y, player.spr, player.dir, player.walk, player.moving, false) });

  list.sort((a, b) => a.y - b.y);
  for (const it of list) it.f();

  // fishing bobber + exclamation
  if (fishing) {
    const s = fishing.spot;
    const bob = Math.sin(t * 4) * 2;
    ctx.fillStyle = '#e05561';
    ctx.beginPath(); ctx.arc(s.x, s.y + bob, 4, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s.x, s.y + bob, 4, 0, Math.PI); ctx.fill();
    if (fishing.phase === 'bite') {
      ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 4;
      ctx.strokeText('!', s.x, s.y - 18);
      ctx.fillStyle = '#ffd166';
      ctx.fillText('!', s.x, s.y - 18);
    }
  }

  // fishing spot markers
  for (const fs of WORLD.fishSpots) {
    if (!inView(fs.x, fs.y) || (fishing && fishing.spot === fs)) continue;
    ctx.strokeStyle = `rgba(255,255,255,${0.3 + 0.2 * Math.sin(t * 2 + fs.x)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(fs.x, fs.y, 10 + Math.sin(t * 2) * 2, 5 + Math.sin(t * 2), 0, 0, TAU); ctx.stroke();
  }

  drawParticles(ctx, t);
  ctx.restore();

  drawLighting();
}

/* ================= ambient effects ================= */
function updateAmbient(dt) {
  const z = game.zone;
  const dark = darknessAt(game.time);
  if (z.includes('Forest') && Math.random() < dt * 2.5)
    spawnParticle('leaf', cam.x + Math.random() * VW, cam.y + Math.random() * VH * 0.5);
  if (z.includes('Secret') && Math.random() < dt * 4)
    spawnParticle('sparkle', cam.x + Math.random() * VW, cam.y + Math.random() * VH);
  if (dark > 0.3 && (z.includes('Forest') || z.includes('Meadows')) && Math.random() < dt * 3)
    spawnParticle('firefly', cam.x + Math.random() * VW, cam.y + Math.random() * VH);
}

/* ================= main loop ================= */
let lastTS = 0;
function frame(ts) {
  const t = ts / 1000;
  const dt = Math.min(0.05, lastTS ? t - lastTS : 0.016);
  lastTS = t;

  if (game.started && !game.paused) {
    // clock
    game.time += dt * HOURS_PER_SEC;
    if (game.time >= 24) { game.time -= 24; game.day++; }

    const uiBlocked = dialog.npc || !$('shopPanel').classList.contains('hidden');
    if (!uiBlocked) {
      updatePlayer(dt);
      if (interactPressed) { doInteract(); interactPressed = false; }
    }
    interactPressed = false;
    updateNPCs(dt);
    updateFishing(dt);
    updateAmbient(dt);
    updateParticles(dt);

    // camera follows player (smoothed)
    const targX = clamp(player.x - VW / 2, 0, WORLD_PW - VW);
    const targY = clamp(player.y - VH / 2, 0, WORLD_PH - VH);
    cam.x += (targX - cam.x) * Math.min(1, dt * 7);
    cam.y += (targY - cam.y) * Math.min(1, dt * 7);

    updateZoneBanner();
    updateHint();
    updateHUD();
    drawMinimap();

    game.autosaveT += dt;
    if (game.autosaveT > 30) { game.autosaveT = 0; saveGame(true); }
  } else if (!game.started) {
    // gentle title-screen camera drift over the village
    const a = t * 0.05;
    cam.x = clamp(70 * TILE + Math.cos(a) * 300 - VW / 2, 0, WORLD_PW - VW);
    cam.y = clamp(75 * TILE + Math.sin(a) * 200 - VH / 2, 0, WORLD_PH - VH);
    updateParticles(dt);
  }

  render(t);
  requestAnimationFrame(frame);
}

/* ================= boot ================= */
function resize() {
  VW = cvs.width = window.innerWidth;
  VH = cvs.height = window.innerHeight;
  lightCvs.width = VW; lightCvs.height = VH;
}

function startGame(fresh) {
  game.started = true;
  $('titleScreen').classList.add('hidden');
  $('hud').classList.remove('hidden');
  trackerDirty = true;
  if (fresh) toast('🌸 Welcome to Sunhaven! Press <b>E</b> to talk to villagers.', true);
  else toast('💾 Save loaded — welcome back!', true);
}

function boot() {
  genWorld();
  player = makePlayer();
  initNPCs();
  buildMinimapBase();
  resize();
  window.addEventListener('resize', resize);
  $('dText').addEventListener('click', () => { if (dialog.npc) advanceDialog(); });

  if (hasSave()) $('btnContinue').classList.remove('hidden');
  $('btnContinue').onclick = () => { loadGame(); startGame(false); };
  $('btnNew').onclick = () => startGame(true);

  requestAnimationFrame(frame);
}
boot();
