# CPWD

Personal / agency site for CPWD (Nuxt 4).

## Setup

```bash
npm install
cp .env.example .env
```

Fill secrets in `.env` (never commit real keys).

### Website scanner (PageSpeed)

The `/website-scanner` scanner uses the **Google PageSpeed Insights API v5** via a server-only endpoint.

1. Create an API key: https://developers.google.com/speed/docs/insights/v5/get-started
2. Add to `.env`:

```bash
GOOGLE_PAGESPEED_API_KEY=your_key_here
```

Do **not** prefix this with `NUXT_PUBLIC_` - the key must stay server-side.

For UI work without calling Google:

```bash
SITE_AUDIT_MOCK=1 npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
npm run i18n:validate
```

## Production

```bash
npm run build
npm run preview
```
