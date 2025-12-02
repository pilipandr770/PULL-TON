import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// TON Connect manifest URL - hosted on GitHub Gist for mobile wallets
const manifestUrl = 'https://gist.githubusercontent.com/pilipandr770/b25962c6e0ed107ea4fc6a694fb6dcc0/raw';

console.log('🔗 TON Connect Manifest URL:', manifestUrl);
console.log('🌐 Current origin:', window.location.origin);

// Fetch manifest to verify it's accessible
fetch(manifestUrl)
  .then(res => {
    console.log('📄 Manifest fetch status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('📄 Manifest content:', data);
  })
  .catch(err => {
    console.error('❌ Manifest fetch error:', err);
  });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider 
      manifestUrl={manifestUrl}
      onStatusChange={(wallet) => {
        console.log('👛 TON Connect status changed:', wallet);
        if (wallet) {
          console.log('✅ Wallet connected:', wallet.account?.address);
        } else {
          console.log('❌ Wallet disconnected');
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </TonConnectUIProvider>
  </React.StrictMode>
);
