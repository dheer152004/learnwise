// app.js — main controller

let currentExp = 'pendulum';
let running    = false;
let animId     = null;
let simTime    = 0;
let lastTs     = 0;
let params     = {};

function init() {
  buildSidebar();
  loadExperiment('pendulum');
}

function buildSidebar() {
  var sidebar = document.getElementById('sidebar');
  var sections = {
    'MECHANICS':     ['pendulum','projectile','spring'],
    'WAVES & OPTICS':['vibgyor','snell','wave'],
    'THERMODYNAMICS':['boyle'],
    'MODERN PHYSICS':['photoelectric','capacitor'],
  };
  sidebar.innerHTML = '';
  Object.entries(sections).forEach(function(entry) {
    var sec = entry[0], keys = entry[1];
    var head = document.createElement('div');
    head.className = 'section-head';
    head.textContent = sec;
    sidebar.appendChild(head);
    keys.forEach(function(key) {
      var exp = EXPERIMENTS[key];
      var btn = document.createElement('button');
      btn.className = 'exp-btn';
      btn.id = 'btn-' + key;
      btn.innerHTML =
        '<span class="exp-icon">' + exp.icon + '</span>' +
        '<span class="exp-label">' + exp.title + '</span>' +
        '<span class="exp-tag">' + exp.tag + '</span>';
      btn.onclick = function() { loadExperiment(key); };
      sidebar.appendChild(btn);
    });
  });
}

function loadExperiment(key) {
  if (running) hardStop();
  currentExp = key;
  simTime = 0; lastTs = 0;

  document.querySelectorAll('.exp-btn').forEach(function(b){ b.classList.remove('active'); });
  var ab = document.getElementById('btn-' + key);
  if (ab) ab.classList.add('active');

  var exp = EXPERIMENTS[key];
  document.getElementById('simName').textContent    = exp.title;
  document.getElementById('simFormula').textContent = exp.formula;
  document.getElementById('infoBox').textContent    = exp.info;
  document.getElementById('simTime').textContent    = '';
  document.getElementById('runBtn').textContent     = '\u25B6 RUN';
  document.getElementById('runBtn').classList.remove('running');

  buildControls(key);
  resetStates(key, params);
  closeAllDrawers();

  setTimeout(function() {
    draw();
    updateReadings();
    if (exp.duration === 0) {
      setTimeout(function() { openDrawerWith(key); }, 120);
    }
  }, 60);
}

function buildControls(key) {
  var cc = document.getElementById('controlsContent');
  cc.innerHTML = '';
  EXPERIMENTS[key].controls.forEach(function(c) {
    params[c.id] = c.val;
    var dec = c.step < 1 ? (String(c.step).split('.')[1] || '').length : 0;
    var div = document.createElement('div');
    div.className = 'ctrl-item';
    div.innerHTML =
      '<div class="ctrl-row">' +
        '<span class="ctrl-name">' + c.label + '</span>' +
        '<span class="ctrl-val" id="val_' + c.id + '">' + c.val.toFixed(dec) + c.unit + '</span>' +
      '</div>' +
      '<input type="range" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + c.val + '" ' +
        'oninput="onSlider(\'' + c.id + '\',\'' + c.unit + '\',' + dec + ',parseFloat(this.value))">';
    cc.appendChild(div);
  });
}

function onSlider(id, unit, dec, val) {
  params[id] = val;
  document.getElementById('val_' + id).textContent = val.toFixed(dec) + unit;
  resetStates(currentExp, params);
  if (!running) { draw(); updateReadings(); }
}

function toggleRun() {
  if (running) { pauseSim(); } else { startSim(); }
}

function startSim() {
  running = true; lastTs = 0; simTime = 0;
  resetStates(currentExp, params);
  closeAllDrawers();
  document.getElementById('runBtn').textContent = '\u23F8 PAUSE';
  document.getElementById('runBtn').classList.add('running');
  animId = requestAnimationFrame(loop);
}

function pauseSim() {
  running = false; cancelAnimationFrame(animId);
  document.getElementById('runBtn').textContent = '\u25B6 RUN';
  document.getElementById('runBtn').classList.remove('running');
}

function hardStop() {
  running = false; cancelAnimationFrame(animId);
}

function resetSim() {
  hardStop(); simTime = 0; lastTs = 0;
  resetStates(currentExp, params);
  closeAllDrawers();
  document.getElementById('runBtn').textContent = '\u25B6 RUN';
  document.getElementById('runBtn').classList.remove('running');
  document.getElementById('simTime').textContent = '';
  draw(); updateReadings();
}

function loop(ts) {
  if (!running) return;
  if (lastTs === 0) lastTs = ts;
  var dt = Math.min((ts - lastTs) / 1000, 0.04);
  lastTs = ts;
  simTime += dt;
  physicsUpdate(currentExp, dt, params);
  draw(); updateReadings();
  document.getElementById('simTime').textContent = simTime.toFixed(1) + 's';

  var dur = EXPERIMENTS[currentExp].duration;
  if (dur > 0 && simTime >= dur) {
    hardStop();
    document.getElementById('runBtn').textContent = '\u25B6 RUN AGAIN';
    document.getElementById('runBtn').classList.remove('running');
    draw(); updateReadings();
    setTimeout(function() { openDrawerWith(currentExp); }, 200);
    return;
  }
  animId = requestAnimationFrame(loop);
}

// ── Canvas draw ──────────────────────────────────────
function draw() {
  var canvas = document.getElementById('simCanvas');
  var wrap   = document.getElementById('canvasWrap');
  // Use actual rendered size minus padding (12px each side)
  var W = wrap.clientWidth  - 24;
  var H = wrap.clientHeight - 24;
  if (W < 20 || H < 20) return;
  canvas.width  = W;
  canvas.height = H;
  drawExperiment(canvas, currentExp, params, simTime);
}

function updateReadings() {
  var rows = getReadings(currentExp, params);
  var div  = document.getElementById('readings');
  div.innerHTML = rows.map(function(r) {
    return '<div class="reading-row"><span class="rk">' + r[0] + '</span><span class="rv">' + r[1] + '</span></div>';
  }).join('');
}

// ── Drawer management ────────────────────────────────
function openDrawerWith(key) {
  // Populate explanation cards
  var exp = EXPERIMENTS[key].explanation;
  document.getElementById('explainTitle').textContent = exp.title;
  document.getElementById('explainCards').innerHTML = exp.cards.map(function(c) {
    return '<div class="explain-card">' +
      '<div class="card-label">' + c.label + '</div>' +
      '<div class="card-text">'  + c.text  + '</div>' +
      '<div class="card-formula">' + c.formula + '</div>' +
    '</div>';
  }).join('');

  // Reset AI output panels
  document.getElementById('aiReportPanel').style.display = 'none';
  document.getElementById('quizPanel').style.display     = 'none';
  document.getElementById('aiReportContent').innerHTML   = '';
  document.getElementById('quizContent').innerHTML       = '';
  document.getElementById('reportBtn').disabled = false;
  document.getElementById('reportBtn').textContent = '\u{1F4CB} AI Report';
  document.getElementById('quizBtn').disabled   = false;
  document.getElementById('quizBtn').textContent = '\u2753 AI Quiz';

  // Open drawer
  var drawer = document.getElementById('bottomDrawer');
  drawer.classList.add('open');
}

function closeAllDrawers() {
  document.getElementById('bottomDrawer').classList.remove('open');
}

// ── AI Side Panel ────────────────────────────────────
function toggleAiPanel() {
  var panel = document.getElementById('aiSidePanel');
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    switchAiTab('assistant');
  }
}

function switchAiTab(tab) {
  document.querySelectorAll('.ai-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.ai-tab-pane').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('pane-' + tab).classList.add('active');
  if (tab === 'assistant') initAssistant();
}

window.addEventListener('resize', function() { if (!running) draw(); });
window.addEventListener('DOMContentLoaded', init);
