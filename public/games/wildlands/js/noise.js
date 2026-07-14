// Value noise ber-seed + FBM. Seluruh dunia dihitung dari sini —
// seed sama, benua sama, selamanya.

function hash2(x, y, seed) {
  var h = (x | 0) * 374761393 + (y | 0) * 668265263 + (seed | 0) * 1440662683;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967295;
}

function smoothN(t) { return t * t * (3 - 2 * t); }

function valueNoise(x, y, seed) {
  var x0 = Math.floor(x), y0 = Math.floor(y);
  var fx = smoothN(x - x0), fy = smoothN(y - y0);
  var a = hash2(x0, y0, seed), b = hash2(x0 + 1, y0, seed);
  var c = hash2(x0, y0 + 1, seed), d = hash2(x0 + 1, y0 + 1, seed);
  var top = a + (b - a) * fx, bot = c + (d - c) * fx;
  return top + (bot - top) * fy;
}

function fbm(x, y, seed, oct) {
  var amp = 1, freq = 1, sum = 0, norm = 0;
  for (var i = 0; i < oct; i++) {
    sum += valueNoise(x * freq, y * freq, seed + i * 1013) * amp;
    norm += amp; amp *= 0.5; freq *= 2;
  }
  return sum / norm;
}

// random stabil per-tile: tile yang sama selalu memberi angka yang sama
function tileRandom(tx, ty, salt) {
  return hash2(tx * 7919 + (salt | 0) * 104729, ty * 6271 + (salt | 0) * 3571, 1337);
}
