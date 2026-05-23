using Microsoft.EntityFrameworkCore;
using PersonalFinanceApi.Models;

namespace PersonalFinanceApi.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<SubCategory> SubCategories { get; set; } = null!;
    public DbSet<Budget> Budgets { get; set; } = null!;
    public DbSet<Expense> Expenses { get; set; } = null!;
    public DbSet<Investment> Investments { get; set; } = null!;
    public DbSet<InvestmentType> InvestmentTypes { get; set; } = null!;
    public DbSet<Saving> Savings { get; set; } = null!;
    public DbSet<Income> Incomes { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure SubCategory → Category relationship
        modelBuilder.Entity<SubCategory>()
            .HasOne(sc => sc.Category)
            .WithMany(c => c.SubCategories)
            .HasForeignKey(sc => sc.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Expense → SubCategory relationship
        modelBuilder.Entity<Expense>()
            .HasOne(e => e.SubCategory)
            .WithMany(sc => sc.Expenses)
            .HasForeignKey(e => e.SubCategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure relationships for Budget
        modelBuilder.Entity<Budget>()
            .HasOne(b => b.Category)
            .WithMany(c => c.Budgets)
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure relationships for Expense
        modelBuilder.Entity<Expense>()
            .HasOne(e => e.Category)
            .WithMany(c => c.Expenses)
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure relationships for Investment
        modelBuilder.Entity<Investment>()
            .HasOne(i => i.InvestmentType)
            .WithMany(t => t.Investments)
            .HasForeignKey(i => i.InvestmentTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure decimal precision for amounts
        modelBuilder.Entity<Budget>()
            .Property(b => b.Amount)
            .HasColumnType("decimal(18,2)");

        // Add query indexes for common date-based filters and sorting.
        modelBuilder.Entity<Budget>()
            .HasIndex(b => new { b.StartDate, b.EndDate });

        modelBuilder.Entity<Budget>()
            .HasIndex(b => new { b.CategoryId, b.StartDate });

        modelBuilder.Entity<Expense>()
            .Property(e => e.Amount)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Expense>()
            .HasIndex(e => e.Date);

        modelBuilder.Entity<Expense>()
            .HasIndex(e => new { e.CategoryId, e.Date });

        modelBuilder.Entity<Income>()
            .HasIndex(i => i.Date);

        modelBuilder.Entity<Income>()
            .HasIndex(i => new { i.IsRecurring, i.Frequency, i.Date });

        // Seed investment types
        modelBuilder.Entity<InvestmentType>().HasData(
            new InvestmentType { Id = 1, Name = "Stocks", Description = "Individual company shares and stock market investments" },
            new InvestmentType { Id = 2, Name = "Bonds", Description = "Fixed income securities" },
            new InvestmentType { Id = 3, Name = "Real Estate", Description = "Property investments" },
            new InvestmentType { Id = 4, Name = "Mutual Funds", Description = "Professionally managed investment funds" },
            new InvestmentType { Id = 5, Name = "ETF", Description = "Exchange-traded funds" },
            new InvestmentType { Id = 6, Name = "Retirement", Description = "Retirement-specific investment accounts" },
            new InvestmentType { Id = 7, Name = "Cryptocurrency", Description = "Digital currency investments" },
            new InvestmentType { Id = 8, Name = "Other", Description = "Other types of investments" }
        );
    }
}