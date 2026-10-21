# mir · dir · ihm

A German flashcard trainer for the words that change with case: personal pronouns (mich/mir, ihn/ihm, sie/ihnen…), possessives (mein, seinem, ihrer, eure…) and reflexives (mich/mir/sich). Single self-contained HTML file, no dependencies, works offline.

**Live:** https://nathanaog.github.io/grammatik/ (once GitHub Pages is enabled: Settings → Pages → Deploy from branch → `main`, root)

## What's in it

- **9,168 cards** generated from 155 hand-written sentence frames × 9 persons × 6 tenses — about 1,500 sentences per tense.
- Tenses: Präsens, Präteritum, Perfekt, Plusquamperfekt, Futur I, Konjunktiv II. The tense never changes the form you need, but it moves the verb (and the pronoun's neighbours), so it's useful variety.
- Cases: Nominativ (possessive subjects), Akkusativ, Dativ, Genitiv (possessives after wegen/trotz/während and "of" possession).
- Triggers: case-governing verbs (helfen + Dat, anrufen + Akk…), fixed prepositions (warten auf, Angst vor…), two-object verbs, and thing-as-subject verbs (gefallen, gehören, schmecken, wehtun…).

## Features

- **Filters:** type (pronoun / possessive / reflexive), case, verb vs preposition trigger, person (ich … Sie, with shortcuts for 3rd person, plural, the three "you"s), tense, and the gender of the noun after a possessive.
- **Which cards:** New + due (default — anything you know stays hidden until its review date), Weak spots, Review known, Everything.
- **Three answer modes:** typing (case-tolerant unless "Capitals count" is on — formal Sie forms get a note), picking from the six near-miss forms, or flip-and-self-grade.
- After each answer, the reasoning chain: e.g. *her → ihr- → Dativ → masculine → -em → ihrem*, plus why that case applies.
- **Spaced repetition:** boxes 0–6, due after 1, 2, 4, 8, 16, 32 days. A card is "known" from box 3. Misses come back 3–5 cards later in the same session.
- **Progress:** a person × case heat-map (tap a square to drill that combination), accuracy per tense, and a list of your most common mix-ups (e.g. *ihn instead of ihm*).
- **Tables:** pronoun and reflexive table, possessive endings, prepositions by case, Dativ verbs, word-order notes.
- Read-aloud via the browser's German voice; light / sepia / dark themes; keyboard shortcuts.

## Progress

Stored in `localStorage` (`mir-dir-ihm-v1`), keyed by `frameId.person.tense` — so adding new frames later never shifts existing progress. Export / import JSON from Settings; import merges, with the more recent answer winning per card.

## Building

Sources live in `build/`:

- `data.js` — verb data (`V`), possessed-noun sets (`NOUNS`) and the sentence frames (`FR`)
- `gen.js` — the generator: conjugation, word order, subject/adverb choice, possessive endings, distractors
- `head.html` + `app.js` — styles, markup and app logic

`python3 build.py` (run inside `build/`) concatenates them into `../index.html`. `node dump.js` writes every generated sentence to `all.txt` for proofreading.

### Adding sentences

Append a frame to `FR` in `data.js`:

```js
{id:'pd33', k:'pp', c:'D', v:'helfen', m:'{X} {T} bei den Hausaufgaben',
 g:'helfen — to help someone with homework', w:'helfen is a Dativ verb'}
```

- `k`: `pp` pronoun · `pos` possessive · `rx` reflexive; `c`: `N`/`A`/`D`/`G`
- `m`: middle field. `{X}` = the blank (pronoun/reflexive), `{P}` = possessive + noun, `{T}` = time adverb slot, `{R}` = the subject's own reflexive. Leave a separable prefix off — the generator adds it.
- Optional: `p:1` preposition-governed · `ad:'s'` state verb (adverbs like *wirklich, damals*) or `'n'` none · `s:['der Film','3m']` fixed subject · `subj:'P'` possessive phrase is the subject · `n:'people'` noun set for possessives · `x3n:1` skip the neuter "es (das Kind)" person.
- Every new verb needs an entry in `V` (Präteritum, Partizip II, `a:'s'` for sein-verbs, irregular du/er forms).
