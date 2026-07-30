This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

This is for people who don't want to use LLM features on Ollama for easier testing. Keep in mind that this will disable LLM features in the mobile app.

## Running the Database

If it's the first time running the database, refer to the instructions in https://www.prisma.io/docs/prisma-orm/quickstart/prisma-postgres for more details. For now, follow the instructions below.

Run the Postgres database on Docker
```bash
docker compose up -d
```

Install the required dependency
```bash
npm init
npm install typescript tsx @types/node --save-dev
npm install prisma @types/pg --save-dev
npm install @prisma/client @prisma/adapter-pg pg dotenv
```

Then, to prepare the database:

```bash
npx prisma migrate reset
npx prisma migrate dev --name init
npx prisma generate
```
To populate the database

```bash
npx prisma db seed
```

To check the database with a web interface
```bash
npx prisma studio
```

Run the development server:

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
