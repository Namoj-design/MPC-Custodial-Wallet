// apps/dashboard/lib/api.ts

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

async function request<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: any;
    auth?: boolean;
  } = {}
): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ---------- Auth ----------

export async function login(body: { email: string; password: string }) {
  const res = await request<{
    success: boolean;
    data: { token: string; user: any };
  }>("/auth/login", {
    method: "POST",
    body,
    auth: false, // no auth header before login
  });
  return res.data;
}

// ---------- Health ----------

export async function getHealth() {
  return request<{ status: string }>("/health", { method: "GET", auth: false });
}

// ---------- Wallet ----------

export interface WalletOverview {
  balance: string;
  accountId: string;
  network: string;
  mpcRounds: number;
  topics: number;
}

export async function getWalletOverview() {
    const res = await request<{
      success: boolean;
      data: WalletOverview;
    }>("/api/wallet/overview");
    return res.data;
  }

// ---------- Transactions ----------

export interface RecentTransaction {
  id: string;
  from: string;
  to: string;
  amount: string;
  status: string;
  createdAt: string;
}

export async function getRecentTransactions(): Promise<RecentTransaction[]> {
  const res = await request<{
    success: boolean;
    data: RecentTransaction[];
  }>("/api/transactions/recent");
  return res.data;
}