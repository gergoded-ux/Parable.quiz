// app/about/page.tsx
import { HomeNav } from '@/components/HomeNav';

export const metadata = { title: 'About Parable' };

export default function About() {
  return (
    <>
      <HomeNav />
      <main className="max-w-2xl mx-auto px-8 py-12 text-ink-soft leading-relaxed">
        <h1 className="text-3xl font-extrabold text-brown-dark mb-4">About Parable</h1>
        <p className="mb-4">
          Parable is a collection of free Christian quizzes — built so you can see something
          true about yourself reflected in scripture, then share it with a friend.
        </p>
        <p className="mb-4">
          No sign-ups, no email walls, no algorithms guessing what you want. Just questions,
          a result, and a verse.
        </p>
        <p>
          Made with care. New quizzes added each week.
        </p>
      </main>
    </>
  );
}
