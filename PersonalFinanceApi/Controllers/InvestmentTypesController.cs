using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalFinanceApi.Data;
using PersonalFinanceApi.Models;

namespace PersonalFinanceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvestmentTypesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public InvestmentTypesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvestmentType>>> GetInvestmentTypes()
    {
        return await _context.InvestmentTypes.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InvestmentType>> GetInvestmentType(int id)
    {
        var investmentType = await _context.InvestmentTypes.FindAsync(id);

        if (investmentType == null)
        {
            return NotFound();
        }

        return investmentType;
    }

    [HttpPost]
    public async Task<ActionResult<InvestmentType>> CreateInvestmentType(InvestmentType investmentType)
    {
        _context.InvestmentTypes.Add(investmentType);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInvestmentType), new { id = investmentType.Id }, investmentType);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateInvestmentType(int id, InvestmentType investmentType)
    {
        if (id != investmentType.Id)
        {
            return BadRequest();
        }

        _context.Entry(investmentType).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await InvestmentTypeExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInvestmentType(int id)
    {
        var investmentType = await _context.InvestmentTypes.FindAsync(id);
        if (investmentType == null)
        {
            return NotFound();
        }

        // Check if the investment type is in use
        var isInUse = await _context.Investments.AnyAsync(i => i.InvestmentTypeId == id);
        if (isInUse)
        {
            return BadRequest(new { message = "Cannot delete investment type because it is in use" });
        }

        _context.InvestmentTypes.Remove(investmentType);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> InvestmentTypeExists(int id)
    {
        return await _context.InvestmentTypes.AnyAsync(e => e.Id == id);
    }
}