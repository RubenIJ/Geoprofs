using System;
using System.Drawing;
using System.IO;
using System.Text;
using System.Windows.Forms;
using Krypton.Toolkit;

namespace Geoprofs
{
    public partial class Form1 : KryptonForm
    {
        private KryptonDataGridView? grid;
        private DataGridView? gridAanvragen;

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

        private void VulOveruren()
        {
            if (dataGridView1 == null) return;

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

            gridAanvragen.Columns.Add("ColId", "ID");
            gridAanvragen.Columns.Add("ColWerknemer", "Werknemer");
            gridAanvragen.Columns.Add("ColVan", "Van");
            gridAanvragen.Columns.Add("ColTot", "Tot");
            gridAanvragen.Columns.Add("ColReden", "Reden");
            gridAanvragen.Columns.Add("ColStatus", "Status");

            DataGridViewButtonColumn btnGoedkeuren = new DataGridViewButtonColumn
            {
                Name = "ColGoedkeuren",
                HeaderText = "Goedkeuren",
                Text = "goedkeuren",
                UseColumnTextForButtonValue = true
            };
            gridAanvragen.Columns.Add(btnGoedkeuren);

            DataGridViewButtonColumn btnAfkeuren = new DataGridViewButtonColumn
            {
                Name = "ColAfkeuren",
                HeaderText = "Afkeuren",
                Text = "Afwijzen",
                UseColumnTextForButtonValue = true
            };
            gridAanvragen.Columns.Add(btnAfkeuren);

            gridAanvragen.Rows.Add("1", "Jan Jansen", "12-10-2026", "14-10-2026", "Vakantie", "In Afwachting");
            gridAanvragen.Rows.Add("2", "Piet Pietersen", "15-10-2026", "15-10-2026", "Tandarts", "In Afwachting");

            gridAanvragen.CellClick += (sender, e) =>
            {
                if (e.RowIndex < 0 || gridAanvragen == null) return;

                string werknemer = gridAanvragen.Rows[e.RowIndex].Cells["ColWerknemer"].Value?.ToString() ?? "";
                string geklikteKolom = gridAanvragen.Columns[e.ColumnIndex].Name;

                if (geklikteKolom == "ColGoedkeuren")
                {
                    gridAanvragen.Rows[e.RowIndex].Cells["ColStatus"].Value = "Goedgekeurd";
                    gridAanvragen.Rows[e.RowIndex].Cells["ColStatus"].Style.ForeColor = Color.Green;

                    MessageBox.Show($"Verlofaanvraag van {werknemer} is GOEDGEKEURD.",
                                    "Status Bijgewerkt", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                else if (geklikteKolom == "ColAfkeuren")
                {
                    gridAanvragen.Rows[e.RowIndex].Cells["ColStatus"].Value = "Afgewezen";
                    gridAanvragen.Rows[e.RowIndex].Cells["ColStatus"].Style.ForeColor = Color.Red;

                    MessageBox.Show($"Verlofaanvraag van {werknemer} is AFGEWEZEN.",
                                    "Status Bijgewerkt", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
            };
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

                csvContent.AppendLine("ID;Werknemer;Van;Tot;Reden;Status");

                foreach (DataGridViewRow row in gridAanvragen.Rows)
                {
                    if (!row.IsNewRow)
                    {
                        string id = row.Cells["ColId"].Value?.ToString() ?? "";
                        string werknemer = row.Cells["ColWerknemer"].Value?.ToString() ?? "";
                        string van = row.Cells["ColVan"].Value?.ToString() ?? "";
                        string tot = row.Cells["ColTot"].Value?.ToString() ?? "";
                        string reden = row.Cells["ColReden"].Value?.ToString() ?? "";
                        string status = row.Cells["ColStatus"].Value?.ToString() ?? "";

                        if (status == "Goedgekeurd")
                        {
                            csvContent.AppendLine($"{id};{werknemer};{van};{tot};{reden};{status}");
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