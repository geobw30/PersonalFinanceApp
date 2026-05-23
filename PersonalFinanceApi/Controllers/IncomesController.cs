using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalFinanceApi.Data;
using PersonalFinanceApi.Models;

namespace PersonalFinanceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IncomesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public IncomesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Income>>> GetIncomes()
    {
        return await _context.Incomes
            .AsNoTracking()
            .OrderByDescending(i => i.Date)
            .ToListAsync();
    }

    [HttpGet("month/{year}/{month}")]
    public async Task<ActionResult<IEnumerable<Income>>> GetIncomesByMonth(int year, int month)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1);

        return await _context.Incomes
            .AsNoTracking()
            .Where(i => i.Date >= startDate && i.Date < endDate)
            .OrderByDescending(i => i.Date)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Income>> GetIncome(int id)
    {
        var income = await _context.Incomes
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id);

        if (income == null)
        {
            return NotFound();
        }

        return income;
    }

    [HttpPost]
    public async Task<ActionResult<Income>> CreateIncome(Income income)
    {
        _context.Incomes.Add(income);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetIncome), new { id = income.Id }, income);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIncome(int id, Income income)
    {
        if (id != income.Id)
        {
            return BadRequest();
        }

        _context.Entry(income).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await IncomeExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIncome(int id)
    {
        var income = await _context.Incomes.FindAsync(id);
        if (income == null)
        {
            return NotFound();
        }

        _context.Incomes.Remove(income);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> IncomeExists(int id)
    {
        return await _context.Incomes.AnyAsync(e => e.Id == id);
    }
}