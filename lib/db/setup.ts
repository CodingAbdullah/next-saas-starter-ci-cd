import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { promisify } from 'node:util';
import readline from 'node:readline';
import crypto from 'node:crypto';
import path from 'node:path';

const execAsync = promisify(exec);

function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function getPostgresURL(): Promise<string> {
  console.log('Step 1: Setting up Postgres');
  const dbChoice = await question(
    'Do you want to use a local Postgres instance with Docker (L) or a remote Postgres instance (R)? (L/R): '
  );

  if (dbChoice.toLowerCase() === 'l') {
    console.log('Setting up local Postgres instance with Docker...');
    await setupLocalPostgres();
    return 'postgres://postgres:postgres@localhost:54322/postgres';
  } else {
    console.log(
      'You can find Postgres databases at: https://vercel.com/marketplace?category=databases'
    );
    return await question('Enter your POSTGRES_URL: ');
  }
}

async function setupLocalPostgres() {
  console.log('Checking if Docker is installed...');
  try {
    await execAsync('docker --version');
    console.log('Docker is installed.');
  } catch (error) {
    console.error(
      'Docker is not installed. Please install Docker and try again.'
    );
    console.log(
      'To install Docker, visit: https://docs.docker.com/get-docker/'
    );
    process.exit(1);
  }

  console.log('Creating docker-compose.yml file...');
  const dockerComposeContent = `
services:
  postgres:
    image: postgres:16.4-alpine
    container_name: next_saas_starter_postgres
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "54322:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;

  await fs.writeFile(
    path.join(process.cwd(), 'docker-compose.yml'),
    dockerComposeContent
  );
  console.log('docker-compose.yml file created.');

  console.log('Starting Docker container with `docker compose up -d`...');
  try {
    await execAsync('docker compose up -d');
    console.log('Docker container started successfully.');
  } catch (error) {
    console.error(
      'Failed to start Docker container. Please check your Docker installation and try again.'
    );
    process.exit(1);
  }
}

function generateAuthSecret(): string {
  console.log('Step 2: Generating AUTH_SECRET...');
  return crypto.randomBytes(32).toString('hex');
}

async function getClerkKeys(): Promise<{ publishableKey: string; secretKey: string }> {
  console.log('Step 3: Clerk.js Configuration');
  console.log('You can find your keys at: https://dashboard.clerk.com/');
  const publishableKey = await question('Enter your Clerk Publishable Key (pk_test_...): ');
  const secretKey = await question('Enter your Clerk Secret Key (sk_test_...): ');
  return { publishableKey, secretKey };
}

async function getPolarAccessToken(): Promise<string> {
  console.log('Step 4: Polar.sh Access Token');
  console.log('You can find your access token at: https://polar.sh/settings');
  return await question('Enter your Polar.sh Access Token (optional, leave blank to skip): ');
}

async function writeEnvFile(envVars: Record<string, string>) {
  console.log('Step 5: Writing environment variables to .env');
  const envContent = Object.entries(envVars)
    .filter(([_, value]) => value !== '') // Filter out empty values
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  await fs.writeFile(path.join(process.cwd(), '.env'), envContent);
  console.log('.env file created with the necessary variables.');
}

async function main() {
  console.log('🚀 Next.js SaaS Starter Setup\n');

  const POSTGRES_URL = await getPostgresURL();
  const AUTH_SECRET = generateAuthSecret();
  const clerkKeys = await getClerkKeys();
  const POLAR_ACCESS_TOKEN = await getPolarAccessToken();
  const BASE_URL = 'http://localhost:3000';

  const envVars: Record<string, string> = {
    POSTGRES_URL,
    BASE_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkKeys.publishableKey,
    CLERK_SECRET_KEY: clerkKeys.secretKey,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: '/dashboard',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: '/dashboard',
  };

  if (POLAR_ACCESS_TOKEN.trim()) {
    envVars.POLAR_ACCESS_TOKEN = POLAR_ACCESS_TOKEN;
  }

  await writeEnvFile(envVars);

  console.log('\n🎉 Setup completed successfully!');
  console.log('Next steps:');
  console.log('1. Run `npm run db:migrate` to set up your database');
  console.log('2. Run `npm run db:seed` to add sample data');
  console.log('3. Set up Clerk webhook endpoint (optional)');
  if (!POLAR_ACCESS_TOKEN.trim()) {
    console.log('4. Add your Polar.sh access token to .env when ready');
    console.log('5. Run `npm run dev` to start your development server');
  } else {
    console.log('4. Run `npm run dev` to start your development server');
  }
}

main().catch(console.error);