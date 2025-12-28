import { FastifyRequest, FastifyReply } from "fastify";

import { verifyClientSignature } from "../../hedera/mpcSigner.ts";
import { orchestrator } from "../../services/wallet-orchestrator.ts";
import { signatureAudit } from "../../shared/audit/signatureAudit.ts";

/**
 * Client submits a signed Hedera transaction (HashPack)
 * This endpoint ONLY verifies + approves, never submits.
 */
export async function submitSignedTransaction(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const body = req.body as {
    intentId: string;
    signedBytes: number[];
    clientPublicKey: string;
  };

  const { intentId, signedBytes, clientPublicKey } = body;

  if (!intentId || !signedBytes || !clientPublicKey) {
    return reply.code(400).send({ error: "INVALID_REQUEST" });
  }

  // 1. Verify client signature (cryptographic proof)
  verifyClientSignature({
    signedBytes: Uint8Array.from(signedBytes),
    clientPublicKey,
  });

  // 2. Audit log (immutable trail)
  signatureAudit.record({
    intentId,
    signer: "CLIENT",
    timestamp: Date.now(),
  });

  // 3. Approve client in orchestrator
  const intent = orchestrator.approveClient(intentId);

  // 4. Respond with updated intent state
  return reply.send({
    status: "CLIENT_APPROVED",
    intent,
  });
}

/**
 * Wealth manager / custodian approval endpoint
 * Records a non-client approval (e.g. WEALTH_MANAGER)
 */
export async function approveTransaction(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const body = req.body as {
    intentId: string;
    role: "CUSTODIAN" | "WEALTH_MANAGER" | "RECOVERY";
  };

  const { intentId, role } = body;

  if (!intentId || !role) {
    return reply.code(400).send({ error: "INVALID_REQUEST" });
  }

  try {
    const intent = orchestrator.addApproval(intentId, role);
    return reply.send({
      status: "APPROVAL_RECORDED",
      intent,
    });
  } catch (err) {
    return reply.code(400).send({
      error: (err as Error).message,
    });
  }
}

/**
 * Poll execution / lifecycle status of a transaction intent
 */
export async function getTransactionStatus(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = req.params as { id: string };

  if (!id) {
    return reply.code(400).send({ error: "INVALID_REQUEST" });
  }

  try {
    const intent = orchestrator.getIntent(id);
    return reply.send({
      intentId: id,
      state: intent.state,
      approvals: intent.approvals,
    });
  } catch (err) {
    return reply.code(404).send({
      error: "INTENT_NOT_FOUND",
    });
  }
}
