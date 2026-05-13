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
import { format } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { getBudgetReport, getExpensesByMonth } from "../api/client";
import type { BudgetReportItem, Expense } from "../types";

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
        <TableCell align="right" sx={{ fontSize: 14 }}>{formatCurrency(item.budgetAmount)}</TableCell>
        <TableCell align="right" sx={{ fontSize: 14 }}>{formatCurrency(item.totalAmount)}</TableCell>
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
      getExpensesByMonth(selectedDate.getFullYear(), selectedDate.getMonth() + 1),
    ])
      .then(([{ data: reportData }, { data: expenseData }]) => {
        if (isMounted) {
          setReport(reportData);
          setExpenses(expenseData);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load report data");
          setReport([]);
          setExpenses([]);
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%", pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
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
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          {/* Summary cards */}
          <Grid container spacing={2}>
            {[
              { label: "Total Budget", value: totalBudget, color: "text.primary" },
              { label: "Total Spent", value: totalActual, color: "text.primary" },
              {
                label: totalVariance >= 0 ? "Remaining" : "Over Budget",
                value: Math.abs(totalVariance),
                color: totalVariance >= 0 ? "success.main" : "error.main",
              },
            ].map(({ label, value, color }) => (
              <Grid item xs={12} sm={4} key={label}>
                <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {label}
                  </Typography>
                  <Typography variant="h5" color={color} fontWeight="bold">
                    {formatCurrency(value)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Bar chart: Budget vs Actual — full width */}
          <Paper elevation={2} sx={{ p: 3, height: isMobile ? 320 : 420 }}>
            <Typography variant="h6" gutterBottom>
              Budget vs Actual by Category
            </Typography>
            {report.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ mt: 6 }}>
                No data for this period.
              </Typography>
            ) : (
              <ResponsiveContainer width="100%" height="88%">
                <BarChart
                  data={report}
                  margin={{ top: 10, right: 30, left: 10, bottom: isMobile ? 70 : 10 }}
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
                    formatter={(v: number, name: string) => [formatCurrency(v), name]}
                    contentStyle={{ fontSize: 13 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Bar dataKey="budgetAmount" name="Budget" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalAmount" name="Actual" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>

          {/* Pie + Sub category bar side by side */}
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
                    <Tooltip formatter={(v: number) => [formatCurrency(v), "Spent"]} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={7}>
              <Paper elevation={2} sx={{ p: 3, height: isMobile ? 320 : 380 }}>
                <Typography variant="h6" gutterBottom>
                  Top Sub Category Spending
                </Typography>
                {subCatChartData.length === 0 ? (
                  <Typography align="center" color="text.secondary" sx={{ mt: 6 }}>
                    No sub category data — assign sub categories to expenses to see this chart.
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
                      <Tooltip formatter={(v: number) => [formatCurrency(v), "Spent"]} />
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

          {/* Budget vs Actual detail table — expandable subcategory rows */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Budget vs Actual Detail
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                (click ▶ to expand sub categories — only categories with subcategory-tagged expenses show the expand arrow)
              </Typography>
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableCell sx={{ width: 48 }} />
                    <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>Category</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", fontSize: 14 }}>Budget</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", fontSize: 14 }}>Actual</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", fontSize: 14 }}>Variance</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", fontSize: 14 }}>Usage&nbsp;%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ color: "text.secondary", py: 5, fontSize: 14 }}>
                        No data for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {report.map((item, idx) => (
                        <CategoryRow key={item.categoryId} item={item} index={idx} />
                      ))}
                      <TableRow sx={{ bgcolor: theme.palette.action.selected }}>
                        <TableCell />
                        <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>Total</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold", fontSize: 14 }}>
                          {formatCurrency(totalBudget)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold", fontSize: 14 }}>
                          {formatCurrency(totalActual)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            fontWeight="bold"
                            fontSize={14}
                            color={totalVariance >= 0 ? "success.main" : "error.main"}
                          >
                            {totalVariance >= 0 ? "▼" : "▲"} {formatCurrency(Math.abs(totalVariance))}
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

          {/* Detailed Expense Lines */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Expense Lines
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                ({expenses.length} transaction{expenses.length !== 1 ? "s" : ""})
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
                      <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>Sub Category</TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", fontSize: 14 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: 14 }}>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenses.map((exp) => (
                      <TableRow key={exp.id} hover>
                        <TableCell sx={{ fontSize: 13, whiteSpace: "nowrap" }}>
                          {format(new Date(exp.date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13 }}>
                          {(exp as any).categoryName || (exp as any).category?.name || ""}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                          {(exp as any).subCategoryName || exp.subCategory?.name || "—"}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13 }}>{exp.description}</TableCell>
                        <TableCell align="right" sx={{ fontSize: 13, fontWeight: "medium", whiteSpace: "nowrap" }}>
                          {formatCurrency(exp.amount)}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                          {exp.notes || ""}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: theme.palette.action.selected }}>
                      <TableCell colSpan={4} sx={{ fontWeight: "bold", fontSize: 14 }}>
                        Total
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", fontSize: 14 }}>
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

