import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
} from '@mui/material';
import { Edit as EditOutlinedIcon, Delete as DeleteOutlinedIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import type { Expense } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

const formatCurrency = (amount: number) => {
  return `USh ${amount.toLocaleString('en-UG')}`;
};

export default function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  return (
    <Grid container spacing={2}>
      {expenses.map((expense) => (
        <Grid item xs={12} sm={6} md={4} key={expense.id}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {format(new Date(expense.date), 'MMM d, yyyy')}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {expense.description}
              </Typography>
              <Typography variant="h5" color="primary">
                {formatCurrency(expense.amount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Category: {expense.category?.name}
              </Typography>
              {expense.notes && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {expense.notes}
                </Typography>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              {onEdit && (
                <IconButton onClick={() => onEdit(expense)} size="small">
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton onClick={() => onDelete(expense)} size="small" color="error">
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              )}
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
} 