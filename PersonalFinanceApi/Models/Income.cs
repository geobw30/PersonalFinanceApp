using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PersonalFinanceApi.Models;

public class Income
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Source { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Type { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public bool IsRecurring { get; set; }

    [StringLength(20)]
    public string? Frequency { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}