/**
 * Mekari Sign API Integration Example (Node.js)
 * 
 * Demonstrates HMAC-SHA256 authentication for Mekari Sign:
 * 1. POST /v2/esign-hmac/v1/documents/request_global_sign (Global e-Signature Request)
 * 2. POST /v2/esign-hmac/v1/documents/stamp (e-Meterai / Digital Stamp)
 * 3. GET /v2/esign-hmac/v1/documents (List Documents)
 * 
 * Webhook Callback URL: https://code.iqbalmind.id/testing/esign/webhook
 */

const crypto = require('crypto');

// Configuration - Replace with credentials from Mekari Developer Center (MDC)
const CLIENT_ID = process.env.SIGN_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.SIGN_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
// Base URL for HMAC: https://sandbox-api.mekari.com (Sandbox) or https://api.mekari.com (Production)
const BASE_URL = process.env.SIGN_BASE_URL || 'https://sandbox-api.mekari.com';
const WEBHOOK_CALLBACK_URL = 'https://code.iqbalmind.id/testing/esign/webhook';

// Minimal valid 1-page sample PDF in Base64
const SAMPLE_BASE64_PDF = 'JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDM0Pj5zdHJlYW0KQVQgL1RleHQgMSBUZgoxMCAxMCBUZCAoVGVzdCkgVGoKRU5ECmVuZHN0cmVhbQplbmRvYmoK';

/**
 * Generate HMAC-SHA256 Authentication Headers for Mekari Sign
 * 
 * Format:
 * Date: <RFC 1123 / UTC Date> (e.g. Fri, 16 Oct 2026 14:15:00 GMT)
 * Request-Line: <METHOD> <PATH_WITH_QUERY> HTTP/1.1
 * Signing-String: "date: <Date>\n<Request-Line>"
 * Signature: Base64( HMAC-SHA256( Signing-String, ClientSecret ) )
 * Authorization: hmac username="<CLIENT_ID>", algorithm="hmac-sha256", headers="date request-line", signature="<SIGNATURE>"
 */
function generateHmacHeaders(method, pathWithQuery, clientId, clientSecret) {
    const dateString = new Date().toUTCString();
    const requestLine = `${method.toUpperCase()} ${pathWithQuery} HTTP/1.1`;
    const signingString = `date: ${dateString}\n${requestLine}`;

    const signature = crypto
        .createHmac('sha256', clientSecret)
        .update(signingString, 'utf8')
        .digest('base64');

    const authHeader = `hmac username="${clientId}", algorithm="hmac-sha256", headers="date request-line", signature="${signature}"`;

    return {
        'Authorization': authHeader,
        'Date': dateString,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
}

/**
 * HTTP Request Dispatcher
 */
async function sendRequest(method, pathWithQuery, payload = null) {
    const fullUrl = `${BASE_URL}${pathWithQuery}`;
    const headers = generateHmacHeaders(method, pathWithQuery, CLIENT_ID, CLIENT_SECRET);

    console.log("==================================================================");
    console.log(`[REQUEST] ${method.toUpperCase()} ${fullUrl}`);
    console.log("Headers:");
    console.log(JSON.stringify(headers, null, 2));

    const options = {
        method: method.toUpperCase(),
        headers: headers
    };

    if (payload && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        options.body = JSON.stringify(payload);
        console.log("Payload Preview:");
        // Print payload without flooding terminal with entire base64 string
        const preview = { ...payload };
        if (preview.doc) preview.doc = `${preview.doc.substring(0, 30)}... [base64 truncated]`;
        console.log(JSON.stringify(preview, null, 2));
    }

    try {
        const response = await fetch(fullUrl, options);
        const status = response.status;
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }

        if (response.ok) {
            console.log(`\n✅ Success! HTTP Status: ${status}`);
            console.log("Response Data:");
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.error(`\n❌ Error: HTTP Status ${status}`);
            console.error(typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
        }
        return data;
    } catch (err) {
        console.error("\n❌ Network / Client Error:", err.message);
    }
}

/**
 * CASE 1: Global Sign Request (Request Digital Signature)
 * Note: Use callback_url, NOT callback
 */
async function requestGlobalSign(filename = "Agreement_Contract.pdf") {
    const path = '/v2/esign-hmac/v1/documents/request_global_sign';

    const payload = {
        doc: SAMPLE_BASE64_PDF,
        filename: filename,
        signers: [
            {
                name: "Ahmad Fauzi",
                email: "ahmad.fauzi@example.com",
                phone_number: {
                    country_code: "62",
                    number: "+6281234567890"
                },
                requires_otp: false,
                annotations: [
                    {
                        type_of: "signature",
                        signature_type: "image",
                        page: 1,
                        position_x: 40,
                        position_y: 100,
                        element_width: 120,
                        element_height: 100,
                        canvas_width: 595,
                        canvas_height: 841,
                        auto_fields: [
                            "date_signed",
                            "name",
                            "email"
                        ]
                    }
                ],
                order: 1
            }
        ],
        callback_url: WEBHOOK_CALLBACK_URL, // Correct parameter name
        is_signature_without_frame: false,
        signing_order: false
    };

    console.log("\n--- Executing CASE 1: Request Global e-Signature ---");
    return await sendRequest('POST', path, payload);
}

/**
 * CASE 2: e-Meterai Stamping (Digital Stamp)
 */
async function stampEmeterai(filename = "Invoice_Meterai.pdf") {
    const path = '/v2/esign-hmac/v1/documents/stamp';

    const payload = {
        doc: SAMPLE_BASE64_PDF,
        filename: filename,
        annotations: [
            {
                page: 1,
                position_x: 100,
                position_y: 100,
                element_width: 80,
                element_height: 80,
                canvas_width: 595,
                canvas_height: 841,
                type_of: "meterai"
            }
        ],
        callback_url: WEBHOOK_CALLBACK_URL // Correct parameter name
    };

    console.log("\n--- Executing CASE 2: Stamp e-Meterai ---");
    return await sendRequest('POST', path, payload);
}

/**
 * CASE 3: Query Document List (GET with Query Parameters)
 */
async function getDocumentList(limit = 5, page = 1) {
    const path = `/v2/esign-hmac/v1/documents?page=${page}&limit=${limit}`;
    console.log(`\n--- Executing CASE 3: Get Document List (Page ${page}, Limit ${limit}) ---`);
    return await sendRequest('GET', path);
}

async function main() {
    console.log("==================================================================");
    console.log("Mekari Sign API Node.js HMAC-SHA256 Demonstration");
    console.log(`Base Gateway URL: ${BASE_URL}`);
    console.log(`Webhook Callback: ${WEBHOOK_CALLBACK_URL}`);
    console.log("==================================================================");

    // 1. Fetch document list
    await getDocumentList(3, 1);

    // 2. Request Global Sign
    await requestGlobalSign("Vendor_Agreement_2026.pdf");

    // 3. Stamp e-Meterai
    await stampEmeterai("Tax_Receipt_Meterai.pdf");
}

main();
