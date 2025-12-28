import type { FastifyRequest, FastifyReply } from "fastify";
import { createMpcAccount } from "../../hedera/account.ts";

/**
 * Controller: Create MPC-backed Hedera account
 *
 * This endpoint:
 * - Accepts an MPC public key (Ed25519, 32 bytes)
 * - Creates a Hedera account bound to that key
 * - Does NOT perform signing
 */
export async function createMpcHederaAccount(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const body = request.body as unknown;

    // ---- Input validation ----
    if (
      !body ||
      typeof body !== "object" ||
      !Array.isArray((body as any).publicKey)
    ) {
      return reply.status(400).send({
        error: "INVALID_REQUEST_BODY",
        message: "Expected { publicKey: number[] }",
      });
    }

    const publicKeyArray = (body as any).publicKey;

    if (publicKeyArray.length !== 32) {
      return reply.status(400).send({
        error: "INVALID_PUBLIC_KEY_LENGTH",
        message: "Ed25519 public key must be 32 bytes",
      });
    }

    // Ensure bytes are valid numbers
    for (const b of publicKeyArray) {
      if (typeof b !== "number" || b < 0 || b > 255) {
        return reply.status(400).send({
          error: "INVALID_PUBLIC_KEY_FORMAT",
          message: "Public key must be an array of bytes (0–255)",
        });
      }
    }

    // ---- Core logic ----
    const result = await createMpcAccount(
      new Uint8Array(publicKeyArray)
    );

    return reply.status(200).send(result);
  } catch (err: any) {
    // ---- Known errors ----
    if (err?.message === "INVALID_MPC_PUBLIC_KEY") {
      return reply.status(400).send({
        error: "INVALID_MPC_PUBLIC_KEY",
      });
    }

    // ---- Unknown / internal errors ----
    request.log.error(err);

    return reply.status(500).send({
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}