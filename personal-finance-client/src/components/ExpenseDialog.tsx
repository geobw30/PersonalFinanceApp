import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Expense, Category } from '../types';

interface ExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'category'>) => void;
  categories: Category[];
  mode: 'add' | 'edit';
  initialExpense?: Expense | null;
}

export default function ExpenseDialog({ 
  open, 
  onClose, 
  onSave, 
  categories,
  mode,
  initialExpense 
}: ExpenseDialogProps) {
  const [expenseData, setExpenseData] = useState({
    categoryId: initialExpense?.categoryId || '',
    amount: initialExpense?.amount?.toString() || '',
    date: initialExpense?.date || new Date().toISOString(),
    description: initialExpense?.description || '',
    notes: initialExpense?.notes || ''
  });

  // Reset form data when dialog opens/closes or initialExpense changes
  useEffect(() => {
    if (open) {
      setExpenseData({
        categoryId: initialExpense?.categoryId || '',
        amount: initialExpense?.amount?.toString() || '',
        date: initialExpense?.date || new Date().toISOString(),
        description: initialExpense?.description || '',
        notes: initialExpense?.notes || ''
      });
    }
  }, [open, initialExpense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!expenseData.categoryId || !expenseData.amount || !expenseData.description) {
      return;
    }

    const categoryIdNumber = parseInt(expenseData.categoryId as string, 10);
    const amountNumber = parseFloat(expenseData.amount);

    if (isNaN(categoryIdNumber) || isNaN(amountNumber)) {
      return;
    }

    // Log the data being sent
    console.log('Submitting expense data:', {
      categoryId: categoryIdNumber,
      amount: amountNumber,
      date: expenseData.date,
      description: expenseData.description.trim(),
      notes: expenseData.notes.trim() || undefined
    });

    onSave({
      categoryId: categoryIdNumber,
      amount: amountNumber,
      date: expenseData.date,
      description: expenseData.description.trim(),
      notes: expenseData.notes.trim() || undefined
    });

    // Reset form
    setExpenseData({
      categoryId: '',
      amount: '',
      date: new Date().toISOString(),
      description: '',
      notes: ''
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'add' ? 'Add New Expense' : 'Edit Expense'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={expenseData.categoryId}
                label="Category"
                onChange={(e) => setExpenseData({ ...expenseData, categoryId: e.target.value })}
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
              required
              value={expenseData.amount}
              onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
              inputProps={{ min: "0", step: "1" }}
            />

            <DatePicker
              label="Date"
              value={new Date(expenseData.date)}
              onChange={(newValue) => {
                if (newValue) {
                  setExpenseData({ ...expenseData, date: newValue.toISOString() });
                }
              }}
              slotProps={{
                textField: { fullWidth: true }
              }}
            />

            <TextField
              label="Description"
              required
              value={expenseData.description}
              onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
            />

            <TextField
              label="Notes"
              multiline
              rows={2}
              value={expenseData.notes}
              onChange={(e) => setExpenseData({ ...expenseData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} size="small">Cancel</Button>
          <Button type="submit" variant="contained" size="small">
            {mode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 