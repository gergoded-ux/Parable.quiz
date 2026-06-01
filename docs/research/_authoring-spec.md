# Parable quiz authoring spec (for build subagents)

You are authoring full quiz JSON files for **Parable**, a Christian quiz site, from a pre-researched topic backlog. You will be told a row range to build.

## 1. Read your assignment
Read `content/topic-backlog.tsv` (tab-separated, has a header row). Columns:
`id, title, slug, bucket, struggle, result_set, viral_angle, virality_score, evidence`.
Build ONLY the rows whose `id` is in your assigned range (inclusive).

For each row:
- `bucket` is one of `profile`, `archetype`, `knowledge` → it sets the schema, folder, category, and mode.
- `result_set` lists result NAMES separated by " | ". Use these as your results. Do not swap them for different ones.
- `struggle` and `viral_angle` tell you the subject and the tone to write toward.
- `title` and `slug` are used verbatim.

## 2. Where to write
`content/tests/<folder>/<slug>.json` where `<folder>` = the bucket (`profile` | `archetype` | `knowledge`) and `<slug>` = the row's slug column exactly.

## 3. Schema by bucket

### profile → folder `profile`
```json
{
  "slug": "<slug>",
  "title": "<title>",
  "subtitle": "<short warm tagline you write>",
  "lang": "en",
  "category": "spiritual-profile",
  "estimatedMinutes": 5,
  "mode": "profile",
  "dimensions": ["<key1>", "<key2>", "..."],
  "questions": [
    { "text": "<question>", "options": [
      { "text": "<option>", "weights": { "<key1>": 2 } },
      { "text": "<option>", "weights": { "<key2>": 2, "<key3>": 1 } },
      { "text": "<option>", "weights": { "<key3>": 2 } },
      { "text": "<option>", "weights": { "<key4>": 2 } }
    ]}
  ],
  "results": {
    "<key1>": { "name": "<result name from result_set>", "description": "<2-3 warm sentences>", "scripture": { "text": "<short real verse>", "reference": "<Book c:v>" } }
  }
}
```
- `dimensions` MUST list every result key, and the keys in `results` MUST match `dimensions` exactly.

### archetype → folder `archetype`
Same shape as profile, EXCEPT:
- `"category": "bible-character"`
- `"mode": "archetype"`
- NO `dimensions` field
- each result also has `"emoji": "<one emoji>"` and `"traits": ["<word>", "<word>", "<word>"]` (3 traits)
```json
"results": {
  "<key>": { "name": "<name>", "emoji": "🕊️", "traits": ["Loyal", "Honest", "Brave"], "description": "<2-3 sentences>", "scripture": { "text": "<verse>", "reference": "<Book c:v>" } }
}
```

### knowledge → folder `knowledge`
```json
{
  "slug": "<slug>", "title": "<title>", "subtitle": "<warm tagline>",
  "lang": "en", "category": "bible-iq", "estimatedMinutes": 4, "mode": "knowledge",
  "questions": [
    { "text": "<question>", "options": [
      { "text": "<opt>", "correct": true, "explanation": "<why, with a reference>" },
      { "text": "<opt>", "correct": false },
      { "text": "<opt>", "correct": false },
      { "text": "<opt>", "correct": false }
    ]}
  ],
  "scoring": {
    "perfectMessage": "<warm>",
    "gradeBands": [
      { "min": 0, "max": 50, "label": "Beginner", "message": "<warm>" },
      { "min": 51, "max": 80, "label": "Strong", "message": "<warm>" },
      { "min": 81, "max": 100, "label": "Master", "message": "<warm>" }
    ]
  }
}
```
- 10-12 questions, exactly ONE `correct: true` per question, gradeBands must cover 0-100 with no gaps.

## 4. Quality rules
- Questions: 8-10 for profile/archetype, 10-12 for knowledge. Exactly 4 options each.
- Result KEYS: kebab-case, lowercase ASCII, derived from the result name ("The Catastrophizer" → `catastrophizer`, "Soul Fatigue" → `soul-fatigue`). Unique within the quiz. `weights` keys must match result keys exactly.
- Spread weights so every result is reachable; most options give 1-3 points to one or two keys. No single question should decide the result alone.

## 5. Inline scripture
- Every profile and archetype result needs an inline `scripture` with a REAL, accurate Bible verse and correct reference. Keep it short (one verse or a clause). Pick a verse that genuinely fits the result. Never fabricate a reference. When unsure of exact wording, fall back to a well-known verse you are confident about. Scripture is a quotation: keep it accurate, do not paraphrase or restyle it.

## 6. Humanizer rules (apply to ALL prose you write: subtitles, questions, options, traits, descriptions, explanations, grade messages)
- NO em dashes (—) or en dashes (–). Use periods, commas, or colons instead. Hard rule. Scan each file before finishing; any — or – means you are not done. (This does not apply to a hyphen inside a normal hyphenated word like "self-control".)
- Vary sentence rhythm. Mix short punchy sentences with longer ones.
- Do not force everything into groups of three.
- Warm, second-person ("you"), conversational, encouraging. No clinical or assessment tone. No theological jargon.
- Avoid AI-vocab (delve, tapestry, testament, vibrant, crucial, navigate, foster, underscore, realm, journey-as-metaphor) and "It's not just X, it's Y" parallelisms.

## 7. JSON correctness
- Valid JSON only: double quotes, no trailing commas, proper escaping. Use literal emoji characters (UTF-8).
- After writing each file, verify it parses:
  `node -e "JSON.parse(require('fs').readFileSync('PATH','utf8'));console.log('ok')"`

## 8. Constraints
- Build ONLY your assigned rows. Write only those files. Do NOT git commit. Do NOT run `pnpm validate:tests` or `pnpm test`. Do NOT edit any other or shared files.
