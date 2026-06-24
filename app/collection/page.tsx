import type { Metadata } from 'next';
import { HomeNav } from '@/components/HomeNav';
import { HomeBackground } from '@/components/HomeBackground';
import { CollectionView } from '@/components/CollectionView';

// Personal, localStorage-backed page: nothing for crawlers to index.
export const metadata: Metadata = {
  title: 'My Cards',
  description: 'The quiz cards you have collected on Eikonia.',
  alternates: { canonical: '/collection' },
  robots: { index: false, follow: false },
};

export default function CollectionPage() {
  return (
    <>
      <HomeBackground />
      <HomeNav />
      <main className="px-6 py-10">
        <CollectionView />
      </main>
    </>
  );
}
