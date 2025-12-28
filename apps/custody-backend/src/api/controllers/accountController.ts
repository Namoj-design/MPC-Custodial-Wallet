import { FastifyRequest, FastifyReply } from "fastify";
import { createMpcAccount } from "../../hedera/account";

export async function createMpcHederaAccount(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { publicKey } = request.body as {
    publicKey: number[];
  };

  const result = await createMpcAccount(
    new Uint8Array(publicKey)
  );

  return reply.send(result);
}