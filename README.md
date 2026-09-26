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

Admin login (until you change it): `habiba@loopscrm.com` / `loops123`

Admin creates every other account (BD, developer, manager) from Team.

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
