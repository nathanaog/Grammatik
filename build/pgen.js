// ===== Prepositions: generator =====
// Contractions. MUST: Germans nearly always contract (uncontracted is accepted with a note).
// OPT: contracted form is common in speech (canonical answer stays uncontracted; contracted is accepted).
const CONTR = {'an dem':'am','an das':'ans','in dem':'im','in das':'ins','von dem':'vom','zu dem':'zum','zu der':'zur','bei dem':'beim',
  'auf das':'aufs','um das':'ums','für das':'fürs','durch das':'durchs','über das':'übers','vor das':'vors','hinter das':'hinters','unter das':'unters'};
const MUST = new Set(['am','im','vom','zum','zur','beim','ins']);
const UNCONTR = Object.fromEntries(Object.entries(CONTR).map(([k, v]) => [v, k]));
const PREP_ALT = {auf:['an','für','über','um'], an:['auf','über','von','um'], 'über':['von','auf','um','an'], 'für':['auf','um','an','über'],
  um:['für','über','auf','an'], mit:['bei','zu','von'], von:['über','aus','nach','an'], vor:['von','an','über'], nach:['von','über','zu'],
  zu:['bei','an','mit'], bei:['mit','zu','von'], in:['an','auf','für']};
const PKNAME = {fix:'verb / adjective + preposition', place:'places: where / where to / from where', time:'time'};
const PXNAME = {da:'da- words (darauf)', pers:'person + pronoun (auf ihn)', wo:'wo- questions (Worauf?)', wen:'person questions (Auf wen?)'};

function joinPrep(p, det){ const k = p + ' ' + det; return CONTR[k] || k; }
// in model sentences use only the contractions written German always uses (zum, im…), not aufs / ans
function stdPrep(p, det){ const k = p + ' ' + det; return CONTR[k] && MUST.has(CONTR[k]) ? CONTR[k] : k; }
// canonical gap answer for preposition + article, and the accepted alternative
function prepChunk(p, det){
  const k = p + ' ' + det, c = CONTR[k];
  if (!c) return {a:k, ok:[]};
  if (MUST.has(c)) return {a:c, ok:[[k, `Correct, but Germans almost always say “${c}” here.`]]};
  return {a:k, ok:[[c, `Fine — “${c}” is the everyday short form.`]]};
}
function detKind(det){
  if (['der','die','das','den','dem','des'].includes(det)) return {k:'def'};
  const m = det.match(/^(mein|dein|sein|ihr|unser|eur|euer|Ihr)/); if (m) return {k:'poss', st: m[1] === 'eur' ? 'euer' : m[1]};
  if (/^kein/.test(det)) return {k:'kein'};
  if (/^ein/.test(det)) return {k:'ind'};
  return {k:'?'};
}
function detIn(det, g, c){
  const d = detKind(det);
  if (d.k === 'poss') return possForm(d.st, c, g);
  if (d.k === 'def') return DEF[c][g];
  return expectForm([d.k, c, g]);
}
const daForm = p => 'da' + (/^[aeiouäöü]/.test(p) ? 'r' : '') + p;
const woForm = p => 'wo' + (/^[aeiouäöü]/.test(p) ? 'r' : '') + p;
const PRON3 = {m:'3m', f:'3f', n:'3n', p:'3p'};
const vpLabel = e => {
  const v = V[e.v], inf = (v.sep || '') + v.i;
  const pre = e.rx === 'D' ? 'sich ' : e.rx ? 'sich ' : '';
  const rest = e.m.replace('{O}', '').trim();
  return pre + (rest ? rest + ' ' : '') + inf + ' ' + e.p;
};

function buildPrepCards(){
  const out = [];
  const subjPool = SUBJ.filter(s => !/^(der|die|das) /.test(s[0]) && s[1] !== '3n' && !(s[0] === 'sie' && s[1] === '3f'));
  const cap = x => x.charAt(0).toUpperCase() + x.slice(1);
  const OTHER = {A:'D', D:'A'};

  // sentence assembly shared by fixed-preposition and place/time cards
  function sentence(f, h, t, mid0, rx){
    let subj, scode, spron = false;
    if (f.s){ subj = f.s[0]; scode = f.s[1]; }
    else { const s = subjPool[(h >>> 7) % subjPool.length]; subj = s[0]; scode = s[1]; spron = !!s[2]; }
    const adClass = f.ad || 'e';
    let adv = '';
    if (adClass !== 'n' && mid0.includes('{T}')){
      const list = ADV[adClass][t]; const k = (h >>> 11) % (list.length + 1);
      adv = k < list.length ? list[k] : '';
    }
    const front = adv && adClass === 'e' && FRONTABLE[t] && spron && !f.s && ((h >>> 17) % 10) < 4;
    const R = rx === 'D' ? RFD[scode] : RFA[scode];
    const mid = mid0.replace('{R}', R).replace('{T}', front ? '' : adv);
    const [fin, end] = verbParts(f.v, t, CI[scode]);
    const parts = front ? [adv, fin, subj, mid, end] : [subj, fin, mid, end];
    return parts.join(' ').replace(/\s+/g, ' ').trim() + '.';
  }
  function push(card, s, ans){
    card.full = cap(s.replace('\u0001', ans));
    card.q = cap(s.replace('\u0001', '____'));
    card.a = ans; card.a0 = ans; card.cap = false;
    out.push(card);
  }

  // ---- 1) fixed prepositions: blank = preposition (+ article)
  for (const e of VP){
    const objs = (e.th || []).map(o => ({o, person:false})).concat((e.pe || []).map(o => ({o:[o[0].replace(/^dein/, 'mein'), o[1], o[2]], person:true})));
    objs.forEach(({o, person}, oi) => TENSES.forEach(t => {
      const id = `${e.id}.o${oi}.${t}`, h = hash(id);
      const [det, noun, g] = o;
      const {a, ok} = prepChunk(e.p, det);
      const mid0 = (e.rx ? '{R} ' : '') + '{T} ' + e.m.replace('{O}', '\u0001 ' + noun);
      const s = sentence(e, h, t, mid0, e.rx);
      // distractors: same preposition wrong case, look-alike prepositions in either case
      const oc = OTHER[e.c], cand = [joinPrep(e.p, detIn(det, g, oc))];
      for (const p2 of (PREP_ALT[e.p] || [])) cand.push(joinPrep(p2, det), joinPrep(p2, detIn(det, g, oc)));
      const okSet = new Set([a, ...ok.map(x => x[0])]);
      const opts = shuffleSeeded([a, ...[...new Set(cand)].filter(x => !okSet.has(x)).slice(0, 5)], h);
      const steps = [`${vpLabel(e)} + ${CNAME[e.c]}`];
      if (CONTR[e.p + ' ' + det]) steps.push(`${e.p} + ${det} → ${CONTR[e.p + ' ' + det]}`);
      push({id, f:e.id, k:'prep', sub:'fix', c:e.c, p:1, r:'x', t, g, prep:e.p, ok, opts, steps,
        hint: e.h, gl: `${vpLabel(e)} — to ${e.h}`, why: `${vpLabel(e)} always takes ${CNAME[e.c]}${person ? '' : ''}`}, s, a);
    }));
  }

  // ---- 2) places and time: hand-written answers
  for (const f of PT){
    const tns = f.tn || TENSES;
    tns.forEach(t => {
      const id = `${f.id}.${t}`, h = hash(id);
      const mid0 = f.m.replace('{P}', '\u0001');
      const s = sentence(f, h, t, mid0, f.v === 'setzen' ? 1 : 0);
      const okList = (f.ok || []).map(x => [x, UNCONTR[f.a] === x ? `Correct, but Germans almost always say “${f.a}” here.` : 'Also correct.']);
      const opts = shuffleSeeded([f.a, ...f.alt.filter(x => x !== f.a && !(f.ok || []).includes(x)).slice(0, 5)], h);
      const steps = [];
      if (UNCONTR[f.a]) steps.push(`${UNCONTR[f.a]} → ${f.a}`);
      push({id, f:f.id, k:'prep', sub:f.k, c:f.c, p:1, r:'x', t, g:'x', prep:f.pr, ok:okList, opts, steps,
        hint: f.h, gl: '', why: f.w}, s, f.a);
    });
  }

  // ---- 3) preposition + pronoun: short question-and-answer exchanges (present tense)
  for (const e of VP){
    const [duF, sep] = verbParts(e.v, 'praes', 1), [ichF] = verbParts(e.v, 'praes', 0);
    const rxDu = e.rx === 'D' ? ' dir' : e.rx ? ' dich' : '', rxIch = e.rx === 'D' ? ' mir' : e.rx ? ' mich' : '';
    const tail = sep ? ' ' + sep : '';
    const label = vpLabel(e), wq = e.c === 'A' ? 'wen' : 'wem';
    const mk = (sub, oi, o, person) => {
      const id = `${e.id}.${sub}.${oi}`, h = hash(id);
      const [det, noun, g] = o;
      const objQ = stdPrep(e.p, det) + ' ' + noun;
      const nein = !e.nn && (h >>> 5) % 10 < 3;
      let pre = '', line, post = '', ans, opts, steps, hint, ok = [];
      if (sub === 'da' || sub === 'pers'){
        pre = `${cap(duF)} du${rxDu} ${e.m.replace('{O}', objQ)}${tail}?`;
        line = `${nein ? 'Nein' : 'Ja'}, ich ${ichF}${rxIch} ${nein ? 'nicht ' : ''}${e.m.replace('{O}', '\u0001')}${tail}.`;
        if (sub === 'da'){
          ans = daForm(e.p);
          const prn = (e.c === 'A' ? AKK : DAT)[PRON3[g]];
          const drs = {daran:'dran', darauf:'drauf', darüber:'drüber', darum:'drum', darin:'drin'};
          if (drs[ans]) ok.push([drs[ans], `Fine in speech — written German uses “${ans}”.`]);
          opts = [ans, `${e.p} ${prn}`, `${e.p} es`, woForm(e.p), ...(PREP_ALT[e.p] || []).slice(0, 2).map(daForm)];
          steps = [`a thing (${det} ${noun})`, 'da + (r) + preposition', ans];
          hint = `it — ${det} ${noun}`;
        } else {
          const prn = (e.c === 'A' ? AKK : DAT)[PRON3[g]], wrongCase = (e.c === 'A' ? DAT : AKK)[PRON3[g]];
          ans = `${e.p} ${prn}`;
          const otherG = {m:'f', f:'m', n:'m', p:'m'}[g];
          opts = [ans, `${e.p} ${wrongCase}`, daForm(e.p), `${e.p} ${(e.c === 'A' ? AKK : DAT)[PRON3[otherG]]}`, ...(PREP_ALT[e.p] || []).slice(0, 2).map(p2 => `${p2} ${prn}`)];
          steps = [`a person (${det} ${noun})`, `${e.p} + ${CNAME[e.c]}`, `${EN.pp[PRON3[g]]} → ${prn}`, ans];
          hint = `${EN.pp[PRON3[g]]} — ${det} ${noun}`;
        }
      } else {
        const rest = e.m.replace('{O}', '').trim();
        line = `\u0001 ${duF} du${rxDu}${rest ? ' ' + rest : ''}${tail}?`;
        post = cap(stdPrep(e.p, det.replace(/^dein/, 'mein')) + ' ' + noun) + '.';
        if (sub === 'wo'){
          ans = cap(woForm(e.p));
          ok.push([`${cap(e.p)} was`, `Common in speech — written German uses “${ans}”.`]);
          opts = [ans, `${cap(e.p)} ${wq}`, cap(daForm(e.p)), ...(PREP_ALT[e.p] || []).slice(0, 2).map(p2 => cap(woForm(p2))), `${cap(e.p)} ${wq === 'wen' ? 'wem' : 'wen'}`];
          steps = ['asking about a thing', 'wo + (r) + preposition', ans];
          hint = 'question word (asking about a thing)';
        } else {
          ans = `${cap(e.p)} ${wq}`;
          opts = [ans, `${cap(e.p)} ${wq === 'wen' ? 'wem' : 'wen'}`, cap(woForm(e.p)), `${cap(e.p)} wer`, ...(PREP_ALT[e.p] || []).slice(0, 2).map(p2 => `${cap(p2)} ${wq}`)];
          steps = ['asking about a person', `${e.p} + ${CNAME[e.c]}`, `who → ${wq}`, ans];
          hint = 'question word (asking about a person)';
        }
      }
      opts = shuffleSeeded([...new Set(opts)].slice(0, 6), h);
      const full = line.replace('\u0001', ans);
      out.push({id, f:e.id, k:'prpr', sub, c:e.c, p:1, r:'x', t:'x', g, prep:e.p, ok, opts, steps,
        pre, post, q: cap(line.replace('\u0001', '____')), full: [pre, cap(full), post].filter(Boolean).join(' '), a: ans, a0: ans, cap: false,
        hint, gl: `${label} — to ${e.h}`, why: sub === 'da' || sub === 'wo'
          ? `${label} + ${CNAME[e.c]}. For things German uses ${sub === 'da' ? 'da' : 'wo'}(r) + preposition, not the preposition + a pronoun`
          : `${label} + ${CNAME[e.c]}. For people: preposition + ${sub === 'pers' ? 'personal pronoun' : 'wen / wem'} in that case`});
    };
    (e.th || []).forEach((o, i) => { mk('da', i, o, false); mk('wo', i, o, false); });
    (e.pe || []).forEach((o, i) => { mk('pers', i, o, true); mk('wen', i, o, true); });
  }
  return out;
}
