namespace Geoprofs
{
    internal static class Program
    {
        /// <summary>
        ///  The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            ApplicationConfiguration.Initialize();

            // Opent inlog scherm
            using (LoginForm loginForm = new LoginForm())
            {
                // Als de inlog slaagt (DialogResult.OK), start pas de MainForm
                if (loginForm.ShowDialog() == DialogResult.OK)
                {
                    Application.Run(new MainForm());
                }
                else
                {
                    // Als de gebruiker het inlogscherm sluit, stopt de applicatie
                    Application.Exit();
                }
            }
        }
    }
}