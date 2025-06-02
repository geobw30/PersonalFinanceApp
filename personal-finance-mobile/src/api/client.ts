import axios from 'axios';
import type { Category, Budget, Expense, BudgetSummary } from '../types';

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