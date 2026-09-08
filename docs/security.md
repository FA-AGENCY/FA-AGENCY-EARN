# Security and financial controls

## Core principles

- Never trust client balance values.
- Validate Telegram initData server-side.
- Treat wallet and reward crediting as atomic ledger operations.
- Prevent duplicate rewards and duplicate withdrawals using idempotency and session checks.

## Required production controls

- HTTPS only
- Helmet and secure headers
- CORS restrictions
- Rate limiting on sensitive routes
- Input validation and schema validation
- Backend-only secret handling
- Audit logs for admin changes
- Database transactions for wallet updates
- Maintenance mode support without changing user balances
- Telegram bot is a thin command/Mini App launcher and does not maintain wallet or reward state
- Bot financial views remain inside the authenticated Mini App; unauthenticated bot commands cannot access protected API data

## MVP implementation notes

This repository includes starter service boundaries and safety rules, but production deployment still needs the actual MongoDB, Telegram auth, and Monetag setup to be wired in.
