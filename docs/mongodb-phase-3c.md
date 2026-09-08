# MongoDB Phase 3C

## Test database

Set `MONGODB_TEST_URI` to a dedicated Atlas test database or local replica set. Set `MONGODB_TEST_DB_NAME` to the database name in that URI. The integration suite refuses to run without `MONGODB_TEST_URI` and verifies that the connected database name matches `MONGODB_TEST_DB_NAME`.

Run:

```text
npm run test:integration --workspace apps/api
```

The suite never reads `MONGODB_URI`, never prints connection strings, and deletes only documents belonging to its generated integration user IDs.

## Replica-set requirement

MongoDB transactions require Atlas or a replica set. A standalone MongoDB server is not a valid target. The suite checks the `hello` command for replica-set support before running financial tests.

## Legacy migration review

Do not run an automatic production backfill. First take a backup and rehearse in a staging clone.

Affected collections:

- `users`: older records may lack `uid`; backfill from `internalUid` only after checking uniqueness. Records missing both require a reviewed server-generated UID.
- `ledger_transactions`: older records may lack `referenceId` and `idempotencyKey`; derive reviewed legacy identifiers from the immutable `_id` only after checking for existing duplicate business operations. Do not guess idempotency semantics for ambiguous historical credits.
- `withdrawals`: older records may lack `idempotencyKey`; derive a reviewed legacy key from the immutable `_id` only after confirming one record per historical request.
- `fraud_events`: older records may lack `description`, `status`, `evidence`, or `metadata`; these can be backfilled with explicit legacy values after review.
- `ad_sessions`: older records may lack `startedAt`; use `createdAt` only as a reviewed compatibility value.

Recommended order:

1. Back up the database and rehearse against a staging clone.
2. Audit duplicate UIDs, referral codes, ledger references, ledger idempotency keys, and withdrawal keys.
3. Backfill only unambiguous legacy identifiers.
4. Deploy the application models and verify indexes in staging.
5. Build unique indexes after backfill validation.
6. Deploy to production during a controlled maintenance window if index creation or manual financial review requires it.
7. Verify wallet-to-ledger reconciliation before enabling production withdrawals.

No migration is included that writes to production automatically. The application will not silently weaken transaction behavior for legacy records.
