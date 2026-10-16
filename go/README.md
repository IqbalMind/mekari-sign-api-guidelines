# Mekari Sign API - Go Implementation

Zero-dependency Go implementation of **HMAC-SHA256 authentication** for the **Mekari Sign API (e-Sign & e-Meterai)**.

---

## 📋 Requirements
- Go 1.20+ (standard library only)

---

## 🚀 Quick Start

1. Set your credentials:
   ```bash
   export SIGN_CLIENT_ID="your_client_id"
   export SIGN_CLIENT_SECRET="your_client_secret"
   export SIGN_BASE_URL="https://sandbox-api.mekari.com" # or https://api.mekari.com
   ```

2. Run the code:
   ```bash
   go run example.go
   ```

---

## 🔐 HMAC Signing Details

```go
dateString := time.Now().UTC().Format(http.TimeFormat)
requestLine := fmt.Sprintf("%s %s HTTP/1.1", strings.ToUpper(method), pathWithQuery)
signingString := fmt.Sprintf("date: %s\n%s", dateString, requestLine)

mac := hmac.New(sha256.New, []byte(clientSecret))
mac.Write([]byte(signingString))
signature := base64.StdEncoding.EncodeToString(mac.Sum(nil))

authHeader := fmt.Sprintf(`hmac username="%s", algorithm="hmac-sha256", headers="date request-line", signature="%s"`, clientID, signature)
```
