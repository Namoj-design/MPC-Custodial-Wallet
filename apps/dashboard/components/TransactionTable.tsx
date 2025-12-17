type Transaction = {
  id: string;
  amount: string;
  status: string;
  createdAt: string;
};

type Props = {
  transactions: Transaction[];
};

export default function TransactionTable({ transactions }: Props) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-500">
        No recent transactions
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="px-4 py-2 text-left">Transaction ID</th>
            <th className="px-4 py-2 text-left">Amount</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Time</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-t">
              <td className="px-4 py-2 font-mono">{tx.id}</td>
              <td className="px-4 py-2">{tx.amount}</td>
              <td className="px-4 py-2">{tx.status}</td>
              <td className="px-4 py-2 text-gray-500">
                {new Date(tx.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}