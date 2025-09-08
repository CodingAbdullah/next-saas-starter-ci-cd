import { db } from './drizzle';
import { users, teams, teamMembers } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  const email = 'test@test.com';
  const clerkId = 'user_test123'; // Mock Clerk ID for seeding

  const [user] = await db
    .insert(users)
    .values([
      {
        clerkId: clerkId,
        email: email,
        name: 'Test User',
        role: "owner",
      },
    ])
    .returning();

  console.log('✅ Initial user created.');

  const [team] = await db
    .insert(teams)
    .values({
      name: 'Test Team',
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: 'owner',
  });

  console.log('✅ Test team and membership created.');
  console.log('\n🎉 Database seeded successfully!');
  console.log(`Test user created with:`);
  console.log(`Email: ${email}`);
  console.log(`Clerk ID: ${clerkId}`);
  console.log('Note: This is a mock user for seeding. Use Clerk authentication for real users.');
}

seed()
  .catch((error) => {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('\n🏁 Seed process finished. Exiting...');
    process.exit(0);
  });