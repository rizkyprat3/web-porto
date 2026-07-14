// Semua suara di-generate lewat WebAudio oscillator. Tanpa file audio.

var AudioSys = { ctx: null, muted: false };

function actx() {
  if (!AudioSys.ctx) {
    try { AudioSys.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
  }
  if (AudioSys.ctx.state === 'suspended') AudioSys.ctx.resume();
  return AudioSys.ctx;
}

function blip(freq, dur, type, vol, slide) {
  if (AudioSys.muted) return;
  var c = actx(); if (!c) return;
  var o = c.createOscillator(), g = c.createGain();
  o.type = type || 'square';
  o.frequency.setValueAtTime(freq, c.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), c.currentTime + dur);
  g.gain.setValueAtTime(vol || 0.08, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  o.connect(g); g.connect(c.destination);
  o.start(); o.stop(c.currentTime + dur);
}

function noiseBurst(dur, vol) {
  if (AudioSys.muted) return;
  var c = actx(); if (!c) return;
  var len = Math.floor(c.sampleRate * dur);
  var buf = c.createBuffer(1, len, c.sampleRate);
  var data = buf.getChannelData(0);
  for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  var src = c.createBufferSource(), g = c.createGain();
  src.buffer = buf;
  g.gain.value = vol || 0.06;
  src.connect(g); g.connect(c.destination);
  src.start();
}

var SFX = {
  swing: function () { noiseBurst(0.08, 0.03); },
  hit: function () { blip(180, 0.08, 'square', 0.06, -80); },
  block: function () { blip(520, 0.06, 'square', 0.05); },
  kill: function () { noiseBurst(0.18, 0.07); blip(120, 0.2, 'sawtooth', 0.05, -60); },
  hurt: function () { blip(90, 0.22, 'sawtooth', 0.09, -40); },
  chop: function () { blip(140, 0.05, 'square', 0.05, -30); noiseBurst(0.04, 0.03); },
  chest: function () { blip(520, 0.1, 'sine', 0.07); setTimeout(function () { blip(660, 0.1, 'sine', 0.07); }, 90); setTimeout(function () { blip(880, 0.18, 'sine', 0.07); }, 180); },
  craft: function () { blip(440, 0.08, 'sine', 0.06); setTimeout(function () { blip(587, 0.12, 'sine', 0.06); }, 80); },
  eat: function () { blip(300, 0.08, 'sine', 0.05, 60); },
  dodge: function () { noiseBurst(0.06, 0.03); },
  arrow: function () { blip(900, 0.09, 'sine', 0.03, -500); },
  howl: function () { blip(340, 0.9, 'sine', 0.04, 120); },
  death: function () { blip(200, 1.2, 'sawtooth', 0.09, -160); },
  workGood: function () { blip(660, 0.09, 'sine', 0.07); },
  workBad: function () { blip(160, 0.14, 'square', 0.06, -40); },
  teleport: function () { blip(400, 0.5, 'sine', 0.06, 500); },
  lantern: function () {
    // akor naik: momen puncak babak
    var notes = [262, 330, 392, 523, 659];
    for (var i = 0; i < notes.length; i++) {
      (function (f, d) { setTimeout(function () { blip(f, 0.7, 'sine', 0.07); }, d); })(notes[i], i * 160);
    }
  },
  // chime achievement dua-nada ala Steam: bel cerah + harmonik + kelap-kelip.
  // Di-synthesize penuh — bukan file, tapi karakternya sama memuaskannya.
  achievement: function () {
    if (AudioSys.muted) return;
    var c = actx(); if (!c) return;
    function bell(freq, when, dur, vol) {
      var t0 = c.currentTime + when;
      var partials = [[1, 1], [2.76, 0.35], [5.4, 0.12]];   // partial bel nyata
      for (var i = 0; i < partials.length; i++) {
        var o = c.createOscillator(), g = c.createGain();
        o.type = 'sine';
        o.frequency.value = freq * partials[i][0];
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(vol * partials[i][1], t0 + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g); g.connect(c.destination);
        o.start(t0); o.stop(t0 + dur + 0.05);
      }
    }
    bell(740, 0, 0.9, 0.10);      // F#5 — "dö"
    bell(1108.7, 0.14, 1.4, 0.09); // C#6 — "DING" yang menggantung
    // kelap-kelip kecil di ekor
    setTimeout(function () { blip(2217, 0.4, 'sine', 0.02); }, 320);
  },
};
