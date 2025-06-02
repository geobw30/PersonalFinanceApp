using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalFinanceApi.Data;
using PersonalFinanceApi.Models;

namespace PersonalFinanceApi.Controllers;

[ApiController]
[Route("api/financial-summary")]
public class FinancialSummaryController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FinancialSummaryController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetFinancialSummary()
    {
        var totalInvestments = await _context.Investments.SumAsync(i => i.CurrentValue);
        var totalSavings = await _context.Savings.SumAsync(s => s.CurrentAmount);

        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);
        var endOfMonth = startOfMonth.AddMonths(1);
        var startOfYear = new DateTime(now.Year, 1, 1);
        var endOfYear = startOfYear.AddYears(1);

        var monthlyIncome = await _context.Incomes
            .Where(i => i.Date >= startOfMonth && i.Date < endOfMonth)
            .SumAsync(i => i.Amount);

        var yearlyIncome = await _context.Incomes
            .Where(i => i.Date >= startOfYear && i.Date < endOfYear)
            .SumAsync(i => i.Amount);

        // Add recurring monthly incomes
        var recurringMonthlyIncome = await _context.Incomes
            .Where(i => i.IsRecurring && i.Frequency == "monthly")
            .SumAsync(i => i.Amount);

        monthlyIncome += recurringMonthlyIncome;
        yearlyIncome += recurringMonthlyIncome * 12;

        // Add recurring weekly incomes
        var recurringWeeklyIncome = await _context.Incomes
            .Where(i => i.IsRecurring && i.Frequency == "weekly")
            .SumAsync(i => i.Amount);

        monthlyIncome += recurringWeeklyIncome * 4; // Approximate 4 weeks per month
        yearlyIncome += recurringWeeklyIncome * 52;

        // Add recurring annual incomes
        var recurringAnnualIncome = await _context.Incomes
            .Where(i => i.IsRecurring && i.Frequency == "annually")
            .SumAsync(i => i.Amount);

        yearlyIncome += recurringAnnualIncome;
        monthlyIncome += recurringAnnualIncome / 12;

        var netWorth = totalInvestments + totalSavings;

        return new
        {
            totalInvestments,
            totalSavings,
            monthlyIncome,
            yearlyIncome,
            netWorth
        };
    }

    [HttpGet("month/{year}/{month}")]
    public async Task<ActionResult<object>> GetMonthlyFinancialSummary(int year, int month)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1);

        var totalInvestments = await _context.Investments
            .Where(i => i.Date < endDate)
            .SumAsync(i => i.CurrentValue);

        var totalSavings = await _context.Savings
            .Where(s => s.Date < endDate)
            .SumAsync(s => s.CurrentAmount);

        var monthlyIncome = await _context.Incomes
            .Where(i => i.Date >= startDate && i.Date < endDate)
            .SumAsync(i => i.Amount);

        // Add recurring monthly incomes
        var recurringMonthlyIncome = await _context.Incomes
            .Where(i => i.IsRecurring && i.Frequency == "monthly" && i.Date <= endDate)
            .SumAsync(i => i.Amount);

        monthlyIncome += recurringMonthlyIncome;

        // Add recurring weekly incomes
        var recurringWeeklyIncome = await _context.Incomes
            .Where(i => i.IsRecurring && i.Frequency == "weekly" && i.Date <= endDate)
            .SumAsync(i => i.Amount);

        monthlyIncome += recurringWeeklyIncome * 4; // Approximate 4 weeks per month

        // Add portion of annual incomes
        var recurringAnnualIncome = await _context.Incomes
            .Where(i => i.IsRecurring && i.Frequency == "annually" && i.Date <= endDate)
            .SumAsync(i => i.Amount);

        monthlyIncome += recurringAnnualIncome / 12;

        var yearlyIncome = monthlyIncome * 12;
        var netWorth = totalInvestments + totalSavings;

        return new
        {
            totalInvestments,
            totalSavings,
            monthlyIncome,
            yearlyIncome,
            netWorth
        };
    }
}