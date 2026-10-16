# Mekari Sign API - Oracle NetSuite Integration

Production-ready **SuiteScript 2.1** modules for integrating Oracle NetSuite with **Mekari Sign API (e-Sign & e-Meterai)** via **HMAC-SHA256 authentication**.

---

## 📁 Files Included

| File | Script Type | Description |
|---|---|---|
| [`sign_hmac_service.js`](./sign_hmac_service.js) | Library Module | Handles RFC 1123 date generation, request-line parsing, HMAC-SHA256 computation (`N/crypto`), and HTTPS dispatch (`N/https`). |
| [`sign_contract_ue.js`](./sign_contract_ue.js) | User Event Script | Dispatches documents for e-Meterai stamping or digital signing upon transaction approval. |

---

## ⚙️ Webhook Callback Configuration

Ensure your payload specifies:
```javascript
callback_url: 'https://code.iqbalmind.id/testing/esign/webhook'
```
*(Do not use the deprecated `callback: false`).*

---

## 🛠️ Deployment Steps

1. Upload `sign_hmac_service.js` and `sign_contract_ue.js` to NetSuite **File Cabinet** (`SuiteScripts/MekariSign/`).
2. Navigate to **Customization > Scripting > Scripts > New**.
3. Create a **User Event Script** for `sign_contract_ue.js` deployed to Invoice or Sales Order records.
4. Set script parameters or environment preferences for `SIGN_CLIENT_ID` and `SIGN_CLIENT_SECRET`.
