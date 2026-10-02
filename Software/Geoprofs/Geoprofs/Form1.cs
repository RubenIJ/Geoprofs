using System;
using System.Drawing;
using System.Windows.Forms;
using Krypton.Toolkit;

namespace Geoprofs
{
    public partial class Form1 : KryptonForm
    {
        private KryptonDataGridView grid;

        public Form1()
        {
            InitializeComponent();
            SetupRooster();
            VulOveruren();
            SetupVerlofAanvragenTab();

        }

        private void SetupRooster()
        {

            grid = new KryptonDataGridView
            {
                // Positie: X=40 (van links), Y=120 (voldoende ruimte onder de header)
                Location = new Point(40, 120),

                // Breedte en Hoogte aanpassen zodat het rooster niet het hele scherm beslaat
                Size = new Size(550, 300),

                // Zorg ervoor dat de kolommen zich netjes verdelen binnen de opgegeven breedte
                AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill,
                AllowUserToAddRows = false,
                RowHeadersVisible = false,
                ColumnHeadersHeight = 30,
                Visible = true
            };

            // 2. Voeg toe aan de controls
            tabControl1.TabPages[1].Controls.Add(grid);
            grid.BringToFront();

            // 3. Voeg de kolommen toe (inclusief Week-kolom zoals in je schets)
            grid.Columns.Add("ColWeek", "Week");
            grid.Columns.Add("ColMa", "Ma");
            grid.Columns.Add("ColDi", "Di");
            grid.Columns.Add("ColWo", "Woe");
            grid.Columns.Add("ColDo", "Do");
            grid.Columns.Add("ColVr", "Vri");
            grid.Columns.Add("ColExtra", "+");

            // Maak de 'Week' kolom iets smaller
            grid.Columns["ColWeek"].Width = 50;

            // 4. Voeg testdata toe (Week 40 en Week 41)
            int row1 = grid.Rows.Add("40", "Aanwezig", "Aanwezig", "Verlof", "Verlof", "Aanwezig", "");
            int row2 = grid.Rows.Add("41", "Verlof", "Aanwezig", "Aanwezig", "Aanwezig", "Aanwezig", "");

            // 5. Cellen inkleuren
            MarkeerCel(row1, 3, Color.LightCoral); // Woe verlof
            MarkeerCel(row1, 4, Color.LightCoral); // Do verlof
            MarkeerCel(row2, 1, Color.LightCoral); // Ma verlof
            //MarkeerCel(row2, 5, Color.Khaki);      // Vri ziek
        }

        private void MarkeerCel(int rowIndex, int colIndex, Color kleur)
        {
            if (rowIndex >= 0 && rowIndex < grid.Rows.Count)
            {
                grid.Rows[rowIndex].Cells[colIndex].Style.BackColor = kleur;
            }
        }
        private void VulOveruren()
        {
            dataGridView1.Columns.Add("Medewerker", "Medewerker");
            dataGridView1.Columns.Add("Overuren", "Overuren");
            dataGridView1.Columns.Add("Verlof", "Openstaand verlof");

            dataGridView1.Rows.Add("Jan", "4 uur", "1 aanvraag", "TRUE");
            dataGridView1.Rows.Add("Lisa", "8 uur", "2 aanvragen", "FALSE");
            dataGridView1.Rows.Add("Peter", "2 uur", "0 aanvragen", "FALSE");
            dataGridView1.Rows.Add("Sophie", "6 uur", "3 aanvragen", "FALSE");
        }

        private void dataGridView1_CellContentClick(object sender, DataGridViewCellEventArgs e)
        {

        }

        private void SetupVerlofAanvragenTab()
        {
            // Gebruik de DataGridView die je op Tab 3 in de Designer hebt gezet
            // (of als je 'm dynamisch aanmaakt, zoals hieronder):
            DataGridView gridAanvragen = new DataGridView
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

            // 1. Data-kolommen toevoegen
            gridAanvragen.Columns.Add("ColId", "ID");
            gridAanvragen.Columns.Add("ColWerknemer", "Werknemer");
            gridAanvragen.Columns.Add("ColVan", "Van");
            gridAanvragen.Columns.Add("ColTot", "Tot");
            gridAanvragen.Columns.Add("ColReden", "Reden");
            gridAanvragen.Columns.Add("ColStatus", "Status");

            // 2. Knopkolom: Goedkeuren
            DataGridViewButtonColumn btnGoedkeuren = new DataGridViewButtonColumn
            {
                Name = "ColGoedkeuren",
                HeaderText = "Goedkeuren",
                Text = "✔ Goedgekeurd",
                UseColumnTextForButtonValue = true
            };
            gridAanvragen.Columns.Add(btnGoedkeuren);

            // 3. Knopkolom: Afkeuren
            DataGridViewButtonColumn btnAfkeuren = new DataGridViewButtonColumn
            {
                Name = "ColAfkeuren",
                HeaderText = "Afkeuren",
                Text = "✖ Afgewezen",
                UseColumnTextForButtonValue = true
            };
            gridAanvragen.Columns.Add(btnAfkeuren);

            // Testdata toevoegen
            gridAanvragen.Rows.Add("1", "Jan Jansen", "12-10-2026", "14-10-2026", "Vakantie", "In Afwachting");
            gridAanvragen.Rows.Add("2", "Piet Pietersen", "15-10-2026", "15-10-2026", "Tandarts", "In Afwachting");

            // 4. Afhandelen van de knopklikken
            gridAanvragen.CellClick += (sender, e) =>
            {
                // Check of er op een geldige rij is geklikt (geen header)
                if (e.RowIndex < 0) return;

                string werknemer = gridAanvragen.Rows[e.RowIndex].Cells["ColWerknemer"].Value?.ToString() ?? "";
                string geklikteKolom = gridAanvragen.Columns[e.ColumnIndex].Name;

                // Klik op 'Goedkeuren'
                if (geklikteKolom == "ColGoedkeuren")
                {
                    gridAanvragen.Rows[e.RowIndex].Cells["ColStatus"].Value = "Goedgekeurd";
                    gridAanvragen.Rows[e.RowIndex].Cells["ColStatus"].Style.ForeColor = Color.Green;

                    MessageBox.Show($"Verlofaanvraag van {werknemer} is GOEDGEKEURD.",
                                    "Status Bijgewerkt", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                // Klik op 'Afkeuren'
                else if (geklikteKolom == "ColAfkeuren")
                {
                    gridAanvragen.Rows[e.RowIndex].Cells["ColStatus"].Value = "Afgewezen";
                    gridAanvragen.Rows[e.RowIndex].Cells["ColStatus"].Style.ForeColor = Color.Red;

                    MessageBox.Show($"Verlofaanvraag van {werknemer} is AFGEWEZEN.",
                                    "Status Bijgewerkt", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
            };
        }
    }
}