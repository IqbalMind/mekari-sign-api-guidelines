# Real Document Example: Memorandum of Understanding (MoU)

This directory contains a complete, verified real-world document integration example for **Mekari Sign Global e-Signature** (`POST /v2/esign-hmac/v1/documents/request_global_sign`).

---

## 📄 Document Specifications

- **File**: [`Memorandum of Understanding - Mekari Sign API Integration.pdf`](./Memorandum%20of%20Understanding%20-%20Mekari%20Sign%20API%20Integration.pdf)
- **Pages**: 4 Pages
- **Target Signing Page**: **Page 4** (Signature Block Section)
- **Webhook Callback**: `https://code.iqbalmind.id/testing/esign/webhook`

---

## 👥 Signers & Annotation Coordinates (Page 4)

| Parameter | Signer 1 (First Party) | Signer 2 (Second Party) |
|---|---|---|
| **Name** | Muhamad Iqbal Nurmanditya | Muhammad Ilham Novarianto |
| **Email** | `iqbalmuhamad512@gmail.com` | `creativeunicode@gmail.com` |
| **Order / Sequence** | `1` | `2` |
| **Page** | `4` | `4` |
| **Position X** | `61` | `60` |
| **Position Y** | `121` | `267` |
| **Element Width** | `114.29577464788733` | `114.29577464788733` |
| **Element Height** | `50.79819458517264` | `50.79819458517264` |
| **Canvas Width** | `541` | `541` |
| **Canvas Height** | `700.1171875` | `700.1171875` |
| **Signature Types** | `font`, `draw`, `image`, `qr_code` | `font`, `draw`, `image`, `qr_code` |
| **Transparent Background** | `true` | `true` |

---

## 📦 Payload Structure

```json
{
  "doc": "<BASE64_PDF_STRING>",
  "filename": "Memorandum of Understanding - Mekari Sign API Integration.pdf",
  "signers": [
    {
      "name": "Muhamad Iqbal Nurmanditya",
      "email": "iqbalmuhamad512@gmail.com",
      "order": 1,
      "requires_otp": false,
      "annotations": [
        {
          "page": 4,
          "position_x": 61,
          "position_y": 121,
          "canvas_width": 541,
          "canvas_height": 700.1171875,
          "element_width": 114.29577464788733,
          "element_height": 50.79819458517264,
          "type_of": "signature",
          "all_pages": false,
          "value": "",
          "font_size": 12,
          "date_format": 0,
          "sequence": 1,
          "linked_sequence": null,
          "meterai_provided": false,
          "custom_field": null,
          "signature_type": [
            "font",
            "draw",
            "image",
            "qr_code"
          ],
          "is_background_transparent": true,
          "is_lock_content": false
        }
      ]
    },
    {
      "name": "Muhammad Ilham Novarianto",
      "email": "creativeunicode@gmail.com",
      "order": 2,
      "requires_otp": false,
      "annotations": [
        {
          "page": 4,
          "position_x": 60,
          "position_y": 267,
          "canvas_width": 541,
          "canvas_height": 700.1171875,
          "element_width": 114.29577464788733,
          "element_height": 50.79819458517264,
          "type_of": "signature",
          "all_pages": false,
          "value": "",
          "font_size": 12,
          "date_format": 0,
          "sequence": 2,
          "linked_sequence": null,
          "meterai_provided": false,
          "custom_field": null,
          "signature_type": [
            "font",
            "draw",
            "image",
            "qr_code"
          ],
          "is_background_transparent": true,
          "is_lock_content": false
        }
      ]
    }
  ],
  "signing_order": false,
  "callback_url": "https://code.iqbalmind.id/testing/esign/webhook",
  "is_signature_without_frame": false
}
```

The full ready-to-use JSON payload with the actual Base64 string is located at:
[`request_payload.json`](./request_payload.json)

---

## 🚀 Running the Example

To send this real document to Mekari Sign API Sandbox or Production:

```bash
export SIGN_CLIENT_ID="your_client_id"
export SIGN_CLIENT_SECRET="your_client_secret"
export SIGN_BASE_URL="https://sandbox-api.mekari.com" # or https://api.mekari.com

node send_mou_example.js
```
