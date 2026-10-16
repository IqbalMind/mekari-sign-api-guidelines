# Mekari Sign API - Postman Collection Guide

This directory contains the complete Postman collection and environment for integrating with the **Mekari Sign API (e-Sign & e-Meterai)** using **HMAC-SHA256 authentication**.

---

## 📁 Files in This Directory

| File | Description |
|---|---|
| [`Mekari_Sign_API.postman_collection.json`](./Mekari_Sign_API.postman_collection.json) | Full API collection (Global Sign, e-Meterai Stamping, Verification, Auto Sign, Templates, Folders) |
| [`Mekari_Sign_Environment.postman_environment.json`](./Mekari_Sign_Environment.postman_environment.json) | Environment configuration with Base URL and credential variables |

---

## ⚙️ Automated HMAC Signing in Postman

The collection includes a pre-request script at the **Collection Level** (`event[prerequest]`), which automatically calculates the HMAC-SHA256 signature for every request:

```javascript
const Header = require('postman-collection').Header;
const url = require('url');

const hmac_username = pm.environment.get('hmac_username') || pm.collectionVariables.get('hmac_username');
const hmac_secret = pm.environment.get('hmac_secret') || pm.collectionVariables.get('hmac_secret');

const requestUrl = url.parse(request['url']);
const requestLine = pm.request.method + ' ' + requestUrl.path + ' HTTP/1.1';
const dateString = new Date().toUTCString();

const signingString = ['date: ' + dateString, requestLine].join('\n');
const digest = CryptoJS.HmacSHA256(signingString, hmac_secret);
const signature = CryptoJS.enc.Base64.stringify(digest);

const hmac_header = 'hmac username="' + hmac_username + '", algorithm="hmac-sha256", headers="date request-line", signature="' + signature + '"';

pm.request.headers.add(new Header("Authorization: " + hmac_header));
pm.request.headers.add(new Header("Date: " + dateString));
```

---

## 🔔 Webhook Callback Configuration

When creating signing requests or stamping e-Meterai, always specify **`callback_url`** in the payload:

```json
{
  "callback_url": "https://code.iqbalmind.id/testing/esign/webhook"
}
```
*(Do not use the deprecated `callback: false` boolean).*

---

## 🚀 Quick Start Guide

### 1. Import to Postman
1. Open **Postman**.
2. Click **Import** (top left).
3. Drag and drop:
   - `Mekari_Sign_API.postman_collection.json`
   - `Mekari_Sign_Environment.postman_environment.json`

### 2. Configure Environment Variables
1. Select the **"Mekari Sign API - Sandbox / Production"** environment.
2. Edit variables:
   - `base_url`: `https://sandbox-api.mekari.com/v2/esign-hmac/v1` (Sandbox) or `https://api.mekari.com/v2/esign-hmac/v1` (Production)
   - `hmac_username`: Your Client ID from [MDC](https://sandbox-developers.mekari.com)
   - `hmac_secret`: Your Client Secret from [MDC](https://sandbox-developers.mekari.com)
3. Click **Save**.

### 3. Send Requests
1. **Global Sign**: Under `V2 > Global - Request Sign`, provide base64 PDF in `doc`, set signer details, and click **Send**.
2. **e-Meterai Stamping**: Under `Stamping > Stamp eMeterai to the Document`, define coordinates and click **Send**.
