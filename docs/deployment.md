# Deployment guide

## Development

- Install dependencies with `npm install`
- Copy `.env.example` to `.env`
- Start API: `npm run dev:api`
- Start Mini App: `npm run dev:mini`
- Start Admin: `npm run dev:admin`
- Start Telegram bot long polling: `npm run dev:bot`

## Staging

- Configure a staging MongoDB Atlas cluster
- Deploy the API to a staging host with HTTPS enabled
- Configure Telegram bot environment variables
- Run the bot as a separate long-polling process with `TELEGRAM_BOT_TOKEN` and an HTTPS `APP_URL`
- Test auth and ad reward flows with sandbox settings

## Production

- Use HTTPS and custom domains
- Set `NODE_ENV=production`
- Configure MongoDB Atlas, Telegram Bot, and Monetag secrets
- Enable monitoring, backups, and structured logs
- Put the app behind maintenance mode before major changes

## Production checklist

- Database backup scheduled
- Monitoring endpoints enabled
- Environment variables secured
- Admin RBAC configured
- Telegram bot token stored only in the deployment secret manager
- Bot process monitored and restarted without exposing token values
- Withdrawal workflow reviewed
- Fraud signals validated
- Health endpoint available
