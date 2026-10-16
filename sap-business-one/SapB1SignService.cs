using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Mekari.Sign.SapBusinessOne
{
    /// <summary>
    /// Service integrating SAP Business One Service Layer / DI Server with Mekari Sign API.
    /// Handles automated e-Meterai stamping on A/R Invoices and digital signing on Procurement Contracts.
    /// </summary>
    public class SapB1SignService
    {
        private readonly string _clientId;
        private readonly string _clientSecret;
        private readonly string _baseUrl;
        private readonly string _callbackUrl;
        private readonly HttpClient _httpClient;

        public SapB1SignService(
            string clientId,
            string clientSecret,
            string? baseUrl = null,
            string? callbackUrl = null,
            HttpClient? httpClient = null)
        {
            _clientId = clientId;
            _clientSecret = clientSecret;
            _baseUrl = baseUrl ?? "https://sandbox-api.mekari.com";
            _callbackUrl = callbackUrl ?? "https://code.iqbalmind.id/testing/esign/webhook";
            _httpClient = httpClient ?? new HttpClient();
        }

        public (string authHeader, string dateString) GenerateHmacHeaders(string method, string pathWithQuery)
        {
            string dateString = DateTimeOffset.UtcNow.ToString("r");
            string requestLine = $"{method.ToUpperInvariant()} {pathWithQuery} HTTP/1.1";
            string stringToSign = $"date: {dateString}\n{requestLine}";

            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_clientSecret));
            byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(stringToSign));
            string signature = Convert.ToBase64String(hash);

            string authHeader = $"hmac username=\"{_clientId}\", algorithm=\"hmac-sha256\", headers=\"date request-line\", signature=\"{signature}\"";
            return (authHeader, dateString);
        }

        /// <summary>
        /// Stamp e-Meterai on SAP B1 A/R Invoice (OINV)
        /// </summary>
        public async Task<string> StampInvoiceEmeteraiAsync(string pdfBase64, string docNum, int page = 1, int x = 100, int y = 100)
        {
            string path = "/v2/esign-hmac/v1/documents/stamp";
            var payload = new
            {
                doc = pdfBase64,
                filename = $"SAP_Invoice_{docNum}.pdf",
                annotations = new[]
                {
                    new
                    {
                        page = page,
                        position_x = x,
                        position_y = y,
                        element_width = 80,
                        element_height = 80,
                        canvas_width = 595,
                        canvas_height = 841,
                        type_of = "meterai"
                    }
                },
                callback_url = _callbackUrl
            };

            var (authHeader, dateString) = GenerateHmacHeaders("POST", path);
            using var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}{path}");
            request.Headers.TryAddWithoutValidation("Authorization", authHeader);
            request.Headers.TryAddWithoutValidation("Date", dateString);
            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
    }
}
