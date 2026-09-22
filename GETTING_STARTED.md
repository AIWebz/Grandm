# Getting Started: from this folder to the App Store

This is the full Grandma AI source (backend + mobile app + docs), exported
straight from the git history — nothing missing, nothing extra
(`node_modules`, `.env` files, and the dev database are intentionally not
included; you'll generate/fill those locally).

Read `docs/ARCHITECTURE.md` first — it documents every product decision,
what's genuinely live vs. what still needs one of your accounts connected,
and the full Free vs. Grandma+ feature matrix.

## 0. Prerequisites on your machine

- [Node.js](https://nodejs.org) 20+ and npm
- [Ollama](https://ollama.com) (for the free, local AI engine) — or an
  Anthropic API key if you'd rather use hosted Claude
- An [Apple Developer Program](https://developer.apple.com/programs/) membership ($99/yr) — required to submit to the App Store
- An [Expo](https://expo.dev) account (free) — used to run EAS Build, since this app uses native modules (IAP, AdMob, speech recognition) that Expo Go can't run
- Optional but recommended before charging real customers: a [Stripe](https://dashboard.stripe.com) account, and an [AdMob](https://admob.google.com) account for real ad revenue

## 1. Get the backend running

**Option A - Docker (recommended, no local Node/Ollama install):**
```bash
cp server/.env.example server/.env
docker compose up --build
```
`docker-compose.yml` runs Ollama and the server together: it pulls
`llama3.1` (chat + tool-calling) and `llava` (Family Cookbook handwriting
OCR) into a persistent volume on first run, then starts the server wired
up to talk to it over the Docker network. Nothing else to install.

**Option B - locally with Node:**
```bash
cd server
cp .env.example .env
npm install
npm run ollama:setup   # installs Ollama if needed, starts it, pulls the 2 models
npx prisma migrate deploy
npm run dev
```
`npm run ollama:setup` (`server/scripts/setup-ollama.sh`) installs Ollama
if it isn't already there (Linux via its official install script, macOS
via Homebrew), makes sure the daemon is running, then pulls both models.
Safe to re-run any time. On Windows, it'll tell you to grab the installer
from [ollama.com/download](https://ollama.com/download) first, then
re-run the script from Git Bash/WSL to pull the models.

Either way, the server listens on `:4000` - hit `curl localhost:4000/health`
to confirm it's up, then send a chat message from the app to confirm you
get a real reply. Leave `AI_PROVIDER=ollama` (the default) for this free
local engine, or switch to `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`
for hosted Claude instead (higher quality, costs money per use, no local
hardware needed — worth it once you're serving real production traffic
rather than testing).

### Connect Stripe (so you actually get paid for Grandma+)

**From GitHub, no local Node needed:** add a `STRIPE_SECRET_KEY`
repository secret (Settings → Secrets and variables → Actions), then
**Actions tab → "Set up Stripe Grandma+ product" → Run workflow.** It
creates the $14.99/mo product+price via the Stripe API and prints the
price id in the run's summary — copy that into `STRIPE_PRICE_ID_MONTHLY`.

**Locally instead:**
```bash
cd server
# In .env, set STRIPE_SECRET_KEY from dashboard.stripe.com/apikeys
npm run stripe:setup     # creates the $14.99/mo Grandma+ product+price, prints STRIPE_PRICE_ID_MONTHLY
stripe listen --forward-to localhost:4000/billing/webhook   # local dev webhook secret
```

Either way: for production, deploy the server somewhere with a public URL,
create a webhook endpoint in the Stripe Dashboard pointed at
`https://<your-domain>/billing/webhook`, and use that webhook's signing
secret instead of the `stripe listen` one. Switch `STRIPE_SECRET_KEY` to
your live key (`sk_live_...`) only once you're ready for real charges.

### Deploy the backend somewhere real
The app needs `EXPO_PUBLIC_API_URL` (mobile) pointing at a real, public
HTTPS server before an App Store build — `localhost` only works on your
own dev machine. `.github/workflows/docker-publish.yml` already builds
`server/Dockerfile` and pushes it to `ghcr.io/<owner>/<repo>/server` on
every push to `main` — pull that image directly on any host that can run
Docker (a VPS, Railway, Render, Fly.io, etc.) instead of cloning the repo
there. Point `DATABASE_URL` at a real Postgres instance for anything
beyond a single-container demo (the Prisma schema is provider-agnostic
enough for either — see `docs/ARCHITECTURE.md`), and run Ollama as its own
long-lived service (or use `AI_PROVIDER=anthropic`) rather than bundling a
multi-GB model download into your deploy pipeline.

## 2. Get the mobile app running locally

```bash
cd mobile
npm install
cp .env.example .env
# set EXPO_PUBLIC_API_URL to your backend's real URL (not localhost, once you're testing on a physical device)
npx expo start
```

Scan the QR code with Expo Go to try it on your phone — note that IAP,
AdMob, and speech recognition need a dev-client/EAS build (step 4) to
actually work; Expo Go will run everything else.

## 3. Fill in the remaining real accounts

Per `docs/ARCHITECTURE.md`, these need your own credentials before they're
"live" rather than a graceful stub:

| Feature | Where to get it | Where it goes |
|---|---|---|
| Sign in with Apple/Google | Apple Developer portal / Google Cloud Console | `server/.env` `APPLE_CLIENT_ID` / `GOOGLE_CLIENT_ID` |
| Push notifications (FCM/APNs, beyond Expo's relay) | Firebase / Apple Developer portal | `server/.env` `FCM_SERVER_KEY` / `APNS_*` |
| AdMob (real ad revenue, not test units) | admob.google.com | `server/.env` `ADMOB_*` + `mobile/app.config.js` reads `ADMOB_APP_ID_IOS/ANDROID` |
| Stripe (real payouts) | dashboard.stripe.com | `server/.env` `STRIPE_*` (see above) |
| Native App Store/Play Store IAP (optional alternate billing rail) | App Store Connect / Play Console | `server/.env` `APPLE_SHARED_SECRET` / `GOOGLE_SERVICE_ACCOUNT_JSON` |

## 4. Or skip the app stores: host it as a website on GitHub Pages

The same app also runs as a real website, no App Store review, no EAS
build, no $99/yr membership — `.github/workflows/deploy-web.yml` handles
it:
1. **Settings → Pages → Source: "GitHub Actions"** (one-time repo setting).
2. Optional but needed for the site to actually work for visitors:
   **Settings → Secrets and variables → Actions → Variables →** add
   `EXPO_PUBLIC_API_URL` pointing at your real, public backend (step 1's
   Docker/Ollama deploy, reachable over HTTPS — `localhost` only works on
   your own machine).
3. Push to `main`. The workflow runs `npx expo export --platform web` and
   publishes it to `https://<owner>.github.io/<repo>/`.

This is genuinely the same codebase, not a second app — chat, tasks,
recipes, planner, and the drawer nav all work in the browser. Ads, native
IAP, and voice input have no browser equivalent and are unavailable there
by design (Stripe Checkout still works fine for Grandma+); see
`docs/ARCHITECTURE.md` §9 for the full list and the bundling issue that had
to be fixed to make `expo export --platform web` work at all (short
version: `react-native-google-mobile-ads` was pulling in real
react-native internals that don't exist on web — three new `.web.ts` files
under `mobile/src/` keep it out of the web bundle entirely). Want to build
it locally instead of waiting on the workflow: `cd mobile && npm run
build:web` produces the same static site in `mobile/dist/`.

## 5. Build for the App Store

This app uses native modules (`react-native-iap`, `react-native-google-mobile-ads`,
`expo-speech-recognition`), so it needs a real native build — Expo Go can't
run it, and neither can a plain `expo export`. Use [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios
```

This produces a real `.ipa`. From there:
1. `eas submit --platform ios` (or upload the `.ipa` via Transporter) to send it to App Store Connect
2. Create the app listing in [App Store Connect](https://appstoreconnect.apple.com) — screenshots, description, privacy nutrition labels (this app collects: account info, chat content, recipes/photos you upload, and optional memory facts — see the Memory & Personalization section in-app for exactly what's stored)
3. Set up your Grandma+ subscription in App Store Connect if you want the native-IAP path active too (optional — Stripe already works as the primary billing rail; read the compliance note in `docs/ARCHITECTURE.md` §7 before deciding to rely on Stripe alone for the store build)
4. Submit for review

Android is the same idea via `eas build --platform android` and the Google
Play Console.

## 6. Before you flip real customers on

- [ ] Backend deployed somewhere public, `mobile/.env`'s `EXPO_PUBLIC_API_URL` pointed at it (and, for the website, the same URL set as the `EXPO_PUBLIC_API_URL` repo **variable** used by `deploy-web.yml`)
- [ ] `STRIPE_SECRET_KEY` switched from `sk_test_...` to `sk_live_...`, and a production webhook endpoint configured
- [ ] AdMob real app/ad-unit ids in place (or accept Google's test units serve no revenue)
- [ ] `JWT_SECRET` changed from the placeholder to a long random value
- [ ] A privacy policy URL ready for the App Store listing (the app's actual data handling is documented in `docs/ARCHITECTURE.md` and the spec's Section 18)
