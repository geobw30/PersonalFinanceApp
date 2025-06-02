using System.ComponentModel.DataAnnotations;

namespace PersonalFinanceApi.Models;

public class InvestmentType
{
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;

    [StringLength(200)]
    public string? Description { get; set; }

    // Navigation property for investments using this type
    public ICollection<Investment> Investments { get; set; } = new List<Investment>();
}