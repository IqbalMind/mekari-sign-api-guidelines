"""
Mekari Sign API Integration Example (Python)

Demonstrates HMAC-SHA256 authentication for Mekari Sign (e-Sign & e-Meterai):
1. POST /v2/esign-hmac/v1/documents/request_global_sign (Global e-Signature)
2. POST /v2/esign-hmac/v1/documents/stamp (e-Meterai Stamping)
3. GET /v2/esign-hmac/v1/documents (List Documents)

Webhook Callback URL: https://code.iqbalmind.id/testing/esign/webhook
"""

import os
import json
import hmac
import hashlib
import base64
from datetime import datetime, timezone
import urllib.request
import urllib.error

CLIENT_ID = os.environ.get("SIGN_CLIENT_ID", "YOUR_CLIENT_ID")
CLIENT_SECRET = os.environ.get("SIGN_CLIENT_SECRET", "YOUR_CLIENT_SECRET")
BASE_URL = os.environ.get("SIGN_BASE_URL", "https://sandbox-api.mekari.com")
WEBHOOK_CALLBACK_URL = "https://code.iqbalmind.id/testing/esign/webhook"

# 1-page sample dummy PDF in Base64
SAMPLE_BASE64_PDF = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDM0Pj5zdHJlYW0KQVQgL1RleHQgMSBUZgoxMCAxMCBUZCAoVGVzdCkgVGoKRU5ECmVuZHN0cmVhbQplbmRvYmoK"


def generate_hmac_headers(method: str, path_with_query: str, client_id: str, client_secret: str) -> dict:
    """Generate RFC 1123 Date and HMAC-SHA256 Authorization header."""
    now_utc = datetime.now(timezone.utc)
    date_string = now_utc.strftime("%a, %d %b %Y %H:%M:%S GMT")

    request_line = f"{method.upper()} {path_with_query} HTTP/1.1"
    signing_string = f"date: {date_string}\n{request_line}"

    digest = hmac.new(
        client_secret.encode("utf-8"),
        signing_string.encode("utf-8"),
        hashlib.sha256
    ).digest()

    signature = base64.b64encode(digest).decode("utf-8")

    auth_header = (
        f'hmac username="{client_id}", '
        f'algorithm="hmac-sha256", '
        f'headers="date request-line", '
        f'signature="{signature}"'
    )

    return {
        "Authorization": auth_header,
        "Date": date_string,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }


def send_request(method: str, path_with_query: str, payload: dict = None):
    """Generic HTTP Request sender using Python standard urllib."""
    full_url = f"{BASE_URL}{path_with_query}"
    headers = generate_hmac_headers(method, path_with_query, CLIENT_ID, CLIENT_SECRET)

    print("=" * 66)
    print(f"[REQUEST] {method.upper()} {full_url}")
    print("Headers:")
    print(json.dumps(headers, indent=2))

    data_bytes = None
    if payload and method.upper() in ["POST", "PUT", "PATCH"]:
        data_bytes = json.dumps(payload).encode("utf-8")
        preview = dict(payload)
        if "doc" in preview:
            preview["doc"] = f"{preview['doc'][:30]}... [base64 truncated]"
        print("Payload Preview:")
        print(json.dumps(preview, indent=2))

    req = urllib.request.Request(full_url, data=data_bytes, headers=headers, method=method.upper())

    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            body = resp.read().decode("utf-8")
            try:
                res_json = json.loads(body)
                print(f"\n✅ Success! HTTP {status}")
                print(json.dumps(res_json, indent=2))
                return res_json
            except Exception:
                print(f"\n✅ Success! HTTP {status}\n{body}")
                return body
    except urllib.error.HTTPError as e:
        status = e.code
        err_body = e.read().decode("utf-8")
        print(f"\n❌ API Error: HTTP {status}")
        try:
            print(json.dumps(json.loads(err_body), indent=2))
        except Exception:
            print(err_body)
    except Exception as e:
        print(f"\n❌ Request failed: {e}")


def request_global_sign(filename: str = "Agreement_Contract.pdf"):
    """CASE 1: Request Global e-Signature."""
    path = "/v2/esign-hmac/v1/documents/request_global_sign"
    payload = {
        "doc": SAMPLE_BASE64_PDF,
        "filename": filename,
        "signers": [
            {
                "name": "Ahmad Fauzi",
                "email": "ahmad.fauzi@example.com",
                "phone_number": {
                    "country_code": "62",
                    "number": "+6281234567890"
                },
                "requires_otp": False,
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
                        "auto_fields": [
                            "date_signed",
                            "name",
                            "email"
                        ]
                    }
                ],
                "order": 1
            }
        ],
        "callback_url": WEBHOOK_CALLBACK_URL,
        "is_signature_without_frame": False,
        "signing_order": False
    }
    print("\n--- Executing CASE 1: Request Global e-Signature ---")
    return send_request("POST", path, payload)


def stamp_emeterai(filename: str = "Invoice_Meterai.pdf"):
    """CASE 2: Stamp e-Meterai to Document."""
    path = "/v2/esign-hmac/v1/documents/stamp"
    payload = {
        "doc": SAMPLE_BASE64_PDF,
        "filename": filename,
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
        "callback_url": WEBHOOK_CALLBACK_URL
    }
    print("\n--- Executing CASE 2: Stamp e-Meterai ---")
    return send_request("POST", path, payload)


def get_documents(limit: int = 5, page: int = 1):
    """CASE 3: List Documents."""
    path = f"/v2/esign-hmac/v1/documents?page={page}&limit={limit}"
    print(f"\n--- Executing CASE 3: Get Document List (Page {page}, Limit {limit}) ---")
    return send_request("GET", path)


if __name__ == "__main__":
    print("Mekari Sign API Python Demonstration")
    print(f"Base URL: {BASE_URL}")
    print(f"Callback URL: {WEBHOOK_CALLBACK_URL}")

    get_documents(3, 1)
    request_global_sign("Partnership_Agreement.pdf")
    stamp_emeterai("Commercial_Invoice.pdf")
