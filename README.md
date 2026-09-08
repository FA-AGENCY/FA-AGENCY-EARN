# FA AGENCY™ EARN

A Telegram-first earning platform MVP built as a modular monorepo.

## Overview

This repository provides:

- API service for Telegram auth, dashboard, reward logic, wallet, tasks, referrals, and withdrawals
- Mini App frontend for mobile Telegram experience
- Admin panel for operations and verification
- Shared branding and configuration constants
- Production-oriented docs for deployment and monitoring

## Stack

- Node.js + Express
- MongoDB + Mongoose patterns
- React + Vite frontend apps
- Redis-ready rate limiting hooks
- Telegram WebApp validation logic

## Monorepo Layout

- `apps/api`: Central REST API service (Telegram WebApp auth, user management, wallet ledger, tasks, withdrawals, anti-fraud engine, admin endpoints)
- `apps/bot`: Telegram Bot service (long polling architecture, 11 commands, Bengali keyboard responses)
- `apps/mini-app`: Telegram Mini App (Bengali UI with all 9 functional sections: হোম, বিজ্ঞাপন, কাজ, দৈনিক বোনাস, রেফারেল, ওয়ালেট, ইতিহাস, প্রোফাইল, সহায়তা)
- `apps/admin-panel`: Administrative Suite (Bengali operations UI: Dashboard, Users, Withdrawals, Fraud Center, Tasks, Support, Audit Logs)
- `docs`: Operational documentation, security policies, backup/recovery, and Bengali terms/policies
- `locales`: Localization files (Bengali bn.json and English en.json)

## Quick start

1. Install dependencies:
   npm install
2. Copy environment variables:
   cp .env.example .env
3. Start backend:
   npm run dev:api
4. Start mini app:
   npm run dev:mini
5. Start admin panel:
   npm run dev:admin

## Environment variables

See [.env.example](.env.example) for required keys.

## Notes

This MVP intentionally keeps the architecture production-friendly while avoiding fabricated Monetag APIs or fake reward mechanisms. It implements a guardrail-first design: server-side validation, ledger logic, and duplicate prevention are central to the system.

## Production sequence

1. Configure Telegram Bot token and Telegram Mini App domain
2. Configure MongoDB Atlas
3. Configure Monetag zone and revenue settings
4. Run admin onboarding and configuration
5. Validate withdrawal flow and fraud controls
6. Launch with maintenance mode and monitored health checks

## Security

- Never trust client balances
- Validate Telegram initData on the backend
- Use server-side reward engine and ledger operations
- Rate limit sensitive endpoints
- Keep secrets out of frontend bundles
