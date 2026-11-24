// ===== Relative pronouns: data =====
Object.assign(V, {
  besichtigen:{i:'besichtigen',pt:'besichtigte',pp:'besichtigt'},
  ziehen:{i:'ziehen',pt:'zog',pp:'gezogen',a:'s'},
  bezahlen:{i:'bezahlen',pt:'bezahlte',pp:'bezahlt'},
});

// Antecedents (the noun the relative clause describes): [Nom, Akk, Dat, Gen]
const RN = {
  pe:{ m:[['Kollege','Kollegen','Kollegen','Kollegen'],['Mann','Mann','Mann','Mannes'],['Nachbar','Nachbarn','Nachbarn','Nachbarn'],['Arzt','Arzt','Arzt','Arztes']],
       f:[['Frau','Frau','Frau','Frau'],['Kollegin','Kollegin','Kollegin','Kollegin'],['Nachbarin','Nachbarin','Nachbarin','Nachbarin'],['Lehrerin','Lehrerin','Lehrerin','Lehrerin']],
       n:[['Kind','Kind','Kind','Kindes'],['Mädchen','Mädchen','Mädchen','Mädchens']],
       p:[['Leute','Leute','Leuten','Leute'],['Kollegen','Kollegen','Kollegen','Kollegen'],['Nachbarn','Nachbarn','Nachbarn','Nachbarn'],['Kinder','Kinder','Kindern','Kinder']]},
  ob:{ m:[['Schlüssel','Schlüssel','Schlüssel','Schlüssels'],['Laptop','Laptop','Laptop','Laptops'],['Regenschirm','Regenschirm','Regenschirm','Regenschirms'],['Rucksack','Rucksack','Rucksack','Rucksacks']],
       f:[['Tasche','Tasche','Tasche','Tasche'],['Jacke','Jacke','Jacke','Jacke'],['Brille','Brille','Brille','Brille'],['Kamera','Kamera','Kamera','Kamera']],
       n:[['Buch','Buch','Buch','Buches'],['Handy','Handy','Handy','Handys'],['Portemonnaie','Portemonnaie','Portemonnaie','Portemonnaies'],['Ticket','Ticket','Ticket','Tickets']],
       p:[['Bücher','Bücher','Büchern','Bücher'],['Schuhe','Schuhe','Schuhen','Schuhe'],['Unterlagen','Unterlagen','Unterlagen','Unterlagen'],['Fotos','Fotos','Fotos','Fotos']]},
  ho:{ m:[['Stadtteil','Stadtteil','Stadtteil','Stadtteils'],['Kiez','Kiez','Kiez','Kiezes'],['Ort','Ort','Ort','Ortes']],
       f:[['Stadt','Stadt','Stadt','Stadt'],['Wohnung','Wohnung','Wohnung','Wohnung'],['Straße','Straße','Straße','Straße']],
       n:[['Haus','Haus','Haus','Hauses'],['Dorf','Dorf','Dorf','Dorfes'],['Viertel','Viertel','Viertel','Viertels']],
       p:[['Häuser','Häuser','Häusern','Häuser'],['Wohnungen','Wohnungen','Wohnungen','Wohnungen']]},
  ve:{ m:[['Club','Club','Club','Clubs'],['Biergarten','Biergarten','Biergarten','Biergartens'],['Laden','Laden','Laden','Ladens']],
       f:[['Bar','Bar','Bar','Bar'],['Kneipe','Kneipe','Kneipe','Kneipe'],['Bäckerei','Bäckerei','Bäckerei','Bäckerei']],
       n:[['Restaurant','Restaurant','Restaurant','Restaurants'],['Café','Café','Café','Cafés'],['Kino','Kino','Kino','Kinos']],
       p:[['Restaurants','Restaurants','Restaurants','Restaurants'],['Cafés','Cafés','Cafés','Cafés'],['Bars','Bars','Bars','Bars']]},
};
// Main clauses [singular, plural, punctuation, main verb]: {N}/{A}/{D} = the antecedent with der/die/das in that case.
// A clause that uses the same verb as the main clause skips that main clause.
const RMAIN = {
  pe:[['Das ist {N}','Das sind {N}','.'],['Kennst du {A}','Kennst du {A}','?'],['Ich habe gestern mit {D} gesprochen','Ich habe gestern mit {D} gesprochen','.'],['Wie heißt {N}','Wie heißen {N}','?']],
  ob:[['Wo ist {N}','Wo sind {N}','?'],['Hast du {A} gesehen','Hast du {A} gesehen','?'],['Das ist {N}','Das sind {N}','.'],['Ich kann {A} nicht finden','Ich kann {A} nicht finden','.']],
  ho:[['Das ist {N}','Das sind {N}','.'],['Wie findest du {A}','Wie findest du {A}','?'],['Erzähl mir von {D}','Erzähl mir von {D}','!']],
  ve:[['Das ist {N}','Das sind {N}','.'],['Kennst du {A}','Kennst du {A}','?'],['Wir treffen uns heute vor {D}','Wir treffen uns heute vor {D}','.','treffen']],
};
// Relative clauses. role: subj = the relative pronoun is the subject; obj = an object (case from the verb);
// prep = after a preposition (case from the preposition); gen = "whose" (gp = the possessed noun, which is the subject).
// m: the rest of the clause ({S} = its subject); s: fixed subject; tn: tenses that make sense; w: why
const PAST = ['praet','perf','plusq'];
const RF = [
  // ---- people
  {id:'r01',cls:'pe',role:'subj',c:'N',v:'arbeiten',m:'im Büro neben mir',w:'the relative pronoun is the subject of arbeiten'},
  {id:'r02',cls:'pe',role:'subj',c:'N',v:'wohnen',m:'über uns',w:'the relative pronoun is the subject of wohnen'},
  {id:'r03',cls:'pe',role:'subj',c:'N',v:'anrufen',m:'mich jeden Abend',tn:['praes','praet','perf','plusq'],w:'the relative pronoun is the subject of anrufen'},
  {id:'r04',cls:'pe',role:'subj',c:'N',v:'helfen',m:'mir immer',w:'the relative pronoun is the subject of helfen (mir is the Dativ object)'},
  {id:'r05',cls:'pe',role:'obj',c:'A',v:'kennenlernen',m:'{S} im Urlaub',tn:PAST,w:'kennenlernen takes a direct object → Akkusativ'},
  {id:'r06',cls:'pe',role:'obj',c:'A',v:'einladen',m:'{S} zur Party',w:'einladen takes a direct object → Akkusativ'},
  {id:'r07',cls:'pe',role:'obj',c:'A',v:'fragen',m:'{S} nach dem Weg',w:'fragen: the person asked is Akkusativ'},
  {id:'r08',cls:'pe',role:'obj',c:'A',v:'besuchen',m:'{S} am Wochenende',w:'besuchen takes a direct object → Akkusativ'},
  {id:'r09',cls:'pe',role:'obj',c:'D',v:'helfen',m:'{S} beim Umzug',w:'helfen is a Dativ verb'},
  {id:'r10',cls:'pe',role:'obj',c:'D',v:'danken',m:'{S} für die Blumen',w:'danken is a Dativ verb'},
  {id:'r11',cls:'pe',role:'obj',c:'D',v:'vertrauen',m:'{S}',tn:['praes','praet','perf','plusq'],w:'vertrauen is a Dativ verb'},
  {id:'r12',cls:'pe',role:'obj',c:'D',v:'schreiben',m:'{S} eine Nachricht',w:'schreiben: the person is Dativ, the message is Akkusativ'},
  {id:'r13',cls:'pe',role:'gen',c:'G',gp:['Auto','3n'],v:'stehen',m:'vor dem Haus',tn:['praes','praet'],w:'"whose" → dessen / deren, chosen by the person it refers to'},
  {id:'r14',cls:'pe',role:'gen',c:'G',gp:['Eltern','3p'],v:'leben',m:'in Spanien',tn:['praes','praet'],w:'"whose" → dessen / deren, chosen by the person it refers to'},
  {id:'r15',cls:'pe',role:'gen',c:'G',gp:['Name','3m'],v:'einfallen',m:'mir nicht',tn:['praes','praet','perf'],w:'"whose" → dessen / deren, chosen by the person it refers to'},
  {id:'r16',cls:'pe',role:'prep',c:'D',p:'mit',v:'telefonieren',m:'{S} oft',w:'mit always takes Dativ'},
  {id:'r17',cls:'pe',role:'prep',c:'A',p:'auf',v:'warten',m:'{S} schon lange',tn:['praes','praet','perf','plusq'],w:'warten auf + Akkusativ'},
  {id:'r18',cls:'pe',role:'prep',c:'A',p:'für',v:'arbeiten',m:'{S} gern',w:'für always takes Akkusativ'},
  {id:'r19',cls:'pe',role:'prep',c:'D',p:'von',v:'erzaehlen',m:'{S} dir',tn:PAST,w:'von always takes Dativ'},
  {id:'r20',cls:'pe',role:'prep',c:'D',p:'bei',v:'wohnen',m:'{S} im Sommer',w:'bei always takes Dativ'},
  {id:'r21',cls:'pe',role:'prep',c:'A',p:'an',v:'denken',m:'{S} oft',w:'denken an + Akkusativ'},
  {id:'r22',cls:'pe',role:'prep',c:'A',p:'über',v:'sprechen',m:'{S} gestern',tn:PAST,w:'sprechen über + Akkusativ'},
  {id:'r23',cls:'pe',role:'prep',c:'D',p:'neben',v:'sitzen',m:'{S} im Kurs',w:'neben + where? (wo) → Dativ'},
  {id:'r24',cls:'pe',role:'prep',c:'D',p:'zu',v:'gehen',m:'{S} morgen',tn:['praes','fut'],w:'zu always takes Dativ'},
  // ---- things
  {id:'o01',cls:'ob',role:'subj',c:'N',v:'liegen',m:'auf dem Tisch',tn:['praes','praet'],w:'the relative pronoun is the subject of liegen'},
  {id:'o02',cls:'ob',role:'subj',c:'N',v:'gehoeren',m:'meinem Bruder',tn:['praes','praet'],w:'the relative pronoun is the subject of gehören'},
  {id:'o03',cls:'ob',role:'subj',c:'N',v:'kosten',m:'so viel Geld',tn:['praes','praet','perf','plusq'],w:'the relative pronoun is the subject of kosten'},
  {id:'o04',cls:'ob',role:'obj',c:'A',v:'kaufen',m:'{S} gestern',tn:PAST,w:'kaufen takes a direct object → Akkusativ'},
  {id:'o05',cls:'ob',role:'obj',c:'A',v:'suchen',m:'{S} schon seit Tagen',tn:['praes','praet'],w:'suchen takes a direct object → Akkusativ'},
  {id:'o06',cls:'ob',role:'obj',c:'A',v:'vergessen',m:'{S} im Zug',tn:PAST,w:'vergessen takes a direct object → Akkusativ'},
  {id:'o07',cls:'ob',role:'obj',c:'A',v:'empfehlen',m:'{S} dir',tn:PAST,w:'empfehlen: the thing is Akkusativ, the person (dir) Dativ'},
  {id:'o08',cls:'ob',role:'prep',c:'D',p:'von',v:'erzaehlen',m:'{S} dir',tn:PAST,w:'von always takes Dativ'},
  {id:'o09',cls:'ob',role:'prep',c:'A',p:'über',v:'sprechen',m:'{S} vorhin',tn:PAST,w:'sprechen über + Akkusativ'},
  {id:'o10',cls:'ob',role:'prep',c:'D',p:'nach',v:'suchen',m:'{S} die ganze Zeit',tn:['praes','praet','perf','plusq'],w:'suchen nach + Dativ'},
  {id:'o11',cls:'ob',role:'prep',c:'A',p:'für',v:'bezahlen',m:'{S} so viel',tn:PAST,w:'für always takes Akkusativ'},
  {id:'o12',cls:'ob',role:'gen',c:'G',gp:['Preis','3m'],v:'ueberraschen',m:'mich',tn:PAST,w:'"whose" → dessen / deren, chosen by the thing it refers to'},
  {id:'o13',cls:'ob',role:'gen',c:'G',gp:['Farbe','3f'],v:'gefallen',m:'mir so gut',tn:['praes','praet'],w:'"whose" → dessen / deren, chosen by the thing it refers to'},
  // ---- homes and areas
  {id:'h01',cls:'ho',role:'prep',c:'D',p:'in',v:'wohnen',m:'{S} früher',tn:PAST,w:'in + where? (wo) → Dativ'},
  {id:'h02',cls:'ho',role:'prep',c:'A',p:'in',v:'ziehen',m:'{S} nächstes Jahr',tn:['praes','fut'],w:'in + where to? (wohin) → Akkusativ'},
  {id:'h03',cls:'ho',role:'subj',c:'N',v:'gefallen',m:'mir am besten',tn:['praes','praet'],w:'the relative pronoun is the subject of gefallen'},
  {id:'h04',cls:'ho',role:'obj',c:'A',v:'besichtigen',m:'{S} gestern',tn:PAST,w:'besichtigen takes a direct object → Akkusativ'},
  {id:'h05',cls:'ho',role:'gen',c:'G',gp:['Nachbarn','3p'],v:'sein',m:'so nett',tn:['praes','praet'],w:'"whose" → dessen / deren, chosen by the place it refers to'},
  {id:'h06',cls:'ho',role:'prep',c:'D',p:'aus',v:'kommen',m:'{S} ursprünglich',tn:['praes'],w:'aus always takes Dativ'},
  // ---- cafés, bars, shops
  {id:'v01',cls:'ve',role:'prep',c:'D',p:'in',v:'kennenlernen',s:['wir','1p'],m:'uns damals',tn:PAST,w:'in + where? (wo) → Dativ'},
  {id:'v02',cls:'ve',role:'prep',c:'A',p:'in',v:'gehen',m:'{S} am liebsten',tn:['praes','praet'],w:'in + where to? (wohin) → Akkusativ'},
  {id:'v03',cls:'ve',role:'subj',c:'N',v:'sein',m:'gleich um die Ecke',tn:['praes','praet'],w:'the relative pronoun is the subject of sein'},
  {id:'v04',cls:'ve',role:'obj',c:'A',v:'empfehlen',m:'{S} mir',tn:PAST,w:'empfehlen: the place is Akkusativ, the person (mir) Dativ'},
  {id:'v05',cls:'ve',role:'gen',c:'G',gp:['Besitzer','3m'],v:'sein',m:'ein Freund von mir',tn:['praes','praet'],w:'"whose" → dessen / deren, chosen by the place it refers to'},
  {id:'v06',cls:'ve',role:'prep',c:'D',p:'vor',v:'treffen',s:['wir','1p'],m:'uns immer',tn:['praes','praet','perf'],w:'vor + where? (wo) → Dativ'},
];
