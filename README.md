# Loops CRM

Interactive sales CRM with employee logins, a Next.js API, and a database. Deployable on Vercel.

## Local setup

```bash
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Data lives in Supabase Postgres.

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

Use the same Supabase database in production.

1. In Vercel → Project → Settings → Environment Variables, set:

- `DATABASE_URL` — Supabase **Transaction pooler** URI (port `6543`, add `?pgbouncer=true`)
- `DIRECT_URL` — Supabase **Direct** URI (port `5432`)
- `AUTH_SECRET` — a long random string

2. Redeploy. The first login/bootstrap creates team accounts if the database is empty.

## API

Authenticated JSON routes live under `/api`:

- `POST /api/auth/login` and `POST /api/auth/logout`
- `GET /api/bootstrap`
- Employees, contacts, companies, deals, tasks, messages, and profile mutations
