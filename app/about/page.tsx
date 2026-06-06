// app/about/page.tsx
import type { Metadata } from 'next';
import { HomeNav } from '@/components/HomeNav';

export const metadata: Metadata = {
  title: 'About',
  alternates: { canonical: '/about' },
  description: 'What Eikonia is, how the quizzes are made, and what the results are (and are not) meant to be.',
};

export default function About() {
  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-2xl px-8 py-12 leading-relaxed text-ink-soft">
        <h1 className="mb-4 text-3xl font-extrabold text-brown-dark">About Eikonia</h1>

        <p className="mb-4">
          Eikonia is a collection of free Christian quizzes. The name is the Greek word for
          <em> image</em>, a nod to the old belief that every person carries the image of God
          (Genesis 1:27). Each quiz is a small mirror: answer honestly, and see something true about
          yourself reflected back in scripture.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">How it works</h2>
        <p className="mb-4">
          No sign-ups, no email walls, no algorithm guessing what you want. Answer a handful of
          questions, get a result with a verse, and a collectible card you can keep or share with a
          friend. That is the whole thing.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">How the quizzes are made</h2>
        <p className="mb-4">
          Every quiz is written by hand. The personality-style quizzes map your answers to a biblical
          figure, theme, or trait. The Bible IQ quizzes are simple scored knowledge checks. Scripture
          is quoted from the American Standard Version (ASV), which is in the public domain.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">What the results mean</h2>
        <p className="mb-4">
          These quizzes are for reflection and encouragement. They are not a diagnosis, a doctrine, or
          a verdict on your faith. Take them lightly, keep what helps, and leave the rest. If a result
          ever feels heavy, talk it over with someone you trust.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Our heart</h2>
        <p className="mb-4">
          We want scripture to feel personal, not distant. New quizzes are added regularly. If one of
          them helps you see yourself, or God, a little more clearly, that is the point.
        </p>

        <p className="mt-8 text-sm">
          Questions or ideas? Email <a className="text-brown underline" href="mailto:hello@eikonia.art">hello@eikonia.art</a>{' '}
          or visit the <a className="text-brown underline" href="/contact">contact page</a>.
        </p>
      </main>
    </>
  );
}
