using System;
using Microsoft.Data.SqlClient;

var connectionString = "Server=tcp:mssql-azure-pfa.database.windows.net,1433;" +
                               "Initial Catalog=PersonalFinanceDb;" +
                               "Persist Security Info=False;" +
                               "User ID=geobw30;" +
                               "Password=3N73ri2e-;" +
                               "MultipleActiveResultSets=False;" +
                               "Encrypt=True;" +
                               "TrustServerCertificate=False;" +
                               "Connection Timeout=30;";

try
{
    using (var conn = new SqlConnection(connectionString))
    {
        conn.Open();
        Console.WriteLine("Connected successfully!");

        using (var cmd = new SqlCommand("SELECT TOP 1 name FROM sys.databases", conn))
        using (var reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                Console.WriteLine($"Database: {reader.GetString(0)}");
            }
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine("Connection failed: " + ex.Message);
}
