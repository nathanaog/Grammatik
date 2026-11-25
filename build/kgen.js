// ===== Connectors: generator =====
function buildKonCards(){
  const out = [];
  const cap = x => x.charAt(0).toUpperCase() + x.slice(1);
  const pool0 = SUBJ.filter(s => !/^(der|die|das) /.test(s[0]) && s[1] !== '3n' && !(s[0] === 'sie' && s[1] === '3f'));
  const pron = (txt, code) => /^(ich|du|er|sie|es|wir|ihr|Sie)$/.test(txt) ? txt : NOM[code];
  // one clause in one of three orders: v2 (subject, verb …), vf (verb at the end), inv (verb first)
  const clause = (d, subj, code, t, order) => {
    const [fin, end] = verbParts(d.v, t, CI[code]);
    const w = order === 'v2' ? [subj, fin, d.m, end] : order === 'vf' ? [subj, d.m, verbFinal(d.v, t, CI[code])] : [fin, subj, d.m, end];
    return w.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  };
  const ORDER = {pos0:'v2', sub:'vf', adv:'inv'};
  for (const it of KI){
    const grp = KGRP[it.k];
    const mids = (it.A.m || '') + ' ' + ((it.B && it.B.m) || '');
    const pool = pool0.filter(s => !(/\b(mich|mir)\b/.test(mids) && s[1] === '1s') && !(/\b(dich|dir)\b/.test(mids) && (s[1] === '2s' || s[1] === '2p'))
      && !(/\b(uns)\b/.test(mids) && s[1] === '1p') && !(it.sg && (s[1] === '1p' || s[1] === '2p' || s[1] === '3p'))
      && !(/\b(dich|dir)\b/.test(mids) && s[1] === 'S') && !(it.B && Array.isArray(it.B.s) && it.B.s[1] === s[1]));
    const variants = Array.isArray(it.A.s) ? [0] : [0, 1];
    for (const [tA, tB] of it.tn) for (const vi of variants){
      const base = `${it.id}.${tA}-${tB}.${vi}`, h = hash(base);
      let aS, aC;
      if (Array.isArray(it.A.s)) [aS, aC] = it.A.s;
      else { const s = pool[(h >>> 4) % pool.length]; [aS, aC] = s; }
      let bS = '', bC = '';
      if (it.B){
        const bs = it.B.s || '=';
        if (Array.isArray(bs)) [bS, bC] = bs;
        else if (bs === '=') {
          // the clause that comes first gets the name, the later one the pronoun
          if (it.front && !Array.isArray(it.A.s)) { bS = aS; bC = aC; aS = pron(aS, aC); }
          else { bS = pron(aS, aC); bC = aC; }
        }
        else { const others = pool.filter(s => s[1] !== aC && s[0] !== aS && s[1] !== 'S'); const s = others[(h >>> 9) % others.length]; [bS, bC] = s; }
      }
      const conn = it.k, Conn = it.front ? cap(conn) : conn;
      const meta = {tA, tB, aS, aC, bS, bC};
      const alts = it.front ? it.alt.map(cap) : it.alt;
      // --- the two (or three) clauses
      const Av2 = clause(it.A, aS, aC, tA, 'v2'), Avf = clause(it.A, aS, aC, tA, 'vf'), Ainv = clause(it.A, aS, aC, tA, 'inv');
      let sentence, Bv2 = '', Bvf = '', Binv = '', Bright = '';
      if (it.frag) sentence = `${cap(Av2)}, \u0001 ${it.frag}.`;
      else {
        Bv2 = clause(it.B, bS, bC, tB, 'v2'); Bvf = clause(it.B, bS, bC, tB, 'vf'); Binv = clause(it.B, bS, bC, tB, 'inv');
        Bright = {v2:Bv2, vf:Bvf, inv:Binv}[ORDER[grp]];
        sentence = it.front ? `\u0001 ${Bvf}, ${Ainv}.` : `${cap(Av2)}, \u0001 ${Bright}.`;
      }
      // --- card 1: which connector?
      const ans = Conn;
      out.push({id: base, f: it.id, k:'kon', sub: grp, c:'x', p:0, r:'x', t: tA, g:'x', con: conn, meta,
        q: sentence.replace('\u0001', '____'), full: sentence.replace('\u0001', ans), a: ans, a0: ans, cap:false,
        ok: (it.ok || []).map(([x, n]) => [x, n]), opts: shuffleSeeded([ans, ...alts], h),
        steps: [`${conn} = ${KMEAN[conn]}`, KGNAME[grp]], hint: 'connector', why: it.w, gl: ''});
      if (it.frag) continue;
      // --- card 2: word order after the connector
      const mk = (id, q, right, opts, hint, why, target, steps) => {
        const uniq = [...new Set(opts)];
        if (uniq.length < 3) return;
        out.push({id, f: it.id, k:'kwo', sub: grp, c:'x', p:0, r:'x', t: tA, g:'x', con: conn, meta, target,
          q, full: q.replace('____', right), a: right, a0: right, cap:false, ok: [], opts: shuffleSeeded(uniq, hash(id)),
          steps: steps || [`${conn} → ${KGNAME[grp].replace(/^.* — /, '')}`], hint, why, gl: ''});
      };
      if (it.front){
        mk(`${base}.wB`, `${Conn} ____, ${Ainv}.`, Bvf, [Bvf, Bv2, Binv], `word order after “${Conn}”`,
          `${conn} sends the verb to the end of its clause`, 'B');
        mk(`${base}.wA`, `${Conn} ${Bvf}, ____.`, Ainv, [Ainv, Av2, Avf], 'the main clause after it',
          'when a whole clause comes first, it fills position 1 — so the main clause starts with its verb', 'A',
          [`${conn}-clause = position 1`, 'verb in position 2']);
      } else {
        const rule = {pos0:`${conn} doesn't count as a position, so the order stays normal: subject, then verb`,
          sub:`${conn} sends the verb to the end of its clause`, adv:`${conn} takes position 1 itself, so the verb comes straight after it`}[grp];
        mk(`${base}.wB`, `${cap(Av2)}, ${conn} ____.`, Bright, [Bright, Bv2, Bvf, Binv], `word order after “${conn}”`, rule, 'B');
      }
    }
  }
  return out;
}
