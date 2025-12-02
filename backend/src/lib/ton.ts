import { TonClient, Address, fromNano, TupleBuilder } from '@ton/ton';

// Initialize TON client
const endpoint = process.env.TON_ENDPOINT || 'https://testnet.toncenter.com/api/v2/jsonRPC';
export const tonClient = new TonClient({ endpoint });

// Simple cache for rate limiting
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: {
  poolState?: CacheEntry<{ balance: string; totalShares: string; sharePrice: string }>;
  userShares: Map<string, CacheEntry<string>>;
} = {
  userShares: new Map()
};

const CACHE_TTL = 10000; // 10 seconds cache

// Sleep helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry helper for rate-limited requests
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 2000): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.response?.status === 429 || 
                          error?.message?.includes('429') ||
                          error?.code === 'ERR_BAD_REQUEST';
      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited, waiting ${delay/1000}s... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Pool contract address
export const getPoolAddress = (): Address | null => {
  const addr = process.env.POOL_CONTRACT_ADDRESS;
  if (!addr) return null;
  try {
    return Address.parse(addr);
  } catch {
    return null;
  }
};

// Get pool balance
export const getPoolBalance = async (): Promise<bigint> => {
  const poolAddress = getPoolAddress();
  if (!poolAddress) return 0n;

  try {
    const balance = await withRetry(() => tonClient.getBalance(poolAddress));
    return balance;
  } catch (error) {
    console.error('Error getting pool balance:', error);
    return 0n;
  }
};

// Get pool state (call getter methods)
export const getPoolState = async () => {
  const poolAddress = getPoolAddress();
  if (!poolAddress) {
    return {
      balance: '0',
      totalShares: '0',
      sharePrice: '0'
    };
  }

  // Check cache
  if (cache.poolState && Date.now() - cache.poolState.timestamp < CACHE_TTL) {
    return cache.poolState.data;
  }

  try {
    // Call getters sequentially to avoid rate limits
    const balanceResult = await withRetry(() => tonClient.runMethod(poolAddress, 'poolBalance'));
    await sleep(500); // Small delay between calls
    
    const sharesResult = await withRetry(() => tonClient.runMethod(poolAddress, 'totalPoolShares'));
    await sleep(500);
    
    const priceResult = await withRetry(() => tonClient.runMethod(poolAddress, 'sharePrice'));

    const result = {
      balance: balanceResult.stack.readBigNumber().toString(),
      totalShares: sharesResult.stack.readBigNumber().toString(),
      sharePrice: priceResult.stack.readBigNumber().toString()
    };

    // Update cache
    cache.poolState = { data: result, timestamp: Date.now() };

    return result;
  } catch (error) {
    console.error('Error getting pool state:', error);
    // Return cached data if available
    if (cache.poolState) {
      return cache.poolState.data;
    }
    return {
      balance: '0',
      totalShares: '0',
      sharePrice: '0'
    };
  }
};

// Get user shares
export const getUserShares = async (userAddress: string): Promise<string> => {
  const poolAddress = getPoolAddress();
  if (!poolAddress) return '0';

  // Check cache
  const cached = cache.userShares.get(userAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const address = Address.parse(userAddress);
    
    // Build tuple with address using TupleBuilder
    const builder = new TupleBuilder();
    builder.writeAddress(address);
    
    const result = await withRetry(() => 
      tonClient.runMethod(poolAddress, 'userShares', builder.build())
    );
    const shares = result.stack.readBigNumber().toString();
    
    // Update cache
    cache.userShares.set(userAddress, { data: shares, timestamp: Date.now() });
    
    return shares;
  } catch (error) {
    console.error('Error getting user shares:', error);
    // Return cached data if available
    if (cached) {
      return cached.data;
    }
    return '0';
  }
};

// Format TON value
export const formatTon = (nanoTon: string | bigint): string => {
  return fromNano(BigInt(nanoTon));
};
