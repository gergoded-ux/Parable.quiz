// components/ShareBar.tsx
'use client';
import { useState } from 'react';
import { track } from '@vercel/analytics';
import { toBlob } from 'html-to-image';

const ICON = { width: 19, height: 19, viewBox: '0 0 24 24', 'aria-hidden': true } as const;
const STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const ShareIcon = () => (
  <svg {...ICON} {...STROKE}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></svg>
);
const PinterestIcon = () => (
  <svg {...ICON} fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345c-.091.378-.293 1.194-.333 1.361-.052.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" /></svg>
);
const XIcon = () => (
  <svg {...ICON} fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.666l-5.22-6.825L6.244 21.75H2.934l7.73-8.835L2.5 2.25h6.836l4.713 6.231 5.195-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" /></svg>
);
const FacebookIcon = () => (
  <svg {...ICON} fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
);
const LinkIcon = () => (
  <svg {...ICON} {...STROKE}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
);
const CheckIcon = () => (
  <svg {...ICON} {...STROKE}><polyline points="20 6 9 17 4 12" /></svg>
);

const BTN = 'flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5';
const PRIMARY = `${BTN} bg-brown text-white shadow-sm`;
const SECONDARY = `${BTN} border border-brown/30 bg-white text-brown shadow-sm`;

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
      const file = new File([blob], 'eikonia-card.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
      } else {
        const href = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = 'eikonia-card.png';
        a.click();
        URL.revokeObjectURL(href);
      }
    } catch (err) {
      console.error('shareCard failed', err);
      if (image) window.open(image, '_blank');
    }
  }

  return (
    <div className="my-6 flex flex-wrap items-center justify-center gap-2.5">
      {showCardShare && (
        <button onClick={shareCard} className={PRIMARY} aria-label="Share my card" title="Share my card">
          <ShareIcon />
        </button>
      )}
      <a
        href={`https://pinterest.com/pin/create/button/?url=${encUrl}&media=${encImage}&description=${encText}`}
        target="_blank" rel="noopener noreferrer"
        onClick={() => logShare('pinterest')}
        className={SECONDARY} aria-label="Save to Pinterest" title="Save to Pinterest"
      >
        <PinterestIcon />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`}
        target="_blank" rel="noopener noreferrer"
        onClick={() => logShare('x')}
        className={SECONDARY} aria-label="Share on X" title="Share on X"
      >
        <XIcon />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`}
        target="_blank" rel="noopener noreferrer"
        onClick={() => logShare('facebook')}
        className={SECONDARY} aria-label="Share on Facebook" title="Share on Facebook"
      >
        <FacebookIcon />
      </a>
      <button onClick={copy} className={SECONDARY} aria-label={copied ? 'Link copied' : 'Copy link'} title={copied ? 'Copied' : 'Copy link'}>
        {copied ? <CheckIcon /> : <LinkIcon />}
      </button>
    </div>
  );
}
