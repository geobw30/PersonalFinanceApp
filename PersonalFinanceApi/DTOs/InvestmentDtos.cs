using System.ComponentModel.DataAnnotations;

namespace PersonalFinanceApi.DTOs;

public class CreateInvestmentDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public int InvestmentTypeId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Current value must be greater than 0")]
    public decimal CurrentValue { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    [Range(-100, 1000, ErrorMessage = "Return rate must be between -100 and 1000")]
    public decimal? ReturnRate { get; set; }
}

public class UpdateInvestmentDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public int InvestmentTypeId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Current value must be greater than 0")]
    public decimal CurrentValue { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    [Range(-100, 1000, ErrorMessage = "Return rate must be between -100 and 1000")]
    public decimal? ReturnRate { get; set; }
}