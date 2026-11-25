using System;
using System.Data;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Extensions.Configuration;

namespace Geoprofs
{
    public partial class LoginForm : Form
    {
        public LoginForm()
        {
            InitializeComponent();
        }

        private async void button1_Click_1(object sender, EventArgs e)
        {
            string email = textBox1?.Text?.Trim() ?? "";
            string wachtwoord = textBox2?.Text ?? "";

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(wachtwoord))
            {
                MessageBox.Show("Vul zowel een e-mailadres als een wachtwoord in.", "Waarschuwing", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            try
            {
                var configuration = new ConfigurationBuilder()
                    .SetBasePath(AppContext.BaseDirectory)
                    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                    .Build();

                string url = configuration["SupabaseUrl"] ?? "";
                string key = configuration["SupabaseKey"] ?? "";

                if (string.IsNullOrEmpty(url) || string.IsNullOrEmpty(key))
                {
                    MessageBox.Show("Kon Supabase URL of Key niet vinden in appsettings.json.", "Configuratiefout", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                var options = new Supabase.SupabaseOptions { AutoConnectRealtime = false };
                var supabase = new Supabase.Client(url, key, options);
                await supabase.InitializeAsync();

                var signInResult = await supabase.Auth.SignIn(email, wachtwoord);

                if (signInResult != null && signInResult.User != null)
                {
                    bool isToegestaan = await ControleerAdminIdAsync(email);

                    if (!isToegestaan)
                    {
                        await supabase.Auth.SignOut();
                        MessageBox.Show("Dit is geen login van een Manager", "Geen Toegang", MessageBoxButtons.OK, MessageBoxIcon.Stop);
                        if (textBox2 != null) textBox2.Clear();
                        textBox1?.Focus();
                        return;
                    }

                    MessageBox.Show("Welkom bij GeoProfs!", "Succes", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    this.DialogResult = DialogResult.OK;
                    this.Close();
                }
                else
                {
                    MessageBox.Show("Onjuist e-mailadres of wachtwoord.", "Fout", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    if (textBox2 != null) textBox2.Clear();
                    textBox1?.Focus();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Inloggen mislukt: {ex.Message}", "Authenticatie Fout", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private async Task<bool> ControleerAdminIdAsync(string email)
        {
            string veiligeEmail = email.Replace("'", "''");
            string query = $"SELECT rol_id FROM medewerkers WHERE LOWER(email) = LOWER('{veiligeEmail}') LIMIT 1;";
            DataTable dt = await Database.GetTableAsync(query);

            if (dt.Rows.Count == 0 || dt.Rows[0]["rol_id"] == DBNull.Value)
            {
                return false;
            }

            return Convert.ToInt32(dt.Rows[0]["rol_id"]) == 1;
        }
    }
}