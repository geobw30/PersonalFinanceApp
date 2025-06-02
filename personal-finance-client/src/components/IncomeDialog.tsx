import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  InputAdornment
} from '@mui/material';
import type { Income } from '../types';

interface IncomeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (income: Omit<Income, 'id'>) => Promise<void>;
  mode: 'add' | 'edit';
  initialIncome?: Income | null;
}

const incomeTypes = ['Salary', 'Business', 'Investment', 'Gift', 'Other'];
const frequencies = ['Monthly', 'Weekly', 'Yearly', 'One-time'];

export default function IncomeDialog({
  open,
  onClose,
  onSave,
  mode,
  initialIncome
}: IncomeDialogProps) {
  const [income, setIncome] = useState<Omit<Income, 'id'>>({
    source: '',
    amount: 0,
    type: 'Salary',
    isRecurring: false,
    frequency: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialIncome) {
      setIncome({
        source: initialIncome.source,
        amount: initialIncome.amount,
        type: initialIncome.type,
        isRecurring: initialIncome.isRecurring,
        frequency: initialIncome.frequency || '',
        notes: initialIncome.notes || ''
      });
    } else {
      setIncome({
        source: '',
        amount: 0,
        type: 'Salary',
        isRecurring: false,
        frequency: '',
        notes: ''
      });
    }
  }, [initialIncome, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(income);
      onClose();
      setIncome({
        source: '',
        amount: 0,
        type: 'Salary',
        isRecurring: false,
        frequency: '',
        notes: ''
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'add' ? 'Add New' : 'Edit'} Income</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Source"
              fullWidth
              value={income.source}
              onChange={(e) => setIncome({ ...income, source: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">UGX</InputAdornment>,
              }}
              value={income.amount}
              onChange={(e) => setIncome({ ...income, amount: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="Type"
              fullWidth
              value={income.type}
              onChange={(e) => setIncome({ ...income, type: e.target.value })}
            >
              {incomeTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="Frequency"
              fullWidth
              value={income.frequency}
              onChange={(e) => setIncome({ ...income, frequency: e.target.value })}
              disabled={!income.isRecurring}
            >
              {frequencies.map((freq) => (
                <MenuItem key={freq} value={freq}>
                  {freq}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="Recurring?"
              fullWidth
              value={income.isRecurring ? 'Yes' : 'No'}
              onChange={(e) =>
                setIncome({
                  ...income,
                  isRecurring: e.target.value === 'Yes',
                  frequency: e.target.value === 'Yes' ? income.frequency : ''
                })
              }
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={income.notes}
              onChange={(e) => setIncome({ ...income, notes: e.target.value })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
