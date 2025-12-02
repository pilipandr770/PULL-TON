import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { 
  getPoolState, 
  getUserShares, 
  getUserValue,
  getUserProfit,
  formatTon, 
  getPoolAddress,
  getNetwork,
  isMainnet,
  getEstimatedAPY,
  isReadyForNominatorStake
} from '../lib/ton';

const router = Router();

// Get pool info (public)
router.get('/info', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get live data from chain
    const poolAddress = getPoolAddress();
    const network = getNetwork();
    const mainnet = isMainnet();
    let poolData;

    if (poolAddress) {
      poolData = await getPoolState();
    }

    // Get cached stats
    const cachedStats = await prisma.poolStats.findUnique({
      where: { id: 'singleton' }
    });

    // Use live data if available, otherwise cached
    const balance = poolData?.balance || cachedStats?.totalBalance || '0';
    const totalShares = poolData?.totalShares || cachedStats?.totalShares || '0';
    const sharePrice = poolData?.sharePrice || cachedStats?.sharePrice || '0';

    // Mainnet-specific data
    let mainnetData = {};
    if (mainnet) {
      const apy = await getEstimatedAPY();
      const readyForStake = await isReadyForNominatorStake();
      
      mainnetData = {
        stakedToNominator: poolData?.stakedToNominator || '0',
        stakedToNominatorTon: formatTon(poolData?.stakedToNominator || '0'),
        pendingRewards: poolData?.pendingRewards || '0',
        pendingRewardsTon: formatTon(poolData?.pendingRewards || '0'),
        withdrawQueue: poolData?.withdrawQueue || '0',
        withdrawQueueTon: formatTon(poolData?.withdrawQueue || '0'),
        estimatedAPY: apy,
        isReadyForNominatorStake: readyForStake,
        minNominatorStake: '10001000000000', // 10,001 TON
        minNominatorStakeTon: '10001'
      };
    }

    res.json({
      success: true,
      pool: {
        address: poolAddress?.toString() || null,
        balance: balance,
        balanceTon: formatTon(balance),
        totalShares: totalShares,
        sharePrice: sharePrice,
        sharePriceTon: formatTon(sharePrice),
        totalUsers: cachedStats?.totalUsers || 0,
        minDeposit: '1000000000', // 1 TON
        minDepositTon: '1',
        network: network,
        isMainnet: mainnet,
        ...mainnetData
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user's pool position (requires wallet address in query)
router.get('/position/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const mainnet = isMainnet();

    const shares = await getUserShares(address);
    const poolState = await getPoolState();

    // For mainnet, use contract getters for accurate values
    let estimatedValue = '0';
    let profit = '0';
    let profitPercent = 0;

    if (mainnet) {
      // Use mainnet contract's getters
      estimatedValue = await getUserValue(address);
      profit = await getUserProfit(address);
      
      const initialValue = BigInt(estimatedValue) - BigInt(profit);
      profitPercent = initialValue > 0n 
        ? Number(BigInt(profit) * 10000n / initialValue) / 100 
        : 0;
    } else {
      // Testnet calculation
      if (BigInt(poolState.totalShares) > 0n) {
        estimatedValue = (
          (BigInt(poolState.balance) * BigInt(shares)) / BigInt(poolState.totalShares)
        ).toString();
      }

      const sharesAmount = BigInt(shares);
      const initialValue = sharesAmount;
      const currentValue = BigInt(estimatedValue);
      const profitBigInt = currentValue - initialValue;
      profit = profitBigInt > 0n ? profitBigInt.toString() : '0';
      profitPercent = initialValue > 0n 
        ? Number(profitBigInt * 10000n / initialValue) / 100 
        : 0;
    }

    // Calculate percentage of pool
    let percentage = 0;
    if (BigInt(poolState.totalShares) > 0n) {
      percentage = Number(BigInt(shares) * 10000n / BigInt(poolState.totalShares)) / 100;
    }

    res.json({
      success: true,
      position: {
        shares: shares,
        estimatedValue: estimatedValue,
        estimatedValueTon: formatTon(estimatedValue),
        poolPercentage: percentage.toFixed(4),
        profit: profit,
        profitTon: formatTon(profit),
        profitPercent: profitPercent.toFixed(2),
        network: getNetwork(),
        isMainnet: mainnet
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get deposit instructions
router.get('/deposit-info', (req: Request, res: Response) => {
  const poolAddress = getPoolAddress();

  res.json({
    success: true,
    deposit: {
      address: poolAddress?.toString() || 'Contract not deployed',
      comment: 'deposit',
      minAmount: '1000000000',
      minAmountTon: '1',
      instructions: [
        '1. Open your TON wallet (Tonkeeper, TON Wallet, etc.)',
        '2. Send TON to the pool address',
        '3. Add "deposit" as the comment/memo',
        '4. Minimum deposit: 1 TON',
        '5. You will receive shares proportional to your deposit'
      ]
    }
  });
});

// Get withdraw instructions
router.get('/withdraw-info', (req: Request, res: Response) => {
  res.json({
    success: true,
    withdraw: {
      instructions: [
        '1. Determine how many shares you want to withdraw',
        '2. Send a Withdraw message to the pool contract',
        '3. You will receive TON proportional to your shares',
        '4. Transaction requires ~0.05 TON for gas'
      ],
      note: 'Withdrawals can be done through the dashboard or directly via wallet'
    }
  });
});

export default router;
