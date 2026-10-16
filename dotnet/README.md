# Mekari Sign API - .NET 8.0 Implementation

This directory provides a production-grade C# implementation of **HMAC-SHA256 authentication** for the **Mekari Sign API (e-Sign & e-Meterai)**, compatible with .NET 8.0 / .NET Core.

---

## 📋 Requirements
- .NET SDK 8.0+

---

## 🚀 Quick Start

1. Set your credentials:
   ```bash
   export SIGN_CLIENT_ID="your_client_id"
   export SIGN_CLIENT_SECRET="your_client_secret"
   export SIGN_BASE_URL="https://sandbox-api.mekari.com" # or https://api.mekari.com
   ```

2. Build and run:
   ```bash
   dotnet run
   ```

---

## 🔐 HMAC Signing Details

```csharp
string dateString = DateTimeOffset.UtcNow.ToString("r"); // RFC 1123
string requestLine = $"{method.ToUpperInvariant()} {pathWithQuery} HTTP/1.1";
string stringToSign = $"date: {dateString}\n{requestLine}";

using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(clientSecret));
byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(stringToSign));
string signature = Convert.ToBase64String(hash);

string authHeader = $"hmac username=\"{clientId}\", algorithm=\"hmac-sha256\", headers=\"date request-line\", signature=\"{signature}\"";
```
