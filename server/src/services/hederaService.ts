import { dfns } from './dfnsService';

export async function executeHederaTransfer(
    walletId: string,
    senderAddress: string,
    receiverAddress: string,
    amount: number
) {
    const hashgraph = await import('@hashgraph/sdk');
    const { TransferTransaction, Hbar, Client, AccountId, TransactionId, PrivateKey } = hashgraph;

    // Resolve evm alias to numeric account id for HashScan
    let numericSenderAddress = senderAddress;
    if (senderAddress.length > 20) {
        try {
            const res = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${senderAddress}`);
            const data: any = await res.json();
            if (data.account) numericSenderAddress = data.account;
        } catch (e) {
            console.error('Failed to resolve numeric account ID', e);
        }
    }

    // Initialize a client just to freeze the transaction against a node.
    // We strictly use a valid dummy PrivateKey object since DFNS will provide the real signature.
    const hederaClient = Client.forTestnet();
    const dummyId = AccountId.fromString('0.0.12345');
    const dummyKey = PrivateKey.generateED25519();
    hederaClient.setOperator(dummyId, dummyKey);

    // 1. Build Hedera transaction (strictly numeric sender for Hashscan)
    const txId = TransactionId.generate(AccountId.fromString(numericSenderAddress));
    const tx = new TransferTransaction()
        .addHbarTransfer(numericSenderAddress, new Hbar(-amount))
        .addHbarTransfer(receiverAddress, new Hbar(amount))
        .setNodeAccountIds([AccountId.fromString('0.0.3')])
        .setTransactionId(txId);

    // 2. freezeWith
    tx.freezeWith(hederaClient);

    // 3. convert to bytes
    const bytes = tx.toBytes();
    const hex_encoded_bytes = '0x' + Buffer.from(bytes).toString('hex');

    // 4. Call DFNS
    const result = await dfns.wallets.broadcastTransaction({
        walletId,
        body: {
            kind: 'Transaction',
            transaction: hex_encoded_bytes,
        } as any
    });

    // Hashscan format: 0.0.x-12345-67890 (replace @ and last . with -)
    // txId.toString() is usually 0.0.x@12345.67890
    const str = txId.toString();
    const parts = str.split('@');
    const formattedTxId = parts[0] + '-' + parts[1].replace('.', '-');

    return { dfnsResponse: result, hederaTxId: formattedTxId };
}

export async function getAccountBalance(accountId: string): Promise<number> {
    const url = `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Hedera Mirror Node error: ${response.statusText}`);
        }
        const data: any = await response.json();
        // Return balance in HBAR (tinybars / 100,000,000)
        return (data.balance?.balance || 0) / 100_000_000;
    } catch (error) {
        console.error('getAccountBalance Error:', error);
        return 0;
    }
}
