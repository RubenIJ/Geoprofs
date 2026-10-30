using System;
using System.Data;
using System.Drawing;
using System.IO;
using System.Text;
using System.Windows.Forms;
using Krypton.Toolkit;

namespace Geoprofs
{
    public partial class MainForm : KryptonForm
    {
        private KryptonDataGridView? grid;
        private DataGridView? gridAanvragen;

        public MainForm()
        {
            InitializeComponent();
            SetupRooster();

            // Laad de data vanuit Supabase bij het openen
            _ = LaadDataAsync();
        }

        private async Task LaadDataAsync()
        {
            await VulOverurenUitDatabaseAsync();
            SetupVerlofAanvragenTab();
            await LaadVerlofaanvragenUitDatabaseAsync();
        }

        private void SetupRooster()
        {
            grid = new KryptonDataGridView
            {
                Location = new Point(40, 120),
                Size = new Size(550, 300),
                AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill,
                AllowUserToAddRows = false,
                RowHeadersVisible = false,
                ColumnHeadersHeight = 30,
                Visible = true
            };

            if (tabControl1.TabPages.Count > 1)
            {
                tabControl1.TabPages[1].Controls.Add(grid);
                grid.BringToFront();
            }

            grid.Columns.Add("ColWeek", "Week");
            grid.Columns.Add("ColMa", "Ma");
            grid.Columns.Add("ColDi", "Di");
            grid.Columns.Add("ColWo", "Woe");
            grid.Columns.Add("ColDo", "Do");
            grid.Columns.Add("ColVr", "Vri");
            grid.Columns.Add("ColExtra", "+");

            grid.Columns["ColWeek"].Width = 50;

            int row1 = grid.Rows.Add("40", "Aanwezig", "Aanwezig", "Verlof", "Verlof", "Aanwezig", "");
            int row2 = grid.Rows.Add("41", "Verlof", "Aanwezig", "Aanwezig", "Aanwezig", "Aanwezig", "");

            MarkeerCel(row1, 3, Color.LightCoral);
            MarkeerCel(row1, 4, Color.LightCoral);
            MarkeerCel(row2, 1, Color.LightCoral);
        }

        private void MarkeerCel(int rowIndex, int colIndex, Color kleur)
        {
            if (grid != null && rowIndex >= 0 && rowIndex < grid.Rows.Count)
            {
                grid.Rows[rowIndex].Cells[colIndex].Style.BackColor = kleur;
            }
        }

        private async Task VulOverurenUitDatabaseAsync()
        {
            if (dataGridView1 == null) return;

            try
            {
                string query = "SELECT voornaam || ' ' || achternaam AS medewerker, totaal_uren, gebruikte_uren, resterende_uren FROM medewerkers;";
                DataTable dt = await Database.GetTableAsync(query);

                dataGridView1.DataSource = dt;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Fout bij ophalen medewerkers/uren: {ex.Message}", "Database Fout", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void dataGridView1_CellContentClick(object sender, DataGridViewCellEventArgs e)
        {
        }

        private void SetupVerlofAanvragenTab()
        {
            gridAanvragen = new DataGridView
            {
                Dock = DockStyle.Fill,
                AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill,
                AllowUserToAddRows = false,
                RowHeadersVisible = false,
                SelectionMode = DataGridViewSelectionMode.FullRowSelect
            };

            if (tabControl1.TabPages.Count >= 3)
            {
                tabControl1.TabPages[2].Controls.Add(gridAanvragen);
            }

            // Koppel de klik-events voor goedkeuren / afwijzen op basis van de database ID
            gridAanvragen.CellClick += async (sender, e) =>
            {
                if (e.RowIndex < 0 || gridAanvragen == null) return;

                string id = gridAanvragen.Rows[e.RowIndex].Cells["id"].Value?.ToString() ?? "";
                string werknemer = gridAanvragen.Rows[e.RowIndex].Cells["werknemer"].Value?.ToString() ?? "";
                string geklikteKolom = gridAanvragen.Columns[e.ColumnIndex].Name;

                if (geklikteKolom == "ColGoedkeuren")
                {
                    await UpdateStatusInDatabaseAsync(id, 2); // 2 = Goedgekeurd
                    MessageBox.Show($"Verlofaanvraag van {werknemer} is GOEDGEKEURD.", "Status Bijgewerkt", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    await LaadVerlofaanvragenUitDatabaseAsync();
                }
                else if (geklikteKolom == "ColAfkeuren")
                {
                    await UpdateStatusInDatabaseAsync(id, 3); // 3 = Afgewezen
                    MessageBox.Show($"Verlofaanvraag van {werknemer} is AFGEWEZEN.", "Status Bijgewerkt", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    await LaadVerlofaanvragenUitDatabaseAsync();
                }
            };
        }

        private async Task LaadVerlofaanvragenUitDatabaseAsync()
        {
            if (gridAanvragen == null) return;

            try
            {
                // Correcte JOIN met de 'status' tabel (en 'status_id')
                string query = @"
            SELECT 
                v.id, 
                m.voornaam || ' ' || m.achternaam AS werknemer, 
                v.startdatum AS van, 
                v.einddatum AS tot, 
                vr.beschrijving AS reden, 
                st.naam AS status,
                v.status_id
            FROM verlofaanvragen v
            JOIN medewerkers m ON v.medewerker_id = m.id
            JOIN verlofredenen vr ON v.verlofreden_id = vr.id
            JOIN status st ON v.status_id = st.id;";

                DataTable dt = await Database.GetTableAsync(query);
                gridAanvragen.DataSource = dt;

                if (gridAanvragen.Columns.Contains("status_id"))
                {
                    gridAanvragen.Columns["status_id"].Visible = false;
                }

                if (!gridAanvragen.Columns.Contains("ColGoedkeuren"))
                {
                    DataGridViewButtonColumn btnGoedkeuren = new DataGridViewButtonColumn
                    {
                        Name = "ColGoedkeuren",
                        HeaderText = "Goedkeuren",
                        Text = "goedkeuren",
                        UseColumnTextForButtonValue = true
                    };
                    gridAanvragen.Columns.Add(btnGoedkeuren);
                }

                if (!gridAanvragen.Columns.Contains("ColAfkeuren"))
                {
                    DataGridViewButtonColumn btnAfkeuren = new DataGridViewButtonColumn
                    {
                        Name = "ColAfkeuren",
                        HeaderText = "Afkeuren",
                        Text = "Afwijzen",
                        UseColumnTextForButtonValue = true
                    };
                    gridAanvragen.Columns.Add(btnAfkeuren);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Fout bij ophalen verlofaanvragen: {ex.Message}", "Database Fout", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private async Task UpdateStatusInDatabaseAsync(string id, int statusId)
        {
            try
            {
                string query = $"UPDATE verlofaanvragen SET status_id = {statusId} WHERE id = {id};";
                await Database.ExecuteNonQueryAsync(query);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Fout bij bijwerken status in database: {ex.Message}");
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            if (gridAanvragen == null) return;

            SaveFileDialog saveFileDialog = new SaveFileDialog
            {
                Filter = "CSV bestand (*.csv)|*.csv",
                FileName = $"Afwezigheid_Export_{DateTime.Now:yyyyMMdd}.csv"
            };

            if (saveFileDialog.ShowDialog() == DialogResult.OK)
            {
                StringBuilder csvContent = new StringBuilder();

                csvContent.AppendLine("ID;Van;Tot;Reden");

                foreach (DataGridViewRow row in gridAanvragen.Rows)
                {
                    if (!row.IsNewRow)
                    {
                        string id = row.Cells["id"].Value?.ToString() ?? "";
                        string van = row.Cells["van"].Value?.ToString() ?? "";
                        string tot = row.Cells["tot"].Value?.ToString() ?? "";
                        string reden = row.Cells["reden"].Value?.ToString() ?? "";
                        string status = row.Cells["status"].Value?.ToString() ?? "";

                        if (status == "Goedgekeurd")
                        {
                            csvContent.AppendLine($"{id};{van};{tot};{reden}");
                        }
                    }
                }

                File.WriteAllText(saveFileDialog.FileName, csvContent.ToString(), Encoding.UTF8);

                MessageBox.Show("Afwezigheidsgegevens zijn succesvol geëxporteerd!", "Export Voltooid",
                                MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }
    }
}