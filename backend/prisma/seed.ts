import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@pool.ton';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = crypto.createHash('sha256').update(adminPassword).digest('hex');

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      role: 'SUPER_ADMIN'
    }
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // Create initial pool stats
  await prisma.poolStats.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      totalBalance: '0',
      totalShares: '0',
      sharePrice: '0',
      totalUsers: 0
    }
  });

  console.log('✅ Pool stats initialized');

  // Create test user (for development)
  if (process.env.NODE_ENV !== 'production') {
    const testUser = await prisma.user.upsert({
      where: { walletAddress: 'EQTest...TestAddress' },
      update: {},
      create: {
        walletAddress: 'EQTest...TestAddress'
      }
    });

    // Give test user an active subscription
    await prisma.subscription.upsert({
      where: { userId: testUser.id },
      update: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      create: {
        userId: testUser.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    console.log(`✅ Test user created with active subscription: ${testUser.walletAddress}`);
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
