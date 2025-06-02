namespace PersonalFinanceApi.DTOs;

public class SavingDto
{
    public string Name { get; set; } = string.Empty;
    public decimal CurrentAmount { get; set; }
    public decimal? TargetAmount { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal? InterestRate { get; set; }
    public DateTime Date { get; set; }
    public string? Notes { get; set; }
}
