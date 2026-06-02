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

import { scoreKnowledge } from '@/lib/scoring';
import type { KnowledgeTest } from '@/lib/schema';

const knowledgeTest: KnowledgeTest = {
  slug: 'g', title: 'G', lang: 'en',
  category: 'bible-iq', estimatedMinutes: 4,
  mode: 'knowledge',
  questions: [
    { text: 'q1', options: [{ text: 'a', correct: true }, { text: 'b', correct: false }] },
    { text: 'q2', options: [{ text: 'a', correct: false }, { text: 'b', correct: true }] },
    { text: 'q3', options: [{ text: 'a', correct: true }, { text: 'b', correct: false }] },
    { text: 'q4', options: [{ text: 'a', correct: false }, { text: 'b', correct: true }] },
  ],
  scoring: {
    perfectMessage: 'Perfect!',
    gradeBands: [
      { min: 0,  max: 50,  label: 'Beginner', message: 'Keep reading.' },
      { min: 51, max: 99,  label: 'Strong',   message: 'Nicely done.' },
      { min: 100, max: 100, label: 'Master', message: 'Flawless.' },
    ],
  },
};

describe('scoreKnowledge', () => {
  it('returns correct/total/percent/band', () => {
    const r = scoreKnowledge(knowledgeTest, [0, 1, 0, 1]);  // all correct
    expect(r.correct).toBe(4);
    expect(r.total).toBe(4);
    expect(r.percent).toBe(100);
    expect(r.band.label).toBe('Master');
  });
  it('selects the right band for a mid score', () => {
    const r = scoreKnowledge(knowledgeTest, [0, 0, 0, 0]);  // 2/4 -> 50%
    expect(r.percent).toBe(50);
    expect(r.band.label).toBe('Beginner');
  });
  it('returns Strong for 51-99', () => {
    const r = scoreKnowledge(knowledgeTest, [0, 1, 0, 0]);  // 3/4 -> 75%
    expect(r.band.label).toBe('Strong');
  });
});

import { scoreArchetypeDetailed } from '@/lib/scoring';

describe('scoreArchetypeDetailed', () => {
  it('returns winner, matchPct and ordered affinity', () => {
    // reuse apostleTest from earlier in this file: q1->0 (peter2,james1), q2->1 (james3)
    // totals: peter=2, james=4, john=0; total=6 -> james 67%, peter 33%, john 0%
    const r = scoreArchetypeDetailed(apostleTest, [0, 1]);
    expect(r.winner).toBe('james');
    expect(r.matchPct).toBe(67);
    expect(r.affinity[0]).toEqual({ key: 'james', name: 'James', pct: 67 });
    expect(r.affinity[1]).toEqual({ key: 'peter', name: 'Peter', pct: 33 });
    expect(r.affinity.find(a => a.key === 'john')?.pct).toBe(0);
  });
  it('matchPct is 100 when one result takes all weight', () => {
    const r = scoreArchetypeDetailed(apostleTest, [0, 0]); // peter3, james1 -> total 4, peter 75
    expect(r.winner).toBe('peter');
    expect(r.matchPct).toBe(75);
  });
});

import { scoreProfileDetailed } from '@/lib/scoring';

describe('scoreProfileDetailed', () => {
  it('returns the top dimension, its raw-share matchPct, and full scores', () => {
    // reuse profileTest: answers [0,0] -> raw teaching=2, mercy=3, leadership=0 (sum 5)
    // top=mercy, matchPct=60 (raw share); normalized display scores stay teaching 67, leadership 0
    const r = scoreProfileDetailed(profileTest, [0, 0]);
    expect(r.top).toBe('mercy');
    expect(r.matchPct).toBe(60);
    expect(r.scores.teaching).toBe(67);
    expect(r.scores.leadership).toBe(0);
  });
  it('matchPct is 100 when all weight lands on one dimension', () => {
    const lopsided: ProfileTest = {
      slug: 'lp', title: 'LP', lang: 'en',
      category: 'spiritual-profile', estimatedMinutes: 1,
      mode: 'profile',
      dimensions: ['focus', 'other'],
      questions: [
        { text: 'q1', options: [{ text: 'a', weights: { focus: 3 } }, { text: 'b', weights: { other: 2 } }] },
        { text: 'q2', options: [{ text: 'a', weights: { focus: 2 } }, { text: 'b', weights: { other: 1 } }] },
      ],
      results: {
        focus: { name: 'Focus', description: 'd' },
        other: { name: 'Other', description: 'd' },
      },
    };
    const r = scoreProfileDetailed(lopsided, [0, 0]); // focus=5, other=0
    expect(r.top).toBe('focus');
    expect(r.matchPct).toBe(100);
  });
});
