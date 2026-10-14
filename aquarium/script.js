(() => {
  const $ = s => document.querySelector(s);
  const cv = $('#tank'), ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- palette ----------
  const INK = [[43, 60, 181], [255, 94, 156], [255, 210, 61]];   // blue, pink, yellow
  const SEC = [[255, 94, 156], [43, 60, 181], [255, 94, 156]];    // second ink that goes with each first ink
  const WATER = [207, 228, 218];
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---------- state ----------
  let W = 0, H = 0, DPR = 1, S = 1, T = 0, ready = false;
  let bed = null, grain = null;
  const ptr = { x: -999, y: -999, on: false, speed: 0, t: 0 };
  let hush = false, hushAmt = 0, selInk = 1;
  let cur = 0.5, speedMul = 1;
  const drops = [], bubbles = [], eyes = [];
  const seen = new Set();
  let J, RB, SP = [], BL, SPORE;
  let currentPhase = 0, weedPhase = 0;
  const ripples = []; let pour = null, lastRip = 0;
  const game = { on: false, pearl: null, score: 0, best: 0, grace: 0, dead: 0 };
  const keys = new Set();
  function addDrop(x, y, ink, max) {
    if (drops.length > 40) drops.shift();
    drops.push({ x, y, ink, age: 0, r: 0, max, seed: Math.random() * 1000, hit: new Set() });
  }

  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const bedY = x => H - 70 * S - 22 * S * Math.sin(x * 0.0045 + 1.3) - 12 * S * Math.sin(x * 0.013 + 0.4) - 7 * S * Math.sin(x * 0.031);

  // ---------- sound and touch ----------
  const buzz = p => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (_) {} };
  const Snd = (() => {
    let ac = null, master = null, lp = null, rOsc = null, rGain = null, enabled = false, hushOn = false;
    const last = {};
    const ok = (k, gap) => { const n = performance.now(); if (n - (last[k] || 0) < gap) return false; last[k] = n; return true; };
    const PENT = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    function ensure() {
      if (ac) return true;
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      try { ac = new AC(); } catch (_) { return false; }
      master = ac.createGain(); master.gain.value = 0;
      lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = hushOn ? 450 : 9000; lp.Q.value = 0.5;
      master.connect(lp); lp.connect(ac.destination);
      // ambient water: brown noise through a slowly moving filter, plus two low tones
      const len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      let b = 0; for (let i = 0; i < len; i++) { b = (b + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = b * 3.5; }
      const ns = ac.createBufferSource(); ns.buffer = buf; ns.loop = true;
      const nf = ac.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 380;
      const ng = ac.createGain(); ng.gain.value = 0.16;
      ns.connect(nf); nf.connect(ng); ng.connect(master); ns.start();
      const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 140; lfo.connect(lg); lg.connect(nf.frequency); lfo.start();
      [55, 82.5].forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f * (1 + i * 0.002); g.gain.value = 0.03; o.connect(g); g.connect(master); o.start(); });
      // the ribbon hums while it follows you
      rOsc = ac.createOscillator(); rOsc.type = 'sine'; rOsc.frequency.value = 220;
      rGain = ac.createGain(); rGain.gain.value = 0; rOsc.connect(rGain); rGain.connect(master); rOsc.start();
      return true;
    }
    function tone(f, dur, type, vol, f2, delay) {
      if (!enabled) return;
      const t = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
    }
    function noise(dur, f, q, vol, type, delay) {
      if (!enabled) return;
      const t = ac.currentTime + (delay || 0), n = Math.max(1, (ac.sampleRate * dur) | 0), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const s = ac.createBufferSource(); s.buffer = buf;
      const fl = ac.createBiquadFilter(); fl.type = type || 'bandpass'; fl.frequency.value = f; fl.Q.value = q || 1;
      const g = ac.createGain(); g.gain.value = vol; s.connect(fl); fl.connect(g); g.connect(master); s.start(t);
    }
    return {
      enable(v) {
        if (v && !ensure()) return;
        enabled = v; if (!ac) return;
        if (ac.state === 'suspended') ac.resume();
        master.gain.setTargetAtTime(v ? 0.9 : 0, ac.currentTime, 0.2);
        lp.frequency.setTargetAtTime(hushOn ? 450 : 9000, ac.currentTime, 0.05);
      },
      hush(v) { hushOn = v; if (ac) lp.frequency.setTargetAtTime(v ? 450 : 9000, ac.currentTime, 0.3); },
      bloop(i) { const f = [196, 261.6, 392][i]; tone(f * 2, 0.22, 'sine', 0.2, f); tone(f * 3, 0.12, 'sine', 0.05, f * 1.5, 0.03); },
      drip(i) { if (!ok('drip', 110)) return; const f = [392, 523, 784][i]; tone(f, 0.09, 'sine', 0.06, f * 0.7); },
      pop() { noise(0.06, 2400, 1.2, 0.35, 'highpass'); tone(700, 0.09, 'sine', 0.18, 220); },
      chime() { const a = (Math.random() * 4) | 0; tone(PENT[a], 1.1, 'triangle', 0.1); tone(PENT[a + 2], 1.3, 'triangle', 0.08, 0, 0.13); },
      tik() { if (!ok('tik', 70)) return; tone(1500 + Math.random() * 900, 0.04, 'sine', 0.05); },
      thump() { tone(95, 0.45, 'sine', 0.13, 48); },
      breath(open) { noise(0.5, open ? 900 : 500, 0.8, 0.12, 'bandpass'); },
      burst() { noise(0.12, 1800, 0.7, 0.3); for (let i = 0; i < 5; i++) tone(PENT[(Math.random() * 6) | 0] * 1.5, 0.5, 'sine', 0.06, 0, 0.04 + i * 0.07); },
      reform() { tone(200, 0.9, 'sine', 0.07, 420); },
      eat() { tone(660, 0.12, 'sine', 0.14, 990); tone(990, 0.16, 'triangle', 0.08, 0, 0.07); },
      crash() { noise(0.3, 500, 0.8, 0.3, 'lowpass'); tone(260, 0.45, 'sawtooth', 0.07, 60); },
      ribbon(active, y, sp) {
        if (!enabled || !rGain) return; const t = ac.currentTime;
        rGain.gain.setTargetAtTime(active ? 0.03 * Math.min(1, sp) : 0, t, 0.15);
        rOsc.frequency.setTargetAtTime(160 + (1 - y) * 280, t, 0.1);
      }
    };
  })();

  // ---------- drawing helpers ----------
  function halftone(c, x, y, w, h, sp, rmax, grad) {
    let row = 0;
    for (let yy = y; yy < y + h; yy += sp * 0.866, row++) {
      for (let xx = x + (row % 2 ? sp / 2 : 0); xx < x + w; xx += sp) {
        const r = rmax * grad(xx, yy);
        if (r > 0.45) { c.moveTo(xx + r, yy); c.arc(xx, yy, r, 0, 6.2832); }
      }
    }
  }
  function smoothLine(c, p) {
    c.moveTo(p[0].x, p[0].y);
    for (let i = 1; i < p.length - 1; i++) c.quadraticCurveTo(p[i].x, p[i].y, (p[i].x + p[i + 1].x) / 2, (p[i].y + p[i + 1].y) / 2);
    c.lineTo(p[p.length - 1].x, p[p.length - 1].y);
  }
  function taper(c, p, w0, w1, wave) {
    const n = p.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)];
      let nx = -(b.y - a.y), ny = b.x - a.x; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const off = wave ? Math.sin(T * 3 - i * 0.5) * Math.sin(i / n * Math.PI) * wave : 0;
      const w = lerp(w0, w1, Math.pow(i / (n - 1), 0.75));
      const x = p[i].x + nx * off, y = p[i].y + ny * off;
      L.push([x + nx * w, y + ny * w]); R.push([x - nx * w, y - ny * w]);
    }
    c.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < n; i++) c.lineTo(L[i][0], L[i][1]);
    for (let i = n - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]);
    c.closePath();
  }
  function blob(x, y, r, seed) {
    const n = 12, pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * 6.2832, rr = r * (1 + 0.13 * Math.sin(seed + i * 2.3 + T * 0.5)); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    ctx.beginPath();
    ctx.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
    ctx.closePath();
  }
  function tint(o, dt) {
    const k = 1 - Math.exp(-dt * 2.2), a = INK[o.ink], b = SEC[o.ink];
    for (let i = 0; i < 3; i++) { o.c1[i] += (a[i] - o.c1[i]) * k; o.c2[i] += (b[i] - o.c2[i]) * k; }
  }
  const mk = ink => ({ ink, c1: INK[ink].slice(), c2: SEC[ink].slice() });
  const wanderPt = (o, f, x0, x1, y0, y1) => [
    lerp(x0, x1, .5 + .5 * Math.sin(T * f + o.p1) * Math.cos(T * f * 0.53 + o.p2)),
    lerp(y0, y1, .5 + .5 * Math.sin(T * f * 1.1 + o.p3) * Math.cos(T * f * 0.61 + o.p4))
  ];

  // ---------- static layers ----------
  function buildBed() {
    bed = document.createElement('canvas'); bed.width = Math.round(W * DPR); bed.height = Math.round(H * DPR);
    const b = bed.getContext('2d'); b.scale(DPR, DPR);
    b.beginPath(); b.moveTo(0, H);
    for (let x = 0; x <= W + 8; x += 8) b.lineTo(x, bedY(x));
    b.lineTo(W, H); b.closePath();
    b.fillStyle = rgba(INK[0], 0.94); b.fill();
    b.save(); b.clip();
    b.fillStyle = rgba(INK[1], 0.95); b.beginPath();
    halftone(b, 0, H * 0.6, W, H * 0.4, 8 * S, 3.3 * S, (x, y) => { const d = y - bedY(x); return d < 0 ? 0 : Math.pow(Math.max(0, 1 - d / (72 * S)), 1.3); });
    b.fill(); b.restore();
    const r = rng(11);
    for (let i = 0; i < 12; i++) {
      const x = r() * W, y = bedY(x) + 9 * S + r() * 6 * S, rw = (9 + r() * 12) * S;
      b.beginPath(); b.ellipse(x, y, rw, rw * 0.62, 0, 0, 6.2832);
      b.fillStyle = rgba(INK[2], 1); b.fill(); b.lineWidth = 2; b.strokeStyle = rgba(INK[0], 1); b.stroke();
    }
    const g = document.createElement('canvas'); g.width = g.height = 220;
    const gc = g.getContext('2d'), gr = rng(5);
    for (let i = 0; i < 2600; i++) { gc.fillStyle = `rgba(70,80,110,${(0.05 + gr() * 0.16).toFixed(3)})`; const s = gr() < 0.85 ? 1 : 2; gc.fillRect(gr() * 220, gr() * 220, s, s); }
    grain = ctx.createPattern(g, 'repeat');
  }

  // ---------- ribbon game ----------
  function resetRibbon(n) {
    const h = RB.p[0]; RB.p = [];
    for (let i = 0; i < n; i++) RB.p.push({ x: clamp(h.x - Math.cos(RB.ang) * i * 10 * S, 5, W - 5), y: clamp(h.y - Math.sin(RB.ang) * i * 10 * S, 5, H - 5) });
  }
  function setHud(msg) {
    const el = $('#hud'); el.hidden = !game.on;
    el.textContent = msg || ('Pearls ' + game.score + ' \u00b7 Best ' + game.best);
  }
  function spawnPearl() {
    const cr = cv.getBoundingClientRect();
    const rs = [...document.querySelectorAll('.sheet, .tray, .title h1, .title p, .notes-toggle')].map(e => e.getBoundingClientRect());
    for (let t = 0; t < 40; t++) {
      const x = W * (0.07 + Math.random() * 0.86), y = lerp(H * 0.1, bedY(x) - 90 * S, Math.random());
      const X = x + cr.left, Y = y + cr.top;
      if (rs.some(r => X > r.left - 24 && X < r.right + 24 && Y > r.top - 24 && Y < r.bottom + 24)) continue;
      if (Math.hypot(x - RB.p[0].x, y - RB.p[0].y) < 90 * S) continue;
      game.pearl = { x, y }; return;
    }
    game.pearl = { x: W * 0.5, y: H * 0.5 };
  }
  function setGame(v) {
    game.on = v; game.dead = 0;
    if (v) { game.score = 0; resetRibbon(20); game.grace = 1.5; spawnPearl(); }
    else { game.pearl = null; resetRibbon(34); }
    setHud();
  }
  function gameCheck(h, dt) {
    const g = game;
    if (g.pearl && Math.hypot(h.x - g.pearl.x, h.y - g.pearl.y) < 20 * S) {
      g.score++; g.best = Math.max(g.best, g.score);
      const tail = RB.p[RB.p.length - 1];
      if (RB.p.length < 80) for (let k = 0; k < 5; k++) RB.p.push({ x: tail.x, y: tail.y });
      ripples.push({ x: g.pearl.x, y: g.pearl.y, age: 0 });
      Snd.eat(); buzz(14); see('snake'); setHud(); spawnPearl();
    }
    if (g.grace > 0) { g.grace -= dt; return; }
    for (let i = 14; i < RB.p.length; i++) {
      if (Math.hypot(h.x - RB.p[i].x, h.y - RB.p[i].y) < 8 * S) {
        g.dead = 1.1; g.score = 0; Snd.crash(); buzz([30, 40, 30]); setHud('Tangled. Starting over.'); return;
      }
    }
  }
  function drawPearl() {
    const p = game.pearl, r = 12 * S * (1 + 0.12 * Math.sin(T * 4));
    ctx.strokeStyle = rgba(INK[0], 0.6); ctx.lineWidth = 1.4; ctx.setLineDash([2, 5]);
    ctx.beginPath(); ctx.arc(p.x, p.y, r * 2.1 + 3 * Math.sin(T * 3), 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = rgba(INK[2], 1); ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill();
    ctx.fillStyle = rgba(INK[1], 0.9); ctx.beginPath(); ctx.arc(p.x + 1.8, p.y - 1.3, r * 0.6, 0, 6.2832); ctx.fill();
    eyes.push({ x: p.x - r * 0.3, y: p.y - r * 0.35, r: r * 0.22 });
  }

  // ---------- creatures ----------
  function makeTent(x, y, n, len, w, dx, arm, ph) {
    const pts = []; for (let i = 0; i < n; i++) pts.push({ x: x, y: y + i * len, px: x, py: y + i * len });
    return { pts, len, w, dx, arm, ph };
  }
  function init() {
    const p = () => Math.random() * 6.28;
    J = Object.assign(mk(1), { x: W * 0.5, y: H * 0.36, vx: 0, vy: 0, ph: 0, R: 78 * S, p1: p(), p2: p(), p3: p(), p4: p(), tent: [] });
    for (let i = 0; i < 9; i++) J.tent.push(makeTent(J.x, J.y, 17, 9 * S, 1.8, -0.86 + i * 0.215, false, i * 0.9));
    for (let i = 0; i < 4; i++) J.tent.push(makeTent(J.x, J.y, 14, 12 * S, 8 * S, -0.45 + i * 0.3, true, i * 1.7));

    RB = Object.assign(mk(0), { ang: 0.4, p: [], mode: 'wander', followT: 0, fleeT: 0, p1: p(), p2: p(), p3: p(), p4: p() });
    for (let i = 0; i < 34; i++) RB.p.push({ x: W * 0.25 - i * 10 * S, y: H * 0.3 });

    SP = [];
    for (let i = 0; i < 7; i++) SP.push(Object.assign(mk([0, 1, 2][i % 3]), { x: W * 0.68 + Math.random() * 90, y: H * 0.58 + Math.random() * 60, vx: 0, vy: 0, rot: 0, a: p(), ph: p() }));

    BL = Object.assign(mk(2), { ax: 0, ay: 0, cx: 0, cy: 0, open: 1, hold: 0, sway: 0 });
    SPORE = Object.assign(mk(1), { x: W * 0.78, y: H * 0.55, r: 22 * S, burst: false, bt: 0, parts: [], p1: p(), p2: p(), p3: p(), p4: p() });
    layout();
    ptr.lx = W / 2; ptr.ly = H / 2;
    ready = true;
  }
  function layout() {
    if (!BL) return;
    BL.ax = W * (W < 720 ? 0.24 : 0.2); BL.ay = bedY(BL.ax) + 8 * S;
    BL.cx = BL.ax; BL.cy = BL.ay - 150 * S;
    J.R = 78 * S; SPORE.r = 22 * S;
  }

  // ---------- notes ----------
  const NOTES = [
    { id: 'jelly', name: 'Noctiluna', hint: 'The big one. Curious about colour.', text: 'Swims toward spilled ink and drinks it. Whatever colour it drank, it keeps.' },
    { id: 'ribbon', name: 'Ribbon Wraith', hint: 'Long, and not fond of fast hands.', text: 'Trails a slow pointer like a dog on a lead. Flick the pointer and it coils away.' },
    { id: 'snake', name: 'Ribbon Wraith, fed', hint: 'Switch on Feed and lead the ribbon to the pearls.', text: 'Each pearl makes it longer. If it touches itself it tangles, then starts again from short.' },
    { id: 'sprites', name: 'Glass Sprites', hint: 'Small, and always watching.', text: 'Scatter when anything comes near. They are best at leaving.' },
    { id: 'bloom', name: 'Bloomling', hint: 'Rooted on the left. Opens in its own time.', text: 'Shuts like a fist when something gets close, then opens again once it has been left alone.' },
    { id: 'spore', name: 'Velvet Spore', hint: 'Drifting on the right. Try touching it.', text: 'Click it and it bursts. It takes a few seconds to gather itself back up.' },
    { id: 'bubbles', name: 'Bubbles', hint: 'The small ones rising from the sand.', text: 'Click one and it pops. They rise from three vents in the sand.' },
    { id: 'quiet', name: 'When it’s quiet', hint: 'Switch Hush on, then keep the pointer near the sprites.', text: 'With Hush on, the sound goes muffled and the sprites stop being shy. They come over to see what you are.' }
  ];
  const listEl = $('#list');
  function renderNotes(newId) {
    listEl.innerHTML = '';
    for (const n of NOTES) {
      const s = seen.has(n.id);
      const li = document.createElement('li');
      li.className = (s ? 'seen' : '') + (newId === n.id ? ' new' : '');
      li.innerHTML = '<span class="tick"></span><div><span class="nm"></span><span class="tx"></span></div>';
      li.querySelector('.nm').textContent = s ? n.name : 'Not seen yet';
      li.querySelector('.tx').textContent = s ? n.text : n.hint;
      listEl.appendChild(li);
    }
    $('#count').textContent = `${seen.size} of ${NOTES.length} seen`;
    $('#count2').textContent = `${seen.size}/${NOTES.length}`;
  }
  function see(id) { if (seen.has(id)) return; seen.add(id); renderNotes(id); Snd.chime(); buzz([10, 40, 10]); }

  // ---------- step ----------
  function step(dt) {
    hushAmt += ((hush ? 1 : 0) - hushAmt) * Math.min(1, dt * 3);
    cur = +$('#current').value / 100;
    speedMul = (0.35 + 1.3 * cur) * (1 - 0.75 * hushAmt) * (reduce ? 0.5 : 1);
    const sdt = dt * speedMul, k = sdt * 60;
    ptr.speed *= Math.exp(-dt * 3);
    currentPhase += sdt * 0.25; weedPhase += sdt * 0.9;
    for (let i = ripples.length - 1; i >= 0; i--) { ripples[i].age += dt; if (ripples[i].age > 1.4) ripples.splice(i, 1); }

    // ink drops
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i]; d.age += dt;
      if (d.age > 11) { drops.splice(i, 1); continue; }
      d.r = d.max * (1 - Math.exp(-d.age * 1.3));
      const touch = (o, rad, id) => { if (!d.hit.has(o) && Math.hypot(o.x - d.x, o.y - d.y) < d.r + rad) { d.hit.add(o); o.ink = d.ink; if (id) see(id); } };
      touch(J, J.R * 0.8, 'jelly'); touch(RB.p[0], 0, null);
      if (!d.hit.has(RB) && Math.hypot(RB.p[0].x - d.x, RB.p[0].y - d.y) < d.r + 10) { d.hit.add(RB); RB.ink = d.ink; }
      for (const s of SP) touch(s, 12 * S);
      if (!d.hit.has(BL) && Math.hypot(BL.cx - d.x, BL.cy - d.y) < d.r + 40 * S) { d.hit.add(BL); BL.ink = d.ink; }
      touch(SPORE, SPORE.r);
    }
    [J, RB, BL, SPORE, ...SP].forEach(o => tint(o, dt));

    // jelly
    {
      J.ph += sdt * 1.7;
      const cyc = Math.floor(J.ph / 6.2832); if (cyc !== J.cyc) { J.cyc = cyc; Snd.thump(); }
      const pu = Math.sin(J.ph), ws = 1 - 0.07 * pu;
      let tgt = null, best = 1e9;
      for (const d of drops) if (d.age < 9) { const dd = Math.hypot(d.x - J.x, d.y - J.y); if (dd < best) { best = dd; tgt = d; } }
      let tx, ty;
      if (tgt) { tx = tgt.x; ty = tgt.y; } else { [tx, ty] = wanderPt(J, 0.11, W * 0.12, W * 0.88, H * 0.14, H * 0.55); }
      const dx = tx - J.x, dy = ty - J.y, dist = Math.hypot(dx, dy) || 1;
      const want = Math.min(80 * S, dist * 0.5) * (0.35 + 0.65 * Math.max(0, pu));
      const a = Math.min(1, sdt * 1.4);
      J.vx += (dx / dist * want - J.vx) * a; J.vy += (dy / dist * want - J.vy) * a + 5 * S * sdt;
      J.x += J.vx * sdt; J.y += J.vy * sdt;
      J.x = clamp(J.x, J.R, W - J.R); J.y = clamp(J.y, J.R * 1.2, bedY(J.x) - 150 * S);
      for (let pass = 0; pass < 2; pass++) for (const tn of J.tent) {
        const p = tn.pts;
        if (pass === 0) {
          p[0].x = J.x + tn.dx * J.R * ws; p[0].y = J.y + 6 * S; p[0].px = p[0].x; p[0].py = p[0].y;
          for (let i = 1; i < p.length; i++) {
            const q = p[i], vx = (q.x - q.px) * 0.93, vy = (q.y - q.py) * 0.93;
            q.px = q.x; q.py = q.y;
            if (ptr.on && ptr.speed > 40) {
              const ddx = q.x - ptr.x, ddy = q.y - ptr.y, dd = Math.hypot(ddx, ddy), reach = 80 * S;
              if (dd < reach && dd > 0.1) { const f = Math.min(ptr.speed, 700) * 0.0045 * (1 - dd / reach) * k; q.x += ddx / dd * f; q.y += ddy / dd * f; }
            }
            q.x += vx * 0.9 + Math.sin(T * 1.1 + i * 0.35 + tn.ph) * 0.05 * k * (0.3 + cur);
            q.y += vy * 0.9 + 0.09 * k * S;
          }
        }
        for (let i = 1; i < p.length; i++) {
          const q = p[i], pr = p[i - 1]; let ddx = q.x - pr.x, ddy = q.y - pr.y; const l = Math.hypot(ddx, ddy) || 1;
          q.x = pr.x + ddx / l * tn.len; q.y = pr.y + ddy / l * tn.len;
        }
      }
    }

    // ribbon
    {
      const h = RB.p[0], d = Math.hypot(ptr.x - h.x, ptr.y - h.y);
      let tx, ty, speed, turn = 2.2;
      if (ptr.on && ptr.speed < 380) {
        RB.mode = 'follow'; tx = ptr.x; ty = ptr.y; speed = clamp((d - 70 * S) * 1.4, 0, 150 * S);
        if (d < 300 * S) { RB.followT += dt; if (RB.followT > 1.8) see('ribbon'); }
      } else if (ptr.on && d < 300 * S) {
        RB.mode = 'flee'; tx = h.x + (h.x - ptr.x); ty = h.y + (h.y - ptr.y); speed = 230 * S; turn = 4.5;
        RB.fleeT += dt; if (RB.fleeT > 0.4) see('ribbon');
      } else {
        RB.mode = 'wander'; [tx, ty] = wanderPt(RB, 0.09, W * 0.08, W * 0.92, H * 0.12, H * 0.6); speed = 60 * S;
      }
      if (game.on) {
        // snake rules: it never stops, and it steers toward the pointer or the arrow keys
        tx = ptr.on ? ptr.x : ptr.lx; ty = ptr.on ? ptr.y : ptr.ly; speed = 150 * S; turn = 3.2; RB.mode = 'follow';
        if (keys.size) {
          const kx = (keys.has('r') ? 1 : 0) - (keys.has('l') ? 1 : 0), ky = (keys.has('d') ? 1 : 0) - (keys.has('u') ? 1 : 0);
          if (kx || ky) { tx = h.x + kx * 200; ty = h.y + ky * 200; }
        }
      }
      if (game.on && game.dead > 0) {
        game.dead -= dt;
        if (game.dead <= 0) { resetRibbon(20); game.grace = 1.5; setHud(); }
      } else {
        let diff = Math.atan2(ty - h.y, tx - h.x) - RB.ang;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        RB.ang += clamp(diff, -turn * sdt, turn * sdt);
        const v = Math.max(speed, 14 * S) * sdt;
        h.x += Math.cos(RB.ang) * v; h.y += Math.sin(RB.ang) * v;
        h.x = clamp(h.x, 10, W - 10); h.y = clamp(h.y, 20, bedY(h.x) - 40 * S);
        Snd.ribbon(RB.mode !== 'wander', h.y / H, speed / (150 * S));
        for (let i = 1; i < RB.p.length; i++) {
          const q = RB.p[i], pr = RB.p[i - 1]; const dx = q.x - pr.x, dy = q.y - pr.y, l = Math.hypot(dx, dy) || 1;
          q.x = pr.x + dx / l * 10 * S; q.y = pr.y + dy / l * 10 * S;
        }
        if (game.on) gameCheck(h, dt);
      }
    }

    // sprites
    {
      let cx = 0, cy = 0; for (const s of SP) { cx += s.x; cy += s.y; } cx /= SP.length; cy /= SP.length;
      for (const s of SP) {
        s.a += Math.sin(T * 0.8 + s.ph) * 1.1 * sdt;
        let wx = Math.cos(s.a) * 46 * S, wy = Math.sin(s.a) * 34 * S;
        wx += (cx - s.x) * 0.25; wy += (cy - s.y) * 0.25;
        for (const o of SP) if (o !== s) { const dx = s.x - o.x, dy = s.y - o.y, l = Math.hypot(dx, dy); if (l < 30 * S && l > 0) { wx += dx / l * 40 * S; wy += dy / l * 40 * S; } }
        const edge = 80;
        if (s.x < edge) wx += 60; if (s.x > W - edge) wx -= 60; if (s.y < edge) wy += 60; if (s.y > bedY(s.x) - 90 * S) wy -= 70;
        const d = Math.hypot(ptr.x - s.x, ptr.y - s.y);
        const hx = ptr.on ? ptr.x : W / 2, hy = ptr.on ? ptr.y : H * 0.45;
        const ss = hushAmt > 0.3 ? Math.max(sdt, dt * 0.6) : sdt;
        if (hushAmt > 0.5) {
          const ring = 70 * S, dh = Math.hypot(hx - s.x, hy - s.y) || 1;
          wx += (hx - s.x) / dh * (dh - ring) * 0.9; wy += (hy - s.y) / dh * (dh - ring) * 0.9;
          if (ptr.on && dh < 110 * S && hushAmt > 0.7) { SP.q = (SP.q || 0) + dt; if (SP.q > 1.2) see('quiet'); }
        } else if (ptr.on && d < 150 * S && hushAmt < 0.5) {
          wx += (s.x - ptr.x) / d * 260 * S; wy += (s.y - ptr.y) / d * 260 * S; see('sprites'); Snd.tik();
        }
        const a = Math.min(1, ss * 3);
        s.vx += (wx - s.vx) * a; s.vy += (wy - s.vy) * a;
        const sp = Math.hypot(s.vx, s.vy), mx = 150 * S; if (sp > mx) { s.vx *= mx / sp; s.vy *= mx / sp; }
        s.x += s.vx * ss; s.y += s.vy * ss;
        if (sp > 6) { let da = Math.atan2(s.vy, s.vx) - s.rot; da = Math.atan2(Math.sin(da), Math.cos(da)); s.rot += da * Math.min(1, ss * 6); }
      }
      if (!(ptr.on && hushAmt > 0.7)) SP.q = 0;
    }

    // bloomling
    {
      BL.sway = Math.sin(weedPhase * 0.7) * 10 * S;
      BL.cx = BL.ax + BL.sway; BL.cy = BL.ay - 150 * S;
      const near = ptr.on && Math.hypot(ptr.x - BL.cx, ptr.y - BL.cy) < 200 * S;
      if (near) BL.hold = 2.5; BL.hold -= dt;
      const target = BL.hold > 0 ? 0 : 1;
      if (BL.prevT !== target) { if (BL.prevT !== undefined) Snd.breath(target === 1); BL.prevT = target; }
      BL.open += (target - BL.open) * Math.min(1, dt * (target ? 1.2 : 3.5));
      if (BL.open < 0.3) see('bloom');
    }

    // spore
    {
      if (!SPORE.burst) {
        const [tx, ty] = wanderPt(SPORE, 0.07, W * 0.55, W * 0.92, H * 0.3, H * 0.62);
        SPORE.x += (tx - SPORE.x) * Math.min(1, sdt * 0.4); SPORE.y += (ty - SPORE.y) * Math.min(1, sdt * 0.4);
      } else {
        SPORE.bt += sdt;
        for (const q of SPORE.parts) {
          if (SPORE.bt < 1.3) { q.x += q.vx * sdt; q.y += q.vy * sdt; const f = Math.exp(-2.2 * sdt); q.vx *= f; q.vy *= f; }
          else {
            const tx = SPORE.x + Math.cos(q.a) * SPORE.r * 1.05, ty = SPORE.y + Math.sin(q.a) * SPORE.r * 1.05;
            const kk = 1 - Math.exp(-sdt * (1.2 + (SPORE.bt - 1.3) * 1.2));
            q.x += (tx - q.x) * kk; q.y += (ty - q.y) * kk;
          }
        }
        if (SPORE.bt > 5) { SPORE.burst = false; Snd.reform(); }
      }
    }

    // bubbles
    if (Math.random() < dt * (2 + 6 * hushAmt)) {
      const vx = [0.14, 0.52, 0.86][(Math.random() * 3) | 0] * W;
      bubbles.push({ x: vx, y: bedY(vx), r: (2 + Math.random() * 5) * S, vy: (22 + Math.random() * 26) * S, ph: Math.random() * 6 });
    }
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i]; b.y -= b.vy * dt * (0.6 + 0.4 * speedMul); b.x += Math.sin(T * 2 + b.ph) * 8 * dt;
      if (b.y < -10) bubbles.splice(i, 1);
    }
  }

  // ---------- draw ----------
  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = rgba(WATER, 1); ctx.fillRect(0, 0, W, H);
    if (hushAmt > 0.01) { ctx.fillStyle = rgba(INK[0], 0.1 * hushAmt); ctx.fillRect(0, 0, W, H); }
    eyes.length = 0;

    // current lines
    ctx.strokeStyle = 'rgba(120,165,150,0.35)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 8; i++) {
      const y0 = H * (0.1 + i * 0.1);
      ctx.beginPath();
      for (let x = 0; x <= W + 20; x += 20) { const y = y0 + Math.sin(x * 0.006 + currentPhase * 2 + i) * 9 * S * (0.4 + cur); x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
    }

    for (const r of ripples) {
      const k = r.age / 1.4;
      ctx.strokeStyle = `rgba(60,100,130,${(0.35 * (1 - k)).toFixed(3)})`; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(r.x, r.y, 6 + k * 46 * S, 0, 6.2832); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'multiply';

    // ink drops
    for (const d of drops) {
      const fade = 1 - Math.pow(d.age / 11, 2), c = INK[d.ink];
      blob(d.x, d.y, d.r, d.seed); ctx.fillStyle = rgba(c, 0.36 * fade); ctx.fill();
      blob(d.x + 1.6, d.y - 1.2, d.r * 1.1, d.seed + 3); ctx.setLineDash([3, 6]); ctx.lineWidth = 1.3; ctx.strokeStyle = rgba(c, 0.8 * fade); ctx.stroke(); ctx.setLineDash([]);
    }

    drawBed(); drawWeeds(); drawBloom(); drawSpore(); drawSprites(); if (game.on && game.pearl) drawPearl(); drawRibbon(); drawJelly();

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = rgba(WATER, 1);
    for (const e of eyes) { ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, 6.2832); ctx.fill(); }

    // bubbles
    ctx.globalCompositeOperation = 'multiply'; ctx.lineWidth = 1.5;
    for (const b of bubbles) {
      ctx.strokeStyle = rgba(INK[0], 0.6); ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.2832); ctx.stroke();
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.6, 3.6, 4.6); ctx.stroke();
    }

    // hush rings
    if (hushAmt > 0.03) {
      const cx = ptr.on ? ptr.x : W / 2, cy = ptr.on ? ptr.y : H / 2;
      ctx.setLineDash([4, 7]); ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) { const r = ((T * 30 + i * 40) % 120) * S + 10; ctx.strokeStyle = rgba(INK[0], (1 - r / (130 * S)) * hushAmt * 0.7); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.stroke(); }
      ctx.setLineDash([]);
    }

    ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawBed() { if (bed) ctx.drawImage(bed, 0, 0, W, H); }

  function drawWeeds() {
    const xs = [0.06, 0.31, 0.45, 0.58, 0.7, 0.88, 0.96], hs = [120, 90, 140, 100, 128, 96, 110];
    ctx.lineCap = 'round';
    xs.forEach((f, i) => {
      const x0 = f * W, y0 = bedY(x0) + 6, h = hs[i] * S, segs = 6;
      let x = x0, y = y0; const pts = [{ x, y }];
      for (let s = 1; s <= segs; s++) {
        const ang = -Math.PI / 2 + Math.sin(weedPhase + i * 1.7 + s * 0.5) * 0.18 * (s / segs) * (0.5 + cur);
        x += Math.cos(ang) * h / segs; y += Math.sin(ang) * h / segs; pts.push({ x, y });
      }
      ctx.strokeStyle = rgba(INK[0], 1); ctx.lineWidth = 3.4 * S; ctx.beginPath(); smoothLine(ctx, pts); ctx.stroke();
      ctx.fillStyle = rgba(INK[2], 1);
      for (let s = 2; s < pts.length; s++) {
        const side = s % 2 ? 1 : -1, p = pts[s]; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(side * 0.9 - 0.2);
        ctx.beginPath(); ctx.ellipse(side * 9 * S, 0, 11 * S, 4.4 * S, 0, 0, 6.2832); ctx.fill(); ctx.restore();
      }
    });
  }

  function petal(a, L, w) {
    ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(w * 1.4, -L * 0.5, 0, -L); ctx.quadraticCurveTo(-w * 1.4, -L * 0.5, 0, 0); ctx.fill(); ctx.restore();
  }
  function drawBloom() {
    const b = BL, o = b.open;
    ctx.strokeStyle = rgba(INK[0], 1); ctx.lineWidth = 4.5 * S; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(b.ax, b.ay); ctx.quadraticCurveTo(b.ax + b.sway * 0.2, (b.ay + b.cy) / 2, b.cx, b.cy + 8 * S); ctx.stroke();
    ctx.fillStyle = rgba(INK[2], 1);
    [[0.3, 1], [0.55, -1]].forEach(([t, side]) => {
      const x = lerp(b.ax, b.cx, t), y = lerp(b.ay, b.cy, t);
      ctx.save(); ctx.translate(x, y); ctx.rotate(side * 0.8 - 0.3); ctx.beginPath(); ctx.ellipse(side * 16 * S, 0, 20 * S, 6.5 * S, 0, 0, 6.2832); ctx.fill(); ctx.restore();
    });
    ctx.save(); ctx.translate(b.cx, b.cy);
    const spread = lerp(0.07, 0.36, o), L = lerp(70, 64, o) * S, w = lerp(8, 17, o) * S;
    ctx.fillStyle = rgba(b.c1, 0.93);
    for (let i = 0; i < 9; i++) petal((i - 4) * spread, L, w);
    ctx.save(); ctx.translate(1.8, -1.3); ctx.fillStyle = rgba(b.c2, 0.95);
    for (let i = 0; i < 7; i++) petal((i - 3) * spread * 1.25, L * 0.62, w * 0.8);
    ctx.restore();
    ctx.fillStyle = rgba(INK[2], 1); ctx.beginPath(); ctx.arc(0, 0, 6.5 * S, 0, 6.2832); ctx.fill();
    ctx.restore();
  }

  function drawSpore() {
    const s = SPORE;
    ctx.save(); ctx.translate(s.x, s.y);
    if (!s.burst) {
      ctx.strokeStyle = rgba(s.c2, 1); ctx.fillStyle = rgba(s.c2, 1); ctx.lineWidth = 2;
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * 6.2832 + T * 0.1, l = s.r + (11 + 7 * Math.sin(T * 2 + i * 1.7)) * S;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * s.r * 0.8, Math.sin(a) * s.r * 0.8); ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l); ctx.stroke();
        ctx.beginPath(); ctx.arc(Math.cos(a) * l, Math.sin(a) * l, 3 * S, 0, 6.2832); ctx.fill();
      }
      ctx.fillStyle = rgba(s.c1, 0.95); ctx.beginPath(); ctx.arc(0, 0, s.r, 0, 6.2832); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, s.r, 0, 6.2832); ctx.clip(); ctx.translate(1.8, -1.3);
      ctx.fillStyle = rgba(s.c2, 1); ctx.beginPath();
      halftone(ctx, -s.r, -s.r, s.r * 2, s.r * 2, 5.5 * S, 2.3 * S, (x, y) => Math.pow(clamp(Math.hypot(x, y) / s.r, 0, 1), 1.2));
      ctx.fill(); ctx.restore();
    } else {
      ctx.setLineDash([3, 5]); ctx.strokeStyle = rgba(s.c2, 0.5); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(0, 0, s.r * 1.05, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = rgba(s.c1, 0.95);
      for (const q of s.parts) { ctx.beginPath(); ctx.arc(q.x - s.x, q.y - s.y, 4.2 * S, 0, 6.2832); ctx.fill(); }
      ctx.fillStyle = rgba(s.c2, 0.95);
      for (const q of s.parts) { ctx.beginPath(); ctx.arc(q.x - s.x + 1.8, q.y - s.y - 1.3, 2 * S, 0, 6.2832); ctx.fill(); }
    }
    ctx.restore();
  }

  function drawSprites() {
    for (const s of SP) {
      const L = 28 * S, fl = 0.7 + 0.3 * Math.sin(T * 10 + s.ph);
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot);
      ctx.fillStyle = rgba(s.c1, 0.94); ctx.beginPath(); ctx.moveTo(L / 2, 0);
      ctx.quadraticCurveTo(0, -L * 0.45, -L / 2, 0); ctx.quadraticCurveTo(0, L * 0.45, L / 2, 0); ctx.fill();
      ctx.save(); ctx.translate(1.6, -1.2); ctx.fillStyle = rgba(s.c2, 0.95);
      ctx.beginPath(); ctx.moveTo(-L / 2 + 3, 0); ctx.lineTo(-L / 2 - 11 * S, -8 * S * fl); ctx.lineTo(-L / 2 - 11 * S, 8 * S * fl); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-2 * S, -L * 0.3); ctx.lineTo(-9 * S, -L * 0.62); ctx.lineTo(7 * S, -L * 0.3); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.restore();
      const c = Math.cos(s.rot), n = Math.sin(s.rot), ex = L * 0.28, ey = -1.5 * S;
      eyes.push({ x: s.x + c * ex - n * ey, y: s.y + n * ex + c * ey, r: 2.3 * S });
    }
  }

  function drawRibbon() {
    if (game.on && game.dead > 0 && Math.floor(T * 10) % 2) return;
    const p = RB.p;
    ctx.beginPath(); taper(ctx, p, 12 * S, 1, 7 * S); ctx.fillStyle = rgba(RB.c1, 0.94); ctx.fill();
    ctx.save(); ctx.translate(1.8, -1.3); ctx.setLineDash([5, 8]); ctx.lineWidth = 2.4; ctx.strokeStyle = rgba(RB.c2, 1);
    ctx.beginPath(); smoothLine(ctx, p.slice(2, Math.max(4, p.length - 4))); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    ctx.fillStyle = rgba(RB.c1, 0.96); ctx.beginPath(); ctx.arc(p[0].x, p[0].y, 10 * S, 0, 6.2832); ctx.fill();
    ctx.fillStyle = rgba(RB.c2, 0.9); ctx.beginPath(); ctx.arc(p[0].x + 1.8, p[0].y - 1.3, 4.5 * S, 0, 6.2832); ctx.fill();
    eyes.push({ x: p[0].x + Math.cos(RB.ang) * 4 * S, y: p[0].y + Math.sin(RB.ang) * 4 * S - 2 * S, r: 2.4 * S });
  }

  function drawJelly() {
    const j = J, R = j.R, pu = Math.sin(j.ph), ws = 1 - 0.07 * pu, hs = 1 + 0.13 * pu;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const tn of j.tent) {
      if (tn.arm) { ctx.beginPath(); taper(ctx, tn.pts, tn.w, 1, 0); ctx.fillStyle = rgba(j.c1, 0.9); ctx.fill(); }
      else {
        ctx.save(); ctx.translate(1.6, -1.2); ctx.strokeStyle = rgba(j.c2, 1); ctx.lineWidth = tn.w; ctx.beginPath(); smoothLine(ctx, tn.pts); ctx.stroke(); ctx.restore();
      }
    }
    ctx.save(); ctx.translate(j.x, j.y);
    bellPath(R, ws, hs); ctx.fillStyle = rgba(j.c1, 0.93); ctx.fill();
    ctx.save(); bellPath(R, ws, hs); ctx.clip(); ctx.translate(1.8, -1.3);
    ctx.fillStyle = rgba(j.c2, 1); ctx.beginPath();
    const top = -R * hs, hh = R * hs + 16 * S;
    halftone(ctx, -R, top, R * 2, hh, 7 * S, 3.4 * S, (x, y) => Math.pow(clamp((y - top) / hh, 0, 1), 1.6));
    ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(1.8, -4); ctx.scale(0.66, 0.66); bellPath(R, ws, hs); ctx.lineWidth = 2.6; ctx.strokeStyle = rgba(j.c2, 0.95); ctx.stroke(); ctx.restore();
    ctx.restore();
  }
  function bellPath(R, ws, hs) {
    ctx.beginPath(); ctx.moveTo(-R * ws, 0);
    ctx.bezierCurveTo(-R * ws, -R * 1.28 * hs, R * ws, -R * 1.28 * hs, R * ws, 0);
    const n = 7, span = 2 * R * ws;
    for (let i = 0; i < n; i++) {
      const x0 = R * ws - span * i / n, x1 = R * ws - span * (i + 1) / n;
      ctx.quadraticCurveTo((x0 + x1) / 2, (13 + 5 * Math.sin(T * 2.2 + i * 1.3)) * S * hs, x1, 0);
    }
    ctx.closePath();
  }

  // ---------- input ----------
  const onUI = e => e.target && e.target.closest && e.target.closest('.panel, .notes');
  window.addEventListener('pointermove', e => {
    if (onUI(e)) { ptr.on = false; return; }
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, now = performance.now();
    if (ptr.on) { const dt = (now - ptr.t) / 1000; if (dt > 0) { const inst = Math.hypot(x - ptr.x, y - ptr.y) / dt; ptr.speed = ptr.speed * 0.7 + inst * 0.3; } }
    ptr.x = x; ptr.y = y; ptr.t = now; ptr.on = true; ptr.lx = x; ptr.ly = y;
    if (ptr.speed > 120 && now - lastRip > 110) { lastRip = now; ripples.push({ x, y, age: 0 }); }
    if (pour && Math.hypot(x - pour.x, y - pour.y) > 36 * S) {
      pour.x = x; pour.y = y;
      if (y < bedY(x) + 10) { addDrop(x, y, selInk, (45 + Math.random() * 20) * S); Snd.drip(selInk); }
    }
  });
  window.addEventListener('pointerdown', e => {
    if (onUI(e)) return;
    const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    ptr.x = x; ptr.y = y; ptr.t = performance.now(); ptr.on = true; ptr.lx = x; ptr.ly = y;
    if (ready) {
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        if (Math.hypot(x - b.x, y - b.y) < b.r + 14) { bubbles.splice(i, 1); ripples.push({ x: b.x, y: b.y, age: 0 }); Snd.pop(); buzz(8); see('bubbles'); return; }
      }
      if (!SPORE.burst && Math.hypot(x - SPORE.x, y - SPORE.y) < SPORE.r * 1.9 + 10) {
        SPORE.burst = true; SPORE.bt = 0; SPORE.parts = [];
        for (let i = 0; i < 16; i++) { const a = i / 16 * 6.2832, sp = (170 + Math.random() * 130) * S; SPORE.parts.push({ x: SPORE.x, y: SPORE.y, vx: Math.cos(a + Math.random() * 0.3) * sp, vy: Math.sin(a + Math.random() * 0.3) * sp, a }); }
        see('spore'); Snd.burst(); buzz([15, 30, 15]); return;
      }
    }
    if (y < bedY(x) + 10) {
      addDrop(x, y, selInk, (105 + Math.random() * 35) * S);
      Snd.bloop(selInk); buzz(12); ripples.push({ x, y, age: 0 }); pour = { x, y };
    }
    if (e.pointerType === 'touch') setTimeout(() => { ptr.on = false; }, 700);
  });
  window.addEventListener('pointerup', () => { pour = null; });
  window.addEventListener('pointercancel', () => { pour = null; });
  document.addEventListener('pointerleave', () => { ptr.on = false; });

  document.querySelectorAll('.pot').forEach(b => b.addEventListener('click', () => {
    selInk = +b.dataset.ink;
    document.querySelectorAll('.pot').forEach(o => o.setAttribute('aria-checked', o === b ? 'true' : 'false'));
  }));
  const hushBtn = $('#hush'), soundBtn = $('#sound');
  const setHush = v => { hush = v; hushBtn.setAttribute('aria-pressed', v ? 'true' : 'false'); Snd.hush(v); buzz(18); };
  hushBtn.addEventListener('click', () => setHush(!hush));
  soundBtn.addEventListener('click', () => {
    const v = soundBtn.getAttribute('aria-pressed') !== 'true';
    soundBtn.setAttribute('aria-pressed', v ? 'true' : 'false'); Snd.enable(v); if (v) Snd.bloop(1);
  });
  window.addEventListener('keydown', e => { if (e.key === 'h' && !e.repeat && e.target === document.body) setHush(!hush); });
  const gameBtn = $('#game');
  gameBtn.addEventListener('click', () => {
    const v = gameBtn.getAttribute('aria-pressed') !== 'true';
    gameBtn.setAttribute('aria-pressed', v ? 'true' : 'false'); setGame(v); buzz(10);
  });
  const KEYMAP = { arrowleft: 'l', a: 'l', arrowright: 'r', d: 'r', arrowup: 'u', w: 'u', arrowdown: 'd', s: 'd' };
  window.addEventListener('keydown', e => { const k = KEYMAP[e.key.toLowerCase()]; if (k && game.on) { keys.add(k); if (e.key.startsWith('Arrow')) e.preventDefault(); } });
  window.addEventListener('keyup', e => { const k = KEYMAP[e.key.toLowerCase()]; if (k) keys.delete(k); });
  window.addEventListener('blur', () => keys.clear());

  $('#notesToggle').addEventListener('click', () => {
    const o = $('#notes').classList.toggle('open'); $('#notesToggle').setAttribute('aria-expanded', o ? 'true' : 'false');
  });

  // ---------- run ----------
  function resize() {
    const r = cv.getBoundingClientRect(); W = r.width; H = r.height; DPR = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    S = clamp(Math.min(W / 1100, H / 760), 0.7, 1.25);
    buildBed();
    if (!ready) init(); else layout();
  }
  window.addEventListener('resize', resize);
  renderNotes();
  resize();
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
    step(dt); draw(); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
