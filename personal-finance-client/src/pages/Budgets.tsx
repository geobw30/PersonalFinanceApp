import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Edit as EditOutlinedIcon, Delete as DeleteOutlinedIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import type { Budget, Category, Income } from '../types';
import { getBudgetsByMonth, createBudget, getCategories, updateBudget, deleteBudget, getIncomesByMonth } from '../api/client';
import { useToast } from '../contexts/ToastContext';

const formatCurrency = (amount: number) => {
  return `USh ${amount.toLocaleString('en-UG')}`;
};

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [isFormExpanded, setIsFormExpanded] = useState(true);
  const [newBudget, setNewBudget] = useState({
    categoryId: '',
    amount: '',
    month: new Date(),
    notes: ''
  });
  const { showToast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [incomes, setIncomes] = useState<Income[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [budgetsRes, categoriesRes, incomesRes] = await Promise.all([
        getBudgetsByMonth(selectedDate.getFullYear(), selectedDate.getMonth() + 1),
        getCategories(),
        getIncomesByMonth(selectedDate.getFullYear(), selectedDate.getMonth() + 1)
      ]);
      setBudgets(budgetsRes.data);
      setCategories(categoriesRes.data);
      setIncomes(incomesRes.data);
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newBudget.categoryId || !newBudget.amount) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const amount = parseFloat(newBudget.amount);
      if (isNaN(amount) || amount <= 0) {
        showToast('Amount must be a positive number', 'error');
        return;
      }

      const categoryId = parseInt(newBudget.categoryId);
      if (isNaN(categoryId)) {
        showToast('Please select a valid category', 'error');
        return;
      }

      const startDate = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
      const endDate = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0));

      await createBudget({
        categoryId: categoryId,
        amount: amount,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        name: `Budget for ${format(startDate, 'MMMM yyyy')}`
      });

      setNewBudget({
        categoryId: '',
        amount: '',
        month: selectedDate,
        notes: ''
      });
      fetchData();
      showToast('Budget created successfully', 'success');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        showToast(`Validation error: ${errorMessages.join(', ')}`, 'error');
      } else if (error.response?.data?.message) {
        showToast(error.response.data.message, 'error');
      } else {
        showToast('Failed to create budget', 'error');
      }
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingBudget) return;
    try {
      if (!editingBudget.categoryId || !editingBudget.amount) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const amount = typeof editingBudget.amount === 'string' ? 
        parseFloat(editingBudget.amount) : editingBudget.amount;

      if (isNaN(amount) || amount <= 0) {
        showToast('Amount must be a positive number', 'error');
        return;
      }

      const startDate = new Date(Date.UTC(
        new Date(editingBudget.startDate).getFullYear(),
        new Date(editingBudget.startDate).getMonth(),
        1
      ));
      const endDate = new Date(Date.UTC(
        new Date(editingBudget.startDate).getFullYear(),
        new Date(editingBudget.startDate).getMonth() + 1,
        0
      ));

      await updateBudget(editingBudget.id, {
        categoryId: editingBudget.categoryId,
        amount: amount,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        name: editingBudget.name
      });
      setIsEditDialogOpen(false);
      setEditingBudget(null);
      fetchData();
      showToast('Budget updated successfully', 'success');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        showToast(`Validation error: ${errorMessages.join(', ')}`, 'error');
      } else if (error.response?.data?.message) {
        showToast(error.response.data.message, 'error');
      } else {
        showToast('Failed to update budget', 'error');
      }
    }
  };

  const handleDelete = async () => {
    if (!budgetToDelete) return;
    try {
      await deleteBudget(budgetToDelete.id);
      setIsDeleteDialogOpen(false);
      setBudgetToDelete(null);
      fetchData();
      showToast('Budget deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete budget', 'error');
    }
  };

  // Calculate total income for the selected month
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  // Calculate total budget for the selected month
  const totalBudget = budgets.reduce((total, budget) => total + budget.amount, 0);

  // Calculate running balance (income - budget)
  const runningBalance = totalIncome - totalBudget;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 0, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" component="h1">
              Budgets
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {format(selectedDate, 'MMMM yyyy')}
            </Typography>
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              Total Income: {formatCurrency(totalIncome)}
            </Typography>
            <Typography variant="body2" color={runningBalance >= 0 ? "success.main" : "error.main"} sx={{ mt: 1 }}>
              {runningBalance >= 0 ? "Unbudgeted Amount" : "Overbudgeted Amount"}: {formatCurrency(runningBalance)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'medium' }}>
              {formatCurrency(totalBudget)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Budget
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 3 
      }}>
        {/* Budget Cards - Show first on mobile */}
        <Box sx={{ 
          flex: { xs: '1 1 auto', sm: 1 }, 
          order: { xs: 1, sm: 2 } 
        }}>
          <Grid container spacing={2}>
            {budgets.map((budget) => (
              <Grid item xs={12} sm={6} key={budget.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {budget.category?.name}
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(budget.amount)}
                    </Typography>
                    {budget.notes && (
                      <Typography color="text.secondary" sx={{ mt: 1 }}>
                        {budget.notes}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <IconButton onClick={() => handleEdit(budget)} size="small">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      onClick={() => {
                        setBudgetToDelete(budget);
                        setIsDeleteDialogOpen(true);
                      }} 
                      size="small" 
                      color="error"
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Left side - Forms */}
        <Box sx={{ 
          flex: { xs: '1 1 auto', sm: '0 0 400px' },
          order: { xs: 2, sm: 1 }
        }}>
          {/* Month Selection */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <DatePicker
              label="Select Month"
              value={selectedDate}
              onChange={(newValue) => newValue && setSelectedDate(newValue)}
              views={['year', 'month']}
              slotProps={{
                textField: { fullWidth: true }
              }}
            />
          </Paper>

          {/* Add Budget Form with collapsible header on mobile */}
          <Paper sx={{ p: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: isMobile ? 'pointer' : 'default',
                mb: 2
              }}
              onClick={() => isMobile && setIsFormExpanded(!isFormExpanded)}
            >
              <Typography variant="h6">
                Add New Budget
              </Typography>
              {isMobile && (
                <IconButton size="small">
                  {isFormExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            </Box>
            
            <Collapse in={!isMobile || isFormExpanded}>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newBudget.categoryId}
                    label="Category"
                    onChange={(e) => setNewBudget({ ...newBudget, categoryId: e.target.value })}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Amount (UGX)"
                  type="number"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                  required
                  fullWidth
                />
                <TextField
                  label="Notes"
                  value={newBudget.notes}
                  onChange={(e) => setNewBudget({ ...newBudget, notes: e.target.value })}
                  multiline
                  rows={2}
                  fullWidth
                />
                <Button type="submit" variant="contained" size="small" sx={{ alignSelf: 'flex-start' }}>
                  Add Budget
                </Button>
              </Box>
            </Collapse>
          </Paper>
        </Box>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Budget</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={editingBudget?.categoryId || ''}
                label="Category"
                onChange={(e) => setEditingBudget(prev => prev ? { ...prev, categoryId: e.target.value } : null)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Amount (UGX)"
              type="number"
              value={editingBudget?.amount || ''}
              onChange={(e) => setEditingBudget(prev => prev ? { ...prev, amount: e.target.value } : null)}
              fullWidth
            />
            <TextField
              label="Notes"
              value={editingBudget?.notes || ''}
              onChange={(e) => setEditingBudget(prev => prev ? { ...prev, notes: e.target.value } : null)}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)} size="small">Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" size="small">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Budget</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this budget for {budgetToDelete?.category?.name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)} size="small">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" size="small">Delete</Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}