# FA AGENCY™ EARN — Audit & Fix Report

## 1. /start → Mini App root cause

The Telegram bot no longer launched the official Mini App button because three separate breakages stacked:

1. `apps/bot/src/bot.js` had been replaced with a hardcoded one-command script. Tests, docs, and the original 11-command launcher (`createBot`, HTTPS checks, duplicate-update guard) were no longer exported.
2. `apps/bot/src/index.js` (the real `npm start` entry) read `MINI_APP_URL` from `apps/bot/.env`, which pointed at a dead Cloudflare tunnel: `https://lived-involving-follow-renaissance.trycloudflare.com`. Fallback URLs also disagreed (`apps.fa-agency.online`, `fa-agency-earn.web.app`).
3. The bot package depended on `dotenv` / `express` without listing them. A isolated bot deploy could crash before any `/start` reply was sent.

Telegram only renders a working `web_app` button when the URL is HTTPS and the domain is allowed for that bot. A dead tunnel or mixed domain is enough for the button to disappear or fail to open.

## 2. How it was fixed

- Restored `createBot` / `getBotConfig` / `assertBotConfig` in `apps/bot/src/bot.js`.
- `/start` again sends the Bengali welcome text plus a native WebApp button: `🚀 আয় শুরু করুন`.
- Canonical Mini App URL is `https://app.fa-agency.online`.
- Deep-link payload (`/start ref_XXX`) is forwarded on the WebApp URL as `startapp` / `ref`.
- On launch the bot also sets Telegram’s chat Menu Button to Open App.
- Bot package dependencies and env files were corrected.
- All 11 documented commands still open the Mini App instead of being dropped.

Verified locally: bot unit tests pass and a simulated `/start` returns welcome text + `web_app.url = https://app.fa-agency.online/?startapp=...`.

## 3. Ad system findings

- Mini App loaded Monetag via protocol-relative `//libtl.com/sdk.js` (mixed-content risk in some WebViews).
- Client code and helper disagreed on the SDK function (`show_11756404` vs `show_rewarded`).
- `App.jsx` credits `$0.03` in `localStorage` after a client-side confirm. That is not a server-verified Monetag completion.
- `apps/api/src/routes/ads.js` previously credited the wallet on `/claim` with no proof an ad was watched, and `/postback` accepted a default HMAC secret.
- Official Monetag Mini App SDK still has no documented server-verifiable completion event. The project docs already required `MONETAG_REWARD_ENABLED=false`.

Policy note: crediting withdrawable money from an unverified browser callback can violate Monetag / ad-network invalid-traffic rules and is financially unsafe.

## 4. Ad fixes applied

- Monetag script now loads over `https://libtl.com/sdk.js`.
- Client helper accepts both SDK function names.
- `/api/ads/claim` no longer credits a wallet.
- `/api/ads/postback` rejects missing/placeholder secrets and does not credit funds while verification is disabled.
- `MonetagProvider.createSession` / `verifyCompletion` restored so the API fails closed, matching tests.

The Mini App Watch Ads button still attempts to show a Monetag unit so the UI is not removed. Server-side cash credit stays disabled until official S2S verification exists.

## 5. Security issues

- Bot token was hardcoded in source (`apps/bot/src/bot.js`) and committed env files. Token must be rotated in BotFather after this zip has been shared.
- Mini App stored NID images as `localStorage` data URLs and treated Telegram user ID `980047040` as super admin. That client-side admin gate is not a real access-control boundary.
- KYC / payment numbers never go to the API in the current Mini App UI.
- `api.fa-agency.online` was not serving this API when checked (host looks unused / parked). CORS and auth cannot work against a missing API host.
- JWT / admin seed values exist in `.env`. Treat them as compromised if this archive was shared.

## 6. Other bugs fixed

- `TelegramAuthService.validateInitData` was missing; `/api/auth/telegram` could not verify WebApp `initData`.
- `WalletService.applyBalanceChange` / withdrawal reserve-and-review methods were missing while routes still called them.
- Mini App API helper used `VITE_API_BASE_URL` while env used `VITE_API_URL`.
- Games / video / edit-profile / payment-settings buttons set state but rendered no UI.
- CORS list omitted `https://apps.fa-agency.online`.

## 7. Files changed

- `apps/bot/src/bot.js`
- `apps/bot/src/index.js`
- `apps/bot/package.json`
- `apps/bot/.env`
- `apps/bot/.env.example` (added)
- `apps/api/src/services/telegramAuthService.js`
- `apps/api/src/services/monetagService.js`
- `apps/api/src/services/walletService.js`
- `apps/api/src/routes/ads.js`
- `apps/api/src/config/index.js`
- `apps/api/package.json`
- `apps/api/.env`
- `apps/api/.env.example`
- `apps/mini-app/index.html`
- `apps/mini-app/src/main.jsx`
- `apps/mini-app/src/App.jsx`
- `apps/mini-app/src/services/api.js`
- `apps/mini-app/src/services/monetag.js`
- `apps/mini-app/dist/*` (rebuilt)
- `.env` / `.env.example`
- `docs/bot-runbook.md`
- `AUDIT_REPORT.md`

## 8. Production checks before deploy

1. BotFather → your bot → Bot Settings → Configure Mini App / Menu Button → domain `app.fa-agency.online` (also add `apps.fa-agency.online` if that host is used).
2. Run the bot as its own process: `npm run start --workspace apps/bot`.
3. Confirm only one bot instance is running (two pollers steal `/start` updates).
4. Deploy Mini App build (`apps/mini-app/dist`) to `https://app.fa-agency.online`.
5. Deploy API to a real HTTPS host and point `VITE_API_URL` / `API_URL` at it. The current `api.fa-agency.online` host was not this API.
6. Set MongoDB Atlas `MONGODB_URI`.
7. Keep `MONETAG_REWARD_ENABLED=false` until Monetag gives a verifiable postback.
8. Rotate `TELEGRAM_BOT_TOKEN` and `JWT_SECRET`.

## 9. Environment variables to set manually

Required:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_MINI_APP_URL=https://app.fa-agency.online`
- `APP_URL=https://app.fa-agency.online`
- `MONGODB_URI`
- `JWT_SECRET` (32+ chars)
- `CORS_ORIGINS` including Mini App and admin origins
- `VITE_API_URL` at Mini App build time

Optional:

- `SUPPORT_URL`
- `BOT_WEBHOOK_DOMAIN` (only if you intentionally switch from polling to webhook)
- `MONETAG_ZONE_ID` / `VITE_MONETAG_ZONE_ID` (zone `11756404` is already in the frontend tag)
- `MONETAG_POSTBACK_SECRET` (leave empty until official S2S exists)
- `MONETAG_REWARD_ENABLED=false`

## 10. Unresolved issues

- Mini App wallet / ads / referrals still persist in `localStorage`. That UI was preserved on purpose. It is not the same ledger as `apps/api`.
- Server-side Monetag cash rewards cannot be honestly enabled yet.
- Live API domain was not serving this backend at audit time, so end-to-end production auth could not be executed against Telegram from this environment.
- Fake demo referral rows remain in the Mini App until you replace them with API data.
- NID images in the browser are a privacy risk; move KYC uploads to the API + object storage before a public launch.
- After rotating the leaked bot token, update every env file and restart the bot process.
