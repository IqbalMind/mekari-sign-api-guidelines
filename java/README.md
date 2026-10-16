# Mekari Sign API - Java Implementation

Zero-dependency Java 11+ implementation of **HMAC-SHA256 authentication** for the **Mekari Sign API (e-Sign & e-Meterai)** using `java.net.http.HttpClient`.

---

## 📋 Requirements
- Java 11+ (zero external dependencies)

---

## 🚀 Quick Start

1. Compile and run:
   ```bash
   javac Example.java
   export SIGN_CLIENT_ID="your_client_id"
   export SIGN_CLIENT_SECRET="your_client_secret"
   export SIGN_BASE_URL="https://sandbox-api.mekari.com" # or https://api.mekari.com

   java com.mekari.sign.example.Example
   ```

---

## 🔐 HMAC Signing Details

```java
String dateString = ZonedDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.RFC_1123_DATE_TIME);
String requestLine = String.format("%s %s HTTP/1.1", method.toUpperCase(), pathWithQuery);
String signingPayload = String.format("date: %s\n%s", dateString, requestLine);

Mac mac = Mac.getInstance("HmacSHA256");
SecretKeySpec secretKey = new SecretKeySpec(clientSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
mac.init(secretKey);
byte[] rawHmac = mac.doFinal(signingPayload.getBytes(StandardCharsets.UTF_8));
String signature = Base64.getEncoder().encodeToString(rawHmac);

String authHeader = String.format(
    "hmac username=\"%s\", algorithm=\"hmac-sha256\", headers=\"date request-line\", signature=\"%s\"",
    clientId, signature
);
```
