// ===== Connectors: data =====
Object.assign(V, {
  weiterarbeiten:{i:'arbeiten',sep:'weiter',pt:'arbeitete',pp:'weitergearbeitet'},
  lernen:{i:'lernen',pt:'lernte',pp:'gelernt'},
  regnen:{i:'regnen',pr:['regne','regnest','regnet','regnen','regnet','regnen'],pt:'regnete',pp:'geregnet'},
  vorbeikommen:{i:'kommen',sep:'vorbei',pt:'kam',pp:'vorbeigekommen',a:'s'},
  ausfallen:{i:'fallen',sep:'aus',p2:'fällst',p3:'fällt',pt:'fiel',pp:'ausgefallen',a:'s'},
  ausgehen:{i:'gehen',sep:'aus',pt:'ging',pp:'ausgegangen',a:'s'},
  reisen:{i:'reisen',pt:'reiste',pp:'gereist',a:'s'},
  fruehstuecken:{i:'frühstücken',pt:'frühstückte',pp:'gefrühstückt'},
  verpassen:{i:'verpassen',pt:'verpasste',pp:'verpasst'},
  frieren:{i:'frieren',pt:'fror',pp:'gefroren'},
  muessen:{i:'müssen',pr:['muss','musst','muss','müssen','müsst','müssen'],pt:'musste',pp:'gemusst'},
  koennen:{i:'können',pr:['kann','kannst','kann','können','könnt','können'],pt:'konnte',pp:'gekonnt'},
  wollen:{i:'wollen',pr:['will','willst','will','wollen','wollt','wollen'],pt:'wollte',pp:'gewollt'},
  hoffen:{i:'hoffen',pt:'hoffte',pp:'gehofft'},
  wissen:{i:'wissen',pr:['weiß','weißt','weiß','wissen','wisst','wissen'],pt:'wusste',pp:'gewusst'},
  mitkommen:{i:'kommen',sep:'mit',pt:'kam',pp:'mitgekommen',a:'s'},
  sparen:{i:'sparen',pt:'sparte',pp:'gespart'},
  aufschreiben:{i:'schreiben',sep:'auf',pt:'schrieb',pp:'aufgeschrieben'},
  hoeren:{i:'hören',pt:'hörte',pp:'gehört'},
  aufhoeren:{i:'hören',sep:'auf',pt:'hörte',pp:'aufgehört'},
});

// Which word order each connector triggers
const KGRP = {und:'pos0', aber:'pos0', oder:'pos0', sondern:'pos0', denn:'pos0',
  weil:'sub', da:'sub', obwohl:'sub', dass:'sub', ob:'sub', wenn:'sub', als:'sub', damit:'sub', bevor:'sub', nachdem:'sub',
  'während':'sub', bis:'sub', seit:'sub', seitdem:'sub', sobald:'sub',
  deshalb:'adv', deswegen:'adv', darum:'adv', daher:'adv', trotzdem:'adv', dann:'adv', danach:'adv', 'außerdem':'adv', zudem:'adv', sonst:'adv'};
const KGNAME = {pos0:'aber, denn, oder, sondern — normal order', sub:'weil, dass, wenn… — verb to the end', adv:'deshalb, trotzdem, dann… — verb straight after'};
const KMEAN = {aber:'but', sondern:'but rather (after a negative)', oder:'or', denn:'because', weil:'because', obwohl:'although',
  trotzdem:'still / anyway', deshalb:'that\'s why / so', dann:'then', 'außerdem':'besides / also', sonst:'otherwise', dass:'that',
  ob:'whether / if (yes or no)', wenn:'if / whenever', als:'when (one time in the past)', damit:'so that', bevor:'before', nachdem:'after',
  'während':'while', bis:'until', seit:'since', sobald:'as soon as'};

// Items. A = main clause, B = the connector's clause (s: '=' same person as A [default], 'P' someone else, or [text, person]).
// frag = B is a short phrase without a verb (sondern). front = connector clause comes first. tn = [tense A, tense B] pairs.
// alt = wrong choices (checked to be wrong for this sentence); ok = also correct, with a note. sg = singular subjects only.
const P2 = [['praes','praes'],['praet','praet']], P3 = [['praes','praes'],['praet','praet'],['perf','perf']];
const KI = [
  // ---- aber / sondern / oder
  {id:'k01',k:'aber',A:{v:'wollen',m:'heute ins Kino gehen'},B:{v:'haben',m:'keine Zeit'},tn:P2,alt:['sondern','denn','obwohl','deshalb'],w:'a contrast: aber, and after aber the order stays normal (subject, verb)'},
  {id:'k02',k:'aber',A:{v:'sein',m:'ziemlich teuer',s:['die Wohnung','3f']},B:{v:'sein',m:'sehr schön'},tn:P2,alt:['sondern','oder','denn','weil'],w:'a contrast without a negation: aber'},
  {id:'k03',k:'aber',A:{v:'sprechen',m:'ein bisschen Deutsch'},B:{v:'verstehen',m:'noch nicht alles'},tn:P2,alt:['sondern','denn','deshalb','oder'],w:'a contrast: aber, normal word order after it'},
  {id:'k04',k:'sondern',A:{v:'fahren',m:'nicht mit dem Auto'},frag:'mit dem Fahrrad',tn:P3,alt:['aber','oder','denn','und'],w:'after a negation (nicht / kein), when the second part replaces it: sondern'},
  {id:'k05',k:'sondern',A:{v:'sein',m:'nicht heute',s:['das Treffen','3n']},frag:'morgen',tn:[['praes','praes']],alt:['aber','oder','denn','dann'],w:'nicht heute → sondern morgen: sondern replaces what was negated'},
  {id:'k06',k:'sondern',A:{v:'trinken',m:'keinen Kaffee'},B:{v:'trinken',m:'lieber Tee'},tn:P2,alt:['aber','oder','denn','deshalb'],w:'kein Kaffee → sondern Tee: the second part replaces the negated one'},
  {id:'k07',k:'aber',A:{v:'haben',m:'nicht viel Zeit'},B:{v:'vorbeikommen',m:'kurz'},tn:P3,alt:['sondern','denn','oder','deshalb'],w:'there is a negation, but the second part doesn\'t replace it — it adds a contrast, so aber (not sondern)'},
  {id:'k08',k:'oder',A:{v:'gehen',m:'heute Abend ins Kino',s:['wir','1p']},B:{v:'bleiben',m:'zu Hause'},tn:[['praes','praes'],['fut','fut']],alt:['aber','sondern','denn','obwohl'],w:'two alternatives: oder, normal word order'},
  {id:'k09',k:'sondern',A:{v:'wohnen',m:'nicht in Berlin'},frag:'in Potsdam',tn:P3,alt:['aber','oder','denn','als'],w:'nicht in Berlin → sondern in Potsdam'},
  // ---- denn / weil / deshalb
  {id:'k10',k:'denn',A:{v:'bleiben',m:'heute zu Hause'},B:{v:'sein',m:'krank'},tn:P2,alt:['weil','deshalb','aber','obwohl'],w:'denn = because, but it takes position 0: normal order (ich bin). After weil the verb would go to the end'},
  {id:'k11',k:'denn',A:{v:'nehmen',m:'ein Taxi'},B:{v:'kommen',m:'heute nicht',s:['der Bus','3m']},tn:P2,alt:['weil','deshalb','obwohl','aber'],w:'denn + normal order (der Bus kommt) — weil would need "der Bus heute nicht kommt"'},
  {id:'k12',k:'denn',A:{v:'lernen',m:'jeden Tag Deutsch'},B:{v:'wollen',m:'in Berlin arbeiten'},tn:P2,alt:['weil','damit','deshalb','sondern'],w:'denn + normal order (ich will …)'},
  {id:'k13',k:'weil',A:{v:'bleiben',m:'heute zu Hause'},B:{v:'sein',m:'krank'},tn:P2,alt:['denn','deshalb','obwohl','dass'],ok:[['da','Also correct — da means the same, a bit more formal.']],w:'weil = because, and it sends the verb to the end (… krank bin)'},
  {id:'k14',k:'weil',A:{v:'kommen',m:'zu spät'},B:{v:'ausfallen',m:'',s:['die U-Bahn','3f']},tn:[['praet','praet'],['perf','perf']],alt:['denn','deshalb','obwohl','dass'],ok:[['da','Also correct — da means the same, a bit more formal.']],w:'weil sends the verb to the end: … weil die U-Bahn ausfiel'},
  {id:'k15',k:'weil',front:1,A:{v:'bleiben',m:'zu Hause',s:['wir','1p']},B:{v:'regnen',m:'',s:['es','3n']},tn:P3,alt:['denn','deshalb','obwohl','ob'],ok:[['da','Also correct — da means the same, a bit more formal.']],w:'weil sends its verb to the end — and when the weil-clause comes first, the main clause starts with its verb (bleiben wir)'},
  {id:'k16',k:'weil',A:{v:'lernen',m:'Deutsch'},B:{v:'wollen',m:'in Deutschland arbeiten'},tn:P2,alt:['denn','damit','deshalb','obwohl'],ok:[['da','Also correct — da means the same, a bit more formal.']],w:'weil + verb at the end (… arbeiten will)'},
  {id:'k17',k:'deshalb',A:{v:'sein',m:'krank'},B:{v:'bleiben',m:'zu Hause'},tn:P3,alt:['weil','denn','trotzdem','obwohl'],ok:[['deswegen','Also correct — same meaning as deshalb.'],['darum','Also correct — same meaning as deshalb.'],['daher','Also correct — same meaning as deshalb.']],w:'deshalb = that\'s why; it takes position 1, so the verb comes straight after it (bleibe ich)'},
  {id:'k18',k:'deshalb',A:{v:'haben',m:'Verspätung',s:['der Zug','3m']},B:{v:'kommen',m:'zu spät',s:'P'},tn:P3,alt:['weil','denn','obwohl','trotzdem'],ok:[['deswegen','Also correct — same meaning as deshalb.'],['darum','Also correct — same meaning as deshalb.'],['daher','Also correct — same meaning as deshalb.']],w:'deshalb + verb straight after it'},
  {id:'k19',k:'deshalb',A:{v:'wollen',m:'in Berlin arbeiten'},B:{v:'lernen',m:'Deutsch'},tn:P2,alt:['weil','denn','damit','trotzdem'],ok:[['deswegen','Also correct — same meaning as deshalb.'],['darum','Also correct — same meaning as deshalb.'],['daher','Also correct — same meaning as deshalb.']],w:'the first part is the reason, the second the result: deshalb'},
  // ---- obwohl / trotzdem
  {id:'k20',k:'obwohl',A:{v:'gehen',m:'joggen'},B:{v:'regnen',m:'',s:['es','3n']},tn:[['praes','praes'],['perf','praet']],alt:['trotzdem','weil','deshalb','dass'],w:'obwohl = although; verb to the end'},
  {id:'k21',k:'obwohl',A:{v:'arbeiten',m:'heute'},B:{v:'sein',m:'krank'},tn:P3,alt:['trotzdem','weil','denn','aber'],w:'obwohl + verb at the end (… krank bin)'},
  {id:'k22',k:'obwohl',front:1,A:{v:'ausgehen',m:'noch'},B:{v:'sein',m:'müde'},tn:P2,alt:['Trotzdem','Weil','Aber','Denn'],w:'obwohl-clause first → the main clause starts with its verb (gehe ich …)'},
  {id:'k23',k:'trotzdem',A:{v:'regnen',m:'',s:['es','3n']},B:{v:'gehen',m:'spazieren',s:['wir','1p']},tn:P3,alt:['obwohl','deshalb','aber','denn'],w:'trotzdem = still / anyway; it takes position 1, so the verb comes straight after it (gehen wir)'},
  {id:'k24',k:'trotzdem',A:{v:'sein',m:'müde'},B:{v:'weiterarbeiten',m:''},tn:P3,alt:['obwohl','deshalb','denn','weil'],w:'trotzdem + verb straight after it'},
  {id:'k25',k:'trotzdem',A:{v:'haben',m:'wenig Geld'},B:{v:'reisen',m:'viel'},tn:P3,alt:['obwohl','deshalb','weil','sondern'],w:'trotzdem + verb straight after it (reise ich viel)'},
  // ---- dann / außerdem / sonst
  {id:'k26',k:'dann',A:{v:'fruehstuecken',m:'zuerst'},B:{v:'gehen',m:'zur Arbeit'},tn:P3,alt:['bevor','nachdem','als','wenn'],ok:[['danach','Also correct — danach means the same here.']],w:'dann = then; position 1, the verb comes straight after it'},
  {id:'k27',k:'außerdem',A:{v:'sein',m:'hell',s:['die Wohnung','3f']},B:{v:'haben',m:'einen Balkon'},tn:P2,alt:['aber','sondern','obwohl','deshalb'],ok:[['zudem','Also correct — zudem means the same, more formal.']],w:'außerdem = besides / also; position 1, verb straight after it'},
  {id:'k28',k:'außerdem',A:{v:'sprechen',m:'Englisch'},B:{v:'lernen',m:'gerade Deutsch'},tn:P2,alt:['trotzdem','deshalb','sondern','denn'],ok:[['zudem','Also correct — zudem means the same, more formal.']],w:'außerdem + verb straight after it'},
  {id:'k29',k:'sonst',A:{v:'muessen',m:'jetzt gehen'},B:{v:'verpassen',m:'den Zug'},tn:[['praes','praes']],alt:['deshalb','trotzdem','dann','aber'],w:'sonst = otherwise; position 1, verb straight after it'},
  {id:'k30',k:'sonst',A:{v:'mitnehmen',m:'besser eine Jacke',s:['du','2s']},B:{v:'frieren',m:''},tn:[['praes','praes']],alt:['deshalb','trotzdem','dann','denn'],w:'sonst + verb straight after it (frierst du)'},
  // ---- dass / ob
  {id:'k31',k:'dass',A:{v:'glauben',m:''},B:{v:'haben',m:'recht',s:'P'},tn:[['praes','praes'],['praes','praet']],alt:['ob','weil','wenn','als'],w:'dass = that; verb to the end'},
  {id:'k32',k:'dass',A:{v:'hoffen',m:''},B:{v:'kommen',m:'morgen',s:'P'},tn:[['praes','praes'],['praes','fut']],alt:['ob','wenn','als','damit'],w:'hoffen, dass … — verb to the end'},
  {id:'k33',k:'dass',A:{v:'sagen',m:''},B:{v:'haben',m:'keine Zeit',s:'P'},tn:[['praet','praes'],['perf','praes']],alt:['ob','weil','wenn','denn'],w:'reporting what someone said: dass + verb at the end'},
  {id:'k34',k:'ob',A:{v:'wissen',m:'nicht'},B:{v:'kommen',m:'morgen',s:'P'},tn:[['praes','praes'],['praes','fut']],alt:['dass','wenn','als','weil'],w:'whether / if (a yes-or-no question inside a sentence) = ob — "if" as a condition would be wenn'},
  {id:'k35',k:'ob',A:{v:'fragen',m:''},B:{v:'haben',m:'heute Abend Zeit',s:'P'},tn:[['praes','praes'],['praet','praet'],['perf','praes']],alt:['dass','wenn','weil','als'],w:'asking a yes-or-no question indirectly: ob'},
  {id:'k36',k:'ob',A:{v:'wissen',m:'noch nicht'},B:{v:'mitkommen',m:''},tn:[['praes','praes']],alt:['dass','wenn','als','denn'],w:'"I don\'t know whether…" = ob, verb to the end'},
  // ---- wenn / als
  {id:'k37',k:'wenn',A:{v:'mitkommen',m:''},B:{v:'haben',m:'Zeit'},tn:[['praes','praes'],['fut','praes']],alt:['ob','als','dass','denn'],w:'a condition (if) = wenn; verb to the end'},
  {id:'k38',k:'wenn',front:1,A:{v:'anrufen',m:'dich'},B:{v:'sein',m:'zu Hause'},tn:[['praes','praes'],['fut','praes']],alt:['Ob','Als','Dass','Denn'],w:'wenn-clause first → the main clause starts with its verb (rufe ich …)'},
  {id:'k39',k:'wenn',A:{v:'besuchen',m:'uns immer'},B:{v:'sein',m:'in Berlin'},tn:[['praet','praet']],alt:['als','ob','dass','damit'],w:'repeated in the past ("every time") = wenn; a single occasion in the past = als'},
  {id:'k40',k:'als',front:1,sg:1,A:{v:'wohnen',m:'in London'},B:{v:'sein',m:'ein Kind'},tn:[['praet','praet']],alt:['Wenn','Ob','Dass','Wann'],w:'one time or period in the past = als (wenn is for now, the future, or "every time"); wann is only for questions'},
  {id:'k41',k:'als',A:{v:'sein',m:'sehr glücklich'},B:{v:'bekommen',m:'die Nachricht'},tn:[['praet','praet']],alt:['wenn','ob','dass','wann'],w:'a single moment in the past: als'},
  {id:'k42',k:'als',A:{v:'anrufen',m:'',s:'P'},B:{v:'essen',m:'gerade',s:['wir','1p']},tn:[['praet','praet']],alt:['wenn','ob','wann','dass'],w:'a single moment in the past: als (wann only in questions)'},
  // ---- damit
  {id:'k43',k:'damit',A:{v:'sprechen',m:'langsam',s:['ich','1s']},B:{v:'verstehen',m:'mich',s:['du','2s']},tn:[['praes','praes']],alt:['dass','weil','denn','deshalb'],w:'purpose (so that) = damit; verb to the end'},
  {id:'k44',k:'damit',A:{v:'sparen',m:'Geld'},B:{v:'koennen',m:'studieren',s:['die Kinder','3p']},tn:P2,alt:['dass','weil','denn','um'],w:'damit + a full clause with its own subject; um … zu only works when both parts have the same subject'},
  {id:'k45',k:'damit',A:{v:'aufschreiben',m:'alles'},B:{v:'vergessen',m:'nichts'},tn:P2,alt:['dass','weil','deshalb','denn'],w:'purpose: damit + verb at the end'},
  // ---- time
  {id:'k46',k:'bevor',A:{v:'duschen',m:''},B:{v:'fruehstuecken',m:''},tn:P2,alt:['nachdem','als','dann','danach'],w:'bevor = before; verb to the end (dann / danach would put the verb straight after)'},
  {id:'k47',k:'nachdem',front:1,A:{v:'gehen',m:'spazieren'},B:{v:'essen',m:''},tn:[['praet','plusq'],['praes','perf']],alt:['Bevor','Danach','Während','Ob'],ok:[['Als','Also correct with the past tense — nachdem stresses that one thing was finished first.'],['Wenn','Also possible in the present.'],['Sobald','Also correct — sobald = as soon as.']],w:'nachdem = after; its clause uses an earlier tense (gegessen hatte / gegessen habe), verb to the end'},
  {id:'k48',k:'während',A:{v:'hoeren',m:'Musik'},B:{v:'kochen',m:''},tn:[['praes','praes']],alt:['als','ob','dass','denn'],w:'während = while; verb to the end'},
  {id:'k49',k:'bis',A:{v:'warten',m:'',s:['wir','1p']},B:{v:'aufhoeren',m:'',s:['der Regen','3m']},tn:[['praes','praes']],alt:['seit','ob','dass','damit'],w:'bis = until; verb to the end'},
  {id:'k50',k:'seit',front:1,A:{v:'sprechen',m:'mehr Deutsch'},B:{v:'wohnen',m:'in Berlin'},tn:[['praes','praes']],alt:['Als','Bevor','Ob','Dass'],ok:[['Seitdem','Also correct — seitdem means the same.']],w:'seit (seitdem) = since; still true now, so present tense; verb to the end'},
  {id:'k51',k:'sobald',A:{v:'anrufen',m:'dich'},B:{v:'sein',m:'zu Hause'},tn:[['praes','praes'],['fut','praes']],alt:['als','ob','dass','seit'],ok:[['wenn','Also correct — wenn works here too; sobald = as soon as.']],w:'sobald = as soon as; verb to the end'},
  {id:'k52',k:'weil',front:1,A:{v:'nehmen',m:'ein Taxi'},B:{v:'haben',m:'Verspätung',s:['der Zug','3m']},tn:P3,alt:['Denn','Deshalb','Obwohl','Ob'],ok:[['Da','Also correct — da means the same, a bit more formal.']],w:'weil-clause first: its verb at the end, then the main clause starts with its verb (nehme ich …)'},
];
