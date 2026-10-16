# Mekari Sign API - PHP Implementation

Zero-dependency PHP implementation of **HMAC-SHA256 authentication** for the **Mekari Sign API (e-Sign & e-Meterai)**.

---

## 📋 Requirements
- PHP 7.4+ or 8.x with `curl` and `hash` extensions enabled

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
   php example.php
   ```

---

## 🔐 HMAC Signing Details

```php
$dateString = gmdate('D, d M Y H:i:s T');
$requestLine = strtoupper($method) . ' ' . $pathWithQuery . ' HTTP/1.1';
$signingString = "date: {$dateString}\n{$requestLine}";

$rawHash = hash_hmac('sha256', $signingString, $clientSecret, true);
$signature = base64_encode($rawHash);

$authHeader = "hmac username=\"{$clientId}\", algorithm=\"hmac-sha256\", headers=\"date request-line\", signature=\"{$signature}\"";
```
