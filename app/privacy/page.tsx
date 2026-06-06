// app/privacy/page.tsx
import type { Metadata } from 'next';
import { HomeNav } from '@/components/HomeNav';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Eikonia handles your data: as little as possible. No account, no email required, no selling of personal information.',
};

export default function Privacy() {
  return (
    <>
      <HomeNav />
      <main className="mx-auto max-w-2xl px-8 py-12 leading-relaxed text-ink-soft">
        <h1 className="mb-1 text-3xl font-extrabold text-brown-dark">Privacy Policy</h1>
        <p className="mb-6 text-xs uppercase tracking-widest text-ink-mute">Last updated: June 2026</p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Privacy in a nutshell</h2>
        <p className="mb-4">
          Eikonia is built to collect as little about you as possible. You do not need an account or an
          email address to take any quiz. Your answers are scored in your own browser and are not saved
          on our servers. We use only privacy-friendly, anonymous analytics to understand general traffic.
          We do not sell your personal information. This policy explains the details.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Who we are</h2>
        <p className="mb-4">
          In this policy, &ldquo;Eikonia&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, and &ldquo;our&rdquo; refer to the operators of the website at
          eikonia.art. We are the data controller for the limited information described below. You can
          reach us any time at{' '}
          <a className="text-brown underline" href="mailto:hello@eikonia.art">hello@eikonia.art</a>.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Information we collect</h2>
        <p className="mb-2"><strong>Information you give us.</strong> You can use Eikonia without giving us any personal
          information. The only time you share anything directly is if you choose to email us, in which
          case we receive your email address and whatever you write.</p>
        <p className="mb-2"><strong>Your quiz answers.</strong> Quizzes are scored entirely in your browser. We do not
          collect or store your individual answers on our servers. When you reach a result, that result
          is encoded in the page link so you can share it. Anyone you give that link to can see the
          result it points to, so share thoughtfully.</p>
        <p className="mb-2"><strong>Information collected automatically.</strong> Like most websites, our hosting and
          analytics providers automatically receive standard technical data when you visit, such as your
          approximate region (derived from your IP address), browser and device type, the pages you view,
          and referring links. This is used in aggregate and is not used to identify you personally.</p>
        <p className="mb-4"><strong>Cookies and local storage.</strong> Core features work without advertising or tracking
          cookies. Your browser may store small amounts of data locally to make the site work smoothly.
          See the Cookies section below.</p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">How we use information</h2>
        <ul className="mb-4 list-disc space-y-1 pl-5">
          <li>To operate, maintain, and secure the website.</li>
          <li>To understand which quizzes are popular so we can improve and add new ones.</li>
          <li>To diagnose technical problems and protect against abuse or fraud.</li>
          <li>To respond to you if you contact us.</li>
          <li>To comply with the law where required.</li>
        </ul>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Cookies and similar technologies</h2>
        <p className="mb-4">
          Cookies are small files a site can store in your browser. We aim to keep our use minimal.
          Essential storage helps the site function. Analytics is measured in an anonymous, cookieless
          way where possible. If we ever serve advertising, ad partners may set their own cookies, as
          described next. You can block or delete cookies in your browser settings, and the quizzes will
          still work.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Analytics</h2>
        <p className="mb-4">
          We use Vercel Analytics and Vercel Speed Insights to measure traffic and performance. These are
          designed to be privacy-friendly: they report aggregate numbers (such as visit counts and page
          speed) and do not build an advertising profile of you or sell your data.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Advertising</h2>
        <p className="mb-4">
          Eikonia is free to use. To help cover costs, we may display advertising. If we do, third-party
          ad partners may use cookies or similar technologies to show more relevant ads and to measure
          performance, governed by their own privacy policies. You can opt out of interest-based
          advertising from many companies here:{' '}
          <a className="text-brown underline" href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer">optout.aboutads.info</a>,{' '}
          <a className="text-brown underline" href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer">youronlinechoices.eu</a> (EU), or via{' '}
          <a className="text-brown underline" href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">How we share information</h2>
        <p className="mb-4">
          We do not sell your personal information. We share data only with the service providers that run
          the site for us (for example, our hosting and analytics provider, Vercel), and only so they can
          provide those services. We may also disclose information if required by law, to enforce our
          terms, or to protect the rights and safety of our users. If Eikonia is ever involved in a
          merger or transfer, information may pass to the successor under this policy.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Third-party links</h2>
        <p className="mb-4">
          Share buttons and other links may take you to third-party sites such as X, Facebook, or
          Pinterest. Once you leave Eikonia, those sites are governed by their own privacy policies, and
          we are not responsible for their practices.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Data retention</h2>
        <p className="mb-4">
          Because we do not store your quiz answers or require an account, there is no personal profile to
          retain. Aggregate analytics are kept only as long as needed to understand trends. If you email
          us, we keep that correspondence as long as needed to respond and for our records.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Data security</h2>
        <p className="mb-4">
          The site is served over encrypted HTTPS, and we rely on reputable infrastructure providers. No
          method of transmission or storage is perfectly secure, but collecting very little is our first
          and best protection.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">International data transfers</h2>
        <p className="mb-4">
          Eikonia is available worldwide, and our providers may process technical data on servers in
          countries other than your own. Where required, such transfers rely on appropriate safeguards.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Your rights (EEA and UK)</h2>
        <p className="mb-2">
          If you are in the European Economic Area or the United Kingdom, you have the right to access,
          correct, delete, restrict, or object to the processing of your personal data, and the right to
          data portability. Our legal basis for the limited processing we do is our legitimate interest
          in operating and improving the site, and your consent where applicable (for example, advertising
          cookies). You can withdraw consent at any time.
        </p>
        <p className="mb-4">
          Because we hold almost no personal data, in many cases we may have nothing on file tied to you.
          You may still contact us to ask, and you have the right to lodge a complaint with your local
          data protection authority.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Your rights (California)</h2>
        <p className="mb-4">
          If you are a California resident, you have the right to know what personal information we
          collect, to request deletion or correction, and to opt out of the sale or sharing of personal
          information. We do not sell or share your personal information as those terms are defined under
          California law, and we will not discriminate against you for exercising your rights. To make a
          request, email us at the address below.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Children</h2>
        <p className="mb-4">
          Eikonia is intended for a general audience and is not directed at children under 13. We do not
          knowingly collect personal information from children. If you believe a child has provided us
          personal information, please contact us and we will delete it.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Do Not Track and Global Privacy Control</h2>
        <p className="mb-4">
          Some browsers send a &ldquo;Do Not Track&rdquo; or Global Privacy Control signal. Because we do not track
          you across other websites or build advertising profiles ourselves, our core behavior is the
          same either way. Where these signals legally count as an opt-out, we honor them.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Changes to this policy</h2>
        <p className="mb-4">
          We may update this policy as the site evolves or the law changes. When we do, we will revise the
          date at the top. Significant changes may be highlighted on the site.
        </p>

        <h2 className="mb-2 mt-8 text-xl font-bold text-brown-dark">Contact us</h2>
        <p className="mb-4">
          For any privacy question or request, email{' '}
          <a className="text-brown underline" href="mailto:hello@eikonia.art">hello@eikonia.art</a>. We will
          respond within a reasonable time.
        </p>
      </main>
    </>
  );
}
