import { prisma } from '../lib/prisma';
import { getPoolState, getUserShares } from '../lib/ton';

const SYNC_INTERVAL = 60000; // 1 minute

export const startPoolSync = () => {
  console.log('🔄 Starting pool sync service...');
  
  // Initial sync
  syncPool();
  
  // Periodic sync
  setInterval(syncPool, SYNC_INTERVAL);
};

const syncPool = async () => {
  try {
    const poolState = await getPoolState();
    
    // Update pool stats
    await prisma.poolStats.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        totalBalance: poolState.balance,
        totalShares: poolState.totalShares,
        sharePrice: poolState.sharePrice,
        totalUsers: await prisma.user.count()
      },
      update: {
        totalBalance: poolState.balance,
        totalShares: poolState.totalShares,
        sharePrice: poolState.sharePrice,
        totalUsers: await prisma.user.count()
      }
    });

    // Update user balances (for users with active subscriptions)
    const usersToSync = await prisma.user.findMany({
      where: {
        subscription: {
          status: 'ACTIVE'
        }
      },
      take: 100 // Batch to avoid rate limits
    });

    for (const user of usersToSync) {
      try {
        const shares = await getUserShares(user.walletAddress);
        
        let estimatedValue = '0';
        if (BigInt(poolState.totalShares) > 0n) {
          estimatedValue = (
            (BigInt(poolState.balance) * BigInt(shares)) / BigInt(poolState.totalShares)
          ).toString();
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            cachedShares: shares,
            cachedValue: estimatedValue,
            lastSyncAt: new Date()
          }
        });
      } catch (error) {
        console.error(`Error syncing user ${user.walletAddress}:`, error);
      }
    }

    console.log(`✅ Pool sync complete. Balance: ${poolState.balance}, Users synced: ${usersToSync.length}`);
  } catch (error) {
    console.error('❌ Pool sync error:', error);
  }
};
