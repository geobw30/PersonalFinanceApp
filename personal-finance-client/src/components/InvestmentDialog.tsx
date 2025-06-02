import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getInvestmentTypes } from '../api/client';
import type { Investment, InvestmentType, CreateInvestmentDto } from '../types';

interface InvestmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (investment: CreateInvestmentDto) => void;
  mode: 'add' | 'edit';
  initialInvestment?: Investment | null;
}

export default function InvestmentDialog({
  open,
  onClose,
  onSave,
  mode,
  initialInvestment
}: InvestmentDialogProps) {
  const [investmentData, setInvestmentData] = useState({
    name: '',
    investmentTypeId: 0,
    amount: '',
    date: new Date().toISOString(),
    currentValue: '',
    notes: '',
    returnRate: ''
  });

  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);

  // Fetch investment types when component mounts
  useEffect(() => {
    const fetchInvestmentTypes = async () => {
      try {
        const response = await getInvestmentTypes();
        setInvestmentTypes(response.data);
      } catch (error) {
        console.error('Error fetching investment types:', error);
      }
    };
    fetchInvestmentTypes();
  }, []);

  // Reset form data when dialog opens/closes or initialInvestment changes
  useEffect(() => {
    if (open) {
      setInvestmentData({
        name: initialInvestment?.name || '',
        investmentTypeId: initialInvestment?.typeId || 0,
        amount: initialInvestment?.amount?.toString() || '',
        date: initialInvestment?.date || new Date().toISOString(),
        currentValue: initialInvestment?.currentValue?.toString() || '',
        notes: initialInvestment?.notes || '',
        returnRate: initialInvestment?.returnRate?.toString() || ''
      });
    }
  }, [open, initialInvestment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!investmentData.name || !investmentData.investmentTypeId || !investmentData.amount || !investmentData.currentValue) {
      return;
    }

    const amount = parseFloat(investmentData.amount);
    const currentValue = parseFloat(investmentData.currentValue);
    const returnRate = investmentData.returnRate ? parseFloat(investmentData.returnRate) : undefined;

    if (isNaN(amount) || isNaN(currentValue) || (returnRate !== undefined && isNaN(returnRate))) {
      return;
    }

    onSave({
      name: investmentData.name.trim(),
      investmentTypeId: investmentData.investmentTypeId,
      amount: amount,
      date: investmentData.date,
      currentValue: currentValue,
      notes: investmentData.notes.trim() || undefined,
      returnRate: returnRate
    });

    // Reset form
    setInvestmentData({
      name: '',
      investmentTypeId: 0,
      amount: '',
      date: new Date().toISOString(),
      currentValue: '',
      notes: '',
      returnRate: ''
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'add' ? 'Add New Investment' : 'Edit Investment'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              required
              value={investmentData.name}
              onChange={(e) => setInvestmentData({ ...investmentData, name: e.target.value })}
            />

            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={investmentData.investmentTypeId}
                label="Type"
                onChange={(e) => setInvestmentData({ ...investmentData, investmentTypeId: e.target.value as number })}
              >
                <MenuItem value={0} disabled>Select a type</MenuItem>
                {investmentTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Initial Amount (UGX)"
              type="number"
              required
              value={investmentData.amount}
              onChange={(e) => setInvestmentData({ ...investmentData, amount: e.target.value })}
              inputProps={{ min: "0", step: "1" }}
            />

            <TextField
              label="Current Value (UGX)"
              type="number"
              required
              value={investmentData.currentValue}
              onChange={(e) => setInvestmentData({ ...investmentData, currentValue: e.target.value })}
              inputProps={{ min: "0", step: "1" }}
            />

            <DatePicker
              label="Date"
              value={new Date(investmentData.date)}
              onChange={(newValue) => {
                if (newValue) {
                  setInvestmentData({ ...investmentData, date: newValue.toISOString() });
                }
              }}
              slotProps={{
                textField: { fullWidth: true }
              }}
            />

            <TextField
              label="Return Rate (%)"
              type="number"
              value={investmentData.returnRate}
              onChange={(e) => setInvestmentData({ ...investmentData, returnRate: e.target.value })}
              inputProps={{ step: "0.01" }}
            />

            <TextField
              label="Notes"
              multiline
              rows={2}
              value={investmentData.notes}
              onChange={(e) => setInvestmentData({ ...investmentData, notes: e.target.value })}
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
