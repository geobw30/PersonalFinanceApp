import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import type { BudgetSummary } from "../types";
import { getMonthlySummary } from "../api/client";

// Currency formatter utility
const formatCurrency = (amount: number) => {
  return `USh ${amount.toLocaleString("en-UG")}`;
};

export default function Dashboard() {
  const [summary, setSummary] = useState<BudgetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const now = new Date();
        const { data } = await getMonthlySummary(
          now.getFullYear(),
          now.getMonth() + 1,
        );
        setSummary(data);
      } catch (err) {
        setError("Failed to load summary data");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const totalBudget = summary.reduce((acc, item) => acc + item.budgetAmount, 0);
  const totalSpent = summary.reduce((acc, item) => acc + item.totalAmount, 0);
  const remainingTotal = totalBudget - totalSpent;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <Typography variant="h5" component="h1" gutterBottom>
        {format(new Date(), "MMMM yyyy")}
      </Typography>

      {/* Total Summary */}
      <Paper
        sx={{
          p: 2,
          background: theme.palette.primary.main,
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="h6">Total Overview</Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body2">Budget</Typography>
              <Typography variant="h6">
                {formatCurrency(totalBudget)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2">Spent</Typography>
              <Typography variant="h6">{formatCurrency(totalSpent)}</Typography>
            </Box>
            <Box>
              <Typography variant="body2">Variance</Typography>
              <Typography
                variant="h6"
                color={remainingTotal >= 0 ? "inherit" : "error.light"}
              >
                {formatCurrency(Math.abs(remainingTotal))}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Chart */}
      <Paper sx={{ p: 2, height: isMobile ? 300 : 400, pb: "40px" }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Budget vs Expenses
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={summary}
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
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 60 : 30}
            />
            <YAxis
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickFormatter={(value) => `USh ${value.toLocaleString("en-UG")}`}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Amount"]}
            />
            <Bar
              dataKey="budgetAmount"
              name="Budget"
              fill={theme.palette.primary.main}
            />
            <Bar
              dataKey="totalAmount"
              name="Spent"
              fill={theme.palette.secondary.main}
            />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Category Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {summary.map((item) => (
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
            key={item.categoryId}
          >
            <Typography variant="h6" component="h3">
              {item.categoryName}
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 1,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Budget
                </Typography>
                <Typography>{formatCurrency(item.budgetAmount)}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Spent
                </Typography>
                <Typography>{formatCurrency(item.totalAmount)}</Typography>
              </Box>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color:
                  item.remainingAmount >= 0 ? "success.main" : "error.main",
                fontWeight: "medium",
              }}
            >
              {item.remainingAmount >= 0 ? "Remaining: " : "Overspent: "}
              {formatCurrency(Math.abs(item.remainingAmount))}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
