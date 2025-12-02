import { TonClient, Address, fromNano, TupleBuilder } from '@ton/ton';

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================

export type Network = 'testnet' | 'mainnet';

// Get current network from environment
export const getNetwork = (): Network => {
  const network = process.env.TON_NETWORK || 'testnet';
  return network === 'mainnet' ? 'mainnet' : 'testnet';
};

// Network endpoints
const ENDPOINTS = {
  testnet: 'https://testnet.toncenter.com/api/v2/jsonRPC',
  mainnet: 'https://toncenter.com/api/v2/jsonRPC'
};

// Initialize TON client based on network
const network = getNetwork();
const endpoint = process.env.TON_ENDPOINT || ENDPOINTS[network];
const apiKey = process.env.TONCENTER_API_KEY;

export const tonClient = new TonClient({ 
  endpoint,
  apiKey: apiKey || undefined
});

console.log(`🌐 TON Client initialized for ${network.toUpperCase()}`);
console.log(`   Endpoint: ${endpoint}`);

// ============================================================================
// CACHING
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface PoolStateData {
  balance: string;
  totalShares: string;
  sharePrice: string;
  stakedToNominator?: string;
  pendingRewards?: string;
  withdrawQueue?: string;
  isMainnet?: boolean;
}

const cache: {
  poolState?: CacheEntry<PoolStateData>;
  userShares: Map<string, CacheEntry<string>>;
  userValue: Map<string, CacheEntry<string>>;
  userProfit: Map<string, CacheEntry<string>>;
} = {
  userShares: new Map(),
  userValue: new Map(),
  userProfit: new Map()
};

const CACHE_TTL = 10000; // 10 seconds cache

// ============================================================================
// HELPERS
// ============================================================================

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

// ============================================================================
// CONTRACT ADDRESSES
// ============================================================================

// Pool contract address (supports both testnet and mainnet)
export const getPoolAddress = (): Address | null => {
  const network = getNetwork();
  
  // Use network-specific address if available
  const addr = network === 'mainnet' 
    ? (process.env.MAINNET_POOL_CONTRACT_ADDRESS || process.env.POOL_CONTRACT_ADDRESS)
    : (process.env.TESTNET_POOL_CONTRACT_ADDRESS || process.env.POOL_CONTRACT_ADDRESS);
    
  if (!addr) return null;
  try {
    return Address.parse(addr);
  } catch {
    return null;
  }
};

// Get Nominator Pool address (mainnet only)
export const getNominatorPoolAddress = (): Address | null => {
  if (getNetwork() !== 'mainnet') return null;
  
  const addr = process.env.NOMINATOR_POOL_ADDRESS;
  if (!addr) return null;
  try {
    return Address.parse(addr);
  } catch {
    return null;
  }
};

// Check if we're on mainnet
export const isMainnet = (): boolean => {
  return getNetwork() === 'mainnet';
};

// ============================================================================
// POOL DATA FUNCTIONS
// ============================================================================

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

// Get pool state (supports both testnet and mainnet contracts)
export const getPoolState = async (): Promise<PoolStateData> => {
  const poolAddress = getPoolAddress();
  const mainnet = isMainnet();
  
  if (!poolAddress) {
    return {
      balance: '0',
      totalShares: '0',
      sharePrice: '0',
      isMainnet: mainnet
    };
  }

  // Check cache
  if (cache.poolState && Date.now() - cache.poolState.timestamp < CACHE_TTL) {
    return cache.poolState.data;
  }

  try {
    if (mainnet) {
      // Mainnet contract uses poolState() getter
      const stateResult = await withRetry(() => tonClient.runMethod(poolAddress, 'poolState'));
      
      // Parse the map returned by poolState
      // Keys: 0=totalDeposits, 1=totalShares, 2=stakedToNominator, 3=pendingRewards, 4=withdrawQueue
      const stateMap = stateResult.stack.readCell();
      
      // For now, use simpler getters
      await sleep(500);
      const balance = await getPoolBalance();
      
      const result: PoolStateData = {
        balance: balance.toString(),
        totalShares: '0', // Will be updated from contract
        sharePrice: '1000000000', // 1 TON = 1 share initially
        stakedToNominator: '0',
        pendingRewards: '0',
        withdrawQueue: '0',
        isMainnet: true
      };
      
      // Try to get additional data
      try {
        await sleep(500);
        const nominatorStake = await withRetry(() => 
          tonClient.runMethod(poolAddress, 'availableForStaking')
        );
        result.stakedToNominator = nominatorStake.stack.readBigNumber().toString();
      } catch {}
      
      cache.poolState = { data: result, timestamp: Date.now() };
      return result;
      
    } else {
      // Testnet contract uses individual getters
      const balanceResult = await withRetry(() => tonClient.runMethod(poolAddress, 'poolBalance'));
      await sleep(500);
      
      const sharesResult = await withRetry(() => tonClient.runMethod(poolAddress, 'totalPoolShares'));
      await sleep(500);
      
      const priceResult = await withRetry(() => tonClient.runMethod(poolAddress, 'sharePrice'));

      const result: PoolStateData = {
        balance: balanceResult.stack.readBigNumber().toString(),
        totalShares: sharesResult.stack.readBigNumber().toString(),
        sharePrice: priceResult.stack.readBigNumber().toString(),
        isMainnet: false
      };

      cache.poolState = { data: result, timestamp: Date.now() };
      return result;
    }
  } catch (error) {
    console.error('Error getting pool state:', error);
    if (cache.poolState) {
      return cache.poolState.data;
    }
    return {
      balance: '0',
      totalShares: '0',
      sharePrice: '0',
      isMainnet: mainnet
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
    
    const builder = new TupleBuilder();
    builder.writeAddress(address);
    
    const result = await withRetry(() => 
      tonClient.runMethod(poolAddress, 'userShares', builder.build())
    );
    const shares = result.stack.readBigNumber().toString();
    
    cache.userShares.set(userAddress, { data: shares, timestamp: Date.now() });
    
    return shares;
  } catch (error) {
    console.error('Error getting user shares:', error);
    if (cached) {
      return cached.data;
    }
    return '0';
  }
};

// Get user value in TON (mainnet only)
export const getUserValue = async (userAddress: string): Promise<string> => {
  const poolAddress = getPoolAddress();
  if (!poolAddress || !isMainnet()) return '0';

  const cached = cache.userValue.get(userAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const address = Address.parse(userAddress);
    
    const builder = new TupleBuilder();
    builder.writeAddress(address);
    
    const result = await withRetry(() => 
      tonClient.runMethod(poolAddress, 'userValue', builder.build())
    );
    const value = result.stack.readBigNumber().toString();
    
    cache.userValue.set(userAddress, { data: value, timestamp: Date.now() });
    
    return value;
  } catch (error) {
    console.error('Error getting user value:', error);
    return cached?.data || '0';
  }
};

// Get user profit in TON (mainnet only)
export const getUserProfit = async (userAddress: string): Promise<string> => {
  const poolAddress = getPoolAddress();
  if (!poolAddress || !isMainnet()) return '0';

  const cached = cache.userProfit.get(userAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const address = Address.parse(userAddress);
    
    const builder = new TupleBuilder();
    builder.writeAddress(address);
    
    const result = await withRetry(() => 
      tonClient.runMethod(poolAddress, 'userProfit', builder.build())
    );
    const profit = result.stack.readBigNumber().toString();
    
    cache.userProfit.set(userAddress, { data: profit, timestamp: Date.now() });
    
    return profit;
  } catch (error) {
    console.error('Error getting user profit:', error);
    return cached?.data || '0';
  }
};

// Check if pool is ready for nominator staking (mainnet only)
export const isReadyForNominatorStake = async (): Promise<boolean> => {
  const poolAddress = getPoolAddress();
  if (!poolAddress || !isMainnet()) return false;

  try {
    const result = await withRetry(() => 
      tonClient.runMethod(poolAddress, 'isReadyForNominatorStake')
    );
    return result.stack.readBoolean();
  } catch {
    return false;
  }
};

// Get estimated APY (mainnet only)
export const getEstimatedAPY = async (): Promise<number> => {
  if (!isMainnet()) return 0;
  
  const poolAddress = getPoolAddress();
  if (!poolAddress) return 0;

  try {
    const result = await withRetry(() => 
      tonClient.runMethod(poolAddress, 'estimatedAPY')
    );
    return Number(result.stack.readBigNumber()) / 100; // Convert basis points to percentage
  } catch {
    return 3.5; // Default 3.5% APY
  }
};

// Format TON value
export const formatTon = (nanoTon: string | bigint): string => {
  return fromNano(BigInt(nanoTon));
};
