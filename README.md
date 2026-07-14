# Ledger — mobile expense tracker UI

A mobile-first React PWA on top of the [expense-tracker API](../expense-tracker).
Quick-add expenses, browse by month, see budget status at a glance — designed
to be installed to your phone's home screen and used like a native app.

## Local development

```bash
npm install
cp .env.example .env   # points at your local backend by default
npm run dev -- --host  # --host makes it reachable from your phone on the same WiFi
```

The backend must be running separately (see the API project's README) and
must have CORS enabled for this to work — it already is, via `CORSMiddleware`
in `app/main.py`.

To open it on your phone while developing: find your laptop's local network
IP (`ipconfig` on Windows / `ip a` on WSL), then visit
`http://<that-ip>:5173` in your phone's browser, as long as both devices are
on the same WiFi.

## Deploying

**Order matters: deploy the backend first**, since the frontend needs a real
API URL to point at (see [`expense-tracker`](../expense-tracker)'s README
for the Render + Neon steps).

**Then the frontend → Vercel** (free tier is enough for personal use):
```bash
npm install -g vercel   # if you don't have it
vercel
```
`vercel.json` is already configured (Vite framework preset, `dist` output
directory) — you shouldn't need to answer many prompts.

In the Vercel project settings, set an environment variable:
```
VITE_API_BASE_URL=https://your-app.onrender.com
VITE_API_KEY=<same value as the backend's API_KEY on Render>
```
(your actual Render URL from the backend deploy, not `http://127.0.0.1:8000`,
which only works on your own machine). Redeploy after adding it — Vite only
reads env vars at build time, so adding one after a deploy doesn't retroactively
apply until the next build.

`VITE_API_KEY` matters here specifically because the backend now requires an
`X-API-Key` header on every request once `API_KEY` is set on Render (see the
backend README's Authentication section) — without this, every API call from
the deployed frontend would fail with a `401`.

**Close the loop:** once you have your Vercel URL, go back to the Render
dashboard and set `CORS_ORIGINS` to that URL — otherwise the deployed
frontend will load but every API call will fail with a CORS error in the
browser console (the same class of issue documented in the backend's
`LEARNINGS.md`, just in production instead of local dev).

Once both are deployed, install the frontend to your phone's home screen —
most mobile browsers offer this via a share-sheet "Add to Home Screen"
option once `manifest.json` is being served correctly, which it is here.

## What's actually in this app

- **Quick add** — bottom sheet, big amount field, category chips, inline
  "+ new category" without leaving the flow.
- **Month browsing** — swipe between months via the header arrows; can't
  navigate into the future.
- **Budget bars** — per-category spend vs. limit, with an explicit
  over-budget callout (not just a red bar — the actual overage amount).
- **Optimistic delete** — an expense disappears from the list immediately on
  delete, then reconciles with the server; rolls back automatically if the
  delete actually failed.

## A bug worth knowing about (caught before shipping, not after)

The very first version of the "add expense" date logic combined the
currently-*viewed* month with today's real day-of-month — e.g. if you were
viewing September (30 days) on the 31st of some other month, it would try to
submit `2026-09-31`, an invalid date the API correctly rejects. Fixed by
defaulting to today's date only when viewing the actual current month, and
to the 1st of the month otherwise. Caught by tracing the logic by hand and
testing it in Node before shipping, not by a user hitting it first — worth
remembering that "day of month" math needs bounds-checking against variable
month lengths any time it's not tied to `Date` objects doing that work for you.