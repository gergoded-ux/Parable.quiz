// lib/themes.ts
// Controlled vocabulary for classifying quizzes, plus a heuristic that maps the
// free-text "struggle" column from topic-backlog.tsv to one theme. Order in
// RULES matters: first match wins.

export const THEMES = [
  'identity',
  'anxiety',
  'forgiveness',
  'church-hurt',
  'grief-loss',
  'healing-wounds',
  'doubt-faith',
  'calling-purpose',
  'relationships-dating',
  'money-work',
  'comparison-shame',
  'rest-burnout',
  'parenting-family',
  'hearing-god',
  'loneliness-belonging',
  'discipleship',
  'bible-knowledge',
  'scripture-archetype',
] as const;

export type Theme = (typeof THEMES)[number];

const THEME_SET = new Set<string>(THEMES);

export function isValidTheme(t: string | undefined): t is Theme {
  return typeof t === 'string' && THEME_SET.has(t);
}

const RULES: Array<[RegExp, Theme]> = [
  [/forgiv|unforgiv|bitter|resent/, 'forgiveness'],
  [/church hurt|religious (trauma|abuse)|spiritual abuse|left.*church|leaving church|fraud.*church/, 'church-hurt'],
  [/grief|griev|mourn|lament|loss nobody|lost (a|my)/, 'grief-loss'],
  [/anxiet|worry|overthink|panic|so tired|afraid|fear is/, 'anxiety'],
  [/wound|trauma|generational|inner child|abandon|rejection|betray/, 'healing-wounds'],
  [/doubt|deconstruct|faith (crisis|problem)|dark night|unbelief|god.*silent|silent.*god/, 'doubt-faith'],
  [/callin|purpose|decision|waiting|prepare|next step|stuck|behind in life/, 'calling-purpose'],
  [/dating|marriage|relationship|the one|spouse|love (style|language)|romance|couple/, 'relationships-dating'],
  [/money|finance|wealth|hustle|workaholic|career|rich|provision/, 'money-work'],
  [/compar|envy|jealous|social media|shame|not enough|impostor|fraud/, 'comparison-shame'],
  [/\brest\b|sabbath|burnout|exhaust|rhythm|autopilot/, 'rest-burnout'],
  [/parent|\bmom\b|\bdad\b|child|family|discipline/, 'parenting-family'],
  [/discern|hear god|god.?s voice|spiritual dry|quiet time/, 'hearing-god'],
  [/lonel|friend|belong|isolat|outsider|unseen|invisible|seen/, 'loneliness-belonging'],
  [/identity|worth|who (am|are) (i|you)|chosen|beloved|\benough\b/, 'identity'],
  [/gift|disciplin|virtue|beatitude|fruit of the spirit|prayer style/, 'discipleship'],
];

export function themeForStruggle(struggle: string | undefined, title = ''): Theme | null {
  const hay = `${struggle ?? ''} ${title}`.toLowerCase();
  for (const [re, theme] of RULES) {
    if (re.test(hay)) return theme;
  }
  return null;
}
