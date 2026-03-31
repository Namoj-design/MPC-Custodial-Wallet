// Backend API Configuration
// Configure these environment variables for your deployment

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws',

  endpoints: {
    // Auth
    authRegisterStart: '/auth/register/start',
    authRegisterVerify: '/auth/register/verify',
    authRegisterComplete: '/auth/register/complete',
    authLoginStart: '/auth/login/start',
    authLoginComplete: '/auth/login/complete',
    authManagerLogin: '/auth/manager/verify',

    // DFNS Wallet
    walletCreate: '/wallet/create',
    walletBalance: '/wallet/balance',
    walletMy: '/wallet/my',
    walletList: '/wallet/list',

    // Transactions
    transactions: '/transactions',
    transactionsPending: '/transactions/pending',
    transactionApprove: '/transactions/{id}/approve',
    transactionReject: '/transactions/{id}/reject',
    transactionById: '/transactions/{id}',

    // DFNS Webhooks (backend-only, listed for reference)
    webhooksDfns: '/webhooks/dfns',
  },
} as const;

export function getApiUrl(endpoint: keyof typeof API_CONFIG.endpoints, params?: Record<string, string>): string {
  let path = API_CONFIG.endpoints[endpoint] as string;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`{${key}}`, value);
    });
  }
  return `${API_CONFIG.baseUrl}${path}`;
}

export function getWsUrl(): string {
  return API_CONFIG.wsUrl;
}
