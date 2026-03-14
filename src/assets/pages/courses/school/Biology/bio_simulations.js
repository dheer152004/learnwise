// bio_simulations.js — physics update + canvas drawing for all biology experiments

// ─── Shared simulation state ───────────────────────────────────────────────
let osmosisState = { t: 0, level: 0 };
let photoState = { t: 0, bubbles: [] };
let mitosisState = { t: 0, phase: 0 };
let enzymeState = { t: 0 };
let heartState = { t: 0, contracting: false };
let bloodState = { t: 0, cells: [], pulsePhase: 0 };
let pollinationState = { t: 0, beeX: 0, beeY: 0, beePhase: 0, pollenGrains: [], tubeLen: 0, fertilised: false, beeHasPollen: false };
let populationState = { t: 0, N: 0, history: [] };
let selectionState = { t: 0, p: 0.5, history: [] };
let mendelState = { grid: null };

function resetStates(expKey, p) {
  osmosisState = { t: 0, level: 0 };
  photoState = { t: 0, bubbles: [] };
  mitosisState = { t: 0, phase: 0 };
  enzymeState = { t: 0 };
  heartState = { t: 0 };
  bloodState = { t: 0, cells: [], pulsePhase: 0 };
  pollinationState = { t: 0, beeX: 80, beeY: 0, beePhase: 0, pollenGrains: [], tubeLen: 0, fertilised: false, beeHasPollen: false };
  populationState = { t: 0, N: p.popN0 || 50, history: [{ t: 0, N: p.popN0 || 50 }] };
  selectionState = { t: 0, p: p.nsFreq || 0.5, history: [{ t: 0, p: p.nsFreq || 0.5 }] };
  mendelState = { grid: buildPunnettGrid(p) };
}

// ─── Physics / Biology Update ──────────────────────────────────────────────
function physicsUpdate(expKey, dt, p) {
  if (expKey === 'osmosis') {
    osmosisState.t += dt;
    const target = (p.osConc || 0.5) * (p.osMembrane || 0.5) * 80;
    osmosisState.level += (target - osmosisState.level) * dt * 0.4;
  }

  if (expKey === 'photosynthesis') {
    photoState.t += dt;
    const rate = photosynRate(p);
    if (Math.random() < rate * dt * 1.5) {
      const bx = 100 + Math.random() * 180;
      photoState.bubbles.push({ x: bx, y: 320, vy: -(18 + Math.random() * 14), life: 1 });
    }
    photoState.bubbles = photoState.bubbles
      .map(b => ({ ...b, y: b.y + b.vy * dt, life: b.life - dt * 0.6 }))
      .filter(b => b.life > 0);
  }

  if (expKey === 'mitosis') {
    mitosisState.t += dt;
  }

  if (expKey === 'enzyme') {
    enzymeState.t += dt;
  }

  if (expKey === 'heartrate') {
    heartState.t += dt;
  }

  if (expKey === 'bloodflow') {
    bloodState.t += dt;
    bloodState.pulsePhase += dt;
    const hr = p.bfHR || 72;
    const speed = (p.bfBP || 120) / 120 * (1 / (p.bfViscosity || 1)) * (1 + (p.bfExercise || 0) * 0.4);
    // Spawn new blood cells periodically
    if (Math.random() < dt * hr / 4) {
      bloodState.cells.push({ path: 'pulmonary', pos: 0, oxy: false, speed: speed * (0.85 + Math.random() * 0.3) });
    }
    if (Math.random() < dt * hr / 4) {
      bloodState.cells.push({ path: 'systemic', pos: 0, oxy: true, speed: speed * (0.85 + Math.random() * 0.3) });
    }
    bloodState.cells.forEach(c => { c.pos += c.speed * dt * 0.12; });
    bloodState.cells = bloodState.cells.filter(c => c.pos < 1);
  }

  if (expKey === 'pollination') {
    pollinationState.t += dt;
    const spd = p.plBeeSpeed || 1.0;
    const totalT = 12;
    const phase = pollinationState.t / totalT;
    // Bee phases: 0→0.25 approach flower1, 0.25→0.5 collect pollen, 0.5→0.75 fly to flower2, 0.75→1 deposit + tube grows
    pollinationState.beePhase = phase;
    if (phase > 0.3 && !pollinationState.beeHasPollen) pollinationState.beeHasPollen = true;
    if (phase > 0.75) {
      const tubeTarget = Math.min(1, (phase - 0.75) / 0.25);
      pollinationState.tubeLen = tubeTarget;
    }
    if (phase > 0.95 && !pollinationState.fertilised) pollinationState.fertilised = true;
    // Wind pollen drift
    const wind = p.plWindSpeed || 1;
    if (wind > 2 && Math.random() < dt * wind * 0.3) {
      pollinationState.pollenGrains.push({ x: 80 + Math.random() * 60, y: 120 + Math.random() * 40, vx: wind * 18, vy: -8 + Math.random() * 16, life: 1 });
    }
    pollinationState.pollenGrains = pollinationState.pollenGrains
      .map(g => ({ ...g, x: g.x + g.vx * dt, y: g.y + g.vy * dt, life: g.life - dt * 0.4 }))
      .filter(g => g.life > 0 && g.x < 800);
  }

  if (expKey === 'population') {
    populationState.t += dt;
    const r = p.popR || 0.3;
    const K = p.popK || 800;
    const dN = r * populationState.N * (1 - populationState.N / K) * dt;
    populationState.N = Math.max(0, Math.min(K * 1.5, populationState.N + dN));
    if (populationState.history.length < 200) {
      populationState.history.push({ t: populationState.t, N: populationState.N });
    }
  }

  if (expKey === 'naturalselection') {
    selectionState.t += dt;
    const s = p.nsSelect || 0.3;
    const q = 1 - selectionState.p;
    const wBar = selectionState.p * selectionState.p + 2 * selectionState.p * q + (1 - s) * q * q;
    const newP = (selectionState.p * selectionState.p + selectionState.p * q) / wBar;
    selectionState.p += (newP - selectionState.p) * dt * 2;
    selectionState.p = Math.max(0.001, Math.min(0.999, selectionState.p));
    if (selectionState.history.length < 200) {
      selectionState.history.push({ t: selectionState.t, p: selectionState.p });
    }
  }
}

// ─── Helper: photosynthesis rate ───────────────────────────────────────────
function photosynRate(p) {
  const light = (p.psLight || 60) / 100;
  const co2 = Math.min((p.psCO2 || 400) / 800, 1);
  const temp = p.psTemp || 25;
  const tFactor = temp < 10 ? temp / 10 : temp > 40 ? Math.max(0, 1 - (temp - 40) / 10) : 1;
  return light * co2 * tFactor;
}

// ─── Helper: Michaelis-Menten ──────────────────────────────────────────────
function mmRate(p) {
  const S = p.enSubstrate || 5;
  const temp = p.enTemp || 37;
  const ph = p.enPH || 7;
  const I = p.enInhib || 0;
  const Km = 2.5;
  const VmaxBase = 10;
  const tFactor = temp < 10 ? 0.15 : temp > 60 ? Math.max(0, 1 - (temp - 60) / 10) :
    Math.exp(-0.5 * ((temp - 37) / 12) ** 2);
  const phFactor = Math.exp(-0.5 * ((ph - 7.0) / 2.0) ** 2);
  const Vmax = VmaxBase * tFactor * phFactor;
  const KmApp = Km * (1 + I / 1.0);
  return (Vmax * S) / (KmApp + S);
}

// ─── Helper: build Punnett grid ────────────────────────────────────────────
function buildPunnettGrid(p) {
  const alleles = ['A', 'a'];
  const p1 = (p.mnParent1 || 1);
  const p2 = (p.mnParent2 || 1);
  const parent1alleles = p1 === 0 ? ['A', 'A'] : p1 === 1 ? ['A', 'a'] : ['a', 'a'];
  const parent2alleles = p2 === 0 ? ['A', 'A'] : p2 === 1 ? ['A', 'a'] : ['a', 'a'];
  const grid = [];
  for (let r = 0; r < 2; r++) {
    const row = [];
    for (let c = 0; c < 2; c++) {
      const combo = [parent1alleles[r], parent2alleles[c]].sort((a, b) => a < b ? -1 : 1).join('');
      row.push(combo);
    }
    grid.push(row);
  }
  return { grid, p1: parent1alleles, p2: parent2alleles };
}

// ─── Main Draw Dispatcher ──────────────────────────────────────────────────
function drawExperiment(canvas, expKey, p, simTime) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  switch (expKey) {
    case 'osmosis': drawOsmosis(ctx, W, H, p); break;
    case 'photosynthesis': drawPhotosynthesis(ctx, W, H, p); break;
    case 'mitosis': drawMitosis(ctx, W, H, p); break;
    case 'mendelian': drawMendelian(ctx, W, H, p); break;
    case 'enzyme': drawEnzyme(ctx, W, H, p); break;
    case 'heartrate': drawHeart(ctx, W, H, p); break;
    case 'bloodflow': drawBloodFlow(ctx, W, H, p); break;
    case 'pollination': drawPollination(ctx, W, H, p); break;
    case 'population': drawPopulation(ctx, W, H, p); break;
    case 'naturalselection': drawSelection(ctx, W, H, p); break;
  }
}

// ─── COLORS ──────────────────────────────────────────────────────────────
const C = {
  green: '#2ec4b6', greenD: 'rgba(46,196,182,0.15)',
  lime: '#4caf50', limeD: 'rgba(76,175,80,0.15)',
  blue: '#4563ff', blueD: 'rgba(69,99,255,0.12)',
  violet: '#7c5cbf', violetD: 'rgba(124,92,191,0.15)',
  amber: '#f4a261', amberD: 'rgba(244,162,97,0.18)',
  red: '#e05252', redD: 'rgba(224,82,82,0.15)',
  pink: '#e0527a', pinkD: 'rgba(224,82,122,0.15)',
  cyan: '#2ec4b6',
  text: '#1a1a2e', text2: '#6b6b80', text3: '#aaaabc',
  panel: '#f8f6f1', panel2: '#f0ebff',
  border: 'rgba(124,92,191,0.12)',
};

function bioText(ctx, text, x, y, color, size = 10) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${size}px 'DM Mono', monospace`;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawAxis(ctx, gx, gy, W, H, lblX = '', lblY = '') {
  ctx.strokeStyle = C.border; ctx.lineWidth = 0.75;
  ctx.beginPath(); ctx.moveTo(gx, 20); ctx.lineTo(gx, gy); ctx.lineTo(W - 16, gy); ctx.stroke();
  ctx.fillStyle = C.text3; ctx.font = "9px 'Space Mono', monospace";
  if (lblY) ctx.fillText(lblY, gx + 4, 16);
  if (lblX) ctx.fillText(lblX, W - 70, gy + 16);
}

// ─── OSMOSIS ─────────────────────────────────────────────────────────────
function drawOsmosis(ctx, W, H, p) {
  const cx = W / 2, cellY = H / 2, cellRX = 90, cellRY = 60;
  const conc = p.osConc || 0.5;
  const shrink = Math.max(0.4, 1 - conc * 0.3);
  const swell = Math.min(1.5, 1 + (0 - conc) * 0.3 + 1 * 0.3);

  // Background solution
  ctx.fillStyle = `rgba(69,99,255,${Math.min(0.15, conc * 0.1)})`;
  ctx.fillRect(0, 0, W, H);

  // Solute particles in solution (outside)
  ctx.fillStyle = C.blue;
  for (let i = 0; i < Math.round(conc * 20); i++) {
    const sx = 30 + ((i * 137) % (W - 60));
    const sy = 30 + ((i * 97) % (H - 60));
    const distToCentre = Math.hypot(sx - cx, sy - cellY);
    if (distToCentre > 110) {
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Membrane
  ctx.save();
  ctx.strokeStyle = C.lime; ctx.lineWidth = 3;
  ctx.shadowColor = C.lime; ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(cx, cellY, cellRX * shrink, cellRY * shrink, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Cell interior fill
  ctx.fillStyle = 'rgba(46,196,182,0.12)';
  ctx.beginPath();
  ctx.ellipse(cx, cellY, cellRX * shrink, cellRY * shrink, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nucleus
  ctx.fillStyle = 'rgba(124,92,191,0.4)';
  ctx.beginPath();
  ctx.ellipse(cx, cellY, 22, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.violet; ctx.lineWidth = 1.5;
  ctx.stroke();

  // Water arrows
  const arrowDir = conc > 0.1 ? -1 : 1;
  const arrowCount = Math.round(Math.abs(conc - 0.1) * 6) + 1;
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 2;
  for (let i = 0; i < arrowCount; i++) {
    const ay = cellY - 30 + i * (60 / Math.max(arrowCount - 1, 1));
    const startX = arrowDir > 0 ? cx - cellRX * shrink - 50 : cx + cellRX * shrink + 10;
    const endX = arrowDir > 0 ? cx - cellRX * shrink - 10 : cx + cellRX * shrink + 50;
    ctx.save(); ctx.shadowColor = C.cyan; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(startX, ay); ctx.lineTo(endX, ay);
    ctx.stroke();
    ctx.beginPath();
    if (arrowDir > 0) { ctx.moveTo(endX, ay); ctx.lineTo(endX - 8, ay - 5); ctx.lineTo(endX - 8, ay + 5); }
    else { ctx.moveTo(endX, ay); ctx.lineTo(endX + 8, ay - 5); ctx.lineTo(endX + 8, ay + 5); }
    ctx.fillStyle = C.cyan; ctx.fill();
    ctx.restore();
  }

  const condition = conc < 0.05 ? 'Hypotonic (cell swells)' : conc > 0.9 ? 'Hypertonic (plasmolysis)' : 'Near isotonic';
  bioText(ctx, condition, 12, 22, C.lime, 11);
  bioText(ctx, `[Solute] = ${conc.toFixed(2)} M`, 12, H - 18, C.blue, 10);
  bioText(ctx, `Osmotic P ≈ ${(conc * 24.5).toFixed(1)} atm`, W - 190, H - 18, C.cyan, 10);

  // Legend
  bioText(ctx, '● Solute', W - 100, 20, C.blue, 9);
  bioText(ctx, '→ H₂O flow', W - 100, 34, C.cyan, 9);
}

// ─── PHOTOSYNTHESIS ──────────────────────────────────────────────────────
function drawPhotosynthesis(ctx, W, H, p) {
  const rate = photosynRate(p);
  const lightPct = p.psLight || 60;

  // Sky gradient based on light intensity
  const skyAlpha = lightPct / 100;
  const grad = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  grad.addColorStop(0, `rgba(255,220,100,${skyAlpha * 0.35})`);
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Light rays
  ctx.save();
  const rayCount = Math.round(lightPct / 15) + 1;
  for (let i = 0; i < rayCount; i++) {
    const rx = W * 0.15 + i * (W * 0.7 / Math.max(rayCount - 1, 1));
    const alpha = (lightPct / 100) * 0.25;
    ctx.strokeStyle = `rgba(255,210,50,${alpha})`;
    ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(rx, 0); ctx.lineTo(rx + 20, H * 0.38); ctx.stroke();
  }
  ctx.restore();

  // Leaf body
  const lx = W / 2, ly = H / 2 + 10;
  ctx.save();
  ctx.fillStyle = rate > 0.5 ? '#3cb371' : '#6b8e6b';
  ctx.shadowColor = '#2ec4b6'; ctx.shadowBlur = rate * 20;
  ctx.beginPath();
  ctx.moveTo(lx, ly - 80);
  ctx.bezierCurveTo(lx + 100, ly - 80, lx + 120, ly + 30, lx, ly + 80);
  ctx.bezierCurveTo(lx - 120, ly + 30, lx - 100, ly - 80, lx, ly - 80);
  ctx.fill();
  ctx.restore();

  // Leaf veins
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(lx, ly - 80); ctx.lineTo(lx, ly + 80); ctx.stroke();
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(lx, ly + i * 22);
    ctx.lineTo(lx + (i % 2 === 0 ? 55 : 45), ly + i * 22 - 20);
    ctx.stroke();
  }

  // O₂ bubbles rising
  photoState.bubbles.forEach(b => {
    ctx.save();
    ctx.globalAlpha = b.life * 0.85;
    ctx.fillStyle = C.cyan; ctx.shadowColor = C.cyan; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    bioText(ctx, 'O₂', b.x + 7, b.y + 3, C.green, 8);
  });

  // CO₂ arrows downward into leaf
  const co2 = p.psCO2 || 400;
  const co2Count = Math.round(co2 / 200) + 1;
  ctx.strokeStyle = C.text3; ctx.lineWidth = 1.5;
  for (let i = 0; i < co2Count; i++) {
    const ax = lx - 60 + i * 30;
    ctx.save(); ctx.strokeStyle = C.amber; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(ax, ly - 130); ctx.lineTo(ax, ly - 90); ctx.stroke();
    ctx.fillStyle = C.amber;
    ctx.beginPath(); ctx.moveTo(ax, ly - 90); ctx.lineTo(ax - 5, ly - 100); ctx.lineTo(ax + 5, ly - 100); ctx.fill();
    ctx.restore();
    bioText(ctx, 'CO₂', ax - 10, ly - 135, C.amber, 8);
  }

  // Rate bar
  const barW = 120, barH = 10;
  const bx = W - barW - 20, by = H - 50;
  ctx.fillStyle = C.border;
  ctx.fillRect(bx, by, barW, barH);
  ctx.fillStyle = C.lime;
  ctx.fillRect(bx, by, barW * rate, barH);
  bioText(ctx, `Rate: ${(rate * 100).toFixed(0)}%`, bx, by - 6, C.lime, 9);
  bioText(ctx, `O₂ produced: ${(rate * 12).toFixed(1)} μmol/s`, 12, H - 18, C.cyan, 10);
  bioText(ctx, `Light: ${lightPct}%  CO₂: ${co2}ppm  Temp: ${p.psTemp || 25}°C`, 12, H - 34, C.text2, 9);
}

// ─── MITOSIS ─────────────────────────────────────────────────────────────
function drawMitosis(ctx, W, H, p) {
  const speed = p.mtSpeed || 1;
  const nPairs = Math.round(p.mtChrom || 2);
  const totalDur = 10;
  const raw = (mitosisState.t * speed) % totalDur;
  const phase = raw < 2 ? 0 : raw < 4 ? 1 : raw < 6 ? 2 : raw < 8 ? 3 : 4;
  const phaseT = phase === 0 ? raw / 2 : phase === 1 ? (raw - 2) / 2 : phase === 2 ? (raw - 4) / 2 : phase === 3 ? (raw - 6) / 2 : (raw - 8) / 2;
  const phaseNames = ['Prophase', 'Metaphase', 'Anaphase', 'Telophase', 'Cytokinesis'];

  const cx = W / 2, cy = H / 2;
  const chrColors = [C.red, C.blue, C.lime, C.amber];

  // Cell outline
  ctx.save();
  ctx.strokeStyle = C.lime; ctx.lineWidth = 2;
  ctx.shadowColor = C.lime; ctx.shadowBlur = 10;
  if (phase < 4) {
    ctx.beginPath(); ctx.ellipse(cx, cy, 130, 100, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(46,196,182,0.05)'; ctx.fill();
  } else {
    // Two daughter cells separating
    const sep = phaseT * 90;
    ctx.beginPath(); ctx.ellipse(cx - sep, cy, 80, 70, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(46,196,182,0.05)'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + sep, cy, 80, 70, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fill();
  }
  ctx.restore();

  // Draw chromosomes by phase
  for (let i = 0; i < nPairs; i++) {
    const color = chrColors[i % chrColors.length];
    const angle = (i / nPairs) * Math.PI * 2;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.shadowColor = color; ctx.shadowBlur = 6;

    if (phase === 0) {
      // Prophase: condense from blob to rod
      const spread = 60 * (1 - phaseT);
      const px = cx + Math.cos(angle) * spread;
      const py = cy + Math.sin(angle) * spread;
      ctx.beginPath();
      ctx.moveTo(px - 10, py - 12 * phaseT);
      ctx.lineTo(px + 10, py + 12 * phaseT);
      ctx.stroke();
    } else if (phase === 1) {
      // Metaphase: line up at equator
      const targetX = cx + (i - nPairs / 2 + 0.5) * 28;
      ctx.beginPath();
      ctx.moveTo(targetX, cy - 14); ctx.lineTo(targetX, cy + 14); ctx.stroke();
      // Sister chromatid
      ctx.strokeStyle = color + '88';
      ctx.beginPath();
      ctx.moveTo(targetX + 6, cy - 14); ctx.lineTo(targetX + 6, cy + 14); ctx.stroke();
    } else if (phase === 2) {
      // Anaphase: pull apart to poles
      const sep = phaseT * 60;
      const tx = cx + (i - nPairs / 2 + 0.5) * 20;
      ctx.beginPath();
      ctx.moveTo(tx, cy - 14 - sep); ctx.lineTo(tx, cy - sep); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx, cy + sep); ctx.lineTo(tx, cy + 14 + sep); ctx.stroke();
    } else if (phase === 3) {
      // Telophase: re-form nuclei at poles
      ctx.beginPath();
      ctx.moveTo(cx + (i - nPairs / 2 + 0.5) * 16, cy - 55);
      ctx.lineTo(cx + (i - nPairs / 2 + 0.5) * 16, cy - 42);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + (i - nPairs / 2 + 0.5) * 16, cy + 42);
      ctx.lineTo(cx + (i - nPairs / 2 + 0.5) * 16, cy + 55);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Nuclear envelopes in telophase
  if (phase === 3) {
    const alpha = phaseT;
    ctx.save(); ctx.strokeStyle = `rgba(124,92,191,${alpha})`; ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.ellipse(cx, cy - 50, 55, 30, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, cy + 50, 55, 30, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  // Spindle fibres (metaphase + anaphase)
  if (phase === 1 || phase === 2) {
    ctx.save(); ctx.strokeStyle = 'rgba(200,180,255,0.3)'; ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const fx = cx - 110 + i * 32;
      ctx.beginPath(); ctx.moveTo(cx - 120, cy); ctx.lineTo(fx, cy - 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 120, cy); ctx.lineTo(fx, cy - 14); ctx.stroke();
    }
    ctx.restore();
  }

  // Phase label + progress bar
  bioText(ctx, phaseNames[phase].toUpperCase(), 12, 22, C.violet, 13);
  const bar = (phaseT) * (W - 40);
  ctx.fillStyle = C.violetD; ctx.fillRect(12, 32, W - 40, 5);
  ctx.fillStyle = C.violet; ctx.fillRect(12, 32, bar, 5);
  bioText(ctx, `Chromosome pairs: ${nPairs}`, 12, H - 18, C.lime, 10);
  bioText(ctx, `Speed: ${speed.toFixed(1)}×`, W - 90, H - 18, C.amber, 10);
}

// ─── MENDELIAN GENETICS ──────────────────────────────────────────────────
function drawMendelian(ctx, W, H, p) {
  if (!mendelState.grid) mendelState = { grid: buildPunnettGrid(p) };
  const { grid, p1, p2 } = mendelState.grid;

  const cellSize = 80, startX = W / 2 - 90, startY = H / 2 - 90;
  const headerY = startY - 30, headerX = startX - 30;

  // Title
  bioText(ctx, 'Punnett Square', startX, startY - 55, C.violet, 12);
  bioText(ctx, `Parent 1: ${p1.join('')}   ×   Parent 2: ${p2.join('')}`, startX, startY - 40, C.text2, 10);

  // Column headers (parent 2 gametes)
  p2.forEach((a, c) => {
    bioText(ctx, a, startX + c * cellSize + cellSize / 2 - 4, headerY, C.blue, 13);
  });
  // Row headers (parent 1 gametes)
  p1.forEach((a, r) => {
    bioText(ctx, a, headerX, startY + r * cellSize + cellSize / 2 + 5, C.red, 13);
  });

  // Grid
  grid.forEach((row, r) => {
    row.forEach((combo, c) => {
      const x = startX + c * cellSize;
      const y = startY + r * cellSize;
      const dominant = combo.includes('A') && !combo.startsWith('aa');
      ctx.fillStyle = dominant ? 'rgba(46,196,182,0.12)' : 'rgba(224,82,82,0.10)';
      ctx.fillRect(x, y, cellSize - 4, cellSize - 4);
      ctx.strokeStyle = dominant ? C.green : C.red;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, cellSize - 4, cellSize - 4);

      // Allele display
      ctx.font = "bold 18px 'DM Sans', sans-serif";
      ctx.fillStyle = dominant ? C.violet : C.red;
      ctx.fillText(combo[0], x + 20, y + cellSize / 2 + 3);
      ctx.fillStyle = combo[1] === combo[1].toLowerCase() ? C.red : C.violet;
      ctx.fillText(combo[1], x + 38, y + cellSize / 2 + 3);
    });
  });

  // Count phenotypes
  const all = grid.flat();
  const dom = all.filter(g => g.includes('A')).length;
  const rec = all.filter(g => g === 'aa').length;

  bioText(ctx, `Dominant phenotype: ${dom}/4 (${dom * 25}%)`, startX, startY + 2 * cellSize + 30, C.green, 10);
  bioText(ctx, `Recessive phenotype: ${rec}/4 (${rec * 25}%)`, startX, startY + 2 * cellSize + 46, C.red, 10);

  const genoFreqs = {};
  all.forEach(g => { genoFreqs[g] = (genoFreqs[g] || 0) + 1; });
  const genoStr = Object.entries(genoFreqs).map(([k, v]) => `${k}:${v}`).join('  ');
  bioText(ctx, `Genotypes: ${genoStr}`, startX, startY + 2 * cellSize + 62, C.text2, 9);
}

// ─── ENZYME KINETICS ─────────────────────────────────────────────────────
function drawEnzyme(ctx, W, H, p) {
  const gx = 50, gy = H - 50;
  const chartW = W - 80, chartH = H - 90;
  const Km = 2.5, Vmax0 = 10;
  const inhibK = p.enInhib || 0;
  const KmApp = Km * (1 + inhibK);

  drawAxis(ctx, gx, gy, W, H, '[S] mM', 'v (μmol/s)');
  bioText(ctx, 'Michaelis-Menten Curve', gx + 10, 18, C.violet, 11);

  // Draw curve (no inhibition)
  ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 2;
  ctx.shadowColor = C.green; ctx.shadowBlur = 6;
  ctx.beginPath();
  for (let sx = 0; sx <= 20; sx += 0.1) {
    const vx = gx + (sx / 20) * chartW;
    const vy = gy - (Vmax0 * sx / (Km + sx)) / Vmax0 * chartH;
    sx === 0 ? ctx.moveTo(vx, vy) : ctx.lineTo(vx, vy);
  }
  ctx.stroke(); ctx.restore();

  // Draw curve with inhibition
  if (inhibK > 0) {
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    ctx.beginPath();
    for (let sx = 0; sx <= 20; sx += 0.1) {
      const vx = gx + (sx / 20) * chartW;
      const vy = gy - (Vmax0 * sx / (KmApp + sx)) / Vmax0 * chartH;
      sx === 0 ? ctx.moveTo(vx, vy) : ctx.lineTo(vx, vy);
    }
    ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    bioText(ctx, '--- With inhibitor', W - 190, 20, C.red, 9);
  }

  // Current operating point
  const curS = p.enSubstrate || 5;
  const curV = mmRate(p);
  const ptX = gx + (curS / 20) * chartW;
  const ptY = gy - (curV / Vmax0) * chartH;
  ctx.save(); ctx.fillStyle = C.amber; ctx.shadowColor = C.amber; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.arc(ptX, ptY, 8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  bioText(ctx, `v = ${curV.toFixed(2)}`, ptX + 10, ptY - 4, C.amber, 10);

  // Km line
  const kmX = gx + (Km / 20) * chartW;
  ctx.strokeStyle = C.violet; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(kmX, gy); ctx.lineTo(kmX, gy - chartH / 2); ctx.stroke();
  ctx.setLineDash([]);
  bioText(ctx, `Km=${Km}mM`, kmX + 3, gy - chartH / 2 - 4, C.violet, 9);

  // Vmax line
  const vmaxY = gy - chartH;
  ctx.strokeStyle = C.text3; ctx.lineWidth = 0.75; ctx.setLineDash([3, 5]);
  ctx.beginPath(); ctx.moveTo(gx, vmaxY); ctx.lineTo(W - 20, vmaxY); ctx.stroke();
  ctx.setLineDash([]);
  bioText(ctx, 'Vmax', gx + 4, vmaxY - 3, C.text3, 8);

  bioText(ctx, `Temp: ${p.enTemp || 37}°C   pH: ${(p.enPH || 7).toFixed(1)}   [I]: ${inhibK}mM`, 12, H - 18, C.text2, 9);
}

// ─── CARDIAC CYCLE ────────────────────────────────────────────────────────
function drawHeart(ctx, W, H, p) {
  const hr = p.hrRate || 72;
  const sv = p.hrStroke || 70;
  const co = (hr * sv / 1000).toFixed(2);
  const period = 60 / hr;
  const phase = (heartState.t % period) / period;
  const systole = phase < 0.35;

  const cx = W / 2, cy = H / 2 - 20;
  const scale = systole ? 1 - phase * 0.15 : 0.85 + (phase - 0.35) * 0.23;

  // Heart shape using bezier curves
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  const hColor = systole ? C.red : C.pink;
  ctx.fillStyle = hColor;
  ctx.shadowColor = hColor; ctx.shadowBlur = systole ? 22 : 8;
  ctx.beginPath();
  ctx.moveTo(0, 30);
  ctx.bezierCurveTo(-60, -10, -90, -60, -50, -80);
  ctx.bezierCurveTo(-20, -95, 0, -70, 0, -50);
  ctx.bezierCurveTo(0, -70, 20, -95, 50, -80);
  ctx.bezierCurveTo(90, -60, 60, -10, 0, 30);
  ctx.fill();
  ctx.restore();

  // Labels inside heart
  bioText(ctx, systole ? 'SYSTOLE' : 'DIASTOLE', cx - 32, cy + 5, '#fff', 10);

  // ECG wave (simple sketch)
  const ecgY = H - 70;
  const ecgW = W - 80;
  ctx.strokeStyle = C.green; ctx.lineWidth = 2;
  ctx.shadowColor = C.green; ctx.shadowBlur = 4;
  ctx.beginPath();
  for (let xi = 0; xi < ecgW; xi++) {
    const t2 = (xi / ecgW + heartState.t / period) % 1;
    let amp = 0;
    if (t2 < 0.05) amp = t2 * 4;          // P wave
    else if (t2 < 0.1) amp = (0.1 - t2) * 2;
    else if (t2 < 0.3) amp = 0;
    else if (t2 < 0.35) amp = (t2 - 0.3) * -60; // Q dip
    else if (t2 < 0.4) amp = (t2 - 0.35) * 120;  // R peak
    else if (t2 < 0.45) amp = (0.5 - t2) * 30;   // S
    else if (t2 < 0.6) amp = 8 * Math.sin((t2 - 0.5) * Math.PI / 0.1) * 0.5; // T
    const vy = ecgY - amp * 1.5;
    xi === 0 ? ctx.moveTo(40 + xi, vy) : ctx.lineTo(40 + xi, vy);
  }
  ctx.stroke(); ctx.shadowBlur = 0;

  // Readings
  bioText(ctx, `HR: ${hr} bpm`, 12, H - 18, C.red, 11);
  bioText(ctx, `SV: ${sv} mL`, 130, H - 18, C.amber, 11);
  bioText(ctx, `CO: ${co} L/min`, 240, H - 18, C.green, 11);
  bioText(ctx, 'ECG', 14, ecgY - 8, C.text3, 9);
}

// ─── BLOOD CIRCULATION ───────────────────────────────────────────────────
function drawBloodFlow(ctx, W, H, p) {
  const cx = W / 2, cy = H / 2;
  const hr = p.bfHR || 72;
  const period = 60 / hr;
  const heartPhase = (bloodState.t % period) / period;
  const isSystole = heartPhase < 0.38;
  const heartPulse = isSystole ? 1 + 0.12 * Math.sin(heartPhase / 0.38 * Math.PI) : 1;

  // ── Background labels ──
  bioText(ctx, 'PULMONARY CIRCUIT', 12, 18, 'rgba(46,99,196,0.5)', 9);
  bioText(ctx, '(to lungs)', 12, 30, 'rgba(46,99,196,0.35)', 8);
  bioText(ctx, 'SYSTEMIC CIRCUIT', W - 140, 18, 'rgba(200,50,50,0.5)', 9);
  bioText(ctx, '(to body)', W - 100, 30, 'rgba(200,50,50,0.35)', 8);

  // ── LUNGS (top) ──
  const lungY = cy - 130;
  [cx - 55, cx + 55].forEach((lx, i) => {
    const lGrad = ctx.createRadialGradient(lx, lungY, 5, lx, lungY, 42);
    lGrad.addColorStop(0, 'rgba(180,210,255,0.7)');
    lGrad.addColorStop(1, 'rgba(140,180,240,0.25)');
    ctx.fillStyle = lGrad;
    ctx.beginPath(); ctx.ellipse(lx, lungY, 38, 48, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(100,150,220,0.5)'; ctx.lineWidth = 1.5;
    ctx.stroke();
    // Alveoli hint
    for (let j = 0; j < 4; j++) {
      const ax = lx + (j % 2 === 0 ? -12 : 12);
      const ay = lungY + (j < 2 ? -14 : 10);
      ctx.strokeStyle = 'rgba(100,160,240,0.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(ax, ay, 8, 0, Math.PI * 2); ctx.stroke();
    }
    bioText(ctx, i === 0 ? 'L. Lung' : 'R. Lung', lx - 18, lungY + 60, 'rgba(80,130,200,0.7)', 8);
  });

  // ── BODY / ORGANS (bottom) ──
  const bodyY = cy + 148;
  // Organ silhouettes
  const organs = [
    { x: cx - 80, y: bodyY, w: 30, h: 18, label: 'Brain', color: 'rgba(240,180,120,0.5)' },
    { x: cx, y: bodyY, w: 35, h: 20, label: 'Liver', color: 'rgba(160,100,60,0.4)' },
    { x: cx + 80, y: bodyY, w: 28, h: 18, label: 'Muscle', color: 'rgba(200,100,100,0.45)' },
  ];
  organs.forEach(o => {
    ctx.fillStyle = o.color;
    ctx.beginPath(); ctx.ellipse(o.x, o.y, o.w, o.h, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1; ctx.stroke();
    bioText(ctx, o.label, o.x - 14, o.y + o.h + 12, C.text2, 8);
  });

  // ── VESSEL PATHS ──
  // Helper: draw a curved vessel tube
  function vessel(x1, y1, cpx, cpy, x2, y2, color, width) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
    ctx.shadowColor = color; ctx.shadowBlur = 4;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cpx, cpy, x2, y2); ctx.stroke();
    ctx.restore();
  }

  // Pulmonary artery (right ventricle → lungs) — blue (deoxygenated leaving heart)
  vessel(cx - 22, cy - 45, cx - 70, cy - 85, cx - 55, lungY + 48, 'rgba(70,130,220,0.7)', 9);
  vessel(cx + 22, cy - 45, cx + 70, cy - 85, cx + 55, lungY + 48, 'rgba(70,130,220,0.7)', 9);
  // Pulmonary vein (lungs → left atrium) — red (oxygenated returning)
  vessel(cx - 55, lungY + 48, cx - 40, cy - 100, cx - 16, cy - 48, 'rgba(220,60,60,0.65)', 9);
  vessel(cx + 55, lungY + 48, cx + 40, cy - 100, cx + 16, cy - 48, 'rgba(220,60,60,0.65)', 9);

  // Aorta (left ventricle → body) — red thick
  vessel(cx - 18, cy + 48, cx - 100, cy + 90, cx - 80, bodyY - 18, 'rgba(220,60,60,0.75)', 11);
  vessel(cx, cy + 48, cx, cy + 105, cx, bodyY - 20, 'rgba(220,60,60,0.75)', 11);
  vessel(cx + 18, cy + 48, cx + 100, cy + 90, cx + 80, bodyY - 18, 'rgba(220,60,60,0.75)', 11);
  // Vena cava (body → right atrium) — blue
  vessel(cx - 80, bodyY - 18, cx - 110, cy + 80, cx - 24, cy + 42, 'rgba(70,100,200,0.65)', 9);
  vessel(cx, bodyY - 20, cx - 10, cy + 110, cx - 20, cy + 44, 'rgba(70,100,200,0.65)', 9);
  vessel(cx + 80, bodyY - 18, cx + 110, cy + 80, cx + 24, cy + 42, 'rgba(70,100,200,0.65)', 9);

  // ── HEART (centre) ──
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(heartPulse, heartPulse);

  // Pericardium shadow
  ctx.fillStyle = 'rgba(200,60,80,0.08)';
  ctx.beginPath(); ctx.ellipse(0, 0, 58, 52, 0, 0, Math.PI * 2); ctx.fill();

  // Heart shape
  const hGrad = ctx.createRadialGradient(-10, -15, 5, 0, 0, 55);
  hGrad.addColorStop(0, isSystole ? '#ff6b7a' : '#e05252');
  hGrad.addColorStop(1, isSystole ? '#c0182a' : '#8b1a1a');
  ctx.fillStyle = hGrad;
  ctx.shadowColor = isSystole ? '#ff4466' : '#c0182a';
  ctx.shadowBlur = isSystole ? 20 : 8;
  ctx.beginPath();
  ctx.moveTo(0, 26);
  ctx.bezierCurveTo(-52, -8, -80, -52, -44, -68);
  ctx.bezierCurveTo(-18, -80, 0, -60, 0, -42);
  ctx.bezierCurveTo(0, -60, 18, -80, 44, -68);
  ctx.bezierCurveTo(80, -52, 52, -8, 0, 26);
  ctx.fill();

  // Heart chambers labels
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = "bold 7px 'DM Sans',sans-serif";
  ctx.fillText('RA', -28, -8);
  ctx.fillText('LA', 14, -8);
  ctx.fillText('RV', -28, 16);
  ctx.fillText('LV', 14, 16);

  // Septum
  ctx.strokeStyle = 'rgba(180,40,40,0.4)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, -42); ctx.lineTo(0, 22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-44, -10); ctx.lineTo(44, -10); ctx.stroke();

  ctx.restore();

  // ── PHASE LABEL ──
  const phaseLabel = isSystole ? '🔴 SYSTOLE — Ventricles Contract' : '🔵 DIASTOLE — Heart Fills';
  bioText(ctx, phaseLabel, cx - 110, H - 34, isSystole ? C.red : C.blue, 10);

  // ── BLOOD CELLS FLOWING ──
  bloodState.cells.forEach(cell => {
    const pos = cell.pos; // 0→1
    let bx, by;
    if (cell.path === 'pulmonary') {
      // right ventricle → lungs → left atrium
      if (pos < 0.5) {
        const t2 = pos * 2;
        bx = cx - 22 + (cx - 55 - cx + 22) * t2 + Math.sin(t2 * Math.PI) * (-50);
        by = cy - 45 + (lungY + 48 - cy + 45) * t2;
      } else {
        const t2 = (pos - 0.5) * 2;
        bx = cx - 55 + (cx - 16 - cx + 55) * t2 + Math.sin(t2 * Math.PI) * 30;
        by = lungY + 48 + (cy - 48 - lungY - 48) * t2;
      }
    } else {
      // left ventricle → body → right atrium
      if (pos < 0.5) {
        const t2 = pos * 2;
        const dest = organs[Math.floor(Math.random() * 3) % 3]; // pick one organ
        bx = cx - 18 + (-80 - cx + 18) * t2 + Math.sin(t2 * Math.PI) * (-80);
        by = cy + 48 + (bodyY - cy - 48) * t2;
      } else {
        const t2 = (pos - 0.5) * 2;
        bx = cx - 80 + (cx - 24 - cx + 80) * t2 + Math.sin(t2 * Math.PI) * (-40);
        by = bodyY - 18 + (cy + 42 - bodyY + 18) * t2;
      }
    }
    if (isNaN(bx) || isNaN(by)) return;
    // Oxygenated = red, deoxygenated = dark blue-red
    const cellColor = cell.oxy ? '#ff4455' : '#3a4aaa';
    ctx.save();
    ctx.fillStyle = cellColor;
    ctx.shadowColor = cellColor; ctx.shadowBlur = 5;
    // Draw biconcave disc shape
    ctx.beginPath(); ctx.ellipse(bx, by, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });

  // ── READINGS ──
  const co = ((hr * (p.bfBP || 120) / 120 * 70) / 1000).toFixed(2);
  bioText(ctx, `HR: ${hr} bpm`, 12, H - 18, C.red, 10);
  bioText(ctx, `BP: ${p.bfBP || 120} mmHg`, 110, H - 18, C.amber, 10);
  bioText(ctx, `CO ≈ ${co} L/min`, 240, H - 18, C.green, 10);
  const exLabels = ['Rest', 'Light', 'Moderate', 'Intense'];
  bioText(ctx, `State: ${exLabels[Math.round(p.bfExercise || 0)]}`, W - 120, H - 18, C.violet, 10);
}

// ─── FLOWER POLLINATION ───────────────────────────────────────────────────
function drawPollination(ctx, W, H, p) {
  const phase = pollinationState.beePhase; // 0→1
  const wind = p.plWindSpeed || 1;

  // ── SKY BACKGROUND ──
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
  skyGrad.addColorStop(0, 'rgba(180,225,255,0.4)');
  skyGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // Ground
  ctx.fillStyle = 'rgba(120,180,80,0.18)';
  ctx.fillRect(0, H - 60, W, 60);
  ctx.strokeStyle = 'rgba(80,140,40,0.3)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, H - 60); ctx.lineTo(W, H - 60); ctx.stroke();

  // ── HELPER: draw a flower ──
  function drawFlower(fx, fy, size, hasPollenOnStigma, hasPollen) {
    // Stem
    ctx.strokeStyle = '#4a8a2a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(fx, H - 60); ctx.lineTo(fx, fy + size); ctx.stroke();
    // Leaves
    ctx.fillStyle = '#5aaa3a';
    ctx.beginPath(); ctx.ellipse(fx - 18, fy + size * 1.3, 18, 8, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(fx + 18, fy + size * 1.5, 16, 7, 0.4, 0, Math.PI * 2); ctx.fill();

    // Petals
    const petalColors = ['#ff9eb5', '#ffb3c6', '#ffc8d7', '#ffe0ea', '#ffb3c6'];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const px = fx + Math.cos(angle) * size * 1.1;
      const py = fy + Math.sin(angle) * size * 1.1;
      const pGrad = ctx.createRadialGradient(px, py, 1, px, py, size * 0.85);
      pGrad.addColorStop(0, '#fff0f5');
      pGrad.addColorStop(1, petalColors[i]);
      ctx.fillStyle = pGrad;
      ctx.beginPath(); ctx.ellipse(px, py, size * 0.72, size * 0.45, angle, 0, Math.PI * 2); ctx.fill();
    }

    // Centre / receptacle
    const cGrad = ctx.createRadialGradient(fx, fy, 2, fx, fy, size * 0.6);
    cGrad.addColorStop(0, '#ffe066');
    cGrad.addColorStop(1, '#f4a020');
    ctx.fillStyle = cGrad;
    ctx.beginPath(); ctx.arc(fx, fy, size * 0.55, 0, Math.PI * 2); ctx.fill();

    // Stamens (anthers) with pollen dots
    if (hasPollen) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const sx = fx + Math.cos(a) * size * 0.3;
        const sy = fy + Math.sin(a) * size * 0.3;
        ctx.strokeStyle = '#c8801a'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(fx + Math.cos(a) * size * 0.15, fy + Math.sin(a) * size * 0.15);
        ctx.lineTo(sx, sy); ctx.stroke();
        ctx.fillStyle = '#ffe066';
        ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Stigma (sticky tip at top of pistil)
    ctx.fillStyle = hasPollenOnStigma ? '#e8cc00' : '#e8a0b0';
    ctx.strokeStyle = '#c07090'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(fx, fy - size * 0.22, 5, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    if (hasPollenOnStigma) {
      ctx.fillStyle = '#ffe066';
      ctx.beginPath(); ctx.arc(fx, fy - size * 0.22, 3, 0, Math.PI * 2); ctx.fill();
      bioText(ctx, 'Pollen!', fx + 8, fy - size * 0.22 - 6, '#c8a000', 8);
    }

    // Label parts on first flower
    if (fx < W / 2) {
      bioText(ctx, 'Anther', fx - 46, fy - size * 0.08, '#b06820', 8);
      bioText(ctx, 'Petal', fx + size * 0.9, fy - size * 0.5, '#cc6080', 8);
      bioText(ctx, 'Stigma', fx + 8, fy - size * 0.22 - 16, '#aa4060', 8);
      bioText(ctx, 'Receptacle', fx + size * 0.6, fy + size * 0.8, '#888', 8);
    }
  }

  // Flower positions
  const f1x = W * 0.22, f1y = H * 0.42, f1size = 30;
  const f2x = W * 0.72, f2y = H * 0.38, f2size = 28;
  const pollenOnF2 = phase > 0.72;
  drawFlower(f1x, f1y, f1size, false, true);
  drawFlower(f2x, f2y, f2size, pollenOnF2, false);

  // ── POLLEN TUBE (flower 2) ──
  if (pollinationState.tubeLen > 0) {
    const tubeEnd = f2y + f2size * 0.22 + pollinationState.tubeLen * 90;
    ctx.save();
    ctx.strokeStyle = '#e8c000'; ctx.lineWidth = 2;
    ctx.shadowColor = '#ffe066'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(f2x, f2y - f2size * 0.22); ctx.lineTo(f2x, tubeEnd); ctx.stroke();
    ctx.restore();
    bioText(ctx, 'Pollen tube', f2x + 8, f2y + 40 + pollinationState.tubeLen * 50, '#b89a00', 8);
    if (pollinationState.fertilised) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,220,50,0.15)';
      ctx.strokeStyle = '#e8c000'; ctx.lineWidth = 1.5;
      ctx.shadowColor = '#ffe066'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(f2x, f2y + f2size + 60, 14, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.restore();
      bioText(ctx, '✓ Fertilised!', f2x - 28, f2y + f2size + 82, '#a07800', 10);
      bioText(ctx, 'Ovule → Seed', f2x - 24, f2y + f2size + 96, '#a07800', 8);
    }
  }

  // ── WIND POLLEN GRAINS ──
  pollinationState.pollenGrains.forEach(g => {
    ctx.save();
    ctx.globalAlpha = g.life * 0.85;
    ctx.fillStyle = '#ffe066'; ctx.shadowColor = '#ffe066'; ctx.shadowBlur = 4;
    ctx.beginPath(); ctx.arc(g.x, g.y, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  if (wind > 2) {
    bioText(ctx, `💨 Wind: ${wind} m/s`, 12, 20, C.text2, 9);
  }

  // ── BEE ──
  // Compute bee position along flight path
  let beeX, beeY, beeAngle = 0;
  if (phase < 0.25) {
    // Approach flower 1 (from left edge)
    const t = phase / 0.25;
    beeX = -30 + (f1x - 30 - (-30)) * t + Math.sin(t * Math.PI * 3) * 18;
    beeY = H * 0.25 + (f1y - 40 - H * 0.25) * t;
    beeAngle = 0.2;
  } else if (phase < 0.5) {
    // Hovering at flower 1, collecting
    const t = (phase - 0.25) / 0.25;
    beeX = f1x + Math.sin(t * Math.PI * 4) * 14;
    beeY = f1y - 35 + Math.cos(t * Math.PI * 4) * 8;
    beeAngle = Math.sin(t * Math.PI * 4) * 0.3;
  } else if (phase < 0.75) {
    // Fly to flower 2
    const t = (phase - 0.5) / 0.25;
    const midX = (f1x + f2x) / 2;
    const midY = Math.min(f1y, f2y) - 80;
    if (t < 0.5) {
      const t2 = t * 2;
      beeX = f1x + (midX - f1x) * t2 + Math.sin(t2 * Math.PI) * 20;
      beeY = (f1y - 35) + (midY - f1y + 35) * t2;
    } else {
      const t2 = (t - 0.5) * 2;
      beeX = midX + (f2x - midX) * t2 + Math.sin(t2 * Math.PI) * 20;
      beeY = midY + (f2y - 40 - midY) * t2;
    }
    beeAngle = t < 0.5 ? 0.15 : -0.15;
  } else {
    // Deposit pollen at flower 2
    const t = (phase - 0.75) / 0.25;
    beeX = f2x + Math.sin(t * Math.PI * 3) * 12;
    beeY = f2y - 38 + Math.cos(t * Math.PI * 3) * 8;
    beeAngle = Math.sin(t * Math.PI * 3) * 0.25;
  }

  // Draw bee
  ctx.save();
  ctx.translate(beeX, beeY);
  ctx.rotate(beeAngle);

  // Wings (animated flutter)
  const flutter = Math.sin(bloodState.t * 35) * 0.3;
  ctx.fillStyle = 'rgba(180,220,255,0.65)';
  ctx.beginPath(); ctx.ellipse(-6, -10 + flutter * 4, 12, 7, -0.4 + flutter, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(6, -10 + flutter * 4, 12, 7, 0.4 - flutter, 0, Math.PI * 2); ctx.fill();

  // Body (abdomen)
  const beeGrad = ctx.createLinearGradient(0, -6, 0, 10);
  beeGrad.addColorStop(0, '#f4b800');
  beeGrad.addColorStop(0.4, '#f4b800');
  beeGrad.addColorStop(0.41, '#1a1a1a');
  beeGrad.addColorStop(0.7, '#f4b800');
  beeGrad.addColorStop(0.71, '#1a1a1a');
  beeGrad.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = beeGrad;
  ctx.beginPath(); ctx.ellipse(0, 2, 8, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.5; ctx.stroke();

  // Head
  ctx.fillStyle = '#f4b800';
  ctx.beginPath(); ctx.arc(0, -10, 6, 0, Math.PI * 2); ctx.fill();
  // Eye
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(3, -11, 1.5, 0, Math.PI * 2); ctx.fill();
  // Antennae
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-2, -15); ctx.lineTo(-6, -22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2, -15); ctx.lineTo(6, -22); ctx.stroke();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(-6, -22, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6, -22, 1.5, 0, Math.PI * 2); ctx.fill();

  // Pollen basket (if carrying pollen)
  if (pollinationState.beeHasPollen && phase < 0.75) {
    ctx.fillStyle = '#ffe066';
    ctx.shadowColor = '#ffe066'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.ellipse(-10, 2, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(10, 2, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    bioText(ctx, 'Pollen', 13, 6, '#b89a00', 7);
  }

  ctx.restore();

  // Phase label
  const phaseLabels = [
    'Bee approaching flower…',
    'Collecting nectar & pollen…',
    'Flying to next flower…',
    'Depositing pollen on stigma…',
  ];
  const phaseIdx = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3;
  bioText(ctx, phaseLabels[phaseIdx], W / 2 - 90, H - 18, C.violet, 10);
  const pollenCnt = p.plPollenAmt || 3;
  bioText(ctx, `Pollen load: ${pollenCnt}   Wind: ${wind} m/s   Dist: ${p.plFlowerDist || 2.5}m`, 12, H - 34, C.text2, 9);
}

// ─── POPULATION GROWTH ───────────────────────────────────────────────────
function drawPopulation(ctx, W, H, p) {
  const gx = 50, gy = H - 50;
  const chartW = W - 80, chartH = H - 90;
  const K = p.popK || 800;
  const dur = 10;

  drawAxis(ctx, gx, gy, W, H, 'Time (yr)', 'N');
  bioText(ctx, 'Logistic Population Growth', gx + 10, 18, C.lime, 11);

  // Carrying capacity line
  const kyY = gy - (K / (K * 1.2)) * chartH;
  ctx.strokeStyle = C.amber; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(gx, kyY); ctx.lineTo(W - 20, kyY); ctx.stroke();
  ctx.setLineDash([]);
  bioText(ctx, `K = ${K}`, gx + 4, kyY - 4, C.amber, 9);

  // Population curve (theoretical)
  const r = p.popR || 0.3;
  const N0 = p.popN0 || 50;
  ctx.strokeStyle = 'rgba(46,196,182,0.2)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
  ctx.beginPath();
  for (let ti = 0; ti <= dur; ti += 0.1) {
    const Nt = K / (1 + ((K - N0) / N0) * Math.exp(-r * ti));
    const vx = gx + (ti / dur) * chartW;
    const vy = gy - (Nt / (K * 1.2)) * chartH;
    ti === 0 ? ctx.moveTo(vx, vy) : ctx.lineTo(vx, vy);
  }
  ctx.stroke(); ctx.setLineDash([]);

  // Actual simulated path
  if (populationState.history.length > 1) {
    ctx.save(); ctx.strokeStyle = C.lime; ctx.lineWidth = 2.5;
    ctx.shadowColor = C.lime; ctx.shadowBlur = 8;
    ctx.beginPath();
    populationState.history.forEach((pt, i) => {
      const vx = gx + (pt.t / dur) * chartW;
      const vy = gy - (pt.N / (K * 1.2)) * chartH;
      i === 0 ? ctx.moveTo(vx, vy) : ctx.lineTo(vx, vy);
    });
    ctx.stroke(); ctx.restore();
  }

  // Current point
  const curX = gx + (populationState.t / dur) * chartW;
  const curY = gy - (populationState.N / (K * 1.2)) * chartH;
  ctx.save(); ctx.fillStyle = C.amber; ctx.shadowColor = C.amber; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.arc(curX, curY, 7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  bioText(ctx, `N(t) = ${Math.round(populationState.N)}`, curX + 10, curY - 5, C.amber, 10);
  bioText(ctx, `N₀ = ${N0}   r = ${r}/yr   K = ${K}`, 12, H - 18, C.text2, 9);
}

// ─── NATURAL SELECTION ────────────────────────────────────────────────────
function drawSelection(ctx, W, H, p) {
  const gx = 50, gy = H - 50;
  const chartW = W - 80, chartH = H - 90;
  const dur = 10;

  drawAxis(ctx, gx, gy, W, H, 'Generations', 'Allele freq.');
  bioText(ctx, 'Allele Frequency under Selection', gx + 10, 18, C.blue, 11);

  // Grid lines at 0.25, 0.5, 0.75
  [0.25, 0.5, 0.75].forEach(freq => {
    const fy = gy - freq * chartH;
    ctx.strokeStyle = C.border; ctx.lineWidth = 0.5; ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.moveTo(gx, fy); ctx.lineTo(W - 20, fy); ctx.stroke();
    bioText(ctx, freq.toFixed(2), gx - 34, fy + 3, C.text3, 8);
  });
  ctx.setLineDash([]);

  // Dominant allele A (p)
  if (selectionState.history.length > 1) {
    ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 2.5;
    ctx.shadowColor = C.blue; ctx.shadowBlur = 6;
    ctx.beginPath();
    selectionState.history.forEach((pt, i) => {
      const vx = gx + (pt.t / dur) * chartW;
      const vy = gy - pt.p * chartH;
      i === 0 ? ctx.moveTo(vx, vy) : ctx.lineTo(vx, vy);
    });
    ctx.stroke();
    // q = 1-p
    ctx.strokeStyle = C.red;
    ctx.beginPath();
    selectionState.history.forEach((pt, i) => {
      const vx = gx + (pt.t / dur) * chartW;
      const vy = gy - (1 - pt.p) * chartH;
      i === 0 ? ctx.moveTo(vx, vy) : ctx.lineTo(vx, vy);
    });
    ctx.stroke();
    ctx.restore();
  }

  // Current dot
  const curX = gx + (selectionState.t / dur) * chartW;
  const pCur = selectionState.p;
  ctx.save();
  ctx.fillStyle = C.blue; ctx.shadowColor = C.blue; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(curX, gy - pCur * chartH, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.red;
  ctx.beginPath(); ctx.arc(curX, gy - (1 - pCur) * chartH, 7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Legend
  bioText(ctx, '── p (dominant A)', W - 190, 20, C.blue, 9);
  bioText(ctx, '── q (recessive a)', W - 190, 34, C.red, 9);

  bioText(ctx, `p = ${pCur.toFixed(3)}   q = ${(1 - pCur).toFixed(3)}   s = ${p.nsSelect || 0.3}`, 12, H - 18, C.text2, 9);
}

// ─── Readings Calculator ──────────────────────────────────────────────────
function getReadings(expKey, p) {
  switch (expKey) {
    case 'osmosis': {
      const conc = p.osConc || 0.5;
      const pi = (conc * 8.314 * (p.osTemp + 273 || 298) / 1000).toFixed(2);
      return [
        ['Solute conc.', `${conc.toFixed(2)} M`],
        ['Osmotic P', `${(conc * 24.5).toFixed(1)} atm`],
        ['Temp', `${p.osTemp || 25}°C`],
        ['Membrane', `${(p.osMembrane || 0.5).toFixed(2)}`],
        ['Condition', conc < 0.05 ? 'Hypotonic' : conc > 0.9 ? 'Hypertonic' : 'Isotonic'],
      ];
    }
    case 'photosynthesis': {
      const rate = photosynRate(p);
      return [
        ['Light', `${p.psLight || 60}%`],
        ['CO₂', `${p.psCO2 || 400} ppm`],
        ['Temperature', `${p.psTemp || 25}°C`],
        ['Rate', `${(rate * 100).toFixed(0)}%`],
        ['O₂ produced', `${(rate * 12).toFixed(2)} μmol/s`],
      ];
    }
    case 'mitosis': {
      const raw = (mitosisState.t * (p.mtSpeed || 1)) % 10;
      const phase = raw < 2 ? 'Prophase' : raw < 4 ? 'Metaphase' : raw < 6 ? 'Anaphase' : raw < 8 ? 'Telophase' : 'Cytokinesis';
      return [
        ['Phase', phase],
        ['Chr. pairs', `${Math.round(p.mtChrom || 2)}`],
        ['Speed', `${(p.mtSpeed || 1).toFixed(1)}×`],
        ['Daughter cells', '2 (diploid)'],
        ['DNA content', phase === 'Anaphase' ? '4n → 2×2n' : '2n'],
      ];
    }
    case 'mendelian': {
      const p1 = Math.round(p.mnParent1 || 1);
      const p2 = Math.round(p.mnParent2 || 1);
      const labels = ['AA', 'Aa', 'aa'];
      const p1a = p1 === 0 ? ['A', 'A'] : p1 === 1 ? ['A', 'a'] : ['a', 'a'];
      const p2a = p2 === 0 ? ['A', 'A'] : p2 === 1 ? ['A', 'a'] : ['a', 'a'];
      const combos = [p1a[0] + p2a[0], p1a[0] + p2a[1], p1a[1] + p2a[0], p1a[1] + p2a[1]].map(c => c.split('').sort((a, b) => a < b ? -1 : 1).join(''));
      const dom = combos.filter(c => c.includes('A')).length;
      return [
        ['Parent 1', labels[p1]],
        ['Parent 2', labels[p2]],
        ['Dominant', `${dom}/4 (${dom * 25}%)`],
        ['Recessive', `${4 - dom}/4 (${(4 - dom) * 25}%)`],
        ['Ratio', dom === 3 ? '3:1' : dom === 4 ? '4:0' : dom === 0 ? '0:4' : '2:2'],
      ];
    }
    case 'enzyme': {
      const v = mmRate(p);
      return [
        ['[S]', `${p.enSubstrate || 5} mM`],
        ['Rate v', `${v.toFixed(3)} μmol/s`],
        ['Temp', `${p.enTemp || 37}°C`],
        ['pH', `${(p.enPH || 7).toFixed(1)}`],
        ['Km (app)', `${(2.5 * (1 + (p.enInhib || 0))).toFixed(2)} mM`],
      ];
    }
    case 'heartrate': {
      const co = ((p.hrRate || 72) * (p.hrStroke || 70) / 1000).toFixed(2);
      const exerciseLabels = ['Rest', 'Light', 'Moderate', 'Intense'];
      return [
        ['Heart Rate', `${p.hrRate || 72} bpm`],
        ['Stroke Vol.', `${p.hrStroke || 70} mL`],
        ['Cardiac Out.', `${co} L/min`],
        ['Exercise', exerciseLabels[Math.round(p.hrExercise || 0)]],
        ['Cycle time', `${(60 / (p.hrRate || 72)).toFixed(2)} s`],
      ];
    }
    case 'population': {
      const growth = (populationState.N * (p.popR || 0.3) * (1 - populationState.N / (p.popK || 800))).toFixed(1);
      return [
        ['N(t)', `${Math.round(populationState.N)}`],
        ['K', `${p.popK || 800}`],
        ['r', `${(p.popR || 0.3).toFixed(2)}/yr`],
        ['dN/dt', `${growth} /yr`],
        ['% of K', `${(populationState.N / (p.popK || 800) * 100).toFixed(1)}%`],
      ];
    }
    case 'naturalselection': {
      const q = 1 - selectionState.p;
      return [
        ['p (dom.)', `${selectionState.p.toFixed(4)}`],
        ['q (rec.)', `${q.toFixed(4)}`],
        ['p² (AA)', `${(selectionState.p ** 2).toFixed(4)}`],
        ['2pq (Aa)', `${(2 * selectionState.p * q).toFixed(4)}`],
        ['q² (aa)', `${(q ** 2).toFixed(4)}`],
      ];
    }
    case 'bloodflow': {
      const hr = p.bfHR || 72;
      const bp = p.bfBP || 120;
      const vis = p.bfViscosity || 1;
      const co = (hr * 70 * (bp / 120) / 1000).toFixed(2);
      const exLabels = ['Rest', 'Light', 'Moderate', 'Intense'];
      return [
        ['Heart Rate', `${hr} bpm`],
        ['Blood Press.', `${bp}/${Math.round(bp * 0.65)} mmHg`],
        ['Cardiac Out.', `${co} L/min`],
        ['Viscosity', `${vis.toFixed(1)}×`],
        ['State', exLabels[Math.round(p.bfExercise || 0)]],
      ];
    }
    case 'pollination': {
      const phase = pollinationState.beePhase;
      const stages = ['Approaching', 'Collecting', 'In flight', 'Depositing'];
      const idx = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3;
      return [
        ['Bee stage', stages[idx]],
        ['Pollen load', `${p.plPollenAmt || 3} grains`],
        ['Wind', `${p.plWindSpeed || 1} m/s`],
        ['Distance', `${p.plFlowerDist || 2.5} m`],
        ['Fertilised', pollinationState.fertilised ? '✓ Yes' : 'Not yet'],
      ];
    }
    default: return [];
  }
}