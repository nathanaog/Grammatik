// ===== Relative pronouns: generator =====
const REL = {N:{m:'der',f:'die',n:'das',p:'die'}, A:{m:'den',f:'die',n:'das',p:'die'},
             D:{m:'dem',f:'der',n:'dem',p:'denen'}, G:{m:'dessen',f:'deren',n:'dessen',p:'deren'}};
const REL_ALL = ['der','die','das','den','dem','denen','dessen','deren'];
const RKNAME = {plain:'subject / object (der, den, dem…)', prep:'after a preposition (mit dem, in der…)', gen:'whose (dessen / deren)'};
const RTENSES = ['praes','praet','perf','plusq','fut'];

// verb cluster at the end of a subordinate clause: anruft, angerufen hat, anrufen wird…
function verbFinal(key, t, ci){
  const [fin, rest] = verbParts(key, t, ci);
  if (t === 'praes' || t === 'praet') return (rest || '') + fin;
  return rest ? rest + ' ' + fin : fin;
}

function buildRelCards(){
  const out = [];
  const pool = SUBJ.filter(s => !/^(der|die|das) /.test(s[0]) && s[1] !== '3n' && s[1] !== 'S' && !(s[0] === 'sie' && s[1] === '3f'));
  const cap = x => x.charAt(0).toUpperCase() + x.slice(1);
  for (const f of RF){
    const set = RN[f.cls];
    const gens = ['m','f','n','p'].filter(g => set[g]);
    // keep the clause's own subject from clashing with mir/dir/uns in the clause
    const subjOK = pool.filter(s => !(/\b(mir|mich)\b/.test(f.m) && s[1] === '1s') && !(/\b(dir|dich)\b/.test(f.m) && (s[1] === '2s' || s[1] === '2p')) && !(/\buns\b/.test(f.m) && s[1] === '1p'));
    const mains = RMAIN[f.cls].filter(mn => mn[3] !== f.v);
    for (const g of gens) for (const t of (f.tn || RTENSES)){
      const id = `${f.id}.${g}.${t}`, h = hash(id);
      const nv = set[g][(h >>> 3) % set[g].length];
      const mn = mains[(h >>> 6) % mains.length], punct = mn[2];
      const main = (g === 'p' ? mn[1] : mn[0]).replace(/\{([NAD])\}/, (_, c) => DEF[c][g] + ' ' + nv[CASEI[c]])
        .replace(/\b(von|zu|in|an|bei) (dem|der) /, (all, p, d) => (CONTR[p + ' ' + d] && MUST.has(CONTR[p + ' ' + d]) ? CONTR[p + ' ' + d] : p + ' ' + d) + ' ');
      const ans = REL[f.c][g];
      let clause, subjTxt = '';
      if (f.role === 'subj'){
        clause = ['\u0001', f.m, verbFinal(f.v, t, CI[g === 'p' ? '3p' : '3m'])];
      } else if (f.role === 'gen'){
        clause = ['\u0001', f.gp[0], f.m, verbFinal(f.v, t, CI[f.gp[1]])];
      } else {
        const s = f.s || subjOK[(h >>> 9) % subjOK.length];
        subjTxt = s[0];
        const mid = f.m.replace('{S}', s[0]);
        clause = [f.p || '', '\u0001', mid.includes(s[0]) ? mid : s[0] + ' ' + mid, verbFinal(f.v, t, CI[s[1]])];
      }
      const sentence = (main + ', ' + clause.filter(Boolean).join(' ')).replace(/\s+/g, ' ').trim() + punct;
      const q = sentence.replace('\u0001', '____'), full = sentence.replace('\u0001', ans);
      // options: the right form, the same case for the other genders, the same gender in the other cases
      const cands = [...['m','f','n','p'].map(x => REL[f.c][x]), ...['N','A','D','G'].map(c => REL[c][g]), ...REL_ALL];
      const opts = shuffleSeeded([...new Set([ans, ...cands])].slice(0, 6), h);
      const ok = f.c === 'G' ? [] : [['welch' + DER_END[f.c][g], 'Correct, but formal — in speech it\'s der / die / das.']];
      const ante = `${DEF.N[g]} ${nv[0]}`;
      const sub = f.role === 'gen' ? 'gen' : f.role === 'prep' ? 'prep' : 'plain';
      const V0 = V[f.v], inf = (V0.sep || '') + V0.i;
      const roleTxt = f.role === 'subj' ? 'subject of the clause' : f.role === 'gen' ? '"whose"' : f.role === 'prep' ? `after ${f.p}` : `object of ${inf}`;
      out.push({id, f:f.id, k:'rel', sub, c:f.c, p: f.p ? 1 : 0, r:'x', t, g, prep: f.p || '',
        q: cap(q), full: cap(full), a: ans, a0: ans, cap:false, ok, opts,
        steps: [`refers to ${ante} → ${GNAME[g]}`, roleTxt, CNAME[f.c], ans],
        hint: f.role === 'gen' ? 'whose' : 'who / which / that', why: f.w, gl: ''});
    }
  }
  return out;
}
