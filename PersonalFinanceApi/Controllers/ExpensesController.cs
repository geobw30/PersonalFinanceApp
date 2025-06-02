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
            .Include(e => e.Category)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Expense>> GetExpense(int id)
    {
        var expense = await _context.Expenses
            .Include(e => e.Category)
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
            .Include(e => e.Category)
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

    [HttpPost]
    public async Task<ActionResult<Expense>> CreateExpense(CreateExpenseDto createExpenseDto)
    {
        // Validate category exists
        var category = await _context.Categories.FindAsync(createExpenseDto.CategoryId);
        if (category == null)
        {
            return BadRequest(new { message = "Invalid category" });
        }

        var expense = new Expense
        {
            CategoryId = createExpenseDto.CategoryId,
            Amount = createExpenseDto.Amount,
            Date = createExpenseDto.Date,
            Description = createExpenseDto.Description,
            Notes = createExpenseDto.Notes
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        // Load the category for the response
        await _context.Entry(expense)
            .Reference(e => e.Category)
            .LoadAsync();

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

        expense.CategoryId = updateExpenseDto.CategoryId;
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