<?php
/**
 * Mekari Sign API Integration Example (PHP)
 * 
 * Demonstrates HMAC-SHA256 authentication for Mekari Sign:
 * 1. POST /v2/esign-hmac/v1/documents/request_global_sign (Global e-Signature)
 * 2. POST /v2/esign-hmac/v1/documents/stamp (e-Meterai Stamping)
 * 3. GET /v2/esign-hmac/v1/documents (List Documents)
 * 
 * Webhook Callback URL: https://code.iqbalmind.id/testing/esign/webhook
 */

$clientId = getenv('SIGN_CLIENT_ID') ?: 'YOUR_CLIENT_ID';
$clientSecret = getenv('SIGN_CLIENT_SECRET') ?: 'YOUR_CLIENT_SECRET';
$baseUrl = getenv('SIGN_BASE_URL') ?: 'https://sandbox-api.mekari.com';
$callbackUrl = 'https://code.iqbalmind.id/testing/esign/webhook';

// Minimal 1-page sample dummy PDF in Base64
$sampleBase64Pdf = 'JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDM0Pj5zdHJlYW0KQVQgL1RleHQgMSBUZgoxMCAxMCBUZCAoVGVzdCkgVGoKRU5ECmVuZHN0cmVhbQplbmRvYmoK';

/**
 * Generate HMAC-SHA256 Authentication Headers for Mekari Sign
 */
function generateHmacHeaders($method, $pathWithQuery, $clientId, $clientSecret) {
    // 1. UTC Date in RFC 1123 format (e.g. Fri, 16 Oct 2026 14:15:00 GMT)
    $dateString = gmdate('D, d M Y H:i:s T');

    // 2. Request line
    $requestLine = strtoupper($method) . ' ' . $pathWithQuery . ' HTTP/1.1';

    // 3. Signing payload
    $signingString = "date: {$dateString}\n{$requestLine}";

    // 4. HMAC-SHA256 Base64 digest
    $rawHash = hash_hmac('sha256', $signingString, $clientSecret, true);
    $signature = base64_encode($rawHash);

    // 5. Authorization header
    $authHeader = "hmac username=\"{$clientId}\", algorithm=\"hmac-sha256\", headers=\"date request-line\", signature=\"{$signature}\"";

    return [
        "Authorization: {$authHeader}",
        "Date: {$dateString}",
        "Content-Type: application/json",
        "Accept: application/json"
    ];
}

/**
 * Send HTTP Request via cURL
 */
function sendRequest($method, $pathWithQuery, $payload = null) {
    global $baseUrl, $clientId, $clientSecret;

    $url = $baseUrl . $pathWithQuery;
    $headers = generateHmacHeaders($method, $pathWithQuery, $clientId, $clientSecret);

    echo "==================================================================\n";
    echo "[REQUEST] {$method} {$url}\n";
    echo "Headers:\n" . json_encode($headers, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    if (strtoupper($method) === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($payload !== null) {
            $jsonBody = json_encode($payload);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonBody);

            $preview = $payload;
            if (isset($preview['doc'])) {
                $preview['doc'] = substr($preview['doc'], 0, 30) . '... [base64 truncated]';
            }
            echo "Payload Preview:\n" . json_encode($preview, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
        }
    } elseif (strtoupper($method) !== 'GET') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    if (PHP_VERSION_ID < 80500) {
        curl_close($ch);
    }

    if ($curlError) {
        echo "\n❌ cURL Error: {$curlError}\n";
        return null;
    }

    echo "\nHTTP Status: {$httpCode}\n";
    echo "Response:\n{$response}\n";
    return json_decode($response, true);
}

// Case 1: Request Global e-Signature
function requestGlobalSign($filename = "Partnership_Agreement.pdf") {
    global $sampleBase64Pdf, $callbackUrl;
    $path = "/v2/esign-hmac/v1/documents/request_global_sign";
    $payload = [
        "doc" => $sampleBase64Pdf,
        "filename" => $filename,
        "signers" => [
            [
                "name" => "Ahmad Fauzi",
                "email" => "ahmad.fauzi@example.com",
                "phone_number" => [
                    "country_code" => "62",
                    "number" => "+6281234567890"
                ],
                "requires_otp" => false,
                "annotations" => [
                    [
                        "type_of" => "signature",
                        "signature_type" => "image",
                        "page" => 1,
                        "position_x" => 40,
                        "position_y" => 100,
                        "element_width" => 120,
                        "element_height" => 100,
                        "canvas_width" => 595,
                        "canvas_height" => 841,
                        "auto_fields" => [
                            "date_signed",
                            "name",
                            "email"
                        ]
                    ]
                ],
                "order" => 1
            ]
        ],
        "callback_url" => $callbackUrl,
        "is_signature_without_frame" => false,
        "signing_order" => false
    ];

    echo "\n--- Executing CASE 1: Request Global e-Signature ---\n";
    return sendRequest('POST', $path, $payload);
}

// Case 2: Stamp e-Meterai
function stampEmeterai($filename = "Invoice_Meterai.pdf") {
    global $sampleBase64Pdf, $callbackUrl;
    $path = "/v2/esign-hmac/v1/documents/stamp";
    $payload = [
        "doc" => $sampleBase64Pdf,
        "filename" => $filename,
        "annotations" => [
            [
                "page" => 1,
                "position_x" => 100,
                "position_y" => 100,
                "element_width" => 80,
                "element_height" => 80,
                "canvas_width" => 595,
                "canvas_height" => 841,
                "type_of" => "meterai"
            ]
        ],
        "callback_url" => $callbackUrl
    ];

    echo "\n--- Executing CASE 2: Stamp e-Meterai ---\n";
    return sendRequest('POST', $path, $payload);
}

// Case 3: List Documents
function getDocuments($limit = 3, $page = 1) {
    $path = "/v2/esign-hmac/v1/documents?page={$page}&limit={$limit}";
    echo "\n--- Executing CASE 3: Get Document List (Page {$page}, Limit {$limit}) ---\n";
    return sendRequest('GET', $path);
}

echo "Mekari Sign API PHP Demonstration\n";
echo "Base Gateway URL: {$baseUrl}\n";
echo "Webhook Callback: {$callbackUrl}\n";

getDocuments(3, 1);
?>
