export interface Category {
  id: number;
  name: string;
  description?: string;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
}

export interface InvestmentType {
  id: number;
  name: string;
  description?: string;
}

export interface Budget {
  id: number;
  name: string;
  categoryId: number;
  category?: Category;
  amount: number;
  startDate: string;
  endDate: string;
}

export interface CreateBudgetRequest {
  name: string;
  categoryId: number;
  amount: number;
  startDate: string;
  endDate: string;
}

export interface UpdateBudgetRequest {
  name: string;
  categoryId: number;
  amount: number;
  startDate: string;
  endDate: string;
}

export interface Expense {
  id: number;
  categoryId: number;
  category?: Category;
  subCategoryId?: number;
  subCategory?: SubCategory;
  amount: number;
  date: string;
  description: string;
  notes?: string;
}

export interface BudgetSummary {
  categoryId: number;
  categoryName: string;
  totalAmount: number;
  budgetAmount: number;
  remainingAmount: number;
}

export interface BudgetReportSubCategory {
  subCategoryId: number | null;
  subCategoryName: string;
  totalAmount: number;
}

export interface BudgetReportItem {
  categoryId: number;
  categoryName: string;
  budgetAmount: number;
  totalAmount: number;
  remainingAmount: number;
  subCategories: BudgetReportSubCategory[];
}

export interface MonthlySpendingTrend {
  month: string | Date;
  totalAmount: number;
  changePercent: number;
}

export interface CategorySpendingTrend {
  categoryId: number;
  categoryName: string;
  currentMonthAmount: number;
  previousMonthAmount: number;
  averageMonthlyAmount: number;
  changePercent: number;
}

export interface PredictiveBudgetItem {
  categoryId: number;
  categoryName: string;
  budgetAmount: number;
  actualToDate: number;
  predictedSpend: number;
  suggestedBudget: number;
  outlook: string;
}

export interface SavingGoalProgress {
  id: number;
  name: string;
  type: string;
  currentAmount: number;
  targetAmount?: number;
  date: string;
  notes?: string;
  progressPercent: number;
  remainingAmount?: number;
  status: string;
}

export type TransactionType = 'investment' | 'saving' | 'income';

export interface Investment {
  id: number;
  name: string;
  investmentTypeId: number;
  amount: number;
  date: string;
  currentValue: number;
  notes?: string;
  returnRate?: number;
}

export interface CreateInvestmentDto {
  name: string;
  investmentTypeId: number;
  amount: number;
  date: string;
  currentValue: number;
  notes?: string;
  returnRate?: number;
}

export interface Saving {
  id: number;
  name: string;
  type: string; // e.g., 'emergency fund', 'retirement', 'goal-based'
  targetAmount?: number;
  currentAmount: number;
  date: string;
  notes?: string;
  interestRate?: number;
}

export interface Income {
  id: number;
  source: string;
  type: string; // e.g., 'salary', 'freelance', 'investment returns'
  amount: number;
  date: string;
  isRecurring: boolean;
  frequency?: string; // e.g., 'monthly', 'weekly', 'annually'
  notes?: string;
}

export interface FinancialSummary {
  totalInvestments: number;
  totalSavings: number;
  monthlyIncome: number;
  yearlyIncome: number;
  netWorth: number;
} 