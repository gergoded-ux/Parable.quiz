# Social auto-poster — setup

A daily Vercel cron reads the Notion **Social Media Post Tracker**, posts the rows
that are **Status = Scheduled** and due today to **Threads / Facebook / Instagram**
via the Graph APIs, and writes the result back (`Published` + `Live URL`, or
`In review` + an error note). Images are rendered on demand by `/api/social-image`
(no temp files), so Meta can fetch a public JPEG.

**Nothing posts until** (a) the env vars below are set, and (b) you move a row from
`Draft` to `Scheduled`. That status flip is your last-look before anything goes live.

## How a row maps to a post
| Platform | What posts | Image |
|---|---|---|
| Threads | `Caption` as the post; if `Post URL` is set, it is posted as the **first reply** (links are suppressed in the body) | only if `Image` is set |
| Facebook | `Caption` + `Post URL` as a Page post | photo post if `Image` is set |
| Instagram | `Caption`; **requires an image** | `Image` if set, else the titled tile derived from the quiz slug in `Post URL` |
| Pinterest | `Caption` as the pin description, `Post URL` as the link | `Image` if set, else the titled tile from the quiz slug; pinned to `PINTEREST_BOARD_ID` |
| Reddit / X / LinkedIn / etc. | skipped (handled elsewhere) | — |

`Image` accepts any `/api/social-image?...` URL:
- `…?type=tile&slug=<slug>` — the titled cover-card (1080x1350, default for quiz rows)
- `…?type=card&slug=<slug>&key=<result>&m=96` — a full reward card (grab from the Creative Studio)
- `…?type=cover&slug=<slug>` — the bare cover art

## Environment variables (set in Vercel → Project → Settings → Environment Variables)
| Var | What it is |
|---|---|
| `CRON_SECRET` | Any long random string. Vercel sends it to the cron as a Bearer token; the route rejects anything else. |
| `NOTION_TOKEN` | Notion internal-integration secret (`ntn_…`). |
| `NOTION_DB_ID` | The tracker database id: `755eb981fa5f46cfb2f24df72e02ded2`. |
| `THREADS_USER_ID` | Your Threads user id. |
| `THREADS_TOKEN` | Long-lived Threads access token. |
| `META_PAGE_ID` | The Facebook Page id. |
| `META_PAGE_TOKEN` | Long-lived Page access token (also used to publish to Instagram). |
| `IG_USER_ID` | The Instagram Business account id linked to the Page. |
| `PINTEREST_TOKEN` | Pinterest API v5 access token. |
| `PINTEREST_BOARD_ID` | The board pins are created on (from `GET /v5/boards`). |
| `SITE_URL` | Optional. Defaults to `https://eikonia.art`. The origin platforms fetch images from. |

---

## 1. Notion integration (5 min)
1. Go to **notion.so/my-integrations** → **New integration** → name it "Eikonia poster", internal, in your workspace.
2. Copy the **Internal Integration Secret** (`ntn_…`) → this is `NOTION_TOKEN`.
3. Open the **Social Media Post Tracker** database in Notion → top-right **•••** → **Connections** → **Connect to** → "Eikonia poster". (Without this the integration can't see the database.)
4. `NOTION_DB_ID` is already known: `755eb981fa5f46cfb2f24df72e02ded2`.

## 2. Meta app + Facebook Page + Instagram (30–45 min)
1. **developers.facebook.com** → **My Apps** → **Create App** → use case **"Other"** → type **Business**.
2. In the app, add products/use cases: **Facebook Login for Business**, and the **Instagram** API (Instagram Graph API / "Instagram API with Facebook Login").
3. Make sure the Eikonia **Instagram** account is a **Business** (or Creator) account, and is **linked to the Eikonia Facebook Page** (IG app → Settings → linked Page, or Page → linked accounts).
4. Get a **Page access token**:
   - Use the **Graph API Explorer** (developers.facebook.com/tools/explorer): select your app, "Get User Access Token" with scopes `pages_show_list`, `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`, `business_management`.
   - Call `GET /me/accounts` → copy your Page's `id` (`META_PAGE_ID`) and its `access_token`.
   - **Make it long-lived:** exchange the short token at `GET /oauth/access_token?grant_type=fb_exchange_token&client_id=<APP_ID>&client_secret=<APP_SECRET>&fb_exchange_token=<SHORT_TOKEN>`, then re-fetch `/me/accounts` with the long-lived user token to get a long-lived **Page** token (`META_PAGE_TOKEN`). Page tokens derived this way effectively don't expire.
5. Get the **IG user id**: `GET /<PAGE_ID>?fields=instagram_business_account` → the returned id is `IG_USER_ID`.
6. **Access level:** because you're posting to your *own* Page/IG, you can operate in the app's **Development Mode** with your account as an admin/developer. Full **App Review** is only needed to post on behalf of *other* people. You will likely still need **Business Verification** (App → Settings → Business verification) before `instagram_content_publish` works in production.

## 3. Threads API (15 min)
1. Same Meta app → add the **Threads API** use case (or create a Threads-specific app at developers.facebook.com — Threads uses its own login at `graph.threads.net`).
2. Add the Eikonia Threads account as a tester / connect it.
3. Request scopes `threads_basic`, `threads_content_publish`.
4. Generate a token via the Threads OAuth flow; exchange it for a **long-lived token** (60 days, refreshable) → `THREADS_TOKEN`.
5. `GET https://graph.threads.net/v1.0/me?access_token=<TOKEN>` → the `id` is `THREADS_USER_ID`.

## 3c. Pinterest (≈20 min)
1. **developers.pinterest.com → Manage apps → Create app**. Note the **App ID** and **App secret**.
2. App settings → add **Redirect URI** `https://eikonia.art/`; enable scopes `boards:read`, `boards:write`, `pins:read`, `pins:write`, `user_accounts:read` (creating a pin needs `boards:write` and `pins:read`, not just `pins:write`).
3. **Authorize** (logged into the Eikonia Pinterest account), then copy the `code` from the redirect:
   ```
   https://www.pinterest.com/oauth/?client_id=<APP_ID>&redirect_uri=https://eikonia.art/&response_type=code&scope=boards:read,boards:write,pins:read,pins:write,user_accounts:read
   ```
4. **Exchange for a token** (PowerShell):
   ```powershell
   $basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("<APP_ID>:<APP_SECRET>"))
   $r = Invoke-RestMethod -Method Post -Uri 'https://api.pinterest.com/v5/oauth/token' -Headers @{ Authorization = "Basic $basic" } -Body @{ grant_type='authorization_code'; code='<CODE>'; redirect_uri='https://eikonia.art/' }
   $r.access_token   # -> PINTEREST_TOKEN
   ```
5. **Get the board id**:
   ```powershell
   Invoke-RestMethod 'https://api.pinterest.com/v5/boards' -Headers @{ Authorization = "Bearer $($r.access_token)" }
   ```
   Copy the `id` of the board you want → `PINTEREST_BOARD_ID`.
6. New apps start in **Trial** access (fine for posting to your own boards); apply for Standard access for higher limits later. Tokens expire (~30 days) with a 1-year refresh token — refresh via `grant_type=refresh_token` before expiry.

**v1 note:** all Pinterest rows pin to the single `PINTEREST_BOARD_ID`. Per-board routing (the 8 themed boards) is a later enhancement via a Board field on the tracker.

## 4. Wire it up
1. Add all the env vars (section above) to Vercel for **Production**.
2. Redeploy (the cron is registered from `vercel.ts`).
3. The cron runs daily ~13:00 UTC. On **Hobby**, crons fire once/day on production only; for intraday timing you'd need Pro.

## 5. Test it safely
- **One platform, one row:** set one Threads row's `Publish date` to today and flip it to **Scheduled**.
- **Trigger manually:** `curl -H "Authorization: Bearer <CRON_SECRET>" https://eikonia.art/api/cron/social` — returns a JSON summary (`posted` / `skipped` / `failed` with per-row detail).
- Check the row flipped to **Published** with a **Live URL**, and the post is live.
- A failure flips the row to **In review** and appends the error to **Notes** — never a silent drop, never a re-post (Published rows are not picked up again).

## Gotchas
- **Instagram needs an image.** Text-only IG posts are impossible via API. Quiz rows auto-use the titled tile; non-quiz IG rows need an `Image` URL or they're skipped. Video Reels are out of scope (need a hosted MP4).
- **Image format/ratio.** IG wants JPEG, aspect ratio 0.8–1.91. The tile is 1080x1350 (0.8) — valid. `/api/social-image` always returns JPEG.
- **Token refresh.** Threads tokens last ~60 days (refresh before expiry). The long-lived Page token effectively persists but re-check if posting starts failing with auth errors. (A refresh cron can be added later.)
- **Rate limits.** Generous for our volume — FB high, IG 25/day, Threads 250/day. We post ~1–3/day.
