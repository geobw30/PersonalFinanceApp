namespace PersonalFinanceApi.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalFinanceApi.Data;
using PersonalFinanceApi.Models;
using AutoMapper;
using PersonalFinanceApi.DTOs; // <-- Add this


[ApiController]
[Route("api/[controller]")]
public class SavingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public SavingsController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Saving>>> GetSavings()
    {
        return await _context.Savings.OrderByDescending(s => s.Date).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Saving>> GetSaving(int id)
    {
        var saving = await _context.Savings.FindAsync(id);

        if (saving == null)
        {
            return NotFound();
        }

        return saving;
    }

    [HttpPost]
    public async Task<ActionResult<Saving>> CreateSaving(SavingDto dto)
    {
        var saving = _mapper.Map<Saving>(dto);

        _context.Savings.Add(saving);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSaving), new { id = saving.Id }, saving);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSaving(int id, SavingDto dto)
    {
        var saving = await _context.Savings.FindAsync(id);
        if (saving == null)
        {
            return NotFound();
        }

        _mapper.Map(dto, saving);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await SavingExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSaving(int id)
    {
        var saving = await _context.Savings.FindAsync(id);
        if (saving == null)
        {
            return NotFound();
        }

        _context.Savings.Remove(saving);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> SavingExists(int id)
    {
        return await _context.Savings.AnyAsync(e => e.Id == id);
    }
}