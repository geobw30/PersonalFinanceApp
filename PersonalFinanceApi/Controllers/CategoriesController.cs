using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalFinanceApi.Data;
using PersonalFinanceApi.Models;
using PersonalFinanceApi.DTOs;

namespace PersonalFinanceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        return await _context.Categories.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category == null)
        {
            return NotFound();
        }

        return category;
    }

    [HttpGet("{id}/usage")]
    public async Task<ActionResult<object>> GetCategoryUsage(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return NotFound();
        }

        var budgetCount = await _context.Budgets.CountAsync(b => b.CategoryId == id);
        var expenseCount = await _context.Expenses.CountAsync(e => e.CategoryId == id);

        return new
        {
            InUse = budgetCount > 0 || expenseCount > 0,
            UsageDetails = new
            {
                Budgets = budgetCount,
                Expenses = expenseCount
            }
        };
    }

    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, UpdateCategoryDto updateCategoryDto)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return NotFound();
        }

        category.Name = updateCategoryDto.Name;
        category.Description = updateCategoryDto.Description;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CategoryExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return NotFound();
        }

        // Check if category is in use
        var budgetCount = await _context.Budgets.CountAsync(b => b.CategoryId == id);
        var expenseCount = await _context.Expenses.CountAsync(e => e.CategoryId == id);

        if (budgetCount > 0 || expenseCount > 0)
        {
            return BadRequest(new { message = $"Cannot delete category. It is being used by {budgetCount} budgets and {expenseCount} expenses." });
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CategoryExists(int id)
    {
        return _context.Categories.Any(e => e.Id == id);
    }
}