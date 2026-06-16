# Gagrileba.ge HVAC Commerce Platform

Modern Next.js replacement for the old WordPress/WooCommerce storefront. The app is Georgian-first and built for product sales, phone-number capture, installation scheduling, order management, CRM follow-up, SEO, and payment readiness.

## Stack

- Next.js App Router, TypeScript, React Server Components
- Tailwind CSS with shadcn-style local components
- PostgreSQL + Prisma
- Zod validation
- JWT cookie admin session with role-ready users
- Modular payments with Bank of Georgia card and installment redirects
- S3-compatible storage abstraction
- Event log for analytics/payment/admin audit trails
- Vitest + Playwright

## Local Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Start PostgreSQL:

```bash
docker compose up -d db
```

3. Install dependencies and generate Prisma client:

```bash
npm install
npm run prisma:generate
```

4. Run migrations and seed:

```bash
npm run prisma:migrate
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

Public site: `http://localhost:3000`  
Admin: `http://localhost:3000/admin`

Seed admin:

- Email: `admin@gagrileba.ge`
- Password: `ChangeMe123!`

Change this password immediately in production.

## Key Routes

- `/` storefront home
- `/products` searchable/filterable product listing
- `/products/[slug]` SEO-friendly product detail
- `/air-conditioners`, `/gas-boilers`, `/heaters`, `/water-heaters`, `/accessories`
- `/installation` installation service
- `/calculator` quote/recommendation wizard
- `/checkout` order creation
- `/contact`, `/about`, `/blog`
- `/admin` dashboard
- `/admin/products`, `/admin/leads`, `/admin/orders`, `/admin/installations`

## Environment Variables

See `.env.example`. Important production values:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_COMPANY_PHONE`
- `NEXT_PUBLIC_MESSENGER_URL`
- `NEXT_PUBLIC_WHATSAPP_URL`
- `BOG_CLIENT_ID`
- `BOG_CLIENT_SECRET`
- `BOG_API_URL`
- `BOG_AUTH_URL`
- `BOG_CALLBACK_PUBLIC_KEY`
- `BOG_LOAN_TYPE`
- `S3_ENDPOINT`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `GA4_ID`
- `META_PIXEL_ID`
- `CRON_SECRET`
- `ADMIN_LOGIN_PATH`
- `SOURCE_SYNC_ARCHIVE_UNAVAILABLE`
- `MIDEA_SYNC_ARCHIVE_UNAVAILABLE`

Secrets are only read server-side.

`SOURCE_SYNC_ARCHIVE_UNAVAILABLE=false` is the recommended default. Source sites can return `404` or hide prices for out-of-stock products; with the default setting those products stay visible but become `stock = 0` on this site. Set it to `true` only if you want unavailable products archived instead.

## Source Price Sync

The app can link local products to supplier pages, then update prices and stock automatically.

Current sources:

- Midea products use `midea.ge`.
- Beko, Millen, Vox, and future Aux products use `technoshop.ge`.

What it does:

- Scrapes source product pages with regular HTTP fetch, no Selenium needed.
- Updates `price` and `oldPrice`.
- Stores the source URL on each product.
- Marks products as out of stock when the source returns `404` or has no usable price.
- Saves source status and last sync time for admin/debugging.

Useful commands:

```bash
# See which products would link to source URLs, without writing
npm run sync:prices -- --link --dry-run

# Link products to source URLs
npm run sync:prices -- --link

# Sync prices and stock for linked products
npm run sync:prices

# Sync and archive unavailable products instead of only setting stock to 0
npm run sync:prices -- --archive-unavailable
```

Provider-specific debug commands:

```bash
npm run sync:midea -- --link --dry-run
npm run sync:technoshop -- --link --dry-run
npm run sync:midea
npm run sync:technoshop
```

Daily automation options:

```bash
# Server cron: recommended on a VPS
0 6 * * * cd /var/www/gagrileba && /usr/bin/npm run sync:prices >> /var/log/gagrileba-price-sync.log 2>&1
```

Or call the protected HTTP endpoint:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://gagrileba.ge/api/cron/source-prices
```

On Vercel, `vercel.json` already registers `/api/cron/source-prices` once per day. On a VPS, use system cron or a systemd timer.

## WooCommerce Migration

Export products from WordPress Admin:

1. Go to WooCommerce -> Products.
2. Click Export.
3. Include custom meta if attributes/specs are stored there.
4. Download the CSV.

Import into this platform:

```bash
npm run import:products -- ./exports/products.csv
```

Supported mappings:

- `Name` -> product name
- `Slug` -> slug
- `SKU` -> SKU/model fallback
- `Regular price` -> old/current price
- `Sale price` -> current price, regular price becomes old price
- `Stock` -> stock
- `Categories` -> category
- `Images` -> main image URL
- `Description` -> description
- `Short description` -> short description

Imported products start as `draft` so an admin can review pricing, images, specs, warranty, SEO, and installation compatibility before publishing.

## Payments

`src/lib/payments/types.ts` defines the provider interface:

- `createPayment`
- `verifyPayment`
- `handleWebhook`
- `refundPayment`

`src/lib/payments/bog.ts` creates real Bank of Georgia hosted checkout orders when `BOG_CLIENT_ID` and `BOG_CLIENT_SECRET` are configured. Checkout `card` uses BOG card payment, and checkout `installment` uses BOG's `bog_loan` installment payment method with the customer's selected term. Webhooks update the local payment and order statuses. Add `BOG_CALLBACK_PUBLIC_KEY` in production to verify callback signatures.

## Analytics

Server-side event logging lives in `EventLog` and `src/lib/analytics/events.ts`. The app records lead submissions, purchases, payment webhooks, and admin product creation. GA4, Meta Pixel, and Meta Conversions API can consume these events from the same abstraction.

## Testing

```bash
npm run test
npm run test:e2e
```

Playwright expects the app to be runnable on `http://localhost:3000`.

## VPS Deployment

This is the easy VPS path.

Assumptions:

- Ubuntu server.
- App lives at `/var/www/gagrileba`.
- Domain points to the VPS.
- PostgreSQL runs either on the same VPS or a managed DB.
- Node 20+ is installed.

### 1. Install Basics

```bash
sudo apt update
sudo apt install -y git nginx postgresql postgresql-contrib
```

Install Node with your preferred method. Example using NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Optional but recommended:

```bash
sudo npm install -g pm2
```

### 2. Create Database

```bash
sudo -u postgres psql
```

Inside `psql`:

```sql
CREATE DATABASE gagrileba;
CREATE USER gagrileba WITH PASSWORD 'replace-with-a-real-password';
GRANT ALL PRIVILEGES ON DATABASE gagrileba TO gagrileba;
\q
```

Your `DATABASE_URL` will look like:

```env
DATABASE_URL="postgresql://gagrileba:replace-with-a-real-password@localhost:5432/gagrileba"
```

### 3. Upload App

```bash
sudo mkdir -p /var/www/gagrileba
sudo chown -R $USER:$USER /var/www/gagrileba
cd /var/www/gagrileba
git clone <your-repo-url> .
```

If you deploy by copying files instead of Git, just make sure `package.json`, `prisma`, `src`, `public`, `next.config.ts`, and `.env` are present.

### 4. Configure Env

```bash
cp .env.example .env
nano .env
```

Minimum production env:

```env
DATABASE_URL="postgresql://gagrileba:replace-with-a-real-password@localhost:5432/gagrileba"
AUTH_SECRET="generate-a-long-random-secret"
NEXT_PUBLIC_SITE_URL="https://gagrileba.ge"
NEXT_PUBLIC_COMPANY_PHONE="+995 551 10 30 55"
NEXT_PUBLIC_COMPANY_EMAIL="gagrileba@gmail.com"
NEXT_PUBLIC_MESSENGER_URL="https://m.me/gagrileba"
NEXT_PUBLIC_WHATSAPP_URL="https://wa.me/995551103055"
BOG_API_URL="https://api.bog.ge"
BOG_AUTH_URL="https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token"
BOG_CLIENT_ID=""
BOG_CLIENT_SECRET=""
BOG_CALLBACK_PUBLIC_KEY=""
BOG_LOAN_TYPE="standard"
CRON_SECRET="generate-another-long-random-secret"
ADMIN_LOGIN_PATH="/gagrileba-admin"
SOURCE_SYNC_ARCHIVE_UNAVAILABLE="false"
MIDEA_SYNC_ARCHIVE_UNAVAILABLE="false"
```

Generate secrets:

```bash
openssl rand -base64 48
```

### 5. Install, Migrate, Build

```bash
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run build
```

Only seed a fresh empty DB:

```bash
npm run db:seed
```

Do not run seed on production after real products/orders exist unless you know exactly why.

### 6. Start With PM2

```bash
pm2 start npm --name gagrileba -- start
pm2 save
pm2 startup
```

Check logs:

```bash
pm2 logs gagrileba
```

Restart after deploy:

```bash
cd /var/www/gagrileba
git pull
npm ci
npm run prisma:deploy
npm run build
pm2 restart gagrileba
```

### 7. Nginx Reverse Proxy

Create:

```bash
sudo nano /etc/nginx/sites-available/gagrileba
```

Paste:

```nginx
server {
    server_name gagrileba.ge www.gagrileba.ge;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/gagrileba /etc/nginx/sites-enabled/gagrileba
sudo nginx -t
sudo systemctl reload nginx
```

Add SSL:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d gagrileba.ge -d www.gagrileba.ge
```

### 8. Daily Price Sync On VPS

After the first deploy, link products once:

```bash
cd /var/www/gagrileba
npm run sync:prices -- --link
```

Then install the daily cron:

```bash
crontab -e
```

Add:

```cron
0 6 * * * cd /var/www/gagrileba && /usr/bin/npm run sync:prices >> /var/log/gagrileba-price-sync.log 2>&1
```

Manual test:

```bash
cd /var/www/gagrileba
npm run sync:prices
tail -n 100 /var/log/gagrileba-price-sync.log
```

Expected output includes:

- `midea`: the official Midea sync result.
- `technoshop`: the Beko/Millen/Vox/Aux Technoshop sync result.
- `checked`: number of linked products checked for that source.
- `ok`: products found with prices.
- `unavailable`: products returned as `404` or out.
- `errors`: network/parser errors.

If a product is 404 or has no usable source price, the sync sets `stock = 0` locally. That is the whole deploy story: link once, cron once, done.

### 9. Admin Login

Seed admin, if you seeded:

- Email: `admin@gagrileba.ge`
- Password: `ChangeMe123!`

Change this immediately after launch.

### 10. Fast Health Checks

```bash
curl -I http://127.0.0.1:3000
curl -I https://gagrileba.ge
npm run sync:prices -- --link --dry-run
npm run sync:prices
pm2 status
pm2 logs gagrileba --lines 100
```

## Docker Deployment

```bash
docker build -t gagrileba .
docker run -p 3000:3000 --env-file .env gagrileba
```

For production VPS deployment, PM2 + Nginx is simpler to debug unless you already run everything through Docker.

## Assumptions

- Georgian is the default language; English can be added through content dictionaries later.
- Real product photos, BOG production credentials, exact address, and exact policy/legal text will be supplied before launch.
- Admin CRUD is implemented as an MVP: create/list/detail flows are present, while richer inline editing, image upload UI, and calendar drag/drop can be extended from the existing schema and endpoints.
- Checkout creates orders and installation tasks; card and installment payments create BOG hosted checkout records and rely on the BOG webhook to mark orders as paid.
- Product recommendations use deterministic rules for MVP and can later be replaced with a more detailed sizing calculator.
