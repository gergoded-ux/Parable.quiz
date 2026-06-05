// app/contact/page.tsx
import type { Metadata } from 'next';
import { HomeNav } from '@/components/HomeNav';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Eikonia: corrections, quiz ideas, partnerships, and privacy requests.',
};

export default function Contact() {
  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-2xl px-8 py-12 leading-relaxed text-ink-soft">
        <h1 className="mb-4 text-3xl font-extrabold text-brown-dark">Contact</h1>

        <p className="mb-4">
          The best way to reach us is email:{' '}
          <a className="font-semibold text-brown underline" href="mailto:hello@eikonia.art">hello@eikonia.art</a>
        </p>

        <p className="mb-4">We would love to hear from you about:</p>
        <ul className="mb-4 list-disc space-y-1 pl-5">
          <li>Corrections to a quiz, verse, or result</li>
          <li>Ideas for new quizzes</li>
          <li>Partnerships, press, or licensing</li>
          <li>Privacy questions or requests</li>
        </ul>

        <p>
          We read every message. Response times vary, but real people are on the other end.
        </p>
      </main>
    </>
  );
}
