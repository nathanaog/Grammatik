const fs=require('fs'),path=require('path');const D=__dirname;
const src=['data.js','gen.js','dlg.js','ndata.js','ngen.js'].map(f=>fs.readFileSync(path.join(D,f),'utf8').replace(/if \(typeof module[\s\S]*$/,'')).join('\n');
const C=new Function(src+'\nreturn {cards:buildNounCards(), ADJ, DEF, expectForm, possForm, POSS};')();
const cards=C.cards;
// independent check of every answer against hand-written tables
const ARTT={def:{N:['der','die','das','die'],A:['den','die','das','die'],D:['dem','der','dem','den'],G:['des','der','des','der']},
 ind:{N:['ein','eine','ein'],A:['einen','eine','ein'],D:['einem','einer','einem'],G:['eines','einer','eines']},
 kein:{N:['kein','keine','kein','keine'],A:['keinen','keine','kein','keine'],D:['keinem','keiner','keinem','keinen'],G:['keines','keiner','keines','keiner']},
 dies:{N:['dieser','diese','dieses','diese'],A:['diesen','diese','dieses','diese'],D:['diesem','dieser','diesem','diesen'],G:['dieses','dieser','dieses','dieser']},
 jed:{N:['jeder','jede','jedes'],A:['jeden','jede','jedes'],D:['jedem','jeder','jedem'],G:['jedes','jeder','jedes']}};
const ADJT={w:{N:['e','e','e','en'],A:['en','e','e','en'],D:['en','en','en','en'],G:['en','en','en','en']},
 m:{N:['er','e','es','en'],A:['en','e','es','en'],D:['en','en','en','en'],G:['en','en','en','en']},
 s:{N:['er','e','es','e'],A:['en','e','es','e'],D:['em','er','em','en'],G:['en','er','en','er']}};
const GI={m:0,f:1,n:2,p:3};
let bad=0;
for(const c of cards){
  const want=c.k==='art'?ARTT[c.dt][c.c][GI[c.g]]:ADJT[c.ap][c.c][GI[c.g]];
  if(want!==c.a0){bad++;console.log('MISMATCH',c.id,c.a0,want,c.full);}
  if(c.k==='adj'&&c.det){ // determiner must itself be correct for case/gender
    const dk=c.detKind; let w2;
    if(dk==='poss') w2=null; else w2=ARTT[dk][c.c][GI[c.g]];
    if(w2&&w2.toLowerCase()!==c.det.toLowerCase()){bad++;console.log('DET',c.id,c.det,w2);}
  }
  if(/[{}\u0001]|  /.test(c.full)){bad++;console.log('JUNK',c.full);}
}
const cnt={};cards.forEach(c=>{const k=c.k+'.'+c.c;cnt[k]=(cnt[k]||0)+1});
console.log(cards.length,'cards',cnt,bad?bad+' PROBLEMS':'all answers verified');
if(process.argv[2]) fs.writeFileSync(process.argv[2],cards.map(c=>`${c.id}\t${c.full}\t[${c.a}]`).join('\n'));
