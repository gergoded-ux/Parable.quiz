import { z } from 'zod';

export const ScriptureRef = z.string().min(1);

// Inline scripture lets a quiz carry its own verse instead of pointing into the
// shared scriptures.json. Self-contained quizzes avoid a shared-file bottleneck
// when many are authored at once.
export const InlineScripture = z.object({
  text: z.string().min(1),
  reference: z.string().min(1),
  translation: z.string().optional(),
});
export type InlineScripture = z.infer<typeof InlineScripture>;

export const TestBase = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  lang: z.string().default('en'),
  category: z.enum(['bible-character', 'spiritual-profile', 'bible-iq']),
  estimatedMinutes: z.number().int().positive(),
});

export type TestBase = z.infer<typeof TestBase>;

const ArchetypeQuestion = z.object({
  text: z.string().min(1),
  options: z.array(z.object({
    text: z.string().min(1),
    weights: z.record(z.string(), z.number()),
  })).min(2),
});

// A result carries scripture either by ref (into shared/scriptures.json) or
// inline. validate-tests.ts enforces that archetype results have one or the other.
const ArchetypeResult = z.object({
  name: z.string().min(1),
  emoji: z.string().min(1),
  traits: z.array(z.string().min(1)).min(1),
  description: z.string().min(1),
  scriptureRef: ScriptureRef.optional(),
  scripture: InlineScripture.optional(),
});

export const ArchetypeTest = TestBase.extend({
  mode: z.literal('archetype'),
  questions: z.array(ArchetypeQuestion).min(1),
  results: z.record(z.string(), ArchetypeResult),
});

export type ArchetypeTest = z.infer<typeof ArchetypeTest>;

const ProfileQuestion = z.object({
  text: z.string().min(1),
  options: z.array(z.object({
    text: z.string().min(1),
    weights: z.record(z.string(), z.number()),
  })).min(2),
});

const ProfileResult = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  scriptureRef: ScriptureRef.optional(),
  scripture: InlineScripture.optional(),
});

export const ProfileTest = TestBase.extend({
  mode: z.literal('profile'),
  dimensions: z.array(z.string().min(1)).min(1),
  questions: z.array(ProfileQuestion).min(1),
  results: z.record(z.string(), ProfileResult),
});

export type ProfileTest = z.infer<typeof ProfileTest>;

const KnowledgeQuestion = z.object({
  text: z.string().min(1),
  options: z.array(z.object({
    text: z.string().min(1),
    correct: z.boolean(),
    explanation: z.string().optional(),
  })).min(2),
});

export const KnowledgeTest = TestBase.extend({
  mode: z.literal('knowledge'),
  questions: z.array(KnowledgeQuestion).min(1),
  scoring: z.object({
    perfectMessage: z.string().min(1),
    gradeBands: z.array(z.object({
      min: z.number().int().min(0).max(100),
      max: z.number().int().min(0).max(100),
      label: z.string().min(1),
      message: z.string().min(1),
    })).min(1),
  }),
});

export type KnowledgeTest = z.infer<typeof KnowledgeTest>;

export const Test = z.discriminatedUnion('mode', [ArchetypeTest, ProfileTest, KnowledgeTest]);
export type Test = z.infer<typeof Test>;
