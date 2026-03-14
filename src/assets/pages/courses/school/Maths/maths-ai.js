// maths-ai.js — CurioLab AI for Maths Studio
// Powered by Groq API — Chat, Explain, Quiz for all 5 maths experiments

const apiKey  = process.env.GROQ_API_KEY;
const GROQ_MODEL_M = 'llama-3.3-70b-versatile';
const GROQ_URL_M = 'https://api.groq.com/openai/v1/chat/completions';

// ─── Core API call (streaming + non-streaming) ────────────────────────────
async function groqCallMaths(messages, onChunk) {
    var stream = typeof onChunk === 'function';
    var res = await fetch(GROQ_URL_M, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey ,
        },
        body: JSON.stringify({
            model: GROQ_MODEL_M,
            messages: messages,
            temperature: 0.7,
            max_tokens: 900,
            stream: stream,
        }),
    });
    if (!res.ok) { var e = await res.text(); throw new Error('Groq error: ' + e); }
    if (!stream) {
        var data = await res.json();
        return data.choices[0].message.content.trim();
    }
    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';
    while (true) {
        var _ref = await reader.read(), done = _ref.done, value = _ref.value;
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop();
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (!line.startsWith('data: ')) continue;
            var payload = line.slice(6).trim();
            if (payload === '[DONE]') return;
            try {
                var json = JSON.parse(payload);
                var delta = json.choices[0].delta.content;
                if (delta) onChunk(delta);
            } catch (_) { }
        }
    }
}

// ─── markdown → HTML ──────────────────────────────────────────────────────
function mdToHtml(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}

// ─── Build context for each experiment ────────────────────────────────────
function getMathsContext(expId) {
    switch (expId) {
        case 'grapher': {
            var fn = document.getElementById('graphFunc').value;
            var xp = document.getElementById('graphX').value;
            var zm = document.getElementById('graphZoom').value;
            var fx = document.getElementById('graphFx').textContent;
            var dfx = document.getElementById('graphDx').textContent;
            var ang = document.getElementById('graphAngle').textContent;
            return 'Experiment: Function Grapher\n' +
                'Function: ' + fn + '\n' +
                'X Position: ' + xp + '\n' +
                'Zoom: ' + zm + 'x\n' +
                'f(x) = ' + fx + '\n' +
                "f'(x) = " + dfx + '\n' +
                'Slope angle: ' + ang;
        }
        case 'circle': {
            var deg = document.getElementById('circleAngle').value;
            var mode = document.getElementById('circleMode').value;
            var s = document.getElementById('circleSin').textContent;
            var c = document.getElementById('circleCos').textContent;
            var t = document.getElementById('circleTan').textContent;
            var r = document.getElementById('circleRad').textContent;
            return 'Experiment: Unit Circle & Trigonometry\n' +
                'Angle: ' + deg + ' degrees\n' +
                'Highlighted: ' + mode + '\n' +
                'sin θ = ' + s + '\n' +
                'cos θ = ' + c + '\n' +
                'tan θ = ' + t + '\n' +
                'Radians: ' + r;
        }
        case 'riemann': {
            var fn2 = document.getElementById('riemannFunc').value;
            var n = document.getElementById('riemannN').value;
            var typ = document.getElementById('riemannType').value;
            var a = document.getElementById('riemannA').value;
            var b = document.getElementById('riemannB').value;
            var app = document.getElementById('riemannApprox').textContent;
            var ex = document.getElementById('riemannExact').textContent;
            var err = document.getElementById('riemannError').textContent;
            return 'Experiment: Riemann Sums & Integration\n' +
                'Function: ' + fn2 + '\n' +
                'Rectangles n: ' + n + '\n' +
                'Method: ' + typ + '\n' +
                'Interval: [' + a + ', ' + b + ']\n' +
                'Approximate area: ' + app + '\n' +
                'Exact area: ' + ex + '\n' +
                'Error: ' + err;
        }
        case 'geo': {
            var shape = document.getElementById('geoShape').value;
            var rot = document.getElementById('geoRotateVal').textContent;
            var sc = document.getElementById('geoScaleVal').textContent;
            var tx = document.getElementById('geoTxVal').textContent;
            var ty = document.getElementById('geoTyVal').textContent;
            var area = document.getElementById('geoArea').textContent;
            var peri = document.getElementById('geoPerim').textContent;
            return 'Experiment: Geometry Transformations\n' +
                'Shape: ' + shape + '\n' +
                'Rotation: ' + rot + '\n' +
                'Scale: ' + sc + '\n' +
                'Translate X: ' + tx + ', Y: ' + ty + '\n' +
                'Area: ' + area + '\n' +
                'Perimeter: ' + peri;
        }
        case 'normal': {
            var mu = document.getElementById('normMean').value;
            var sig = document.getElementById('normSd').value;
            var reg = document.getElementById('normRegion').value;
            var typ2 = document.getElementById('normType').value;
            var pk = document.getElementById('normPeak').textContent;
            return 'Experiment: Normal Distribution & Probability\n' +
                'Mean μ: ' + mu + '\n' +
                'Std Dev σ: ' + sig + '\n' +
                'Shaded region: ' + reg + '\n' +
                'Distribution type: ' + typ2 + '\n' +
                'Peak f(μ): ' + pk;
        }
        default: return 'Maths Studio — no experiment selected';
    }
}

// ══════════════════════════════════════════════════════════════════════════
// AI SIDE PANEL
// ══════════════════════════════════════════════════════════════════════════

var mathsChatHistory = [];
var activeMathsExp = 'grapher';
var activeQuizExp = 'grapher';

function toggleMathsAI() {
    var panel = document.getElementById('mathsAiPanel');
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
        switchMathsTab('chat');
    }
}

function switchMathsTab(tab) {
    document.querySelectorAll('.ai-tab').forEach(function (t) { t.classList.remove('active'); });
    document.querySelectorAll('.ai-tab-pane').forEach(function (p) { p.classList.remove('active'); });
    document.getElementById('mtab-' + tab).classList.add('active');
    document.getElementById('mpane-' + tab).classList.add('active');
    if (tab === 'chat') initMathsChat();
}

// ─── Open AI panel directly from experiment's "Ask AI" button ─────────────
function openMathsAI(expId) {
    activeMathsExp = expId;
    activeQuizExp = expId;

    // sync selectors
    document.querySelectorAll('.ai-exp-select-btn[id^="sel-"]').forEach(function (b) { b.classList.remove('active'); });
    document.querySelectorAll('.ai-exp-select-btn[id^="qsel-"]').forEach(function (b) { b.classList.remove('active'); });
    var selBtn = document.getElementById('sel-' + expId);
    var qselBtn = document.getElementById('qsel-' + expId);
    if (selBtn) selBtn.classList.add('active');
    if (qselBtn) qselBtn.classList.add('active');

    toggleMathsAI();
}

function selectMathsExp(expId, btn) {
    activeMathsExp = expId;
    document.querySelectorAll('.ai-exp-select-btn[id^="sel-"]').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
}

function selectMathsQuizExp(expId, btn) {
    activeQuizExp = expId;
    document.querySelectorAll('.ai-exp-select-btn[id^="qsel-"]').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
}

// ══════════════════════════════════════════════════════════════════════════
// FEATURE 1 — CHAT
// ══════════════════════════════════════════════════════════════════════════

function initMathsChat() {
    mathsChatHistory = [];
    var expNames = {
        grapher: 'Function Grapher & Derivatives',
        circle: 'Unit Circle & Trigonometry',
        riemann: 'Riemann Sums & Integration',
        geo: 'Geometry Transformations',
        normal: 'Normal Distribution'
    };
    var name = expNames[activeMathsExp] || 'the Maths Studio';
    document.getElementById('mathsChatMessages').innerHTML =
        '<div class="ai-msg ai-system">' +
        '<span class="ai-avatar">&#x2697;</span>' +
        '<div class="ai-bubble">' +
        '<strong style="color:var(--accent);font-family:\'Fraunces\',serif;">CurioLab AI</strong><br>' +
        'Hey! \uD83D\uDCA1 I can see you\'re exploring <em>' + name + '</em>. ' +
        'Ask me anything \u2014 why a formula works, what happens when you change a value, or <em>"explain this like I\'m 12"</em>. Let\'s figure it out together!' +
        '</div>' +
        '</div>';
}

async function sendMathsChat() {
    var input = document.getElementById('mathsChatInput');
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.disabled = true;
    document.getElementById('mathsChatSendBtn').disabled = true;

    appendMathsMsg('user', text);

    var systemPrompt =
        'You are CurioLab AI, a friendly and enthusiastic maths guide built into CurioLab \u2014 a virtual maths studio for students. ' +
        'Your personality: warm, clear, encouraging, and a little playful. Make maths feel intuitive, not scary. ' +
        'Explain concepts in plain English first, then show the formula. Use real-world analogies. ' +
        'Keep answers concise (2\u20134 sentences per point). ' +
        'Current experiment state:\n\n' + getMathsContext(activeMathsExp);

    mathsChatHistory.push({ role: 'user', content: text });

    var msgDiv = appendMathsMsg('assistant', '');
    var bubble = msgDiv.querySelector('.ai-bubble');
    bubble.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';

    var fullText = '';
    try {
        var msgs = [{ role: 'system', content: systemPrompt }].concat(mathsChatHistory);
        await groqCallMaths(msgs, function (token) {
            fullText += token;
            bubble.textContent = fullText;
            var box = document.getElementById('mathsChatMessages');
            box.scrollTop = box.scrollHeight;
        });
        mathsChatHistory.push({ role: 'assistant', content: fullText });
    } catch (e) {
        bubble.textContent = 'Error: ' + e.message;
    }

    input.disabled = false;
    document.getElementById('mathsChatSendBtn').disabled = false;
    input.focus();
}

function appendMathsMsg(role, text) {
    var box = document.getElementById('mathsChatMessages');
    var div = document.createElement('div');
    div.className = 'ai-msg ai-' + role;
    div.innerHTML =
        '<span class="ai-avatar">' + (role === 'user' ? '&#x1F9D1;&#x200D;&#x1F393;' : '&#x2697;') + '</span>' +
        '<div class="ai-bubble">' + (text || '') + '</div>';
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    return div;
}

function mathsChatKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMathsChat(); }
}

// ══════════════════════════════════════════════════════════════════════════
// FEATURE 2 — EXPLAIN (per-experiment inline + side panel)
// ══════════════════════════════════════════════════════════════════════════

var expTitles = {
    grapher: 'Function Grapher & Derivatives',
    circle: 'Unit Circle & Trigonometry',
    riemann: 'Riemann Sums & Integration',
    geo: 'Geometry Transformations',
    normal: 'Normal Distribution & Probability'
};

async function runMathsExplain() {
    var btn = document.getElementById('mathsExplainBtn');
    var box = document.getElementById('mathsExplainContent');
    btn.disabled = true; btn.textContent = 'Generating...';
    box.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';

    var ctx = getMathsContext(activeMathsExp);
    var prompt =
        'A student is using CurioLab to explore ' + expTitles[activeMathsExp] + '.\n\n' +
        'Current state:\n' + ctx + '\n\n' +
        'Write a clear, engaging explanation using this format:\n' +
        '**WHAT IS HAPPENING**\nExplain in 2-3 plain sentences what the current state shows.\n\n' +
        '**THE KEY CONCEPT**\nExplain the underlying maths concept intuitively (no jargon dump). Use an analogy.\n\n' +
        '**THE FORMULA**\nShow the relevant formula and explain what each symbol means.\n\n' +
        '**TRY THIS**\nSuggest one slider change or experiment the student can do right now to see something interesting.\n\n' +
        'Under 250 words. Be specific to the current values shown above, not generic.';

    var full = '';
    try {
        await groqCallMaths([{ role: 'user', content: prompt }], function (token) {
            full += token;
            box.innerHTML = mdToHtml(full) + '<span class="cursor-blink">|</span>';
            box.scrollTop = box.scrollHeight;
        });
        box.innerHTML = mdToHtml(full);
    } catch (e) {
        box.textContent = 'Error: ' + e.message;
    }
    btn.disabled = false; btn.textContent = '\u{1F4D6} Explain This';
}

// Inline "Ask AI" button below each experiment
async function openMathsAIInline(expId) {
    var outputDiv = document.getElementById('ai-' + expId);
    var innerDiv = document.getElementById('ai-' + expId + '-inner');
    outputDiv.classList.add('open');
    innerDiv.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';

    var ctx = getMathsContext(expId);
    var prompt =
        'A student is exploring ' + expTitles[expId] + ' in CurioLab.\n\n' +
        'Current values:\n' + ctx + '\n\n' +
        'Give a short, friendly explanation (3-5 sentences) of exactly what is happening right now with these specific values. ' +
        'Then give one "did you know?" fact related to this concept. Keep it under 120 words. Be specific.';

    var full = '';
    try {
        await groqCallMaths([{ role: 'user', content: prompt }], function (token) {
            full += token;
            innerDiv.innerHTML = mdToHtml(full) + '<span class="cursor-blink">|</span>';
        });
        innerDiv.innerHTML = mdToHtml(full);
    } catch (e) {
        innerDiv.textContent = 'Error: ' + e.message;
    }
}

// Wire "Ask AI about this" buttons on each experiment card
document.querySelectorAll('.ai-exp-btn').forEach(function (btn) {
    // The onclick is already set inline in HTML — this is backup
});

// Override openMathsAI to also fill inline output
var _origOpenMathsAI = openMathsAI;
openMathsAI = function (expId) {
    // Fill inline AI output zone too
    openMathsAIInline(expId);
    // Then open side panel
    activeMathsExp = expId;
    activeQuizExp = expId;
    document.querySelectorAll('.ai-exp-select-btn[id^="sel-"]').forEach(function (b) { b.classList.remove('active'); });
    document.querySelectorAll('.ai-exp-select-btn[id^="qsel-"]').forEach(function (b) { b.classList.remove('active'); });
    var selBtn = document.getElementById('sel-' + expId);
    var qselBtn = document.getElementById('qsel-' + expId);
    if (selBtn) selBtn.classList.add('active');
    if (qselBtn) qselBtn.classList.add('active');
    var panel = document.getElementById('mathsAiPanel');
    if (!panel.classList.contains('open')) { toggleMathsAI(); }
};

// ══════════════════════════════════════════════════════════════════════════
// FEATURE 3 — QUIZ
// ══════════════════════════════════════════════════════════════════════════

var _mathsQuizStore = {};

async function runMathsQuiz() {
    var btn = document.getElementById('mathsQuizBtn');
    var box = document.getElementById('mathsQuizContent');
    btn.disabled = true; btn.textContent = 'Generating...';
    box.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';

    var ctx = getMathsContext(activeQuizExp);
    var prompt =
        'Generate exactly 3 multiple choice quiz questions about ' + expTitles[activeQuizExp] + '.\n\n' +
        'Base questions on these current values:\n' + ctx + '\n\n' +
        'Mix concept questions and calculation questions. Make them specific to the numbers shown.\n' +
        'Return ONLY valid JSON, no other text:\n' +
        '{"questions":[{"q":"...?","options":["A) ...","B) ...","C) ...","D) ..."],"answer":"A","explanation":"..."}]}';

    try {
        var raw = await groqCallMaths([{ role: 'user', content: prompt }]);
        var match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('Could not parse quiz. Please try again.');
        var data = JSON.parse(match[0]);
        _mathsQuizStore['panel'] = { data: data, answers: {} };
        renderMathsQuiz(box, data, 'panel');
    } catch (e) {
        box.textContent = 'Error: ' + e.message;
    }
    btn.disabled = false; btn.textContent = '\u2753 Generate Quiz';
}

function renderMathsQuiz(box, data, prefix) {
    box.innerHTML = data.questions.map(function (q, qi) {
        return (
            '<div class="quiz-q" id="mq_' + prefix + '_q' + qi + '">' +
            '<div class="quiz-qtext">' + (qi + 1) + '. ' + q.q + '</div>' +
            '<div class="quiz-options">' +
            q.options.map(function (opt) {
                var letter = opt[0];
                return '<button class="quiz-opt" onclick="pickMathsAnswer(\'' + prefix + '\',' + qi + ',\'' + letter + '\')">' + opt + '</button>';
            }).join('') +
            '</div>' +
            '<div class="quiz-feedback" id="mq_' + prefix + '_fb' + qi + '"></div>' +
            '</div>'
        );
    }).join('') +
        '<button class="quiz-submit-btn" id="mq_' + prefix + '_sub" onclick="checkMathsQuiz(\'' + prefix + '\')">&#x2713; Submit Answers</button>';
}

function pickMathsAnswer(prefix, qi, letter) {
    if (!_mathsQuizStore[prefix]) return;
    _mathsQuizStore[prefix].answers[qi] = letter;
    var qDiv = document.getElementById('mq_' + prefix + '_q' + qi);
    if (!qDiv) return;
    qDiv.querySelectorAll('.quiz-opt').forEach(function (btn) {
        btn.classList.remove('selected');
        if (btn.textContent.trim()[0] === letter) btn.classList.add('selected');
    });
}

function checkMathsQuiz(prefix) {
    var store = _mathsQuizStore[prefix];
    if (!store) return;
    var score = 0;
    store.data.questions.forEach(function (q, qi) {
        var fb = document.getElementById('mq_' + prefix + '_fb' + qi);
        var chosen = store.answers[qi];
        var qDiv = document.getElementById('mq_' + prefix + '_q' + qi);
        qDiv.querySelectorAll('.quiz-opt').forEach(function (btn) {
            var letter = btn.textContent.trim()[0];
            btn.disabled = true;
            if (letter === q.answer) btn.classList.add('correct');
            else if (letter === chosen && chosen !== q.answer) btn.classList.add('wrong');
        });
        if (chosen === q.answer) {
            score++;
            fb.className = 'quiz-feedback correct';
            fb.textContent = '\u2713 Correct! ' + q.explanation;
        } else {
            fb.className = 'quiz-feedback wrong';
            fb.textContent = (chosen ? '\u2717 Incorrect.' : '\u2715 Not answered.') + ' ' + q.explanation;
        }
    });
    var sub = document.getElementById('mq_' + prefix + '_sub');
    if (sub) {
        var sc = document.createElement('div');
        sc.className = 'quiz-score';
        var n = store.data.questions.length;
        var emoji = score === n ? '\uD83C\uDFC6 Perfect!' : score > 0 ? '\uD83D\uDC4D Good effort!' : '\uD83D\uDCDA Keep studying!';
        sc.innerHTML = 'Score: <strong>' + score + ' / ' + n + '</strong>  ' + emoji;
        sub.replaceWith(sc);
    }
}