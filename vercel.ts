// vercel.ts
import { type VercelConfig, routes } from '@vercel/config/v1';

export const config: VercelConfig = {
  buildCommand: 'pnpm validate:tests && pnpm build:art && pnpm build',
  framework: 'nextjs',
  headers: [
    routes.cacheControl('/og/(.*)', { public: true, maxAge: '1 week' }),
  ],
};
