# Mekari Sign API Guidelines & Enterprise Implementations

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Authentication: HMAC-SHA256](https://img.shields.io/badge/Auth-HMAC--SHA256-blue.svg)](#-hmac-authentication-specification)
[![Product: Mekari Sign](https://img.shields.io/badge/Product-Mekari%20Sign-indigo.svg)](https://mekarisign.com)
[![Features: e--Sign & e--Meterai](https://img.shields.io/badge/Features-e--Sign%20%7C%20e--Meterai-brightgreen.svg)](#-core-use-cases--endpoints)
[![Enterprise Ready](https://img.shields.io/badge/Enterprise-NetSuite%20%7C%20SAP%20B1%20%7C%20Oracle%20Fusion-purple.svg)](#-available-implementations)

This repository provides production-ready, verified integration guidelines, code examples, and enterprise ERP connectors for the **Mekari Sign API (e-Sign & e-Meterai)** using **HMAC-SHA256 authentication**.

Mekari Sign is a certified Indonesian digital signature (PSrE) and official Peruri e-Meterai distributor. While Mekari Sign also supports OAuth2.0 for client-facing apps, this guide focuses strictly on **HMAC-SHA256 Server-to-Server Authentication**, which is the recommended method for backend microservices, enterprise ERP systems (Oracle NetSuite, SAP Business One, Oracle Fusion), and automated document pipelines.

---

## 📖 Table of Contents
1. [Developer Portals & Base URLs](#-developer-portals--base-urls)
2. [How to Generate Credentials (MDC)](#-how-to-generate-credentials-in-mekari-developer-center-mdc)
3. [HMAC Authentication Specification](#-hmac-authentication-specification)
4. [Core Use Cases & Endpoints](#-core-use-cases--endpoints)
5. [Webhook Callback Best Practices](#-webhook-callback-best-practices)
6. [Permission Scopes Reference](#-permission-scopes-reference)
7. [Available Implementations](#-available-implementations)
8. [Postman Collection Guide](#-postman-collection-guide)
9. [Troubleshooting & Common Errors](#-troubleshooting--common-errors)
10. [Official References](#-official-references)
11. [License](#-license)

---

## 🌐 Developer Portals & Base URLs

All Mekari products share unified credential management in the Mekari Developer Center (MDC):

| Environment | Developer Center (MDC) | API Gateway Base URL (HMAC) | Web Portal |
|---|---|---|---|
| **Sandbox (Testing)** | [sandbox-developers.mekari.com](https://sandbox-developers.mekari.com) | `https://sandbox-api.mekari.com/v2/esign-hmac/v1` | [sandbox-app.mekarisign.com](https://sandbox-app.mekarisign.com) |
| **Production (Live)** | [developers.mekari.com](https://developers.mekari.com) | `https://api.mekari.com/v2/esign-hmac/v1` | [app.mekarisign.com](https://app.mekarisign.com) |

> 📌 **HMAC Routing Note**:  
> Notice that for HMAC authentication, the path prefix is `/v2/esign-hmac/v1/...` (unlike OAuth2 which routes under `/v2/esign/v1/...`).

---

## 🔑 How to Generate Credentials in Mekari Developer Center (MDC)

1. Log in to [MDC Sandbox](https://sandbox-developers.mekari.com) or [MDC Production](https://developers.mekari.com).
2. Go to **Applications** > click **Create Application**.
3. Fill in your **Application Name** and select **Mekari Sign**.
4. Check the required **Scopes** (e.g. `esign:read`, `esign:write`, `esign`).
5. Save the application and go to **Application Details > Credentials**.
6. Copy your **Client ID** (`hmac_username`) and **Client Secret** (`hmac_secret`).
7. ⚠️ *Keep your Client Secret secure — it is only displayed once upon generation.*

---

## 🔐 HMAC Authentication Specification

Mekari Sign requires cryptographic **HMAC-SHA256 request signing** for every HTTP transaction.

```http
POST /v2/esign-hmac/v1/documents/request_global_sign HTTP/1.1
Host: api.mekari.com
Date: Fri, 16 Oct 2026 14:15:00 GMT
Authorization: hmac username="<CLIENT_ID>", algorithm="hmac-sha256", headers="date request-line", signature="<SIGNATURE>"
Content-Type: application/json
Accept: application/json
```

### 1. Date Header (RFC 1123 / UTC)
The `Date` header must be in GMT/UTC formatted according to RFC 1123:
```
Fri, 16 Oct 2026 14:15:00 GMT
```
*Your server clock must be synchronized with NTP. Clock drift exceeding 5 minutes will result in `401 Unauthorized`.*

### 2. Request Line Construction
The request line must follow:
```
[METHOD] [PATH_WITH_QUERY] HTTP/1.1
```
*Examples:*
- `POST /v2/esign-hmac/v1/documents/request_global_sign HTTP/1.1`
- `POST /v2/esign-hmac/v1/documents/stamp HTTP/1.1`
- `GET /v2/esign-hmac/v1/documents?page=1&limit=10 HTTP/1.1`

> ⚠️ **Important**: When making `GET` requests with query parameters, include all query parameters in the request line.

### 3. Signing String Construction
Combine the Date header and request line separated by a newline (`\n`):
```text
date: Fri, 16 Oct 2026 14:15:00 GMT
POST /v2/esign-hmac/v1/documents/request_global_sign HTTP/1.1
```

### 4. Compute HMAC-SHA256 Signature
Compute the HMAC-SHA256 digest of the signing string using your `hmac_secret` (Client Secret) and Base64-encode it:
```text
signature = Base64( HMAC-SHA256( signingString, clientSecret ) )
```

### 5. Authorization Header Format
Combine into the standard header:
```text
hmac username="<CLIENT_ID>", algorithm="hmac-sha256", headers="date request-line", signature="<SIGNATURE>"
```

---

## ⚡ Core Use Cases & Endpoints

### 1. Global Sign Request (Digital Signature)
Request one or more parties to sign a document electronically with optional e-KYC or OTP verification:
- **Endpoint**: `POST /v2/esign-hmac/v1/documents/request_global_sign`
- **Payload Example**:
```json
{
  "doc": "<BASE64_ENCODED_PDF>",
  "filename": "Partnership_Contract.pdf",
  "signers": [
    {
      "name": "Budi Santoso",
      "email": "budi.santoso@example.com",
      "phone_number": {
        "country_code": "62",
        "number": "+6281234567890"
      },
      "requires_otp": false,
      "annotations": [
        {
          "type_of": "signature",
          "signature_type": "image",
          "page": 1,
          "position_x": 40,
          "position_y": 100,
          "element_width": 120,
          "element_height": 100,
          "canvas_width": 595,
          "canvas_height": 841,
          "auto_fields": ["date_signed", "name", "email"]
        }
      ],
      "order": 1
    }
  ],
  "callback_url": "https://code.iqbalmind.id/testing/esign/webhook",
  "is_signature_without_frame": false,
  "signing_order": false
}
```

### 2. e-Meterai Stamping (Digital Stamp)
Affix an official Peruri digital stamp (e-Meterai) to invoices or agreements (mandated for transactions > Rp 5,000,000):
- **Endpoint**: `POST /v2/esign-hmac/v1/documents/stamp`
- **Payload Example**:
```json
{
  "doc": "<BASE64_ENCODED_PDF>",
  "filename": "Commercial_Invoice_INV1001.pdf",
  "annotations": [
    {
      "page": 1,
      "position_x": 100,
      "position_y": 100,
      "element_width": 80,
      "element_height": 80,
      "canvas_width": 595,
      "canvas_height": 841,
      "type_of": "meterai"
    }
  ],
  "callback_url": "https://code.iqbalmind.id/testing/esign/webhook"
}
```

### 3. Document Lifecycle
| Action | Method | Path |
|---|---|---|
| **List Documents** | `GET` | `/v2/esign-hmac/v1/documents?page=1&limit=10` |
| **Document Details** | `GET` | `/v2/esign-hmac/v1/documents/:id` |
| **Download Signed PDF** | `GET` | `/v2/esign-hmac/v1/documents/:id/download` |
| **Void Document** | `POST` | `/v2/esign-hmac/v1/documents/:id/void` |
| **Resend Invitation** | `POST` | `/v2/esign-hmac/v1/documents/:id/resend` |

---

## 🔔 Webhook Callback Best Practices

> ⚠️ **Important Parameter Notice**:  
> In some older documentation examples, you might see `callback: false` or similar. **This is incorrect.**  
> The valid parameter accepted by the Mekari Sign API is **`callback_url`**:
> ```json
> {
>   "callback_url": "https://code.iqbalmind.id/testing/esign/webhook"
> }
> ```

When document status changes (e.g. `signed`, `completed`, `stamped`, `voided`), Mekari Sign dispatches an asynchronous HTTP POST to your webhook containing:
- `document_id`: Unique identifier of the document
- `signing_status`: `in_progress`, `completed`, etc.
- `stamping_status`: `success`, `failed`, etc.
- `doc_url`: Relative path to download the signed/stamped PDF

---

## 🛡️ Permission Scopes Reference

| Scope | Description |
|---|---|
| `esign:read` | Read document lists, statuses, audit trails, and download files |
| `esign:write` | Upload documents, request signatures, stamp e-Meterai, void documents |
| `esign` | Full administrative access to Mekari Sign API resources |

---

## 💻 Available Implementations

Explore ready-to-run examples and enterprise connectors:

| Directory | Language / Platform | Description | Zero External Deps? |
|---|---|---|:---:|
| [`postman/`](./postman) | Postman | Pre-configured collection with automated HMAC pre-request script | ✅ |
| [`nodejs/`](./nodejs) | Node.js (>= 18) | Native `crypto` and `fetch` implementation | ✅ |
| [`python/`](./python) | Python (3.8+) | Built-in `urllib.request`, `hmac`, `hashlib` | ✅ |
| [`php/`](./php) | PHP (7.4+, 8.x) | Native `curl` and `hash_hmac` | ✅ |
| [`go/`](./go) | Go (1.20+) | Native `crypto/hmac`, `crypto/sha256`, `net/http` | ✅ |
| [`bash/`](./bash) | Bash / cURL | Shell script using `openssl` and `curl` | ✅ |
| [`java/`](./java) | Java (11+) | Native `java.net.http.HttpClient` | ✅ |
| [`dotnet/`](./dotnet) | .NET 8.0 (C#) | Modern C# client with `HMACSHA256` and `HttpClient` | ✅ |
| [`netsuite/`](./netsuite) | Oracle NetSuite | SuiteScript 2.1 e-Sign & e-Meterai service & User Event script | ✅ |
| [`sap-business-one/`](./sap-business-one) | SAP Business One | C# Service Layer connector for e-Meterai stamping on A/R Invoices | ✅ |
| [`oracle-fusion/`](./oracle-fusion) | Oracle Fusion Cloud | Oracle Integration Cloud (OIC) HMAC signing library | ✅ |

---

## 📮 Postman Collection Guide

1. Open Postman and import [`postman/Mekari_Sign_API.postman_collection.json`](./postman/Mekari_Sign_API.postman_collection.json).
2. Import [`postman/Mekari_Sign_Environment.postman_environment.json`](./postman/Mekari_Sign_Environment.postman_environment.json).
3. Set your `hmac_username` (`SIGN_CLIENT_ID`) and `hmac_secret` (`SIGN_CLIENT_SECRET`).
4. Select `V2 > Global - Request Sign` or `Stamping > Stamp eMeterai` and click **Send**. The pre-request script computes the HMAC headers automatically.

---

## ❓ Troubleshooting & Common Errors

### 1. `401 Unauthorized` / Invalid Signature
- Verify that your URL starts with `/v2/esign-hmac/v1/...` for HMAC (not `/v2/esign/v1/...`).
- Ensure query parameters are included in the request line if present in the URL.
- Ensure the Date header is formatted as RFC 1123 UTC (e.g. `Fri, 16 Oct 2026 14:15:00 GMT`).

### 2. `401 Unauthorized` / Timestamp Out of Bounds
- Mekari API rejects requests where the `Date` header differs by more than 5 minutes from NTP time. Check server clock synchronization.

### 3. Webhook Not Receiving Events
- Ensure you used `callback_url` in the request body (not `callback: false`).
- Verify your webhook endpoint is publicly reachable and returns HTTP `200 OK`.

---

## 📚 Official References

- **Mekari Sign Postman Documentation**: [Mekari Sign API Documenter](https://documenter.getpostman.com/view/21582074/2s93K1oecc#intro)
- **Mekari Developer Center (Production)**: [developers.mekari.com](https://developers.mekari.com)
- **Mekari Developer Center (Sandbox)**: [sandbox-developers.mekari.com](https://sandbox-developers.mekari.com)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
