import { z } from 'zod';

export const ScriptureRef = z.string().min(1);

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

const ArchetypeResult = z.object({
  name: z.string().min(1),
  emoji: z.string().min(1),
  traits: z.array(z.string().min(1)).min(1),
  description: z.string().min(1),
  scriptureRef: ScriptureRef,
});

export const ArchetypeTest = TestBase.extend({
  mode: z.literal('archetype'),
  questions: z.array(ArchetypeQuestion).min(1),
  results: z.record(z.string(), ArchetypeResult),
});

export type ArchetypeTest = z.infer<typeof ArchetypeTest>;
