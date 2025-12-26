import { MPCSession } from "./session";
import { MPCSessionState } from "./state";
import {
  combinePartialsEd25519,
  PartialSig,
} from "/Users/namojperiakumar/Desktop/MPC-Custodial-Wallet/apps/custody-backend/src/mpc/realEngine";
import { sha512 } from "@noble/hashes/sha512";
import { bytesToNumberLE } from "@noble/curves/abstract/utils";

const ED25519_L =
  2n ** 252n +
  27742317777372353535851937790883648493n;

export class MPCOrchestrator {
  private nonces: Map<string, Uint8Array> = new Map();
  private partials: PartialSig[] = [];
  private challenge?: bigint;

  constructor(private session: MPCSession) {}

  onReady() {
    this.session.state.state = MPCSessionState.READY;
  }

  // Round 1: collect R_i
  onNonce(clientId: string, Ri: Uint8Array) {
    this.nonces.set(clientId, Ri);

    if (this.nonces.size === this.session.parties.size) {
      this.session.state.state = MPCSessionState.RUNNING;
      return { allNoncesReceived: true };
    }

    return { waiting: true };
  }

  async computeChallenge(
    message: Uint8Array,
    publicKey: Uint8Array
  ): Promise<bigint> {
    try {
      const Rbytes = Array.from(this.nonces.values()).flat();
      const input = new Uint8Array([
        ...Rbytes,
        ...publicKey,
        ...message,
      ]);

      const h = sha512(input);
      const c = bytesToNumberLE(h) % ED25519_L;

      this.challenge = c;
      return c;
    } catch (err) {
      throw new Error(
        `Failed to compute MPC challenge: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  // Round 3: collect s_i
  async onPartialSig(
    message: Uint8Array,
    publicKey: Uint8Array,
    sig: PartialSig
  ) {
    this.partials.push(sig);

    if (this.partials.length < this.session.parties.size) {
      return { waiting: true };
    }

    const finalSig = await combinePartialsEd25519(
      message,
      publicKey,
      this.partials
    );

    this.session.state.state = MPCSessionState.COMPLETED;

    return {
      complete: true,
      signature: finalSig,
    };
  }
}