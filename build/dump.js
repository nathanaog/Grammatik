const fs=require('fs');
eval(fs.readFileSync('data.js','utf8')+fs.readFileSync('gen.js','utf8').replace(/if \(typeof module[\s\S]*$/,'')+';globalThis.buildCards=buildCards;');
const c=buildCards();
console.log('cards',c.length);
const byT={};c.forEach(x=>{byT[x.t]=(byT[x.t]||0)+1});console.log(byT);
const bad=c.filter(x=>/[{}\u0001]|  /.test(x.full)||!x.opts.includes(x.a));
console.log('bad',bad.length, bad.slice(0,5).map(b=>b.full+' | '+b.a+' | '+b.opts));
fs.writeFileSync('all.txt',c.map(x=>`${x.id}\t${x.full}\t[${x.a}]\t${x.q}`).join('\n'));
