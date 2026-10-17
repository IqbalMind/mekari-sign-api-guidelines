/**
 * Mekari Sign - Real Document Integration Example (MoU 2-Signer Flow)
 * 
 * Target: POST /v2/esign-hmac/v1/documents/request_global_sign
 * Document: Memorandum of Understanding - Mekari Sign API Integration.pdf
 * Signer 1: Muhamad Iqbal Nurmanditya (iqbalmuhamad512@gmail.com) -> Page 4 (x: 61, y: 121)
 * Signer 2: Muhammad Ilham Novarianto (creativeunicode@gmail.com) -> Page 4 (x: 60, y: 267)
 * Webhook: https://code.iqbalmind.id/testing/esign/webhook
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CLIENT_ID = process.env.SIGN_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.SIGN_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const BASE_URL = process.env.SIGN_BASE_URL || 'https://sandbox-api.mekari.com';

function generateHmacHeaders(method, pathWithQuery, clientId, clientSecret) {
    const dateString = new Date().toUTCString();
    const requestLine = `${method.toUpperCase()} ${pathWithQuery} HTTP/1.1`;
    const signingString = `date: ${dateString}\n${requestLine}`;

    const signature = crypto
        .createHmac('sha256', clientSecret)
        .update(signingString, 'utf8')
        .digest('base64');

    return {
        'Authorization': `hmac username="${clientId}", algorithm="hmac-sha256", headers="date request-line", signature="${signature}"`,
        'Date': dateString,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
}

async function sendMouSignRequest() {
    const payloadPath = path.join(__dirname, 'request_payload.json');
    const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

    const endpointPath = '/v2/esign-hmac/v1/documents/request_global_sign';
    const fullUrl = `${BASE_URL}${endpointPath}`;
    const headers = generateHmacHeaders('POST', endpointPath, CLIENT_ID, CLIENT_SECRET);

    console.log("==================================================================");
    console.log("Mekari Sign - Sending MoU Real Document Signature Request");
    console.log("==================================================================");
    console.log(`URL: ${fullUrl}`);
    console.log("Headers:");
    console.log(JSON.stringify(headers, null, 2));

    const preview = {
        ...payload,
        doc: `${payload.doc.substring(0, 35)}... [${payload.doc.length} characters Base64]`
    };
    console.log("\nPayload Preview:");
    console.log(JSON.stringify(preview, null, 2));

    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        const status = response.status;
        const text = await response.text();
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(text);
        } catch {
            jsonResponse = text;
        }

        console.log(`\nHTTP Status: ${status}`);
        console.log("Response:");
        console.log(typeof jsonResponse === 'object' ? JSON.stringify(jsonResponse, null, 2) : jsonResponse);
        return jsonResponse;
    } catch (err) {
        console.error("\n❌ Network / Dispatch Error:", err.message);
    }
}

sendMouSignRequest();
