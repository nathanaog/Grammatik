const fs = require('fs'), path = require('path'); const D = __dirname;
const src = ['data.js','gen.js','dlg.js'].map(f => fs.readFileSync(path.join(D,f),'utf8').replace(/if \(typeof module[\s\S]*$/,'')).join('\n');
const txt = fs.readdirSync(path.join(D,'dialogues')).filter(f => f.endsWith('.txt')).sort().map(f => fs.readFileSync(path.join(D,'dialogues',f),'utf8')).join('\n');
const {dialogues} = new Function('TXT', src + '\nreturn parseDialogues(TXT);')(txt);
const out = [];
for (const d of dialogues){ out.push(`## ${d.id}`); for (const l of d.lines) out.push(`${l.w}: ` + l.s.map(x => typeof x === 'string' ? x : (x.stem||'') + x.a.toUpperCase()).join('')); }
fs.writeFileSync(process.argv[2], out.join('\n'));
