export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Budget {
  id: number;
  categoryId: number;
  category?: Category;
  amount: number;
  month: Date;
  notes?: string;
}

export interface Expense {
  id: number;
  categoryId: number;
  category?: Category;
  amount: number;
  date: Date;
  description: string;
  notes?: string;
}

export interface BudgetSummary {
  categoryId: number;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
}

export type RootStackParamList = {
  Home: undefined;
  Budgets: undefined;
  Expenses: undefined;
  Categories: undefined;
  AddBudget: undefined;
  EditBudget: { budget: Budget };
  AddExpense: undefined;
  EditExpense: { expense: Expense };
  AddCategory: undefined;
  EditCategory: { category: Category };
}; 