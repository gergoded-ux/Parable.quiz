// app/faq/page.tsx
import type { Metadata } from 'next';
import { HomeNav } from '@/components/HomeNav';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Common questions about Eikonia: is it free, do you store my answers, which Bible translation, and more.',
};

const FAQ: { q: string; a: string }[] = [
  { q: 'Is it free?', a: 'Yes. Every quiz is completely free, with no sign-up and no paywall.' },
  { q: 'Do I need an account?', a: 'No. You can take any quiz and get your result without creating an account or giving an email address.' },
  { q: 'Are these quizzes scientifically or theologically authoritative?', a: 'No. They are written for reflection and encouragement, not to diagnose you or define doctrine. Take them lightly and keep what helps.' },
  { q: 'Do you store my answers?', a: 'No. Quizzes are scored in your browser, and we do not store your individual answers on our servers. Your result is encoded in the page link so you can share it.' },
  { q: 'Which Bible translation do you use?', a: 'All verses are quoted from the American Standard Version (ASV), which is in the public domain.' },
  { q: 'Can I share my result?', a: 'Yes. Every result comes with a shareable card and a link you can post anywhere.' },
  { q: 'How often are new quizzes added?', a: 'Regularly. We add new quizzes and refine existing ones over time.' },
  { q: 'Who makes Eikonia?', a: 'A small independent team that loves scripture and a good quiz. You can reach us any time.' },
  { q: 'I found a mistake or have an idea. How do I tell you?', a: 'Please email hello@eikonia.art. We read everything, including corrections and quiz suggestions.' },
];

export default function FAQPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeNav />
      <main className="mx-auto max-w-2xl px-8 py-12 leading-relaxed text-ink-soft">
        <h1 className="mb-6 text-3xl font-extrabold text-brown-dark">Frequently asked questions</h1>
        <dl>
          {FAQ.map(({ q, a }) => (
            <div key={q} className="mb-6">
              <dt className="mb-1 text-lg font-bold text-brown-dark">{q}</dt>
              <dd>{a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm">
          Still have a question? Email <a className="text-brown underline" href="mailto:hello@eikonia.art">hello@eikonia.art</a>.
        </p>
      </main>
    </>
  );
}
