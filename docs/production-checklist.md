# Production Checklist

## Secrets and environment

- [ ] Set `NODE_ENV=production`.
- [ ] Set a strong `JWT_SECRET` of at least 32 characters through a secret manager.
- [ ] Set `MONGODB_URI` only to the production Atlas database at runtime.
- [ ] Keep `MONGODB_TEST_URI` separate; never use it as a production fallback.
- [ ] Set `TELEGRAM_BOT_TOKEN` only in the bot process secret environment.
- [ ] Set `TELEGRAM_MINI_APP_URL=https://app.fa-agency.online`.
- [ ] Set `API_BASE_URL=https://api.fa-agency.online` and `VITE_API_URL` for frontend builds.
- [ ] Set explicit `CORS_ORIGINS` for the trusted HTTPS origins.
- [ ] Keep `MONETAG_REWARD_ENABLED=false`.

## Deployment

- [ ] Deploy API at `https://api.fa-agency.online`.
- [ ] Deploy Mini App at `https://app.fa-agency.online`.
- [ ] Deploy Admin Panel at `https://admin.fa-agency.online`.
- [ ] Run Telegram bot as a separate long-polling process.
- [ ] Configure TLS certificates and renewal monitoring.
- [ ] Verify health, auth, dashboard, withdrawal, admin RBAC, and bot launch after deployment.

## Financial safety

- [ ] Verify Atlas replica-set transactions in a dedicated test database.
- [ ] Reconcile wallet balances against immutable ledger records.
- [ ] Verify withdrawal rejection reversal and duplicate idempotency.
- [ ] Never enable Monetag financial rewards without an official server-verifiable mechanism.

## Operations

- [ ] Enable Atlas backups and monitoring.
- [ ] Test restore in staging.
- [ ] Store deployment logs without tokens, passwords, URIs, or payment data.
- [ ] Prepare rollback for application code and reviewed database migrations.
- [ ] Rotate any credential that was exposed during development or chat.

HTTPS live verification is an external deployment prerequisite and must not be claimed from local builds.
