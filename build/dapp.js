
// ===== Dialogues mode =====
const DLG = parseDialogues(DLG_TXT).dialogues;
const DLGBY = Object.fromEntries(DLG.map(d => [d.id, d]));
const GRPNAME = {shop:'Shopping', service:'Services & offices', work:'Work', people:'Friends & family', out:'Going out & travel'};
const REGNAME = {Sie:'Sie', du:'du', mixed:'Sie + du'};
const DCAT_OPTS = [['pp','Pronouns','ich · mir · ihn'],['pos','Possessives','meinem · Ihrer'],['rx','Reflexives','mich · sich'],['art','Articles','den · einem · kein'],['adj','Adjective endings','-e · -en · -em']];
const DEFAULT_D = {cat:['pp','pos','rx','art','adj'], hint:true, grp:Object.keys(GRPNAME), reg:'all', st:'all'};
S.dl = S.dl || {}; S.dg = S.dg || {};
S.set.d = {...DEFAULT_D, ...(S.set.d || {})};
const Dset = () => S.set.d;

// every gap gets a stable key: dialogue:line:gapNumberInLine
DLG.forEach(d => d.lines.forEach((l, li) => { let n = 0; l.s.forEach(s => { if (typeof s !== 'string'){ s.key = `${d.id}:${li}:${n++}`; s.cat = DCAT[s.t[0]]; } }); }));
const DGAPS = DLG.flatMap(d => d.lines.flatMap(l => l.s.filter(s => typeof s !== 'string')));

// all real forms, so mix-ups only record plausible slips (not typos)
const ALLFORMS = new Set();
for (const tb of [NOM, AKK, DAT, RFA, RFD]) Object.values(tb).forEach(x => ALLFORMS.add(x.toLowerCase()));
for (const st of new Set(Object.values(POSS))) for (const e of ['', 'e','en','em','er','es','s']) ALLFORMS.add((st === 'euer' && e && e !== 's' ? 'eur' : st) + e);
for (const w of ['der','die','das','den','dem','des','ein','eine','einen','einem','einer','eines','kein','keine','keinen','keinem','keiner','keines']) ALLFORMS.add(w);
for (const st of ['dies','welch','jed']) for (const e of ['e','en','em','er','es']) ALLFORMS.add(st + e);

const activeGap = s => typeof s !== 'string' && Dset().cat.includes(s.cat);
function gapCount(d){ return d.lines.reduce((n, l) => n + l.s.filter(activeGap).length, 0); }
function gapHint(g){
  if (g.hint) return g.hint;
  const [k, c, r] = g.t;
  if (k === 'pp') return c === 'N' ? ENN[r] : EN.pp[r];
  if (k === 'pos') return EN.pos[r];
  if (k === 'posp') return EN.pos[r].replace(/^my/, 'mine').replace(/^your/, 'yours').replace(/^his/, 'his').replace(/^her/, 'hers').replace(/^our/, 'ours').replace(/^their/, 'theirs');
  if (k === 'rx') return EN.rx[r];
  return '';
}
function gapDetail(g){
  const [k, a, b, c] = g.t;
  const ans = `<b>${esc(g.a)}</b>`;
  const C = x => `<span style="color:var(--${x});font-weight:600">${CNAME[x]}</span>`;
  switch(k){
    case 'pp': return [esc(gapHint(g)), C(a), ans];
    case 'rx': return [`subject: ${esc(REFNAME[b])}`, 'reflexive ' + C(a), ans];
    case 'pos': { const e = END[a][c]; return [`${esc(gapHint(g))} → ${esc(POSS[b])}-`, C(a), `${GNAME[c]} noun`, `ending ${e ? '-' + e : '∅'}`, ans]; }
    case 'posp': return [esc(gapHint(g)), 'standing alone', C(a), GNAME[c], ans];
    case 'adj': return [ATYPE[a], C(b), GNAME[c], `ending <b>-${esc(g.a)}</b>`];
    default: return [DETNAME[k], C(a), GNAME[b], ans];
  }
}
function judge(g, typed){
  let t = typed.trim().replace(/[.,!?;:]+$/, '');
  if (!t) return {ok:false, empty:true, given:''};
  if (g.stem && t.toLowerCase().startsWith(g.stem.toLowerCase()) && t.length > g.stem.length) t = t.slice(g.stem.length);
  const want = [g.a, ...altForms(g.t)];
  if (want.includes(t)) return {ok:true, given:t};
  if (want.some(w => w.toLowerCase() === t.toLowerCase())){
    const formal = ['pp','pos','posp'].includes(g.t[0]) && g.t[2] === 'S' && t[0] === t[0].toLowerCase();
    if (formal) return {ok:!S.set.strict, note:'formal Sie forms are capitalised', given:t};
    return {ok:true, given:t};
  }
  return {ok:false, given:t};
}

// ---------- list ----------
function dChips(el, key, opts, rerender){
  el.innerHTML = opts.map(([v, label, sub]) => `<button class="chip" data-v="${v}" aria-pressed="${Dset()[key].includes(v)}">${esc(label)}${sub ? `<small>${esc(sub)}</small>` : ''}</button>`).join('');
  el.onclick = e => { const b = e.target.closest('button'); if (!b) return; const arr = Dset()[key]; const i = arr.indexOf(b.dataset.v); if (i >= 0) arr.splice(i, 1); else arr.push(b.dataset.v); save(); rerender(); };
}
function dSeg(el, key, opts, rerender){
  el.innerHTML = opts.map(([v, label]) => `<button data-v="${v}" aria-pressed="${Dset()[key] === v}">${esc(label)}</button>`).join('');
  el.onclick = e => { const b = e.target.closest('button'); if (!b) return; Dset()[key] = b.dataset.v; save(); rerender(); };
}
function dFiltered(){
  const f = Dset();
  return DLG.filter(d => f.grp.includes(d.meta.grp) && (f.reg === 'all' || d.meta.reg === f.reg)
    && (f.st === 'all' || (f.st === 'new' && !S.dl[d.id]) || (f.st === 'work' && S.dl[d.id] && S.dl[d.id].best < 90) || (f.st === 'done' && S.dl[d.id])));
}
function renderDList(){
  const done = DLG.filter(d => S.dl[d.id]).length;
  $('#dlist').innerHTML = `<h1>Dialogues</h1>
    <p class="lede">Real conversations — shops, offices, work, family. Fill every gap as the conversation unfolds: you have to keep track of who is talking, who they're talking about, and whether it's Sie or du.</p>
    <div class="panel">
      <h3>Blank out</h3><div class="chips" id="dCat"></div>
      <div class="setrow" style="border:0;padding:12px 0 0"><label for="dHint">Show who each gap refers to<small>e.g. “her (my sister)”. Off = work it out from context.</small></label><input type="checkbox" class="switch" id="dHint"></div>
      <h3>Setting</h3><div class="chips" id="dGrp"></div>
      <h3>Register</h3><div class="seg" id="dReg"></div>
      <h3>Show</h3><div class="seg" id="dSt"></div>
    </div>
    <div class="countline"><span><b>${done}</b> of ${DLG.length} done</span><span id="dShown"></span><button class="quick" id="dRandom" style="margin-left:auto">Random dialogue →</button></div>
    <div class="dlist" id="dItems"></div>`;
  const rr = renderDList;
  dChips($('#dCat'), 'cat', DCAT_OPTS, rr);
  dChips($('#dGrp'), 'grp', Object.entries(GRPNAME), rr);
  dSeg($('#dReg'), 'reg', [['all','All'],['Sie','Sie'],['du','du'],['mixed','Sie + du']], rr);
  dSeg($('#dSt'), 'st', [['all','All'],['new','Not done'],['work','Under 90%'],['done','Done']], rr);
  $('#dHint').checked = Dset().hint;
  $('#dHint').onchange = e => { Dset().hint = e.target.checked; save(); };
  const list = dFiltered();
  $('#dShown').innerHTML = `<b>${list.length}</b> shown`;
  $('#dItems').innerHTML = list.length ? list.map(d => {
    const r = S.dl[d.id], n = gapCount(d);
    return `<button class="ditem" data-d="${d.id}">
      <span class="dt">${esc(d.meta.t)}</span>
      <span class="de">${esc(d.meta.en || '')}</span>
      <span class="dm"><span class="tag">${GRPNAME[d.meta.grp] || ''}</span><span class="tag reg-${d.meta.reg}">${REGNAME[d.meta.reg]}</span><span class="tag">${n} gaps</span>
      ${r ? `<span class="dscore" style="--p:${r.best}%"><i></i>${r.best}%</span>` : ''}</span>
    </button>`; }).join('') : '<p class="note">No dialogues match these filters.</p>';
  $('#dItems').onclick = e => { const b = e.target.closest('[data-d]'); if (b) startDialogue(b.dataset.d); };
  $('#dRandom').onclick = () => {
    const pool = list.filter(d => gapCount(d)); if (!pool.length) return toast('No dialogues match');
    const fresh = pool.filter(d => !S.dl[d.id]);
    const pick = (fresh.length ? fresh : pool)[Math.floor(Math.random() * (fresh.length || pool.length))];
    startDialogue(pick.id);
  };
}

// ---------- play ----------
let DS = null;
function startDialogue(id){
  const d = DLGBY[id];
  if (!gapCount(d)) return toast('Nothing to fill with the blanks you picked — turn on more types');
  DS = {d, li:0, res:{}, checked:new Set()};
  show('dplay'); renderPlay(); advanceAuto();
}
function sideOf(d, who){ return Object.keys(d.cast).indexOf(who); }
function lineHTML(d, l, li){
  const cur = li === DS.li && !DS.checked.has(li);
  let gi = 0;
  const body = l.s.map(s => {
    if (typeof s === 'string') return esc(s);
    if (!activeGap(s)) return esc(s.stem + s.a);
    const r = DS.res[s.key];
    if (cur){
      const w = Math.max(3, (s.stem ? s.a.length : s.a.length)) + 1.2;
      const h = Dset().hint ? gapHint(s) : '';
      return `${esc(s.stem)}<span class="gap c-${s.t[0] === 'adj' ? s.t[2] : s.t[1]}"><input data-k="${s.key}" style="width:${w}ch" autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="off" enterkeyhint="next" aria-label="gap ${++gi}${h ? ': ' + esc(h) : ''}">${h ? `<span class="h">${esc(h)}</span>` : ''}</span>`;
    }
    if (!r) return esc(s.stem + s.a);
    const cs = s.t[0] === 'adj' ? s.t[2] : s.t[1];
    if (r.ok) return `${esc(s.stem)}<span class="gv ok ${r.note ? 'warn' : ''} u-${cs}">${esc(s.a)}</span>`;
    return `${esc(s.stem)}<span class="gv bad u-${cs}">${r.given ? `<s>${esc(r.given)}</s> ` : ''}${esc(s.a)}</span>`;
  }).join('');
  const side = sideOf(d, l.w);
  let expl = '';
  if (DS.checked.has(li)){
    const gaps = l.s.filter(activeGap);
    if (gaps.length){
      const row = s => { const r = DS.res[s.key] || {}; return `<li class="${r.ok ? (r.note ? 'warn' : 'ok') : 'bad'}"><span class="chain">${gapDetail(s).map(x => `<span class="step">${x}</span>`).join('<span class="arrow">→</span>')}</span>${s.why ? `<span class="why">${esc(s.why)}</span>` : ''}${r.note ? `<span class="why">${esc(r.note)}</span>` : ''}</li>`; };
      const wrong = gaps.filter(s => !(DS.res[s.key] || {}).ok || (DS.res[s.key] || {}).note), right = gaps.filter(s => !wrong.includes(s));
      expl = `<ul class="expl">${wrong.map(row).join('')}</ul>` + (right.length ? `<details class="expl-more"><summary>${wrong.length ? 'Why the others are right' : 'Why'} (${right.length})</summary><ul class="expl">${right.map(row).join('')}</ul></details>` : '');
    }
  }
  return `<div class="bwrap s${side % 3} ${cur ? 'cur' : ''}" id="ln${li}"><div class="who">${esc(d.cast[l.w] || l.w)}</div><div class="bubble ${Dset().hint && cur ? 'hints' : ''}">${body}</div>${expl}</div>`;
}
function renderPlay(){
  const d = DS.d, n = d.lines.length;
  const total = gapCount(d), done = Object.keys(DS.res).length;
  const right = Object.values(DS.res).filter(r => r.ok).length;
  const lines = d.lines.slice(0, DS.li + 1).map((l, i) => lineHTML(d, l, i)).join('');
  const finished = DS.li >= n - 1 && DS.checked.has(n - 1);
  const curHasGaps = !DS.checked.has(DS.li) && d.lines[DS.li].s.some(activeGap);
  $('#dplay').innerHTML = `
    <div class="studytop"><button class="icon-btn" id="dBack" aria-label="Back to dialogues"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>
      <div class="grow"><b style="color:var(--ink);font-weight:600">${esc(d.meta.t)}</b><br>${right} / ${done} right · ${total - done} gaps to go</div>
      <button class="speak" id="dHintBtn" aria-pressed="${Dset().hint}">${Dset().hint ? 'Hints on' : 'Hints off'}</button></div>
    <div class="progress"><i style="width:${(DS.li + (DS.checked.has(DS.li) ? 1 : 0)) / n * 100}%"></i></div>
    <p class="scene">${esc(d.meta.en || '')} <span class="tag reg-${d.meta.reg}">${REGNAME[d.meta.reg]}</span></p>
    <div class="cast">${Object.entries(d.cast).map(([k, v], i) => `<span class="castp s${i % 3}">${esc(v)}</span>`).join('')}</div>
    <div class="chat">${lines}</div>
    <div class="dbar">${finished ? `<button class="primary" id="dFinish">See results</button>`
      : curHasGaps ? `<button class="primary" id="dCheck">Check</button>` : `<button class="primary" id="dNext">Next line</button>`}
      <button class="speak" id="dSpeak" title="Hear the last line">Hear</button></div>`;
  $('#dBack').onclick = () => { DS = null; show('dlist'); };
  $('#dHintBtn').onclick = () => { Dset().hint = !Dset().hint; save(); const vals = [...document.querySelectorAll('.gap input')].map(i => [i.dataset.k, i.value]); renderPlay(); vals.forEach(([k, v]) => { const i = document.querySelector(`.gap input[data-k="${k}"]`); if (i) i.value = v; }); focusNext(); };
  $('#dSpeak').onclick = () => speakLine(DS.checked.has(DS.li) ? DS.li : DS.li - 1);
  if ($('#dCheck')) $('#dCheck').onclick = checkLine;
  if ($('#dNext')) $('#dNext').onclick = nextLine;
  if ($('#dFinish')) $('#dFinish').onclick = finishDialogue;
  document.querySelectorAll('.gap input').forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return; e.preventDefault();
      const ins = [...document.querySelectorAll('.gap input')];
      const nxt = ins.slice(ins.indexOf(inp) + 1).find(i => !i.value.trim()) || ins.find(i => !i.value.trim());
      if (nxt && nxt !== inp) nxt.focus(); else checkLine();
    });
  });
  const cur = $('#ln' + DS.li);
  if (cur) cur.scrollIntoView({block:'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  focusNext();
}
function focusNext(){ const i = [...document.querySelectorAll('.gap input')].find(x => !x.value.trim()); if (i) setTimeout(() => i.focus({preventScroll:true}), 20); }
function lineText(l){ return l.s.map(s => typeof s === 'string' ? s : s.stem + s.a).join(''); }
function speakLine(li){
  if (li < 0 || !DS) return;
  const l = DS.d.lines[li]; if (!l) return;
  if (!('speechSynthesis' in window)) return toast('No speech voice in this browser');
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(lineText(l).replace(/[„“]/g, ''));
  u.lang = 'de-DE'; if (deVoice) u.voice = deVoice; u.rate = S.set.rate; u.pitch = [0.9, 1.15, 1.0][sideOf(DS.d, l.w) % 3];
  speechSynthesis.speak(u);
}
function checkLine(){
  const li = DS.li, l = DS.d.lines[li], d = today();
  for (const s of l.s.filter(activeGap)){
    const inp = document.querySelector(`.gap input[data-k="${s.key}"]`);
    const r = judge(s, inp ? inp.value : '');
    DS.res[s.key] = r;
    const st = S.dg[s.key] || {s:0, w:0};
    if (r.ok) st.s++; else st.w++;
    st.t = Date.now(); S.dg[s.key] = st;
    if (!r.ok && r.given){
      const isAdj = s.t[0] === 'adj';
      const g = r.given.toLowerCase();
      if (isAdj ? /^(e|en|em|er|es)$/.test(g) : ALLFORMS.has(g)){
        const k = isAdj ? `-${s.a}|-${g}` : `${s.a.toLowerCase()}|${g}`;
        S.conf[k] = (S.conf[k] || 0) + 1;
      }
    }
  }
  S.days[d] = (S.days[d] || 0) + 1;
  DS.checked.add(li); save();
  renderPlay();
  if (S.set.speak) speakLine(li);
}
function nextLine(){
  if (!DS) return;
  if (!DS.checked.has(DS.li)) DS.checked.add(DS.li);
  if (DS.li < DS.d.lines.length - 1){ DS.li++; advanceAuto(); renderPlay(); }
  else { renderPlay(); }
}
function advanceAuto(){
  // lines with nothing to fill are shown straight away; stop at the next line with a gap
  while (DS.li < DS.d.lines.length && !DS.d.lines[DS.li].s.some(activeGap)){
    DS.checked.add(DS.li);
    if (DS.li === DS.d.lines.length - 1) break;
    DS.li++;
  }
  renderPlay();
}
function finishDialogue(){
  const d = DS.d, gaps = d.lines.flatMap(l => l.s.filter(activeGap));
  const right = gaps.filter(s => (DS.res[s.key] || {}).ok).length;
  const pct = Math.round(right / gaps.length * 100);
  const prev = S.dl[d.id];
  S.dl[d.id] = {best: Math.max(pct, prev ? prev.best : 0), last: pct, n: (prev ? prev.n : 0) + 1, t: Date.now()};
  save();
  const byCat = {};
  gaps.forEach(s => { const c = byCat[s.cat] = byCat[s.cat] || {r:0, n:0}; c.n++; if ((DS.res[s.key] || {}).ok) c.r++; });
  const wrong = [];
  d.lines.forEach(l => { if (l.s.some(s => activeGap(s) && !(DS.res[s.key] || {}).ok)) wrong.push(l); });
  const lst = dFiltered(); const idx = lst.findIndex(x => x.id === d.id);
  const nxt = lst.slice(idx + 1).find(x => gapCount(x)) || lst.find(x => x.id !== d.id && gapCount(x));
  $('#dplay').innerHTML = `<h1>${esc(d.meta.t)}</h1>
    <div class="done-score">${right} / ${gaps.length}</div>
    <p class="lede">${pct}% right${prev ? ` · your best is ${S.dl[d.id].best}%` : ''}${pct === 100 ? ' — perfect!' : ''}</p>
    <div class="bars">${Object.entries(byCat).map(([c, v]) => `<div class="barrow"><span>${DCATNAME[c]}</span><div class="track"><i style="width:${v.r / v.n * 100}%;background:var(--good)"></i><i style="width:${(v.n - v.r) / v.n * 100}%;background:color-mix(in srgb,var(--again) 45%,transparent)"></i></div><span class="num">${v.r} / ${v.n}</span></div>`).join('')}</div>
    ${wrong.length ? `<h2>Lines to look at again</h2><ul class="misslist">${wrong.map(l => `<li><small style="margin:0 0 2px">${esc(d.cast[l.w])}</small>${l.s.map(s => { if (typeof s === 'string') return esc(s); if (!activeGap(s)) return esc(s.stem + s.a); const r = DS.res[s.key] || {}; return r.ok ? esc(s.stem + s.a) : `${esc(s.stem)}<span class="gv bad">${r.given ? `<s>${esc(r.given)}</s> ` : ''}${esc(s.a)}</span>`; }).join('')}</li>`).join('')}</ul>` : ''}
    <div class="row" style="margin-top:20px">${nxt ? `<button class="primary" id="dNextDlg">Next dialogue</button>` : ''}<button class="ghost" id="dRetry">Try again</button><button class="ghost" data-go="dlist">All dialogues</button></div>`;
  window.scrollTo(0, 0);
  $('#dRetry').onclick = () => startDialogue(d.id);
  if (nxt) $('#dNextDlg').onclick = () => startDialogue(nxt.id);
  DS = null;
}
document.addEventListener('keydown', e => {
  if ($('#dplay').hidden || !DS || e.metaKey || e.ctrlKey || e.altKey) return;
  if (document.querySelector('dialog[open]')) return;
  if (e.key === 'Escape'){ DS = null; show('dlist'); return; }
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'Enter' || e.key === ' '){
    e.preventDefault();
    const b = $('#dFinish') || $('#dNext') || $('#dCheck'); if (b) b.click();
  }
});

// ---------- dialogue data in Progress ----------
function dAgg(fn){
  let s = 0, w = 0;
  for (const g of DGAPS){ if (!fn(g)) continue; const st = S.dg[g.key]; if (st){ s += st.s; w += st.w; } }
  return {s, w};
}
function renderDProg(){
  const done = DLG.filter(d => S.dl[d.id]);
  const avg = done.length ? Math.round(done.reduce((a, d) => a + S.dl[d.id].best, 0) / done.length) : null;
  let html = `<h2>Dialogues</h2><div class="stats">
    <div class="stat"><b>${done.length}</b><span>of ${DLG.length} dialogues done</span></div>
    <div class="stat"><b>${avg === null ? '–' : avg + '%'}</b><span>average best score</span></div>
    <div class="stat"><b>${done.filter(d => S.dl[d.id].best === 100).length}</b><span>perfect</span></div></div>
  <p class="note" style="margin-top:8px">Pronoun, possessive and reflexive gaps from dialogues also count in the person × case map above.</p>
  <h2>Articles & adjective endings: case × gender</h2><div class="twogrids">`;
  for (const [cat, label] of [['art','Articles'],['adj','Adjective endings']]){
    html += `<div><h3 style="margin-top:6px">${label}</h3><div class="heat" style="grid-template-columns:44px repeat(4,minmax(0,1fr))"><div></div>${['m','f','n','p'].map(g => `<div class="hd">${{m:'der',f:'die',n:'das',p:'pl.'}[g]}</div>`).join('')}`;
    for (const c of ['N','A','D','G']){
      html += `<div class="rl" style="color:var(--${c})">${{N:'Nom',A:'Akk',D:'Dat',G:'Gen'}[c]}</div>`;
      for (const g of ['m','f','n','p']){
        const a = dAgg(x => x.cat === cat && (cat === 'adj' ? x.t[2] === c && x.t[3] === g : x.t[1] === c && x.t[2] === g));
        const n = a.s + a.w;
        html += n ? `<div class="cell" style="background:${accColor(a.s / n)}">${Math.round(a.s / n * 100)}<small>${n}×</small></div>` : `<div class="cell empty">·</div>`;
      }
    }
    html += `</div></div>`;
  }
  html += `</div>`;
  return html;
}

// hook dialogues into navigation, progress and backup
const _show = show;
show = function(id){
  for (const m of ['home','study','done','prog','tables','dlist','dplay']) $('#' + m).hidden = m !== id;
  document.querySelectorAll('.nav button').forEach(b => b.setAttribute('aria-current', b.dataset.go === id || (id === 'study' && b.dataset.go === 'home') || (id === 'dplay' && b.dataset.go === 'dlist') ? 'page' : 'false'));
  if (id === 'home') renderHome();
  if (id === 'prog'){ renderProg(); $('#prog').insertAdjacentHTML('beforeend', renderDProg()); }
  if (id === 'tables') renderTables();
  if (id === 'dlist') renderDList();
  if (id !== 'dplay') window.scrollTo(0, 0);
};
const _agg = agg;
agg = function(fn){
  const a = _agg(fn);
  if (fn.__heat){ const b = dAgg(g => fn.__heat(g)); a.s += b.s; a.w += b.w; a.acc = a.s + a.w ? a.s / (a.s + a.w) : null; }
  return a;
};
$('#exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify({app:'mir-dir-ihm', exported:new Date().toISOString(), v:S.v, cards:S.cards, conf:S.conf, days:S.days, dl:S.dl, dg:S.dg, set:S.set})], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `mir-dir-ihm-progress-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Progress exported');
};
$('#importFile').onchange = async e => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const o = JSON.parse(await file.text());
    if (!o || o.app !== 'mir-dir-ihm' || typeof o.cards !== 'object') throw 0;
    const n = Object.keys(o.cards).length, nd = Object.keys(o.dl || {}).length;
    if (!confirm(`Merge ${n} cards and ${nd} dialogues from this file? Where both have an entry, the more recent one wins.`)) return;
    for (const [id, st] of Object.entries(o.cards)){ const cur = S.cards[id]; if (!cur || (st.t || 0) > (cur.t || 0)) S.cards[id] = st; }
    for (const [id, st] of Object.entries(o.dg || {})){ const cur = S.dg[id]; if (!cur || (st.t || 0) > (cur.t || 0)) S.dg[id] = st; }
    for (const [id, st] of Object.entries(o.dl || {})){ const cur = S.dl[id]; if (!cur || (st.t || 0) > (cur.t || 0)) S.dl[id] = {...st, best: Math.max(st.best, cur ? cur.best : 0)}; }
    for (const [k, v] of Object.entries(o.conf || {})) S.conf[k] = Math.max(S.conf[k] || 0, v);
    for (const [k, v] of Object.entries(o.days || {})) S.days[k] = Math.max(S.days[k] || 0, v);
    save(); toast(`Merged ${n} cards, ${nd} dialogues`); show('home');
  } catch(err){ toast('That file isn’t a mir · dir · ihm export'); }
  e.target.value = '';
};
$('#resetBtn').onclick = () => {
  const n = Object.keys(S.cards).length + Object.keys(S.dl).length;
  if (!n) return toast('Nothing to reset yet');
  if (confirm(`Erase all progress (cards and dialogues)? Export first if you might want it back.`)){ S.cards = {}; S.conf = {}; S.days = {}; S.dl = {}; S.dg = {}; save(); dlg.close(); show('home'); toast('Progress reset'); }
};

show(location.hash === '#dialogues' ? 'dlist' : 'home');

// Register the service worker (only when served over http/https, not from a local file)
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
