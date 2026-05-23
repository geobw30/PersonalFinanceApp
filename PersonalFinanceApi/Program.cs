using System;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using PersonalFinanceApi.Data;
using AutoMapper;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Register AutoMapper profiles
builder.Services.AddAutoMapper(typeof(Program));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DB Context with Azure SQL resiliency
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null)));

// Add CORS
builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>()
        ?? new[] { "http://localhost:5173" };

    options.AddPolicy("AllowReactApp",
        corsBuilder => corsBuilder
            .WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    app.Urls.Add($"http://0.0.0.0:{port}");
}

// Run migrations as a separate release process if requested.
if (args.Any(arg => string.Equals(arg, "--migrate", StringComparison.OrdinalIgnoreCase)))
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        await context.Database.MigrateAsync();
        logger.LogInformation("Database migrations applied successfully in release phase.");
        return;
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while applying database migrations in release phase.");
        throw;
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

var disableHttpsRedirection = builder.Configuration.GetValue<bool>("DisableHttpsRedirection");
if (!disableHttpsRedirection)
{
    app.UseHttpsRedirection();
}
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapGet("/health", () => Results.Ok("Healthy"));
app.MapGet("/ready", async (ApplicationDbContext db) =>
    await db.Database.CanConnectAsync()
        ? Results.Ok("Ready")
        : Results.StatusCode(StatusCodes.Status503ServiceUnavailable));
app.MapControllers();

app.Run();
