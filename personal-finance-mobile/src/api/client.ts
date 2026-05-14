import axios from 'axios';
import type { Category, SubCategory, Budget, Expense, BudgetSummary, BudgetReportItem } from '../types';

const apiClient = axios.create({
  baseURL: 'http://10.0.2.2:5254/api',
  headers: { 'Content-Type': 'application/json' },
});

// Categories API
export const getCategories = () => apiClient.get<Category[]>('/categories');
export const createCategory = (data: { name: string; description?: string }) =>
  apiClient.post<Category>('/categories', data);
export const updateCategory = (id: number, data: { name: string; description?: string }) =>
  apiClient.put<Category>(`/categories/${id}`, data);
export const deleteCategory = (id: number) => apiClient.delete(`/categories/${id}`);

// SubCategories API
export const getSubCategories = () => apiClient.get<SubCategory[]>('/subcategories');
export const getSubCategoriesByCategory = (categoryId: number) =>
  apiClient.get<SubCategory[]>(`/subcategories/by-category/${categoryId}`);
export const createSubCategory = (data: { categoryId: number; name: string; description?: string }) =>
  apiClient.post<SubCategory>('/subcategories', data);
export const updateSubCategory = (id: number, data: { name: string; description?: string }) =>
  apiClient.put<SubCategory>(`/subcategories/${id}`, data);
export const deleteSubCategory = (id: number) => apiClient.delete(`/subcategories/${id}`);

// Budgets API
export const getBudgetsByMonth = (year: number, month: number) =>
  apiClient.get<Budget[]>(`/budgets/month/${year}/${month}`);
export const createBudget = (data: { name: string; categoryId: number; amount: number; startDate: string; endDate: string }) =>
  apiClient.post<Budget>('/budgets', data);
export const updateBudget = (id: number, data: { name: string; categoryId: number; amount: number; startDate: string; endDate: string }) =>
  apiClient.put<Budget>(`/budgets/${id}`, data);
export const deleteBudget = (id: number) => apiClient.delete(`/budgets/${id}`);

// Expenses API
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
export const updateExpense = (id: number, data: {
  categoryId: number;
  subCategoryId?: number;
  amount: number;
  date: string;
  description: string;
  notes?: string;
}) => apiClient.put<Expense>(`/expenses/${id}`, data);
export const deleteExpense = (id: number) => apiClient.delete(`/expenses/${id}`);


const apiClient = axios.create({
  baseURL: 'http://10.0.2.2:5254/api', // Android emulator localhost
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Add axios interceptor to handle date serialization
apiClient.interceptors.request.use((config) => {
  if (config.data) {
    // Convert Date objects to ISO strings before sending
    const data = { ...config.data };
    if (data.month instanceof Date) {
      // Ensure the date is in UTC and set to the first of the month
      const utcDate = new Date(Date.UTC(data.month.getFullYear(), data.month.getMonth(), 1));
      data.month = utcDate.toISOString();
    }
    if (data.date instanceof Date) {
      data.date = data.date.toISOString();
    }
    config.data = data;
  }
  return config;
});

// Add axios interceptor to handle date deserialization
apiClient.interceptors.response.use((response) => {
  if (response.data) {
    // Convert ISO strings back to Date objects
    if (Array.isArray(response.data)) {
      response.data = response.data.map(item => {
        if (item.month) {
          item.month = new Date(item.month);
        }
        if (item.date) {
          item.date = new Date(item.date);
        }
        return item;
      });
    } else if (response.data.month) {
      response.data.month = new Date(response.data.month);
    } else if (response.data.date) {
      response.data.date = new Date(response.data.date);
    }
  }
  return response;
});

// Categories API
export const getCategories = () => apiClient.get<Category[]>('/categories');
export const createCategory = (category: Omit<Category, 'id'>) => 
  apiClient.post<Category>('/categories', category);
export const updateCategory = (id: number, category: Omit<Category, 'id'>) =>
  apiClient.put<Category>(`/categories/${id}`, category);
export const deleteCategory = (id: number) =>
  apiClient.delete(`/categories/${id}`);
export const isCategoryInUse = (id: number) =>
  apiClient.get<{ inUse: boolean, usageDetails: { budgets: number, expenses: number } }>(`/categories/${id}/usage`);

// Budgets API
export const getBudgets = () => apiClient.get<Budget[]>('/budgets');
export const getBudgetsByMonth = (year: number, month: number) =>
  apiClient.get<Budget[]>(`/budgets/month/${year}/${month}`);
export const createBudget = (budget: { category: number; amount: number; month: Date; notes?: string }) =>
  apiClient.post<Budget>('/budgets', budget);
export const updateBudget = (id: number, budget: { category: number; amount: number; month: Date; notes?: string }) =>
  apiClient.put<Budget>(`/budgets/${id}`, budget);
export const deleteBudget = (id: number) =>
  apiClient.delete(`/budgets/${id}`);

// Expenses API
export const getExpenses = () => apiClient.get<Expense[]>('/expenses');
export const getExpensesByMonth = (year: number, month: number) =>
  apiClient.get<Expense[]>(`/expenses/month/${year}/${month}`);
export const getMonthlySummary = (year: number, month: number) =>
  apiClient.get<BudgetSummary[]>(`/expenses/summary/${year}/${month}`);
export const createExpense = (expense: Omit<Expense, 'id'>) =>
  apiClient.post<Expense>('/expenses', expense);
export const updateExpense = (id: number, expense: Omit<Expense, 'id'>) =>
  apiClient.put<Expense>(`/expenses/${id}`, expense);
export const deleteExpense = (id: number) =>
  apiClient.delete(`/expenses/${id}`); 