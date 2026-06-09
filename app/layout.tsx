// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { SiteFooter } from '@/components/SiteFooter';
import { FeedbackWidget } from '@/components/FeedbackWidget';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: { default: "Eikonia: What's your reflection?", template: '%s · Eikonia' },
  description: 'Free Christian quizzes that reveal what scripture says about you. No sign-up.',
  metadataBase: new URL('https://eikonia.art'),
  openGraph: { siteName: 'Eikonia', type: 'website', images: ['/home-bg.webp'] },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [
      { url: '/icon.webp', type: 'image/webp', sizes: '96x96' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
  },
  verification: { google: 'OAriYbpMbxwcehUM3U8zm5-fxE8fbNKdkhPqz-pN0mI' },
};

const siteLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': 'https://eikonia.art/#org', name: 'Eikonia', url: 'https://eikonia.art', logo: 'https://eikonia.art/logo.webp', description: 'Free Christian quizzes that reveal what scripture says about you.' },
    { '@type': 'WebSite', '@id': 'https://eikonia.art/#website', name: 'Eikonia', url: 'https://eikonia.art', inLanguage: 'en', publisher: { '@id': 'https://eikonia.art/#org' } },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
        {children}
        <SiteFooter />
        <FeedbackWidget />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
