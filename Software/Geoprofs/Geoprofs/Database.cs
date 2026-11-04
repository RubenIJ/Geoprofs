using Npgsql;
using System;
using System.Data;
using System.Threading.Tasks;

namespace Geoprofs
{
    internal static class Database
    {
        private static string ConnectionString =>
            "Host=aws-0-eu-west-1.pooler.supabase.com;" +
            "Port=5432;" +
            "Database=postgres;" +
            "Username=postgres.uxueyaygfmqljzfdjhcq;" +
            "Password=Vibevoyage1!;" +
            "SSL Mode=Require;" +
            "Trust Server Certificate=true";

        // Methode om data op te halen (SELECT)
        public static async Task<DataTable> GetTableAsync(string sql)
        {
            using var connection = new NpgsqlConnection(ConnectionString);
            await connection.OpenAsync();

            using var command = new NpgsqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();

            var table = new DataTable();
            table.Load(reader);
            return table;
        }

        // Methode om acties uit te voeren zoals UPDATE of INSERT
        public static async Task<int> ExecuteNonQueryAsync(string sql)
        {
            using var connection = new NpgsqlConnection(ConnectionString);
            await connection.OpenAsync();

            using var command = new NpgsqlCommand(sql, connection);
            return await command.ExecuteNonQueryAsync();
        }
    }
}