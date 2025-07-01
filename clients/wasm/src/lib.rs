// hash-wasm/src/lib.rs
use rayon::prelude::*;
use sha3::{Digest, Keccak256};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct HashMiner {
    challenge: Vec<u8>,
}

#[wasm_bindgen]
impl HashMiner {
    #[wasm_bindgen(constructor)]
    pub fn new(challenge: &[u8]) -> HashMiner {
        HashMiner {
            challenge: challenge.to_vec(),
        }
    }

    #[wasm_bindgen]
    pub fn mine_batch(&self, start_nonce: u64, batch_size: u32, target: u32) -> JsValue {
        let result = (0..batch_size)
            .into_par_iter()
            .map(|i| {
                let nonce = start_nonce + i as u64;
                let mut hasher = Keccak256::new();

                // First hash: keccak(challenge || nonce)
                hasher.update(&self.challenge);
                hasher.update(&nonce.to_le_bytes());
                let first_hash = hasher.finalize_reset();

                // Second hash: keccak(first_hash || nonce)
                hasher.update(&first_hash);
                hasher.update(&nonce.to_le_bytes());
                let final_hash = hasher.finalize();

                let lz = count_leading_zeros(&final_hash);
                (lz, nonce, final_hash.to_vec())
            })
            .find_any(|(lz, _, _)| *lz >= target);

        if let Some((lz, nonce, hash)) = result {
            return serde_wasm_bindgen::to_value(&HashResult {
                found: true,
                nonce,
                lz,
                hash,
            })
            .unwrap();
        }

        // If no result found, we still need to return something.
        // The original code returned the best effort.
        // A parallel search doesn't have a natural "best", so we'll just say not found.
        // Or, we could do a reduction to find the best, but that is more complex.
        // For now, let's return a "not found" result. The TS side handles this.
        let best_of_batch = (0..batch_size)
            .into_par_iter()
            .map(|i| {
                let nonce = start_nonce + i as u64;
                let mut hasher = Keccak256::new();
                hasher.update(&self.challenge);
                hasher.update(&nonce.to_le_bytes());
                let first_hash = hasher.finalize_reset();
                hasher.update(&first_hash);
                hasher.update(&nonce.to_le_bytes());
                let final_hash = hasher.finalize();
                let lz = count_leading_zeros(&final_hash);
                (lz, nonce, final_hash.to_vec())
            })
            .reduce(
                || (0, start_nonce, vec![0u8; 32]),
                |a, b| if a.0 >= b.0 { a } else { b },
            );

        serde_wasm_bindgen::to_value(&HashResult {
            found: false,
            nonce: best_of_batch.1,
            lz: best_of_batch.0,
            hash: best_of_batch.2,
        })
        .unwrap()
    }
}

fn count_leading_zeros(hash: &[u8]) -> u32 {
    let mut count = 0;
    for &byte in hash {
        if byte == 0 {
            count += 8;
        } else {
            count += byte.leading_zeros();
            break;
        }
    }
    count
}

#[derive(serde::Serialize)]
struct HashResult {
    found: bool,
    nonce: u64,
    lz: u32,
    hash: Vec<u8>,
}
