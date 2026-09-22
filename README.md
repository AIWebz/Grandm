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

See `docs/ARCHITECTURE.md` for the auth-pattern decision, the tool-calling
design, and exactly which third-party integrations are live vs. stubbed
behind a swappable adapter in this build (none of this project's own logic
is a placeholder — every screen and API route does real work against a real
database — but a few external accounts, listed there, aren't provisionable
in this environment: Apple/Google sign-in credentials, an APNs/FCM project,
and App Store/Play Console apps). The AI engine (local via Ollama, no
account needed) and Google AdMob (real SDK, Google's public test ad units
by default) both work out of the box with zero third-party signup.

## Quick start

### AI engine (Ollama, no API key)
The app defaults to a local model via [Ollama](https://ollama.com) — no
signup, no API key, nothing sent to a third party. One command handles
installing Ollama (if needed), starting it, and pulling the tool-calling
and vision models the app uses:
```
cd server
npm run ollama:setup
```
Prefer a hosted model (higher quality, costs money, no local hardware
needed)? Set `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` in
`server/.env` instead — see `docs/ARCHITECTURE.md` §4 for the full tradeoff.

### Payments (Stripe, Grandma+ at $14.99/mo)
```
cd server
# In .env: STRIPE_SECRET_KEY (test key from dashboard.stripe.com/apikeys)
npm run stripe:setup    # creates the Grandma+ product/price, prints STRIPE_PRICE_ID_MONTHLY
stripe listen --forward-to localhost:4000/billing/webhook   # prints STRIPE_WEBHOOK_SECRET for local dev
```
Without a Stripe key, the app still runs fully — Grandma+ purchase buttons
just return a clear "not configured" instead of a broken flow. See
`docs/ARCHITECTURE.md` §7 for the full Free vs. Grandma+ feature matrix and
an important compliance note about Stripe vs. native app-store billing.

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
