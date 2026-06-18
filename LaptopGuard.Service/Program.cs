using LaptopGuard.Service;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddWindowsService(options =>
{
    options.ServiceName = "LaptopGuard";
});

builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();