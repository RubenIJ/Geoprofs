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
        }

        private void SetupRooster()
        {
            // 1. Maak de KryptonDataGridView aan ZONDER DockStyle.Fill
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
            this.Controls.Add(grid);
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
    }
}