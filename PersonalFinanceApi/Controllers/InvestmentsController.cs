using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalFinanceApi.Data;
using PersonalFinanceApi.Models;
using PersonalFinanceApi.DTOs;

namespace PersonalFinanceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvestmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public InvestmentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Investment>>> GetInvestments()
    {
        return await _context.Investments
            .Include(i => i.InvestmentType)
            .OrderByDescending(i => i.Date)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Investment>> GetInvestment(int id)
    {
        var investment = await _context.Investments
            .Include(i => i.InvestmentType)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (investment == null)
        {
            return NotFound();
        }

        return investment;
    }

    [HttpPost]
    public async Task<ActionResult<Investment>> CreateInvestment(CreateInvestmentDto createInvestmentDto)
    {
        var investment = new Investment
        {
            Name = createInvestmentDto.Name,
            InvestmentTypeId = createInvestmentDto.InvestmentTypeId,
            Amount = createInvestmentDto.Amount,
            Date = createInvestmentDto.Date,
            CurrentValue = createInvestmentDto.CurrentValue,
            Notes = createInvestmentDto.Notes,
            ReturnRate = createInvestmentDto.ReturnRate
        };

        _context.Investments.Add(investment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInvestment), new { id = investment.Id }, investment);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateInvestment(int id, UpdateInvestmentDto updateInvestmentDto)
    {
        var investment = await _context.Investments.FindAsync(id);
        if (investment == null)
        {
            return NotFound();
        }

        investment.Name = updateInvestmentDto.Name;
        investment.InvestmentTypeId = updateInvestmentDto.InvestmentTypeId;
        investment.Amount = updateInvestmentDto.Amount;
        investment.Date = updateInvestmentDto.Date;
        investment.CurrentValue = updateInvestmentDto.CurrentValue;
        investment.Notes = updateInvestmentDto.Notes;
        investment.ReturnRate = updateInvestmentDto.ReturnRate;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await InvestmentExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInvestment(int id)
    {
        var investment = await _context.Investments.FindAsync(id);
        if (investment == null)
        {
            return NotFound();
        }

        _context.Investments.Remove(investment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> InvestmentExists(int id)
    {
        return await _context.Investments.AnyAsync(e => e.Id == id);
    }
}