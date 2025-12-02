import { useQuery } from '@tanstack/react-query';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Link } from 'react-router-dom';
import { poolApi } from '../lib/api';
import { Coins, Users, TrendingUp, Shield, Zap, Gift } from 'lucide-react';

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const { data: poolInfo, isLoading } = useQuery({
    queryKey: ['poolInfo'],
    queryFn: () => poolApi.getInfo().then((r) => r.data.pool),
    refetchInterval: 30000,
  });

  const handleConnect = () => {
    tonConnectUI.openModal();
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ton-900/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Community TON Pool
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-4">
              Zero Fee Staking Pool
            </p>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of users in the first truly decentralized TON staking pool
              with <span className="text-ton-400 font-semibold">0% fees</span>. 
              Start staking from just 1 TON.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {wallet ? (
                <Link
                  to="/dashboard"
                  className="gradient-bg px-8 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <button
                  onClick={handleConnect}
                  className="gradient-bg px-8 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Connect Wallet to Start
                </button>
              )}
              <a
                href="#how-it-works"
                className="px-8 py-3 rounded-lg border border-slate-700 text-white font-semibold hover:bg-slate-800 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {isLoading ? '...' : `${poolInfo?.balanceTon || '0'} TON`}
              </div>
              <div className="text-slate-400">Pool Balance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {isLoading ? '...' : poolInfo?.totalUsers || '0'}
              </div>
              <div className="text-slate-400">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-ton-400 mb-2">0%</div>
              <div className="text-slate-400">Pool Fee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">1 TON</div>
              <div className="text-slate-400">Min Deposit</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose Our Pool?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Zero Fees</h3>
              <p className="text-slate-400">
                No fees on deposits, no fees on withdrawals, no fees on rewards. 
                100% of your earnings belong to you.
              </p>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Fully Secure</h3>
              <p className="text-slate-400">
                Immutable smart contract with no owner functions. 
                Your funds are controlled only by your wallet.
              </p>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Low Minimum</h3>
              <p className="text-slate-400">
                Start staking with just 1 TON. No high barriers to entry, 
                perfect for both small and large investors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 text-white font-bold">
                1
              </div>
              <h3 className="font-semibold text-white mb-2">Connect Wallet</h3>
              <p className="text-slate-400 text-sm">
                Use Tonkeeper, TON Wallet, or any TON Connect compatible wallet
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 text-white font-bold">
                2
              </div>
              <h3 className="font-semibold text-white mb-2">Deposit TON</h3>
              <p className="text-slate-400 text-sm">
                Send TON to the pool with "deposit" comment. Min 1 TON.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 text-white font-bold">
                3
              </div>
              <h3 className="font-semibold text-white mb-2">Earn Rewards</h3>
              <p className="text-slate-400 text-sm">
                Pool rewards are distributed proportionally to all stakers
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 text-white font-bold">
                4
              </div>
              <h3 className="font-semibold text-white mb-2">Withdraw Anytime</h3>
              <p className="text-slate-400 text-sm">
                Withdraw your shares and rewards whenever you want
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Premium Dashboard
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            While basic deposits and withdrawals are always free, 
            get full access to analytics and premium features with our dashboard subscription.
          </p>
          <div className="max-w-md mx-auto">
            <div className="glass rounded-xl p-8 text-center">
              <div className="text-5xl font-bold text-white mb-2">€5</div>
              <div className="text-slate-400 mb-6">/month</div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-ton-500 mr-3 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Full dashboard access
                </li>
                <li className="flex items-center text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-ton-500 mr-3 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Transaction history
                </li>
                <li className="flex items-center text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-ton-500 mr-3 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Real-time analytics
                </li>
                <li className="flex items-center text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-ton-500 mr-3 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Email notifications
                </li>
                <li className="flex items-center text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-ton-500 mr-3 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Priority support
                </li>
              </ul>
              {wallet ? (
                <Link
                  to="/subscription"
                  className="block w-full gradient-bg py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Subscribe Now
                </Link>
              ) : (
                <button
                  onClick={handleConnect}
                  className="w-full gradient-bg py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Connect Wallet First
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
