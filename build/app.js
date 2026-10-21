
// ===== App =====
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CARDS = buildCards();
const BYID = Object.fromEntries(CARDS.map(c => [c.id, c]));
const FRBY = Object.fromEntries(FR.map(f => [f.id, f]));
const KEY = 'mir-dir-ihm-v1';
const INTERVALS = [0, 1, 2, 4, 8, 16, 32];
const KNOWN_BOX = 3;

const DEFAULT_F = {k:['pp','pos','rx'], c:['N','A','D','G'], p:'all', r:REFS.slice(), t:TENSES.slice(), g:['m','f','n','p'], s:'due', m:'type', n:20};
let S = {v:1, cards:{}, conf:{}, days:{}, set:{theme:'auto', speak:false, strict:false, rate:0.95, f:structuredClone(DEFAULT_F)}};
try {
  const raw = localStorage.getItem(KEY);
  if (raw){ const o = JSON.parse(raw); S = {...S, ...o, set:{...S.set, ...(o.set||{}), f:{...DEFAULT_F, ...((o.set||{}).f||{})}}}; }
} catch(e){}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }
const F = () => S.set.f;

function today(){ const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset()*60000) / 864e5); }

// ---------- theme ----------
function applyTheme(){
  const t = S.set.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}
applyTheme();

// ---------- speech ----------
let deVoice = null;
function pickVoice(){
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices();
  deVoice = vs.find(v => /^de(-|_)DE/i.test(v.lang) && /google|natural|premium|enhanced/i.test(v.name)) || vs.find(v => /^de/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window){ pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text){
  if (!('speechSynthesis' in window)) return toast('No speech voice in this browser');
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE'; if (deVoice) u.voice = deVoice; u.rate = S.set.rate;
  speechSynthesis.speak(u);
}

// ---------- filters ----------
const OPT = {
  k:[['pp','Pronouns','mich · mir'],['pos','Possessives','mein · seinem'],['rx','Reflexives','mich · sich']],
  c:[['N','Nominativ'],['A','Akkusativ'],['D','Dativ'],['G','Genitiv']],
  p:[['all','Any trigger'],['v','After verbs'],['p','After prepositions']],
  r:[['1s','ich'],['2s','du'],['3m','er'],['3f','sie','she'],['3n','es'],['1p','wir'],['2p','ihr'],['3p','sie','they'],['S','Sie']],
  t:TENSES.map(t => [t, TNAME[t]]),
  g:[['m','der','masc.'],['f','die','fem.'],['n','das','neut.'],['p','die','plural']],
  s:[['due','New + due'],['weak','Weak spots'],['review','Review known'],['all','Everything']],
  m:[['type','Typing'],['pick','Picking'],['flip','Flipping']],
  n:[[10,'10'],[20,'20'],[40,'40'],[80,'80']],
};
const SNOTE = {
  due:'Cards that are due today, then new ones. Anything you already know stays hidden until its review date.',
  weak:'Only cards you have got wrong and not yet nailed, worst first.',
  review:'Cards you already know, for a top-up before they are due.',
  everything:'',
  all:'Everything in the filter: due first, then new, then the rest.'
};
function multiChips(el, key, opts, cls){
  el.innerHTML = opts.map(([v, label, sub]) =>
    `<button class="chip ${cls ? cls + v : ''}" data-v="${v}" aria-pressed="${F()[key].includes(v)}">${esc(label)}${sub ? `<small>${esc(sub)}</small>` : ''}</button>`).join('');
  el.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    const v = b.dataset.v; const arr = F()[key];
    const i = arr.indexOf(v);
    if (i >= 0) arr.splice(i, 1); else arr.push(v);
    save(); renderHome();
  };
}
function segBtns(el, key, opts){
  el.innerHTML = opts.map(([v, label]) => `<button data-v="${v}" aria-pressed="${String(F()[key]) === String(v)}">${esc(label)}</button>`).join('');
  el.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    const v = b.dataset.v; F()[key] = typeof DEFAULT_F[key] === 'number' ? +v : v;
    save(); renderHome();
  };
}
function matches(c, f){
  return f.k.includes(c.k) && f.c.includes(c.c) && f.r.includes(c.r) && f.t.includes(c.t)
    && (f.p === 'all' || (f.p === 'p') === !!c.p)
    && (c.k !== 'pos' || f.g.includes(c.g));
}
function pool(f){ return CARDS.filter(c => matches(c, f)); }
function classify(list){
  const d = today(); let due = 0, nw = 0, known = 0, weak = 0;
  for (const c of list){
    const st = S.cards[c.id];
    if (!st) nw++;
    else { if (st.due <= d) due++; if (st.b >= KNOWN_BOX) known++; if (st.w > 0 && st.b < KNOWN_BOX) weak++; }
  }
  return {due, nw, known, weak, total:list.length};
}

function renderHome(){
  multiChips($('#fK'), 'k', OPT.k);
  multiChips($('#fC'), 'c', OPT.c, 'c-');
  segBtns($('#fP'), 'p', OPT.p);
  multiChips($('#fR'), 'r', OPT.r);
  multiChips($('#fT'), 't', OPT.t);
  multiChips($('#fG'), 'g', OPT.g);
  segBtns($('#fS'), 's', OPT.s);
  segBtns($('#fM'), 'm', OPT.m);
  segBtns($('#fN'), 'n', OPT.n);
  $('#fGwrap').hidden = !F().k.includes('pos');
  $('#fSnote').textContent = SNOTE[F().s] || '';
  $('#fRq').innerHTML = [['all','all'],['third','3rd person'],['plural','plural'],['formal','du / ihr / Sie'],['none','none']]
    .map(([v,l]) => `<button class="quick" data-q="${v}">${l}</button>`).join('');
  const list = pool(F()), k = classify(list);
  $('#counts').innerHTML = `<span><b>${k.total.toLocaleString()}</b> cards match</span><span><b>${k.due}</b> due</span><span><b>${k.nw.toLocaleString()}</b> new</span><span><b>${k.known}</b> known</span><span><b>${k.weak}</b> weak</span>`;
  const sess = buildSession(true);
  $('#startBtn').disabled = !sess.length;
  $('#startNote').textContent = !k.total ? 'No cards match these filters.' : !sess.length ? (F().s === 'due' ? 'Nothing due here — try Weak spots or Everything.' : 'Nothing in this group yet.') : '';
}
$('#fRq').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  const q = b.dataset.q;
  F().r = q === 'all' ? REFS.slice() : q === 'third' ? ['3m','3f','3n','3p'] : q === 'plural' ? ['1p','2p','3p','S'] : q === 'formal' ? ['2s','2p','S'] : [];
  save(); renderHome();
});

// ---------- session ----------
function hashShuffle(arr){ const a = arr.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function spread(list, n){
  // avoid the same sentence frame + person twice, and any frame more than twice
  const out = [], seenFR = new Set(), frameN = {};
  for (const pass of [0, 1]){
    for (const c of list){
      if (out.length >= n) break;
      if (out.includes(c)) continue;
      const fr = c.f + c.r;
      if (pass === 0 && (seenFR.has(fr) || (frameN[c.f] || 0) >= 2)) continue;
      out.push(c); seenFR.add(fr); frameN[c.f] = (frameN[c.f] || 0) + 1;
    }
  }
  return out;
}
function buildSession(dry){
  const f = F(), d = today(), n = f.n;
  const list = pool(f);
  const st = c => S.cards[c.id];
  let out = [];
  if (f.s === 'due'){
    const due = list.filter(c => st(c) && st(c).due <= d).sort((a, b) => st(a).due - st(b).due);
    out = due.slice(0, n);
    if (out.length < n) out = out.concat(spread(hashShuffle(list.filter(c => !st(c))), n - out.length));
  } else if (f.s === 'weak'){
    out = list.filter(c => st(c) && st(c).w > 0 && st(c).b < KNOWN_BOX)
      .sort((a, b) => (st(b).w - st(b).s * .5) - (st(a).w - st(a).s * .5)).slice(0, n);
  } else if (f.s === 'review'){
    out = spread(hashShuffle(list.filter(c => st(c) && st(c).b >= KNOWN_BOX)), n);
  } else {
    const due = list.filter(c => st(c) && st(c).due <= d).sort((a, b) => st(a).due - st(b).due).slice(0, n);
    out = due;
    if (out.length < n) out = out.concat(spread(hashShuffle(list.filter(c => !st(c))), n - out.length));
    if (out.length < n) out = out.concat(spread(hashShuffle(list.filter(c => st(c) && st(c).due > d)), n - out.length));
  }
  return dry ? out : hashShuffle(out.slice(0, n));
}

let SS = null; // session state
function startSession(list){
  if (!list.length) return toast('Nothing to practise with these filters');
  SS = {q:list.slice(), i:0, res:[], repeats:{}, revealed:false, cur:null, picked:null, ok:null, given:''};
  show('study'); renderCard();
}
$('#startBtn').onclick = () => startSession(buildSession(false));

function caseTag(c){ return `<span class="tag c-${c}">${CNAME[c]}</span>`; }
function cardTags(c){
  return `<span class="tag">${KNAME[c.k]}</span>${caseTag(c.c)}<span class="tag">${TNAME[c.t]}</span>`
    + (c.p ? '<span class="tag">after a preposition</span>' : '')
    + (c.k === 'pos' ? `<span class="tag">${GNAME[c.g]} noun</span>` : '');
}
function sentenceHTML(c, filled, cls){
  const parts = c.q.split('____');
  const b = filled ? `<span class="ans ${cls || ''}">${esc(c.a)}</span>` : `<span class="blank">${'·'.repeat(Math.max(3, c.a.length))}</span>`;
  return esc(parts[0]) + b + esc(parts[1] || '');
}
function ruleHTML(c){
  const f = FRBY[c.f];
  let steps = [];
  if (c.k === 'pos'){
    const e = END[c.c][c.g];
    steps = [`${esc(c.hint)} → <b>${esc(c.stem)}-</b>`, CNAME[c.c], `${GNAME[c.g]}`, `ending <b>${e ? '-' + e : '∅'}</b>`, `<b>${esc(c.a0)}</b>`];
  } else if (c.k === 'rx'){
    steps = [`subject = ${esc(REFNAME[c.r])}`, `reflexive ${CNAME[c.c]}`, `<b>${esc(c.a0)}</b>`];
  } else {
    steps = [`${esc(c.hint)}`, CNAME[c.c], `<b>${esc(c.a0)}</b>`];
  }
  return `<div class="rule"><div>${esc(f.w)}.</div><div class="chain">${steps.map(s => `<span class="step">${s}</span>`).join('<span class="arrow">→</span>')}</div></div>
    <div class="gloss">${esc(f.g)}</div>`;
}

function renderCard(){
  const c = SS.q[SS.i]; SS.cur = c; SS.revealed = false; SS.ok = null; SS.given = ''; SS.picked = null;
  const m = F().m;
  $('#sCount').textContent = `${Math.min(SS.i + 1, SS.q.length)} / ${SS.q.length}`;
  $('#sBar').style.width = (SS.i / SS.q.length * 100) + '%';
  let body = `<div class="tags">${cardTags(c)}</div>
    <div class="hint">fill in: <b>${esc(c.hint)}</b></div>
    <p class="sentence" id="sent">${sentenceHTML(c, false)}</p>`;
  if (m === 'type') body += `<form class="typer" id="typer" autocomplete="off"><input id="ansIn" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="type the missing word" aria-label="Your answer"><button class="primary" type="submit">Check</button></form>`;
  else if (m === 'pick') body += `<div class="picks" id="picks">${c.opts.map((o, i) => `<button data-o="${esc(o)}">${esc(o)}<kbd>${i + 1}</kbd></button>`).join('')}</div>`;
  else body += `<button class="ghost flipbtn" id="flipBtn">Show answer</button>`;
  body += `<div id="after"></div>`;
  $('#card').innerHTML = body;
  $('#keys').textContent = m === 'type' ? 'Enter checks · Enter again moves on · 3 = too easy · s = hear it · Esc ends'
    : m === 'pick' ? '1–6 picks · Enter moves on · 3 = too easy · s = hear it · Esc ends'
    : 'Space shows the answer · 1 again · 2 got it · 3 easy · s = hear it';
  if (m === 'type'){
    $('#typer').onsubmit = e => { e.preventDefault(); if (!SS.revealed) checkTyped(); else next(SS.ok ? 'good' : 'again'); };
    setTimeout(() => $('#ansIn') && $('#ansIn').focus(), 30);
  } else if (m === 'pick'){
    $('#picks').onclick = e => { const b = e.target.closest('button'); if (b && !SS.revealed) checkPicked(b.dataset.o); };
  } else {
    $('#flipBtn').onclick = () => reveal(null);
  }
}
function norm(s){ return s.trim().replace(/\s+/g, ' ').replace(/[.,!?;:]+$/, ''); }
function checkTyped(){
  const inp = $('#ansIn'); const g = norm(inp.value);
  if (!g) { inp.focus(); return; }
  const c = SS.cur; let ok, note = '';
  if (g === c.a || g === c.a0) ok = true;
  else if (g.toLowerCase() === c.a.toLowerCase()){
    ok = !S.set.strict;
    note = `Capitals matter here: <b>${esc(c.a)}</b>` + (c.r === 'S' ? ' — formal Sie forms are always capitalised.' : '.');
  } else ok = false;
  inp.classList.add(ok ? 'ok' : 'bad'); inp.readOnly = true;
  SS.given = g; reveal(ok, note);
}
function checkPicked(o){
  const c = SS.cur; const ok = o === c.a;
  document.querySelectorAll('#picks button').forEach(b => {
    b.disabled = true;
    if (b.dataset.o === c.a) b.classList.add('ok');
    else if (b.dataset.o === o) b.classList.add('bad');
  });
  SS.given = o; reveal(ok);
}
function reveal(ok, note){
  const c = SS.cur; SS.revealed = true; SS.ok = ok;
  $('#sent').innerHTML = sentenceHTML(c, true, ok === false ? 'bad' : ok ? 'ok' : '');
  let v = '';
  if (ok === true) v = `<div class="verdict ${note ? 'warn' : 'ok'}">${note ? 'Right — ' + note : 'Right.'}</div>`;
  else if (ok === false) v = `<div class="verdict bad">Not quite — you ${F().m === 'pick' ? 'picked' : 'wrote'} “${esc(SS.given)}”.${note ? ' ' + note : ''}</div>`;
  let btns;
  if (ok === null) btns = `<div class="grades"><button class="g-again" data-g="again">Again<small>1</small></button><button class="g-good" data-g="good">Got it<small>2</small></button><button class="g-easy" data-g="easy">Easy<small>3</small></button></div>`;
  else if (ok) btns = `<div class="grades"><button class="g-good" data-g="good">Next<small>Enter</small></button><button class="g-easy" data-g="easy">Too easy<small>3</small></button></div>`;
  else btns = `<div class="grades"><button class="g-again" data-g="again">Next — I'll see it again<small>Enter</small></button></div>`;
  $('#after').innerHTML = `<div class="reveal">${v}${ruleHTML(c)}</div>${btns}`;
  $('#after').querySelector('.grades').onclick = e => { const b = e.target.closest('button'); if (b) next(b.dataset.g); };
  const fb = $('#flipBtn'); if (fb) fb.remove();
  if (F().m === 'type'){ const t = $('#typer button'); if (t) t.remove(); }
  if (S.set.speak) speak(c.full);
}
function grade(c, g){
  const d = today();
  const st = S.cards[c.id] || {b:0, due:d, s:0, w:0, t:0};
  if (g === 'again'){ st.b = 0; st.due = d; st.w++; }
  else { st.b = Math.min(6, st.b + (g === 'easy' ? 2 : 1)); st.due = d + INTERVALS[st.b]; st.s++; }
  st.t = Date.now();
  S.cards[c.id] = st;
  S.days[d] = (S.days[d] || 0) + 1;
  const plausible = SS.given && (c.opts.some(o => o.toLowerCase() === SS.given.toLowerCase()) || [NOM,AKK,DAT].some(t => Object.values(t).includes(SS.given.toLowerCase())));
  if (g === 'again' && plausible && SS.given.toLowerCase() !== c.a.toLowerCase()){
    const k = `${c.a0}|${SS.given.toLowerCase()}`;
    S.conf[k] = (S.conf[k] || 0) + 1;
  }
  save();
}
function next(g){
  if (!SS || !SS.revealed) return;
  const c = SS.cur;
  if (F().m !== 'flip' && SS.ok === false) g = 'again';
  grade(c, g);
  SS.res.push({c, ok: g !== 'again', given: SS.given});
  if (g === 'again' && (SS.repeats[c.id] || 0) < 2){
    SS.repeats[c.id] = (SS.repeats[c.id] || 0) + 1;
    const at = Math.min(SS.q.length, SS.i + 3 + Math.floor(Math.random() * 3));
    SS.q.splice(at, 0, c);
  }
  SS.i++;
  if (SS.i >= SS.q.length) finish(); else renderCard();
}
function finish(){
  const first = new Map();
  for (const r of SS.res) if (!first.has(r.c.id)) first.set(r.c.id, r);
  const arr = [...first.values()];
  const right = arr.filter(r => r.ok).length;
  const misses = arr.filter(r => !r.ok);
  $('#done').innerHTML = `<h1>Session done</h1>
    <div class="done-score">${right} / ${arr.length}</div>
    <p class="lede">right first time${misses.length ? ' · the misses are back in your due pile for today' : ''}.</p>
    ${misses.length ? `<h2>Worth another look</h2><ul class="misslist">${misses.map(r => `<li>${sentenceHTML(r.c, true, 'bad')}<small>${KNAME[r.c.k]} · ${CNAME[r.c.c]} · ${esc(r.c.hint)}${r.given ? ` · you: “${esc(r.given)}”` : ''}</small></li>`).join('')}</ul>` : ''}
    <div class="row" style="margin-top:20px"><button class="primary" id="againBtn">Another round</button>${misses.length ? '<button class="ghost" id="missBtn">Drill just these</button>' : ''}<button class="ghost" data-go="prog">See progress</button></div>`;
  show('done');
  $('#againBtn').onclick = () => startSession(buildSession(false));
  if (misses.length) $('#missBtn').onclick = () => startSession(hashShuffle(misses.map(r => r.c)));
  SS = null;
}
$('#quitBtn').onclick = () => { if (SS && SS.res.length) finish(); else { SS = null; show('home'); } };
$('#speakBtn').onclick = () => { if (SS && SS.cur) speak(SS.revealed ? SS.cur.full : SS.cur.q.replace('____', '…')); };

document.addEventListener('keydown', e => {
  if ($('#study').hidden || !SS || e.metaKey || e.ctrlKey || e.altKey) return;
  if (document.querySelector('dialog[open]')) return;
  const inInput = e.target.tagName === 'INPUT' && !e.target.readOnly;
  const m = F().m;
  if (e.key === 'Escape'){ $('#quitBtn').click(); return; }
  if (inInput) return;
  if (e.key === 's' || e.key === 'S'){ $('#speakBtn').click(); return; }
  if (!SS.revealed){
    if (m === 'pick' && /^[1-6]$/.test(e.key)){ const b = document.querySelectorAll('#picks button')[+e.key - 1]; if (b) b.click(); }
    if (m === 'flip' && (e.key === ' ' || e.key === 'Enter')){ e.preventDefault(); reveal(null); }
    return;
  }
  if (m === 'flip'){
    if (e.key === '1') next('again'); else if (e.key === '2' || e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); next('good'); } else if (e.key === '3') next('easy');
  } else {
    if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); next(SS.ok ? 'good' : 'again'); }
    else if (e.key === '3' && SS.ok) next('easy');
  }
});

// ---------- progress ----------
const SHORT = {'1s':'ich','2s':'du','3m':'er','3f':'sie·f','3n':'es','1p':'wir','2p':'ihr','3p':'sie·pl','S':'Sie'};
const HCOLS = [['pp','A'],['pp','D'],['pos','N'],['pos','A'],['pos','D'],['pos','G'],['rx','A'],['rx','D']];
function accColor(p){
  const stops = [[0,[178,58,46]],[.5,[208,138,30]],[.75,[201,181,43]],[1,[63,154,93]]];
  for (let i = 1; i < stops.length; i++){
    if (p <= stops[i][0]){
      const [a, ca] = stops[i-1], [b, cb] = stops[i]; const t = (p - a) / (b - a);
      return `rgb(${ca.map((x, j) => Math.round(x + (cb[j] - x) * t)).join(',')})`;
    }
  }
  return 'rgb(63,154,93)';
}
function agg(filterFn){
  let s = 0, w = 0, seen = 0, known = 0, n = 0;
  for (const c of CARDS){
    if (!filterFn(c)) continue; n++;
    const st = S.cards[c.id]; if (!st) continue;
    seen++; s += st.s; w += st.w; if (st.b >= KNOWN_BOX) known++;
  }
  return {s, w, seen, known, n, acc: s + w ? s / (s + w) : null};
}
function renderProg(){
  const all = agg(() => true);
  const d = today(); let streak = 0;
  for (let x = d; S.days[x]; x--) streak++;
  const dueNow = CARDS.filter(c => S.cards[c.id] && S.cards[c.id].due <= d).length;
  let html = `<h1>Progress</h1><p class="lede">Accuracy counts every answer you've given; tap a square to drill exactly that combination.</p>
  <div class="stats">
    <div class="stat"><b>${all.seen.toLocaleString()}</b><span>cards seen of ${all.n.toLocaleString()}</span></div>
    <div class="stat"><b>${all.known.toLocaleString()}</b><span>known (3+ reviews in a row)</span></div>
    <div class="stat"><b>${dueNow}</b><span>due today</span></div>
    <div class="stat"><b>${all.acc === null ? '–' : Math.round(all.acc * 100) + '%'}</b><span>accuracy · ${all.s + all.w} answers</span></div>
    <div class="stat"><b>${streak}</b><span>day streak</span></div>
  </div>
  <h2>Where it breaks: person × case</h2>
  <div class="heat" style="grid-template-columns:44px repeat(8,minmax(0,1fr))">
    <div></div><div class="hd grp" style="grid-column:span 2">Pronoun</div><div class="hd grp" style="grid-column:span 4">Possessive</div><div class="hd grp" style="grid-column:span 2">Reflex.</div>
    <div></div>${HCOLS.map(([k, c]) => `<div class="hd" style="color:var(--${c})">${c === 'N' ? 'Nom' : c === 'A' ? 'Akk' : c === 'D' ? 'Dat' : 'Gen'}</div>`).join('')}`;
  for (const r of REFS){
    html += `<div class="rl">${esc(SHORT[r])}</div>`;
    for (const [k, c] of HCOLS){
      const a = agg(x => x.k === k && x.c === c && x.r === r);
      if (!a.n){ html += `<div class="cell na"></div>`; continue; }
      const sample = CARDS.find(x => x.k === k && x.c === c && x.r === r && (k !== 'pos' || x.g === 'm'));
      const form = sample ? (k === 'pos' ? sample.stem + '-' : sample.a0) : '';
      if (a.acc === null) html += `<button class="cell empty" data-k="${k}" data-c="${c}" data-r="${r}" title="${esc(form)} — not practised yet">${esc(form)}</button>`;
      else html += `<button class="cell" style="background:${accColor(a.acc)}" data-k="${k}" data-c="${c}" data-r="${r}" title="${esc(form)}: ${a.s} right, ${a.w} wrong">${Math.round(a.acc * 100)}<small>${a.s + a.w}×</small></button>`;
    }
  }
  html += `</div><div class="legend">0%<i></i>100% <span style="margin-left:auto">grey = not practised yet</span></div>`;

  html += `<h2>By tense</h2><div class="bars">`;
  for (const t of TENSES){
    const a = agg(c => c.t === t);
    const pk = a.known / a.n * 100, ps = (a.seen - a.known) / a.n * 100;
    html += `<div class="barrow"><span>${TNAME[t]}</span><div class="track"><i style="width:${pk}%;background:var(--good)"></i><i style="width:${ps}%;background:color-mix(in srgb,var(--good) 35%,transparent)"></i></div><span class="num">${a.acc === null ? '–' : Math.round(a.acc * 100) + '%'}</span></div>`;
  }
  html += `</div><div class="legend"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--good)"></span>known <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:color-mix(in srgb,var(--good) 35%,transparent);margin-left:8px"></span>seen <span style="margin-left:auto">right-hand number = accuracy</span></div>`;

  const conf = Object.entries(S.conf).sort((a, b) => b[1] - a[1]).slice(0, 12);
  html += `<h2>Your most common mix-ups</h2>`;
  html += conf.length ? `<ul class="conf">${conf.map(([k, n]) => { const [want, got] = k.split('|'); return `<li><span class="x">${esc(got)}</span><span class="arrow" style="color:var(--muted)">instead of</span><span class="x" style="color:var(--good)">${esc(want)}</span><span class="n">${n}×</span></li>`; }).join('')}</ul>`
    : `<p class="note">Nothing yet — wrong answers in typing and picking modes show up here, so you can see whether the slip is the case (ihn/ihm) or the person (ihr/ihnen).</p>`;
  $('#prog').innerHTML = html;
  $('#prog').querySelector('.heat').onclick = e => {
    const b = e.target.closest('button.cell'); if (!b) return;
    const f = F();
    f.k = [b.dataset.k]; f.c = [b.dataset.c]; f.r = [b.dataset.r]; f.t = TENSES.slice(); f.p = 'all'; f.g = ['m','f','n','p'];
    const st = classify(pool(f));
    f.s = st.weak >= 5 ? 'weak' : (st.due + st.nw) ? 'due' : 'all';
    save();
    startSession(buildSession(false));
  };
}

// ---------- tables ----------
function renderTables(){
  const rowsP = REFS.map(r => `<tr><td>${esc(REFNAME[r])}</td><td class="f">${NOM[r]}</td><td class="f">${AKK[r] === DAT[r] ? AKK[r] : `<span class="hl">${AKK[r]}</span>`}</td><td class="f">${AKK[r] === DAT[r] ? DAT[r] : `<span class="hl">${DAT[r]}</span>`}</td><td class="f">${RFA[r]}</td><td class="f">${RFD[r]}</td></tr>`).join('');
  const gens = ['m','f','n','p'];
  const rowsE = ['N','A','D','G'].map(c => `<tr><td style="color:var(--${c});font-weight:600">${CNAME[c]}</td>${gens.map(g => `<td class="f">mein<b>${END[c][g]}</b></td>`).join('')}</tr>`).join('');
  const stems = REFS.map(r => `<tr><td>${esc(REFNAME[r])}</td><td>${esc(EN.pos[r])}</td><td class="f">${POSS[r]}-</td><td class="f">${possForm(POSS[r], 'D', 'm')}</td><td class="f">${possForm(POSS[r], 'A', 'f')}</td></tr>`).join('');
  $('#tables').innerHTML = `<h1>Tables</h1>
  <p class="lede">The tense never changes which form you need — it only moves the verb. The case comes from the verb or preposition; the form comes from the person.</p>
  <h2>Personal and reflexive pronouns</h2>
  <div class="tw"><table class="t"><thead><tr><th>Person</th><th>Nom</th><th>Akk</th><th>Dat</th><th>Refl. Akk</th><th>Refl. Dat</th></tr></thead><tbody>${rowsP}</tbody></table></div>
  <p class="note">Highlighted = Akk and Dat differ, which is where the mistakes live: mich/mir, dich/dir, ihn/ihm, sie/ihr, sie/ihnen. Reflexives only differ from the normal pronoun in the 3rd person and Sie — everything there is <b>sich</b>.</p>
  <h2>Possessives: the endings</h2>
  <div class="tw"><table class="t"><thead><tr><th></th><th>masc. (der)</th><th>fem. (die)</th><th>neut. (das)</th><th>plural (die)</th></tr></thead><tbody>${rowsE}</tbody></table></div>
  <p class="note">Two separate questions: the <b>owner</b> picks the stem (his → sein-, her → ihr-), the <b>noun's gender and case</b> pick the ending. "Her brother" in the Dativ is ihr + em = ihrem, because Bruder is masculine — the owner being female doesn't matter.</p>
  <div class="tw"><table class="t"><thead><tr><th>Owner</th><th>English</th><th>Stem</th><th>Dat masc.</th><th>Akk fem.</th></tr></thead><tbody>${stems}</tbody></table></div>
  <p class="note">euer drops its e when an ending follows: eure, euren, eurem, eurer.</p>
  <h2>What sets the case</h2>
  <div class="prepgrid">
    <div class="prepbox"><b style="color:var(--A)">Always Akkusativ</b>durch · für · gegen · ohne · um · bis</div>
    <div class="prepbox"><b style="color:var(--D)">Always Dativ</b>aus · bei · mit · nach · seit · von · zu · gegenüber</div>
    <div class="prepbox"><b>Two-way</b>an · auf · hinter · in · neben · über · unter · vor · zwischen<br><span class="note">where? (wo) → Dat · where to? (wohin) → Akk · in fixed verb phrases it's learned with the verb (warten auf + Akk, Angst vor + Dat)</span></div>
    <div class="prepbox"><b style="color:var(--G)">Genitiv</b>wegen · trotz · während · statt<br><span class="note">plus "of" possession: das Auto meines Bruders</span></div>
    <div class="prepbox" style="grid-column:1/-1"><b style="color:var(--D)">Common Dativ verbs</b>helfen · danken · antworten · glauben · vertrauen · zuhören · gratulieren · folgen · begegnen · widersprechen · gefallen · gehören · schmecken · passen · wehtun · leidtun · einfallen · es geht mir…</div>
    <div class="prepbox" style="grid-column:1/-1"><b>Two objects</b>The person gets Dativ, the thing gets Akkusativ: <i>Ich gebe <b>ihm</b> den Schlüssel.</i> When both are pronouns, Akk comes first: <i>Ich gebe <b>ihn ihm</b>.</i></div>
    <div class="prepbox" style="grid-column:1/-1"><b>Reflexive: Akk or Dat?</b>If the sentence already has an Akkusativ object, the reflexive moves to Dativ: <i>Ich wasche <b>mich</b></i> but <i>Ich wasche <b>mir</b> die Hände</i>.</div>
  </div>`;
}

// ---------- navigation ----------
function show(id){
  for (const m of ['home','study','done','prog','tables']) $('#' + m).hidden = m !== id;
  document.querySelectorAll('.nav button').forEach(b => b.setAttribute('aria-current', b.dataset.go === id || (id === 'study' && b.dataset.go === 'home') ? 'page' : 'false'));
  if (id === 'home') renderHome();
  if (id === 'prog') renderProg();
  if (id === 'tables') renderTables();
  window.scrollTo(0, 0);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go]'); if (!b) return;
  if (SS && !$('#study').hidden && b.dataset.go !== 'study'){ if (SS.res.length && b.dataset.go === 'home'){ finish(); return; } SS = null; }
  show(b.dataset.go);
});

// ---------- settings ----------
const dlg = $('#settings');
function renderSettings(){
  $('#themeSeg').innerHTML = [['auto','Auto'],['light','Light'],['sepia','Sepia'],['dark','Dark']].map(([v, l]) => `<button data-v="${v}" aria-pressed="${S.set.theme === v}">${l}</button>`).join('');
  $('#autoSpeak').checked = S.set.speak; $('#strictCaps').checked = S.set.strict; $('#rate').value = S.set.rate;
}
$('#openSettings').onclick = () => { renderSettings(); dlg.showModal(); };
$('#closeSettings').onclick = () => dlg.close();
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
$('#themeSeg').onclick = e => { const b = e.target.closest('button'); if (!b) return; S.set.theme = b.dataset.v; save(); applyTheme(); renderSettings(); };
$('#autoSpeak').onchange = e => { S.set.speak = e.target.checked; save(); };
$('#strictCaps').onchange = e => { S.set.strict = e.target.checked; save(); };
$('#rate').onchange = e => { S.set.rate = +e.target.value; save(); speak('Ich gebe ihm den Schlüssel.'); };

function toast(msg){ const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600); }
$('#exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify({app:'mir-dir-ihm', exported:new Date().toISOString(), v:S.v, cards:S.cards, conf:S.conf, days:S.days, set:S.set})], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `mir-dir-ihm-progress-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Progress exported');
};
$('#importBtn').onclick = () => $('#importFile').click();
$('#importFile').onchange = async e => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const o = JSON.parse(await file.text());
    if (!o || o.app !== 'mir-dir-ihm' || typeof o.cards !== 'object') throw 0;
    const n = Object.keys(o.cards).length;
    if (!confirm(`Merge ${n} cards from this file? Where both have a card, the more recent answer wins.`)) return;
    for (const [id, st] of Object.entries(o.cards)){ const cur = S.cards[id]; if (!cur || (st.t || 0) > (cur.t || 0)) S.cards[id] = st; }
    for (const [k, v] of Object.entries(o.conf || {})) S.conf[k] = Math.max(S.conf[k] || 0, v);
    for (const [k, v] of Object.entries(o.days || {})) S.days[k] = Math.max(S.days[k] || 0, v);
    save(); toast(`Merged ${n} cards`); show('home');
  } catch(err){ toast('That file isn’t a mir · dir · ihm export'); }
  e.target.value = '';
};
$('#resetBtn').onclick = () => {
  const n = Object.keys(S.cards).length;
  if (!n) return toast('Nothing to reset yet');
  if (confirm(`Erase progress on ${n} cards? Export first if you might want it back.`)){ S.cards = {}; S.conf = {}; S.days = {}; save(); dlg.close(); show('home'); toast('Progress reset'); }
};

show('home');

// Register the service worker (only when served over http/https, not from a local file)
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
