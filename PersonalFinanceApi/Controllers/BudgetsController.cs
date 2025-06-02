using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalFinanceApi.Data;
using PersonalFinanceApi.Models;
using PersonalFinanceApi.DTOs;

namespace PersonalFinanceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BudgetsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Budget>>> GetBudgets()
    {
        return await _context.Budgets
            .Include(b => b.Category)
            .OrderByDescending(b => b.StartDate)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Budget>> GetBudget(int id)
    {
        var budget = await _context.Budgets
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (budget == null)
        {
            return NotFound();
        }

        return budget;
    }

    [HttpGet("month/{year}/{month}")]
    public async Task<ActionResult<IEnumerable<Budget>>> GetBudgetsByMonth(int year, int month)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1);

        return await _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.StartDate < endDate && b.EndDate >= startDate)
            .OrderByDescending(b => b.StartDate)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Budget>> CreateBudget(CreateBudgetDto createBudgetDto)
    {
        // Validate category exists
        var category = await _context.Categories.FindAsync(createBudgetDto.CategoryId);
        if (category == null)
        {
            return BadRequest(new { message = "Invalid category" });
        }

        var budget = new Budget
        {
            CategoryId = createBudgetDto.CategoryId,
            Amount = createBudgetDto.Amount,
            StartDate = createBudgetDto.StartDate,
            EndDate = createBudgetDto.EndDate,
            Name = createBudgetDto.Name
        };

        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();

        // Load the category for the response
        await _context.Entry(budget)
            .Reference(b => b.Category)
            .LoadAsync();

        return CreatedAtAction(nameof(GetBudget), new { id = budget.Id }, budget);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBudget(int id, UpdateBudgetDto updateBudgetDto)
    {
        var budget = await _context.Budgets.FindAsync(id);
        if (budget == null)
        {
            return NotFound();
        }

        // Validate category exists
        var category = await _context.Categories.FindAsync(updateBudgetDto.CategoryId);
        if (category == null)
        {
            return BadRequest(new { message = "Invalid category" });
        }

        budget.CategoryId = updateBudgetDto.CategoryId;
        budget.Amount = updateBudgetDto.Amount;
        budget.StartDate = updateBudgetDto.StartDate;
        budget.EndDate = updateBudgetDto.EndDate;
        budget.Name = updateBudgetDto.Name;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await BudgetExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBudget(int id)
    {
        var budget = await _context.Budgets.FindAsync(id);
        if (budget == null)
        {
            return NotFound();
        }

        _context.Budgets.Remove(budget);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> BudgetExists(int id)
    {
        return await _context.Budgets.AnyAsync(b => b.Id == id);
    }
}