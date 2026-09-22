# Grandma AI

A warm, practical AI life-assistant app for iOS and Android. Grandma pairs a
grandmotherly AI chat personality with real tools — tasks, reminders,
recipes, a private Family Cookbook, a daily planner, and grocery lists — so a
conversation turns into an action in the app, not just a reply.

This repo is a monorepo:

- `server/` — Node.js/TypeScript backend. Owns the database, auth, the LLM
  tool-calling loop, push notification dispatch, subscription receipt
  validation, and ad configuration. All secret-bearing calls (LLM, IAP
  receipt validation, push) live here — the client never holds an API key.
- `mobile/` — Expo (React Native + TypeScript) app targeting iOS and
  Android from one codebase.
- `docs/` — product/architecture decisions called out explicitly per the
  spec (auth pattern, safety system prompt, provider swap points).
- `.github/workflows/` — CI (typecheck on every push), a Docker image
  build+publish to GHCR, a manual "set up Stripe" workflow, and a GitHub
  Pages deploy that publishes the app as a real website on every push to
  `main`, so the one-time setup scripts (and the site itself) run from
  GitHub instead of your machine.
- `docker-compose.yml` + `server/Dockerfile` — runs Postgres, Ollama, and
  the server together with one command, no local install required.
- `render.yaml` — a Render Blueprint that deploys the backend (server +
  a free Postgres database) to a real, public, always-on URL with one
  click and zero local setup — see "Deploy the backend" below.

See `docs/ARCHITECTURE.md` for the auth-pattern decision, the tool-calling
design, and exactly which third-party integrations are live vs. stubbed
behind a swappable adapter in this build (none of this project's own logic
is a placeholder — every screen and API route does real work against a real
database — but a few external accounts, listed there, aren't provisionable
in this environment: Apple/Google sign-in credentials, an APNs/FCM project,
and App Store/Play Console apps). The AI engine (local via Ollama, no
account needed) and Google AdMob (real SDK, Google's public test ad units
by default) both work out of the box with zero third-party signup.

## Run the backend with Docker (no local Node/Ollama install)

```
cp server/.env.example server/.env   # fill in real secrets as you get them
docker compose up --build
```
This runs Ollama (the local AI engine) and the Grandma AI server together
as one stack — `docker-compose.yml` pulls the two models it needs
(`llama3.1`, `llava`) into a persistent volume on first run, then starts
the server wired up to talk to it. Nothing to install by hand beyond
Docker itself.

Pushing to `main` also runs `.github/workflows/docker-publish.yml`, which
builds `server/Dockerfile` and publishes it to GitHub Container Registry
(`ghcr.io/<owner>/<repo>/server`) — pull that image directly on whatever
host runs the app instead of cloning the repo there at all.

### Set up Stripe from GitHub Actions (no local Node)
1. Add a `STRIPE_SECRET_KEY` repository secret: **Settings → Secrets and
   variables → Actions → New repository secret**.
2. **Actions tab → "Set up Stripe Grandma+ product" → Run workflow.**

That runs `.github/workflows/stripe-setup.yml`, which creates the
$14.99/mo Grandma+ product and price via the Stripe API and prints the
resulting price id in the run's job summary — copy it into
`STRIPE_PRICE_ID_MONTHLY` wherever the server is deployed. Without a
Stripe key configured at all, the app still runs fully — Grandma+ purchase
buttons just return a clear "not configured" instead of a broken flow. See
`docs/ARCHITECTURE.md` §7 for the full Free vs. Grandma+ feature matrix and
an important compliance note about Stripe vs. native app-store billing.

## Host the whole thing on GitHub — the website *and* the backend

GitHub Pages can only serve static files — it has no way to run the
Node/Postgres backend that owns accounts, chat, and everyone's data (see
`docs/ARCHITECTURE.md` §10 for exactly why). So "the app, live, with no
server for you to run" takes two pieces, both effectively free and both
auto-deploying from this repo from then on. The backend is the one
unavoidable manual step — it needs its own always-on host somewhere, and
only you can authorize that host to access your GitHub account.

**1. Deploy the backend on Render (one click, no credit card):**
1. Grab a free API key at [console.groq.com/keys](https://console.groq.com/keys)
   (this is the AI engine — Groq's free tier is what makes an always-on
   hosted backend possible without running Ollama's heavier local model).
2. [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint**
   → pick this repo. Render reads `render.yaml`, provisions a free
   Postgres database and the server together, and asks for one value:
   paste in the Groq key from step 1. Click **Apply**.
3. Once it's deployed, copy the URL Render assigns (shown in its
   dashboard, looks like `https://grandma-ai-server-xxxx.onrender.com`).
   From then on, every push to `main` redeploys the backend automatically
   — nothing left to run locally, ever.

Free tier, stated plainly: it spins down after 15 minutes idle and takes
30-60s to wake back up on the next request — fine for a personal project,
noticeable as one slow first load. Stripe, AdMob, and push aren't part of
the one-click setup; add them anytime in Render's dashboard → Environment
tab (same graceful "not configured" fallback the app already uses
everywhere — see `docs/ARCHITECTURE.md`).

**2. Point the website at it:**
1. **Settings → Pages → Source: "GitHub Actions."**
2. **Settings → Secrets and variables → Actions → Variables →** add
   `EXPO_PUBLIC_API_URL` set to the Render URL from step 1.3.
3. Push to `main` (or re-run `.github/workflows/deploy-web.yml` manually).
   The site publishes to `https://<owner>.github.io/<repo>/`, now actually
   talking to a real backend.

Ads, native in-app-purchase, and voice input have no browser equivalent
and are intentionally unavailable on the web build (Stripe Checkout still
handles Grandma+ purchases there); see `docs/ARCHITECTURE.md` §9 for the
full rundown of what's live vs. gracefully unavailable on web, and why the
bundler failed before three `.web.ts` files fixed it.

## Quick start (running things locally instead)

Needs a local Postgres instance (`docker compose up postgres` from this
repo starts just that piece, or install Postgres yourself and point
`DATABASE_URL` at it — see `server/.env.example`).

### AI engine (Ollama, Groq, or Anthropic)
The app defaults to a local model via [Ollama](https://ollama.com) — no
signup, no API key, nothing sent to a third party, but it needs a machine
with several GB of RAM. One command handles installing Ollama (if
needed), starting it, and pulling the tool-calling and vision models the
app uses:
```
cd server
npm run ollama:setup
```
(Skip this if you're using `docker compose up` above — it already handles
Ollama for you.) On a lighter machine, or for the hosted Render deploy
above, set `AI_PROVIDER=groq` and `GROQ_API_KEY` instead (free tier, no
local compute — see "Deploy the backend" above). Prefer a paid hosted
model (higher quality)? Set `AI_PROVIDER=anthropic` and
`ANTHROPIC_API_KEY`. See `docs/ARCHITECTURE.md` §4 for the full tradeoff
between all three.

### Backend
```
cd server
cp .env.example .env   # defaults to the local Ollama setup above
npm install
npm run ollama:setup   # see "AI engine" above - skip if already done
npx prisma migrate dev
npm run dev
```

### Mobile app
```
cd mobile
npm install
cp .env.example .env   # point EXPO_PUBLIC_API_URL at your backend
npx expo start
```
