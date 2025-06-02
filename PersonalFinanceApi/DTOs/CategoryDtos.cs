using System.ComponentModel.DataAnnotations;

namespace PersonalFinanceApi.DTOs;

public class CreateCategoryDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }
}

public class UpdateCategoryDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }
}