# Mekari Sign API - SAP Business One Integration

Integration architecture for automating **e-Meterai Stamping** and **Digital Signing** directly from **SAP Business One (B1)** via **Service Layer (REST)** or **DI Server**.

---

## 📁 Files Included

| File | Type | Description |
|---|---|---|
| [`SapB1SignService.cs`](./SapB1SignService.cs) | C# Service | Implements HMAC-SHA256 authentication and dispatches documents to Mekari Sign with `callback_url`. |

---

## 🔄 Integration Highlights

1. **Law Compliance (UU No. 10/2020 Bea Meterai)**:
   Invoices exceeding Rp 5,000,000 in SAP B1 (`OINV`) are automatically sent to Mekari Sign (`POST /v2/esign-hmac/v1/documents/stamp`).
2. **Webhook Callback**:
   Configured to `https://code.iqbalmind.id/testing/esign/webhook` to receive real-time stamp verification events.
