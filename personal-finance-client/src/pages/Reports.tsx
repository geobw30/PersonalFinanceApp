import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Grid,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { getMonthlySummary, getExpensesByMonth } from '../api/client';
import type { BudgetSummary } from '../types';

const COLORS = ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0288d1', '#c2185b', '#ffa000'];

const formatCurrency = (amount: number) => amount.toLocaleString('en-UG');

export default function Reports() {
  const [summary, setSummary] = useState<BudgetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expenses, setExpenses] = useState<any[]>([]); // Add expenses state
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');
    const fetchSummary = async () => {
      try {
        const now = selectedDate;
        const [{ data: summaryData }, { data: expensesData }] = await Promise.all([
          getMonthlySummary(now.getFullYear(), now.getMonth() + 1),
          getExpensesByMonth(now.getFullYear(), now.getMonth() + 1)
        ]);
        if (isMounted) {
          setSummary(summaryData);
          setExpenses(expensesData);
        }
      } catch (err: any) {
        if (isMounted) {
          setError('Failed to load report data');
          setSummary([]);
          setExpenses([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSummary();
    return () => { isMounted = false; };
  }, [selectedDate]);

  // Only include categories with a budget for the selected month OR actual spending in the selected month
  const filteredSummary = summary.filter(item =>
    (item.budgetAmount > 0 || item.totalAmount > 0) &&
    (typeof item.categoryName === 'string' && item.categoryName.trim() !== '')
  );

  // Calculate total budget for the selected month
  const totalBudget = filteredSummary.reduce((acc, item) => acc + item.budgetAmount, 0);

  // Calculate total spent for the selected month (sum only expenses that are within the budgeted categories)
  // If your backend returns cumulative totals, you must filter only expenses for the selected month.
  // If your BudgetSummary has a list of expenses with dates, filter them here:
  // Otherwise, this assumes totalAmount is already for the selected month.
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  const totalSpent = filteredSummary.reduce((acc, item) => {
    // If item.expenses exists and is an array, filter by month/year
    if (Array.isArray((item as any).expenses)) {
      const monthSpent = (item as any).expenses
        .filter((exp: any) => {
          const d = new Date(exp.date);
          return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
        })
        .reduce((sum: number, exp: any) => sum + exp.amount, 0);
      return acc + monthSpent;
    }
    // If not, and totalAmount is cumulative, try to use item.monthlyAmount if available
    if (typeof (item as any).monthlyAmount === 'number') {
      return acc + (item as any).monthlyAmount;
    }
    // Otherwise, assume totalAmount is for the selected month
    return acc + item.totalAmount;
  }, 0);

  const remainingTotal = totalBudget - totalSpent;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        alignItems: 'center', // center horizontally
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 1,
          width: '100%',
          justifyContent: 'center', // center header content
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Reports: Budget vs Actual
        </Typography>
        <DatePicker
          label="Select Period"
          value={selectedDate}
          onChange={(newValue) => newValue && setSelectedDate(newValue)}
          views={['year', 'month']}
          slotProps={{
            textField: { size: 'small', sx: { minWidth: 140 } }
          }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh" width="100%">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" width="100%" align="center">{error}</Typography>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ width: '100%', justifyContent: 'center' }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, width: '100%', textAlign: 'center' }}>
                <Typography variant="body2">Total Budget</Typography>
                <Typography variant="h6">{formatCurrency(totalBudget)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, width: '100%', textAlign: 'center' }}>
                <Typography variant="body2">Total Spent</Typography>
                <Typography variant="h6">{formatCurrency(totalSpent)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, width: '100%', textAlign: 'center' }}>
                <Typography variant="body2">Variance</Typography>
                <Typography variant="h6" color={remainingTotal >= 0 ? 'success.main' : 'error.main'}>
                  {formatCurrency(Math.abs(remainingTotal))}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Graphs Row */}
          <Grid container spacing={2} sx={{ width: '100%', justifyContent: 'center', mt: 1 }}>
            {/* Bar Chart */}
            <Grid item xs={12} md={11}>
              <Paper sx={{ p: 2, height: isMobile ? 300 : 400, width: '100%' }}>
                <Typography variant="h6" gutterBottom align="center">
                  Budget vs Actual by Category
                </Typography>
                {filteredSummary.length === 0 ? (
                  <Typography align="center" color="text.secondary" sx={{ mt: 6 }}>
                    No data available for this period.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart
                      data={filteredSummary}
                      margin={{
                        top: 20,
                        right: isMobile ? 0 : 30,
                        left: isMobile ? -20 : 0,
                        bottom: isMobile ? 0 : 5,
                      }}
                      barSize={isMobile ? 15 : 20}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="categoryName"
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        interval={0}
                        angle={isMobile ? -45 : 0}
                        textAnchor={isMobile ? 'end' : 'middle'}
                        height={isMobile ? 60 : 30}
                      />
                      <YAxis
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        tickFormatter={(value) => value.toLocaleString('en-UG')}
                      />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                      <Legend />
                      <Bar dataKey="budgetAmount" name="Budget" fill={theme.palette.primary.main} />
                      <Bar dataKey="totalAmount" name="Actual" fill={theme.palette.secondary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>

            {/* Pie Chart */}
            <Grid item xs={12} md={11}>
              <Paper sx={{ p: 2, height: isMobile ? 300 : 400, width: '100%' }}>
                <Typography variant="h6" gutterBottom align="center">
                  Spending Distribution by Category
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={filteredSummary}
                      dataKey="totalAmount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      outerRadius={isMobile ? 80 : 120}
                      fill={theme.palette.secondary.main}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {filteredSummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Spent']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Table Summary */}
          <Paper sx={{ p: 2, mt: 2, width: '100%', maxWidth: 900, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom align="center">
              Budget vs Actual Table
            </Typography>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8 }}>Category</th>
                  <th style={{ textAlign: 'right', padding: 8 }}>Budget</th>
                  <th style={{ textAlign: 'right', padding: 8 }}>Actual</th>
                  <th style={{ textAlign: 'right', padding: 8 }}>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {filteredSummary.map((item) => (
                  <tr key={item.categoryId}>
                    <td style={{ padding: 8 }}>{item.categoryName}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{formatCurrency(item.budgetAmount)}</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>{formatCurrency(item.totalAmount)}</td>
                    <td style={{ padding: 8, textAlign: 'right', color: item.remainingAmount >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                      {formatCurrency(item.remainingAmount)}
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr style={{ fontWeight: 'bold', background: theme.palette.action.hover }}>
                  <td style={{ padding: 8 }}>Total</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{formatCurrency(totalBudget)}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{formatCurrency(totalSpent)}</td>
                  <td style={{ padding: 8, textAlign: 'right', color: remainingTotal >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                    {formatCurrency(Math.abs(remainingTotal))}
                  </td>
                </tr>
              </tbody>
            </Box>
          </Paper>

          {/* Detailed Expense Lines */}
          <Paper sx={{ p: 2, mt: 2, width: '100%', maxWidth: 900, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom align="center">
              Detailed Expense Lines
            </Typography>
            {expenses.length === 0 ? (
              <Typography align="center" color="text.secondary">
                No expenses for this period.
              </Typography>
            ) : (
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', mt: 2 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8 }}>Date</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Category</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Description</th>
                    <th style={{ textAlign: 'right', padding: 8 }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td style={{ padding: 8 }}>{format(new Date(exp.date), 'yyyy-MM-dd')}</td>
                      <td style={{ padding: 8 }}>{exp.category?.name || exp.categoryName || ''}</td>
                      <td style={{ padding: 8 }}>{exp.description}</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>{formatCurrency(exp.amount)}</td>
                      <td style={{ padding: 8 }}>{exp.notes || ''}</td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr style={{ fontWeight: 'bold', background: theme.palette.action.hover }}>
                    <td style={{ padding: 8 }}>Total</td>
                    <td />
                    <td />
                    <td style={{ padding: 8, textAlign: 'right' }}>
                      {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </Box>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
}