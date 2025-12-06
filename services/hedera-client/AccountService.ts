import {
    PrivateKey,
    AccountCreateTransaction,
    Hbar,
    AccountBalanceQuery,
    AccountInfoQuery,
  } from "@hashgraph/sdk";
  import { HederaClient } from "./HederaClient";
  import { AccountCreationResult } from "/Users/namojperiakumar/Desktop/MPC-Wallet/services/hedera-client/ClientTypes";
  
  
  export class AccountService {
    constructor(private hedera: HederaClient) {}
  
    async createAccount(): Promise<AccountCreationResult> {
      const privateKey = PrivateKey.generateED25519();
      const publicKey = privateKey.publicKey;
  
      const tx = new AccountCreateTransaction()
        .setKey(publicKey)
        .setInitialBalance(new Hbar(1))
        .freezeWith(this.hedera.getClient());
  
      const submit = await tx.execute(this.hedera.getClient());
      const receipt = await submit.getReceipt(this.hedera.getClient());
  
      return {
        success: true,
        accountId: receipt.accountId?.toString() || "",
        privateKey: privateKey.toStringRaw(),
        publicKey: publicKey.toStringRaw(),
      };
    }
  
    async getBalance(accountId: string) {
      const query = new AccountBalanceQuery().setAccountId(accountId);
      const result = await query.execute(this.hedera.getClient());
      return result.hbars.toString();
    }
  
    async getAccountInfo(accountId: string) {
      const info = await new AccountInfoQuery()
        .setAccountId(accountId)
        .execute(this.hedera.getClient());
      return info;
    }
  }