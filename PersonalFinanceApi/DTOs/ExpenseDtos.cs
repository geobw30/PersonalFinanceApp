using System.ComponentModel.DataAnnotations;

namespace PersonalFinanceApi.DTOs;

public class CreateExpenseDto
{
    [Required]
    [StringLength(100)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int CategoryId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}

public class UpdateExpenseDto
{
    [Required]
    [StringLength(100)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int CategoryId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}