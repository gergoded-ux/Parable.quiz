// app/faq/page.tsx
import type { Metadata } from 'next';
import { HomeNav } from '@/components/HomeNav';

export const metadata: Metadata = {
  title: 'FAQ',
  alternates: { canonical: '/faq' },
  description: 'Common questions about Eikonia: is it free, do you store my answers, which Bible translation, how results work, and more.',
};

const FAQ: { q: string; a: string }[] = [
  { q: "Is Eikonia free?", a: "Yes, completely. Every quiz is free, with no sign-up and no paywall. We may show ads to help cover costs, but the quizzes stay free." },
  { q: "Do I need an account?", a: "No. You can take any quiz and get your result without creating an account or giving an email address." },
  { q: "Are these quizzes scientifically or theologically authoritative?", a: "No. They are written for reflection and encouragement, not to diagnose you or settle doctrine. Take them lightly, keep what helps, and leave the rest." },
  { q: "How do the results work, and how accurate are they?", a: "For the personality-style quizzes, your answers are matched to the closest biblical figure, theme, or trait. For Bible IQ quizzes, you simply get a score. They are meant to spark reflection, not to measure you precisely." },
  { q: "Is this a substitute for counseling, therapy, or pastoral care?", a: "No. Eikonia is for reflection and encouragement only. If you are struggling, please reach out to a qualified professional or your faith community." },
  { q: "Do you store or sell my answers?", a: "No. Quizzes are scored in your browser, we do not store your individual answers on our servers, and we never sell personal information. Your result is encoded in the page link so you can share it. See our Privacy Policy for the details." },
  { q: "Which Bible translation do you use, and why?", a: "All verses are quoted from the American Standard Version (ASV). It is a faithful, respected translation that is in the public domain, so we can share it freely without licensing limits." },
  { q: "Can I share my result?", a: "Yes. Every result comes with a shareable card and a link you can post anywhere." },
  { q: "Can I use Eikonia with my small group, class, or church?", a: "Please do. Share the quizzes and your result cards freely for personal and group use. Just do not copy our quizzes or artwork wholesale or republish them as your own; link back to us instead. See our Terms of Use." },
  { q: "Can I take a quiz more than once?", a: "As many times as you like. Nothing is locked, and answering honestly on a second try is completely fine." },
  { q: "What devices and browsers are supported?", a: "Any modern browser on phone, tablet, or desktop. There is nothing to install." },
  { q: "How often are new quizzes added?", a: "Regularly. We add new quizzes and refine existing ones over time." },
  { q: "The result did not feel right. What should I do?", a: "These quizzes are light mirrors, not verdicts. Take what is helpful, leave the rest, and feel free to try another one." },
  { q: "Who makes Eikonia?", a: "A small independent team that loves scripture and a good quiz. Real people research, write, and review every quiz, result, and verse before it goes live." },
  { q: "I found a mistake or have an idea. How do I tell you?", a: "Please email hello@eikonia.art. We read everything, including corrections and quiz suggestions." },
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
