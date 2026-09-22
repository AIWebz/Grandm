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
App Store/Play Console apps, and an ad network account).

## Quick start

### Backend
```
cd server
cp .env.example .env   # fill in ANTHROPIC_API_KEY at minimum
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
