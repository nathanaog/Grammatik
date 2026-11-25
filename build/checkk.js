// Independent check of connector cards: word order judged from a hand-written group table
const fs=require('fs'),path=require('path');const D=__dirname;
const src=['data.js','gen.js','dlg.js','ndata.js','ngen.js','pdata.js','pgen.js','rdata.js','rgen.js','kdata.js','kgen.js'].map(f=>fs.readFileSync(path.join(D,f),'utf8').replace(/if \(typeof module[\s\S]*$/,'')).join('\n');
const {cards,KI,verbParts,CI}=new Function(src+'\nreturn {cards:buildKonCards(), KI, verbParts, CI};')();
const G={pos0:['und','aber','oder','sondern','denn'],sub:['weil','da','obwohl','dass','ob','wenn','als','damit','bevor','nachdem','während','bis','seit','seitdem','sobald'],adv:['deshalb','deswegen','darum','daher','trotzdem','dann','danach','außerdem','zudem','sonst']};
const grp=w=>Object.keys(G).find(k=>G[k].includes(w.toLowerCase()));
const IT={};KI.forEach(i=>IT[i.id]=i);
let bad=0;const err=(c,m)=>{bad++;console.log('BAD',c.id,m,'|',c.full)};
for(const c of cards){
  const it=IT[c.f], m=c.meta;
  if(grp(it.k)!==c.sub) err(c,'group');
  if(!c.opts.includes(c.a)||new Set(c.opts).size!==c.opts.length) err(c,'options');
  for(const [o] of c.ok) if(c.opts.map(x=>x.toLowerCase()).includes(o.toLowerCase())) err(c,'accepted variant shown as wrong option');
  if(/[{}\u0001]|  |\s[,.]/.test(c.full)||!c.q.includes('____')) err(c,'junk');
  for(const a of it.alt) if(grp(a)===undefined&&a.toLowerCase()!=='um'&&a.toLowerCase()!=='wann') err(c,'unknown distractor '+a);
  if(it.frag) continue;
  const fa=verbParts(it.A.v,m.tA,CI[m.aC])[0], fb=verbParts(it.B.v,m.tB,CI[m.bC])[0];
  const full=c.full.replace(/[.!?]$/,'');
  if(it.front){
    const [bPart,aPart]=[full.slice(0,full.indexOf(', ')),full.slice(full.indexOf(', ')+2)];
    if(!bPart.endsWith(' '+fb)&&!bPart.endsWith(fb)) err(c,'front clause: verb not at the end');
    if(!aPart.startsWith(fa+' ')&&aPart!==fa) err(c,'main clause after a front clause must start with its verb');
  } else {
    const i=full.indexOf(', '+it.k+' '); if(i<0){err(c,'connector not found');continue;}
    const b=full.slice(i+3+it.k.length), aPart=full.slice(0,i);
    if(!aPart.toLowerCase().startsWith(m.aS.toLowerCase()+' '+fa)) err(c,'main clause order');
    const g=grp(it.k);
    if(g==='pos0'&&!b.startsWith(m.bS+' '+fb)) err(c,'after '+it.k+' expected subject + verb');
    if(g==='sub'&&!b.endsWith(fb)) err(c,'after '+it.k+' expected verb at the end');
    if(g==='adv'&&!b.startsWith(fb+' ')) err(c,'after '+it.k+' expected verb first');
  }
}
const n={};cards.forEach(c=>{const k=c.k+'.'+c.sub;n[k]=(n[k]||0)+1});
console.log(JSON.stringify(n));
console.log(cards.length,'connector cards',bad?bad+' PROBLEMS':'all answers verified');
if(process.argv[2]) fs.writeFileSync(process.argv[2],cards.map(c=>`${c.id}\t${c.full}\t[${c.a}]\t{${c.opts.join(' | ')}}`).join('\n'));
