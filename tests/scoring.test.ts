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
