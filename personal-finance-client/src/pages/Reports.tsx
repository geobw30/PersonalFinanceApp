import { useState, useEffect } from "react";
import {
  Box,
  Collapse,
  Chip,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Grid,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  getBudgetReport,
  getExpensesByMonth,
  getMonthlySpendingTrends,
  getCategorySpendingTrends,
  getPredictiveBudget,
} from "../api/client";
import type {
  BudgetReportItem,
  Expense,
  MonthlySpendingTrend,
  CategorySpendingTrend,
  PredictiveBudgetItem,
} from "../types";

const COLORS = [
  "#1976d2",
  "#388e3c",
  "#fbc02d",
  "#d32f2f",
  "#7b1fa2",
  "#0288d1",
  "#c2185b",
  "#ffa000",
];
const formatCurrency = (amount: number) => amount.toLocaleString("en-UG");

// Calculate weekly expense breakdown
function getWeeklyBreakdown(expenses: Expense[], year: number, month: number) {
  const weeklyData: Record<
    string,
    { week: string; start: Date; end: Date; total: number }
  > = {};

  expenses.forEach((exp) => {
    const expDate = new Date(exp.date);
    if (expDate.getFullYear() === year && expDate.getMonth() + 1 === month) {
      const start = startOfWeek(expDate, { weekStartsOn: 1 });
      const end = endOfWeek(expDate, { weekStartsOn: 1 });
      const weekKey = format(start, "MMM dd");

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: `Week of ${weekKey}`,
          start,
          end,
          total: 0,
        };
      }
      weeklyData[weekKey].total += exp.amount;
    }
  });

  return Object.values(weeklyData)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map(({ week, total }) => ({
      week,
      total,
    }));
}

// Calculate weekly breakdown by category
function getWeeklyByCategory(
  expenses: Expense[],
  year: number,
  month: number,
  categoryNamesById: Record<number, string>,
) {
  const weeklyData: Record<
    string,
    {
      week: string;
      start: Date;
      [key: string]: string | Date | number;
    }
  > = {};

  expenses.forEach((exp) => {
    const expDate = new Date(exp.date);
    if (expDate.getFullYear() === year && expDate.getMonth() + 1 === month) {
      const start = startOfWeek(expDate, { weekStartsOn: 1 });
      const weekKey = format(start, "MMM dd");
      const categoryName =
        (exp as any).categoryName ||
        exp.category?.name ||
        categoryNamesById[exp.categoryId] ||
        `Category ${exp.categoryId}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          start,
        };
      }
      weeklyData[weekKey][categoryName] =
        ((weeklyData[weekKey][categoryName] as number) || 0) + exp.amount;
    }
  });

  return Object.values(weeklyData).sort(
    (a, b) => (a.start as Date).getTime() - (b.start as Date).getTime(),
  );
}

function CategoryRow({
  item,
  index,
}: {
  item: BudgetReportItem;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const hasSubCategories = item.subCategories.length > 0;
  const over = item.remainingAmount < 0;

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell sx={{ width: 40, p: 0.5 }}>
          {hasSubCategories ? (
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? (
                <KeyboardArrowDown fontSize="small" />
              ) : (
                <KeyboardArrowRight fontSize="small" />
              )}
            </IconButton>
          ) : null}
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                bgcolor: COLORS[index % COLORS.length],
                flexShrink: 0,
              }}
            />
            <Typography variant="body1" fontWeight="medium">
              {item.categoryName}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="right" sx={{ fontSize: 14 }}>
          {formatCurrency(item.budgetAmount)}
        </TableCell>
        <TableCell align="right" sx={{ fontSize: 14 }}>
          {formatCurrency(item.totalAmount)}
        </TableCell>
        <TableCell align="right">
          <Chip
            label={`${over ? "▲" : "▼"} ${formatCurrency(Math.abs(item.remainingAmount))}`}
            size="small"
            color={over ? "error" : "success"}
            variant="outlined"
          />
        </TableCell>
        <TableCell align="right" sx={{ fontSize: 14 }}>
          {item.budgetAmount > 0
            ? `${Math.min(Math.round((item.totalAmount / item.budgetAmount) * 100), 999)}%`
            : "—"}
        </TableCell>
      </TableRow>

      {/* Subcategory breakdown */}
      {hasSubCategories && (
        <TableRow>
          <TableCell colSpan={6} sx={{ p: 0 }}>
            <Collapse in={open} unmountOnExit>
              <Table size="small">
                <TableBody>
                  {item.subCategories.map((sc) => (
                    <TableRow
                      key={sc.subCategoryId ?? "unclassified"}
                      sx={{ bgcolor: theme.palette.action.hover }}
                    >
                      <TableCell sx={{ width: 48 }} />
                      <TableCell sx={{ pl: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {sc.subCategoryName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" />
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(sc.totalAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {item.totalAmount > 0
                            ? `${Math.round((sc.totalAmount / item.totalAmount) * 100)}%`
                            : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function Reports() {
  const [report, setReport] = useState<BudgetReportItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [trendData, setTrendData] = useState<MonthlySpendingTrend[]>([]);
  const [categoryTrends, setCategoryTrends] = useState<CategorySpendingTrend[]>(
    [],
  );
  const [predictiveBudgets, setPredictiveBudgets] = useState<
    PredictiveBudgetItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");
    Promise.all([
      getBudgetReport(selectedDate.getFullYear(), selectedDate.getMonth() + 1),
      getExpensesByMonth(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
      ),
      getMonthlySpendingTrends(6),
      getCategorySpendingTrends(6),
      getPredictiveBudget(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
      ),
    ])
      .then(
        ([
          { data: reportData },
          { data: expenseData },
          { data: trendData },
          { data: categoryTrendData },
          { data: predictiveBudgetData },
        ]) => {
          if (isMounted) {
            setReport(reportData);
            setExpenses(expenseData);
            setTrendData(trendData);
            setCategoryTrends(categoryTrendData);
            setPredictiveBudgets(predictiveBudgetData);
          }
        },
      )
      .catch(() => {
        if (isMounted) {
          setError("Failed to load report data");
          setReport([]);
          setExpenses([]);
          setTrendData([]);
          setCategoryTrends([]);
          setPredictiveBudgets([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const totalBudget = report.reduce((s, i) => s + i.budgetAmount, 0);
  const totalActual = report.reduce((s, i) => s + i.totalAmount, 0);
  const totalVariance = totalBudget - totalActual;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const subCatChartData = report
    .flatMap((cat) =>
      cat.subCategories.map((sc) => ({
        name: `${cat.categoryName} › ${sc.subCategoryName}`,
        amount: sc.totalAmount,
      })),
    )
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 12);

  const totalPredictedSpend = predictiveBudgets.reduce(
    (sum, item) => sum + item.predictedSpend,
    0,
  );
  const totalSuggestedBudget = predictiveBudgets.reduce(
    (sum, item) => sum + item.suggestedBudget,
    0,
  );
  const riskCount = predictiveBudgets.filter(
    (item) => item.outlook === "At risk",
  ).length;
  const topCategoryTrends = categoryTrends.slice(0, 4);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        width: "100%",
        pb: 4,
      }}
    >
      {/* Header */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}
      >
        <Typography variant="h5" component="h1" flexGrow={1} fontWeight="bold">
          Reports — Budget vs Actual
        </Typography>
        <DatePicker
          label="Select Period"
          value={selectedDate}
          onChange={(v) => v && setSelectedDate(v)}
          views={["year", "month"]}
          slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
        />
      </Box>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="40vh"
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          {/* Summary cards */}
          <Grid container spacing={2}>
            {[
              {
                label: "Total Budget",
                value: totalBudget,
                color: "text.primary",
              },
              {
                label: "Total Spent",
                value: totalActual,
                color: "text.primary",
              },
              {
                label: totalVariance >= 0 ? "Remaining" : "Over Budget",
                value: Math.abs(totalVariance),
                color: totalVariance >= 0 ? "success.main" : "error.main",
              },
            ].map(({ label, value, color }) => (
              <Grid item xs={12} sm={4} key={label}>
                <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    gutterBottom
                  >
                    {label}
                  </Typography>
                  <Typography variant="h5" color={color} fontWeight="bold">
                    {formatCurrency(value)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Paper elevation={2} sx={{ p: 3, minHeight: 360 }}>
                <Typography variant="h6" gutterBottom>
                  6-Month Spending Trend
                </Typography>
                {trendData.length === 0 ? (
                  <Typography color="text.secondary" sx={{ mt: 4 }}>
                    Trend data is not available yet.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-UG", {
                            month: "short",
                          })
                        }
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tickFormatter={(value) => value.toLocaleString("en-UG")}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          formatCurrency(value),
                          "Spent",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalAmount"
                        stroke="#1976d2"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper elevation={2} sx={{ p: 3, minHeight: 360 }}>
                <Typography variant="h6" gutterBottom>
                  Category Trend Highlights
                </Typography>
                {topCategoryTrends.length === 0 ? (
                  <Typography color="text.secondary" sx={{ mt: 4 }}>
                    Category trend data is not available yet.
                  </Typography>
                ) : (
                  <Box sx={{ display: "grid", gap: 2 }}>
                    {topCategoryTrends.map((trend) => (
                      <Paper
                        key={trend.categoryId}
                        variant="outlined"
                        sx={{ p: 2 }}
                      >
                        <Typography fontWeight="bold">
                          {trend.categoryName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {trend.currentMonthAmount.toLocaleString("en-UG")}{" "}
                          spent this month
                        </Typography>
                        <Typography
                          variant="body2"
                          color={
                            trend.changePercent >= 0
                              ? "success.main"
                              : "error.main"
                          }
                        >
                          {trend.changePercent >= 0 ? "+" : ""}
                          {trend.changePercent}% vs last month
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Predictive Budgeting
            </Typography>
            {predictiveBudgets.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 4 }}>
                No predictive budget recommendations are available yet.
              </Typography>
            ) : (
              <>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                  <Paper sx={{ p: 2, minWidth: 180, flex: 1 }}>
                    <Typography color="text.secondary" variant="body2">
                      Total Predicted Spend
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(totalPredictedSpend)}
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, minWidth: 180, flex: 1 }}>
                    <Typography color="text.secondary" variant="body2">
                      Total Suggested Budget
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(totalSuggestedBudget)}
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, minWidth: 180, flex: 1 }}>
                    <Typography color="text.secondary" variant="body2">
                      Categories At Risk
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {riskCount}
                    </Typography>
                  </Paper>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Budget</TableCell>
                        <TableCell align="right">Predicted</TableCell>
                        <TableCell align="right">Suggested</TableCell>
                        <TableCell align="center">Outlook</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {predictiveBudgets.map((item) => (
                        <TableRow key={item.categoryId}>
                          <TableCell>{item.categoryName}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.budgetAmount)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.predictedSpend)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.suggestedBudget)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={item.outlook}
                              size="small"
                              color={
                                item.outlook === "At risk" ? "error" : "success"
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Paper>

          {/* Budget vs Actual + Top Sub Category side by side */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Paper elevation={2} sx={{ p: 3, height: isMobile ? 320 : 420 }}>
                <Typography variant="h6" gutterBottom>
                  Budget vs Actual by Category
                </Typography>
                {report.length === 0 ? (
                  <Typography
                    align="center"
                    color="text.secondary"
                    sx={{ mt: 6 }}
                  >
                    No data for this period.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height="88%">
                    <BarChart
                      data={report}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 10,
                        bottom: isMobile ? 70 : 10,
                      }}
                      barCategoryGap="30%"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="categoryName"
                        tick={{ fontSize: isMobile ? 11 : 13 }}
                        angle={isMobile ? -40 : 0}
                        textAnchor={isMobile ? "end" : "middle"}
                        interval={0}
                        height={isMobile ? 80 : 35}
                      />
                      <YAxis
                        tickFormatter={(v) => v.toLocaleString("en-UG")}
                        tick={{ fontSize: 12 }}
                        width={90}
                      />
                      <Tooltip
                        formatter={(v: number, name: string) => [
                          formatCurrency(v),
                          name,
                        ]}
                        contentStyle={{ fontSize: 13 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 13 }} />
                      <Bar
                        dataKey="budgetAmount"
                        name="Budget"
                        fill={theme.palette.primary.main}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="totalAmount"
                        name="Actual"
                        fill={theme.palette.secondary.main}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper elevation={2} sx={{ p: 3, height: isMobile ? 320 : 420 }}>
                <Typography variant="h6" gutterBottom>
                  Top Sub Category Spending
                </Typography>
                {subCatChartData.length === 0 ? (
                  <Typography
                    align="center"
                    color="text.secondary"
                    sx={{ mt: 6 }}
                  >
                    No sub category data — assign sub categories to expenses to
                    see this chart.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height="88%">
                    <BarChart
                      data={subCatChartData}
                      layout="vertical"
                      margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                      barSize={18}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => v.toLocaleString("en-UG")}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={isMobile ? 130 : 180}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        formatter={(v: number) => [formatCurrency(v), "Spent"]}
                      />
                      <Bar dataKey="amount" name="Spent" radius={[0, 4, 4, 0]}>
                        {subCatChartData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Pie + Weekly Breakdown side by side */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Paper elevation={2} sx={{ p: 3, height: isMobile ? 300 : 380 }}>
                <Typography variant="h6" gutterBottom>
                  Spending by Category
                </Typography>
                <ResponsiveContainer width="100%" height="88%">
                  <PieChart>
                    <Pie
                      data={report}
                      dataKey="totalAmount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      outerRadius={isMobile ? 80 : 110}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine
                    >
                      {report.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => [formatCurrency(v), "Spent"]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={7}>
              <Paper elevation={2} sx={{ p: 3, height: isMobile ? 320 : 380 }}>
                <Typography variant="h6" gutterBottom>
                  Weekly Expense Breakdown
                </Typography>
                {(() => {
                  const weeklyData = getWeeklyBreakdown(
                    expenses,
                    selectedDate.getFullYear(),
                    selectedDate.getMonth() + 1,
                  );
                  return weeklyData.length === 0 ? (
                    <Typography
                      align="center"
                      color="text.secondary"
                      sx={{ mt: 6 }}
                    >
                      No expense data for this period.
                    </Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height="88%">
                      <BarChart
                        data={weeklyData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 10,
                          bottom: isMobile ? 50 : 10,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="week"
                          tick={{ fontSize: isMobile ? 10 : 12 }}
                          angle={isMobile ? -40 : 0}
                          textAnchor={isMobile ? "end" : "middle"}
                          height={isMobile ? 70 : 35}
                        />
                        <YAxis
                          tickFormatter={(v) => v.toLocaleString("en-UG")}
                          tick={{ fontSize: 12 }}
                          width={90}
                        />
                        <Tooltip
                          formatter={(v: number) => [
                            formatCurrency(v),
                            "Total",
                          ]}
                          contentStyle={{ fontSize: 13 }}
                        />
                        <Bar
                          dataKey="total"
                          name="Weekly Total"
                          fill={theme.palette.primary.main}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  );
                })()}
              </Paper>
            </Grid>
          </Grid>

          {/* Budget vs Actual Detail + Weekly by Category side by side */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              {/* Budget vs Actual detail table — expandable subcategory rows */}
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Budget vs Actual Detail
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    (click ▶ to expand sub categories — only categories with
                    subcategory-tagged expenses show the expand arrow)
                  </Typography>
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                        <TableCell sx={{ width: 48 }} />
                        <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>
                          Category
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "bold", fontSize: 14 }}
                        >
                          Budget
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "bold", fontSize: 14 }}
                        >
                          Actual
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "bold", fontSize: 14 }}
                        >
                          Variance
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "bold", fontSize: 14 }}
                        >
                          Usage&nbsp;%
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            align="center"
                            sx={{
                              color: "text.secondary",
                              py: 5,
                              fontSize: 14,
                            }}
                          >
                            No data for this period.
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {report.map((item, idx) => (
                            <CategoryRow
                              key={item.categoryId}
                              item={item}
                              index={idx}
                            />
                          ))}
                          <TableRow
                            sx={{ bgcolor: theme.palette.action.selected }}
                          >
                            <TableCell />
                            <TableCell
                              sx={{ fontWeight: "bold", fontSize: 14 }}
                            >
                              Total
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: "bold", fontSize: 14 }}
                            >
                              {formatCurrency(totalBudget)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontWeight: "bold", fontSize: 14 }}
                            >
                              {formatCurrency(totalActual)}
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                fontWeight="bold"
                                fontSize={14}
                                color={
                                  totalVariance >= 0
                                    ? "success.main"
                                    : "error.main"
                                }
                              >
                                {totalVariance >= 0 ? "▼" : "▲"}{" "}
                                {formatCurrency(Math.abs(totalVariance))}
                              </Typography>
                            </TableCell>
                            <TableCell />
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Weekly breakdown by category */}
              <Paper elevation={2} sx={{ p: 3, height: isMobile ? 420 : 520 }}>
                <Typography variant="h6" gutterBottom>
                  Weekly Breakdown by Category
                </Typography>
                {(() => {
                  const categoryNamesById = report.reduce(
                    (acc, item) => {
                      acc[item.categoryId] = item.categoryName;
                      return acc;
                    },
                    {} as Record<number, string>,
                  );

                  const reportCategoryOrder = report.map(
                    (item) => item.categoryName,
                  );
                  const reportCategoryColorMap = report.reduce(
                    (acc, item, idx) => {
                      acc[item.categoryName] = COLORS[idx % COLORS.length];
                      return acc;
                    },
                    {} as Record<string, string>,
                  );

                  const weeklyByCategory = getWeeklyByCategory(
                    expenses,
                    selectedDate.getFullYear(),
                    selectedDate.getMonth() + 1,
                    categoryNamesById,
                  );

                  const weeklyCategories = weeklyByCategory.flatMap((week) =>
                    Object.keys(week).filter(
                      (k) => k !== "week" && k !== "start",
                    ),
                  );

                  const extraCategories = Array.from(
                    new Set(
                      weeklyCategories.filter(
                        (cat) => !reportCategoryOrder.includes(cat),
                      ),
                    ),
                  ).sort();

                  const allCategories = [
                    ...reportCategoryOrder,
                    ...extraCategories,
                  ];

                  const categoryColorMap = { ...reportCategoryColorMap };
                  extraCategories.forEach((cat, idx) => {
                    categoryColorMap[cat] =
                      COLORS[
                        (reportCategoryOrder.length + idx) % COLORS.length
                      ];
                  });

                  return weeklyByCategory.length === 0 ? (
                    <Typography
                      align="center"
                      color="text.secondary"
                      sx={{ mt: 6 }}
                    >
                      No expense data for this period.
                    </Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height="88%">
                      <BarChart
                        data={weeklyByCategory}
                        margin={{
                          top: 10,
                          right: 20,
                          left: 8,
                          bottom: isMobile ? 55 : 10,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="week"
                          tick={{ fontSize: isMobile ? 10 : 12 }}
                          angle={isMobile ? -30 : 0}
                          textAnchor={isMobile ? "end" : "middle"}
                          height={isMobile ? 65 : 35}
                        />
                        <YAxis
                          tickFormatter={(v) => v.toLocaleString("en-UG")}
                          tick={{ fontSize: 11 }}
                          width={90}
                        />
                        <Tooltip
                          formatter={(v: number, name: string) => [
                            formatCurrency(v),
                            name,
                          ]}
                          contentStyle={{ fontSize: 12 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        {allCategories.map((cat) => (
                          <Bar
                            key={cat}
                            dataKey={cat}
                            name={cat}
                            stackId="weekly-category"
                            fill={categoryColorMap[cat]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  );
                })()}
              </Paper>
            </Grid>
          </Grid>

          {/* Detailed Expense Lines */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Expense Lines
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                ({expenses.length} transaction{expenses.length !== 1 ? "s" : ""}
                )
              </Typography>
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {expenses.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                No expenses recorded for this period.
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                      <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>
                        Date
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>
                        Category
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>
                        Sub Category
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>
                        Description
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", fontSize: 14 }}
                      >
                        Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>
                        Notes
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenses.map((exp) => (
                      <TableRow key={exp.id} hover>
                        <TableCell sx={{ fontSize: 13, whiteSpace: "nowrap" }}>
                          {format(new Date(exp.date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13 }}>
                          {(exp as any).categoryName ||
                            (exp as any).category?.name ||
                            ""}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: 13, color: "text.secondary" }}
                        >
                          {(exp as any).subCategoryName ||
                            exp.subCategory?.name ||
                            "—"}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13 }}>
                          {exp.description}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontSize: 13,
                            fontWeight: "medium",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatCurrency(exp.amount)}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: 13, color: "text.secondary" }}
                        >
                          {exp.notes || ""}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: theme.palette.action.selected }}>
                      <TableCell
                        colSpan={4}
                        sx={{ fontWeight: "bold", fontSize: 14 }}
                      >
                        Total
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", fontSize: 14 }}
                      >
                        {formatCurrency(totalExpenses)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
}
