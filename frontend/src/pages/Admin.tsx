import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAdminStore } from '../store/auth';
import { authApi, adminApiFunc } from '../lib/api';
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  LogOut, 
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Admin Login
function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setAdmin } = useAdminStore();

  const loginMutation = useMutation({
    mutationFn: () => authApi.adminLogin(email, password),
    onSuccess: (response) => {
      if (response.data.success) {
        setAdmin(response.data.token, response.data.admin);
      }
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'Login failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate();
  };

  return (
    <div className="min-h-[600px] flex items-center justify-center px-4">
      <div className="glass rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-8">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full gradient-bg py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loginMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// Admin Dashboard
function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminApiFunc.getStats().then((r) => r.data.stats),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-ton-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>
      
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="glass rounded-xl p-6">
          <div className="text-slate-400 text-sm mb-2">Total Users</div>
          <div className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</div>
        </div>
        <div className="glass rounded-xl p-6">
          <div className="text-slate-400 text-sm mb-2">Active Subscriptions</div>
          <div className="text-3xl font-bold text-green-400">{stats?.activeSubscriptions || 0}</div>
        </div>
        <div className="glass rounded-xl p-6">
          <div className="text-slate-400 text-sm mb-2">MRR</div>
          <div className="text-3xl font-bold text-ton-400">{stats?.mrr || '€0'}</div>
        </div>
        <div className="glass rounded-xl p-6">
          <div className="text-slate-400 text-sm mb-2">Pool Balance</div>
          <div className="text-3xl font-bold text-white">{stats?.pool?.balanceTon || '0'} TON</div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-400 text-sm">
                <th className="pb-3">Wallet</th>
                <th className="pb-3">Subscription</th>
                <th className="pb-3">Joined</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {stats?.recentUsers?.map((user: any) => (
                <tr key={user.id} className="border-t border-slate-700">
                  <td className="py-3 font-mono text-sm">
                    {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                        user.hasSubscription
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {user.hasSubscription ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Admin Users List
function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', page, search],
    queryFn: () => adminApiFunc.getUsers(page, search).then((r) => r.data),
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Users</h2>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by wallet address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white"
          />
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-ton-400 animate-spin" />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr className="text-left text-slate-400 text-sm">
                  <th className="px-6 py-3">Wallet Address</th>
                  <th className="px-6 py-3">Shares</th>
                  <th className="px-6 py-3">Subscription</th>
                  <th className="px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {data?.users?.map((user: any) => (
                  <tr key={user.id} className="border-t border-slate-700 hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono text-sm">
                      {user.walletAddress.slice(0, 12)}...{user.walletAddress.slice(-8)}
                    </td>
                    <td className="px-6 py-4">
                      {user.cachedShares ? BigInt(user.cachedShares).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          user.subscription?.status === 'ACTIVE'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {user.subscription?.status || 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {data?.pagination && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                <div className="text-slate-400 text-sm">
                  Page {data.pagination.page} of {data.pagination.pages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                    disabled={page >= data.pagination.pages}
                    className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Admin Subscriptions
function AdminSubscriptions() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminSubscriptions', page, status],
    queryFn: () => adminApiFunc.getSubscriptions(status, page).then((r) => r.data),
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Subscriptions</h2>

      <div className="mb-6">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="CANCELED">Canceled</option>
          <option value="PAST_DUE">Past Due</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-ton-400 animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr className="text-left text-slate-400 text-sm">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Period Start</th>
                <th className="px-6 py-3">Period End</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {data?.subscriptions?.map((sub: any) => (
                <tr key={sub.id} className="border-t border-slate-700 hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-mono text-sm">
                    {sub.user.walletAddress.slice(0, 8)}...{sub.user.walletAddress.slice(-6)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                        sub.status === 'ACTIVE'
                          ? 'bg-green-500/20 text-green-400'
                          : sub.status === 'PAST_DUE'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {sub.currentPeriodStart
                      ? new Date(sub.currentPeriodStart).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {sub.currentPeriodEnd
                      ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Admin Layout
function AdminLayout() {
  const { isAdmin, admin, logoutAdmin } = useAdminStore();
  const location = useLocation();

  if (!isAdmin) {
    return <AdminLogin />;
  }

  const isActive = (path: string) => location.pathname === `/admin${path}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400">Logged in as {admin?.email}</p>
        </div>
        <button
          onClick={logoutAdmin}
          className="flex items-center space-x-2 text-slate-400 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <nav className="md:w-64 space-y-2">
          <Link
            to="/admin"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('') ? 'bg-ton-500/20 text-ton-400' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/users"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/users') ? 'bg-ton-500/20 text-ton-400' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </Link>
          <Link
            to="/admin/subscriptions"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/subscriptions')
                ? 'bg-ton-500/20 text-ton-400'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Subscriptions</span>
          </Link>
        </nav>

        {/* Content */}
        <div className="flex-1">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  return <AdminLayout />;
}
