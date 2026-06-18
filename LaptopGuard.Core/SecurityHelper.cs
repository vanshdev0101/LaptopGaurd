using System.Security.Cryptography;

namespace LaptopGuard.Core;

public static class SecurityHelper
{
    // ── Hashing ───────────────────────────────────────────────────────────────

    public static string HashFile(string filePath)
    {
        using var sha256 = SHA256.Create();
        using var stream = File.OpenRead(filePath);
        var hash = sha256.ComputeHash(stream);
        return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
    }

    public static string HashBytes(byte[] data)
    {
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(data);
        return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
    }

    // ── AES-256 Encryption ────────────────────────────────────────────────────

    public static byte[] EncryptFile(string filePath, byte[] key)
    {
        var plainBytes = File.ReadAllBytes(filePath);
        using var aes = Aes.Create();
        aes.Key = key;
        aes.GenerateIV();

        using var ms = new MemoryStream();
        using var encryptor = aes.CreateEncryptor();
        using var cryptoStream = new CryptoStream(ms, encryptor, CryptoStreamMode.Write);

        // prepend IV so we can decrypt later
        ms.Write(aes.IV, 0, aes.IV.Length);
        cryptoStream.Write(plainBytes, 0, plainBytes.Length);
        cryptoStream.FlushFinalBlock();

        return ms.ToArray();
    }

    public static byte[] DecryptBytes(byte[] encryptedData, byte[] key)
    {
        using var aes = Aes.Create();
        aes.Key = key;

        // extract IV from first 16 bytes
        var iv = new byte[16];
        Array.Copy(encryptedData, 0, iv, 0, 16);
        aes.IV = iv;

        using var ms = new MemoryStream(encryptedData, 16, encryptedData.Length - 16);
        using var decryptor = aes.CreateDecryptor();
        using var cryptoStream = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
        using var result = new MemoryStream();
        cryptoStream.CopyTo(result);
        return result.ToArray();
    }

    // ── Key Management ────────────────────────────────────────────────────────

    public static byte[] GenerateAesKey()
    {
        var key = new byte[32]; // 256-bit
        RandomNumberGenerator.Fill(key);
        return key;
    }

    public static byte[] LoadOrCreateKey(string keyPath)
    {
        if (File.Exists(keyPath))
            return File.ReadAllBytes(keyPath);

        var key = GenerateAesKey();
        File.WriteAllBytes(keyPath, key);
        return key;
    }

    // ── OTP ───────────────────────────────────────────────────────────────────

    public static string GenerateOtpSecret()
    {
        var bytes = new byte[20];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }
}