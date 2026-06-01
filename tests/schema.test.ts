import { describe, it, expect } from 'vitest';
import { ScriptureRef, TestBase, ArchetypeTest } from '@/lib/schema';

describe('ScriptureRef', () => {
  it('accepts non-empty string', () => {
    expect(ScriptureRef.safeParse('matt-16-18').success).toBe(true);
  });
  it('rejects empty string', () => {
    expect(ScriptureRef.safeParse('').success).toBe(false);
  });
});

describe('TestBase', () => {
  it('accepts minimal valid test base', () => {
    const result = TestBase.safeParse({
      slug: 'which-apostle-are-you',
      title: 'Which Apostle Are You?',
      lang: 'en',
      category: 'bible-character',
      estimatedMinutes: 4,
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid category', () => {
    const result = TestBase.safeParse({
      slug: 's', title: 't', lang: 'en',
      category: 'not-a-category', estimatedMinutes: 4,
    });
    expect(result.success).toBe(false);
  });
  it('defaults lang to "en" when missing', () => {
    const result = TestBase.safeParse({
      slug: 's', title: 't',
      category: 'bible-iq', estimatedMinutes: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.lang).toBe('en');
  });
});

describe('ArchetypeTest', () => {
  const validArchetype = {
    slug: 'which-apostle-are-you',
    title: 'Which Apostle Are You?',
    lang: 'en',
    category: 'bible-character',
    estimatedMinutes: 4,
    mode: 'archetype' as const,
    questions: [
      {
        text: 'When a friend is hurting, you...',
        options: [
          { text: 'Sit with them quietly', weights: { john: 2 } },
          { text: 'Ask hard questions',     weights: { peter: 2 } },
        ],
      },
    ],
    results: {
      peter: {
        name: 'Peter the Bold', emoji: '\u{1FAA8}',
        traits: ['Loyal', 'Impulsive', 'All-in'],
        description: 'Big heart, big mistakes — and Jesus loved you anyway.',
        scriptureRef: 'matt-16-18',
      },
      john: {
        name: 'John the Beloved', emoji: '\u{1F54A}\u{FE0F}',
        traits: ['Tender', 'Steady', 'Present'],
        description: 'You hold the head of Jesus when others run.',
        scriptureRef: 'john-13-23',
      },
    },
  };

  it('accepts a valid archetype test', () => {
    const result = ArchetypeTest.safeParse(validArchetype);
    expect(result.success).toBe(true);
  });
  it('rejects when mode is wrong', () => {
    const bad = { ...validArchetype, mode: 'profile' };
    expect(ArchetypeTest.safeParse(bad).success).toBe(false);
  });
  it('rejects when a result key has no traits', () => {
    const bad = { ...validArchetype, results: { ...validArchetype.results, peter: { ...validArchetype.results.peter, traits: [] } } };
    expect(ArchetypeTest.safeParse(bad).success).toBe(false);
  });
});
