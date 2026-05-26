namespace PersonalFinanceApi.DTOs;

public class MonthlySpendingTrendDto
{
    public DateTime Month { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal ChangePercent { get; set; }
}

public class CategorySpendingTrendDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal CurrentMonthAmount { get; set; }
    public decimal PreviousMonthAmount { get; set; }
    public decimal ChangePercent { get; set; }
    public decimal AverageMonthlyAmount { get; set; }
}

public class PredictiveBudgetDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal BudgetAmount { get; set; }
    public decimal ActualToDate { get; set; }
    public decimal PredictedSpend { get; set; }
    public decimal SuggestedBudget { get; set; }
    public string Outlook { get; set; } = string.Empty;
}

public class SavingGoalProgressDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal CurrentAmount { get; set; }
    public decimal? TargetAmount { get; set; }
    public DateTime Date { get; set; }
    public string? Notes { get; set; }
    public decimal ProgressPercent { get; set; }
    public decimal? RemainingAmount { get; set; }
    public string Status { get; set; } = string.Empty;
}
