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