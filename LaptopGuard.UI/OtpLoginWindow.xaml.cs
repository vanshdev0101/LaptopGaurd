using OtpNet;
using System.IO;
using System.Windows;
using System.Windows.Input;

namespace LaptopGuard.UI;

public partial class OtpLoginWindow : Window
{
    private readonly byte[] _otpKey;

    public OtpLoginWindow()
    {
        InitializeComponent();
        _otpKey = LoadOrCreateKey();
        OtpInput.Focus();
    }

    private static byte[] LoadOrCreateKey()
    {
        var path = @"C:\ProgramData\LaptopGuard\otp.secret";
        Directory.CreateDirectory(@"C:\ProgramData\LaptopGuard");

        if (File.Exists(path))
        {
            var existing = File.ReadAllText(path).Trim();
            // if it looks like Base64 (contains = / +), regenerate
            if (existing.Contains('=') || existing.Contains('/') || existing.Contains('+'))
            {
                File.Delete(path);
            }
            else
            {
                return Base32Encoding.ToBytes(existing);
            }
        }

        // generate proper Base32 secret
        var key = KeyGeneration.GenerateRandomKey(20);
        var secret = Base32Encoding.ToString(key);
        File.WriteAllText(path, secret);
        return key;
    }

    private void Verify()
    {
        var entered = OtpInput.Text.Trim();
        if (entered.Length != 6)
        {
            ErrorText.Text = "Please enter a 6-digit code.";
            return;
        }

        var totp = new OtpNet.Totp(_otpKey);
        var isValid = totp.VerifyTotp(entered, out _, new VerificationWindow(1, 1));

        if (isValid)
        {
            var dashboard = new MainWindow();
            dashboard.Show();
            Close();
        }
        else
        {
            ErrorText.Text = "Invalid OTP. Check Google Authenticator.";
            OtpInput.Text = "";
            OtpInput.Focus();
        }
    }

    private void LoginBtn_Click(object sender, RoutedEventArgs e) => Verify();

    private void OtpInput_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Enter) Verify();
    }

    private void OtpInput_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e)
    {
        if (OtpInput.Text.Length == 6) Verify();
    }
}