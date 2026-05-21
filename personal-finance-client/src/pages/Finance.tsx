import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditOutlinedIcon,
  Delete as DeleteOutlinedIcon,
  TrendingUp as InvestmentIcon,
  Savings as SavingsIcon,
  Payments as IncomeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { Investment, Saving, Income, FinancialSummary, Expense } from '../types';
import {
  getInvestments,
  getSavings,
  getIncomes,
  getFinancialSummary,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  createSaving,
  updateSaving,
  deleteSaving,
  createIncome, // <-- add this
  updateIncome, // <-- add this
  deleteIncome,
  getExpensesByMonth
} from '../api/client';
import { useToast } from '../contexts/ToastContext';
import InvestmentDialog from '../components/InvestmentDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import SavingDialog from '../components/SavingsDialog';
import IncomeDialog from '../components/IncomeDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`finance-tabpanel-${index}`}
      aria-labelledby={`finance-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Finance() {
  const [tabValue, setTabValue] = useState(0);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Dialog states
  const [addInvestmentDialogOpen, setAddInvestmentDialogOpen] = useState(false);
  const [editInvestmentDialogOpen, setEditInvestmentDialogOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [deletingInvestment, setDeletingInvestment] = useState<Investment | null>(null);

  // Dialog states for savings
  const [addSavingDialogOpen, setAddSavingDialogOpen] = useState(false);
  const [editSavingDialogOpen, setEditSavingDialogOpen] = useState(false);
  const [deleteSavingConfirmDialogOpen, setDeleteSavingConfirmDialogOpen] = useState(false);
  const [editingSaving, setEditingSaving] = useState<Saving | null>(null);
  const [deletingSaving, setDeletingSaving] = useState<Saving | null>(null);

  // Dialog states for income
  const [addIncomeDialogOpen, setAddIncomeDialogOpen] = useState(false);
  const [editIncomeDialogOpen, setEditIncomeDialogOpen] = useState(false);
  const [deleteIncomeConfirmDialogOpen, setDeleteIncomeConfirmDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deletingIncome, setDeletingIncome] = useState<Income | null>(null);

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const now = new Date();
      const [investmentsRes, savingsRes, incomesRes, summaryRes, expensesRes] = await Promise.all([
        getInvestments(),
        getSavings(),
        getIncomes(),
        getFinancialSummary(),
        getExpensesByMonth(now.getFullYear(), now.getMonth() + 1)
      ]);

      setInvestments(investmentsRes.data);
      setSavings(savingsRes.data);
      setIncomes(incomesRes.data);
      setSummary(summaryRes.data);
      setExpenses(expensesRes.data);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      showToast('Failed to load financial data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'decimal',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleAddInvestment = async (investment: Omit<Investment, 'id'>) => {
    try {
      await createInvestment(investment);
      setAddInvestmentDialogOpen(false);
      fetchData();
      showToast('Investment added successfully', 'success');
    } catch (error) {
      console.error('Error adding investment:', error);
      showToast('Failed to add investment', 'error');
    }
  };

  const handleEditInvestment = async (investment: Omit<Investment, 'id'>) => {
    if (!editingInvestment) return;
    try {
      await updateInvestment(editingInvestment.id, investment);
      setEditInvestmentDialogOpen(false);
      fetchData();
      showToast('Investment updated successfully', 'success');
    } catch (error) {
      console.error('Error updating investment:', error);
      showToast('Failed to update investment', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingInvestment) return;
    try {
      await deleteInvestment(deletingInvestment.id);
      setDeleteConfirmDialogOpen(false);
      fetchData();
      showToast('Investment deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting investment:', error);
      showToast('Failed to delete investment', 'error');
    }
  };

  // Saving handlers
  const handleAddSaving = async (saving: Omit<Saving, 'id'>) => {
    try {
      await createSaving(saving);
      setAddSavingDialogOpen(false);
      fetchData();
      showToast('Saving added successfully', 'success');
    } catch (error) {
      console.error('Error adding saving:', error);
      showToast('Failed to add saving', 'error');
    }
  };

  const handleEditSaving = (saving: Saving) => {
    setEditingSaving(saving);
    setEditSavingDialogOpen(true);
  };

  const handleUpdateSaving = async (saving: Omit<Saving, 'id'>) => {
    if (!editingSaving) return;
    // Use the correct type property for the backend
    const payload = {
      name: saving.name,
      type: saving.type ?? editingSaving.type,
      currentAmount: Number(saving.currentAmount),
      targetAmount: saving.targetAmount ? Number(saving.targetAmount) : undefined,
      date: saving.date ?? editingSaving.date ?? new Date().toISOString(),
      interestRate: saving.interestRate ?? editingSaving.interestRate,
      notes: saving.notes || undefined
    };
    if (!payload.type) {
      showToast('Saving type is required.', 'error');
      return;
    }
    try {
      await updateSaving(editingSaving.id, payload);
      setEditSavingDialogOpen(false);
      setEditingSaving(null);
      fetchData();
      showToast('Saving updated successfully', 'success');
    } catch (error) {
      console.error('Error updating saving:', error);
      showToast('Failed to update saving', 'error');
    }
  };

  const handleDeleteSaving = (saving: Saving) => {
    setDeletingSaving(saving);
    setDeleteSavingConfirmDialogOpen(true);
  };

  const handleDeleteSavingConfirm = async () => {
    if (!deletingSaving) return;
    try {
      await deleteSaving(deletingSaving.id);
      setDeleteSavingConfirmDialogOpen(false);
      setDeletingSaving(null);
      fetchData();
      showToast('Saving deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting saving:', error);
      showToast('Failed to delete saving', 'error');
    }
  };

  // Income handlers
  const handleAddIncome = async (income: Omit<Income, 'id'>) => {
    try {
      await createIncome(income);
      setAddIncomeDialogOpen(false);
      fetchData();
      showToast('Income added successfully', 'success');
    } catch (error) {
      console.error('Error adding income:', error);
      showToast('Failed to add income', 'error');
    }
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setEditIncomeDialogOpen(true);
  };

  const handleUpdateIncome = async (income: Omit<Income, 'id'>) => {
    if (!editingIncome) return;
    // Ensure notes is string or undefined, never null
    const payload = {
      id: editingIncome.id,
      source: income.source,
      amount: Number(income.amount),
      type: income.type,
      date: income.date ?? new Date().toISOString(),
      isRecurring: !!income.isRecurring,
      frequency: income.isRecurring ? income.frequency : null,
      notes: income.notes ? income.notes : undefined // fix: never null
    };
    try {
      await updateIncome(editingIncome.id, payload as any); // cast if needed for backend id
      setEditIncomeDialogOpen(false);
      setEditingIncome(null);
      fetchData();
      showToast('Income updated successfully', 'success');
    } catch (error) {
      console.error('Error updating income:', error);
      showToast('Failed to update income', 'error');
    }
  };

  const handleDeleteIncome = (income: Income) => {
    setDeletingIncome(income);
    setDeleteIncomeConfirmDialogOpen(true);
  };

  const handleDeleteIncomeConfirm = async () => {
    if (!deletingIncome) return;
    try {
      await deleteIncome(deletingIncome.id);
      setDeleteIncomeConfirmDialogOpen(false);
      setDeletingIncome(null);
      fetchData();
      showToast('Income deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting income:', error);
      showToast('Failed to delete income', 'error');
    }
  };

  // Helper: Deduct savings and expenses from income for the current month
  const getAdjustedMonthlyIncome = () => {
    if (!summary) return 0;
    // Get current month/year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter savings entered in the current month
    const savingsThisMonth = savings.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Use expenses from state (fetched for current month)
    const expensesThisMonth = expenses;

    // Sum the currentAmount for savings entered this month
    const totalSavingsThisMonth = savingsThisMonth.reduce((sum, s) => sum + (s.currentAmount || 0), 0);

    // Sum the amount for expenses entered this month
    const totalExpensesThisMonth = expensesThisMonth.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Deduct savings and expenses from monthly income
    return (summary.monthlyIncome || 0) - totalSavingsThisMonth - totalExpensesThisMonth;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Summary Section */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 0, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom>Financial Overview</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Net Worth
                </Typography>
                <Typography variant="h4" component="div" color="primary">
                  {formatCurrency(summary?.netWorth || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Current Net worth this month)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Investments
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  {formatCurrency(summary?.totalInvestments || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Total investments for this month)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Savings
                </Typography>
                <Typography variant="h4" component="div" color="info.main">
                  {formatCurrency(summary?.totalSavings || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Total savings for this month)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Income
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  {formatCurrency(getAdjustedMonthlyIncome())}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Minus expenses and savings)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Section */}
      <Paper elevation={0}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Investments" icon={<InvestmentIcon />} iconPosition="start" />
            <Tab label="Savings" icon={<SavingsIcon />} iconPosition="start" />
            <Tab label="Income" icon={<IncomeIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Investments Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddInvestmentDialogOpen(true)}
            >
              
            </Button>
          </Box>
          <List>
            {investments.map((investment) => (
              <ListItem
                key={investment.id}
                secondaryAction={
                  <Box>
                    <IconButton onClick={() => {
                      setEditingInvestment(investment);
                      setEditInvestmentDialogOpen(true);
                    }} size="small">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => {
                      setDeletingInvestment(investment);
                      setDeleteConfirmDialogOpen(true);
                    }} size="small" color="error">
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={investment.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {formatCurrency(investment.currentValue)}
                      </Typography>
                      {' - '}
                      <Typography component="span" variant="body2">
                        {/* Show investment type id if available, else fallback to name */}
                        {investment.investmentTypeId || investment.name}
                      </Typography>
                      {investment.returnRate && (
                        <>
                          {' - Return: '}
                          <Typography
                            component="span"
                            variant="body2"
                            color={investment.returnRate >= 0 ? 'success.main' : 'error.main'}
                          >
                            {investment.returnRate}%
                          </Typography>
                        </>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Savings Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddSavingDialogOpen(true)}
            >
              
            </Button>
          </Box>
          <List>
            {savings.map((saving) => (
              <ListItem
                key={saving.id}
                secondaryAction={
                  <Box>
                    <IconButton onClick={() => handleEditSaving(saving)} size="small">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteSaving(saving)} size="small" color="error">
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={saving.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {formatCurrency(saving.currentAmount)}
                      </Typography>
                      {' - '}
                      <Typography component="span" variant="body2">
                        {saving.type}
                      </Typography>
                      {saving.targetAmount && (
                        <Box component="span" sx={{ display: 'block', mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(saving.currentAmount / saving.targetAmount) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography component="span" variant="caption" color="text.secondary">
                            Target: {formatCurrency(saving.targetAmount)}
                          </Typography>
                        </Box>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        {/* Income Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddIncomeDialogOpen(true)}
            >
              
            </Button>
          </Box>
          <List>
            {incomes.map((income) => (
              <ListItem
                key={income.id}
                secondaryAction={
                  <Box>
                    <IconButton onClick={() => handleEditIncome(income)} size="small">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteIncome(income)} size="small" color="error">
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={income.source}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {formatCurrency(income.amount)}
                      </Typography>
                      {' - '}
                      <Typography component="span" variant="body2">
                        {income.type}
                      </Typography>
                      {income.isRecurring && (
                        <>
                          {' - '}
                          <Typography component="span" variant="body2" color="success.main">
                            {income.frequency}
                          </Typography>
                        </>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Paper>

      {/* Dialogs */}
      <InvestmentDialog
        open={addInvestmentDialogOpen}
        onClose={() => setAddInvestmentDialogOpen(false)}
        onSave={handleAddInvestment}
        mode="add"
      />

      <InvestmentDialog
        open={editInvestmentDialogOpen}
        onClose={() => setEditInvestmentDialogOpen(false)}
        onSave={handleEditInvestment}
        mode="edit"
        initialInvestment={editingInvestment}
      />

      <ConfirmDialog
        open={deleteConfirmDialogOpen}
        onClose={() => setDeleteConfirmDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Investment"
        message={`Are you sure you want to delete ${deletingInvestment?.name}?`}
      />

      {/* Saving Dialogs */}
      <SavingDialog
        open={addSavingDialogOpen}
        onClose={() => setAddSavingDialogOpen(false)}
        onSave={handleAddSaving}
        mode="add"
      />
      <SavingDialog
        open={editSavingDialogOpen}
        onClose={() => {
          setEditSavingDialogOpen(false);
          setEditingSaving(null);
        }}
        onSave={handleUpdateSaving}
        mode="edit"
        initialSaving={editingSaving ?? undefined}
      />
      <ConfirmDialog
        open={deleteSavingConfirmDialogOpen}
        onClose={() => {
          setDeleteSavingConfirmDialogOpen(false);
          setDeletingSaving(null);
        }}
        onConfirm={handleDeleteSavingConfirm}
        title="Delete Saving"
        message={`Are you sure you want to delete ${deletingSaving?.name}?`}
      />

      {/* Income Dialogs */}
      <IncomeDialog
        open={addIncomeDialogOpen}
        onClose={() => setAddIncomeDialogOpen(false)}
        onSave={handleAddIncome}
        mode="add"
      />
      <IncomeDialog
        open={editIncomeDialogOpen}
        onClose={() => {
          setEditIncomeDialogOpen(false);
          setEditingIncome(null);
        }}
        onSave={handleUpdateIncome}
        mode="edit"
        initialIncome={editingIncome}
      />
      <ConfirmDialog
        open={deleteIncomeConfirmDialogOpen}
        onClose={() => {
          setDeleteIncomeConfirmDialogOpen(false);
          setDeletingIncome(null);
        }}
        onConfirm={handleDeleteIncomeConfirm}
        title="Delete Income"
        message={`Are you sure you want to delete ${deletingIncome?.source}?`}
      />
    </Box>
  );
}