// ===== Dialogues: tables, parser, validator =====
// Gap syntax inside a line:  [answer|tag|why|hint]   (why and hint optional; empty allowed)
// Adjective endings: write the stem straight before the bracket: warm[en|adj.m.A.m]
// Tags:
//   pp.C.R        personal pronoun (C = N/A/D, R = 1s 2s 3m 3f 3n 1p 2p 3p S)
//   rx.C.R        reflexive (C = A/D)
//   pos.C.R.G     possessive (G = m f n p)
//   posp.C.R.G    standalone possessive: meiner, meins, Ihrer ("Ist das Ihrer?")
//   def.C.G  ind.C.G  kein.C.G  dies.C.G  welch.C.G  jed.C.G     articles / determiners
//   adj.T.C.G     adjective ending, T = w (after der/dies/jed/welch), m (after ein/kein/possessive), s (no article)
const DEF = {N:{m:'der',f:'die',n:'das',p:'die'},A:{m:'den',f:'die',n:'das',p:'die'},D:{m:'dem',f:'der',n:'dem',p:'den'},G:{m:'des',f:'der',n:'des',p:'der'}};
const DER_END = {N:{m:'er',f:'e',n:'es',p:'e'},A:{m:'en',f:'e',n:'es',p:'e'},D:{m:'em',f:'er',n:'em',p:'en'},G:{m:'es',f:'er',n:'es',p:'er'}};
const ADJ = {
  w:{N:{m:'e',f:'e',n:'e',p:'en'},A:{m:'en',f:'e',n:'e',p:'en'},D:{m:'en',f:'en',n:'en',p:'en'},G:{m:'en',f:'en',n:'en',p:'en'}},
  m:{N:{m:'er',f:'e',n:'es',p:'en'},A:{m:'en',f:'e',n:'es',p:'en'},D:{m:'en',f:'en',n:'en',p:'en'},G:{m:'en',f:'en',n:'en',p:'en'}},
  s:{N:{m:'er',f:'e',n:'es',p:'e'},A:{m:'en',f:'e',n:'es',p:'e'},D:{m:'em',f:'er',n:'em',p:'en'},G:{m:'en',f:'er',n:'en',p:'er'}},
};
const ENN = {'1s':'I','2s':'you (du)','3m':'he','3f':'she','3n':'it','1p':'we','2p':'you (ihr)','3p':'they','S':'you (Sie)'};
const ATYPE = {w:'after der / dieser (weak)', m:'after ein / kein / mein (mixed)', s:'no article before it (strong)'};
const DCAT = {posp:'pos',pp:'pp',rx:'rx',pos:'pos',def:'art',ind:'art',kein:'art',dies:'art',welch:'art',jed:'art',adj:'adj'};
const DCATNAME = {pp:'Pronouns',pos:'Possessives',rx:'Reflexives',art:'Articles',adj:'Adjective endings'};
const DETNAME = {def:'der/die/das',ind:'ein',kein:'kein',dies:'dieser',welch:'welcher',jed:'jeder'};

function expectForm(t){
  const [k, c, a, b] = t;
  switch(k){
    case 'pp': return ({N:NOM, A:AKK, D:DAT})[c]?.[a];
    case 'rx': return ({A:RFA, D:RFD})[c]?.[a];
    case 'pos': return POSS[a] ? possForm(POSS[a], c, b) : undefined;
    case 'posp': { const st = POSS[a]; if (!st) return; const e = DER_END[c][b]; return (st === 'euer' ? 'eur' : st) + e; }
    case 'def': return DEF[c]?.[a];
    case 'ind': return a === 'p' ? undefined : ({N:{m:'ein',f:'eine',n:'ein'},A:{m:'einen',f:'eine',n:'ein'},D:{m:'einem',f:'einer',n:'einem'},G:{m:'eines',f:'einer',n:'eines'}})[c]?.[a];
    case 'kein': return 'kein' + ({N:{m:'',f:'e',n:'',p:'e'},A:{m:'en',f:'e',n:'',p:'e'},D:{m:'em',f:'er',n:'em',p:'en'},G:{m:'es',f:'er',n:'es',p:'er'}})[c][a];
    case 'dies': return 'dies' + DER_END[c][a];
    case 'welch': return 'welch' + DER_END[c][a];
    case 'jed': return 'jed' + DER_END[c][a];
    case 'adj': return ADJ[c]?.[a]?.[b];
  }
}
function altForms(t){
  const f = expectForm(t); const out = [f];
  if (t[0] === 'posp' && t[3] === 'n' && (t[1] === 'N' || t[1] === 'A') && ['mein','dein','sein'].includes(POSS[t[2]])) out.push(POSS[t[2]] + 's');
  return out;
}
function tagParts(tag){
  const [core, hint] = tag.split('=');
  return {t: core.split('.'), hint};
}
function parseDialogues(src){
  const out = [], errs = [];
  let d = null;
  const lines = src.split('\n');
  lines.forEach((raw, ln) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    if (line.startsWith('===')){ d = {id: line.slice(3).trim(), meta:{}, cast:{}, lines:[]}; out.push(d); return; }
    if (!d){ errs.push(`line ${ln+1}: text before first ===`); return; }
    let m = line.match(/^(t|en|reg|grp|cast):\s*(.*)$/);
    if (m){
      if (m[1] === 'cast') m[2].split('|').forEach(p => { const [code, ...name] = p.trim().split(/\s+/); d.cast[code] = name.join(' '); });
      else d.meta[m[1]] = m[2];
      return;
    }
    m = line.match(/^([A-Z][A-Za-z0-9]?):\s*(.*)$/);
    if (!m){ errs.push(`${d.id} line ${ln+1}: can't parse "${line}"`); return; }
    const who = m[1], text = m[2];
    if (!d.cast[who]) errs.push(`${d.id}: unknown speaker ${who}`);
    const segs = [];
    let last = 0; const re = /([A-Za-zÄÖÜäöüß]*)\[([^\]]+)\]/g; let g;
    while ((g = re.exec(text))){
      const [all, stemRaw, body] = g;
      const [ans, tag = '', why = '', hint = ''] = body.split('|');
      const {t, hint: h2} = tagParts(tag);
      const isAdj = t[0] === 'adj';
      const stem = isAdj ? stemRaw : '';
      const pre = text.slice(last, g.index) + (isAdj ? '' : stemRaw);
      if (pre) segs.push(pre);
      const exp = expectForm(t);
      if (!DCAT[t[0]]) errs.push(`${d.id}: bad tag "${tag}" in "${all}"`);
      else if (exp === undefined) errs.push(`${d.id}: tag "${tag}" has no form (in "${all}")`);
      else if (!altForms(t).some(x => x.toLowerCase() === ans.toLowerCase())) errs.push(`${d.id}: "${ans}" but tag ${tag} gives "${exp}"  — ${text}`);
      else if ((t[0] === 'pp' || t[0] === 'pos' || t[0] === 'posp') && t[2] === 'S' && ans !== exp) errs.push(`${d.id}: formal form must be capitalised: ${ans}`);
      if (isAdj && !stem) errs.push(`${d.id}: adjective gap without stem: ${all}`);
      segs.push({a: ans, t, why, hint: hint || h2 || '', stem});
      last = g.index + all.length;
    }
    if (last < text.length) segs.push(text.slice(last));
    d.lines.push({w: who, s: segs});
  });
  for (const x of out){
    if (!x.meta.t) errs.push(`${x.id}: missing title`);
    if (!['Sie','du','mixed'].includes(x.meta.reg)) errs.push(`${x.id}: reg must be Sie/du/mixed`);
  }
  const ids = out.map(x => x.id); ids.forEach((id, i) => { if (ids.indexOf(id) !== i) errs.push(`duplicate id ${id}`); });
  return {dialogues: out, errs};
}
