/**
 * Input validation utilities
 */

// Hedera account ID format: 0.0.XXXXX
export function isValidHederaAccountId(accountId: string): boolean {
    return /^0\.0\.\d+$/.test(accountId);
}

export function validateHederaAccountId(accountId: string): void {
    if (!isValidHederaAccountId(accountId)) {
        throw new Error(`Invalid Hedera account ID format: ${accountId}`);
    }
}

// HBAR amount validation
export function validateHBARAmount(amount: string): void {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
        throw new Error(`Invalid HBAR amount: ${amount}`);
    }
    if (num > 50000000000) { // Max supply
        throw new Error(`HBAR amount too large: ${amount}`);
    }
}

// Memo validation
export function validateMemo(memo: string): void {
    if (memo.length > 100) {
        throw new Error(`Memo too long: max 100 characters`);
    }
}

// Ed25519 signature validation (64 bytes)
export function validateEd25519Signature(signature: Uint8Array): void {
    if (signature.length !== 64) {
        throw new Error(`Invalid Ed25519 signature length: expected 64, got ${signature.length}`);
    }
}

// Ed25519 public key validation (32 bytes)
export function validateEd25519PublicKey(publicKey: Uint8Array): void {
    if (publicKey.length !== 32) {
        throw new Error(`Invalid Ed25519 public key length: expected 32, got ${publicKey.length}`);
    }
}

// Ed25519 private key/share validation (32 bytes)
export function validateEd25519PrivateKey(privateKey: Uint8Array): void {
    if (privateKey.length !== 32) {
        throw new Error(`Invalid Ed25519 private key length: expected 32, got ${privateKey.length}`);
    }
}
