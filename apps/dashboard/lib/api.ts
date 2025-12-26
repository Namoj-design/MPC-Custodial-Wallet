const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/* -----------------------------
   Internal helper
-------------------------------- */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API request failed");
  }

  return res.json();
}

/* =============================
   AUTH
============================= */

export async function login(email: string, password: string) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(payload: {
  email: string;
  password: string;
  name: string;
}) {
  return apiFetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =============================
   WALLET
============================= */

export type WalletDetails = {
  accountId: string;
  balance: string;
  network: string;
};

/** Primary wallet summary */
export async function getWalletSummary(): Promise<WalletDetails> {
  return apiFetch("/wallet/summary");
}

/** Alias for UI clarity */
export async function getWalletDetails(): Promise<WalletDetails> {
  return getWalletSummary();
}

/* =============================
   CLIENT DASHBOARD
============================= */

export async function getClientDashboard() {
  return apiFetch<{
    accountId: string;
    balance: string;
    network: string;
    transactions: any[];
  }>("/client/dashboard");
}

/* =============================
   TRANSACTIONS
============================= */

export async function initiateTransaction(payload: {
  toAccountId: string;
  amount: string;
  memo?: string;
}) {
  return apiFetch("/transaction/initiate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getTransactionHistory() {
  return apiFetch<any[]>("/transaction/history");
}

export async function getTransactionById(id: string) {
  return apiFetch(`/transaction/${id}`);
}

/* =============================
   HEALTH
============================= */

export async function pingBackend() {
  return apiFetch("/health");
}