/**
 * Encoding utilities for hex/bytes conversion
 */

export function hexToBytes(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) {
        throw new Error('Invalid hex string length');
    }
    const result = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        result[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return result;
}

export function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export function isValidHex(str: string): boolean {
    return /^[0-9a-fA-F]*$/.test(str) && str.length % 2 === 0;
}

export function validateByteLength(bytes: Uint8Array, expectedLength: number): void {
    if (bytes.length !== expectedLength) {
        throw new Error(`Expected ${expectedLength} bytes, got ${bytes.length}`);
    }
}
