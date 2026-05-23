using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalFinanceApi.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Expenses_CategoryId",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Budgets_CategoryId",
                table: "Budgets");

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_Date",
                table: "Incomes",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_IsRecurring_Frequency_Date",
                table: "Incomes",
                columns: new[] { "IsRecurring", "Frequency", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CategoryId_Date",
                table: "Expenses",
                columns: new[] { "CategoryId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_Date",
                table: "Expenses",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_CategoryId_StartDate",
                table: "Budgets",
                columns: new[] { "CategoryId", "StartDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_StartDate_EndDate",
                table: "Budgets",
                columns: new[] { "StartDate", "EndDate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Incomes_Date",
                table: "Incomes");

            migrationBuilder.DropIndex(
                name: "IX_Incomes_IsRecurring_Frequency_Date",
                table: "Incomes");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_CategoryId_Date",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_Date",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Budgets_CategoryId_StartDate",
                table: "Budgets");

            migrationBuilder.DropIndex(
                name: "IX_Budgets_StartDate_EndDate",
                table: "Budgets");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CategoryId",
                table: "Expenses",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_CategoryId",
                table: "Budgets",
                column: "CategoryId");
        }
    }
}
