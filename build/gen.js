// ===== Generator: frames × referent × tense → cards =====
const REFS = ['1s','2s','3m','3f','3n','1p','2p','3p','S'];
const CI = {'1s':0,'2s':1,'3m':2,'3f':2,'3n':2,'1p':3,'2p':4,'3p':5,'S':5};
const NOM = {'1s':'ich','2s':'du','3m':'er','3f':'sie','3n':'es','1p':'wir','2p':'ihr','3p':'sie','S':'Sie'};
const AKK = {'1s':'mich','2s':'dich','3m':'ihn','3f':'sie','3n':'es','1p':'uns','2p':'euch','3p':'sie','S':'Sie'};
const DAT = {'1s':'mir','2s':'dir','3m':'ihm','3f':'ihr','3n':'ihm','1p':'uns','2p':'euch','3p':'ihnen','S':'Ihnen'};
const RFA = {'1s':'mich','2s':'dich','3m':'sich','3f':'sich','3n':'sich','1p':'uns','2p':'euch','3p':'sich','S':'sich'};
const RFD = {'1s':'mir','2s':'dir','3m':'sich','3f':'sich','3n':'sich','1p':'uns','2p':'euch','3p':'sich','S':'sich'};
const POSS = {'1s':'mein','2s':'dein','3m':'sein','3f':'ihr','3n':'sein','1p':'unser','2p':'euer','3p':'ihr','S':'Ihr'};
const END = {N:{m:'',f:'e',n:'',p:'e'},A:{m:'en',f:'e',n:'',p:'e'},D:{m:'em',f:'er',n:'em',p:'en'},G:{m:'es',f:'er',n:'es',p:'er'}};
const CASEI = {N:0,A:1,D:2,G:3};
const EN = {
  pp:{'1s':'me','2s':'you (du)','3m':'him','3f':'her','3n':'it (das Kind)','1p':'us','2p':'you (ihr)','3p':'them','S':'you (Sie)'},
  pos:{'1s':'my','2s':'your (du)','3m':'his','3f':'her','3n':'its (das Kind)','1p':'our','2p':'your (ihr)','3p':'their','S':'your (Sie)'},
  rx:{'1s':'myself','2s':'yourself (du)','3m':'himself','3f':'herself','3n':'itself (das Kind)','1p':'ourselves','2p':'yourselves (ihr)','3p':'themselves','S':'yourself (Sie)'}
};
const REFNAME = {'1s':'ich','2s':'du','3m':'er','3f':'sie (she)','3n':'es','1p':'wir','2p':'ihr','3p':'sie (they)','S':'Sie'};
const TENSES = ['praes','praet','perf','plusq','fut','k2'];
const TNAME = {praes:'Präsens',praet:'Präteritum',perf:'Perfekt',plusq:'Plusquamperfekt',fut:'Futur I',k2:'Konjunktiv II'};
const CNAME = {N:'Nominativ',A:'Akkusativ',D:'Dativ',G:'Genitiv'};
const GNAME = {m:'masculine',f:'feminine',n:'neuter',p:'plural'};
const KNAME = {pp:'Pronoun',pos:'Possessive',rx:'Reflexive',art:'Article',adj:'Adjective ending'};

const SUBJ = [
  ['ich','1s',1],['du','2s',1],['er','3m',1],['sie','3f',1],['Jonas','3m'],['der Nachbar','3m'],['Herr Becker','3m'],
  ['Lena','3f'],['die Nachbarin','3f'],['Frau Yilmaz','3f'],['das Kind','3n'],
  ['wir','1p',1],['ihr','2p',1],['die Kollegen','3p'],['Tom und Mia','3p'],['Sie','S',1]
];
const GROUP = {'1s':1,'1p':1,'2s':2,'2p':2};

const AUX = {
  haben:{pr:['habe','hast','hat','haben','habt','haben'],pt:['hatte','hattest','hatte','hatten','hattet','hatten'],k2:['hätte','hättest','hätte','hätten','hättet','hätten'],pp:'gehabt',a:'h'},
  sein:{pr:['bin','bist','ist','sind','seid','sind'],pt:['war','warst','war','waren','wart','waren'],k2:['wäre','wärst','wäre','wären','wärt','wären'],pp:'gewesen',a:'s'},
};
const WERDEN = ['werde','wirst','wird','werden','werdet','werden'];
const WUERDE = ['würde','würdest','würde','würden','würdet','würden'];

const ADV = {
  e:{praes:['heute','jetzt','heute Abend'],praet:['gestern','letzte Woche','am Montag'],perf:['gestern','letzte Woche','am Montag'],plusq:['schon','vorher','bereits'],fut:['morgen','nächste Woche','bald'],k2:['dann','sicher','bestimmt']},
  s:{praes:['wirklich','eigentlich'],praet:['damals','früher'],perf:['damals','früher'],plusq:['damals','vorher'],fut:['sicher','bestimmt'],k2:['sicher','bestimmt']}
};
const FRONTABLE = {praes:1,praet:1,perf:1,fut:1};

function hash(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; }

function presForms(v){
  if (v.pr) return v.pr;
  const s = v.i.slice(0,-2);
  const E = /[dt]$/.test(s) ? 'e' : '';
  const du = v.p2 || (/(s|ß|z|x)$/.test(s) ? s+'t' : s+E+'st');
  return [s+'e', du, v.p3 || s+E+'t', v.i, s+E+'t', v.i];
}
function pretForms(v){
  const p = v.pt;
  if (/te$/.test(p)) return [p,p+'st',p,p+'n',p+'t',p+'n'];
  const E = /[dt]$/.test(p) ? 'e' : '';
  const du = /(s|ß|z|x)$/.test(p) ? p+'est' : p+E+'st';
  const ihr = /(s|ß|z|x)$/.test(p) ? p+'t' : p+E+'t';
  return [p,du,p,p+'en',ihr,p+'en'];
}
function verbParts(key, tense, ci){
  const v = V[key];
  const sp = v.special ? AUX[v.special] : null;
  const sep = v.sep || '';
  const inf = sep + v.i;
  const pp = sp ? sp.pp : v.pp;
  const aux = AUX[(sp ? sp.a : (v.a||'h')) === 's' ? 'sein' : 'haben'];
  switch(tense){
    case 'praes': return [sp ? sp.pr[ci] : presForms(v)[ci], sep];
    case 'praet': return [sp ? sp.pt[ci] : pretForms(v)[ci], sep];
    case 'perf':  return [aux.pr[ci], pp];
    case 'plusq': return [aux.pt[ci], pp];
    case 'fut':   return [WERDEN[ci], inf];
    case 'k2':    return sp ? [sp.k2[ci], ''] : [WUERDE[ci], inf];
  }
}
function possForm(stem, c, g){
  const e = END[c][g];
  if (stem === 'euer' && e) return 'eur' + e;
  return stem + e;
}
function shuffleSeeded(arr, seed){
  const a = arr.slice(); let s = seed || 1;
  for (let i=a.length-1;i>0;i--){ s = Math.imul(s ^ (s>>>15), 2246822507) >>> 0; const j = s % (i+1); [a[i],a[j]] = [a[j],a[i]]; }
  return a;
}
const NEIGH = {'1s':'1p','1p':'1s','2s':'2p','2p':'2s','3m':'3n','3n':'3m','3f':'3p','3p':'S','S':'3p'};

function options(f, r, ans, stem, seed){
  let set = [];
  if (f.k === 'pos'){
    set = ['','e','en','em','er','es'].map(e => (stem==='euer' && e) ? 'eur'+e : stem+e);
  } else {
    const n = NEIGH[r];
    const pool = f.k === 'rx'
      ? [RFA[r], RFD[r], 'sich', AKK[r], DAT[r], AKK[n], DAT[n], 'mich', 'mir', 'dich', 'dir']
      : [AKK[r], DAT[r], NOM[r], AKK[n], DAT[n], RFA[r], NOM[n], 'ihr', 'ihnen'];
    for (const x of pool){ if (!set.includes(x)) set.push(x); if (set.length >= 6) break; }
  }
  if (!set.includes(ans)) set[0] = ans;
  return shuffleSeeded([...new Set(set)], seed);
}

function buildCards(){
  const cards = [];
  for (const f of FR){
    const hf = hash(f.id);
    REFS.forEach((r, ri) => {
      if (r === '3n' && (f.x3n || (f.k === 'pp' && f.p))) return;
      TENSES.forEach((t, ti) => {
        const id = `${f.id}.${r}.${t}`;
        const h = hash(id);
        // --- subject ---
        let subj, scode, spron = false;
        let g = '', noun = '', ans, stem = '';
        if (f.k === 'pos'){
          const ns = NOUNS[f.n]; const gs = Object.keys(ns);
          g = gs[(ri + ti + hf) % gs.length];
          const variants = ns[g]; const nv = variants[(h >>> 3) % variants.length];
          noun = nv[CASEI[f.c]];
          stem = POSS[r];
          ans = possForm(stem, f.c, g);
        } else if (f.k === 'rx'){
          ans = f.c === 'A' ? RFA[r] : RFD[r];
        } else {
          ans = f.c === 'A' ? AKK[r] : DAT[r];
        }
        if (f.s){ subj = f.s[0]; scode = f.s[1]; }
        else if (f.subj === 'P'){ subj = '\u0001 ' + noun; scode = g === 'p' ? '3p' : '3m'; }
        else {
          let pool;
          if (f.k === 'rx') pool = SUBJ.filter(s => s[1] === r);
          else {
            pool = SUBJ.filter(s => s[1] !== '3n' && !(s[0] === 'sie' && s[1] === '3f'));
            if (f.k === 'pp') pool = pool.filter(s => s[1] !== r && !(GROUP[s[1]] && GROUP[s[1]] === GROUP[r]));
          }
          const s = pool[(h >>> 7) % pool.length];
          subj = s[0]; scode = s[1]; spron = !!s[2];
        }
        const ci = CI[scode];
        // --- adverb ---
        const adClass = f.ad || 'e';
        let adv = '';
        if (adClass !== 'n' && f.m.includes('{T}')){
          const list = ADV[adClass][t];
          const k = (h >>> 11) % (list.length + 1);
          adv = k < list.length ? list[k] : '';
        }
        const front = adv && adClass === 'e' && FRONTABLE[t] && spron && !f.s && f.subj !== 'P' && ((h >>> 17) % 10) < 4;
        // --- middle field ---
        let m0 = f.m;
        const vv = V[f.v];
        if (vv.sep && m0.endsWith(' ' + vv.sep)) m0 = m0.slice(0, -(vv.sep.length + 1));
        let mid = m0
          .replace('{X}', '\u0001')
          .replace('{P}', '\u0001 ' + noun)
          .replace('{R}', RFA[scode])
          .replace('{T}', front ? '' : adv);
        const [fin, end] = verbParts(f.v, t, ci);
        const parts = front ? [adv, fin, subj, mid, end] : [subj, fin, mid, end];
        let s = parts.join(' ').replace(/\s+/g, ' ').trim() + '.';
        const cap = x => x.charAt(0).toUpperCase() + x.slice(1);
        const full = cap(s.replace('\u0001', ans));
        let q = s.replace('\u0001', '____');
        q = q.startsWith('____') ? q : cap(q);
        const answerFirst = s.startsWith('\u0001');
        cards.push({
          id, f: f.id, k: f.k, c: f.c, p: f.p ? 1 : 0, r, t, g,
          q, full, a: answerFirst ? cap(ans) : ans, a0: ans, cap: answerFirst,
          hint: EN[f.k][r], gl: f.g, why: f.w, stem,
          opts: options(f, r, ans, stem, h).map(o => answerFirst ? cap(o) : o)
        });
      });
    });
  }
  return cards;
}
if (typeof module !== 'undefined') module.exports = { buildCards };
