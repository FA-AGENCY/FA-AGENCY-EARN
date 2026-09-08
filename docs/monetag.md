# Monetag integration guidance

This project keeps Monetag isolated behind the provider adapter and uses the official `monetag-tg-sdk` for Telegram Mini Apps.

## Important constraints

- The official Telegram Mini App SDK supports Rewarded Interstitial, Rewarded Pop, and In-App Interstitial formats.
- The official SDK exposes `createAdHandler(zoneId)` and a Promise that resolves after the ad experience.
- Do not invent Monetag SDK callback payloads, server endpoints, postbacks, or signed completion events.
- The current official documentation does not document a server-verifiable completion callback for this SDK.
- Keep provider-specific request/response handling inside the provider service, not the reward engine.

## Production checklist

1. Confirm the current Monetag ad format support and policy in the official docs.
2. Add `MONETAG_ZONE_ID` to the backend environment and `VITE_MONETAG_ZONE_ID` to the public Mini App build environment. Zone IDs are placement identifiers, not secrets.
3. Keep `MONETAG_REWARD_ENABLED=false` until Monetag supplies a documented server-verifiable completion mechanism for this publisher account.
4. Never credit a financial wallet from an unverified browser-only claim.
5. Log provider errors separately from user reward failures.
6. Test ad display, duplicate prevention, cooldowns, and fraud handling before launch.

Official references:

- https://docs.monetag.com/
- https://docs.monetag.com/docs/ad-formats/
- https://help.monetag.com/en/articles/9991990-how-to-integrate-a-rewarded-interstitial-tag-into-telegram-mini-apps
- https://github.com/propellerads/monetag-tg-sdk

## Project pattern

`MonetagProvider` is the concrete provider implementation. The reward engine consumes generic session data without depending on Monetag internals. The provider intentionally fails closed for server-side financial reward verification until an official provider-verifiable mechanism is documented.
