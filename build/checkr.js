// Independent check of relative-pronoun cards against a hand-written table
const fs=require('fs'),path=require('path');const D=__dirname;
const src=['data.js','gen.js','dlg.js','ndata.js','ngen.js','pdata.js','pgen.js','rdata.js','rgen.js'].map(f=>fs.readFileSync(path.join(D,f),'utf8').replace(/if \(typeof module[\s\S]*$/,'')).join('\n');
const {cards,RF}=new Function(src+'\nreturn {cards:buildRelCards(), RF};')();
const T={N:['der','die','das','die'],A:['den','die','das','die'],D:['dem','der','dem','denen'],G:['dessen','deren','dessen','deren']};
const GI={m:0,f:1,n:2,p:3}; const FR={}; RF.forEach(f=>FR[f.id]=f);
// the antecedent's article in the main clause must match its gender (and the case the main clause needs)
const ART={N:['der','die','das','die'],A:['den','die','das','die'],D:['dem','der','dem','den']};
let bad=0; const err=(c,m)=>{bad++;console.log('BAD',c.id,m,'|',c.full)};
for(const c of cards){
  const f=FR[c.f];
  if(c.a!==T[f.c][GI[c.g]]) err(c,`answer ${c.a} want ${T[f.c][GI[c.g]]}`);
  if(!c.opts.includes(c.a)||new Set(c.opts).size!==c.opts.length||c.opts.length<5) err(c,'options');
  if(/[{}\u0001]|  /.test(c.full)||!c.q.includes(', ')||!c.q.includes('____')) err(c,'junk');
  const main=c.full.split(',')[0];
  const w=main.split(' '); if(!Object.values(ART).some(a=>w.includes(a[GI[c.g]])) && !(GI[c.g]!==1 && w.includes('vom'))) err(c,'antecedent article');
  if(f.p && !c.q.includes(', '+f.p+' ____')) err(c,'preposition not right before the gap');
}
const n={};cards.forEach(c=>{n[c.sub]=(n[c.sub]||0)+1});
console.log(JSON.stringify(n));
console.log(cards.length,'relative-pronoun cards',bad?bad+' PROBLEMS':'all answers verified');
if(process.argv[2]) fs.writeFileSync(process.argv[2],cards.map(c=>`${c.id}\t${c.full}\t[${c.a}]\t{${c.opts.join(', ')}}`).join('\n'));
