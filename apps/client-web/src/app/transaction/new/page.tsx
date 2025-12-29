"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createTransactionIntent } from "@/lib/api/transaction";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";

/**
 * Adapter to satisfy:
 * ((v: string) => void) & ChangeEventHandler<HTMLInputElement>
 */
function valueAdapter(
  setter: (v: string) => void
): ((v: string) => void) & React.ChangeEventHandler<HTMLInputElement> {
  return ((arg: string | React.ChangeEvent<HTMLInputElement>) => {
    if (typeof arg === "string") {
      setter(arg);
    } else {
      setter(arg.target.value);
    }
  }) as ((v: string) => void) &
    React.ChangeEventHandler<HTMLInputElement>;
}

export default function NewTransactionPage() {
  const router = useRouter();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!recipient || !amount) return;

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Invalid amount");
      return;
    }

    setLoading(true);
    try {
      const intent = await createTransactionIntent({
        recipient,
        amount: parsedAmount,
        memo,
      });

      router.push(`/transaction/review/${intent.intentId}`);
    } catch (err) {
      console.error(err);
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
        onChange={valueAdapter(setRecipient)}
      />

      <Field
        label="Amount (HBAR)"
        type="number"
        value={amount}
        onChange={valueAdapter(setAmount)}
      />

      <Field
        label="Memo (optional)"
        value={memo}
        onChange={valueAdapter(setMemo)}
      />

      <Button
        onClick={handleContinue}
        disabled={!recipient || !amount || loading}
      >
        {loading ? "Processing..." : "Continue →"}
      </Button>
    </Card>
  );
}