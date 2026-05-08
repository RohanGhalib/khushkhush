# KhushKhush

Gen‑Z meme streetwear storefront and admin console built with Next.js.

## Overview
KhushKhush is a full e‑commerce experience for a streetwear brand, including a public
storefront, an authenticated admin dashboard, transactional email workflows, and
media uploads. It uses Firebase Auth/Firestore for identity and data, Resend for
emails, and Cloudflare R2 for product media.

## Features
- Storefront with collections, product detail pages, cart, wishlist, and checkout.
- Admin dashboard for products, collections, coupons, orders, users, and newsletter.
- Transactional emails (welcome, order confirmation, order status updates).
- Newsletter subscription + blast tooling.
- Secure, rate‑limited API routes with Firebase token verification.
- Cloudflare R2 presigned uploads for product media.
- On‑demand ISR revalidation for storefront pages.

## Tech Stack
- Next.js 16 / React 19 (App Router)
- Firebase Auth + Firestore (client + REST)
- Resend for emails
- Cloudflare R2 (S3‑compatible)
- Tailwind CSS 4
- Zustand state stores
- TipTap rich text editor

## Project Structure
- `src/app/(store)` – public storefront routes
- `src/app/admin` – admin dashboard routes
- `src/app/api` – API routes (orders, emails, newsletter, uploads, revalidate)
- `src/components` – UI + feature components
- `src/emails` – React email templates
- `src/lib` – shared utilities (Firebase, cart, rate limiting)
- `scripts` – admin utilities (custom claims, R2 CORS)

## Getting Started
Install dependencies:
```bash
npm install
```

Create a `.env.local` file with the environment variables listed below, then run:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables
```bash
# Firebase (public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Resend
RESEND_API_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=
```

## Admin Setup
Admin access is controlled by a Firebase custom claim (`admin: true`).

1. Download a Firebase service account key and save it as `service-account.json`
   in the project root (it is git‑ignored).
2. Run one of the scripts below:
   ```bash
   node scripts/set-admin-claim.mjs <USER_UID>
   # or
   node scripts/set-admin-by-email.mjs <USER_EMAIL>
   ```
3. Sign out and sign back in to refresh your ID token.

## Cloudflare R2 CORS
To enable browser uploads for local dev or production:
```bash
node scripts/setup-r2-cors.mjs
```

## Scripts
- `npm run dev` – start the dev server
- `npm run build` – production build
- `npm run start` – run the production server
- `npm run lint` – lint the codebase

## Deployment
Deploy on Vercel or another Node.js host. Ensure all environment variables are set
and Firebase Auth/Firestore rules are configured for your project.

## Notes
The built‑in rate limiter is in‑memory and best suited for single‑instance Node
deployments. For serverless environments, consider a Redis‑backed limiter.
