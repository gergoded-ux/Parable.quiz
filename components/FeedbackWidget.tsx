// components/FeedbackWidget.tsx
'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@vercel/analytics';

const TYPES = [
  { key: 'idea', label: '\u{1F4A1} Idea' },
  { key: 'bug', label: '\u{1F41B} Bug' },
  { key: 'praise', label: '\u{1F64F} Praise' },
] as const;

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>('idea');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [pulse, setPulse] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && status !== 'sending') setOpen(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, status]);

  // One-time gentle nudge on result pages: ~5s after load, pulse the feedback
  // button so people notice they can leave a note. Never repeats (localStorage
  // 'seen'); skipped if they've already opened it or prefer reduced motion.
  useEffect(() => {
    if (!/^\/q\/[^/]+\/r\/[^/]+$/.test(pathname || '')) return;
    try { if (localStorage.getItem('eikonia:fb:seen')) return; } catch {}
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => {
      setPulse(true);
      try { localStorage.setItem('eikonia:fb:seen', '1'); } catch {}
    }, 5000);
    return () => clearTimeout(t);
  }, [pathname]);

  // Opening (or ever having opened) the widget cancels the nudge for good.
  function openWidget() {
    setPulse(false);
    try { localStorage.setItem('eikonia:fb:seen', '1'); } catch {}
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const msg = message.trim();
    if (!msg) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ type, message: msg, email: email.trim(), hp, path: typeof location !== 'undefined' ? location.pathname : '' }),
      });
      if (!res.ok) throw new Error();
      track('feedback_sent', { type });
      setStatus('sent');
      setMessage('');
      setEmail('');
      setTimeout(() => { setOpen(false); setStatus('idle'); }, 1900);
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <button
        onClick={openWidget}
        onAnimationEnd={() => setPulse(false)}
        aria-label="Send feedback"
        className={`fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-brown/25 bg-white/95 px-4 py-2.5 text-sm font-semibold text-brown shadow-md backdrop-blur transition-transform hover:-translate-y-0.5${pulse ? ' fb-nudge' : ''}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Feedback
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Send feedback"
          onClick={() => { if (status !== 'sending') setOpen(false); }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-cream-1 p-6 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-brown-dark">Share feedback</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-2xl leading-none text-ink-mute hover:text-brown">&times;</button>
            </div>

            {status === 'sent' ? (
              <p className="py-8 text-center text-brown">&#x1F64F; Thank you &mdash; we read every note.</p>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div className="flex gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setType(t.key)}
                      className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${type === t.key ? 'bg-brown text-white' : 'border border-brown/25 bg-white text-brown'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  maxLength={2000}
                  rows={4}
                  placeholder="What's working, what's not, or an idea..."
                  className="w-full resize-none rounded-xl border border-brown/20 bg-white p-3 text-sm text-ink focus:border-brown focus:outline-none"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional, for a reply)"
                  className="w-full rounded-xl border border-brown/20 bg-white p-3 text-sm text-ink focus:border-brown focus:outline-none"
                />

                {/* honeypot: hidden from people, tempting to bots */}
                <input
                  type="text"
                  name="website"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />

                {status === 'error' && <p className="text-sm text-red-700">Something went wrong. Please try again.</p>}

                <button
                  type="submit"
                  disabled={status === 'sending' || !message.trim()}
                  className="w-full rounded-full bg-brown px-6 py-3 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {status === 'sending' ? 'Sending…' : 'Send feedback'}
                </button>
              </form>
            )}
            <p className="mt-3 text-center text-xs text-ink-mute">No account needed. Your email is only used to reply.</p>
          </div>
        </div>
      )}
    </>
  );
}
