Shared–Custodial MPC Wallet on Hedera :
Objective :
This project implements a 2-of-3 Shared-Custody Wallet using Multiparty Computation (MPC) on the
Hedera testnet.Three independent parties : Client, Wealth Manager, and Custody System - jointly control
digital assets without ever creating or storing a full private keyThe system produces standard Hedera
Ed25519-compatible signatures, meaning all cryptographic operations happen off-chain, while the
blockchain sees a normal transaction.
System Functionality :
Threshold Signing (2-of-3) :
Any two parties can jointly sign a Hedera transaction.
Example: Client + Wealth Manager
Steps:
1.Custody backend sends a signing request to the required parties.
2.Both parties use their local MPC signing agent to generate signing contributions.
3.Their partial signatures are combined into one valid Hedera Ed25519 signature.
4.The Custody System attaches this signature to the transaction and submits it to Hedera.
Distributed Key Generation (DKG) :
•Instead of generating one private key, the system generates three key shares, one for each party.
•A collaborative key-generation protocol ensures:
•Each party only knows its own share.
•No full private key exists anywhere.
•The combined public key matches a standard Hedera account.
Key Point : Together, Distributed Key Generation and 2-of-3 Threshold Signing create a wallet where the
private key never exists in full, yet any authorized subset of parties can jointly produce a standard Hedera
signature - making the system both unbreakable by any single actor and indistinguishable from normal on-
chain signing.
System Architecture :
Frontends (Client & Wealth Manager) :
•React Framework- applications
•User authentication + 2FA
•Secure enclave access for local key shard
•UI for transaction creation, approvals, policy management, recovery setup
Backend (Custody System) :
•Node.js service
•REST + WebSocket APIs
•Policy engine (smart contracts)
•MPC session router (server-side relay for message passing)
•Hedera SDK integration
•Mirror Node listener for confirmations
MPC Signing Agents :
•One agent runs per party (Client, Wealth Manager, Custody).
•Responsible for:
•Key share storage
•Participating in DKG
•Computing signing contributions
•Generating proofs and verifying messages
•Implemented in Rust (core MPC logic) with WebAssembly bindings for frontend use.
Database & Storage :
•PostgreSQL for metadata (users, transactions, policies, recovery data).
•Redis for caching and MPC session state.
•Vault/KMS/HSM for shard encryption keys and secure random generation.
Recovery & Safety :
Distributed Recovery :
•Each key shard is stored encrypted and backed up through multiple recovery helpers.
•Recovery requires collaboration from trusted helpers plus one of the remaining key-holders.
•This prevents catastrophic key loss without exposing any secret material.
Security Guarantees :
•No single-party control: One compromised share cannot sign.
•No private key exposure: The private key never exists in RAM or storage.
•Chain-agnostic: Same MPC signature engine works across blockchains.
•High privacy: Signatures are indistinguishable from normal single-signer signatures.
Outcomes :
1. No Single Point of Failure
Because the private key is never generated or stored in full, no single person, device, or system
can compromise or control the wallet.
2. Standard Hedera-Compatible Signatures
Even though signing is done through MPC, the final result is a perfectly valid Ed25519 signature
identical to a normal Hedera wallet signature-full chain compatibility, no protocol changes.
3. Secure, Collaborative Control
Any 2-of-3 authorized parties (Client, Wealth Manager, Custody System) can jointly sign
transactions, enabling flexible governance, risk management, and operational continuity.
4. Strong Protection Against Key Loss
If a device or party becomes unavailable, the remaining parties can still sign; recovery is possible
without ever exposing secret material.
5. Operational Transparency With High Privacy
The blockchain sees only a normal signature, revealing nothing about the number of signers or the
fact MPC was used - maximizing confidentiality.
