import { Client } from "@hashgraph/sdk";

export function createHederaClient(): Client {
  const network = process.env.HEDERA_NETWORK || "testnet";

  let client: Client;
  if (network === "mainnet") {
    client = Client.forMainnet();
  } else {
    client = Client.forTestnet();
  }

  client.setOperator(
    process.env.HEDERA_OPERATOR_ID!,
    process.env.HEDERA_OPERATOR_KEY!
  );

  return client;
}