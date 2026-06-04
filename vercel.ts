// vercel.ts
import { type VercelConfig, routes } from '@vercel/config/v1';

export const config: VercelConfig = {
  buildCommand: 'pnpm validate:tests && pnpm build:art && pnpm build',
  framework: 'nextjs',
  headers: [
    routes.cacheControl('/og/(.*)', { public: true, maxAge: '1 week' }),
    // Reward/cover/frame images are served from /public (same origin) until
    // CARD_ART_BASE points them at Cloudflare. Cache them at the edge and in the
    // browser so repeat views do not re-download (data transfer is the main cost).
    routes.cacheControl('/results/(.*)', { public: true, maxAge: '1 week' }),
    routes.cacheControl('/quizzes/(.*)', { public: true, maxAge: '1 week' }),
    routes.cacheControl('/cards/(.*)', { public: true, maxAge: '1 week' }),
  ],
};
