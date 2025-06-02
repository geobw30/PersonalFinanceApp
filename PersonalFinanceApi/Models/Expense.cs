using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PersonalFinanceApi.Models;

public class Expense
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [ForeignKey("CategoryId")]
    public Category? Category { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}