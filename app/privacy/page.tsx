// app/privacy/page.tsx
import type { Metadata } from 'next';
import { HomeNav } from '@/components/HomeNav';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Eikonia handles your data: as little as possible. No account, no email required.',
};

export default function Privacy() {
  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-2xl px-8 py-12 leading-relaxed text-ink-soft">
        <h1 className="mb-1 text-3xl font-extrabold text-brown-dark">Privacy Policy</h1>
        <p className="mb-6 text-xs uppercase tracking-widest text-ink-mute">Last updated: June 2026</p>

        <p className="mb-4">
          The short version: we collect as little as possible. You do not need an account or an email
          address to use Eikonia.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Your quiz answers</h2>
        <p className="mb-4">
          Quizzes are scored in your browser. We do not store your individual answers on our servers.
          Your result is encoded in the page link so you can share it, which means anyone you give the
          link to can see that result.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Analytics</h2>
        <p className="mb-4">
          We use privacy-friendly, aggregate analytics (Vercel Analytics and Speed Insights) to see how
          many people visit and which quizzes are popular. This data is anonymous, is not sold, and is
          not used to build an advertising profile of you.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Cookies and advertising</h2>
        <p className="mb-4">
          Core features work without tracking cookies. If we ever display advertising, those ad partners
          may set their own cookies and collect data under their own privacy policies, and we will note
          it here.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Third parties</h2>
        <p className="mb-4">
          The site is hosted and measured by Vercel. Share buttons open links to platforms like X,
          Facebook, and Pinterest, which have their own policies once you leave Eikonia.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Children</h2>
        <p className="mb-4">
          Eikonia is not directed at children under 13, and we do not knowingly collect personal
          information from them.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Your choices</h2>
        <p className="mb-4">
          You can use the site without giving us any personal information. You can also block analytics
          with your browser settings or an ad blocker, and the quizzes will still work.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Changes</h2>
        <p className="mb-4">
          We may update this policy from time to time. The date at the top shows the latest version.
        </p>

        <p className="mt-8 text-sm">
          Questions about privacy? Email <a className="text-brown underline" href="mailto:hello@eikonia.art">hello@eikonia.art</a>.
        </p>
      </main>
    </>
  );
}
