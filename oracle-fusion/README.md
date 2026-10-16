# Mekari Sign API - Oracle Fusion Cloud Integration

Patterns and utilities for integrating **Oracle Fusion Cloud (ERP Financials & Procurement)** with **Mekari Sign API** via **Oracle Integration Cloud (OIC)**.

---

## 📁 Files Included

| File | Description |
|---|---|
| [`oic_sign_hmac_generator.js`](./oic_sign_hmac_generator.js) | JavaScript action library for Oracle Integration Cloud (OIC) to compute HMAC-SHA256 headers before REST Adapter invocation. |

---

## 🏗️ Architecture in Oracle Integration Cloud (OIC)

```
[ Oracle Fusion Cloud ]
  (Procurement / Payables)
           │
           ▼
[ Oracle Integration Cloud (OIC) ]
   ├─ 1. JavaScript Function: oic_sign_hmac_generator.js
   ├─ 2. REST Adapter: Set Authorization & Date headers
   └─ 3. Set callback_url: https://code.iqbalmind.id/testing/esign/webhook
           │
           ▼ (HTTPS + HMAC-SHA256)
[ Mekari Sign API Gateway ]
   (https://api.mekari.com/v2/esign-hmac/v1)
```
