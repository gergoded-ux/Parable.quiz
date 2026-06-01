// components/ShareBar.tsx
'use client';
import { useState } from 'react';
import { track } from '@vercel/analytics';

export function ShareBar({ url, text, image }: { url: string; text: string; image?: string }) {
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

  return (
    <div className="flex justify-center gap-3 my-6 max-w-xl mx-auto flex-wrap">
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
