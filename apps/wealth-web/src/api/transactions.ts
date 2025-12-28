/**
 * Submit signed transaction to backend
 */
export async function submitSignedTransaction(payload: {
    intentId: string;
    signedBytes: number[];
    signatureMap: number[];
  }) {
    const res = await fetch("/api/transactions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) {
      throw new Error("BACKEND_REJECTED_SIGNATURE");
    }
  
    return res.json();
  }