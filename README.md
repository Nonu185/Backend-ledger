# Backend Ledger API

A Node.js, Express, and MongoDB double-entry-style financial ledger backend. Instead of storing a mutable balance field on accounts, balances are dynamically calculated from immutable `CREDIT` and `DEBIT` ledger entries using atomic MongoDB transactions and idempotency keys.

---

## Core Features

1. **User Authentication & JWT:** User signup and login with `bcryptjs` password hashing and HTTP-only cookie / Bearer JWT authentication.
2. **Logout & Role-Based Access Control:** Token blacklisting on logout plus separate middlewares for regular users and system users (`systemUser`).
3. **Account Management:** Create and manage accounts with `ACTIVE`, `FROZEN`, or `CLOSED` status and currency support (`INR` default).
4. **Account & Balance Lookup:** Fetch user account details and live balances securely with ownership checks.
5. **Dynamic Balance Calculation:** Computes live account balance on demand via MongoDB aggregation (`totalCredit - totalDebit`).
6. **Immutable Double-Entry Ledger:** Every transfer writes immutable `CREDIT` and `DEBIT` ledger entries linked to accounts and transactions.
7. **System Funding & User Transfers:** System users can fund initial balances, and users can transfer funds with ownership, status, and balance checks.
8. **Idempotency & Atomic MongoDB Sessions:** Prevents duplicate transfers on retries (`idempotencyKey`) and wraps debit, credit, and status updates in all-or-nothing MongoDB sessions.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose (Replica Set required for multi-document transactions)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cookie-parser`

---

## Project Structure

```text
backend-ledger/
├── server.js                         # Entry point: loads env, connects DB, starts server
├── .env                              # Environment variables (PORT, MONGODB_URI, JWT_SECRET)
└── src/
    ├── app.js                        # Express app setup, middlewares, /health, and route mounting
    ├── config/
    │   └── db.js                     # MongoDB connection setup
    ├── middlewear/
    │   └── auth.middlewear.js        # JWT verification & systemUser role check
    ├── models/
    │   ├── user.model.js             # User schema, password hashing & comparison
    │   ├── account.model.js          # Account schema & dynamic getBalance() aggregation
    │   ├── transaction.model.js      # Transaction schema with status & idempotencyKey
    │   ├── ledger.model.js           # Immutable CREDIT / DEBIT ledger entries
    │   └── tokenBlacklist.model.js   # Revoked JWT tokens with TTL auto-expiry
    ├── controllers/
    │   ├── auth.controller.js        # Register, login, and logout handlers
    │   ├── account.controller.js     # Create account, get account, and get balance handlers
    │   └── transaction.controller.js # User transfer & system initial funding handlers
    └── routes/
        ├── auth.route.js             # /api/auth routes
        ├── account.route.js          # /api/account routes
        └── transaction.routes.js     # /api/transaction routes