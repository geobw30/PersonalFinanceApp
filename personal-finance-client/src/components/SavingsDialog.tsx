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
import type { Saving } from '../types';
import { useToast } from '../contexts/ToastContext';

interface SavingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (saving: Omit<Saving, 'id'>) => Promise<void>;
  mode: 'add' | 'edit';
  initialSaving?: Saving;
}

const savingsTypes = ['Emergency Fund', 'Retirement', 'Vacation', 'Education', 'Other'];

export default function SavingsDialog({
  open,
  onClose,
  onSave,
  mode,
  initialSaving
}: SavingsDialogProps) {
  const [saving, setSaving] = useState<Omit<Saving, 'id'>>({
    name: '',
    currentAmount: 0,
    targetAmount: 0,
    type: 'Emergency Fund',
    interestRate: 0,
    date: new Date().toISOString(),
    notes: ''
  });
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialSaving) {
      setSaving({
        name: initialSaving.name,
        currentAmount: initialSaving.currentAmount,
        targetAmount: initialSaving.targetAmount || 0,
        type: initialSaving.type,
        interestRate: initialSaving.interestRate || 0,
        date: initialSaving.date,
        notes: initialSaving.notes || ''
      });
    }
  }, [initialSaving]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(saving);
      onClose();
      setSaving({
        name: '',
        currentAmount: 0,
        targetAmount: 0,
        type: 'Emergency Fund',
        interestRate: 0,
        date: new Date().toISOString(),
        notes: ''
      });
    } catch (error) {
      console.error('Error saving savings account:', error);
      showToast('Failed to save savings account', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'add' ? 'Add New' : 'Edit'} Savings Account</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Account Name"
              fullWidth
              value={saving.name}
              onChange={(e) => setSaving({ ...saving, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Current Amount"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">UGX</InputAdornment>,
              }}
              value={saving.currentAmount}
              onChange={(e) => setSaving({ ...saving, currentAmount: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Target Amount"
              type="number"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">UGX</InputAdornment>,
              }}
              value={saving.targetAmount}
              onChange={(e) => setSaving({ ...saving, targetAmount: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="Account Type"
              fullWidth
              value={saving.type}
              onChange={(e) => setSaving({ ...saving, type: e.target.value })}
            >
              {savingsTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Interest Rate (%)"
              type="number"
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              value={saving.interestRate}
              onChange={(e) => setSaving({ ...saving, interestRate: Number(e.target.value) })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={saving.notes}
              onChange={(e) => setSaving({ ...saving, notes: e.target.value })}
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
