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
