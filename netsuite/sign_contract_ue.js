/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 *
 * Mekari Sign - NetSuite Invoice & Contract e-Signing / e-Meterai Dispatcher
 * Automatically triggers e-Meterai or digital signature request upon transaction approval.
 */
define(['N/record', 'N/file', 'N/encode', 'N/log', './sign_hmac_service'], (record, file, encode, log, signService) => {

    const CONFIG = {
        baseUrl: 'https://sandbox-api.mekari.com',
        clientId: 'YOUR_CLIENT_ID',
        clientSecret: 'YOUR_CLIENT_SECRET',
        callbackUrl: 'https://code.iqbalmind.id/testing/esign/webhook'
    };

    function afterSubmit(context) {
        if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT) {
            return;
        }

        const newRec = context.newRecord;
        const total = parseFloat(newRec.getValue({ fieldId: 'total' }) || 0);

        // UU Bea Meterai: Transactions > Rp 5,000,000 require e-Meterai
        const requiresMeterai = total >= 5000000;
        log.audit('Mekari Sign', `Transaction ID: ${newRec.id}, Total: ${total}, Requires Meterai: ${requiresMeterai}`);

        try {
            // Sample payload structure sent to Mekari Sign
            const payload = {
                doc: "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDM0Pj5zdHJlYW0KQVQgL1RleHQgMSBUZgoxMCAxMCBUZCAoVGVzdCkgVGoKRU5ECmVuZHN0cmVhbQplbmRvYmoK",
                filename: `Invoice_${newRec.id}.pdf`,
                annotations: [
                    {
                        page: 1,
                        position_x: 100,
                        position_y: 100,
                        element_width: 80,
                        element_height: 80,
                        canvas_width: 595,
                        canvas_height: 841,
                        type_of: requiresMeterai ? "meterai" : "signature"
                    }
                ],
                callback_url: CONFIG.callbackUrl // Uses callback_url
            };

            const path = requiresMeterai 
                ? '/v2/esign-hmac/v1/documents/stamp'
                : '/v2/esign-hmac/v1/documents/request_global_sign';

            const response = signService.sendRequest({
                baseUrl: CONFIG.baseUrl,
                method: 'POST',
                pathWithQuery: path,
                clientId: CONFIG.clientId,
                clientSecret: CONFIG.clientSecret,
                body: JSON.stringify(payload)
            });

            log.audit('Mekari Sign Response', `Status: ${response.code}, Body: ${response.body}`);

        } catch (e) {
            log.error('Mekari Sign Dispatch Failed', e.toString());
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});
