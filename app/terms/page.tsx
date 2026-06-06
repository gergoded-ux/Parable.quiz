// app/terms/page.tsx
import type { Metadata } from 'next';
import { HomeNav } from '@/components/HomeNav';

export const metadata: Metadata = {
  title: 'Terms of Use',
  alternates: { canonical: '/terms' },
  description: 'The simple terms for using Eikonia: free quizzes for personal reflection, not professional or pastoral advice.',
};

export default function Terms() {
  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-2xl px-8 py-12 leading-relaxed text-ink-soft">
        <h1 className="mb-1 text-3xl font-extrabold text-brown-dark">Terms of Use</h1>
        <p className="mb-6 text-xs uppercase tracking-widest text-ink-mute">Last updated: June 2026</p>

        <p className="mb-4">
          By using Eikonia you agree to these terms. If you do not agree, please do not use the site.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">What Eikonia is</h2>
        <p className="mb-4">
          Eikonia offers free quizzes for personal reflection and entertainment, paired with scripture.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Not professional advice</h2>
        <p className="mb-4">
          Quiz results are for reflection only. They are not medical, psychological, legal, financial, or
          pastoral advice, and they are not a substitute for care from a qualified professional or your
          own faith community. If you are struggling, please reach out to someone who can help.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Acceptable use</h2>
        <p className="mb-4">
          Eikonia is for personal, non-commercial use. Please do not scrape the site, copy quizzes or
          artwork wholesale, or republish our content as your own.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Content and ownership</h2>
        <p className="mb-4">
          The quizzes, text, and card artwork are the property of Eikonia, except for scripture
          quotations, which are taken from the public-domain American Standard Version. You are welcome to
          share your own result cards and links.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">No warranty</h2>
        <p className="mb-4">
          The site is provided as is, without warranties of any kind. We do not guarantee that it will
          always be accurate, available, or error-free.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Limitation of liability</h2>
        <p className="mb-4">
          To the fullest extent allowed by law, Eikonia is not liable for any damages arising from your
          use of the site.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Changes</h2>
        <p className="mb-4">
          We may update these terms from time to time. The date at the top shows the latest version.
        </p>

        <p className="mt-8 text-sm">
          Questions? Email <a className="text-brown underline" href="mailto:hello@eikonia.art">hello@eikonia.art</a>.
        </p>
      </main>
    </>
  );
}
