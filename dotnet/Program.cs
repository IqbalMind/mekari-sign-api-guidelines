using System;
using System.Threading.Tasks;

namespace Mekari.Sign
{
    internal class Program
    {
        static async Task Main(string[] args)
        {
            string clientId = Environment.GetEnvironmentVariable("SIGN_CLIENT_ID") ?? "YOUR_CLIENT_ID";
            string clientSecret = Environment.GetEnvironmentVariable("SIGN_CLIENT_SECRET") ?? "YOUR_CLIENT_SECRET";
            string baseUrl = Environment.GetEnvironmentVariable("SIGN_BASE_URL") ?? "https://sandbox-api.mekari.com";
            string callbackUrl = "https://code.iqbalmind.id/testing/esign/webhook";

            Console.WriteLine("==================================================================");
            Console.WriteLine("Mekari Sign API .NET 8.0 HMAC Integration");
            Console.WriteLine($"Base Gateway URL: {baseUrl}");
            Console.WriteLine($"Webhook Callback: {callbackUrl}");
            Console.WriteLine("==================================================================");

            var api = new SignApi(clientId, clientSecret, baseUrl);

            // 1. Fetch Documents
            Console.WriteLine("\n--- Case 1: Fetch Documents List ---");
            string path = "/v2/esign-hmac/v1/documents?page=1&limit=3";
            var headers = api.GenerateHeaders("GET", path);
            Console.WriteLine($"[HMAC Authorization] {headers.Authorization}");
            Console.WriteLine($"[HTTP Date]         {headers.Date}");

            try
            {
                var response = await api.GetDocumentsAsync(limit: 3, page: 1);
                string responseBody = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"\nHTTP Status: {(int)response.StatusCode} {response.StatusCode}");
                Console.WriteLine($"Response:\n{responseBody}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\n❌ Request Error: {ex.Message}");
            }
        }
    }
}
