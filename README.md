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
- `docker-compose.yml` + `server/Dockerfile` — runs Ollama and the server
  together with one command, no local Node/Ollama install required.

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

## Host the app as a website on GitHub Pages

`.github/workflows/deploy-web.yml` exports the mobile app for web
(`react-native-web` via Metro) and publishes it to GitHub Pages on every
push to `main` — no separate web app, it's the same screens/nav/chat
running in a browser. One-time setup:
1. **Settings → Pages → Source: "GitHub Actions."**
2. Optional: **Settings → Secrets and variables → Actions → Variables →**
   add `EXPO_PUBLIC_API_URL` pointing at your real, publicly deployed
   backend (see "Deploy the backend somewhere real" below) — without it,
   the site loads but every screen that talks to the server won't have
   anyone to talk to.
3. Push to `main`. The site publishes to
   `https://<owner>.github.io/<repo>/`.

Ads, native in-app-purchase, and voice input have no browser equivalent
and are intentionally unavailable on the web build (Stripe Checkout still
handles Grandma+ purchases there); see `docs/ARCHITECTURE.md` §9 for the
full rundown of what's live vs. gracefully unavailable on web, and why the
bundler failed before three `.web.ts` files fixed it.

## Quick start (running things locally instead)

### AI engine (Ollama, no API key)
The app defaults to a local model via [Ollama](https://ollama.com) — no
signup, no API key, nothing sent to a third party. One command handles
installing Ollama (if needed), starting it, and pulling the tool-calling
and vision models the app uses:
```
cd server
npm run ollama:setup
```
(Skip this if you're using `docker compose up` above — it already handles
Ollama for you.) Prefer a hosted model (higher quality, costs money, no
local hardware needed)? Set `AI_PROVIDER=anthropic` and
`ANTHROPIC_API_KEY` in `server/.env` instead — see `docs/ARCHITECTURE.md`
§4 for the full tradeoff.

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
