/**
 * Ask HashPack to sign a frozen Hedera transaction
 */
async signTransactionBytes(txBytes: Uint8Array): Promise<{
    signedBytes: Uint8Array;
    signatureMap: Uint8Array;
  }> {
    if (!this.pairingData || !this.topic) {
      throw new Error("HASHCONNECT_NOT_CONNECTED");
    }
  
    const response = await this.hashconnect.sendTransaction(
      this.topic,
      {
        byteArray: txBytes,
        metadata: {
          accountToSign: this.pairingData.accountIds[0],
          returnTransaction: true,
        },
      }
    );
  
    if (!response.success || !response.signedTransaction) {
      throw new Error("USER_REJECTED_SIGNATURE");
    }
  
    return {
      signedBytes: response.signedTransaction,
      signatureMap: response.signatureMap!,
    };
  }