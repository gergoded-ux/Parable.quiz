// tests/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { scoreArchetype } from '@/lib/scoring';
import type { ArchetypeTest } from '@/lib/schema';

const apostleTest: ArchetypeTest = {
  slug: 'wa', title: 'Which Apostle', lang: 'en',
  category: 'bible-character', estimatedMinutes: 3,
  mode: 'archetype',
  questions: [
    {
      text: 'q1',
      options: [
        { text: 'a', weights: { peter: 2, james: 1 } },
        { text: 'b', weights: { john: 2 } },
      ],
    },
    {
      text: 'q2',
      options: [
        { text: 'a', weights: { peter: 1 } },
        { text: 'b', weights: { james: 3 } },
      ],
    },
  ],
  results: {
    peter: { name: 'Peter', emoji: '\u{1FAA8}', traits: ['a'], description: 'd', scriptureRef: 'r' },
    james: { name: 'James', emoji: '⚓', traits: ['a'], description: 'd', scriptureRef: 'r' },
    john:  { name: 'John',  emoji: '\u{1F54A}', traits: ['a'], description: 'd', scriptureRef: 'r' },
  },
};

describe('scoreArchetype', () => {
  it('picks the result with the highest weighted sum', () => {
    // q1 -> option 0 (peter:2, james:1); q2 -> option 1 (james:3)
    // totals: peter=2, james=4, john=0 -> james wins
    expect(scoreArchetype(apostleTest, [0, 1])).toBe('james');
  });
  it('breaks ties by earliest-question-encountered order', () => {
    // q1 -> option 0 (peter:2, james:1); q2 -> option 0 (peter:1)
    // totals: peter=3, james=1, john=0 -> peter wins
    expect(scoreArchetype(apostleTest, [0, 0])).toBe('peter');
  });
  it('throws when answers length does not match questions', () => {
    expect(() => scoreArchetype(apostleTest, [0])).toThrow();
  });
  it('throws when an answer index is out of bounds', () => {
    expect(() => scoreArchetype(apostleTest, [0, 5])).toThrow();
  });
});

import { scoreProfile } from '@/lib/scoring';
import type { ProfileTest } from '@/lib/schema';

const profileTest: ProfileTest = {
  slug: 'p', title: 'P', lang: 'en',
  category: 'spiritual-profile', estimatedMinutes: 5,
  mode: 'profile',
  dimensions: ['teaching', 'mercy', 'leadership'],
  questions: [
    {
      text: 'q1',
      options: [
        { text: 'a', weights: { teaching: 2, mercy: 1 } },
        { text: 'b', weights: { leadership: 2 } },
      ],
    },
    {
      text: 'q2',
      options: [
        { text: 'a', weights: { mercy: 2 } },
        { text: 'b', weights: { teaching: 1 } },
      ],
    },
  ],
  results: {
    teaching: { name: 'Teaching', description: 'd' },
    mercy: { name: 'Mercy', description: 'd' },
    leadership: { name: 'Leadership', description: 'd' },
  },
};

describe('scoreProfile', () => {
  it('returns normalized 0-100 score per dimension', () => {
    // q1->0 (teaching:2, mercy:1); q2->0 (mercy:2)
    // raw: teaching=2, mercy=3, leadership=0; max=3 -> 67/100/0
    const r = scoreProfile(profileTest, [0, 0]);
    expect(r.teaching).toBe(67);
    expect(r.mercy).toBe(100);
    expect(r.leadership).toBe(0);
  });
  it('includes every declared dimension even if score is zero', () => {
    const r = scoreProfile(profileTest, [1, 1]);  // leadership:2 only
    expect(Object.keys(r).sort()).toEqual(['leadership', 'mercy', 'teaching']);
  });
  it('throws on answer-length mismatch', () => {
    expect(() => scoreProfile(profileTest, [0])).toThrow();
  });
});
