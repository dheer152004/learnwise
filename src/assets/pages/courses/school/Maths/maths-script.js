// maths-script.js — all 5 maths simulations for CurioLab Maths Studio

/* ── FUNCTION GRAPHER ────────────────────────────────────────────────────── */
const gc = document.getElementById('grapherCanvas');
const gctx = gc.getContext('2d');

const FUNCS = {
    sin: x => Math.sin(x), cos: x => Math.cos(x),
    quad: x => x * x, cubic: x => x * x * x - 3 * x,
    exp: x => Math.exp(x) / 5, tan: x => Math.tan(x),
    log: x => Math.log(x + 4), abs: x => Math.abs(x),
};
const DFUNCS = {
    sin: x => Math.cos(x), cos: x => -Math.sin(x),
    quad: x => 2 * x, cubic: x => 3 * x * x - 3,
    exp: x => Math.exp(x) / 5, tan: x => 1 / (Math.cos(x) * Math.cos(x)),
    log: x => 1 / (x + 4), abs: x => x >= 0 ? 1 : -1,
};
const FLABELS = { sin: 'sin(x)', cos: 'cos(x)', quad: 'x²', cubic: 'x³−3x', exp: 'eˣ/5', tan: 'tan(x)', log: 'ln(x+4)', abs: '|x|' };

function updateGrapher() {
    const fn = document.getElementById('graphFunc').value;
    const xPos = parseFloat(document.getElementById('graphX').value);
    const zoom = parseFloat(document.getElementById('graphZoom').value);
    const show = document.getElementById('graphShow').value;
    document.getElementById('graphXVal').textContent = xPos.toFixed(2);
    document.getElementById('graphZoomVal').textContent = zoom.toFixed(1) + 'x';
    const f = FUNCS[fn], df = DFUNCS[fn];
    const fx = f(xPos), dfx = df(xPos);
    document.getElementById('graphFx').textContent = isFinite(fx) ? fx.toFixed(4) : 'undef';
    document.getElementById('graphDx').textContent = isFinite(dfx) ? dfx.toFixed(4) : 'undef';
    document.getElementById('graphAngle').textContent = isFinite(dfx) ? (Math.atan(dfx) * 180 / Math.PI).toFixed(1) + '°' : 'undef';
    drawGrapher(fn, xPos, zoom, show);
}

function drawGrapher(fn, xPos, zoom, show) {
    const W = gc.width, H = gc.height;
    gctx.clearRect(0, 0, W, H);
    gctx.fillStyle = '#0d1117'; gctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, scale = 50 * zoom;
    gctx.strokeStyle = 'rgba(255,255,255,0.05)'; gctx.lineWidth = 1;
    for (let i = Math.floor(-W / scale / 2); i <= W / scale / 2; i++) {
        const px = cx + i * scale; gctx.beginPath(); gctx.moveTo(px, 0); gctx.lineTo(px, H); gctx.stroke();
    }
    for (let j = -4; j <= 4; j++) {
        const py = cy + j * scale; gctx.beginPath(); gctx.moveTo(0, py); gctx.lineTo(W, py); gctx.stroke();
    }
    gctx.strokeStyle = 'rgba(255,255,255,0.25)'; gctx.lineWidth = 1.5;
    gctx.beginPath(); gctx.moveTo(0, cy); gctx.lineTo(W, cy); gctx.stroke();
    gctx.beginPath(); gctx.moveTo(cx, 0); gctx.lineTo(cx, H); gctx.stroke();
    gctx.fillStyle = 'rgba(255,255,255,0.3)'; gctx.font = '10px DM Sans'; gctx.textAlign = 'center';
    for (let i = -5; i <= 5; i++) {
        if (i === 0) continue;
        gctx.fillText(i, cx + i * scale, cy + 14);
        gctx.textAlign = 'right'; gctx.fillText(i, cx - 5, cy - i * scale + 4); gctx.textAlign = 'center';
    }
    const f = FUNCS[fn], df = DFUNCS[fn];
    if (show === 'both' || show === 'deriv') {
        gctx.beginPath(); let startD = true;
        for (let px = 0; px < W; px++) {
            const x = (px - cx) / scale, dy = df(x);
            if (!isFinite(dy) || Math.abs(dy) > 20) { startD = true; continue; }
            const py = cy - dy * scale;
            startD ? gctx.moveTo(px, py) : gctx.lineTo(px, py); startD = false;
        }
        gctx.strokeStyle = 'rgba(244,162,97,0.8)'; gctx.lineWidth = 1.8; gctx.stroke();
    }
    if (show === 'both' || show === 'func') {
        gctx.beginPath(); let startF = true;
        for (let px = 0; px < W; px++) {
            const x = (px - cx) / scale, fy = f(x);
            if (!isFinite(fy) || Math.abs(fy) > 20) { startF = true; continue; }
            const py = cy - fy * scale;
            startF ? gctx.moveTo(px, py) : gctx.lineTo(px, py); startF = false;
        }
        gctx.shadowBlur = 8; gctx.shadowColor = '#2ec4b6';
        gctx.strokeStyle = '#2ec4b6'; gctx.lineWidth = 2.5; gctx.stroke(); gctx.shadowBlur = 0;
    }
    const txPx = cx + xPos * scale, tyPx = cy - f(xPos) * scale;
    if (isFinite(tyPx) && Math.abs(f(xPos)) < 20) {
        const slope = df(xPos);
        if (isFinite(slope)) {
            const x1 = (0 - cx) / scale, y1 = f(xPos) + slope * (x1 - xPos);
            const x2 = (W - cx) / scale, y2 = f(xPos) + slope * (x2 - xPos);
            gctx.beginPath(); gctx.moveTo(0, cy - y1 * scale); gctx.lineTo(W, cy - y2 * scale);
            gctx.strokeStyle = 'rgba(244,162,97,0.45)'; gctx.lineWidth = 1.2; gctx.setLineDash([5, 4]); gctx.stroke(); gctx.setLineDash([]);
        }
        gctx.beginPath(); gctx.arc(txPx, tyPx, 7, 0, Math.PI * 2);
        gctx.fillStyle = '#f4a261'; gctx.fill();
        gctx.strokeStyle = '#fff'; gctx.lineWidth = 1.5; gctx.stroke();
        gctx.fillStyle = '#fff'; gctx.font = '600 11px DM Sans'; gctx.textAlign = 'left';
        gctx.fillText('(' + xPos.toFixed(2) + ', ' + f(xPos).toFixed(2) + ')', txPx + 10, tyPx - 8);
    }
    gctx.font = '600 11px DM Sans'; gctx.textAlign = 'left';
    if (show !== 'deriv') { gctx.fillStyle = '#2ec4b6'; gctx.fillText('f(x) = ' + FLABELS[fn], 14, 22); }
    if (show !== 'func') { gctx.fillStyle = '#f4a261'; gctx.fillText("f'(x) = derivative", 14, show === 'deriv' ? 22 : 38); }
}

/* ── UNIT CIRCLE ─────────────────────────────────────────────────────────── */
const ucc = document.getElementById('unitCircleCanvas');
const uccx = ucc.getContext('2d');
let circleAnimId = null, circleAnimRunning = false, animAngle = 45;

function updateUnitCircle() {
    animAngle = parseFloat(document.getElementById('circleAngle').value);
    document.getElementById('circleAngleVal').textContent = Math.round(animAngle) + '°';
    drawUnitCircle(animAngle);
}

function drawUnitCircle(deg) {
    const W = ucc.width, H = ucc.height;
    uccx.clearRect(0, 0, W, H);
    uccx.fillStyle = '#0d1117'; uccx.fillRect(0, 0, W, H);
    const cx = 175, cy = H / 2, R = 120;
    const rad = deg * Math.PI / 180;
    const px = cx + R * Math.cos(rad), py = cy - R * Math.sin(rad);
    const mode = document.getElementById('circleMode').value;
    uccx.strokeStyle = 'rgba(255,255,255,0.05)'; uccx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
        uccx.beginPath(); uccx.moveTo(cx + i * 40, cy - 160); uccx.lineTo(cx + i * 40, cy + 160); uccx.stroke();
        uccx.beginPath(); uccx.moveTo(cx - 180, cy + i * 40); uccx.lineTo(cx + 180, cy + i * 40); uccx.stroke();
    }
    uccx.strokeStyle = 'rgba(255,255,255,0.2)'; uccx.lineWidth = 1.5;
    uccx.beginPath(); uccx.moveTo(cx - 160, cy); uccx.lineTo(cx + 160, cy); uccx.stroke();
    uccx.beginPath(); uccx.moveTo(cx, cy - 155); uccx.lineTo(cx, cy + 155); uccx.stroke();
    uccx.beginPath(); uccx.arc(cx, cy, R, 0, Math.PI * 2);
    uccx.strokeStyle = 'rgba(255,255,255,0.2)'; uccx.lineWidth = 1.5; uccx.stroke();
    uccx.beginPath(); uccx.arc(cx, cy, 28, -rad, 0, rad > 0);
    uccx.strokeStyle = 'rgba(244,162,97,0.7)'; uccx.lineWidth = 2; uccx.stroke();
    uccx.fillStyle = '#f4a261'; uccx.font = '600 11px DM Sans'; uccx.textAlign = 'left';
    uccx.fillText(Math.round(deg) + '°', cx + 32, cy - 8);
    if (mode === 'cos' || mode === 'all') {
        uccx.beginPath(); uccx.moveTo(cx, cy); uccx.lineTo(px, cy);
        uccx.strokeStyle = '#2ec4b6'; uccx.lineWidth = 2.5; uccx.stroke();
        uccx.fillStyle = '#2ec4b6'; uccx.font = '600 11px DM Sans'; uccx.textAlign = 'center';
        uccx.fillText('cos=' + Math.cos(rad).toFixed(2), cx + (px - cx) / 2, cy + 18);
    }
    if (mode === 'sin' || mode === 'all') {
        uccx.beginPath(); uccx.moveTo(px, cy); uccx.lineTo(px, py);
        uccx.strokeStyle = '#ff6b9d'; uccx.lineWidth = 2.5; uccx.stroke();
        uccx.fillStyle = '#ff6b9d'; uccx.font = '600 11px DM Sans'; uccx.textAlign = 'left';
        uccx.fillText('sin=' + Math.sin(rad).toFixed(2), px + 6, cy + (py - cy) / 2 + 4);
    }
    if (mode === 'tan' || mode === 'all') {
        const tan = Math.tan(rad);
        if (Math.abs(tan) < 6) {
            uccx.beginPath(); uccx.moveTo(px, py); uccx.lineTo(cx + R, cy - tan * R);
            uccx.strokeStyle = '#7c5cbf'; uccx.lineWidth = 2; uccx.stroke();
        }
    }
    uccx.beginPath(); uccx.moveTo(cx, cy); uccx.lineTo(px, py);
    uccx.strokeStyle = 'rgba(255,255,255,0.7)'; uccx.lineWidth = 2; uccx.stroke();
    uccx.beginPath(); uccx.arc(px, py, 6, 0, Math.PI * 2);
    uccx.fillStyle = '#fff'; uccx.fill();
    // wave on right
    const wX0 = 340, wY0 = cy, wW = 260, wH = 110;
    uccx.fillStyle = 'rgba(0,0,0,0.3)'; uccx.fillRect(wX0, wY0 - wH, wW, wH * 2);
    uccx.strokeStyle = 'rgba(255,255,255,0.08)'; uccx.lineWidth = 1;
    uccx.beginPath(); uccx.moveTo(wX0, wY0); uccx.lineTo(wX0 + wW, wY0); uccx.stroke();
    const sinColor = mode === 'cos' ? '#2ec4b6' : mode === 'tan' ? '#7c5cbf' : '#ff6b9d';
    const sinFn = mode === 'cos' ? Math.cos : mode === 'tan' ? (a) => Math.min(Math.max(Math.tan(a), -1), 1) : Math.sin;
    uccx.beginPath();
    for (let px2 = 0; px2 <= wW; px2++) {
        const a = (px2 / wW) * Math.PI * 2 * 2, sy = wY0 - sinFn(a) * (wH - 10);
        px2 === 0 ? uccx.moveTo(wX0 + px2, sy) : uccx.lineTo(wX0 + px2, sy);
    }
    uccx.strokeStyle = sinColor; uccx.lineWidth = 2; uccx.stroke();
    const waveX = wX0 + (deg / 360) * wW, waveY = wY0 - sinFn(rad) * (wH - 10);
    uccx.beginPath(); uccx.arc(waveX, waveY, 5, 0, Math.PI * 2);
    uccx.fillStyle = '#f4a261'; uccx.fill();
    uccx.beginPath(); uccx.setLineDash([3, 3]);
    uccx.moveTo(waveX, wY0 - wH); uccx.lineTo(waveX, wY0 + wH);
    uccx.strokeStyle = 'rgba(244,162,97,0.4)'; uccx.lineWidth = 1; uccx.stroke(); uccx.setLineDash([]);
    uccx.fillStyle = 'rgba(255,255,255,0.4)'; uccx.font = '10px DM Sans'; uccx.textAlign = 'center';
    uccx.fillText(mode === 'cos' ? 'cos wave' : mode === 'tan' ? 'tan wave' : 'sin wave', wX0 + wW / 2, wY0 + wH + 16);
    document.getElementById('circleSin').textContent = Math.sin(rad).toFixed(4);
    document.getElementById('circleCos').textContent = Math.cos(rad).toFixed(4);
    document.getElementById('circleTan').textContent = Math.abs(Math.tan(rad)) > 99 ? 'undef' : Math.tan(rad).toFixed(4);
    document.getElementById('circleRad').textContent = rad.toFixed(4) + ' rad';
}

function toggleCircleAnim() {
    circleAnimRunning = !circleAnimRunning;
    document.getElementById('circleAnimBtn').textContent = circleAnimRunning ? 'Pause' : '▶ Animate';
    if (circleAnimRunning) runCircleAnim();
}
function stopCircleAnim() {
    circleAnimRunning = false; cancelAnimationFrame(circleAnimId);
    document.getElementById('circleAnimBtn').textContent = '▶ Animate';
}
function runCircleAnim() {
    animAngle = (animAngle + 0.5) % 360;
    document.getElementById('circleAngle').value = animAngle;
    document.getElementById('circleAngleVal').textContent = Math.round(animAngle) + '°';
    drawUnitCircle(animAngle);
    if (circleAnimRunning) circleAnimId = requestAnimationFrame(runCircleAnim);
}

/* ── RIEMANN SUMS ────────────────────────────────────────────────────────── */
const rc = document.getElementById('riemannCanvas');
const rctx = rc.getContext('2d');
const RFUNCS = {
    sin: x => Math.sin(x) + 1, quad: x => x * x / 4,
    cubic: x => x * x * x / 8 + 1, exp: x => Math.exp(x) / 4 + 0.5,
};
const RLABELS = { sin: 'sin(x)+1', quad: 'x²/4', cubic: 'x³/8+1', exp: 'eˣ/4+0.5' };

function integrate(f, a, b, steps = 2000) {
    const dx = (b - a) / steps; let s = 0;
    for (let i = 0; i < steps; i++) s += f(a + (i + 0.5) * dx) * dx;
    return s;
}

function updateRiemann() {
    const fn = document.getElementById('riemannFunc').value;
    const n = parseInt(document.getElementById('riemannN').value);
    const type = document.getElementById('riemannType').value;
    const a = parseFloat(document.getElementById('riemannA').value);
    const b = parseFloat(document.getElementById('riemannB').value);
    document.getElementById('riemannNVal').textContent = n;
    document.getElementById('riemannAVal').textContent = a;
    document.getElementById('riemannBVal').textContent = b;
    const f = RFUNCS[fn];
    const dx = (b - a) / n; let approx = 0;
    for (let i = 0; i < n; i++) {
        let xS;
        if (type === 'left') xS = a + i * dx;
        else if (type === 'right') xS = a + (i + 1) * dx;
        else xS = a + (i + 0.5) * dx;
        if (type === 'trap') approx += (f(a + i * dx) + f(a + (i + 1) * dx)) / 2 * dx;
        else approx += f(xS) * dx;
    }
    const exact = integrate(f, a, b);
    document.getElementById('riemannApprox').textContent = approx.toFixed(5);
    document.getElementById('riemannExact').textContent = exact.toFixed(5);
    document.getElementById('riemannError').textContent = Math.abs(approx - exact).toFixed(5);
    drawRiemann(fn, n, type, a, b);
}

function drawRiemann(fn, n, type, a, b) {
    const W = rc.width, H = rc.height;
    rctx.clearRect(0, 0, W, H);
    rctx.fillStyle = '#0d1117'; rctx.fillRect(0, 0, W, H);
    const PAD = { l: 50, r: 20, t: 30, b: 40 }, gW = W - PAD.l - PAD.r, gH = H - PAD.t - PAD.b;
    const f = RFUNCS[fn]; const xRange = b - a;
    const yVals = []; for (let i = 0; i <= 200; i++) yVals.push(f(a + (i / 200) * xRange));
    const yMax = Math.max(...yVals) * 1.15;
    const toX = x => PAD.l + ((x - a) / xRange) * gW;
    const toY = y => PAD.t + gH - (y / yMax) * gH;
    rctx.strokeStyle = 'rgba(255,255,255,0.05)'; rctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const gy = PAD.t + (gH / 4) * i; rctx.beginPath(); rctx.moveTo(PAD.l, gy); rctx.lineTo(PAD.l + gW, gy); rctx.stroke();
        rctx.fillStyle = 'rgba(255,255,255,0.3)'; rctx.font = '9px DM Sans'; rctx.textAlign = 'right';
        rctx.fillText((yMax - (yMax) * (i / 4)).toFixed(1), PAD.l - 5, gy + 3);
    }
    rctx.strokeStyle = 'rgba(255,255,255,0.2)'; rctx.lineWidth = 1.5;
    rctx.beginPath(); rctx.moveTo(PAD.l, PAD.t + gH); rctx.lineTo(PAD.l + gW, PAD.t + gH); rctx.stroke();
    rctx.beginPath(); rctx.moveTo(PAD.l, PAD.t); rctx.lineTo(PAD.l, PAD.t + gH); rctx.stroke();
    rctx.fillStyle = 'rgba(255,255,255,0.3)'; rctx.font = '9px DM Sans'; rctx.textAlign = 'center';
    for (let v = Math.ceil(a); v <= b; v++) rctx.fillText(v, toX(v), PAD.t + gH + 14);
    const dx = (b - a) / n;
    rctx.globalAlpha = 0.55;
    for (let i = 0; i < n; i++) {
        let xS;
        if (type === 'left') xS = a + i * dx;
        else if (type === 'right') xS = a + (i + 1) * dx;
        else xS = a + (i + 0.5) * dx;
        rctx.fillStyle = `hsl(${180 + i * 6},65%,55%)`;
        if (type === 'trap') {
            const y1 = f(a + i * dx), y2 = f(a + (i + 1) * dx);
            rctx.beginPath();
            rctx.moveTo(toX(a + i * dx), toY(0)); rctx.lineTo(toX(a + i * dx), toY(y1));
            rctx.lineTo(toX(a + (i + 1) * dx), toY(y2)); rctx.lineTo(toX(a + (i + 1) * dx), toY(0));
            rctx.closePath(); rctx.fill();
        } else {
            const fv = f(xS), rx = toX(a + i * dx), rw = toX(a + (i + 1) * dx) - toX(a + i * dx);
            rctx.fillRect(rx, toY(fv), rw, toY(0) - toY(fv));
        }
    }
    rctx.globalAlpha = 1;
    rctx.beginPath();
    for (let i = 0; i <= 400; i++) {
        const x = a + (i / 400) * xRange, px = toX(x), py = toY(f(x));
        i === 0 ? rctx.moveTo(px, py) : rctx.lineTo(px, py);
    }
    rctx.shadowBlur = 8; rctx.shadowColor = '#2ec4b6';
    rctx.strokeStyle = '#2ec4b6'; rctx.lineWidth = 2.5; rctx.stroke(); rctx.shadowBlur = 0;
    rctx.fillStyle = 'rgba(255,255,255,0.6)'; rctx.font = '600 11px DM Sans'; rctx.textAlign = 'left';
    rctx.fillText('f(x) = ' + RLABELS[fn] + '  |  n = ' + n, PAD.l + 4, 18);
}

/* ── GEOMETRY ────────────────────────────────────────────────────────────── */
const geoc = document.getElementById('geoCanvas');
const geoctx = geoc.getContext('2d');
const SHAPES = {
    triangle: [{ x: 0, y: -60 }, { x: 50, y: 40 }, { x: -50, y: 40 }],
    square: [{ x: -45, y: -45 }, { x: 45, y: -45 }, { x: 45, y: 45 }, { x: -45, y: 45 }],
    pentagon: Array.from({ length: 5 }, (_, i) => { const a = i * 2 * Math.PI / 5 - Math.PI / 2; return { x: Math.cos(a) * 55, y: Math.sin(a) * 55 }; }),
    arrow: [{ x: -60, y: -15 }, { x: 10, y: -15 }, { x: 10, y: -40 }, { x: 60, y: 0 }, { x: 10, y: 40 }, { x: 10, y: 15 }, { x: -60, y: 15 }],
    star: Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 === 0 ? 60 : 25; return { x: Math.cos(a) * r, y: Math.sin(a) * r }; }),
};

function updateGeo() {
    const shape = document.getElementById('geoShape').value;
    const rotate = parseFloat(document.getElementById('geoRotate').value) * Math.PI / 180;
    const scale = parseFloat(document.getElementById('geoScale').value);
    const tx = parseFloat(document.getElementById('geoTx').value);
    const ty = parseFloat(document.getElementById('geoTy').value);
    document.getElementById('geoRotateVal').textContent = Math.round(rotate * 180 / Math.PI) + '°';
    document.getElementById('geoScaleVal').textContent = scale.toFixed(2) + 'x';
    document.getElementById('geoTxVal').textContent = Math.round(tx);
    document.getElementById('geoTyVal').textContent = Math.round(ty);
    const pts = SHAPES[shape];
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length; area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    }
    const scaledArea = Math.abs(area) / 2 * scale * scale;
    const perimeter = pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + Math.hypot(q.x - p.x, q.y - p.y); }, 0) * scale;
    document.getElementById('geoArea').textContent = scaledArea.toFixed(1) + ' u²';
    document.getElementById('geoPerim').textContent = perimeter.toFixed(1) + ' u';
    drawGeo(pts, rotate, scale, tx, ty);
}

function drawGeo(pts, rotate, scale, tx, ty) {
    const W = geoc.width, H = geoc.height;
    geoctx.clearRect(0, 0, W, H);
    geoctx.fillStyle = '#0d1117'; geoctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, step = 40;
    geoctx.strokeStyle = 'rgba(255,255,255,0.05)'; geoctx.lineWidth = 1;
    for (let x = cx % step; x < W; x += step) { geoctx.beginPath(); geoctx.moveTo(x, 0); geoctx.lineTo(x, H); geoctx.stroke(); }
    for (let y = cy % step; y < H; y += step) { geoctx.beginPath(); geoctx.moveTo(0, y); geoctx.lineTo(W, y); geoctx.stroke(); }
    geoctx.strokeStyle = 'rgba(255,255,255,0.2)'; geoctx.lineWidth = 1.5;
    geoctx.beginPath(); geoctx.moveTo(0, cy); geoctx.lineTo(W, cy); geoctx.stroke();
    geoctx.beginPath(); geoctx.moveTo(cx, 0); geoctx.lineTo(cx, H); geoctx.stroke();
    // ghost
    geoctx.beginPath();
    pts.forEach((p, i) => { i === 0 ? geoctx.moveTo(cx + p.x, cy + p.y) : geoctx.lineTo(cx + p.x, cy + p.y); });
    geoctx.closePath();
    geoctx.strokeStyle = 'rgba(255,255,255,0.1)'; geoctx.lineWidth = 1.5; geoctx.setLineDash([4, 4]); geoctx.stroke(); geoctx.setLineDash([]);
    // transformed
    const transformed = pts.map(p => ({
        x: (p.x * Math.cos(rotate) - p.y * Math.sin(rotate)) * scale + tx,
        y: (p.x * Math.sin(rotate) + p.y * Math.cos(rotate)) * scale + ty,
    }));
    geoctx.beginPath();
    transformed.forEach((p, i) => { i === 0 ? geoctx.moveTo(cx + p.x, cy + p.y) : geoctx.lineTo(cx + p.x, cy + p.y); });
    geoctx.closePath();
    geoctx.fillStyle = 'rgba(124,92,191,0.18)'; geoctx.fill();
    geoctx.shadowBlur = 10; geoctx.shadowColor = '#7c5cbf';
    geoctx.strokeStyle = '#7c5cbf'; geoctx.lineWidth = 2.5; geoctx.stroke(); geoctx.shadowBlur = 0;
    transformed.forEach(p => { geoctx.beginPath(); geoctx.arc(cx + p.x, cy + p.y, 4, 0, Math.PI * 2); geoctx.fillStyle = '#a78bfa'; geoctx.fill(); });
    const centX = transformed.reduce((s, p) => s + p.x, 0) / transformed.length;
    const centY = transformed.reduce((s, p) => s + p.y, 0) / transformed.length;
    geoctx.beginPath(); geoctx.arc(cx + centX, cy + centY, 5, 0, Math.PI * 2); geoctx.fillStyle = '#f4a261'; geoctx.fill();
    geoctx.fillStyle = 'rgba(244,162,97,0.7)'; geoctx.font = '10px DM Sans'; geoctx.textAlign = 'left';
    geoctx.fillText('centroid (' + centX.toFixed(1) + ', ' + (-centY).toFixed(1) + ')', cx + centX + 8, cy + centY + 4);
}

function resetGeo() {
    ['geoRotate', 'geoScale', 'geoTx', 'geoTy'].forEach(id => { document.getElementById(id).value = id === 'geoScale' ? 1 : 0; });
    updateGeo();
}

/* ── NORMAL DISTRIBUTION ─────────────────────────────────────────────────── */
const nc = document.getElementById('normalCanvas');
const nctx = nc.getContext('2d');

function normalPDF(x, mu, sigma) { return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2); }
function bimodalPDF(x, mu, sigma) { return 0.5 * normalPDF(x, mu - sigma * 1.2, sigma * 0.7) + 0.5 * normalPDF(x, mu + sigma * 1.2, sigma * 0.7); }
function skewrightPDF(x, mu, sigma) { const z = (x - (mu - sigma * 0.5)) / sigma; return z < 0 ? 0 : (2 / sigma) * normalPDF(z, 0, 1) * (1 - Math.exp(-z * 1.2)); }
function skewleftPDF(x, mu, sigma) { const z = ((mu + sigma * 0.5) - x) / sigma; return z < 0 ? 0 : (2 / sigma) * normalPDF(z, 0, 1) * (1 - Math.exp(-z * 1.2)); }

function updateNormal() {
    const mu = parseFloat(document.getElementById('normMean').value);
    const sigma = parseFloat(document.getElementById('normSd').value);
    const region = document.getElementById('normRegion').value;
    const type = document.getElementById('normType').value;
    document.getElementById('normMeanVal').textContent = mu.toFixed(1);
    document.getElementById('normSdVal').textContent = sigma.toFixed(2);
    document.getElementById('normPeak').textContent = normalPDF(mu, mu, sigma).toFixed(4);
    drawNormal(mu, sigma, region, type);
}

function drawNormal(mu, sigma, region, type) {
    const W = nc.width, H = nc.height;
    nctx.clearRect(0, 0, W, H);
    nctx.fillStyle = '#0d1117'; nctx.fillRect(0, 0, W, H);
    const PAD = { l: 55, r: 20, t: 30, b: 55 };
    const gW = W - PAD.l - PAD.r, gH = H - PAD.t - PAD.b;
    const xMin = mu - 4 * sigma, xMax = mu + 4 * sigma;
    const toX = x => PAD.l + ((x - xMin) / (xMax - xMin)) * gW;
    const pdf = x => type === 'bimodal' ? bimodalPDF(x, mu, sigma) : type === 'skewright' ? skewrightPDF(x, mu, sigma) : type === 'skewleft' ? skewleftPDF(x, mu, sigma) : normalPDF(x, mu, sigma);
    const steps = 500, xStep = (xMax - xMin) / steps;
    const peakY = pdf(mu);
    const toY = y => PAD.t + gH - (y / peakY / 1.12) * gH;
    nctx.strokeStyle = 'rgba(255,255,255,0.05)'; nctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const gy = PAD.t + (gH / 4) * i; nctx.beginPath(); nctx.moveTo(PAD.l, gy); nctx.lineTo(PAD.l + gW, gy); nctx.stroke(); }
    if (region !== 'none') {
        let x1, x2;
        if (region === '1sd') { x1 = mu - sigma; x2 = mu + sigma; }
        else if (region === '2sd') { x1 = mu - 2 * sigma; x2 = mu + 2 * sigma; }
        else if (region === '3sd') { x1 = mu - 3 * sigma; x2 = mu + 3 * sigma; }
        else if (region === 'left') { x1 = xMin; x2 = mu; }
        else { x1 = mu; x2 = xMax; }
        nctx.beginPath(); nctx.moveTo(toX(x1), toY(0));
        for (let i = 0; i <= steps; i++) {
            const x = xMin + i * xStep; if (x < x1 || x > x2) continue; nctx.lineTo(toX(x), toY(pdf(x)));
        }
        nctx.lineTo(toX(x2), toY(0)); nctx.closePath();
        nctx.fillStyle = 'rgba(124,92,191,0.3)'; nctx.fill();
    }
    [-3, -2, -1, 0, 1, 2, 3].forEach(k => {
        const xk = mu + k * sigma; if (xk < xMin || xk > xMax) return;
        nctx.setLineDash([3, 3]);
        nctx.strokeStyle = k === 0 ? 'rgba(244,162,97,0.5)' : 'rgba(255,255,255,0.1)'; nctx.lineWidth = 1;
        nctx.beginPath(); nctx.moveTo(toX(xk), PAD.t); nctx.lineTo(toX(xk), PAD.t + gH); nctx.stroke(); nctx.setLineDash([]);
        nctx.fillStyle = 'rgba(255,255,255,0.3)'; nctx.font = '9px DM Sans'; nctx.textAlign = 'center';
        nctx.fillText(k === 0 ? 'μ' : (k > 0 ? '+' + k : k) + 'σ', toX(xk), PAD.t + gH + 14);
    });
    nctx.beginPath();
    for (let i = 0; i <= steps; i++) {
        const x = xMin + i * xStep, py = toY(pdf(x));
        i === 0 ? nctx.moveTo(toX(x), py) : nctx.lineTo(toX(x), py);
    }
    nctx.shadowBlur = 10; nctx.shadowColor = '#7c5cbf';
    nctx.strokeStyle = '#a78bfa'; nctx.lineWidth = 2.5; nctx.stroke(); nctx.shadowBlur = 0;
    nctx.strokeStyle = 'rgba(255,255,255,0.2)'; nctx.lineWidth = 1.5;
    nctx.beginPath(); nctx.moveTo(PAD.l, PAD.t + gH); nctx.lineTo(PAD.l + gW, PAD.t + gH); nctx.stroke();
    nctx.beginPath(); nctx.moveTo(PAD.l, PAD.t); nctx.lineTo(PAD.l, PAD.t + gH); nctx.stroke();
    const rs = [
        { label: '68.27%', x1: mu - sigma, x2: mu + sigma, color: 'rgba(124,92,191,0.6)' },
        { label: '95.45%', x1: mu - 2 * sigma, x2: mu + 2 * sigma, color: 'rgba(124,92,191,0.4)' },
    ];
    rs.forEach(r => {
        if (toX(r.x1) < PAD.l || toX(r.x2) > PAD.l + gW) return;
        const arrowY = PAD.t + gH + 38;
        nctx.beginPath(); nctx.moveTo(toX(r.x1), arrowY); nctx.lineTo(toX(r.x2), arrowY);
        nctx.strokeStyle = r.color; nctx.lineWidth = 2.5; nctx.stroke();
        nctx.fillStyle = r.color; nctx.font = '600 9px DM Sans'; nctx.textAlign = 'center';
        nctx.fillText(r.label, toX(r.x1) + (toX(r.x2) - toX(r.x1)) / 2, arrowY + 11);
    });
    nctx.fillStyle = 'rgba(255,255,255,0.6)'; nctx.font = '600 11px DM Sans'; nctx.textAlign = 'left';
    nctx.fillText('μ = ' + mu.toFixed(1) + '   σ = ' + sigma.toFixed(2) + '   Type: ' + type, PAD.l + 4, 18);
}