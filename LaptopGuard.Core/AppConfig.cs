using System.Text.Json;

namespace LaptopGuard.Core;

public class AppConfig
{
    public string DatabasePath { get; set; } =
        @"C:\ProgramData\LaptopGuard\laptopguard.db";

    public string PhotosFolder { get; set; } =
        @"C:\ProgramData\LaptopGuard\Photos";

    public string EncryptedFolder { get; set; } =
        @"C:\ProgramData\LaptopGuard\Encrypted";

    public string LogsFolder { get; set; } =
        @"C:\ProgramData\LaptopGuard\Logs";

    public bool EnableEncryption { get; set; } = true;

    public bool EnableCloudUpload { get; set; } = false;

    public int DuplicateWindowSeconds { get; set; } = 5;

    public static AppConfig Load(string configPath)
    {
        if (!File.Exists(configPath))
        {
            var config = new AppConfig();

            var json = JsonSerializer.Serialize(
                config,
                new JsonSerializerOptions
                {
                    WriteIndented = true
                });

            File.WriteAllText(configPath, json);

            return config;
        }

        var fileContent = File.ReadAllText(configPath);

        return JsonSerializer.Deserialize<AppConfig>(fileContent)
               ?? new AppConfig();
    }

    public void Save(string configPath)
    {
        var json = JsonSerializer.Serialize(
            this,
            new JsonSerializerOptions
            {
                WriteIndented = true
            });

        File.WriteAllText(configPath, json);
    }
}