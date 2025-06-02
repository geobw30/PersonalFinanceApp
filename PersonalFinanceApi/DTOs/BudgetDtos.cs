using System.ComponentModel.DataAnnotations;

namespace PersonalFinanceApi.DTOs;

public class CreateBudgetDto
{
    [Required]
    public int CategoryId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
}

public class UpdateBudgetDto
{
    [Required]
    public int CategoryId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
}