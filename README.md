# Next.js SaaS Starter

This is a starter template for building a SaaS application using **Next.js** with Clerk.js authentication, Polar.sh integration for payments, and a dashboard for logged-in users.

**Demo: [https://next-saas-start.vercel.app/](https://next-saas-start.vercel.app/)**

## Features

- Marketing landing page (`/`) with animated Terminal element
- Pricing page (`/pricing`) with Polar.sh checkout integration
- Dashboard pages with CRUD operations on users/teams
- Basic RBAC with Owner and Member roles
- Clerk.js authentication with secure user management
- Global middleware to protect logged-in routes
- Local middleware to protect Server Actions or validate Zod schemas
- Activity logging system for any user events

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Authentication**: [Clerk.js](https://clerk.com/)
- **Payments**: [Polar.sh](https://polar.sh/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## CI/CD Stack
- **Jenkins**: Creating a pipeline that handles all stages of testing and deployment
- **SonarQube**: Testing tool used to report on code quality
- **Docker**: For effective containerization
- **Selenium/Cucumber**: Testing tools for BDD of the application
- **Jest**: Testing for JS applications (unit tests)

And much more maybe added here later.

## Getting Started

```bash
git clone https://github.com/nextjs/saas-starter
cd saas-starter
pnpm install
```

## Running Locally

Use the included setup script to create your `.env` file:

```bash
pnpm db:setup
```

Run the database migrations and seed the database with a default user and team:

```bash
pnpm db:migrate
pnpm db:seed
```

This will create the following test user and team:

- User: `test@test.com`
- Clerk ID: `user_test123` (mock ID for seeding)

You can create new users through Clerk.js authentication via the `/sign-up` route.

Finally, run the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

## Going to Production

When you're ready to deploy your SaaS application to production, follow these steps:

### Deploy to Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com/) and deploy it.
3. Follow the Vercel deployment process, which will guide you through setting up your project.

### Add environment variables

In your Vercel project settings (or during deployment), add all the necessary environment variables. Make sure to update the values for the production environment, including:

1. `BASE_URL`: Set this to your production domain.
2. `POSTGRES_URL`: Set this to your production database URL.
3. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key from https://dashboard.clerk.com/
4. `CLERK_SECRET_KEY`: Your Clerk secret key from https://dashboard.clerk.com/
5. `POLAR_ACCESS_TOKEN`: Your Polar.sh access token from https://polar.sh/settings

## Other Templates

While this template is intentionally minimal and to be used as a learning resource, there are other paid versions in the community which are more full-featured:

- https://achromatic.dev
- https://shipfa.st
- https://makerkit.dev
- https://zerotoshipped.com
- https://turbostarter.dev
