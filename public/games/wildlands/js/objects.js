// Definisi objek dunia: HP, drop, alat yang dibutuhkan, dan fungsi draw.
// Semua art prosedural — tidak ada file gambar di proyek ini.

function objShadow(g, x, y, w) {
  g.fillStyle = 'rgba(0,0,0,0.22)';
  g.beginPath(); g.ellipse(x + 16, y + 28, w, w * 0.4, 0, 0, Math.PI * 2); g.fill();
}

var OBJ = {
  tree: {
    name: 'tree', label: 'Pohon', solid: true, hp: 3, tool: 'axe', regrow: 'tree',
    drops: { kayu: 3 },
    draw: function (g, x, y, t, tx) {
      var sway = Math.sin(t * 0.0013 + tx * 0.7) * 1.6;
      objShadow(g, x, y, 9);
      g.fillStyle = '#5b3a22'; g.fillRect(x + 14, y + 14, 5, 14);
      g.fillStyle = '#2c5f30';
      g.beginPath(); g.moveTo(x + 16 + sway, y - 8); g.lineTo(x + 30, y + 18); g.lineTo(x + 2, y + 18); g.closePath(); g.fill();
      g.fillStyle = '#3d7a3f';
      g.beginPath(); g.moveTo(x + 16 + sway, y - 2); g.lineTo(x + 26, y + 16); g.lineTo(x + 6, y + 16); g.closePath(); g.fill();
    },
  },
  jungleTree: {
    name: 'jungleTree', label: 'Pohon Rimba', solid: true, hp: 4, tool: 'axe', regrow: 'tree',
    drops: { kayu: 4 },
    draw: function (g, x, y, t, tx) {
      var sway = Math.sin(t * 0.0011 + tx) * 2;
      objShadow(g, x, y, 10);
      g.fillStyle = '#4a3520'; g.fillRect(x + 14, y + 10, 5, 18);
      g.fillStyle = '#1d4f2b';
      g.beginPath(); g.ellipse(x + 16 + sway, y + 6, 15, 11, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#2a6b38';
      g.beginPath(); g.ellipse(x + 12 + sway, y + 2, 9, 7, 0, 0, Math.PI * 2); g.fill();
    },
  },
  bush: {
    name: 'bush', label: 'Semak Beri', solid: false, hp: 1, regrow: 'bush',
    drops: { makanan: 2 },
    draw: function (g, x, y) {
      g.fillStyle = '#2f6b3a';
      g.beginPath(); g.ellipse(x + 16, y + 20, 10, 8, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#c0392b';
      for (var i = 0; i < 3; i++) { g.beginPath(); g.arc(x + 10 + i * 6, y + 17 + (i % 2) * 4, 2.2, 0, Math.PI * 2); g.fill(); }
    },
  },
  rock: {
    name: 'rock', label: 'Batu', solid: true, hp: 4, tool: 'pick',
    drops: { batu: 3 },
    draw: function (g, x, y) {
      objShadow(g, x, y, 9);
      g.fillStyle = '#8d8b86';
      g.beginPath(); g.moveTo(x + 5, y + 26); g.lineTo(x + 9, y + 10); g.lineTo(x + 22, y + 7); g.lineTo(x + 28, y + 20); g.lineTo(x + 24, y + 27); g.closePath(); g.fill();
      g.fillStyle = '#a8a6a1';
      g.beginPath(); g.moveTo(x + 9, y + 11); g.lineTo(x + 21, y + 8); g.lineTo(x + 16, y + 18); g.closePath(); g.fill();
    },
  },
  oreVein: {
    name: 'oreVein', label: 'Urat Besi', solid: true, hp: 6, tool: 'pick', regrow: 'ore',
    drops: { batu: 2, besi: 2 },
    draw: function (g, x, y, t) {
      objShadow(g, x, y, 9);
      g.fillStyle = '#6f6d68';
      g.beginPath(); g.moveTo(x + 5, y + 26); g.lineTo(x + 8, y + 9); g.lineTo(x + 24, y + 8); g.lineTo(x + 28, y + 26); g.closePath(); g.fill();
      var p = 0.55 + Math.sin(t * 0.004) * 0.25;
      g.fillStyle = 'rgba(220,160,90,' + p.toFixed(2) + ')';
      g.beginPath(); g.arc(x + 13, y + 16, 3, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(x + 21, y + 21, 2.4, 0, Math.PI * 2); g.fill();
    },
  },
  starVein: {
    name: 'starVein', label: 'Bijih Bintang', solid: true, hp: 8, tool: 'pick2', regrow: 'star',
    drops: { bintang: 2 },
    draw: function (g, x, y, t) {
      objShadow(g, x, y, 9);
      g.fillStyle = '#4b4f5c';
      g.beginPath(); g.moveTo(x + 6, y + 26); g.lineTo(x + 9, y + 8); g.lineTo(x + 25, y + 9); g.lineTo(x + 27, y + 26); g.closePath(); g.fill();
      var p = 0.5 + Math.sin(t * 0.006) * 0.35;
      g.fillStyle = 'rgba(150,210,255,' + p.toFixed(2) + ')';
      g.beginPath(); g.arc(x + 14, y + 15, 3.4, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(x + 22, y + 20, 2.2, 0, Math.PI * 2); g.fill();
    },
  },
  cactus: {
    name: 'cactus', label: 'Kaktus', solid: true, hp: 2,
    drops: { makanan: 1, kayu: 1 },
    draw: function (g, x, y) {
      objShadow(g, x, y, 6);
      g.fillStyle = '#3f7a4a';
      g.fillRect(x + 13, y + 6, 7, 22); g.fillRect(x + 6, y + 13, 6, 5); g.fillRect(x + 21, y + 16, 6, 5);
    },
  },
  wall: {
    name: 'wall', label: 'Tembok', solid: true, hp: 8, tool: 'pick',
    drops: { batu: 2 },
    draw: function (g, x, y) {
      g.fillStyle = '#6b6560'; g.fillRect(x + 2, y + 6, 28, 22);
      g.fillStyle = '#847d76'; g.fillRect(x + 4, y + 8, 11, 8); g.fillRect(x + 17, y + 8, 11, 8); g.fillRect(x + 4, y + 18, 24, 8);
    },
  },
  hut: {
    name: 'hut', label: 'Gubuk', solid: true, hp: 999,
    drops: {},
    draw: function (g, x, y) {
      objShadow(g, x, y, 12);
      g.fillStyle = '#8a6a45'; g.fillRect(x + 4, y + 12, 24, 16);
      g.fillStyle = '#5d4630';
      g.beginPath(); g.moveTo(x, y + 13); g.lineTo(x + 16, y - 2); g.lineTo(x + 32, y + 13); g.closePath(); g.fill();
      g.fillStyle = '#2b1d12'; g.fillRect(x + 13, y + 19, 7, 9);
    },
  },
  pillar: {
    name: 'pillar', label: 'Pilar Runtuh', solid: true, hp: 6, tool: 'pick',
    drops: { batu: 3 },
    draw: function (g, x, y) {
      objShadow(g, x, y, 7);
      g.fillStyle = '#9b9891'; g.fillRect(x + 10, y - 4, 12, 32);
      g.fillStyle = '#7d7a74'; g.fillRect(x + 8, y - 6, 16, 5); g.fillRect(x + 8, y + 24, 16, 5);
    },
  },
  chest: {
    name: 'chest', label: 'Peti', solid: true, hp: 1, chest: true,
    drops: {},
    draw: function (g, x, y, t) {
      objShadow(g, x, y, 8);
      var gl = 0.3 + Math.sin(t * 0.003) * 0.15;
      g.fillStyle = 'rgba(255,200,80,' + gl.toFixed(2) + ')';
      g.beginPath(); g.arc(x + 16, y + 18, 16, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#8a5a2b'; g.fillRect(x + 6, y + 12, 20, 15);
      g.fillStyle = '#c8992f'; g.fillRect(x + 6, y + 16, 20, 3); g.fillRect(x + 14, y + 18, 4, 5);
    },
  },
  campfireWild: {
    name: 'campfireWild', label: 'Api Unggun Liar', solid: false, hp: 2, fire: true, light: 150,
    drops: { kayu: 2 },
    draw: function (g, x, y, t) { drawFireSmall(g, x, y, t); },
  },
  campfire: {
    name: 'campfire', label: 'Api Unggun', solid: false, hp: 2, fire: true, light: 150, placed: true,
    drops: { kayu: 4, batu: 2 },
    draw: function (g, x, y, t) { drawFireSmall(g, x, y, t); },
  },
  beacon: {
    name: 'beacon', label: 'Suar', solid: false, hp: 4, fire: true, light: 170, placed: true, beacon: true,
    drops: { kayu: 4, batu: 4 },
    draw: function (g, x, y, t) {
      drawFireSmall(g, x, y, t);
      // cairn + kain berkibar: penanda "ini milikmu"
      g.fillStyle = '#8d8b86';
      g.beginPath(); g.arc(x + 27, y + 24, 4, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(x + 25, y + 19, 3, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(x + 28, y + 15, 2.2, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#6a5138'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(x + 28, y + 14); g.lineTo(x + 28, y - 2); g.stroke();
      var wave = Math.sin(t * 0.006) * 3;
      g.fillStyle = '#c8524a';
      g.beginPath(); g.moveTo(x + 28, y - 2); g.lineTo(x + 38 + wave, y + 1); g.lineTo(x + 28, y + 5); g.closePath(); g.fill();
    },
  },
  tower: {
    name: 'tower', label: 'Menara Bara', solid: true, hp: 9999, fire: true, light: 320, tower: true,
    drops: {},
    draw: function (g, x, y, t) { /* digambar besar oleh render.js */ },
  },
  towerPad: { name: 'towerPad', label: '', solid: true, hp: 9999, drops: {}, draw: function () {} },
  farm: {
    name: 'farm', label: 'Ladang', solid: false, hp: 999, drops: {},
    draw: function (g, x, y, t) {
      g.fillStyle = '#5d4630'; g.fillRect(x + 2, y + 4, 28, 24);
      g.fillStyle = '#679f4c';
      for (var i = 0; i < 3; i++) g.fillRect(x + 5 + i * 9, y + 7, 4, 18);
    },
  },
  forge: {
    name: 'forge', label: 'Landasan Neyra', solid: true, hp: 9999, drops: {},
    draw: function (g, x, y, t) {
      objShadow(g, x, y, 10);
      g.fillStyle = '#4a4a4e'; g.fillRect(x + 6, y + 14, 20, 12);
      g.fillStyle = '#2e2e31'; g.fillRect(x + 10, y + 8, 12, 8);
      var p = 0.4 + Math.sin(t * 0.01) * 0.3;
      g.fillStyle = 'rgba(255,120,40,' + p.toFixed(2) + ')';
      g.fillRect(x + 13, y + 10, 6, 4);
    },
  },
  dock: {
    name: 'dock', label: 'Dermaga', solid: false, hp: 9999, drops: {},
    draw: function (g, x, y) {
      g.fillStyle = '#7a5c3a'; g.fillRect(x + 2, y + 6, 28, 20);
      g.strokeStyle = '#5d4630'; g.lineWidth = 2;
      for (var i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x + 2, y + 10 + i * 6); g.lineTo(x + 30, y + 10 + i * 6); g.stroke(); }
    },
  },
  lanternBlock: { name: 'lanternBlock', label: 'Pelita', solid: true, hp: 9999, drops: {}, lantern: true, draw: function () {} },
};

function drawFireSmall(g, x, y, t) {
  var f = Math.sin(t * 0.012) * 2;
  g.fillStyle = '#5b3a22'; g.fillRect(x + 8, y + 22, 16, 4);
  g.fillStyle = '#e8792b';
  g.beginPath(); g.moveTo(x + 16, y + 6 - f); g.lineTo(x + 23, y + 23); g.lineTo(x + 9, y + 23); g.closePath(); g.fill();
  g.fillStyle = '#ffd15c';
  g.beginPath(); g.moveTo(x + 16, y + 13 - f * 0.5); g.lineTo(x + 20, y + 23); g.lineTo(x + 12, y + 23); g.closePath(); g.fill();
}
