# Coaching Institute Notes Marketplace

Production-ready Next.js 16 application for selling digital study notes with student accounts, secure PDF downloads, Razorpay payments, Prisma/PostgreSQL, Cloudinary storage, and a protected admin dashboard.

## Source Boundary

The app intentionally does not invent institute facts. Faculty names, branches, rankings, results, testimonials, achievements, student counts, and contact details are hidden unless you configure verified official data from:

- The official institute website
- Official institute social media pages
- Public Google Business profile
- Public YouTube channel

Seeded catalog data is explicitly marked as placeholder and must be replaced before launch.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, ShadCN-style local UI primitives
- Auth.js/NextAuth credentials auth with Prisma adapter
- Prisma 7 ORM with PostgreSQL and `@prisma/adapter-pg`
- Razorpay server-side order creation, signature verification, and webhook reconciliation
- Cloudinary signed upload parameters and secure PDF URL generation
- Vercel-compatible deployment

## Features

- Public pages: home, about, categories, marketplace, product detail, cart, checkout, contact, FAQ, blog, privacy, terms
- Product fields: title, subject, class, exam type, description, thumbnail, previews, sample PDF, full PDF key/URL, pricing, discount, tags, language, stock, featured, status
- Checkout: local cart, authenticated checkout, Razorpay order creation, payment verification, failure/success handling
- User account: sign up/sign in, order history, purchased notes library, secure download tokens
- Admin dashboard: analytics, products, categories, subjects, orders, users, coupons, blog, banners, reviews, messages, payment logs, CSV export
- Security: protected admin/account routes, Zod validation, rate limiting, server-side payment verification, webhook signature verification, secure env usage

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

Default seeded admin uses `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` from `.env.local`.

## Database

This project uses PostgreSQL. Configure `DATABASE_URL`, then run:

```bash
npm run prisma:migrate
npm run db:seed
```

For local development, `DATABASE_URL` in `.env.example` expects PostgreSQL on
`localhost:5432` with database `hada_institute`, user `postgres`, and password
`postgres`.

If Docker Desktop is installed:

```bash
docker compose up -d postgres
npm run prisma:migrate
npm run db:seed
```

If Docker is not installed, install PostgreSQL for Windows, create a database
named `hada_institute`, make sure the PostgreSQL service is running, and keep
`DATABASE_URL` aligned with your local username/password.

For production:

```bash
npm run prisma:deploy
```

## Razorpay Setup

1. Create Razorpay API keys in the Razorpay dashboard.
2. Set `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET`.
3. Add webhook URL: `/api/webhooks/razorpay`.
4. Subscribe to `payment.captured`, `payment.failed`, and `refund.processed`.
5. Set `RAZORPAY_WEBHOOK_SECRET`.

The frontend payment response is never trusted alone. The app verifies the HMAC signature server-side and also reconciles via webhooks.

## Cloudinary Setup

1. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
2. Upload thumbnails/previews as images.
3. Upload full PDFs as authenticated/raw assets.
4. Store the Cloudinary public ID in `fullPdfKey` for signed downloads.

The download route validates user ownership, expiry, and download limits before redirecting to a signed PDF URL.

## Vercel Deployment

1. Push the repository to GitHub.
2. Create a Vercel project and set all environment variables from `.env.example`.
3. Provision PostgreSQL and set `DATABASE_URL`.
4. Run `npm run prisma:deploy` during deployment or from a secure CI step.
5. Run `npm run db:seed` once to create the first admin.
6. Configure Razorpay webhook to `https://your-domain.com/api/webhooks/razorpay`.

## Scripts

- `npm run dev` - local development
- `npm run build` - production build
- `npm run start` - production server
- `npm run lint` - Biome checks
- `npm run format` - format code
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - create/apply local migrations
- `npm run prisma:deploy` - apply migrations in production
- `npm run db:seed` - seed placeholder admin/catalog data
- `npm run studio` - Prisma Studio

## Verification

Current project checks:

```bash
npm run lint
npm run build
```
