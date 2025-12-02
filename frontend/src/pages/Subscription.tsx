import { useQuery, useMutation } from '@tanstack/react-query';
import { Navigate, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { subscriptionApi } from '../lib/api';
import { Check, CreditCard, Loader2 } from 'lucide-react';

function SubscriptionMain() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionApi.getStatus().then((r) => r.data),
    enabled: isAuthenticated,
  });

  const { data: pricing } = useQuery({
    queryKey: ['pricing'],
    queryFn: () => subscriptionApi.getPricing().then((r) => r.data.pricing),
  });

  const checkoutMutation = useMutation({
    mutationFn: () => subscriptionApi.createCheckout(),
    onSuccess: (response) => {
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    },
  });

  const portalMutation = useMutation({
    mutationFn: () => subscriptionApi.createPortal(),
    onSuccess: (response) => {
      if (response.data.portalUrl) {
        window.location.href = response.data.portalUrl;
      }
    },
  });

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-ton-400 animate-spin" />
      </div>
    );
  }

  const hasSubscription = subscriptionData?.hasAccess;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Subscription</h1>

      {hasSubscription ? (
        <div className="glass rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Active Subscription</h2>
              <p className="text-slate-400">
                Expires: {subscriptionData?.subscription?.currentPeriodEnd 
                  ? new Date(subscriptionData.subscription.currentPeriodEnd).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => portalMutation.mutate()}
              disabled={portalMutation.isPending}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 text-white hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {portalMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Manage Subscription</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="glass rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl font-bold text-white mb-2">
              €{pricing?.price || 5}
            </div>
            <div className="text-slate-400">per month</div>
          </div>

          <ul className="space-y-4 mb-8">
            {(pricing?.features || [
              'Full dashboard access',
              'Transaction history',
              'Real-time analytics',
              'Email notifications',
              'Priority support'
            ]).map((feature: string, index: number) => (
              <li key={index} className="flex items-center text-slate-300">
                <span className="w-6 h-6 rounded-full bg-ton-500/20 mr-3 flex items-center justify-center">
                  <Check className="w-4 h-4 text-ton-400" />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={() => checkoutMutation.mutate()}
            disabled={checkoutMutation.isPending}
            className="w-full gradient-bg py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {checkoutMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Subscribe Now</span>
              </>
            )}
          </button>

          {checkoutMutation.isError && (
            <p className="text-red-400 text-center mt-4">
              Failed to create checkout. Please try again.
            </p>
          )}

          <p className="text-slate-500 text-sm text-center mt-4">
            Secure payment powered by Stripe
          </p>
        </div>
      )}
    </div>
  );
}

function SubscriptionSuccess() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
        <Check className="w-8 h-8 text-green-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-4">Subscription Activated!</h1>
      <p className="text-slate-400 mb-8">
        Thank you for subscribing. You now have full access to the premium dashboard.
      </p>
      <a
        href="/dashboard"
        className="inline-block gradient-bg px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
      >
        Go to Dashboard
      </a>
    </div>
  );
}

function SubscriptionCancel() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-white mb-4">Subscription Cancelled</h1>
      <p className="text-slate-400 mb-8">
        You cancelled the checkout process. No charges were made.
      </p>
      <a
        href="/subscription"
        className="inline-block gradient-bg px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
      >
        Try Again
      </a>
    </div>
  );
}

export default function Subscription() {
  return (
    <Routes>
      <Route index element={<SubscriptionMain />} />
      <Route path="success" element={<SubscriptionSuccess />} />
      <Route path="cancel" element={<SubscriptionCancel />} />
    </Routes>
  );
}
