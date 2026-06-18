using OpenCvSharp;

namespace LaptopGuard.Service;

public class CameraCapture : IDisposable
{
    private readonly string _saveFolder;
    private readonly string _cascadePath;
    private VideoCapture? _camera;

    public CameraCapture(string saveFolder)
    {
        _saveFolder = saveFolder;
        _cascadePath = Path.Combine(AppContext.BaseDirectory, "haarcascade_frontalface_default.xml");
        Directory.CreateDirectory(_saveFolder);
    }

    public List<string> CapturePhotos(int count = 3)
    {
        var paths = new List<string>();
        try
        {
            _camera = new VideoCapture(0);
            if (!_camera.IsOpened())
            {
                Console.WriteLine("[!] Camera not available.");
                return paths;
            }

            Thread.Sleep(800); // warm up

            for (int i = 0; i < count; i++)
            {
                using var frame = new Mat();
                _camera.Read(frame);
                if (frame.Empty()) continue;

                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss_fff");

                // save full photo
                var fullPath = Path.Combine(_saveFolder, $"intruder_{timestamp}.jpg");
                Cv2.ImWrite(fullPath, frame);
                paths.Add(fullPath);

                // try face detection and save cropped face
                TrySaveFaceCrop(frame, timestamp);

                if (i < count - 1)
                    Thread.Sleep(500);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[!] Camera error: {ex.Message}");
        }
        finally
        {
            _camera?.Release();
            _camera?.Dispose();
            _camera = null;
        }

        return paths;
    }

    private void TrySaveFaceCrop(Mat frame, string timestamp)
    {
        try
        {
            if (!File.Exists(_cascadePath)) return;

            using var cascade = new CascadeClassifier(_cascadePath);
            using var gray = new Mat();
            Cv2.CvtColor(frame, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.EqualizeHist(gray, gray);

            var faces = cascade.DetectMultiScale(
                gray, scaleFactor: 1.1, minNeighbors: 5,
                minSize: new Size(60, 60));

            if (faces.Length == 0) return;

            // crop the largest face
            var face = faces.OrderByDescending(f => f.Width * f.Height).First();
            var faceMat = new Mat(frame, face);
            var facePath = Path.Combine(_saveFolder, $"face_{timestamp}.jpg");
            Cv2.ImWrite(facePath, faceMat);
        }
        catch { /* face detection is best-effort */ }
    }

    public void Dispose()
    {
        _camera?.Dispose();
    }
}