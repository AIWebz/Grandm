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

## 1. Get the backend running locally

```bash
cd server
cp .env.example .env
npm install
npm run ollama:setup   # installs Ollama if needed, starts it, pulls the 2 models the app uses
npx prisma migrate deploy
npm run dev
```

`npm run ollama:setup` (`server/scripts/setup-ollama.sh`) handles the whole
local AI engine for you: installs Ollama if it isn't already there (Linux
via its official install script, macOS via Homebrew), makes sure the
daemon is running, then pulls `llama3.1` (chat + tool-calling) and `llava`
(handwriting photo OCR for the Family Cookbook). It's safe to re-run any
time. On Windows, it'll tell you to grab the installer from
[ollama.com/download](https://ollama.com/download) first, then re-run the
script from Git Bash/WSL to pull the models.

The server listens on `:4000`. Hit `curl localhost:4000/health` to confirm
it's up, then send a chat message from the app to confirm you get a real
reply. Leave `AI_PROVIDER=ollama` (the default) for this free local engine,
or switch to `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY` for hosted Claude
instead (higher quality, costs money per use, no local hardware needed —
worth it once you're serving real production traffic rather than testing).

### Connect Stripe (so you actually get paid for Grandma+)
```bash
# In server/.env, set STRIPE_SECRET_KEY from dashboard.stripe.com/apikeys
npm run stripe:setup     # creates the $14.99/mo Grandma+ product+price, prints STRIPE_PRICE_ID_MONTHLY
stripe listen --forward-to localhost:4000/billing/webhook   # local dev webhook secret
```
For production, deploy the server somewhere with a public URL, create a
webhook endpoint in the Stripe Dashboard pointed at
`https://<your-domain>/billing/webhook`, and use that webhook's signing
secret instead of the `stripe listen` one. Switch `STRIPE_SECRET_KEY` to
your live key (`sk_live_...`) only once you're ready for real charges.

### Deploy the backend somewhere real
The app needs `EXPO_PUBLIC_API_URL` (mobile) pointing at a real, public
HTTPS server before an App Store build — `localhost` only works on your
own dev machine. Any standard Node host works (Railway, Render, Fly.io,
a VPS, etc.); point `DATABASE_URL` at a real Postgres instance there
instead of the local SQLite file (the Prisma schema is provider-agnostic
enough for either — see `docs/ARCHITECTURE.md`).

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

## 4. Build for the App Store

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

## 5. Before you flip real customers on

- [ ] Backend deployed somewhere public, `mobile/.env`'s `EXPO_PUBLIC_API_URL` pointed at it
- [ ] `STRIPE_SECRET_KEY` switched from `sk_test_...` to `sk_live_...`, and a production webhook endpoint configured
- [ ] AdMob real app/ad-unit ids in place (or accept Google's test units serve no revenue)
- [ ] `JWT_SECRET` changed from the placeholder to a long random value
- [ ] A privacy policy URL ready for the App Store listing (the app's actual data handling is documented in `docs/ARCHITECTURE.md` and the spec's Section 18)
