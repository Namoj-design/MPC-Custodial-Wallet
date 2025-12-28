import { FastifyRequest, FastifyReply } from "fastify";
import { signAndSubmitTransferTx } from "../../hedera/mpcSigner";

export async function submitMpcSignedTx(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const {
    publicKey,
    signature,
    fromAccount,
    toAccount,
    amount,
  } = request.body as any;

  const result = await signAndSubmitTransferTx(
    new Uint8Array(publicKey),
    new Uint8Array(signature),
    fromAccount,
    toAccount,
    amount
  );

  return reply.send(result);
}