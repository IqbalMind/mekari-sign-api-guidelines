# Mekari Sign API - Node.js Implementation

Zero-dependency Node.js implementation of **HMAC-SHA256 authentication** for the **Mekari Sign API (e-Sign & e-Meterai)**.

---

## 📋 Requirements
- **Node.js** >= 18.0.0 (built-in `crypto` and `fetch`)

---

## 🚀 Quick Start

1. Set your credentials:
   ```bash
   export SIGN_CLIENT_ID="your_client_id"
   export SIGN_CLIENT_SECRET="your_client_secret"
   export SIGN_BASE_URL="https://sandbox-api.mekari.com" # or https://api.mekari.com
   ```

2. Run the script:
   ```bash
   node example.js
   ```

---

## 🔑 Key Endpoints & Parameters

- **Global Sign**: `POST /v2/esign-hmac/v1/documents/request_global_sign`
- **e-Meterai Stamping**: `POST /v2/esign-hmac/v1/documents/stamp`
- **Webhook Callback**: Use `callback_url` (`https://code.iqbalmind.id/testing/esign/webhook`).
