# E-commerce + ZapPay

Real-business-oriented Next.js/Prisma starter with server-side pricing, database cart, COD, ZapPay payment abstraction and server-side payment verification.

## Setup

1. Install Node.js.
2. Create a PostgreSQL database.
3. Copy `.env.example` to `.env.local`.
4. Put your regenerated ZapPay key in `ZAP_API_KEY=ENTER_ZAP_API_KEY_HERE`.
5. Run:
   `npm install`
   `npx prisma generate`
   `npx prisma db push`
   `npx prisma db seed`
   `npm run dev`

Never commit `.env.local`.

## Payment flow

Checkout creates an internal order. Online orders then create a ZapPay order server-to-server. The return page calls the server status endpoint; the browser callback itself is never treated as payment proof. Only a verified provider `success` can mark the payment paid.

ZapPay API documentation: https://zappay.shop/api/

## Important before launch

- Replace sample branding/products.
- Use a production-grade password hashing algorithm such as Argon2/bcrypt before real customer accounts.
- Add rate limiting, email verification/password reset, CSRF strategy where applicable, inventory reservation/hold expiry, coupon redemption transactions, refunds/returns, shipping integration, audit logs, monitoring and backups.
- Confirm all payment/webhook behavior against the current ZapPay documentation before going live.
- Complete the payment provider's account/KYC/business requirements.

## Admin

Admin routes are under `/admin`. The dashboard includes sales/order/customer/product summaries, product CRUD/deactivation, category creation, order search/status management, customer listing, and payment/COD settings. Admin APIs enforce server-side ADMIN authorization.

For real launch, replace the temporary SHA-256 password storage in the starter with Argon2id or bcrypt and add password reset/email verification/rate limiting.
