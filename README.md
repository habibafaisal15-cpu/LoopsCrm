# Loops CRM

Interactive sales CRM with employee logins, a Next.js API, and a database. Deployable on Vercel.

## Local setup

```bash
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Local data lives in `prisma/dev.db`.

Team login password (until you change it): `loops123`

| Role | Email |
| --- | --- |
| Admin | habib@loopscrm.com |
| Manager | noor@loopscrm.com |
| Business Developer | ayesha@loopscrm.com |
| Business Developer | hamza@loopscrm.com |
| Support | danish@loopscrm.com |
| Developer | zain@loopscrm.com |
| Developer | maha@loopscrm.com |

Admin can add employees, set roles, and open each profile to review that person's work.

## Deploy on Vercel

Vercel’s filesystem is ephemeral, so production needs a hosted SQLite-compatible database. [Turso](https://turso.tech) is the usual match.

1. Create a Turso database and copy the URL and token.
2. Import this repo into Vercel.
3. Set environment variables:

- `DATABASE_URL` = `file:./prisma/dev.db` (used by Prisma generate)
- `TURSO_DATABASE_URL` = your `libsql://...` URL
- `TURSO_AUTH_TOKEN` = your Turso token
- `AUTH_SECRET` = a long random string

4. From your machine, push the schema and seed once against Turso:

```bash
$env:TURSO_DATABASE_URL="libsql://..."
$env:TURSO_AUTH_TOKEN="..."
$env:DATABASE_URL="file:./prisma/dev.db"
npx tsx prisma/seed.ts
```

The seed script writes through the same Prisma client, so with Turso env vars set it seeds production. If the production database is empty, the first successful API call also seeds demo accounts.

5. Deploy.

## API

Authenticated JSON routes live under `/api`:

- `POST /api/auth/login` and `POST /api/auth/logout`
- `GET /api/bootstrap`
- Employees, contacts, companies, deals, tasks, messages, and profile mutations
