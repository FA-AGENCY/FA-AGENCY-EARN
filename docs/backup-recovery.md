# Backup ও Recovery Runbook

## Backup

- MongoDB Atlas-এর automated backup এবং point-in-time recovery চালু রাখতে হবে।
- Production ও test database আলাদা রাখতে হবে।
- Backup access production secret management-এর মাধ্যমে সীমিত করতে হবে।
- মাসে অন্তত একবার staging clone-এ restore পরীক্ষা করতে হবে।

## Restore

1. Incident ঘোষণা করে নতুন financial writes সাময়িকভাবে আটকে দিন।
2. Incident time এবং desired recovery point নির্ধারণ করুন।
3. Atlas backup থেকে staging-এ restore করে wallet-to-ledger reconciliation চালান।
4. Application version ও migration order যাচাই করুন।
5. অনুমোদিত recovery window-তে production restore করুন।
6. Auth, withdrawal, fraud এবং audit checks চালিয়ে service খুলুন।

## Secret recovery

Secret কোনো source file বা chat-এ রাখা যাবে না। Secret manager থেকে নতুন MongoDB, JWT, Telegram এবং provider credentials issue করতে হবে। প্রকাশিত credential সঙ্গে সঙ্গে rotate করতে হবে।

## Rollback ও migration

Application deployment rollback করা যাবে, কিন্তু financial ledger বা audit history destructiveভাবে rollback করা যাবে না। Database migration আগে staging clone-এ rehearsal করতে হবে এবং unique index তৈরির আগে legacy duplicate যাচাই করতে হবে।

কোনো test বা recovery script production database drop/delete করতে পারবে না।
