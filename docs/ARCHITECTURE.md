# Architecture & Product Decisions

## 1. Auth pattern (spec Section 2 requires this be stated explicitly)

**Decision: deferred sign-up, via a silent guest account.**

On first launch the app calls `POST /auth/guest` with a locally-generated
`deviceId`. The server creates a real `User` row with `isGuest: true` and
returns a normal JWT. The guest can complete onboarding, chat with Grandma,
generate recipes, and see everything render — all backed by real,
persisted data — with no signup screen in the way, satisfying "don't force
sign-up before the user has seen any value" and the Section 17 FTUE
requirement that every quick-start button drops into a *working* flow
immediately.

Tasks, grocery lists, generated recipes, and chat all persist for a guest
immediately (real DB rows against the guest's `userId`, kept across app
restarts via the stored JWT) — this is what makes the Section 17 FTUE
buttons produce a real result with zero signup friction. The guest is
prompted to create a real account (email/password or a social provider)
only the first time they try to do one of:
- save/favorite a recipe to "My Recipes" for long-term, cross-device access,
- create anything in the Family Cookbook (durable, emotionally-weighted
  family data),
- turn on push notifications (needs an identity that survives a reinstall), or
- start a Grandma+ purchase.

`POST /auth/upgrade` converts the guest row in place (adds email + password
hash, or links a social identity) — same `userId`, same data, no migration
step. This means guest usage caps (Section 15) apply from message one, and
nothing the user did as a guest is lost when they sign up.

This decision affects the API: almost every route accepts a guest JWT the
same as a full-account JWT; only the "durable ownership" actions above are
gated behind `requireFullAccount` middleware (`server/src/middleware/auth.ts`).

## 2. Tool-calling architecture (Section 4)

`server/src/services/ai/tools.ts` defines the tool schema Anthropic's
Messages API function-calling uses; `server/src/services/ai/toolHandlers.ts`
executes each tool against Prisma and returns a structured result. The chat
loop (`chatService.ts`) is: stream the model's response → if it emits a
`tool_use` block, run the handler, persist the result, feed the tool result
back to the model → stream the model's natural-language confirmation. The
API response includes both the streamed text *and* a `toolInvocations[]`
array so the client can render an inline card (task/grocery/recipe) instead
of only showing text. No keyword/regex matching is used to trigger actions.

Tools implemented: `create_task`, `update_task`, `create_reminder`,
`create_grocery_list`, `add_grocery_item`, `create_recipe`, `update_schedule`,
`save_memory_fact`, `generate_chore_batch` (caps at 3-5 items per Section 7),
`plan_day`.

## 3. Safety system prompt (Section 14)

`server/src/services/ai/systemPrompt.ts` builds the system prompt from the
user's `personality_style` (tone only) plus a **non-negotiable safety block**
that is concatenated identically regardless of personality: no medical/
legal/financial/professional advice beyond "see a professional," no
claiming to be human or the user's literal grandmother, no instructions for
self-harm/illegal activity/dangerous DIY, and a crisis-response instruction
to warmly point to a real person, professional, or crisis line. Personality
style only ever adjusts word choice via a separate prompt section.

## 4. Swappable providers (Section 16)

Every provider is selected by an env var and implemented behind a small
interface, so swapping is a config change, not a rewrite:

| Concern | Env var | Interface | Included implementation |
|---|---|---|---|
| LLM | `AI_PROVIDER` | `services/ai/provider.ts` | `anthropic` (live, real API calls) |
| Database | `DATABASE_URL` | Prisma | SQLite for local dev, Postgres in prod (same schema) |
| Auth | `AUTH_PROVIDER` | `services/auth/socialProviders.ts` | email/password (live); Apple/Google (adapter present, needs real client IDs — see below) |
| Push | `PUSH_PROVIDER` | `services/notifications/pushService.ts` | `expo` (live, using Expo's push service) or `fcm`/`apns` adapters (stubbed — need real project credentials) |
| Subscriptions | `IAP_PROVIDER` | `services/subscriptions/*` | server-side validation call structure is real; needs a real App Store Connect / Play Console app+key to validate live receipts |
| Ads | `ADS_PROVIDER` | `services/ads/adsConfig.ts` + `mobile/src/components/AdSlot.tsx` | config/placement rules are real and enforced; needs a real ad network SDK + app id to serve live ads |

### What's genuinely live in this build
- Real Postgres/SQLite-backed persistence for every feature (tasks,
  recipes, grocery lists, Family Cookbook, memory, schedule, chat history).
- Real Anthropic API calls with tool-calling, streaming, and vision
  (used for handwritten recipe OCR).
- Real JWT auth, password hashing (bcrypt), guest→full-account upgrade.
- Real push notification *scheduling and preference logic*, dispatched
  through Expo's push service (works today with a real Expo project id).

### What needs the team to provision an external account before it's "real"
These are not fake buttons — the code path, request shape, and server-side
verification logic are implemented — they just need real credentials this
sandboxed environment cannot obtain (no Apple Developer account, Google
Cloud project, or ad network account is available here):
- Sign in with Apple / Google: `services/auth/socialProviders.ts` verifies
  a provider ID token via each provider's public JWKS; needs real OAuth
  client IDs in `.env`.
- APNs/FCM direct push (as opposed to Expo's push relay): adapters are
  stubbed in `pushService.ts` with the exact payload shape each API expects.
- StoreKit 2 / Play Billing signature verification: `subscriptions/`
  validates against Apple's/Google's real verification endpoints when
  `APPLE_SHARED_SECRET` / `GOOGLE_SERVICE_ACCOUNT` are set; without them the
  validator returns a clear `NOT_CONFIGURED` error rather than pretending
  to succeed.
- Ad SDK (AdMob/etc.): `AdSlot` renders the real placement in the real
  position with the real frequency rules, backed by a test ad unit ID by
  default; swap in a production ad unit ID via env var.

## 5. Data model

See `server/prisma/schema.prisma`. One `User` row per person (guest or
full), with `Task`, `Reminder`, `Recipe`, `FamilyCookbookRecipe`,
`GroceryList`/`GroceryItem`, `ScheduleEvent`, `MemoryFact`,
`ChatMessage`, `NotificationPreference`, and `Subscription`.
"Today's Tasks" on Home is a filtered read of `Task`, not a separate model,
per Section 3.
