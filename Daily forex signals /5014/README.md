# Daily Forex Signals
Static React + Vite site. Backend is Supabase only (Postgres, Auth, Storage, RLS). No server code.

## Setup
1. Supabase → SQL Editor → run `supabase/schema.sql`.
2. Supabase → Authentication → Users → copy your user's **UID**, then run:
   `insert into admin_roles (user_id) values ('YOUR-UID');`
3. `cp .env.example .env` and fill in the URL and publishable key. `npm install && npm run dev`.
4. Supabase → Authentication → URL Configuration: add your Render URL (and `/admin`) to redirect URLs so password reset works. Disable public sign-ups under Authentication → Providers → Email.

## Render (Static Site)
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Redirects/Rewrites tab: source `/*` → destination `/index.html`, action **Rewrite** (also in `render.yaml`).

## Analytics
Page views, unique browsers (random ID in localStorage), referrers, device, browser, OS and Telegram clicks are stored in `page_events` with no IPs. Country data is not available from Supabase; add Cloudflare Web Analytics or Plausible if you want it.



## Sitemap and canonical URLs
Set one environment variable on Render: `VITE_SITE_URL` (e.g. your final domain, no trailing slash). The build then writes `dist/sitemap.xml`, adds it to `robots.txt`, and pages emit canonical/og:url tags. If unset, the sitemap is skipped. Individual signal pages are not listed in the sitemap.

## Routes
`/`, `/history`, `/about`, `/signals/:id`, `/admin`. All need the Render rewrite `/*` → `/index.html`.
