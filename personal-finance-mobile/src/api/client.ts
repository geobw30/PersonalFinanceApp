import axios from 'axios';
import type {
  Category,
  SubCategory,
  Budget,
  Expense,
  BudgetSummary,
  BudgetReportItem,
  Investment,
  InvestmentType,
  Saving,
  Income,
  FinancialSummary,
} from '../types';

const apiClient = axios.create({
  baseURL: 'http://10.0.2.2:5254/api',
  headers: { 'Content-Type': 'application/json' },
});

export const getCategories = () => apiClient.get<Category[]>('/categories');
export const createCategory = (data: { name: string; description?: string }) =>
  apiClient.post<Category>('/categories', data);
export const updateCategory = (id: number, data: { name: string; description?: string }) =>
  apiClient.put<Category>(`/categories/${id}`, data);
export const deleteCategory = (id: number) => apiClient.delete(`/categories/${id}`);

export const getSubCategories = () => apiClient.get<SubCategory[]>('/subcategories');
export const getSubCategoriesByCategory = (categoryId: number) =>
  apiClient.get<SubCategory[]>(`/subcategories/by-category/${categoryId}`);
export const createSubCategory = (data: { categoryId: number; name: string; description?: string }) =>
  apiClient.post<SubCategory>('/subcategories', data);
export const updateSubCategory = (id: number, data: { name: string; description?: string }) =>
  apiClient.put<void>(`/subcategories/${id}`, data);
export const deleteSubCategory = (id: number) => apiClient.delete(`/subcategories/${id}`);

export const getBudgetsByMonth = (year: number, month: number) =>
  apiClient.get<Budget[]>(`/budgets/month/${year}/${month}`);
export const getBudgets = () => apiClient.get<Budget[]>('/budgets');
export const createBudget = (data: {
  name: string;
  categoryId: number;
  amount: number;
  startDate: string;
  endDate: string;
}) => apiClient.post<Budget>('/budgets', data);
export const updateBudget = (
  id: number,
  data: {
    name: string;
    categoryId: number;
    amount: number;
    startDate: string;
    endDate: string;
  },
) => apiClient.put<void>(`/budgets/${id}`, data);
export const deleteBudget = (id: number) => apiClient.delete(`/budgets/${id}`);

export const getExpensesByMonth = (year: number, month: number) =>
  apiClient.get<Expense[]>(`/expenses/month/${year}/${month}`);
export const getMonthlySummary = (year: number, month: number) =>
  apiClient.get<BudgetSummary[]>(`/expenses/summary/${year}/${month}`);
export const getBudgetReport = (year: number, month: number) =>
  apiClient.get<BudgetReportItem[]>(`/expenses/budget-report/${year}/${month}`);
export const createExpense = (data: {
  categoryId: number;
  subCategoryId?: number;
  amount: number;
  date: string;
  description: string;
  notes?: string;
}) => apiClient.post<Expense>('/expenses', data);
export const updateExpense = (
  id: number,
  data: {
    categoryId: number;
    subCategoryId?: number;
    amount: number;
    date: string;
    description: string;
    notes?: string;
  },
) => apiClient.put<void>(`/expenses/${id}`, data);
export const deleteExpense = (id: number) => apiClient.delete(`/expenses/${id}`);

// Investments API
export const getInvestments = () => apiClient.get<Investment[]>('/investments');
export const createInvestment = (data: Omit<Investment, 'id' | 'investmentType'>) =>
  apiClient.post<Investment>('/investments', data);
export const updateInvestment = (id: number, data: Omit<Investment, 'id' | 'investmentType'>) =>
  apiClient.put<void>(`/investments/${id}`, data);
export const deleteInvestment = (id: number) => apiClient.delete(`/investments/${id}`);

// Savings API
export const getSavings = () => apiClient.get<Saving[]>('/savings');
export const createSaving = (data: Omit<Saving, 'id'>) =>
  apiClient.post<Saving>('/savings', data);
export const updateSaving = (id: number, data: Omit<Saving, 'id'>) =>
  apiClient.put<void>(`/savings/${id}`, data);
export const deleteSaving = (id: number) => apiClient.delete(`/savings/${id}`);

// Incomes API
export const getIncomes = () => apiClient.get<Income[]>('/incomes');
export const getIncomesByMonth = (year: number, month: number) =>
  apiClient.get<Income[]>(`/incomes/month/${year}/${month}`);
export const createIncome = (data: Omit<Income, 'id'>) =>
  apiClient.post<Income>('/incomes', data);
export const updateIncome = (id: number, data: Omit<Income, 'id'>) =>
  apiClient.put<void>(`/incomes/${id}`, data);
export const deleteIncome = (id: number) => apiClient.delete(`/incomes/${id}`);

// Financial Summary API
export const getFinancialSummary = () => apiClient.get<FinancialSummary>('/financial-summary');

// Investment Types API
export const getInvestmentTypes = () => apiClient.get<InvestmentType[]>('/investmenttypes');
export const createInvestmentType = (data: Omit<InvestmentType, 'id'>) =>
  apiClient.post<InvestmentType>('/investmenttypes', data);
export const updateInvestmentType = (id: number, data: Omit<InvestmentType, 'id'>) =>
  apiClient.put<void>(`/investmenttypes/${id}`, { id, ...data });
export const deleteInvestmentType = (id: number) => apiClient.delete(`/investmenttypes/${id}`);
