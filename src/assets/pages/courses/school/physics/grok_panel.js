// grok_panel.js — inline report/quiz (inside bottom drawer) + side-panel report/quiz

// ── Inline: AI Report (below explanation cards) ──────────────────────────
async function runInlineReport() {
  var btn   = document.getElementById('reportBtn');
  var panel = document.getElementById('aiReportPanel');
  var box   = document.getElementById('aiReportContent');
  btn.disabled = true; btn.textContent = 'Generating...';
  box.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
  panel.style.display = 'block';
  await doReport(box);
  btn.disabled = false; btn.textContent = '\u{1F4CB} AI Report';
}

// ── Inline: AI Quiz (below explanation cards) ────────────────────────────
async function runInlineQuiz() {
  var btn   = document.getElementById('quizBtn');
  var panel = document.getElementById('quizPanel');
  var box   = document.getElementById('quizContent');
  btn.disabled = true; btn.textContent = 'Generating...';
  box.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
  panel.style.display = 'block';
  await doQuiz(box, 'inline');
  btn.disabled = false; btn.textContent = '\u2753 AI Quiz';
}

// ── Side-panel: Report ───────────────────────────────────────────────────
async function runPanelReport() {
  var btn = document.getElementById('panelReportBtn');
  var box = document.getElementById('panelReportContent');
  btn.disabled = true; btn.textContent = 'Generating...';
  box.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
  await doReport(box);
  btn.disabled = false; btn.textContent = '\u{1F4CB} Generate Report';
}

// ── Side-panel: Quiz ─────────────────────────────────────────────────────
async function runPanelQuiz() {
  var btn = document.getElementById('panelQuizBtn');
  var box = document.getElementById('panelQuizContent');
  btn.disabled = true; btn.textContent = 'Generating...';
  box.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
  await doQuiz(box, 'panel');
  btn.disabled = false; btn.textContent = '\u2753 Generate Quiz';
}

// ── Shared: generate report text via Groq ────────────────────────────────
async function doReport(box) {
  var exp      = EXPERIMENTS[currentExp];
  var rows     = getReadings(currentExp, params);
  var readings = rows.map(function(r){ return r[0] + ': ' + r[1]; }).join('\n');
  var prompt =
    'A student just ran a virtual physics simulation. Write a clear experiment report.\n\n' +
    'Lab state:\n' + buildContext() + '\n\n' +
    'Actual readings:\n' + readings + '\n\n' +
    'Use this format:\n' +
    '**OBJECTIVE**\nOne sentence.\n\n' +
    '**OBSERVATIONS**\n2-3 specific points using the actual numbers.\n\n' +
    '**WHAT HAPPENED & WHY**\n3-4 sentences explaining the physics with these values.\n\n' +
    '**FORMULA VERIFIED**\nPlug in the real numbers: ' + exp.formula + '\n\n' +
    '**REAL WORLD CONNECTION**\n1-2 sentences.\n\nUnder 280 words. Be specific to these numbers.';

  var full = '';
  try {
    await groqCall([{ role: 'user', content: prompt }], function(token) {
      full += token;
      box.innerHTML = markdownToHtml(full) + '<span class="cursor-blink">|</span>';
      box.scrollTop = box.scrollHeight;
    });
    box.innerHTML = markdownToHtml(full);
  } catch(e) {
    box.textContent = 'Error: ' + e.message;
  }
}

// ── Shared: generate quiz via Groq ───────────────────────────────────────
var _quizStore = {};

async function doQuiz(box, prefix) {
  var prompt =
    'Generate exactly 3 multiple choice quiz questions based on this physics simulation.\n\n' +
    'Lab state:\n' + buildContext() + '\n\n' +
    'IMPORTANT: Return ONLY valid JSON — no extra text, no markdown code blocks:\n' +
    '{"questions":[{"q":"...?","options":["A) ...","B) ...","C) ...","D) ..."],"answer":"A","explanation":"..."}]}';

  try {
    var raw   = await groqCall([{ role: 'user', content: prompt }]);
    var match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse quiz JSON. Try again.');
    var data  = JSON.parse(match[0]);
    _quizStore[prefix] = { data: data, answers: {} };
    renderQuizBlock(box, data, prefix);
  } catch(e) {
    box.textContent = 'Error: ' + e.message;
  }
}

function renderQuizBlock(box, data, prefix) {
  box.innerHTML = data.questions.map(function(q, qi) {
    return (
      '<div class="quiz-q" id="' + prefix + '_q' + qi + '">' +
        '<div class="quiz-qtext">' + (qi + 1) + '. ' + q.q + '</div>' +
        '<div class="quiz-options">' +
          q.options.map(function(opt) {
            var letter = opt[0];
            return '<button class="quiz-opt" onclick="pickAnswer(\'' + prefix + '\',' + qi + ',\'' + letter + '\')">' + opt + '</button>';
          }).join('') +
        '</div>' +
        '<div class="quiz-feedback" id="' + prefix + '_fb' + qi + '"></div>' +
      '</div>'
    );
  }).join('') +
  '<button class="quiz-submit-btn" id="' + prefix + '_sub" onclick="checkQuiz(\'' + prefix + '\')">&#x2713; Submit Answers</button>';
}

function pickAnswer(prefix, qi, letter) {
  if (!_quizStore[prefix]) return;
  _quizStore[prefix].answers[qi] = letter;
  var qDiv = document.getElementById(prefix + '_q' + qi);
  if (!qDiv) return;
  qDiv.querySelectorAll('.quiz-opt').forEach(function(btn) {
    btn.classList.remove('selected');
    if (btn.textContent.trim()[0] === letter) btn.classList.add('selected');
  });
}

function checkQuiz(prefix) {
  var store = _quizStore[prefix];
  if (!store) return;
  var score = 0;
  store.data.questions.forEach(function(q, qi) {
    var fb     = document.getElementById(prefix + '_fb' + qi);
    var chosen = store.answers[qi];
    var qDiv   = document.getElementById(prefix + '_q' + qi);
    qDiv.querySelectorAll('.quiz-opt').forEach(function(btn) {
      var letter = btn.textContent.trim()[0];
      btn.disabled = true;
      if (letter === q.answer) btn.classList.add('correct');
      else if (letter === chosen && chosen !== q.answer) btn.classList.add('wrong');
    });
    if (chosen === q.answer) {
      score++; fb.className = 'quiz-feedback correct';
      fb.textContent = '\u2713 Correct! ' + q.explanation;
    } else {
      fb.className = 'quiz-feedback wrong';
      fb.textContent = (chosen ? '\u2717 Incorrect.' : '\u2715 Not answered.') + ' ' + q.explanation;
    }
  });
  var sub = document.getElementById(prefix + '_sub');
  if (sub) {
    var sc = document.createElement('div');
    sc.className = 'quiz-score';
    var n = store.data.questions.length;
    var emoji = score === n ? '\u{1F3C6} Perfect!' : score > 0 ? '\u{1F44D} Good effort!' : '\u{1F4DA} Keep studying!';
    sc.innerHTML = 'Score: <strong>' + score + ' / ' + n + '</strong>  ' + emoji;
    sub.replaceWith(sc);
  }
}
