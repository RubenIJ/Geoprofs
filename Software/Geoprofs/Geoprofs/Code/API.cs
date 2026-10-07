using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Geoprofs.Code
{
    internal class API
    {

        private static readonly HttpClient client = new HttpClient();
        // API Lezen
        private const string BaseUrl = "";

        //Haalt alle aanvragingen op
        public async Task<List<VerlofAanvraag>> GetLeaveRequestsAsync()
        {
            try
            {
                string json = await client.GetStringAsync($"{BaseUrl}/leave-requests");
                return JsonSerializer.Deserialize<List<VerlofAanvraag>>(json);
            }
            catch (Exception ex)
            {
                throw new Exception($"Fout bij ophalen verlofaanvragen: {ex.Message}");
            }
        }
    }
}