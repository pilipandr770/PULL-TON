import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTonConnectUI, useTonWallet, useTonConnectModal } from '@tonconnect/ui-react';
import { useAuthStore } from '../store/auth';
import { authApi } from '../lib/api';
import { useEffect } from 'react';
import { Wallet, LayoutDashboard, CreditCard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const { state: modalState } = useTonConnectModal();
  const { isAuthenticated, user, setAuth, logout } = useAuthStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Log TON Connect state
  useEffect(() => {
    console.log('👛 Wallet state:', wallet);
    console.log('🔐 isAuthenticated:', isAuthenticated);
    console.log('📱 Modal state:', modalState);
  }, [wallet, isAuthenticated, modalState]);

  // Log TON Connect UI events
  useEffect(() => {
    console.log('🔧 TonConnectUI instance:', tonConnectUI);
    
    const unsubscribe = tonConnectUI.onStatusChange((walletInfo) => {
      console.log('📡 onStatusChange event:', walletInfo);
      if (walletInfo) {
        console.log('✅ Connected wallet address:', walletInfo.account?.address);
        console.log('✅ Connected wallet chain:', walletInfo.account?.chain);
        console.log('✅ Connected wallet publicKey:', walletInfo.account?.publicKey);
      }
    });

    tonConnectUI.onModalStateChange((state) => {
      console.log('🪟 Modal state change:', state);
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI]);

  // Auto-authenticate when wallet connects
  useEffect(() => {
    const authenticate = async () => {
      if (wallet && !isAuthenticated) {
        try {
          const address = wallet.account.address;
          console.log('🔑 Attempting auth with address:', address);
          const response = await authApi.verify(address);
          console.log('🔑 Auth response:', response.data);
          if (response.data.success) {
            setAuth(response.data.token, response.data.user);
            console.log('✅ Auth successful!');
          }
        } catch (error) {
          console.error('❌ Auth error:', error);
        }
      }
    };

    authenticate();
  }, [wallet, isAuthenticated, setAuth]);

  // Handle wallet disconnect
  useEffect(() => {
    if (!wallet && isAuthenticated) {
      console.log('🔌 Wallet disconnected, logging out...');
      logout();
    }
  }, [wallet, isAuthenticated, logout]);

  const handleConnect = async () => {
    console.log('🔘 Connect button clicked');
    try {
      console.log('🔓 Opening TON Connect modal...');
      await tonConnectUI.openModal();
      console.log('✅ Modal opened');
    } catch (error) {
      console.error('❌ Error opening modal:', error);
    }
  };

  const handleDisconnect = async () => {
    console.log('🔘 Disconnect button clicked');
    try {
      await tonConnectUI.disconnect();
      logout();
      console.log('✅ Disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-xl font-bold text-white">TON Pool</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-ton-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className={`text-sm font-medium transition-colors ${
                      isActive('/dashboard') ? 'text-ton-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/subscription"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/subscription')
                        ? 'text-ton-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Subscription
                  </Link>
                </>
              )}
            </nav>

            {/* Wallet Button */}
            <div className="flex items-center space-x-4">
              {wallet ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg">
                    <Wallet className="w-4 h-4 text-ton-400" />
                    <span className="text-sm text-slate-300">
                      {wallet.account.address.slice(0, 6)}...{wallet.account.address.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  className="gradient-bg px-4 py-2 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  Connect Wallet
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800">
            <nav className="px-4 py-4 space-y-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-white"
              >
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-slate-300 hover:text-white"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/subscription"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-slate-300 hover:text-white"
                  >
                    Subscription
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="text-lg font-bold text-white">TON Pool</span>
              </div>
              <p className="text-slate-400 text-sm">
                Zero fees, 100% community owned staking pool on TON blockchain.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-medium mb-4">Links</h4>
              <div className="space-y-2">
                <Link to="/docs" className="block text-slate-400 hover:text-white text-sm">
                  Documentation
                </Link>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="block text-slate-400 hover:text-white text-sm">
                  GitHub
                </a>
                <Link to="/admin" className="block text-slate-400 hover:text-white text-sm">
                  Admin
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-medium mb-4">Rechtliches</h4>
              <div className="space-y-2">
                <Link to="/impressum" className="block text-slate-400 hover:text-white text-sm">
                  Impressum
                </Link>
                <Link to="/datenschutz" className="block text-slate-400 hover:text-white text-sm">
                  Datenschutz
                </Link>
                <Link to="/agb" className="block text-slate-400 hover:text-white text-sm">
                  AGB
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-slate-400 text-sm">
              © 2024-2025 Andrii Pylypchuk. Alle Rechte vorbehalten.
            </div>
            <div className="text-slate-500 text-xs">
              USt-IdNr: DE456902445
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
