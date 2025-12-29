export async function createTransactionIntent(params: {
    recipient: string;
    amount: number;
    memo?: string;
  }) {
    const res = await fetch("/api/transactions/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  
    if (!res.ok) throw new Error("Intent failed");
    return res.json();
  }