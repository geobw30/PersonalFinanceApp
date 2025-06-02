using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PersonalFinanceApi.Models;

public class Saving
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Type { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal? TargetAmount { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal CurrentAmount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? InterestRate { get; set; }
}