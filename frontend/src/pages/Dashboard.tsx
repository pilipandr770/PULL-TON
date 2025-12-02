import { useQuery } from '@tanstack/react-query';
import { Navigate, Link } from 'react-router-dom';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { useAuthStore } from '../store/auth';
import { userApi, poolApi, subscriptionApi } from '../lib/api';
import { 
  Coins, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Copy, 
  ExternalLink,
  Lock,
  Wallet,
  PieChart,
  RefreshCw,
  Plus,
  Minus,
  Loader2
} from 'lucide-react';
import { useState } from 'react';

export default function Dashboard() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const { isAuthenticated, user } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [depositAmount, setDepositAmount] = useState('1');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Check subscription status
  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionApi.getStatus().then((r) => r.data),
    enabled: isAuthenticated,
  });

  // Get pool info (public)
  const { data: poolInfo, refetch: refetchPool } = useQuery({
    queryKey: ['poolInfo'],
    queryFn: () => poolApi.getInfo().then((r) => r.data.pool),
    refetchInterval: 30000,
  });

  // Get user position (public)
  const { data: position, refetch: refetchPosition } = useQuery({
    queryKey: ['position', wallet?.account.address],
    queryFn: () => 
      poolApi.getPosition(wallet!.account.address).then((r) => r.data.position),
    enabled: !!wallet,
    refetchInterval: 30000,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchPool(), refetchPosition()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Handle deposit via TON Connect
  const handleDeposit = async () => {
    if (!depositInfo?.address || !wallet) return;
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < 1) {
      setDepositError('Minimum deposit is 1 TON');
      return;
    }

    setIsDepositing(true);
    setDepositError(null);
    setDepositSuccess(false);

    try {
      // Convert TON to nanoTON (1 TON = 10^9 nanoTON)
      const nanoTon = BigInt(Math.floor(amount * 1e9)).toString();
      
      // Send transaction via TON Connect
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: depositInfo.address,
            amount: nanoTon,
            // payload: comment "deposit" in base64 (optional, contract accepts any transfer now)
          }
        ]
      });

      setDepositSuccess(true);
      setDepositAmount('1');
      
      // Refresh data after a delay to allow blockchain confirmation
      setTimeout(() => {
        refetchPool();
        refetchPosition();
      }, 5000);
      
    } catch (error: any) {
      console.error('Deposit error:', error);
      setDepositError(error.message || 'Transaction failed');
    } finally {
      setIsDepositing(false);
    }
  };

  // Get dashboard data (requires subscription)
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => userApi.getDashboard().then((r) => r.data.dashboard),
    enabled: isAuthenticated && subscriptionData?.hasAccess,
  });

  // Get deposit info
  const { data: depositInfo } = useQuery({
    queryKey: ['depositInfo'],
    queryFn: () => poolApi.getDepositInfo().then((r) => r.data.deposit),
  });

  if (!wallet) {
    return <Navigate to="/" replace />;
  }

  const hasSubscription = subscriptionData?.hasAccess;

  const copyAddress = () => {
    if (depositInfo?.address) {
      navigator.clipboard.writeText(depositInfo.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors text-white"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* My Position - Main Card */}
      <div className="glass rounded-xl p-6 mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <Wallet className="w-6 h-6 text-ton-400" />
          <h2 className="text-xl font-semibold text-white">My Position</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Current Value */}
          <div className="bg-gradient-to-br from-ton-500/20 to-ton-600/10 rounded-xl p-5 border border-ton-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 text-sm">Current Value</span>
              <TrendingUp className="w-5 h-5 text-ton-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {position?.estimatedValueTon || '0'} <span className="text-lg text-slate-400">TON</span>
            </div>
            <div className="text-sm text-slate-400 mt-2">
              Based on current share price
            </div>
          </div>

          {/* My Shares */}
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 text-sm">My Shares</span>
              <Coins className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {position?.shares ? Number(BigInt(position.shares) / 1000000000n).toLocaleString() : '0'}
            </div>
            <div className="text-sm text-slate-400 mt-2">
              {position?.poolPercentage || '0'}% of total pool
            </div>
          </div>

          {/* Pool Share */}
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 text-sm">Pool Share</span>
              <PieChart className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {position?.poolPercentage || '0'}%
            </div>
            <div className="text-sm text-slate-400 mt-2">
              Your ownership stake
            </div>
          </div>

          {/* Estimated Profit */}
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-5 border border-green-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 text-sm">Estimated Profit</span>
              <ArrowUpRight className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400">
              {position?.profitTon || '0'} <span className="text-lg text-slate-400">TON</span>
            </div>
            <div className="text-sm text-slate-400 mt-2">
              {position?.profitPercent || '0'}% return
            </div>
          </div>
        </div>
      </div>

      {/* Pool Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400">Pool Total Balance</span>
            <Coins className="w-5 h-5 text-ton-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {poolInfo?.balanceTon || '0'} TON
          </div>
          <div className="text-sm text-slate-400 mt-1">
            All stakers combined
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400">Share Price</span>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {poolInfo?.sharePriceTon || '1'} TON
          </div>
          <div className="text-sm text-slate-400 mt-1">
            Price increases with rewards
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400">Network</span>
            <ExternalLink className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white capitalize">
            {poolInfo?.network || 'testnet'}
          </div>
          <div className="text-sm text-slate-400 mt-1">
            <a 
              href={`https://${poolInfo?.network === 'mainnet' ? '' : 'testnet.'}tonviewer.com/${poolInfo?.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ton-400 hover:underline"
            >
              View on Explorer →
            </a>
          </div>
        </div>
      </div>

      {/* Deposit & Withdraw Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Deposit Card */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Plus className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Deposit TON</h2>
          </div>
          
          <div className="space-y-4">
            {/* Amount Input */}
            <div>
              <label className="block text-slate-400 text-sm mb-2">Amount (TON)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-lg focus:border-ton-400 focus:outline-none"
                  placeholder="1.0"
                />
                <span className="text-slate-400 text-lg">TON</span>
              </div>
              <p className="text-slate-500 text-xs mt-1">Minimum: 1 TON</p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex gap-2">
              {[1, 5, 10, 50].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setDepositAmount(amount.toString())}
                  className={`flex-1 py-2 rounded-lg border transition-colors ${
                    depositAmount === amount.toString()
                      ? 'bg-ton-500 border-ton-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {amount} TON
                </button>
              ))}
            </div>

            {/* Deposit Button */}
            <button
              onClick={handleDeposit}
              disabled={isDepositing || !depositInfo?.address}
              className="w-full gradient-bg py-4 rounded-lg text-white font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isDepositing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  <span>Deposit {depositAmount} TON</span>
                </>
              )}
            </button>

            {/* Status Messages */}
            {depositError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {depositError}
              </div>
            )}
            {depositSuccess && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm">
                ✅ Transaction sent! Your shares will appear after blockchain confirmation (~15 seconds).
              </div>
            )}

            {/* Pool Address (collapsible) */}
            <details className="bg-slate-800/50 rounded-lg">
              <summary className="p-3 text-slate-400 text-sm cursor-pointer hover:text-white">
                Manual deposit instructions
              </summary>
              <div className="p-3 pt-0 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={depositInfo?.address || 'Loading...'}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                  />
                  <button
                    onClick={copyAddress}
                    className="p-1 hover:bg-slate-700 rounded"
                  >
                    <Copy className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                {copied && <span className="text-green-400 text-xs">Copied!</span>}
                <p className="text-slate-500 text-xs">
                  Send any amount ≥1 TON to this address. Shares are credited automatically.
                </p>
              </div>
            </details>
          </div>
        </div>

        {/* Withdraw Card */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Minus className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Withdraw</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Your Shares</label>
              <input
                type="text"
                readOnly
                value={position?.shares ? Number(BigInt(position.shares) / 1000000000n).toLocaleString() : '0'}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-lg"
              />
              <p className="text-slate-500 text-xs mt-1">
                Value: ~{position?.estimatedValueTon || '0'} TON
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">How to Withdraw:</h4>
              <ol className="text-slate-400 text-sm space-y-1 list-decimal list-inside">
                <li>Withdrawals require sending a special message</li>
                <li>Use Tonkeeper with "Custom Payload"</li>
                <li>Or use our CLI scripts</li>
              </ol>
            </div>

            <button
              disabled
              className="w-full bg-slate-700 py-4 rounded-lg text-slate-400 font-semibold text-lg cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>Withdraw (Coming Soon)</span>
            </button>
            
            <a
              href={`https://${poolInfo?.network === 'mainnet' ? '' : 'testnet.'}tonviewer.com/${poolInfo?.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full bg-slate-800 border border-slate-700 rounded-lg py-3 text-white hover:bg-slate-700 transition-colors"
            >
              <span>View Contract</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Premium Section */}
      {!hasSubscription ? (
        <div className="glass rounded-xl p-8 text-center">
          <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Unlock Premium Dashboard
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Get access to transaction history, detailed analytics, profit tracking, 
            and more with a €5/month subscription.
          </p>
          <Link
            to="/subscription"
            className="inline-block gradient-bg px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Subscribe for €5/month
          </Link>
        </div>
      ) : (
        <>
          {/* Stats (Premium) */}
          {dashboard && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="glass rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <ArrowUpRight className="w-5 h-5 text-green-400" />
                  <span className="text-slate-400">Total Deposited</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {dashboard.stats.totalDepositedTon} TON
                </div>
              </div>
              <div className="glass rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <ArrowDownRight className="w-5 h-5 text-red-400" />
                  <span className="text-slate-400">Total Withdrawn</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {dashboard.stats.totalWithdrawnTon} TON
                </div>
              </div>
              <div className="glass rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-ton-400" />
                  <span className="text-slate-400">Estimated Profit</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {(Number(dashboard.stats.estimatedProfit) / 1e9).toFixed(4)} TON
                </div>
              </div>
            </div>
          )}

          {/* Recent Transactions (Premium) */}
          {dashboard?.recentTransactions && (
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
              {dashboard.recentTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-slate-400 text-sm">
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="text-white">
                      {dashboard.recentTransactions.map((tx: any) => (
                        <tr key={tx.id} className="border-t border-slate-700">
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                                tx.type === 'DEPOSIT'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3">{tx.amountTon} TON</td>
                          <td className="py-3">
                            <span
                              className={`${
                                tx.status === 'CONFIRMED'
                                  ? 'text-green-400'
                                  : tx.status === 'PENDING'
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No transactions yet</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
