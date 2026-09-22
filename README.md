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
signup, no API key, nothing sent to a third party. Install it, then pull a
tool-calling model and a vision model (for handwriting digitization) and
leave the app running:
```
ollama pull llama3.1
ollama pull llava
```
Prefer a hosted model (higher quality, costs money)? Set
`AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` in `server/.env` instead —
see `docs/ARCHITECTURE.md` §4 for the full tradeoff.

### Backend
```
cd server
cp .env.example .env   # defaults to the local Ollama setup above
npm install
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
