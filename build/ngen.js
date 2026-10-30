// ===== Article & adjective-ending cards: generator =====
const ART_HINT = {def:'the', ind:'a / an', kein:'no (kein)', dies:'this', jed:'every'};
const ART_BASE = {def:'der / die / das', ind:'ein', kein:'kein', dies:'dieser', jed:'jeder'};
const ART_OPTS = {
  def:['der','die','das','den','dem','des'],
  ind:['ein','eine','einen','einem','einer','eines'],
  kein:['kein','keine','keinen','keinem','keiner','keines'],
  dies:['dieser','diese','dieses','diesen','diesem'],
  jed:['jeder','jede','jedes','jeden','jedem'],
};
const ADJ_OPTS = ['e','en','em','er','es'];
const APNAME = {w:'after der / dieser (weak)', m:'after ein / kein / mein (mixed)', s:'no article (strong)'};
const OWNERS = ['1s','2s','3m','3f','1p'];
const NGEN = {m:'masc.', f:'fem.', n:'neut.', p:'plural'};

function buildNounCards(){
  const out = [];
  const subjPool = SUBJ.filter(s => !/^(der|die|das) /.test(s[0]) && s[1] !== '3n' && !(s[0] === 'sie' && s[1] === '3f'));
  const cap = x => x.charAt(0).toUpperCase() + x.slice(1);
  for (const f of NF){
    const set = NS[f.n];
    const dts = f.dt || ALL_DT;
    const aps = f.ap || ['w','m','s'];
    const gens = ['m','f','n','p'].filter(g => set[g] && !(f.noN && g === 'n'));
    const tasks = [];
    for (const dt of dts) for (const g of gens){ if (g === 'p' && (dt === 'ind' || dt === 'jed')) continue; tasks.push({k:'art', dt, g}); }
    for (const ap of aps) for (const g of gens){
      if (ap === 's' && g !== 'p' && !f.mass) continue;
      if (ap === 'm'){
        const mOpts = mixedDets(f, set, dts, g);
        if (!mOpts.length) continue;
      }
      tasks.push({k:'adj', ap, g});
    }
    for (const task of tasks) TENSES.forEach(t => {
      const id = task.k === 'art' ? `${f.id}.${task.dt}.${task.g}.${t}` : `${f.id}.adj-${task.ap}.${task.g}.${t}`;
      const h = hash(id), g = task.g;
      const variants = set[g]; const nv = variants[(h >>> 3) % variants.length];
      const noun = nv[CASEI[f.c]];
      const adjs = nv[4] || set.adj; const adj = adjs[(h >>> 5) % adjs.length];
      let phrase, ans, detTxt = '', detKind = '';
      if (task.k === 'art'){
        ans = expectForm([task.dt, f.c, g]);
        phrase = '\u0001 ' + noun; detKind = task.dt;
      } else {
        ans = ADJ[task.ap][f.c][g];
        if (task.ap === 'w'){ detKind = (h >>> 9) % 3 === 0 ? 'dies' : 'def'; detTxt = expectForm([detKind, f.c, g]); }
        else if (task.ap === 'm'){
          const opts = mixedDets(f, set, dts, g); detKind = opts[(h >>> 9) % opts.length];
          if (detKind === 'poss'){ const r = OWNERS[(h >>> 13) % OWNERS.length]; detTxt = possForm(POSS[r], f.c, g); }
          else detTxt = expectForm([detKind, f.c, g]);
        }
        phrase = (detTxt ? detTxt + ' ' : '') + adj + '\u0001 ' + noun;
      }
      // subject
      let subj, scode, spron = false;
      if (f.s){ subj = f.s[0]; scode = f.s[1]; if (f.agreeP && g === 'p') scode = '3p'; }
      else if (f.subj === 'P'){ subj = phrase; scode = g === 'p' ? '3p' : '3m'; }
      else { const s = subjPool[(h >>> 7) % subjPool.length]; subj = s[0]; scode = s[1]; spron = !!s[2]; }
      const ci = CI[scode];
      const adClass = f.ad || 'e';
      let adv = '';
      if (adClass !== 'n' && f.m.includes('{T}')){
        const list = ADV[adClass][t]; const k = (h >>> 11) % (list.length + 1);
        adv = k < list.length ? list[k] : '';
      }
      const front = adv && adClass === 'e' && FRONTABLE[t] && spron && !f.s && f.subj !== 'P' && ((h >>> 17) % 10) < 4;
      let mid = f.m.replace('{N}', phrase).replace('{R}', RFA[scode]).replace('{T}', front ? '' : adv);
      const [fin, end] = verbParts(f.v, t, ci);
      const parts = front ? [adv, fin, subj, mid, end] : [subj, fin, mid, end];
      const s = parts.join(' ').replace(/\s+/g, ' ').trim() + '.';
      const full = cap(s.replace('\u0001', ans));
      let q = s.replace('\u0001', '____');
      const answerFirst = s.startsWith('\u0001');
      if (!answerFirst) q = cap(q);
      let opts;
      if (task.k === 'art'){ opts = ART_OPTS[task.dt].slice(); if (!opts.includes(ans)) opts.push(ans); opts = shuffleSeeded(opts, h).map(o => answerFirst ? cap(o) : o); }
      else opts = shuffleSeeded(ADJ_OPTS, h);
      out.push({
        id, f: f.id, k: task.k, c: f.c, p: f.p ? 1 : 0, r: 'x', t, g,
        dt: task.k === 'art' ? task.dt : '', ap: task.k === 'adj' ? task.ap : '', det: detTxt, detKind,
        q, full, a: answerFirst ? cap(ans) : ans, a0: ans, cap: answerFirst,
        hint: task.k === 'art' ? ART_HINT[task.dt] : 'the adjective ending',
        noun: nv[0], adj, stem: task.k === 'adj' ? adj : '', gl: f.g, why: f.w, opts
      });
    });
  }
  return out;
}
function mixedDets(f, set, dts, g){
  const o = [];
  if (g !== 'p' && dts.includes('ind')) o.push('ind');
  if (dts.includes('kein')) o.push('kein');
  if (set.own) o.push('poss');
  return o;
}
