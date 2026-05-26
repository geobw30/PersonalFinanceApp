using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalFinanceApi.Data;
using PersonalFinanceApi.Models;
using PersonalFinanceApi.DTOs;

namespace PersonalFinanceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ExpensesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses()
    {
        return await _context.Expenses
            .AsNoTracking()
            .Include(e => e.Category)
            .Include(e => e.SubCategory)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Expense>> GetExpense(int id)
    {
        var expense = await _context.Expenses
            .AsNoTracking()
            .Include(e => e.Category)
            .Include(e => e.SubCategory)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (expense == null)
        {
            return NotFound();
        }

        return expense;
    }

    [HttpGet("month/{year}/{month}")]
    public async Task<ActionResult<IEnumerable<Expense>>> GetExpensesByMonth(int year, int month)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1);

        return await _context.Expenses
            .AsNoTracking()
            .Include(e => e.Category)
            .Include(e => e.SubCategory)
            .Where(e => e.Date >= startDate && e.Date < endDate)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
    }

    [HttpGet("summary/{year}/{month}")]
    public async Task<ActionResult<object>> GetMonthlySummary(int year, int month)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1);

        var expenses = await _context.Categories
            .AsNoTracking()
            .Select(c => new
            {
                CategoryId = c.Id,
                CategoryName = c.Name,
                TotalAmount = c.Expenses
                    .Where(e => e.Date >= startDate && e.Date < endDate)
                    .Sum(e => e.Amount)
            })
            .ToListAsync();

        var budgets = await _context.Budgets
            .AsNoTracking()
            .Where(b => b.StartDate <= endDate && b.EndDate >= startDate)
            .ToDictionaryAsync(b => b.CategoryId, b => b.Amount);

        var summary = expenses.Select(e => new
        {
            e.CategoryId,
            e.CategoryName,
            e.TotalAmount,
            BudgetAmount = budgets.GetValueOrDefault(e.CategoryId),
            RemainingAmount = budgets.GetValueOrDefault(e.CategoryId) - e.TotalAmount
        });

        return Ok(summary);
    }

    [HttpGet("budget-report/{year}/{month}")]
    public async Task<ActionResult<object>> GetBudgetReport(int year, int month)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1);

        var expenses = await _context.Expenses
            .AsNoTracking()
            .Where(e => e.Date >= startDate && e.Date < endDate)
            .Select(e => new
            {
                e.CategoryId,
                CategoryName = e.Category != null ? e.Category.Name : string.Empty,
                e.SubCategoryId,
                SubCategoryName = e.SubCategory != null ? e.SubCategory.Name : null,
                e.Amount
            })
            .ToListAsync();

        // Load budgets active in this month — use strict < on endDate to avoid bleeding into the next period
        var budgets = await _context.Budgets
            .AsNoTracking()
            .Where(b => b.StartDate < endDate && b.EndDate >= startDate)
            .ToDictionaryAsync(b => b.CategoryId, b => b.Amount);

        // Load all categories
        var categories = await _context.Categories
            .AsNoTracking()
            .Select(c => new { c.Id, c.Name })
            .ToListAsync();

        var report = categories
            .Select(cat =>
            {
                var catExpenses = expenses.Where(e => e.CategoryId == cat.Id).ToList();
                var totalActual = catExpenses.Sum(e => e.Amount);
                var budget = budgets.GetValueOrDefault(cat.Id, 0);

                // Group by subcategory — named subcategories only, sorted by amount
                var subGroups = catExpenses
                    .Where(e => e.SubCategoryId != null)
                    .GroupBy(e => new { e.SubCategoryId, e.SubCategoryName })
                    .Select(g => new
                    {
                        SubCategoryId = g.Key.SubCategoryId,
                        SubCategoryName = g.Key.SubCategoryName ?? string.Empty,
                        TotalAmount = g.Sum(e => e.Amount)
                    })
                    .OrderByDescending(g => g.TotalAmount)
                    .ToList();

                return new
                {
                    CategoryId = cat.Id,
                    CategoryName = cat.Name,
                    BudgetAmount = budget,
                    TotalAmount = totalActual,
                    RemainingAmount = budget - totalActual,
                    SubCategories = subGroups
                };
            })
            .Where(r => r.BudgetAmount > 0 || r.TotalAmount > 0)
            .OrderByDescending(r => r.TotalAmount)
            .ToList();

        return Ok(report);
    }

    [HttpGet("trends/monthly/{months}")]
    public async Task<ActionResult<IEnumerable<MonthlySpendingTrendDto>>> GetMonthlySpendingTrends(int months)
    {
        if (months < 1 || months > 24)
        {
            months = 6;
        }

        var now = DateTime.UtcNow;
        var targetStart = new DateTime(now.Year, now.Month, 1);
        var startDate = targetStart.AddMonths(-(months - 1));
        var endDate = targetStart.AddMonths(1);

        var monthlyTotals = await _context.Expenses
            .AsNoTracking()
            .Where(e => e.Date >= startDate && e.Date < endDate)
            .GroupBy(e => new { e.Date.Year, e.Date.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                TotalAmount = g.Sum(e => e.Amount)
            })
            .ToListAsync();

        var totalsByKey = monthlyTotals.ToDictionary(x => x.Year * 100 + x.Month, x => x.TotalAmount);

        var result = Enumerable.Range(0, months)
            .Select(i => targetStart.AddMonths(-months + i))
            .Select((month, index) =>
            {
                var key = month.Year * 100 + month.Month;
                var totalAmount = totalsByKey.TryGetValue(key, out var amount) ? amount : 0m;
                var previousKey = month.AddMonths(-1).Year * 100 + month.AddMonths(-1).Month;
                var previousTotal = totalsByKey.TryGetValue(previousKey, out var prevAmount) ? prevAmount : 0m;
                var changePercent = previousTotal == 0m
                    ? (totalAmount == 0m ? 0m : 100m)
                    : Math.Round((totalAmount - previousTotal) / previousTotal * 100m, 2);

                return new MonthlySpendingTrendDto
                {
                    Month = month,
                    TotalAmount = totalAmount,
                    ChangePercent = changePercent
                };
            })
            .ToList();

        return Ok(result);
    }

    [HttpGet("trends/categories/{months}")]
    public async Task<ActionResult<IEnumerable<CategorySpendingTrendDto>>> GetCategorySpendingTrends(int months)
    {
        if (months < 2 || months > 24)
        {
            months = 6;
        }

        var now = DateTime.UtcNow;
        var currentMonthStart = new DateTime(now.Year, now.Month, 1);
        var currentMonthEnd = currentMonthStart.AddMonths(1);
        var previousMonthStart = currentMonthStart.AddMonths(-1);
        var previousMonthEnd = currentMonthStart;
        var historyStart = currentMonthStart.AddMonths(-months);

        var categoryGroups = await _context.Expenses
            .AsNoTracking()
            .Where(e => e.Date >= historyStart && e.Date < currentMonthEnd)
            .GroupBy(e => new { e.CategoryId, e.Date.Year, e.Date.Month })
            .Select(g => new
            {
                g.Key.CategoryId,
                g.Key.Year,
                g.Key.Month,
                TotalAmount = g.Sum(e => e.Amount)
            })
            .ToListAsync();

        var currentTotals = categoryGroups
            .Where(x => x.Year == currentMonthStart.Year && x.Month == currentMonthStart.Month)
            .ToDictionary(x => x.CategoryId, x => x.TotalAmount);

        var previousTotals = categoryGroups
            .Where(x => x.Year == previousMonthStart.Year && x.Month == previousMonthStart.Month)
            .ToDictionary(x => x.CategoryId, x => x.TotalAmount);

        var monthlyAverages = categoryGroups
            .Where(x => x.Year < currentMonthStart.Year || x.Month < currentMonthStart.Month)
            .GroupBy(x => x.CategoryId)
            .ToDictionary(g => g.Key, g => g.Sum(x => x.TotalAmount) / months);

        var categories = await _context.Categories
            .AsNoTracking()
            .Select(c => new { c.Id, c.Name })
            .ToListAsync();

        var results = categories
            .Select(c =>
            {
                var currentAmount = currentTotals.GetValueOrDefault(c.Id);
                var previousAmount = previousTotals.GetValueOrDefault(c.Id);
                var averageAmount = monthlyAverages.GetValueOrDefault(c.Id);
                var changePercent = previousAmount == 0m
                    ? (currentAmount == 0m ? 0m : 100m)
                    : Math.Round((currentAmount - previousAmount) / previousAmount * 100m, 2);

                return new CategorySpendingTrendDto
                {
                    CategoryId = c.Id,
                    CategoryName = c.Name,
                    CurrentMonthAmount = currentAmount,
                    PreviousMonthAmount = previousAmount,
                    AverageMonthlyAmount = Math.Round(averageAmount, 2),
                    ChangePercent = changePercent
                };
            })
            .Where(r => r.CurrentMonthAmount > 0m || r.PreviousMonthAmount > 0m)
            .OrderByDescending(r => r.ChangePercent)
            .ThenByDescending(r => r.CurrentMonthAmount)
            .ToList();

        return Ok(results);
    }

    [HttpGet("predictive-budget/{year}/{month}")]
    public async Task<ActionResult<IEnumerable<PredictiveBudgetDto>>> GetPredictiveBudget(int year, int month)
    {
        var targetStart = new DateTime(year, month, 1);
        var targetEnd = targetStart.AddMonths(1);
        var historyStart = targetStart.AddMonths(-3);
        var now = DateTime.UtcNow;
        var isCurrentMonth = now.Year == year && now.Month == month;
        var daysPassed = isCurrentMonth ? Math.Max(1, (now - targetStart).Days + 1) : DateTime.DaysInMonth(year, month);
        var daysInMonth = DateTime.DaysInMonth(year, month);

        var expenseGroups = await _context.Expenses
            .AsNoTracking()
            .Where(e => e.Date >= historyStart && e.Date < targetEnd)
            .GroupBy(e => new { e.CategoryId, Year = e.Date.Year, Month = e.Date.Month })
            .Select(g => new
            {
                g.Key.CategoryId,
                g.Key.Year,
                g.Key.Month,
                TotalAmount = g.Sum(e => e.Amount)
            })
            .ToListAsync();

        var spendingByCategory = expenseGroups
            .GroupBy(x => x.CategoryId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var budgets = await _context.Budgets
            .AsNoTracking()
            .Where(b => b.StartDate < targetEnd && b.EndDate >= targetStart)
            .ToDictionaryAsync(b => b.CategoryId, b => b.Amount);

        var categories = await _context.Categories
            .AsNoTracking()
            .Select(c => new { c.Id, c.Name })
            .ToListAsync();

        var results = categories.Select(c =>
        {
            spendingByCategory.TryGetValue(c.Id, out var entries);
            var actualThisMonth = entries?.FirstOrDefault(x => x.Year == year && x.Month == month)?.TotalAmount ?? 0m;
            var historicalTotal = entries?
                .Where(x => x.Year * 100 + x.Month < year * 100 + month)
                .Sum(x => x.TotalAmount) ?? 0m;
            var averageHistorical = historicalTotal / 3m;
            var predictedSpend = isCurrentMonth
                ? actualThisMonth / daysPassed * daysInMonth
                : averageHistorical;
            if (predictedSpend < 0m) predictedSpend = 0m;
            if (predictedSpend == 0m && averageHistorical > 0m)
            {
                predictedSpend = averageHistorical;
            }
            predictedSpend = Math.Round(predictedSpend, 2);

            budgets.TryGetValue(c.Id, out var budgetAmount);
            var suggestedBudget = budgetAmount > 0m
                ? Math.Max(budgetAmount, predictedSpend)
                : predictedSpend;
            suggestedBudget = Math.Round(suggestedBudget, 2);

            var outlook = budgetAmount <= 0m
                ? "No budget set"
                : predictedSpend > budgetAmount
                    ? "At risk"
                    : "On track";

            return new PredictiveBudgetDto
            {
                CategoryId = c.Id,
                CategoryName = c.Name,
                BudgetAmount = budgetAmount,
                ActualToDate = actualThisMonth,
                PredictedSpend = predictedSpend,
                SuggestedBudget = suggestedBudget,
                Outlook = outlook
            };
        })
        .Where(r => r.BudgetAmount > 0m || r.PredictedSpend > 0m)
        .OrderByDescending(r => r.PredictedSpend)
        .ToList();

        return Ok(results);
    }

    [HttpPost]
    public async Task<ActionResult<Expense>> CreateExpense(CreateExpenseDto createExpenseDto)
    {
        // Validate category exists
        var category = await _context.Categories.FindAsync(createExpenseDto.CategoryId);
        if (category == null)
        {
            return BadRequest(new { message = "Invalid category" });
        }

        // Validate subcategory if provided
        if (createExpenseDto.SubCategoryId.HasValue)
        {
            var subCategory = await _context.SubCategories.FindAsync(createExpenseDto.SubCategoryId.Value);
            if (subCategory == null || subCategory.CategoryId != createExpenseDto.CategoryId)
                return BadRequest(new { message = "Invalid subcategory for the selected category" });
        }

        var expense = new Expense
        {
            CategoryId = createExpenseDto.CategoryId,
            SubCategoryId = createExpenseDto.SubCategoryId,
            Amount = createExpenseDto.Amount,
            Date = createExpenseDto.Date,
            Description = createExpenseDto.Description,
            Notes = createExpenseDto.Notes
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        // Load the category and subcategory for the response
        await _context.Entry(expense).Reference(e => e.Category).LoadAsync();
        if (expense.SubCategoryId.HasValue)
            await _context.Entry(expense).Reference(e => e.SubCategory).LoadAsync();

        return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExpense(int id, UpdateExpenseDto updateExpenseDto)
    {
        var expense = await _context.Expenses.FindAsync(id);
        if (expense == null)
        {
            return NotFound();
        }

        // Validate category exists
        var category = await _context.Categories.FindAsync(updateExpenseDto.CategoryId);
        if (category == null)
        {
            return BadRequest(new { message = "Invalid category" });
        }

        // Validate subcategory if provided
        if (updateExpenseDto.SubCategoryId.HasValue)
        {
            var subCategory = await _context.SubCategories.FindAsync(updateExpenseDto.SubCategoryId.Value);
            if (subCategory == null || subCategory.CategoryId != updateExpenseDto.CategoryId)
                return BadRequest(new { message = "Invalid subcategory for the selected category" });
        }

        expense.CategoryId = updateExpenseDto.CategoryId;
        expense.SubCategoryId = updateExpenseDto.SubCategoryId;
        expense.Amount = updateExpenseDto.Amount;
        expense.Date = updateExpenseDto.Date;
        expense.Description = updateExpenseDto.Description;
        expense.Notes = updateExpenseDto.Notes;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await ExpenseExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        var expense = await _context.Expenses.FindAsync(id);
        if (expense == null)
        {
            return NotFound();
        }

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> ExpenseExists(int id)
    {
        return await _context.Expenses.AnyAsync(e => e.Id == id);
    }
}