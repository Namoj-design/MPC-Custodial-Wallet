"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTransactionIntent } from "@/lib/api/transactions";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";

export default function NewTransactionPage() {
  const router = useRouter();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setLoading(true);
    try {
      const intent = await createTransactionIntent({
        recipient,
        amount: Number(amount),
        memo,
      });

      router.push(`/transactions/review/${intent.intentId}`);
    } catch (err) {
      alert("Failed to create transaction");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="New Transaction">
      <Field
        label="Recipient Account ID"
        placeholder="0.0.xxxxx"
        value={recipient}
        onChange={setRecipient}
      />

      <Field
        label="Amount (HBAR)"
        type="number"
        value={amount}
        onChange={setAmount}
      />

      <Field
        label="Memo (optional)"
        value={memo}
        onChange={setMemo}
      />

      <Button
        onClick={handleContinue}
        disabled={!recipient || !amount || loading}
      >
        Continue →
      </Button>
    </Card>
  );
}