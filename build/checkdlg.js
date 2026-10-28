// node checkdlg.js  → parses dialogues/*.txt, prints errors and stats
const fs = require('fs'), path = require('path');
const D = __dirname;
const src = ['data.js','gen.js','dlg.js'].map(f => fs.readFileSync(path.join(D,f),'utf8').replace(/if \(typeof module[\s\S]*$/,'')).join('\n');
const txt = fs.readdirSync(path.join(D,'dialogues')).filter(f => f.endsWith('.txt')).sort().map(f => fs.readFileSync(path.join(D,'dialogues',f),'utf8')).join('\n');
const run = new Function('TXT', src + '\nreturn parseDialogues(TXT);');
const {dialogues, errs} = run(txt);
errs.forEach(e => console.log('ERR', e));
const cat = {}; let gaps = 0;
const DC = {posp:'pos',pp:'pp',rx:'rx',pos:'pos',def:'art',ind:'art',kein:'art',dies:'art',welch:'art',jed:'art',adj:'adj'};
for (const d of dialogues) for (const l of d.lines) for (const s of l.s) if (typeof s !== 'string'){ gaps++; cat[DC[s.t[0]]] = (cat[DC[s.t[0]]]||0)+1; }
const reg = {}; dialogues.forEach(d => reg[d.meta.reg] = (reg[d.meta.reg]||0)+1);
const grp = {}; dialogues.forEach(d => grp[d.meta.grp] = (grp[d.meta.grp]||0)+1);
console.log(`${dialogues.length} dialogues, ${gaps} gaps`, cat, reg, grp, errs.length ? `${errs.length} ERRORS` : 'OK');
if (process.argv[2] === '--json') fs.writeFileSync(path.join(D,'dialogues.json'), JSON.stringify(dialogues));
