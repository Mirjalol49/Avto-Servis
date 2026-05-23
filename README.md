# AutoServis

Car service ERP and CRM built with Next.js App Router, Prisma, PostgreSQL,
Supabase Storage, Supabase Realtime, NextAuth, Tailwind CSS, and shadcn/ui.

## Local Setup

1. Copy `.env.example` to `.env.local` and fill in the real values.
2. Install dependencies:

```bash
npm install
```

3. Apply database migrations and generate Prisma Client:

```bash
set -a; source .env.local; set +a; npx prisma migrate deploy
npx prisma generate
```

4. Create the first admin user:

```bash
ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="strong-password" ADMIN_NAME="Admin" npx prisma db seed
```

5. Verify Supabase Storage and Realtime:

```bash
npm run verify:supabase
```

6. Start the app:

```bash
npm run dev
```

## Production Checks

Run the full local verification before deployment:

```bash
npm run verify
```

Run a production server smoke test after `npm run build`:

```bash
npm run smoke
```

Run the full production gate after Supabase keys are valid:

```bash
npm run verify:prod
```

Required production environment variables:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SECRET_KEY` or legacy `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `CURRENCY`

The browser subscribes only to the non-sensitive `RealtimeEvent` table. Server
mutations write audit logs and refresh events, then dashboard pages refresh
through Supabase Realtime without exposing business table rows through the anon
key.

The health endpoint is available at `/api/health`. It verifies database
connectivity and returns `503` if the database check fails.
