using LaptopGuard.Core;
using LaptopGuard.Core.Models;
using OtpNet;
using System.Diagnostics;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;

namespace LaptopGuard.UI;

public partial class MainWindow : Window
{
    private readonly Database _db;
    private readonly DispatcherTimer _refreshTimer;
    private readonly DispatcherTimer _otpTimer;
    private readonly string _photoFolder = @"C:\ProgramData\LaptopGuard\Photos";
    private byte[]? _otpKey;

    public MainWindow()
    {
        InitializeComponent();

        var dbPath = @"C:\ProgramData\LaptopGuard\laptopguard.db";
        _db = new Database(dbPath);
        _otpKey = LoadOtpKey();

        _refreshTimer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(10) };
        _refreshTimer.Tick += (_, _) => Refresh();
        _refreshTimer.Start();

        _otpTimer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(1) };
        _otpTimer.Tick += (_, _) => TickOtp();
        _otpTimer.Start();

        Refresh();
        TickOtp();
        CheckServiceStatus();
    }

    private void Refresh()
    {
        try
        {
            var total = _db.GetTotalCount();
            var today = _db.GetTodayCount();
            var photos = Directory.Exists(_photoFolder)
                ? Directory.GetFiles(_photoFolder, "*.jpg")
                : Array.Empty<string>();

            TotalText.Text = total.ToString();
            TodayText.Text = today.ToString();
            PhotosText.Text = photos.Length.ToString();

            if (photos.Length > 0)
            {
                var last = photos.OrderByDescending(f => f).First();
                var name = Path.GetFileNameWithoutExtension(last);
                try
                {
                    var parts = name.Replace("intruder_", "");
                    var dt = DateTime.ParseExact(parts, "yyyyMMdd_HHmmss_fff",
                                    System.Globalization.CultureInfo.InvariantCulture);
                    LastSeenText.Text = dt.ToString("HH:mm:ss");
                }
                catch { LastSeenText.Text = "—"; }
            }

            LoadPhotoGrid(photos.OrderByDescending(f => f).ToArray());
            LoadLog();
            CheckServiceStatus();
        }
        catch (Exception ex)
        {
            AppendLog($"Error refreshing: {ex.Message}", "#ef4444");
        }
    }

    private void LoadPhotoGrid(string[] photos)
    {
        PhotoGrid.Children.Clear();
        PreviewPlaceholder.Visibility = Visibility.Visible;
        PreviewImage.Source = null;

        if (photos.Length == 0)
        {
            PhotoGrid.Children.Add(new TextBlock
            {
                Text = "No photos yet.\nLock your PC and enter\na wrong password to test.",
                Foreground = new SolidColorBrush(Color.FromRgb(100, 116, 139)),
                FontSize = 11,
                Margin = new Thickness(20),
                TextAlignment = System.Windows.TextAlignment.Center
            });
            return;
        }

        foreach (var path in photos)
            PhotoGrid.Children.Add(CreatePhotoCard(path));
    }

    private Border CreatePhotoCard(string path)
    {
        var img = new Image
        {
            Width = 148,
            Height = 100,
            Stretch = Stretch.UniformToFill
        };
        RenderOptions.SetBitmapScalingMode(img, BitmapScalingMode.HighQuality);

        try
        {
            var bmp = new BitmapImage();
            bmp.BeginInit();
            bmp.UriSource = new Uri(path);
            bmp.CacheOption = BitmapCacheOption.OnLoad;
            bmp.DecodePixelWidth = 148;
            bmp.EndInit();
            img.Source = bmp;
        }
        catch { }

        var name = Path.GetFileNameWithoutExtension(path);
        string label;
        try
        {
            var parts = name.Replace("intruder_", "");
            var dt = DateTime.ParseExact(parts, "yyyyMMdd_HHmmss_fff",
                            System.Globalization.CultureInfo.InvariantCulture);
            label = dt.ToString("dd MMM  HH:mm:ss");
        }
        catch { label = name; }

        var stack = new StackPanel();
        stack.Children.Add(img);
        stack.Children.Add(new TextBlock
        {
            Text = label,
            Foreground = new SolidColorBrush(Color.FromRgb(148, 163, 184)),
            FontSize = 9,
            HorizontalAlignment = HorizontalAlignment.Center,
            Margin = new Thickness(0, 2, 0, 4)
        });

        var border = new Border
        {
            Background = new SolidColorBrush(Color.FromRgb(26, 34, 53)),
            CornerRadius = new CornerRadius(8),
            BorderBrush = new SolidColorBrush(Color.FromRgb(30, 58, 95)),
            BorderThickness = new Thickness(1),
            Margin = new Thickness(4),
            Child = stack,
            Cursor = System.Windows.Input.Cursors.Hand
        };

        border.MouseEnter += (_, _) =>
            border.BorderBrush = new SolidColorBrush(Color.FromRgb(14, 165, 233));
        border.MouseLeave += (_, _) =>
            border.BorderBrush = new SolidColorBrush(Color.FromRgb(30, 58, 95));
        border.MouseLeftButtonUp += (_, _) => ShowPreview(path);

        return border;
    }

    private void ShowPreview(string path)
    {
        try
        {
            var bmp = new BitmapImage();
            bmp.BeginInit();
            bmp.UriSource = new Uri(path);
            bmp.CacheOption = BitmapCacheOption.OnLoad;
            bmp.EndInit();
            PreviewImage.Source = bmp;
            PreviewPlaceholder.Visibility = Visibility.Collapsed;
        }
        catch (Exception ex)
        {
            AppendLog($"Preview error: {ex.Message}", "#ef4444");
        }
    }

    private void LoadLog()
    {
        LogBox.Document.Blocks.Clear();
        var incidents = _db.GetAllIncidents().Take(50).ToList();

        AppendLog("─── Intrusion History ───", "#64748b");
        foreach (var inc in incidents)
            AppendLog(
                $"[!] Failed login at {inc.Timestamp:dd MMM yyyy  HH:mm:ss}  |  User: {inc.Username}",
                "#ef4444");

        if (incidents.Count == 0)
            AppendLog("No incidents recorded yet.", "#64748b");
    }

    private void AppendLog(string text, string hexColor)
    {
        var color = (Color)ColorConverter.ConvertFromString(hexColor);
        var para = new Paragraph(new Run(text))
        {
            Foreground = new SolidColorBrush(color),
            Margin = new Thickness(0)
        };
        LogBox.Document.Blocks.Add(para);
        LogBox.ScrollToEnd();
    }

    private void TickOtp()
    {
        if (_otpKey is null) return;
        try
        {
            var totp = new OtpNet.Totp(_otpKey);
            OtpText.Text = totp.ComputeTotp();
            var remaining = totp.RemainingSeconds();
            OtpTimerText.Text = $"{remaining}s";
            OtpText.Foreground = remaining > 10
                ? new SolidColorBrush(Color.FromRgb(59, 130, 246))
                : new SolidColorBrush(Color.FromRgb(245, 158, 11));
        }
        catch { OtpText.Text = "NO KEY"; }
    }

    private static byte[]? LoadOtpKey()
    {
        try
        {
            var path = @"C:\ProgramData\LaptopGuard\otp.secret";
            if (!File.Exists(path)) return null;
            var secret = File.ReadAllText(path).Trim();
            return Base32Encoding.ToBytes(secret);
        }
        catch { return null; }
    }

    private void CheckServiceStatus()
    {
        try
        {
            var sc = new System.ServiceProcess.ServiceController("LaptopGuard");
            var running = sc.Status == System.ServiceProcess.ServiceControllerStatus.Running;
            ServiceStatusText.Text = running ? "● RUNNING" : "● STOPPED";
            ServiceStatusText.Foreground = running
                ? new SolidColorBrush(Color.FromRgb(16, 185, 129))
                : new SolidColorBrush(Color.FromRgb(239, 68, 68));
        }
        catch
        {
            ServiceStatusText.Text = "● NOT INSTALLED";
            ServiceStatusText.Foreground = new SolidColorBrush(Color.FromRgb(245, 158, 11));
        }
    }

    private void RefreshBtn_Click(object sender, RoutedEventArgs e) => Refresh();

    private void OpenFolderBtn_Click(object sender, RoutedEventArgs e)
    {
        Directory.CreateDirectory(_photoFolder);
        Process.Start("explorer.exe", _photoFolder);
    }

    private void StartServiceBtn_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            var sc = new System.ServiceProcess.ServiceController("LaptopGuard");
            sc.Start();
            CheckServiceStatus();
        }
        catch (Exception ex) { MessageBox.Show(ex.Message); }
    }

    private void StopServiceBtn_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            var sc = new System.ServiceProcess.ServiceController("LaptopGuard");
            sc.Stop();
            CheckServiceStatus();
        }
        catch (Exception ex) { MessageBox.Show(ex.Message); }
    }
}