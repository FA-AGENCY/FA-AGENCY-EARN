# Telegram Bot Runbook

## Runtime

The bot uses Telegraf long polling. It does not use webhooks and does not connect to MongoDB.

Required runtime variables:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_MINI_APP_URL` or compatible `APP_URL`, using HTTPS
- Optional `SUPPORT_URL`

Start locally:

```text
npm run dev:bot
```

Production process:

```text
npm run start --workspace apps/bot
```

Run the bot as a separate monitored process. Never print the token or include it in source control.

## Commands

The bot supports `/start`, `/app`, `/earn`, `/tasks`, `/wallet`, `/withdraw`, `/referral`, `/bonus`, `/history`, `/support`, and `/help`.

Commands provide Bengali guidance and the official Mini App launch button. Wallet, reward, identity, withdrawal, and fraud state remain in the authenticated API and database; the bot has no second business-logic or wallet implementation.

## Safety

- Duplicate Telegram update IDs are ignored during a short retention window.
- Bot errors return a Bengali safe message and do not expose internal details.
- Missing token or non-HTTPS Mini App URL prevents startup.
- The bot does not accept client financial values.
- Protected financial data is not returned to unauthenticated bot commands.

## Operations

On `SIGINT` or `SIGTERM`, polling stops gracefully. Rotate the bot token through the deployment secret manager if exposure is suspected. Do not switch to webhook mode without a separately reviewed deployment phase.
