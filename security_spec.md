# Security Spec

## Data Invariants
1. A motorcycle (Moto) can only be created, updated, or deleted by an Admin.
2. A user can only modify their own profile, and cannot modify their `role`.
3. An accessory (Acessorio) can only be modified by an Admin.
4. Accessory sales (AcessorioSale) can be created by anyone (public checkout), but can only be read, updated, or deleted by an Admin.
5. Motorcycle sales (Sale) and purchases (Purchase) are strictly admin-only.
6. Settings (AcessoriosConfig) are publicly readable but admin-only writable.

## The "Dirty Dozen" Payloads
1. User creates profile but sets `role: 'admin'`. (Role Spoofing)
2. User updates profile and changes `role: 'admin'`. (Privilege Escalation)
3. Anonymous user tries to delete a Moto. (Unauthorized Delete)
4. Anonymous user creates AcessorioSale with `valorTotal: -100`. (Value Poisoning)
5. Non-admin reads the `sales` collection. (Data Leak)
6. Non-admin reads the `users` collection. (PII Leak)
7. User updates Moto. (Unauthorized Update)
8. Admin updates Moto with `precoAVista: "free"`. (Schema Violation)
9. Anonymous user creates an AcessorioSale with ghost fields. (Shadow Update)
10. System user modifies `uid` on their profile. (Identity Spoofing)
11. User sets string > 10KB inside a AcessorioSale payload. (Denial of Wallet)
12. Unauthenticated user tries to get a Purchase record. (Data Leak)

## The Test Runner
See `firestore.rules.test.ts` for the implementation of these tests.
