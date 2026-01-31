use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use sha2::{Digest, Sha512};
use curve25519_dalek::{
    constants::ED25519_BASEPOINT_POINT,
    scalar::Scalar,
    edwards::EdwardsPoint,
};

/// ===============================
/// Utilities
/// ===============================

fn hash_to_scalar(bytes: &[u8]) -> Scalar {
    let hash = Sha512::digest(bytes);
    Scalar::from_bytes_mod_order_wide(&hash.into())
}

fn concat(parts: &[&[u8]]) -> Vec<u8> {
    let mut out = Vec::new();
    for p in parts {
        out.extend_from_slice(p);
    }
    out
}

/// ===============================
/// Data Structures (JS friendly)
/// ===============================

#[wasm_bindgen]
#[derive(Clone, Serialize, Deserialize)]
pub struct KeyShare {
    /// Secret scalar (xi)
    pub share: Vec<u8>,
}

#[wasm_bindgen]
#[derive(Clone, Serialize, Deserialize)]
pub struct NonceShare {
    /// Nonce scalar (ri)
    pub nonce: Vec<u8>,
    /// Ri = ri * G
    pub commitment: Vec<u8>,
}

#[wasm_bindgen]
#[derive(Clone, Serialize, Deserialize)]
pub struct PartialSignature {
    /// si = ri + c * xi
    pub s_i: Vec<u8>,
    /// Ri commitment
    pub R_i: Vec<u8>,
}

#[wasm_bindgen]
#[derive(Clone, Serialize, Deserialize)]
pub struct FinalSignature {
    /// R = sum(Ri)
    pub R: Vec<u8>,
    /// s = sum(si)
    pub s: Vec<u8>,
}

/// ===============================
/// MPC Core API (WASM exports)
/// ===============================

#[wasm_bindgen]
pub struct MpcCore;

#[wasm_bindgen]
impl MpcCore {

    /// Generate a random key share (xi)
    #[wasm_bindgen]
    pub fn generate_key_share() -> KeyShare {
        let mut rng = rand::thread_rng();
        let scalar = Scalar::random(&mut rng);

        KeyShare {
            share: scalar.to_bytes().to_vec(),
        }
    }

    /// Generate nonce share (ri, Ri)
    #[wasm_bindgen]
    pub fn generate_nonce_share() -> NonceShare {
        let mut rng = rand::thread_rng();
        let ri = Scalar::random(&mut rng);
        let Ri = &ri * &ED25519_BASEPOINT_POINT;

        NonceShare {
            nonce: ri.to_bytes().to_vec(),
            commitment: Ri.compress().to_bytes().to_vec(),
        }
    }

    /// Compute challenge c = H(R || A || message)
    #[wasm_bindgen]
    pub fn compute_challenge(
        R: Vec<u8>,
        public_key: Vec<u8>,
        message: Vec<u8>,
    ) -> Vec<u8> {
        let bytes = concat(&[&R, &public_key, &message]);
        let c = hash_to_scalar(&bytes);
        c.to_bytes().to_vec()
    }

    /// Compute partial signature si = ri + c * xi
    #[wasm_bindgen]
    pub fn partial_sign(
        key_share: &KeyShare,
        nonce_share: &NonceShare,
        challenge: Vec<u8>,
    ) -> PartialSignature {
        let xi = Scalar::from_bytes_mod_order(
            key_share.share.as_slice().try_into().unwrap()
        );
        let ri = Scalar::from_bytes_mod_order(
            nonce_share.nonce.as_slice().try_into().unwrap()
        );
        let c = Scalar::from_bytes_mod_order(
            challenge.as_slice().try_into().unwrap()
        );

        let si = ri + c * xi;

        PartialSignature {
            s_i: si.to_bytes().to_vec(),
            R_i: nonce_share.commitment.clone(),
        }
    }

    /// Combine partial signatures into final signature
    /// Threshold: any 2 of 3 valid partials
    #[wasm_bindgen]
    pub fn combine_signatures(
        partials: Vec<JsValue>,
    ) -> FinalSignature {
        let mut R = EdwardsPoint::identity();
        let mut s = Scalar::zero();

        for js in partials {
            let p: PartialSignature = js.into_serde().unwrap();

            let Ri = EdwardsPoint::from_bytes(
                p.R_i.as_slice().try_into().unwrap()
            ).unwrap();

            let si = Scalar::from_bytes_mod_order(
                p.s_i.as_slice().try_into().unwrap()
            );

            R = R + Ri;
            s = s + si;
        }

        FinalSignature {
            R: R.compress().to_bytes().to_vec(),
            s: s.to_bytes().to_vec(),
        }
    }
}