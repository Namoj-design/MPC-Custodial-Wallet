

import { sha256 } from "@noble/hashes/sha256";

/**
 * Audit record for a signature verification event.
 * This structure is intentionally minimal and safe to persist.
 */
export type SignatureAuditRecord = {
  timestamp: string;
  messageHash: string;
  publicKeyHash: string;
  signatureValid: boolean;
  context?: string;
};

/**
 * Safely compute a hex-encoded SHA-256 hash.
 */
function hashHex(data: Uint8Array): string {
  return Buffer.from(sha256(data)).toString("hex");
}

/**
 * Record a signature verification event.
 *
 * IMPORTANT:
 * - This function must NEVER throw
 * - This function must NEVER affect control flow
 * - This function must NEVER log raw secrets
 *
 * Today: logs to stdout
 * Tomorrow: DB / file / SIEM
 */
export function auditSignatureVerification(
  params: {
    message: Uint8Array;
    publicKey: Uint8Array;
    signatureValid: boolean;
    context?: string;
  }
): SignatureAuditRecord {
  try {
    const record: SignatureAuditRecord = {
      timestamp: new Date().toISOString(),
      messageHash: hashHex(params.message),
      publicKeyHash: hashHex(params.publicKey),
      signatureValid: params.signatureValid,
      context: params.context,
    };

    // Current sink: structured log
    console.info("[SIGNATURE_AUDIT]", record);

    return record;
  } catch (err) {
    // Absolute last-resort fallback (never throw)
    console.error("[SIGNATURE_AUDIT_FAILED]", {
      timestamp: new Date().toISOString(),
      signatureValid: params.signatureValid,
    });

    return {
      timestamp: new Date().toISOString(),
      messageHash: "unavailable",
      publicKeyHash: "unavailable",
      signatureValid: params.signatureValid,
      context: params.context,
    };
  }
}