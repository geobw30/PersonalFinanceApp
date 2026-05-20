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

export interface Budget {
  id: number;
  name: string;
  categoryId: number;
  category?: Category;
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

export interface InvestmentType {
  id: number;
  name: string;
  description?: string;
}

export interface Investment {
  id: number;
  name: string;
  investmentTypeId: number;
  investmentType?: InvestmentType;
  amount: number;
  date: string;
  currentValue: number;
  notes?: string;
  returnRate?: number;
}

export interface Saving {
  id: number;
  name: string;
  type: string;
  targetAmount?: number;
  currentAmount: number;
  date: string;
  notes?: string;
  interestRate?: number;
}

export interface Income {
  id: number;
  source: string;
  type: string;
  amount: number;
  date: string;
  isRecurring: boolean;
  frequency?: string;
  notes?: string;
}

export interface FinancialSummary {
  totalInvestments: number;
  totalSavings: number;
  monthlyIncome: number;
  yearlyIncome: number;
  netWorth: number;
}

export type MainTabParamList = {
  Home: undefined;
  Expenses: undefined;
  Budgets: undefined;
  Finance: undefined;
  Reports: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  AddBudget: undefined;
  EditBudget: { budget: Budget };
  AddExpense: undefined;
  EditExpense: { expense: Expense };
  AddCategory: undefined;
  EditCategory: { category: Category };
  SubCategories: { categoryId?: number; categoryName?: string };
  AddSubCategory: { categoryId?: number; categoryName?: string };
  EditSubCategory: { subCategory: SubCategory };
  AddInvestment: undefined;
  EditInvestment: { investment: Investment };
  AddSaving: undefined;
  EditSaving: { saving: Saving };
  AddIncome: undefined;
  EditIncome: { income: Income };
  AddInvestmentType: undefined;
  EditInvestmentType: { investmentType: InvestmentType };
};
