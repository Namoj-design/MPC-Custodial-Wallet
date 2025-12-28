import WebSocket from "ws";
import { Point } from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import {
  bytesToNumberLE,
} from "@noble/curves/abstract/utils";
import crypto from "crypto";

// ---------------- Constants ----------------

const WS_URL = "ws://localhost:3001";
const MESSAGE = new TextEncoder().encode("hello-mpc");

// Ed25519 curve order
const L =
  2n ** 252n +
  27742317777372353535851937790883648493n;

const modL = (x: bigint) => ((x % L) + L) % L;

// ---------------- Key Share (MVP) ----------------
// In MVP, each client randomly picks its own key share.
// Backend never sees this.

const keyShare: bigint = modL(
  bytesToNumberLE(crypto.randomBytes(32))
);

// Public key share A_i = x_i * G
const publicKeyShare = Point.BASE.multiply(keyShare);

// ---------------- Nonce ----------------

let nonce: bigint;
let Ri: Uint8Array;

// ---------------- WebSocket ----------------

const ws = new WebSocket(WS_URL);

ws.on("open", () => {
  console.log("[CLIENT] connected");

  ws.send(
    JSON.stringify({
      type: "join",
      sessionId: process.env.SESSION_ID,
      publicKey: publicKeyShare.toBytes(),
    })
  );
});

ws.on("message", async (raw) => {
  const msg = JSON.parse(raw.toString());
  console.log("[CLIENT] received:", msg);

  // After join → generate nonce
  if (msg.type === "joined") {
    nonce = modL(
      bytesToNumberLE(crypto.randomBytes(32))
    );
    const Rpoint = Point.BASE.multiply(nonce);
    Ri = Rpoint.toBytes();

    ws.send(
      JSON.stringify({
        type: "nonce",
        Ri,
        publicKey: publicKeyShare.toBytes(),
      })
    );

    console.log("[CLIENT] nonce sent");
  }

  // Receive challenge → compute partial signature
  if (msg.type === "challenge") {
    const c = BigInt(msg.c);

    const si = modL(nonce + c * keyShare);

    ws.send(
      JSON.stringify({
        type: "partialSig",
        sig: {
          Ri,
          si: si.toString(),
        },
        publicKey: publicKeyShare.toBytes(),
      })
    );

    console.log("[CLIENT] partial signature sent");
  }

  // Final signature received
  if (msg.type === "signature") {
    console.log("✅ FINAL SIGNATURE:");
    console.log(msg.signature);
  }
});