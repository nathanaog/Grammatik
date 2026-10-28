const fs = require('fs'), path = require('path');
const D = __dirname;
const src = ['data.js','gen.js','dlg.js'].map(f => fs.readFileSync(path.join(D,f),'utf8').replace(/if \(typeof module[\s\S]*$/,'')).join('\n');
const txt = fs.readdirSync(path.join(D,'dialogues')).filter(f => f.endsWith('.txt')).sort().map(f => fs.readFileSync(path.join(D,'dialogues',f),'utf8')).join('\n');
const {dialogues} = new Function('TXT', src + '\nreturn parseDialogues(TXT);')(txt);
let n = 0;
const flag = (d, l, msg) => { n++; console.log(`${d.id}: ${msg}\n    ${l.s.map(x => typeof x === 'string' ? x : (x.stem||'') + '[' + x.a + ':' + x.t.join('.') + ']').join('')}`); };
const caseOf = t => t[0] === 'adj' ? t[2] : t[1];
for (const d of dialogues) for (const l of d.lines){
  const segs = l.s;
  segs.forEach((g, i) => {
    if (typeof g === 'string') return;
    const c = caseOf(g.t), w = g.why || '';
    let implied = null;
    if (/subject|\+ Nom|sein \+ Nom/.test(w)) implied = 'N';
    else if (/\+ Gen|→ Gen/.test(w)) implied = 'G';
    else if (/(\+|→) Dat\b|is Dat|reflexive is Dat|so the reflexive is Dat/.test(w) && !/(\+|→) Akk/.test(w)) implied = 'D';
    else if (/(\+|→) Akk\b/.test(w) && !/(\+|→) Dat/.test(w)) implied = 'A';
    if (/the (thing|body part|car|money|Zeit|Sorgen|Gedanken)[^,]*is Akk/.test(w) && g.t[0]==='rx') implied = 'D';
    if (implied && implied !== c) flag(d, l, `case ${c} but reason "${w}" implies ${implied} (${g.a})`);
    // agreement: determiner followed directly by adjective gap
    const nx = segs[i+1], nx2 = segs[i+2];
    let adj = null;
    if (nx && typeof nx === 'string' && /^\s+[A-Za-zÄÖÜäöüß]*$/.test(nx) && nx2 && typeof nx2 !== 'string' && nx2.t[0] === 'adj') adj = nx2;
    if (nx && typeof nx !== 'string' && nx.t[0] === 'adj') adj = nx;
    if (adj && g.t[0] !== 'adj' && g.t[0] !== 'pp' && g.t[0] !== 'rx'){
      const gg = g.t[0] === 'pos' ? g.t[3] : g.t[2];
      if (adj.t[2] !== c || adj.t[3] !== gg) flag(d, l, `determiner ${g.a} (${c}.${gg}) vs adjective -${adj.a} (${adj.t[2]}.${adj.t[3]})`);
      const want = ['def','dies','jed','welch'].includes(g.t[0]) ? 'w' : 'm';
      if (adj.t[1] !== want) flag(d, l, `adjective type ${adj.t[1]} after ${g.a} (expected ${want})`);
    }
  });
}
console.log(n ? `${n} things to look at` : 'semantic check clean');
