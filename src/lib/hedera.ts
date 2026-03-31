// Hedera Testnet utilities — no thirdweb dependency

/**
 * Resolve a Hedera account ID (0.0.xxxxx) to its EVM address via mirror node.
 */
export async function resolveHederaAccountToEvm(accountId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`
    );
    const data = await res.json();
    if (data.evm_address) {
      return data.evm_address;
    }
  } catch {
    // fall through to long-zero conversion
  }

  const parts = accountId.split(".");
  const num = parseInt(parts[2], 10);
  return "0x" + num.toString(16).padStart(40, "0");
}

/**
 * Fetch account balance from Hedera mirror node (in HBAR).
 */
export async function fetchAccountBalance(accountId: string): Promise<number> {
  try {
    const response = await fetch(
      `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`
    );
    const data = await response.json();
    return (data.balance?.balance || 0) / 100_000_000;
  } catch {
    return 0;
  }
}
