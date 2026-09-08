# MongoDB Phase 6 Runbook

## Test isolation

The real integration suite uses only `MONGODB_TEST_URI` and `MONGODB_TEST_DB_NAME`. It never falls back to `MONGODB_URI`.

Run only with a dedicated test database:

```text
npm run test:integration --workspace apps/api
```

The test database must be Atlas or a MongoDB replica set. The suite checks replica-set support, exercises transaction rollback/concurrency, and removes only generated integration records.

If either test variable is missing, the correct result is `MONGODB_TEST_URI_NOT_FOUND` and no database connection is attempted.

## Production configuration

- `MONGODB_URI` is provided only by the production secret environment.
- Production startup fails if the URI or strong JWT configuration is missing.
- MongoDB connection errors redact URI-like text.
- Shutdown closes the Mongoose connection gracefully.
- No test or recovery command may call `dropDatabase`, delete untagged records, or use the production URI.

## Atlas setup

1. Create a separate Atlas test database and database user.
2. Use a replica-set-capable Atlas cluster.
3. Restrict network access to the test runner and deployed API as appropriate.
4. Set `MONGODB_TEST_URI` and `MONGODB_TEST_DB_NAME=faagency_test` only in the test runner environment.
5. Run the integration suite and preserve its output as a deployment artifact.
6. Keep production credentials and test credentials separate.

## Recovery

Use Atlas backups and point-in-time recovery. Restore to staging first, reconcile wallets against the immutable ledger, rehearse migrations, and obtain approval before any production recovery. Never test restore or migration scripts against production without a controlled change window.
