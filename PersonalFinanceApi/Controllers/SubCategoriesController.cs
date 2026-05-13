using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalFinanceApi.Data;
using PersonalFinanceApi.Models;
using PersonalFinanceApi.DTOs;

namespace PersonalFinanceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubCategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SubCategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SubCategoryResponseDto>>> GetSubCategories()
    {
        return await _context.SubCategories
            .Include(sc => sc.Category)
            .Select(sc => new SubCategoryResponseDto
            {
                Id = sc.Id,
                Name = sc.Name,
                Description = sc.Description,
                CategoryId = sc.CategoryId,
                CategoryName = sc.Category!.Name
            })
            .ToListAsync();
    }

    [HttpGet("by-category/{categoryId}")]
    public async Task<ActionResult<IEnumerable<SubCategoryResponseDto>>> GetByCategory(int categoryId)
    {
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == categoryId);
        if (!categoryExists)
            return NotFound(new { message = "Category not found" });

        return await _context.SubCategories
            .Where(sc => sc.CategoryId == categoryId)
            .Select(sc => new SubCategoryResponseDto
            {
                Id = sc.Id,
                Name = sc.Name,
                Description = sc.Description,
                CategoryId = sc.CategoryId,
                CategoryName = sc.Category!.Name
            })
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SubCategoryResponseDto>> GetSubCategory(int id)
    {
        var sc = await _context.SubCategories
            .Include(s => s.Category)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sc == null)
            return NotFound();

        return new SubCategoryResponseDto
        {
            Id = sc.Id,
            Name = sc.Name,
            Description = sc.Description,
            CategoryId = sc.CategoryId,
            CategoryName = sc.Category?.Name
        };
    }

    [HttpPost]
    public async Task<ActionResult<SubCategoryResponseDto>> CreateSubCategory(CreateSubCategoryDto dto)
    {
        var category = await _context.Categories.FindAsync(dto.CategoryId);
        if (category == null)
            return BadRequest(new { message = "Invalid category" });

        var subCategory = new SubCategory
        {
            Name = dto.Name,
            Description = dto.Description,
            CategoryId = dto.CategoryId
        };

        _context.SubCategories.Add(subCategory);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSubCategory), new { id = subCategory.Id }, new SubCategoryResponseDto
        {
            Id = subCategory.Id,
            Name = subCategory.Name,
            Description = subCategory.Description,
            CategoryId = subCategory.CategoryId,
            CategoryName = category.Name
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSubCategory(int id, UpdateSubCategoryDto dto)
    {
        var subCategory = await _context.SubCategories.FindAsync(id);
        if (subCategory == null)
            return NotFound();

        subCategory.Name = dto.Name;
        subCategory.Description = dto.Description;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.SubCategories.AnyAsync(sc => sc.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSubCategory(int id)
    {
        var subCategory = await _context.SubCategories.FindAsync(id);
        if (subCategory == null)
            return NotFound();

        var inUse = await _context.Expenses.AnyAsync(e => e.SubCategoryId == id);
        if (inUse)
            return BadRequest(new { message = "Cannot delete subcategory. It is used by one or more expenses." });

        _context.SubCategories.Remove(subCategory);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
