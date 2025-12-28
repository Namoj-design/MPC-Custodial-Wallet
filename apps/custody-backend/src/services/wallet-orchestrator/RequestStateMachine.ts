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

/**
 * Lifecycle states for a custody transaction request
 */
export enum RequestState {
  CREATED = "CREATED",
  POLICY_APPROVED = "POLICY_APPROVED",
  AWAITING_APPROVALS = "AWAITING_APPROVALS",
  AUTHORIZED = "AUTHORIZED",
  SUBMITTED = "SUBMITTED",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED",
  FAILED = "FAILED",
}

/**
 * Custody-grade request state machine.
 * Enforces valid lifecycle transitions and terminal states.
 */
export class RequestStateMachine {
  private state: RequestState;

  constructor(initialState: RequestState = RequestState.CREATED) {
    this.state = initialState;
  }

  getState(): RequestState {
    return this.state;
  }

  /**
   * Transition request to a new state (internal guard)
   */
  transition(next: RequestState): void {
    if (this.isTerminal()) {
      throw new Error("REQUEST_IN_TERMINAL_STATE");
    }

    const allowed = this.allowedTransitions(this.state);

    if (!allowed.includes(next)) {
      throw new Error(
        `INVALID_STATE_TRANSITION: ${this.state} → ${next}`
      );
    }

    this.state = next;
  }

  /**
   * Called when transaction is submitted to Hedera
   */
  onSubmit(): void {
    this.transition(RequestState.SUBMITTED);
  }

  /**
   * Called when Hedera receipt confirms consensus
   */
  onConfirm(): void {
    this.transition(RequestState.CONFIRMED);
  }

  /**
   * Reject the request (policy / execution failure)
   */
  reject(): void {
    this.state = RequestState.REJECTED;
  }

  /**
   * Mark request as failed (execution error)
   */
  fail(): void {
    this.state = RequestState.FAILED;
  }

  /**
   * Terminal states cannot transition further
   */
  isTerminal(): boolean {
    return (
      this.state === RequestState.CONFIRMED ||
      this.state === RequestState.REJECTED ||
      this.state === RequestState.FAILED
    );
  }

  /**
   * Allowed transitions by state
   */
  private allowedTransitions(state: RequestState): RequestState[] {
    switch (state) {
      case RequestState.CREATED:
        return [RequestState.POLICY_APPROVED];

      case RequestState.POLICY_APPROVED:
        return [RequestState.AWAITING_APPROVALS];

      case RequestState.AWAITING_APPROVALS:
        return [RequestState.AUTHORIZED, RequestState.REJECTED];

      case RequestState.AUTHORIZED:
        return [RequestState.SUBMITTED, RequestState.REJECTED];

      case RequestState.SUBMITTED:
        return [RequestState.CONFIRMED, RequestState.FAILED];

      default:
        return [];
    }
  }
}