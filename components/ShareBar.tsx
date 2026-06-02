// components/ShareBar.tsx
'use client';
import { useState } from 'react';
import { track } from '@vercel/analytics';
import { toBlob } from 'html-to-image';

export function ShareBar({ url, text, image, cardEl, showCardShare }: { url: string; text: string; image?: string; cardEl?: HTMLElement | null; showCardShare?: boolean }) {
  const [copied, setCopied] = useState(false);

  const encUrl = encodeURIComponent(url);
  const encText = encodeURIComponent(text);
  const encImage = image ? encodeURIComponent(image) : '';

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    track('share_click', { platform: 'copy' });
    setTimeout(() => setCopied(false), 2000);
  }

  function logShare(platform: string) {
    track('share_click', { platform });
  }

  async function shareCard() {
    if (!cardEl) return;
    track('share_click', { platform: 'card' });
    try {
      const blob = await toBlob(cardEl, { pixelRatio: 3, cacheBust: true });
      if (!blob) throw new Error('snapshot failed');
      const file = new File([blob], 'parable-card.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
      } else {
        const href = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = 'parable-card.png';
        a.click();
        URL.revokeObjectURL(href);
      }
    } catch (err) {
      console.error('shareCard failed', err);
      // Fall back to the static OG card image (works even when the live
      // snapshot fails, e.g. tainted canvas from a CDN-served art image).
      if (image) window.open(image, '_blank');
    }
  }

  return (
    <div className="flex justify-center gap-3 my-6 max-w-xl mx-auto flex-wrap">
      {showCardShare && (
        <button onClick={shareCard} className="bg-brown text-white px-5 py-3 rounded-full text-sm font-semibold">
          ✦ Share my card
        </button>
      )}
      <a
        href={`https://pinterest.com/pin/create/button/?url=${encUrl}&media=${encImage}&description=${encText}`}
        target="_blank" rel="noopener noreferrer"
        onClick={() => logShare('pinterest')}
        className="bg-brown text-white px-5 py-3 rounded-full text-sm font-semibold"
      >
        📌 Pin it
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`}
        target="_blank" rel="noopener noreferrer"
        onClick={() => logShare('x')}
        className="bg-white text-brown border border-brown px-5 py-3 rounded-full text-sm font-semibold"
      >
        𝕏 Share
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`}
        target="_blank" rel="noopener noreferrer"
        onClick={() => logShare('facebook')}
        className="bg-white text-brown border border-brown px-5 py-3 rounded-full text-sm font-semibold"
      >
        📘 Facebook
      </a>
      <button onClick={copy} className="bg-white text-brown border border-brown px-5 py-3 rounded-full text-sm font-semibold">
        {copied ? '✓ Copied' : '🔗 Copy link'}
      </button>
    </div>
  );
}
