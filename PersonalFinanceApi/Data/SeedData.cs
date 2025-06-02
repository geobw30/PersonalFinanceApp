using PersonalFinanceApi.Models;

namespace PersonalFinanceApi.Data;

public static class SeedData
{
    public static async Task Initialize(ApplicationDbContext context)
    {
        // Check if there's any data
        if (context.Categories.Any())
        {
            return; // DB has been seeded
        }

        // Add Categories
        var categories = new Category[]
        {
            new Category { Name = "Housing", Description = "Rent, mortgage, repairs, etc." },
            new Category { Name = "Transportation", Description = "Car payments, gas, public transit" },
            new Category { Name = "Food", Description = "Groceries and dining out" },
            new Category { Name = "Utilities", Description = "Electricity, water, internet, phone" },
            new Category { Name = "Healthcare", Description = "Insurance, medications, doctor visits" }
        };

        context.Categories.AddRange(categories);
        await context.SaveChangesAsync();

        // Add Budgets
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);
        var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

        var budgets = new Budget[]
        {
            new Budget { Name = "Housing Budget", CategoryId = categories[0].Id, Amount = 1200, StartDate = startOfMonth, EndDate = endOfMonth },
            new Budget { Name = "Transportation Budget", CategoryId = categories[1].Id, Amount = 300, StartDate = startOfMonth, EndDate = endOfMonth },
            new Budget { Name = "Food Budget", CategoryId = categories[2].Id, Amount = 500, StartDate = startOfMonth, EndDate = endOfMonth },
            new Budget { Name = "Utilities Budget", CategoryId = categories[3].Id, Amount = 200, StartDate = startOfMonth, EndDate = endOfMonth },
            new Budget { Name = "Healthcare Budget", CategoryId = categories[4].Id, Amount = 150, StartDate = startOfMonth, EndDate = endOfMonth }
        };

        context.Budgets.AddRange(budgets);
        await context.SaveChangesAsync();

        // Add some sample expenses
        var expenses = new Expense[]
        {
            new Expense { CategoryId = categories[0].Id, Amount = 1100, Date = now.AddDays(-5), Description = "Monthly Rent" },
            new Expense { CategoryId = categories[1].Id, Amount = 45, Date = now.AddDays(-3), Description = "Gas" },
            new Expense { CategoryId = categories[2].Id, Amount = 85, Date = now.AddDays(-2), Description = "Grocery Shopping" },
            new Expense { CategoryId = categories[3].Id, Amount = 75, Date = now.AddDays(-1), Description = "Internet Bill" }
        };

        context.Expenses.AddRange(expenses);
        await context.SaveChangesAsync();

        // Add investment types
        var investmentTypes = new InvestmentType[]
        {
            new InvestmentType { Name = "Stocks", Description = "Individual company shares and stock market investments" },
            new InvestmentType { Name = "Bonds", Description = "Fixed income securities" },
            new InvestmentType { Name = "Real Estate", Description = "Property investments" },
            new InvestmentType { Name = "Mutual Funds", Description = "Professionally managed investment funds" },
            new InvestmentType { Name = "ETF", Description = "Exchange-traded funds" },
            new InvestmentType { Name = "Retirement", Description = "Retirement-specific investment accounts" },
            new InvestmentType { Name = "Cryptocurrency", Description = "Digital currency investments" },
            new InvestmentType { Name = "Other", Description = "Other types of investments" }
        };

        context.InvestmentTypes.AddRange(investmentTypes);
        await context.SaveChangesAsync();

        // Add sample investments
        var investments = new Investment[]
        {
            new Investment {
                Name = "Stock Portfolio",
                InvestmentTypeId = investmentTypes.First(t => t.Name == "Stocks").Id,
                Amount = 10000,
                CurrentValue = 12000,
                Date = now.AddMonths(-6),
                ReturnRate = 20.0M
            },
            new Investment {
                Name = "401(k)",
                InvestmentTypeId = investmentTypes.First(t => t.Name == "Retirement").Id,
                Amount = 50000,
                CurrentValue = 55000,
                Date = now.AddYears(-2),
                ReturnRate = 10.0M
            }
        };

        context.Investments.AddRange(investments);
        await context.SaveChangesAsync();

        // Add sample savings
        var savings = new Saving[]
        {
            new Saving { Name = "Emergency Fund", Type = "Emergency", CurrentAmount = 5000, TargetAmount = 10000, Date = now.AddMonths(-12), InterestRate = 1.5M },
            new Saving { Name = "House Down Payment", Type = "Goal", CurrentAmount = 15000, TargetAmount = 50000, Date = now.AddMonths(-24), InterestRate = 2.0M }
        };

        context.Savings.AddRange(savings);
        await context.SaveChangesAsync();

        // Add sample income records
        var incomes = new Income[]
        {
            new Income { Source = "Salary", Type = "Employment", Amount = 5000, Date = now.AddDays(-15), IsRecurring = true, Frequency = "monthly" },
            new Income { Source = "Freelance", Type = "Contract", Amount = 1000, Date = now.AddDays(-7), IsRecurring = false }
        };

        context.Incomes.AddRange(incomes);
        await context.SaveChangesAsync();
    }
}