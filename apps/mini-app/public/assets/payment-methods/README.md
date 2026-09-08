# FA AGENCY™ EARN — Payment Method Logos

Place payment gateway logo files here:

- `bkash.png` or `bkash.webp` — bKash logo
- `nagad.png` or `nagad.webp` — Nagad logo
- `rocket.png` or `rocket.webp` — Rocket logo

**Recommended format:** PNG/WebP with transparent or white background, 120×80px.

These are served from the `/public/assets/payment-methods/` directory and referenced as:
  `/assets/payment-methods/bkash.webp` (tries webp first, falls back to png)

⚠️ Only use official brand assets with proper permission from bKash, Nagad, and Rocket.
The PaymentMethodSelector component will show a text fallback if files are missing.
