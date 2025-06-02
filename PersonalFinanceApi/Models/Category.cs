using System.ComponentModel.DataAnnotations;

namespace PersonalFinanceApi.Models;

public class Category
{
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public virtual ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}