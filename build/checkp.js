// Independent check of preposition cards: hand-written tables, not the generator's own helpers.
const fs=require('fs'),path=require('path');const D=__dirname;
const src=['data.js','gen.js','dlg.js','ndata.js','ngen.js','pdata.js','pgen.js'].map(f=>fs.readFileSync(path.join(D,f),'utf8').replace(/if \(typeof module[\s\S]*$/,'')).join('\n');
const {cards,VP}=new Function(src+'\nreturn {cards:buildPrepCards(), VP};')();
const ART={A:{m:['den','einen','meinen','deinen'],f:['die','eine','meine','deine'],n:['das','ein','mein','dein'],p:['die','meine','deine']},
           D:{m:['dem','einem','meinem','deinem'],f:['der','einer','meiner','deiner'],n:['dem','einem','meinem','deinem'],p:['den','meinen','deinen']}};
const SHORT={'an dem':'am','an das':'ans','in dem':'im','in das':'ins','von dem':'vom','zu dem':'zum','zu der':'zur','bei dem':'beim','auf das':'aufs','um das':'ums','für das':'fürs','über das':'übers'};
const DA={an:'daran',auf:'darauf','über':'darüber','für':'dafür',um:'darum',vor:'davor',mit:'damit',von:'davon',nach:'danach',zu:'dazu',bei:'dabei',in:'darin'};
const WO={an:'woran',auf:'worauf','über':'worüber','für':'wofür',um:'worum',vor:'wovor',mit:'womit',von:'wovon',nach:'wonach',zu:'wozu',bei:'wobei',in:'worin'};
const PR={A:{m:'ihn',f:'sie',n:'es',p:'sie'},D:{m:'ihm',f:'ihr',n:'ihm',p:'ihnen'}};
const VPC={};VP.forEach(e=>VPC[e.id]=e);
let bad=0;const err=(c,m)=>{bad++;console.log('BAD',c.id,m,'|',c.full)};
for(const c of cards){
  if(/[{}\u0001]|  /.test(c.full+c.q)) err(c,'junk');
  if(!c.opts.includes(c.a)) err(c,'answer not in options');
  if(new Set(c.opts).size!==c.opts.length||c.opts.length<4) err(c,'options '+c.opts);
  for(const [o] of c.ok) if(c.opts.includes(o)) err(c,'accepted variant shown as distractor: '+o);
  if(!c.q.includes('____')) err(c,'no gap');
  const e=VPC[c.f];
  if(c.k==='prep'&&c.sub==='fix'){
    const objs=(e.th||[]).concat((e.pe||[]).map(o=>[o[0].replace(/^dein/,'mein'),o[1],o[2]]));
    const o=objs[+c.id.split('.')[1].slice(1)];
    if(!ART[e.c][o[2]].includes(o[0])) err(c,`article ${o[0]} is not ${e.c} ${o[2]}`);
    const long=e.p+' '+o[0], want=['am','im','vom','zum','zur','beim','ins'].includes(SHORT[long])?SHORT[long]:long;
    if(c.a!==want) err(c,`answer ${c.a} want ${want}`);
    if(!c.full.includes(' '+c.a+' '+o[1])) err(c,'chunk not before noun');
  }
  if(c.k==='prpr'){
    if(c.sub==='da'&&c.a!==DA[e.p]) err(c,'da form');
    if(c.sub==='wo'&&c.a.toLowerCase()!==WO[e.p]) err(c,'wo form');
    if(c.sub==='pers'&&c.a!==e.p+' '+PR[e.c][c.g]) err(c,'pronoun');
    if(c.sub==='wen'&&c.a.toLowerCase()!==e.p+' '+(e.c==='A'?'wen':'wem')) err(c,'wen/wem');
    for(const o of [...(e.th||[]),...(e.pe||[])]) if(!ART[e.c][o[2]].includes(o[0])) err(c,`object article ${o[0]} not ${e.c} ${o[2]}`);
  }
}
const n={};cards.forEach(c=>{const k=c.k+'.'+c.sub;n[k]=(n[k]||0)+1});
console.log(JSON.stringify(n));
console.log(cards.length,'preposition cards',bad?bad+' PROBLEMS':'all answers verified');
if(process.argv[2]) fs.writeFileSync(process.argv[2],cards.map(c=>`${c.id}\t${c.pre?c.pre+' / ':''}${c.full.replace(c.pre,'').trim()}\t[${c.a}]\t{${c.opts.join(', ')}}`).join('\n'));
