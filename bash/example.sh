#!/usr/bin/env bash
# Mekari Sign API Integration Example (Bash / cURL)
#
# Demonstrates HMAC-SHA256 authentication using OpenSSL and cURL:
# 1. GET /v2/esign-hmac/v1/documents
# 2. POST /v2/esign-hmac/v1/documents/request_global_sign
# 3. POST /v2/esign-hmac/v1/documents/stamp
#
# Webhook Callback URL: https://code.iqbalmind.id/testing/esign/webhook

CLIENT_ID="${SIGN_CLIENT_ID:-YOUR_CLIENT_ID}"
CLIENT_SECRET="${SIGN_CLIENT_SECRET:-YOUR_CLIENT_SECRET}"
BASE_URL="${SIGN_BASE_URL:-https://sandbox-api.mekari.com}"
CALLBACK_URL="https://code.iqbalmind.id/testing/esign/webhook"

generate_and_send() {
    local method="$1"
    local path_with_query="$2"
    local payload="$3"

    # 1. Format date as RFC 1123 / UTC (e.g. Fri, 16 Oct 2026 14:15:00 GMT)
    local date_string
    date_string=$(LC_ALL=C TZ=GMT date '+%a, %d %b %Y %H:%M:%S GMT')

    # 2. Build Request Line
    local request_line="${method} ${path_with_query} HTTP/1.1"

    # 3. Build Signing Payload
    local signing_string="date: ${date_string}\n${request_line}"

    # 4. Generate HMAC-SHA256 Base64 digest via OpenSSL
    local signature
    signature=$(printf "%b" "$signing_string" | openssl dgst -sha256 -hmac "$CLIENT_SECRET" -binary | openssl base64)

    # 5. Build Authorization Header
    local auth_header="hmac username=\"${CLIENT_ID}\", algorithm=\"hmac-sha256\", headers=\"date request-line\", signature=\"${signature}\""

    echo "=================================================================="
    echo "[REQUEST] ${method} ${BASE_URL}${path_with_query}"
    echo "Authorization: ${auth_header}"
    echo "Date: ${date_string}"

    if [ -n "$payload" ]; then
        echo "Payload: (sent as JSON with callback_url: ${CALLBACK_URL})"
        curl -s -X "${method}" "${BASE_URL}${path_with_query}" \
            -H "Authorization: ${auth_header}" \
            -H "Date: ${date_string}" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            -d "${payload}"
    else
        curl -s -X "${method}" "${BASE_URL}${path_with_query}" \
            -H "Authorization: ${auth_header}" \
            -H "Date: ${date_string}" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json"
    fi
    echo -e "\n"
}

echo "Mekari Sign API Bash / cURL Demonstration"
echo "Base Gateway URL: ${BASE_URL}"
echo "Callback Webhook: ${CALLBACK_URL}"
echo ""

# Case 1: Fetch Document List
echo "--- Case 1: List Documents ---"
generate_and_send "GET" "/v2/esign-hmac/v1/documents?page=1&limit=3" ""
