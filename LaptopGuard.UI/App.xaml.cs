using System.Windows;

namespace LaptopGuard.UI;

public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);
        var login = new OtpLoginWindow();
        login.Show();
    }
}