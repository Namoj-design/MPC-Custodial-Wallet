import { Point } from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import {
  bytesToNumberLE,
  numberToBytesLE,
} from "@noble/curves/abstract/utils";

/**
 * Ed25519 curve order:
 * L = 2^252 + 27742317777372353535851937790883648493
 */
const L =
  2n ** 252n +
  27742317777372353535851937790883648493n;

// ---------------- Helpers ----------------

const modL = (x: bigint) => ((x % L) + L) % L;

// H(R || A || m) → scalar
async function hashToScalar(bytes: Uint8Array): Promise<bigint> {
  const h = sha512(bytes);
  return modL(bytesToNumberLE(h));
}

// Encode point
const enc = (p: Point) => p.toBytes();

// ---------------- Types ------------------
export type PartialSig = {
  Ri: Uint8Array; // encoded R_i
  si: string;    // scalar as decimal string
};

export type CombinedSig = {
  R: Uint8Array;
  s: Uint8Array; // 32-byte LE scalar
};

// ---------------- Threshold EdDSA (2-of-2 MVP) ----------------
//
// x = x1 + x2 (mod L)
// R = R1 + R2
// s = s1 + s2 (mod L)
//
// si = ri + c·xi
// c  = H(R || A || m)
//

// ---------------- Party-side ----------------

export async function partialSignWithChallenge(
  challenge: bigint,
  keyShareScalar: bigint,
  nonceScalar: bigint
): Promise<PartialSig> {
  const Ri = Point.BASE.multiply(nonceScalar);
  const si = modL(nonceScalar + challenge * keyShareScalar);

  return {
    Ri: enc(Ri),
    si: si.toString(),
  };
}

// ---------------- Backend-side ----------------

export async function combinePartialsEd25519(
  message: Uint8Array,
  publicKey: Uint8Array,
  partials: PartialSig[]
): Promise<CombinedSig> {
  if (partials.length !== 2) {
    throw new Error("MVP supports exactly 2-of-2 threshold");
  }

  // R = R1 + R2
  let R = Point.ZERO;
  for (const p of partials) {
    R = R.add(Point.fromHex(Buffer.from(p.Ri).toString("hex")));
  }

  // c = H(R || A || m)
  const c = await hashToScalar(
    new Uint8Array([...enc(R), ...publicKey, ...message])
  );

  // s = s1 + s2 mod L
  let s = 0n;
  for (const p of partials) {
    s = modL(s + BigInt(p.si));
  }

  return {
    R: enc(R),
    s: numberToBytesLE(s, 32),
  };
}