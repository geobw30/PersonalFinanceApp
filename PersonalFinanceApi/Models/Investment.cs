using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PersonalFinanceApi.Models;

public class Investment
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public int InvestmentTypeId { get; set; }

    [ForeignKey("InvestmentTypeId")]
    public InvestmentType? InvestmentType { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal CurrentValue { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? ReturnRate { get; set; }
}