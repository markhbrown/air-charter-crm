This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Local development with Supabase

This project uses a local Supabase stack (run via the Supabase CLI) for the database and auth.

```bash
supabase start                      # boot Postgres, Auth, Studio, etc.
cp .env.local.example .env.local    # then paste keys from `supabase status`
supabase db reset                   # apply migrations + load seed data
npm run dev
```

`supabase status` prints the API URL and the **Publishable** key — put them in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Supabase Studio is at http://127.0.0.1:54323.

### Test account

`supabase db reset` seeds a ready-to-use broker account plus sample companies, contacts and inquiries:

| Email | Password |
| --- | --- |
| `broker@aircharter.test` | `Password123!` |

This account is **local only** — it is recreated on every `supabase db reset` and does not exist on any hosted/deployed environment (create a demo account there via normal sign-up).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
