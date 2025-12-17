type Props = {
  accountId: string;
  balance: string;
  network: string;
};

export default function WalletSummaryCard({
  accountId,
  balance,
  network,
}: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Wallet Summary
      </h2>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Account ID</span>
          <span className="font-mono text-gray-900">{accountId}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Balance</span>
          <span className="font-semibold text-gray-900">{balance}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Network</span>
          <span className="text-gray-900">{network}</span>
        </div>
      </div>
    </div>
  );
}