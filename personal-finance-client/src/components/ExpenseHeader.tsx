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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Category } from '../types';

interface ExpenseHeaderProps {
  categories: Category[];
  onSubmit: (e: React.FormEvent) => Promise<void>;
  newExpense: {
    categoryId: string;
    amount: string;
    date: string;
    description: string;
    notes: string;
  };
  setNewExpense: React.Dispatch<React.SetStateAction<{
    categoryId: string;
    amount: string;
    date: string;
    description: string;
    notes: string;
  }>>;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export default function ExpenseHeader({
  categories,
  onSubmit,
  newExpense,
  setNewExpense,
  selectedDate,
  setSelectedDate
}: ExpenseHeaderProps) {
  return (
    <>
      {/* Month Selection */}
      <Paper sx={{ p: 2 }}>
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

      {/* Add Expense Form */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Add New Expense
        </Typography>
        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              value={newExpense.categoryId}
              label="Category"
              onChange={(e) => setNewExpense({ ...newExpense, categoryId: e.target.value })}
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
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            required
            fullWidth
          />
          <DatePicker
            label="Date"
            value={new Date(newExpense.date)}
            onChange={(newValue) => newValue && setNewExpense({ ...newExpense, date: newValue.toISOString() })}
            slotProps={{
              textField: { fullWidth: true }
            }}
          />
          <TextField
            label="Description"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Notes"
            value={newExpense.notes}
            onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
            multiline
            rows={2}
            fullWidth
          />
          <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
            Add Expense
          </Button>
        </Box>
      </Paper>
    </>
  );
} 