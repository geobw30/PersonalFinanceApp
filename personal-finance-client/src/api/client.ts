import axios from 'axios';
import type { 
  Category, 
  Budget, 
  Expense, 
  BudgetSummary,
  Investment,
  Saving,
  Income,
  FinancialSummary,
  InvestmentType,
  CreateInvestmentDto,
  CreateBudgetRequest,
  UpdateBudgetRequest
} from '../types';

const apiClient = axios.create({
  baseURL: 'http://localhost:5254/api', // TODO - get this from env variable
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
          // Parse the date and ensure it's in UTC
          const utcDate = new Date(item.month);
          return { ...item, month: utcDate };
        }
        return item;
      });
    } else if (response.data.month) {
      // Parse the date and ensure it's in UTC
      const utcDate = new Date(response.data.month);
      response.data.month = utcDate;
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
export const createBudget = (budget: CreateBudgetRequest) =>
  apiClient.post<Budget>('/budgets', budget);
export const updateBudget = (id: number, budget: UpdateBudgetRequest) =>
  apiClient.put(`/budgets/${id}`, budget);
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
  apiClient.put(`/expenses/${id}`, expense);
export const deleteExpense = (id: number) =>
  apiClient.delete(`/expenses/${id}`);

// Investments API
export const getInvestments = () => apiClient.get<Investment[]>('/investments');
export const getInvestmentById = (id: number) => apiClient.get<Investment>(`/investments/${id}`);
export const createInvestment = (investment: CreateInvestmentDto) =>
  apiClient.post<Investment>('/investments', investment);
export const updateInvestment = (id: number, investment: Omit<Investment, 'id'>) =>
  apiClient.put<void>(`/investments/${id}`, investment);
export const deleteInvestment = (id: number) =>
  apiClient.delete(`/investments/${id}`);

// Savings API
export const getSavings = () => apiClient.get<Saving[]>('/savings');
export const getSavingById = (id: number) => apiClient.get<Saving>(`/savings/${id}`);
export const createSaving = (saving: Omit<Saving, 'id'>) =>
  apiClient.post<Saving>('/savings', saving);
export const updateSaving = (id: number, saving: Omit<Saving, 'id'>) =>
  apiClient.put(`/savings/${id}`, saving);
export const deleteSaving = (id: number) =>
  apiClient.delete(`/savings/${id}`);

// Income API
export const getIncomes = () => apiClient.get<Income[]>('/incomes');
export const getIncomesByMonth = (year: number, month: number) =>
  apiClient.get<Income[]>(`/incomes/month/${year}/${month}`);
export const getIncomeById = (id: number) => apiClient.get<Income>(`/incomes/${id}`);
export const createIncome = (income: Omit<Income, 'id'>) =>
  apiClient.post<Income>('/incomes', income);
export const updateIncome = (id: number, income: Omit<Income, 'id'>) =>
  apiClient.put(`/incomes/${id}`, income);
export const deleteIncome = (id: number) =>
  apiClient.delete(`/incomes/${id}`);

// Financial Summary API
export const getFinancialSummary = () => apiClient.get<FinancialSummary>('/financial-summary');
export const getMonthlyFinancialSummary = (year: number, month: number) =>
  apiClient.get<FinancialSummary>(`/financial-summary/month/${year}/${month}`);

// Investment Types API
export const getInvestmentTypes = () => apiClient.get<InvestmentType[]>('/investmenttypes');
export const getInvestmentTypeById = (id: number) => apiClient.get<InvestmentType>(`/investmenttypes/${id}`);
export const createInvestmentType = (investmentType: Omit<InvestmentType, 'id'>) =>
  apiClient.post<InvestmentType>('/investmenttypes', investmentType);
export const updateInvestmentType = (id: number, investmentType: Omit<InvestmentType, 'id'>) =>
  apiClient.put<void>(`/investmenttypes/${id}`, { id, ...investmentType });
export const deleteInvestmentType = (id: number) =>
  apiClient.delete(`/investmenttypes/${id}`); 