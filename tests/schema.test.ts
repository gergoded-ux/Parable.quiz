import { describe, it, expect } from 'vitest';
import { ScriptureRef, TestBase, ArchetypeTest, ProfileTest, KnowledgeTest, Test } from '@/lib/schema';

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

describe('ProfileTest', () => {
  const validProfile = {
    slug: 'spiritual-gifts-profile',
    title: 'Spiritual Gifts Profile',
    lang: 'en',
    category: 'spiritual-profile',
    estimatedMinutes: 7,
    mode: 'profile' as const,
    dimensions: ['teaching', 'mercy', 'leadership'],
    questions: [{
      text: 'When you see a need in the community, you...',
      options: [
        { text: 'Organize others to meet it', weights: { leadership: 2 } },
        { text: 'Meet it quietly yourself',   weights: { mercy: 2 } },
      ],
    }],
    results: {
      teaching: { name: 'Teaching', description: 'You make scripture clear.' },
      mercy: { name: 'Mercy', description: 'You feel others\' pain as your own.' },
      leadership: { name: 'Leadership', description: 'You see what could be and call others into it.' },
    },
  };

  it('accepts a valid profile test', () => {
    expect(ProfileTest.safeParse(validProfile).success).toBe(true);
  });
  it('requires at least one dimension', () => {
    const bad = { ...validProfile, dimensions: [] };
    expect(ProfileTest.safeParse(bad).success).toBe(false);
  });
});

describe('KnowledgeTest', () => {
  const validKnowledge = {
    slug: 'genesis-iq',
    title: 'Genesis IQ',
    lang: 'en',
    category: 'bible-iq',
    estimatedMinutes: 5,
    mode: 'knowledge' as const,
    questions: [{
      text: 'Who tempted Eve in the Garden?',
      options: [
        { text: 'The serpent', correct: true,  explanation: 'Genesis 3:1' },
        { text: 'A dragon',    correct: false },
      ],
    }],
    scoring: {
      perfectMessage: 'Eden-level scholar!',
      gradeBands: [
        { min: 0, max: 50,  label: 'Beginner', message: 'Time to crack open Genesis.' },
        { min: 51, max: 100, label: 'Strong',   message: 'You know the beginning.' },
      ],
    },
  };

  it('accepts a valid knowledge test', () => {
    expect(KnowledgeTest.safeParse(validKnowledge).success).toBe(true);
  });
  it('requires at least one question', () => {
    const bad = { ...validKnowledge, questions: [] };
    expect(KnowledgeTest.safeParse(bad).success).toBe(false);
  });
});

describe('Test (discriminated union)', () => {
  it('routes archetype mode to ArchetypeTest', () => {
    const result = Test.safeParse({
      slug: 's', title: 't', lang: 'en', category: 'bible-character', estimatedMinutes: 1,
      mode: 'archetype',
      questions: [{ text: 'q', options: [{ text: 'a', weights: { x: 1 } }, { text: 'b', weights: { y: 1 } }] }],
      results: { x: { name: 'X', emoji: '⚓', traits: ['a'], description: 'd', scriptureRef: 'r' } },
    });
    expect(result.success).toBe(true);
  });
  it('rejects unknown mode', () => {
    const result = Test.safeParse({
      slug: 's', title: 't', lang: 'en', category: 'bible-iq', estimatedMinutes: 1,
      mode: 'unknown',
    });
    expect(result.success).toBe(false);
  });
});
