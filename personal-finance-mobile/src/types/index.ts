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

export type MainTabParamList = {
  Home: undefined;
  Expenses: undefined;
  Budgets: undefined;
  Reports: undefined;
  Categories: undefined;
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
  AddSubCategory: { categoryId: number; categoryName: string };
  EditSubCategory: { subCategory: SubCategory };
};
