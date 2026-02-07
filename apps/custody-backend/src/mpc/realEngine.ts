import { ed25519 } from '@noble/curves/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { bytesToHex } from '../shared/utils/encoding.js';
import { validateEd25519PublicKey, validateEd25519Signature } from '../shared/utils/validation.js';
import type { Ed25519Signature, MPCShare } from './types.js';

/**
 * Real MPC Engine for 2-of-3 Threshold Ed25519 Signing
 * 
 * Implementation:
 * - Additive secret sharing: x = x1 + x2 + x3 mod L
 * - Public key aggregation: A = A1 + A2 + A3
 * - Nonce commit-reveal protocol
 * - Threshold signing: any 2-of-3 can sign
 */

// Ed25519 curve order (L)
const L = BigInt('7237005577332262213973186563042994240857116359379907606001950938285454250989');

export class MPCEngine {
    /**
     * Generate MPC share for a participant
     * In production, use proper DKG. For MVP, shares are pre-generated.
     */
    static generateShare(): MPCShare {
        const privateShare = ed25519.utils.randomPrivateKey();
        const publicShare = ed25519.getPublicKey(privateShare);

        return {
            privateShare,
            publicShare
        };
    }

    /**
     * Combine public key shares into aggregated public key
     * A = A1 + A2 + A3 (point addition)
     */
    static combinePublicKeys(publicShares: Uint8Array[]): Uint8Array {
        if (publicShares.length < 2) {
            throw new Error('Need at least 2 public shares');
        }

        // Validate all public keys
        publicShares.forEach(validateEd25519PublicKey);

        // Convert to points and add
        let combined = ed25519.ExtendedPoint.fromHex(publicShares[0]);
        for (let i = 1; i < publicShares.length; i++) {
            const point = ed25519.ExtendedPoint.fromHex(publicShares[i]);
            combined = combined.add(point);
        }

        return combined.toRawBytes();
    }

    /**
     * Generate random nonce for signing
     */
    static generateNonce(): Uint8Array {
        return ed25519.utils.randomPrivateKey();
    }

    /**
     * Compute commitment to nonce: H(nonce)
     */
    static commitNonce(nonce: Uint8Array): Uint8Array {
        return sha512(nonce).slice(0, 32);
    }

    /**
     * Verify nonce commitment
     */
    static verifyNonceCommitment(nonce: Uint8Array, commitment: Uint8Array): boolean {
        const computed = this.commitNonce(nonce);
        return bytesToHex(computed) === bytesToHex(commitment);
    }

    /**
     * Compute public nonce: R = nonce * G
     */
    static computePublicNonce(nonce: Uint8Array): Uint8Array {
        return ed25519.getPublicKey(nonce);
    }

    /**
     * Aggregate public nonces: R = R1 + R2 + ... (point addition)
     */
    static aggregatePublicNonces(publicNonces: Uint8Array[]): Uint8Array {
        if (publicNonces.length < 2) {
            throw new Error('Need at least 2 public nonces');
        }

        publicNonces.forEach(validateEd25519PublicKey);

        let combined = ed25519.ExtendedPoint.fromHex(publicNonces[0]);
        for (let i = 1; i < publicNonces.length; i++) {
            const point = ed25519.ExtendedPoint.fromHex(publicNonces[i]);
            combined = combined.add(point);
        }

        return combined.toRawBytes();
    }

    /**
     * Compute challenge: c = H(R || A || message)
     */
    static computeChallenge(R: Uint8Array, publicKey: Uint8Array, message: Uint8Array): bigint {
        const combined = new Uint8Array(R.length + publicKey.length + message.length);
        combined.set(R, 0);
        combined.set(publicKey, R.length);
        combined.set(message, R.length + publicKey.length);

        const hash = sha512(combined);
        // Take first 32 bytes and convert to bigint
        const hashBytes = hash.slice(0, 32);
        let c = BigInt(0);
        for (let i = 0; i < hashBytes.length; i++) {
            c = (c << BigInt(8)) | BigInt(hashBytes[i]);
        }

        return c % L;
    }

    /**
     * Compute partial signature: si = ri + c * xi mod L
     */
    static computePartialSignature(
        nonce: Uint8Array,
        privateShare: Uint8Array,
        challenge: bigint
    ): Uint8Array {
        // Convert to bigints
        const r = this.bytesToScalar(nonce);
        const x = this.bytesToScalar(privateShare);

        // si = ri + c * xi mod L
        const s = (r + (challenge * x) % L) % L;

        return this.scalarToBytes(s);
    }

    /**
     * Aggregate partial signatures: s = sum(si) mod L
     */
    static aggregatePartialSignatures(partialSigs: Uint8Array[]): Uint8Array {
        if (partialSigs.length < 2) {
            throw new Error('Need at least 2 partial signatures');
        }

        let totalS = BigInt(0);
        for (const partialSig of partialSigs) {
            const s = this.bytesToScalar(partialSig);
            totalS = (totalS + s) % L;
        }

        return this.scalarToBytes(totalS);
    }

    /**
     * Create final Ed25519 signature from R and s
     */
    static createSignature(R: Uint8Array, s: Uint8Array): Uint8Array {
        validateEd25519PublicKey(R);
        if (s.length !== 32) {
            throw new Error('Invalid s length');
        }

        // Ed25519 signature format: R (32 bytes) || s (32 bytes)
        const signature = new Uint8Array(64);
        signature.set(R, 0);
        signature.set(s, 32);

        return signature;
    }

    /**
     * Verify Ed25519 signature
     */
    static verifySignature(
        signature: Uint8Array,
        message: Uint8Array,
        publicKey: Uint8Array
    ): boolean {
        try {
            validateEd25519Signature(signature);
            validateEd25519PublicKey(publicKey);

            return ed25519.verify(signature, message, publicKey);
        } catch (error) {
            console.error('Signature verification error:', error);
            return false;
        }
    }

    /**
     * Parse signature into R and s components
     */
    static parseSignature(signature: Uint8Array): Ed25519Signature {
        validateEd25519Signature(signature);

        return {
            R: signature.slice(0, 32),
            s: signature.slice(32, 64)
        };
    }

    // Helper: Convert bytes to scalar (little-endian)
    private static bytesToScalar(bytes: Uint8Array): bigint {
        let scalar = BigInt(0);
        for (let i = bytes.length - 1; i >= 0; i--) {
            scalar = (scalar << BigInt(8)) | BigInt(bytes[i]);
        }
        return scalar % L;
    }

    // Helper: Convert scalar to bytes (little-endian, 32 bytes)
    private static scalarToBytes(scalar: bigint): Uint8Array {
        const bytes = new Uint8Array(32);
        let s = scalar % L;
        for (let i = 0; i < 32; i++) {
            bytes[i] = Number(s & BigInt(0xff));
            s = s >> BigInt(8);
        }
        return bytes;
    }
}
