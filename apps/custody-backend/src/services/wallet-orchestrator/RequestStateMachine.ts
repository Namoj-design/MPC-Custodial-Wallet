import { HashConnect, HashConnectTypes } from "hashconnect";

const APP_METADATA: HashConnectTypes.AppMetadata = {
  name: "MPC Custodial Wallet",
  description: "2-of-3 MPC Wallet (Wealth / Client)",
  icon: "https://yourdomain.com/icon.png",
};

class HashPackConnector {
  private hashconnect: HashConnect;
  private topic: string | null = null;
  private pairingData: HashConnectTypes.SavedPairingData | null = null;

  constructor() {
    this.hashconnect = new HashConnect();
  }

  /**
   * Initialize HashPack
   */
  async init(): Promise<void> {
    await this.hashconnect.init(APP_METADATA, "testnet", false);
  }

  /**
   * Connect to HashPack wallet
   */
  async connect(): Promise<{
    accountId: string;
    publicKey: string;
  }> {
    const state = await this.hashconnect.connect();

    if (!state.topic) {
      throw new Error("HASHCONNECT_INIT_FAILED");
    }

    this.topic = state.topic;

    await new Promise<void>((resolve) => {
      this.hashconnect.pairingEvent.once((data) => {
        this.pairingData = data;
        resolve();
      });
    });

    await this.hashconnect.connectToLocalWallet();

    if (!this.pairingData || this.pairingData.accountIds.length === 0) {
      throw new Error("NO_ACCOUNT_PAIRED");
    }

    return {
      accountId: this.pairingData.accountIds[0],
      publicKey: this.pairingData.publicKey,
    };
  }

  /**
   * Sign frozen Hedera transaction bytes using HashPack
   */
  async signTransactionBytes(
    txBytes: Uint8Array
  ): Promise<{
    signedBytes: Uint8Array;
    signatureMap: Uint8Array;
  }> {
    if (!this.topic || !this.pairingData) {
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
}

export const hashPack = new HashPackConnector();
