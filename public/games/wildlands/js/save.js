// Save/load ke localStorage dengan nomor versi skema.

var SAVE_VERSION = 1;

function saveGame() {
  if (!G.world || G.state === 'menu') return;
  var p = G.player;
  var data = {
    version: SAVE_VERSION,
    seed: G.world.seed,
    worldSize: CFG.WORLD,
    mode: G.mode, diff: G.diff, mods: G.mods,
    time: G.time,
    player: {
      x: p.x, y: p.y, hp: p.hp, hunger: p.hunger, stam: p.stam, temp: p.temp,
      inv: p.inv, has: p.has, weakened: p.weakened,
    },
    harvested: G.world.harvested,
    placed: G.world.placed,
    looted: G.world.looted,
    grave: G.grave,
    story: G.story,
    rel: G.rel, relDay: G.relDay,
    beacons: G.beacons,
    seen: G.seen,
    workedToday: G.workedToday,
    stats: G.stats,
    fog: G.fog ? fogPack(G.fog) : null,
  };
  try { LS.set(CFG.SAVE_KEY, JSON.stringify(data)); } catch (e) { /* penuh — biarkan */ }
}

function fogPack(fog) {
  var s = '';
  for (var i = 0; i < fog.length; i += 8) {
    var b = 0;
    for (var j = 0; j < 8; j++) if (fog[i + j]) b |= (1 << j);
    s += String.fromCharCode(b + 35);
  }
  return s;
}

function fogUnpack(s) {
  var fog = new Uint8Array(128 * 128);
  for (var i = 0; i < s.length; i++) {
    var b = s.charCodeAt(i) - 35;
    for (var j = 0; j < 8; j++) if (b & (1 << j)) fog[i * 8 + j] = 1;
  }
  return fog;
}

function hasSave() {
  return !!LS.get(CFG.SAVE_KEY);
}

function loadGame(onReady) {
  var raw = LS.get(CFG.SAVE_KEY);
  if (!raw) return false;
  var d;
  try { d = JSON.parse(raw); } catch (e) { return false; }
  if (d.version !== SAVE_VERSION) {
    alert('Save dari versi lama tidak bisa dimuat. Mulai dunia baru.');
    LS.remove(CFG.SAVE_KEY);
    return false;
  }
  CFG.WORLD = d.worldSize || 4096;
  G.mode = d.mode; G.diff = d.diff; G.mods = d.mods || {};
  startWorldGen(d.seed, function (world) {
    G.world = world; G.anchors = world.anchors;
    world.harvested = d.harvested || {};
    world.placed = d.placed || {};
    world.looted = d.looted || {};
    G.time = d.time;
    G.player = makePlayer(d.player.x, d.player.y);
    var p = G.player, sp = d.player;
    p.hp = sp.hp; p.hunger = sp.hunger; p.stam = sp.stam; p.temp = sp.temp;
    p.inv = sp.inv; p.has = sp.has; p.weakened = sp.weakened;
    G.grave = d.grave || null;
    G.story = d.story;
    G.rel = d.rel || {}; G.relDay = d.relDay || {};
    G.beacons = d.beacons || [];
    G.seen = d.seen || {};
    G.workedToday = d.workedToday || {};
    G.stats = d.stats || {};
    G.fog = d.fog ? fogUnpack(d.fog) : null;
    npcInit();
    onReady();
  });
  return true;
}

var autosaveTimer = 0;
function autoSave() { saveGame(); }
function updateAutosave(dt) {
  autosaveTimer += dt;
  if (autosaveTimer > 45) { autosaveTimer = 0; saveGame(); }
}
window.addEventListener('beforeunload', function () { if (G.state === 'play' || G.state === 'pause') saveGame(); });
