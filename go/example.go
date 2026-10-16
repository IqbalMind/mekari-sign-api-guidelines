package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

var (
	clientID            = getEnv("SIGN_CLIENT_ID", "YOUR_CLIENT_ID")
	clientSecret        = getEnv("SIGN_CLIENT_SECRET", "YOUR_CLIENT_SECRET")
	baseURL             = getEnv("SIGN_BASE_URL", "https://sandbox-api.mekari.com")
	webhookCallbackURL = "https://code.iqbalmind.id/testing/esign/webhook"
)

const sampleBase64PDF = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDM0Pj5zdHJlYW0KQVQgL1RleHQgMSBUZgoxMCAxMCBUZCAoVGVzdCkgVGoKRU5ECmVuZHN0cmVhbQplbmRvYmoK"

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

// GenerateHmacHeaders generates standard HMAC-SHA256 headers for Mekari Sign API
func GenerateHmacHeaders(method, pathWithQuery, cID, cSecret string) map[string]string {
	// 1. UTC Date in RFC 1123 format (e.g. Fri, 16 Oct 2026 14:15:00 GMT)
	dateString := time.Now().UTC().Format(http.TimeFormat)

	// 2. Request line
	requestLine := fmt.Sprintf("%s %s HTTP/1.1", strings.ToUpper(method), pathWithQuery)

	// 3. Signing payload
	signingString := fmt.Sprintf("date: %s\n%s", dateString, requestLine)

	// 4. HMAC-SHA256 Base64 digest
	mac := hmac.New(sha256.New, []byte(cSecret))
	mac.Write([]byte(signingString))
	signature := base64.StdEncoding.EncodeToString(mac.Sum(nil))

	// 5. Authorization header
	authHeader := fmt.Sprintf(`hmac username="%s", algorithm="hmac-sha256", headers="date request-line", signature="%s"`, cID, signature)

	return map[string]string{
		"Authorization": authHeader,
		"Date":          dateString,
		"Content-Type":  "application/json",
		"Accept":        "application/json",
	}
}

func sendRequest(method, pathWithQuery string, payload interface{}) {
	fullURL := baseURL + pathWithQuery
	headers := GenerateHmacHeaders(method, pathWithQuery, clientID, clientSecret)

	fmt.Println("==================================================================")
	fmt.Printf("[REQUEST] %s %s\n", method, fullURL)
	fmt.Println("Headers:")
	for k, v := range headers {
		fmt.Printf("  %s: %s\n", k, v)
	}

	var reqBody io.Reader
	if payload != nil && (method == "POST" || method == "PUT" || method == "PATCH") {
		jsonBytes, _ := json.MarshalIndent(payload, "", "  ")
		fmt.Printf("Payload Preview:\n%s\n", string(jsonBytes))
		reqBody = bytes.NewBuffer(jsonBytes)
	}

	req, err := http.NewRequest(method, fullURL, reqBody)
	if err != nil {
		fmt.Printf("Error creating request: %v\n", err)
		return
	}

	for k, v := range headers {
		req.Header.Set(k, v)
	}

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("❌ Request failed: %v\n", err)
		return
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	fmt.Printf("\nHTTP Status: %d\n", resp.StatusCode)
	fmt.Printf("Response Body:\n%s\n", string(bodyBytes))
}

func requestGlobalSign(filename string) {
	path := "/v2/esign-hmac/v1/documents/request_global_sign"
	payload := map[string]interface{}{
		"doc":      sampleBase64PDF,
		"filename": filename,
		"signers": []map[string]interface{}{
			{
				"name":  "Ahmad Fauzi",
				"email": "ahmad.fauzi@example.com",
				"phone_number": map[string]string{
					"country_code": "62",
					"number":       "+6281234567890",
				},
				"requires_otp": false,
				"annotations": []map[string]interface{}{
					{
						"type_of":        "signature",
						"signature_type": "image",
						"page":           1,
						"position_x":     40,
						"position_y":     100,
						"element_width":  120,
						"element_height": 100,
						"canvas_width":   595,
						"canvas_height":  841,
						"auto_fields": []string{
							"date_signed",
							"name",
							"email",
						},
					},
				},
				"order": 1,
			},
		},
		"callback_url":               webhookCallbackURL,
		"is_signature_without_frame": false,
		"signing_order":              false,
	}

	fmt.Println("\n--- Executing CASE 1: Request Global e-Signature ---")
	sendRequest("POST", path, payload)
}

func stampEmeterai(filename string) {
	path := "/v2/esign-hmac/v1/documents/stamp"
	payload := map[string]interface{}{
		"doc":      sampleBase64PDF,
		"filename": filename,
		"annotations": []map[string]interface{}{
			{
				"page":           1,
				"position_x":     100,
				"position_y":     100,
				"element_width":  80,
				"element_height": 80,
				"canvas_width":   595,
				"canvas_height":  841,
				"type_of":        "meterai",
			},
		},
		"callback_url": webhookCallbackURL,
	}

	fmt.Println("\n--- Executing CASE 2: Stamp e-Meterai ---")
	sendRequest("POST", path, payload)
}

func getDocuments(limit, page int) {
	path := fmt.Sprintf("/v2/esign-hmac/v1/documents?page=%d&limit=%d", page, limit)
	fmt.Printf("\n--- Executing CASE 3: Get Document List (Page %d, Limit %d) ---\n", page, limit)
	sendRequest("GET", path, nil)
}

func main() {
	fmt.Println("Mekari Sign API Go Demonstration")
	fmt.Printf("Base URL: %s\n", baseURL)
	fmt.Printf("Webhook: %s\n", webhookCallbackURL)

	getDocuments(3, 1)
}
