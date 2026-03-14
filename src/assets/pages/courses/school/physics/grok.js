// grok.js — AI features powered by Groq API
// Features: 1) Lab Assistant  2) Auto Report  3) Quiz Generator

const GROQ_API_KEY = 'your api key';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ─── Core API call ────────────────────────────────────────────────────────
async function groqCall(messages, onChunk) {
  const stream = typeof onChunk === 'function';
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + GROQ_API_KEY,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 900,
      stream: stream,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('Groq API error: ' + err);
  }

  if (!stream) {
    const data = await res.json();
    return data.choices[0].message.content.trim();
  }

  // Streaming mode — call onChunk with each token
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') return;
      try {
        const json = JSON.parse(payload);
        const delta = json.choices[0].delta.content;
        if (delta) onChunk(delta);
      } catch (_) { }
    }
  }
}

// ─── Build context string from current lab state ──────────────────────────
function buildContext() {
  const exp = EXPERIMENTS[currentExp];
  const rows = getReadings(currentExp, params);
  const readingStr = rows.map(function (r) { return r[0] + ' = ' + r[1]; }).join(', ');
  const paramStr = exp.controls.map(function (c) {
    return c.label + ' = ' + (params[c.id] || c.val) + c.unit;
  }).join(', ');
  return (
    'Experiment: ' + exp.title + '\n' +
    'Formula: ' + exp.formula + '\n' +
    'Current parameters: ' + paramStr + '\n' +
    'Current readings: ' + readingStr + '\n' +
    'Simulation time elapsed: ' + simTime.toFixed(1) + 's'
  );
}

// ══════════════════════════════════════════════════════════════════════════
// FEATURE 1 — LAB ASSISTANT (Chat)
// ══════════════════════════════════════════════════════════════════════════

let chatHistory = [];

function initAssistant() {
  chatHistory = [];
  var exp = typeof currentExp !== 'undefined' && EXPERIMENTS[currentExp] ? EXPERIMENTS[currentExp].title : 'the lab';
  document.getElementById('chatMessages').innerHTML =
    '<div class="ai-msg ai-system">' +
    '<span class="ai-avatar">&#x2697;</span>' +
    '<div class="ai-bubble">' +
    '<strong style="color:var(--accent);font-family:\'Fraunces\',serif;">CurioLab AI</strong><br>' +
    'Hey curious mind! \uD83D\uDCA1 I\'m your personal science guide here at CurioLab. ' +
    'I can see you\'re exploring <em>' + exp + '</em> right now \u2014 ' +
    'ask me why something happened, what a formula means, or just say <em>"explain this to me like I\'m 12"</em>. I\'ve got you!' +
    '</div>' +
    '</div>';
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  input.disabled = true;
  document.getElementById('chatSendBtn').disabled = true;

  // Show user message
  appendChatMsg('user', text);

  // System prompt with live context
  const systemPrompt =
    'You are CurioLab AI, a friendly and enthusiastic science guide built into CurioLab — a virtual physics laboratory for students. ' +
    'Your personality: warm, encouraging, clear, and a little playful. You make physics feel exciting, not scary. ' +
    'Keep answers concise (2–4 sentences per point). Use simple language first, then introduce formulas if needed. ' +
    'Always relate concepts to real life when possible. Never just dump equations — explain the intuition first. ' +
    'Here is the current lab state:\n\n' + buildContext();

  chatHistory.push({ role: 'user', content: text });

  // Streaming response
  const msgDiv = appendChatMsg('assistant', '');
  const bubble = msgDiv.querySelector('.ai-bubble');
  bubble.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';

  let fullText = '';
  try {
    const msgs = [{ role: 'system', content: systemPrompt }].concat(chatHistory);
    await groqCall(msgs, function (token) {
      fullText += token;
      bubble.textContent = fullText;
      // Auto-scroll
      const box = document.getElementById('chatMessages');
      box.scrollTop = box.scrollHeight;
    });
    chatHistory.push({ role: 'assistant', content: fullText });
  } catch (e) {
    bubble.textContent = 'Error: ' + e.message;
  }

  input.disabled = false;
  document.getElementById('chatSendBtn').disabled = false;
  input.focus();
}

function appendChatMsg(role, text) {
  const box = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'ai-msg ai-' + role;
  div.innerHTML =
    '<span class="ai-avatar">' + (role === 'user' ? '&#x1F9D1;&#x200D;&#x1F393;' : '&#x2697;') + '</span>' +
    '<div class="ai-bubble">' + (text || '') + '</div>';
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

// Allow Enter key to send
function chatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChat();
  }
}

// ══════════════════════════════════════════════════════════════════════════
// FEATURE 2 — AUTO REPORT (after simulation)
// ══════════════════════════════════════════════════════════════════════════

async function generateReport() {
  const btn = document.getElementById('reportBtn');
  btn.disabled = true;
  btn.textContent = 'Generating...';

  const reportBox = document.getElementById('aiReportContent');
  reportBox.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
  document.getElementById('aiReportPanel').style.display = 'block';
  setTimeout(function () { document.getElementById('aiReportPanel').classList.add('open'); }, 20);

  const exp = EXPERIMENTS[currentExp];
  const rows = getReadings(currentExp, params);
  const readingStr = rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');

  const prompt =
    'A student just completed a physics simulation. Generate a detailed experiment report in this exact format:\n\n' +
    '**OBJECTIVE**\nOne sentence stating what was investigated.\n\n' +
    '**OBSERVATIONS**\nBased on these actual readings:\n' + readingStr + '\nWrite 2-3 specific observations about the numbers.\n\n' +
    '**WHAT HAPPENED & WHY**\nExplain the physics in 3-4 sentences using the actual values observed.\n\n' +
    '**KEY FORMULA VERIFIED**\nShow how the formula ' + exp.formula + ' matches the observed data with numbers.\n\n' +
    '**REAL WORLD CONNECTION**\nOne interesting real-world application of this experiment.\n\n' +
    'Lab context:\n' + buildContext() + '\n\nBe specific to the actual numbers, not generic. Keep total response under 300 words.';

  let fullText = '';
  try {
    await groqCall(
      [{ role: 'user', content: prompt }],
      function (token) {
        fullText += token;
        reportBox.innerHTML = markdownToHtml(fullText) + '<span class="cursor-blink">|</span>';
        document.getElementById('aiReportPanel').scrollTop = document.getElementById('aiReportPanel').scrollHeight;
      }
    );
    reportBox.innerHTML = markdownToHtml(fullText);
  } catch (e) {
    reportBox.textContent = 'Error generating report: ' + e.message;
  }

  btn.disabled = false;
  btn.textContent = '&#x1F4CB; Generate AI Report';
}

// Simple markdown → HTML for bold and line breaks
function markdownToHtml(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

// ══════════════════════════════════════════════════════════════════════════
// FEATURE 3 — QUIZ GENERATOR
// ══════════════════════════════════════════════════════════════════════════

let quizData = null;
let quizAnswers = {};

async function generateQuiz() {
  const btn = document.getElementById('quizBtn');
  btn.disabled = true;
  btn.textContent = 'Generating Quiz...';

  const quizBox = document.getElementById('quizContent');
  quizBox.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
  document.getElementById('quizPanel').style.display = 'block';
  setTimeout(function () { document.getElementById('quizPanel').classList.add('open'); }, 20);

  const prompt =
    'Generate exactly 3 multiple choice quiz questions about this physics experiment. ' +
    'Base the questions on the actual experiment data the student just observed.\n\n' +
    'Lab context:\n' + buildContext() + '\n\n' +
    'Return ONLY valid JSON in this exact format, no other text:\n' +
    '{\n' +
    '  "questions": [\n' +
    '    {\n' +
    '      "q": "Question text here?",\n' +
    '      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],\n' +
    '      "answer": "A",\n' +
    '      "explanation": "Brief explanation why this is correct."\n' +
    '    }\n' +
    '  ]\n' +
    '}';

  try {
    const raw = await groqCall([{ role: 'user', content: prompt }]);
    // Extract JSON safely
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response');
    quizData = JSON.parse(jsonMatch[0]);
    quizAnswers = {};
    renderQuiz();
  } catch (e) {
    quizBox.textContent = 'Error generating quiz: ' + e.message;
  }

  btn.disabled = false;
  btn.textContent = '&#x2753; Take AI Quiz';
}

function renderQuiz() {
  if (!quizData) return;
  const box = document.getElementById('quizContent');
  box.innerHTML = quizData.questions.map(function (q, qi) {
    return (
      '<div class="quiz-q" id="quiz-q-' + qi + '">' +
      '<div class="quiz-qtext">' + (qi + 1) + '. ' + q.q + '</div>' +
      '<div class="quiz-options">' +
      q.options.map(function (opt) {
        const letter = opt[0];
        return (
          '<button class="quiz-opt" onclick="selectAnswer(' + qi + ',\'' + letter + '\')">' +
          opt +
          '</button>'
        );
      }).join('') +
      '</div>' +
      '<div class="quiz-feedback" id="quiz-fb-' + qi + '"></div>' +
      '</div>'
    );
  }).join('') +
    '<button class="quiz-submit-btn" onclick="submitQuiz()">&#x2713; Submit Answers</button>';
}

function selectAnswer(qi, letter) {
  quizAnswers[qi] = letter;
  // Highlight selected
  const qDiv = document.getElementById('quiz-q-' + qi);
  qDiv.querySelectorAll('.quiz-opt').forEach(function (btn) {
    btn.classList.remove('selected');
    if (btn.textContent.trim()[0] === letter) btn.classList.add('selected');
  });
}

function submitQuiz() {
  if (!quizData) return;
  let score = 0;
  quizData.questions.forEach(function (q, qi) {
    const fb = document.getElementById('quiz-fb-' + qi);
    const chosen = quizAnswers[qi];
    const qDiv = document.getElementById('quiz-q-' + qi);

    qDiv.querySelectorAll('.quiz-opt').forEach(function (btn) {
      const letter = btn.textContent.trim()[0];
      if (letter === q.answer) btn.classList.add('correct');
      else if (letter === chosen && chosen !== q.answer) btn.classList.add('wrong');
      btn.disabled = true;
    });

    if (chosen === q.answer) {
      score++;
      fb.className = 'quiz-feedback correct';
      fb.textContent = '✓ Correct! ' + q.explanation;
    } else if (chosen) {
      fb.className = 'quiz-feedback wrong';
      fb.textContent = '✗ Incorrect. ' + q.explanation;
    } else {
      fb.className = 'quiz-feedback wrong';
      fb.textContent = 'Not answered. ' + q.explanation;
    }
  });

  // Score summary
  const summary = document.createElement('div');
  summary.className = 'quiz-score';
  summary.innerHTML =
    'Score: <strong>' + score + ' / ' + quizData.questions.length + '</strong> &nbsp;' +
    (score === quizData.questions.length ? '&#x1F3C6; Perfect!' : score > 0 ? '&#x1F44D; Good effort!' : '&#x1F4DA; Keep studying!');
  document.getElementById('quizContent').appendChild(summary);
  document.querySelector('.quiz-submit-btn').remove();
}

// ─── Tab switching ────────────────────────────────────────────────────────
function switchAiTab(tab) {
  document.querySelectorAll('.ai-tab').forEach(function (t) { t.classList.remove('active'); });
  document.querySelectorAll('.ai-tab-pane').forEach(function (p) { p.classList.remove('active'); });
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('pane-' + tab).classList.add('active');
  if (tab === 'assistant') initAssistant();
}

// ─── Toggle AI Panel ──────────────────────────────────────────────────────
function toggleAiPanel() {
  const panel = document.getElementById('aiSidePanel');
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    initAssistant();
  }
}