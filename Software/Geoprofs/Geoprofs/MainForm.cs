using System;
using System.Data;
using System.Drawing;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Krypton.Toolkit;

namespace Geoprofs
{
    public partial class MainForm : KryptonForm
    {
        private int huidigeJaar = DateTime.Today.Year;
        private int huidigeMaand = DateTime.Today.Month;
        private KryptonDataGridView? grid;
        private DataGridView? gridAanvragen;

        public MainForm()
        {
            InitializeComponent();
            _ = LaadDataAsync();
        }

        private async Task LaadDataAsync()
        {
            await VulOverurenUitDatabaseAsync();
            await SetupRoosterAsync();
            SetupVerlofAanvragenTab();
            await LaadVerlofaanvragenUitDatabaseAsync();
        }

        private async Task SetupRoosterAsync()
        {
            if (tabControl1.TabPages.Count <= 1) return;
            TabPage tabRooster = tabControl1.TabPages[1];

            Panel panelContainer = tabRooster.Controls.OfType<Panel>().FirstOrDefault(p => p.Name == "panelRoosterContainer");

            Button btnVorige = null;
            Button btnVolgende = null;
            Label lblMaandJaar = null;

            if (panelContainer == null)
            {
                tabRooster.Controls.Clear();

                panelContainer = new Panel
                {
                    Name = "panelRoosterContainer",
                    Dock = DockStyle.Fill
                };

                FlowLayoutPanel panelNav = new FlowLayoutPanel
                {
                    Dock = DockStyle.Top,
                    Height = 45,
                    FlowDirection = FlowDirection.LeftToRight,
                    Padding = new Padding(5)
                };

                btnVorige = new Button
                {
                    Text = "< Vorige Maand",
                    Width = 120,
                    Height = 32,
                    UseVisualStyleBackColor = true
                };
                btnVorige.Click += async (s, e) => {
                    huidigeMaand--;
                    if (huidigeMaand < 1)
                    {
                        huidigeMaand = 12;
                        huidigeJaar--;
                    }
                    await SetupRoosterAsync();
                };

                lblMaandJaar = new Label
                {
                    Name = "lblMaandJaar",
                    Width = 180,
                    TextAlign = ContentAlignment.MiddleCenter,
                    Font = new Font("Segoe UI", 11, FontStyle.Bold),
                    Margin = new Padding(10, 5, 10, 0)
                };

                btnVolgende = new Button
                {
                    Text = "Volgende Maand >",
                    Width = 120,
                    Height = 32,
                    UseVisualStyleBackColor = true
                };
                btnVolgende.Click += async (s, e) => {
                    huidigeMaand++;
                    if (huidigeMaand > 12)
                    {
                        huidigeMaand = 1;
                        huidigeJaar++;
                    }
                    await SetupRoosterAsync();
                };

                panelNav.Controls.Add(btnVorige);
                panelNav.Controls.Add(lblMaandJaar);
                panelNav.Controls.Add(btnVolgende);

                grid = new KryptonDataGridView
                {
                    Dock = DockStyle.Fill,
                    AllowUserToAddRows = false,
                    RowHeadersVisible = false,
                    ColumnHeadersHeight = 40,
                    Visible = true
                };

                panelContainer.Controls.Add(grid);
                panelContainer.Controls.Add(panelNav);
                tabRooster.Controls.Add(panelContainer);
            }
            else
            {
                lblMaandJaar = panelContainer.Controls.OfType<FlowLayoutPanel>().FirstOrDefault()?.Controls.OfType<Label>().FirstOrDefault(l => l.Name == "lblMaandJaar");
                grid.Columns.Clear();
                grid.Rows.Clear();
            }

            System.Globalization.CultureInfo nlCulture = new System.Globalization.CultureInfo("nl-NL");
            DateTime eersteDagVanMaand = new DateTime(huidigeJaar, huidigeMaand, 1);
            if (lblMaandJaar != null)
            {
                lblMaandJaar.Text = eersteDagVanMaand.ToString("MMMM yyyy", nlCulture);
            }

            int aantalDagen = DateTime.DaysInMonth(huidigeJaar, huidigeMaand);
            grid.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.None;

            DataGridViewTextBoxColumn colMedewerker = new DataGridViewTextBoxColumn
            {
                Name = "ColMedewerker",
                HeaderText = "Medewerker",
                Width = 140,
                Frozen = true
            };
            grid.Columns.Add(colMedewerker);

            for (int d = 1; d <= aantalDagen; d++)
            {
                DateTime dag = new DateTime(huidigeJaar, huidigeMaand, d);
                string dagKort = dag.ToString("ddd", nlCulture);

                DataGridViewTextBoxColumn colDag = new DataGridViewTextBoxColumn
                {
                    Name = $"ColDag_{d}",
                    HeaderText = $"{d}\n{dagKort}",
                    Width = 42
                };
                grid.Columns.Add(colDag);
            }

            try
            {
                string queryMedewerkers = "SELECT id, voornaam || ' ' || achternaam AS naam FROM medewerkers;";
                DataTable dtMedewerkers = await Database.GetTableAsync(queryMedewerkers);

                string queryVerlof = @"
            SELECT v.medewerker_id, v.startdatum, v.einddatum 
            FROM verlofaanvragen v
            WHERE v.status_id = 2;";
                DataTable dtVerlof = await Database.GetTableAsync(queryVerlof);

                foreach (DataRow medewerkerRow in dtMedewerkers.Rows)
                {
                    string medewerkerId = medewerkerRow["id"].ToString() ?? "";
                    string naam = medewerkerRow["naam"].ToString() ?? "";

                    object[] rowValues = new object[aantalDagen + 1];
                    rowValues[0] = naam;

                    for (int i = 1; i <= aantalDagen; i++)
                    {
                        rowValues[i] = "";
                    }

                    int rowIndex = grid.Rows.Add(rowValues);

                    for (int d = 1; d <= aantalDagen; d++)
                    {
                        DateTime huidigeDag = new DateTime(huidigeJaar, huidigeMaand, d);
                        DataGridViewCell cel = grid.Rows[rowIndex].Cells[d];

                        if (huidigeDag.DayOfWeek == DayOfWeek.Saturday || huidigeDag.DayOfWeek == DayOfWeek.Sunday)
                        {
                            cel.Style.BackColor = Color.LightGray;
                            continue;
                        }

                        cel.Value = "A";
                        cel.Style.BackColor = Color.LightGreen;
                        cel.ToolTipText = $"{naam}: Aanwezig op {huidigeDag:dd-MM-yyyy}";

                        foreach (DataRow verlofRow in dtVerlof.Rows)
                        {
                            if (verlofRow["medewerker_id"].ToString() == medewerkerId)
                            {
                                DateTime startdatum = verlofRow["startdatum"] is DateOnly dStart
                                    ? dStart.ToDateTime(TimeOnly.MinValue)
                                    : Convert.ToDateTime(verlofRow["startdatum"]);

                                DateTime einddatum = verlofRow["einddatum"] is DateOnly dEnd
                                    ? dEnd.ToDateTime(TimeOnly.MinValue)
                                    : Convert.ToDateTime(verlofRow["einddatum"]);

                                if (huidigeDag.Date >= startdatum.Date && huidigeDag.Date <= einddatum.Date)
                                {
                                    cel.Value = "V";
                                    cel.Style.BackColor = Color.LightCoral;
                                    cel.ToolTipText = $"{naam}: Verlof op {huidigeDag:dd-MM-yyyy}";
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Fout bij laden van de maandkalender: {ex.Message}", "Fout", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private async Task VulOverurenUitDatabaseAsync()
        {
            if (dataGridView1 == null) return;

            try
            {
                string query = "SELECT voornaam || ' ' || achternaam AS medewerker, totale_dagen, gebruikte_dagen, resterende_dagen FROM medewerkers;";
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
            Panel panelContainer = new Panel
            {
                Dock = DockStyle.Fill
            };

            FlowLayoutPanel panelKnoppen = new FlowLayoutPanel
            {
                Dock = DockStyle.Top,
                Height = 45,
                FlowDirection = FlowDirection.LeftToRight,
                Padding = new Padding(5)
            };

            Button btnMassaGoedkeuren = new Button
            {
                Text = "Massa Goedkeuren",
                Height = 32,
                Width = 160,
                AutoSize = false,
                BackColor = Color.LightGreen,
                UseVisualStyleBackColor = true
            };
            btnMassaGoedkeuren.Click += BtnMassaGoedkeuren_Click;

            Button btnMassaAfkeuren = new Button
            {
                Text = "Massa Afkeuren",
                Height = 32,
                Width = 160,
                AutoSize = false,
                BackColor = Color.LightCoral,
                UseVisualStyleBackColor = true
            };
            btnMassaAfkeuren.Click += BtnMassaAfkeuren_Click;

            button1.Text = "Exporteer CSV";
            button1.Height = 32;
            button1.Width = 140;
            button1.AutoSize = false;
            button1.UseVisualStyleBackColor = true;

            panelKnoppen.Controls.Add(btnMassaGoedkeuren);
            panelKnoppen.Controls.Add(btnMassaAfkeuren);
            panelKnoppen.Controls.Add(button1);

            gridAanvragen = new DataGridView
            {
                Dock = DockStyle.Fill,
                AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill,
                AllowUserToAddRows = false,
                RowHeadersVisible = false,
                SelectionMode = DataGridViewSelectionMode.FullRowSelect
            };

            panelContainer.Controls.Add(gridAanvragen);
            panelContainer.Controls.Add(panelKnoppen);

            if (tabControl1.TabPages.Count >= 3)
            {
                tabControl1.TabPages[2].Controls.Clear();
                tabControl1.TabPages[2].Controls.Add(panelContainer);
            }

            gridAanvragen.CellClick += async (sender, e) =>
            {
                if (e.RowIndex < 0 || gridAanvragen == null) return;

                if (gridAanvragen.Columns[e.ColumnIndex].Name == "ColSelect") return;

                string id = gridAanvragen.Rows[e.RowIndex].Cells["id"].Value?.ToString() ?? "";
                string werknemer = gridAanvragen.Rows[e.RowIndex].Cells["werknemer"].Value?.ToString() ?? "";
                string geklikteKolom = gridAanvragen.Columns[e.ColumnIndex].Name;

                if (geklikteKolom == "ColGoedkeuren")
                {
                    await UpdateStatusInDatabaseAsync(id, 2);
                    MessageBox.Show($"Verlofaanvraag van {werknemer} is GOEDGEKEURD.", "Status Bijgewerkt", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    await LaadVerlofaanvragenUitDatabaseAsync();
                }
                else if (geklikteKolom == "ColAfkeuren")
                {
                    await UpdateStatusInDatabaseAsync(id, 3);
                    MessageBox.Show($"Verlofaanvraag van {werknemer} is AFGEWEZEN.", "Status Bijgewerkt", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    await LaadVerlofaanvragenUitDatabaseAsync();
                }
            };
        }

        private async void BtnMassaGoedkeuren_Click(object sender, EventArgs e)
        {
            List<string> geselecteerdeIds = new List<string>();

            foreach (DataGridViewRow row in gridAanvragen.Rows)
            {
                bool isGeselecteerd = Convert.ToBoolean(row.Cells["ColSelect"]?.Value ?? false);
                if (isGeselecteerd)
                {
                    string id = row.Cells["id"].Value?.ToString() ?? "";
                    if (!string.IsNullOrEmpty(id))
                    {
                        geselecteerdeIds.Add(id);
                    }
                }
            }

            if (geselecteerdeIds.Count == 0)
            {
                MessageBox.Show("Selecteer eerst minimaal één verlofaanvraag via de vinkjes.", "Geen selectie", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            DialogResult result = MessageBox.Show($"Weet je zeker dat je {geselecteerdeIds.Count} geselecteerde aanvraag/aanvragen wilt goedkeuren?", "Massa Goedkeuren", MessageBoxButtons.YesNo, MessageBoxIcon.Question);

            if (result == DialogResult.Yes)
            {
                try
                {
                    foreach (string id in geselecteerdeIds)
                    {
                        await UpdateStatusInDatabaseAsync(id, 2);
                    }

                    MessageBox.Show("De geselecteerde aanvragen zijn succesvol goedgekeurd!", "Succes", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    await LaadVerlofaanvragenUitDatabaseAsync();
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Fout bij massa-goedkeuring: {ex.Message}", "Fout", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }

        private async void BtnMassaAfkeuren_Click(object sender, EventArgs e)
        {
            List<string> geselecteerdeIds = new List<string>();

            foreach (DataGridViewRow row in gridAanvragen.Rows)
            {
                bool isGeselecteerd = Convert.ToBoolean(row.Cells["ColSelect"]?.Value ?? false);
                if (isGeselecteerd)
                {
                    string id = row.Cells["id"].Value?.ToString() ?? "";
                    if (!string.IsNullOrEmpty(id))
                    {
                        geselecteerdeIds.Add(id);
                    }
                }
            }

            if (geselecteerdeIds.Count == 0)
            {
                MessageBox.Show("Selecteer eerst minimaal één verlofaanvraag via de vinkjes.", "Geen selectie", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            DialogResult result = MessageBox.Show($"Weet je zeker dat je {geselecteerdeIds.Count} geselecteerde aanvraag/aanvragen wilt afwijzen?", "Massa Afkeuren", MessageBoxButtons.YesNo, MessageBoxIcon.Question);

            if (result == DialogResult.Yes)
            {
                try
                {
                    foreach (string id in geselecteerdeIds)
                    {
                        await UpdateStatusInDatabaseAsync(id, 3);
                    }

                    MessageBox.Show("De geselecteerde aanvragen zijn succesvol afgewezen!", "Succes", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    await LaadVerlofaanvragenUitDatabaseAsync();
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Fout bij massa-afkeuring: {ex.Message}", "Fout", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }

        private async Task LaadVerlofaanvragenUitDatabaseAsync()
        {
            if (gridAanvragen == null) return;

            try
            {
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
                    JOIN status st ON v.status_id = st.id
                    WHERE v.status_id <> 4;";

                DataTable dt = await Database.GetTableAsync(query);
                gridAanvragen.DataSource = dt;

                if (gridAanvragen.Columns.Contains("status_id"))
                {
                    gridAanvragen.Columns["status_id"].Visible = false;
                }

                if (!gridAanvragen.Columns.Contains("ColSelect"))
                {
                    DataGridViewCheckBoxColumn selectCol = new DataGridViewCheckBoxColumn
                    {
                        Name = "ColSelect",
                        HeaderText = "Selecteer",
                        Width = 70,
                        ReadOnly = false
                    };
                    gridAanvragen.Columns.Insert(0, selectCol);
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