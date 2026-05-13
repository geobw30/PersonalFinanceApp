import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Menu,
  MenuItem,
  InputAdornment,
  Chip,
  Stack,
  Grid,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  LocalCafe as CoffeeIcon,
  Home as HomeIcon,
  ShoppingCart as GroceriesIcon,
  DirectionsCar as CarIcon,
  LocalMovies as StreamingIcon,
  Restaurant as RestaurantIcon,
  FlightTakeoff as TravelIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import type { Expense, Category, Budget } from "../types";
import {
  getExpensesByMonth,
  createExpense,
  getCategories,
  updateExpense,
  deleteExpense,
  getBudgetsByMonth,
} from "../api/client";
import ExpenseDialog from "../components/ExpenseDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import { format } from "date-fns";
import { useToast } from "../contexts/ToastContext";

const getCategoryIcon = (categoryName: string) => {
  switch (categoryName.toLowerCase()) {
    case "coffee":
      return <CoffeeIcon />;
    case "rent":
    case "home":
      return <HomeIcon />;
    case "groceries":
      return <GroceriesIcon />;
    case "car":
      return <CarIcon />;
    case "streaming":
      return <StreamingIcon />;
    case "restaurant":
      return <RestaurantIcon />;
    case "travel":
      return <TravelIcon />;
    default:
      return <RemoveIcon sx={{ color: "error.main" }} />;
  }
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryMenuAnchor, setCategoryMenuAnchor] =
    useState<null | HTMLElement>(null);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    categoryId: "",
    amount: "",
    date: new Date().toISOString(),
    description: "",
    notes: "",
  });

  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [expensesRes, categoriesRes, budgetsRes] = await Promise.all([
        getExpensesByMonth(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
        ),
        getCategories(),
        getBudgetsByMonth(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
        ),
      ]);
      setExpenses(expensesRes.data);
      setCategories(categoriesRes.data);
      setBudgets(budgetsRes.data);
    } catch (error) {
      setError("Failed to load data");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddExpense = async (
    newExpense: Omit<Expense, "id" | "category" | "subCategory">,
  ) => {
    try {
      // Ensure all required fields are present and of correct type
      if (
        !newExpense.categoryId ||
        !newExpense.amount ||
        !newExpense.description
      ) {
        showToast("Please fill in all required fields", "error");
        return;
      }

      // Format the data for the API
      const expenseData = {
        categoryId: Number(newExpense.categoryId),
        subCategoryId: newExpense.subCategoryId ? Number(newExpense.subCategoryId) : undefined,
        amount: Number(newExpense.amount),
        date: new Date(newExpense.date).toISOString(),
        description: newExpense.description.trim(),
        notes: newExpense.notes?.trim() || undefined,
      };

      // Log the request data
      console.log("Sending expense data to API:", expenseData);

      const response = await createExpense(expenseData);
      console.log("API Response:", response);

      setAddDialogOpen(false);
      fetchData();
      showToast("Expense added successfully", "success");
    } catch (error: any) {
      console.error("Error creating expense:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.data?.errors) {
        // Handle validation errors from the API
        const errorMessages = Object.values(error.response.data.errors).flat();
        showToast(`Validation error: ${errorMessages.join(", ")}`, "error");
      } else if (error.response?.data?.message) {
        // Handle specific error message from the API
        showToast(error.response.data.message, "error");
      } else {
        showToast(
          "Failed to create expense. Please check all fields are filled correctly.",
          "error",
        );
      }
    }
  };

  const handleEditSave = async (
    updatedExpense: Omit<Expense, "id" | "category" | "subCategory">,
  ) => {
    if (!editingExpense) return;
    try {
      await updateExpense(editingExpense.id, updatedExpense);
      setEditDialogOpen(false);
      fetchData();
      showToast("Expense updated successfully", "success");
    } catch (error) {
      console.error("Error updating expense:", error);
      showToast("Failed to update expense", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;
    try {
      await deleteExpense(deletingExpense.id);
      setDeleteDialogOpen(false);
      fetchData();
      showToast("Expense deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting expense:", error);
      showToast("Failed to delete expense", "error");
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      searchTerm === "" ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      (expense.category && selectedCategories.includes(expense.category.name));
    return matchesSearch && matchesCategory;
  });

  // Group expenses by date
  const groupedExpenses = filteredExpenses.reduce(
    (groups: Record<string, Expense[]>, expense) => {
      const date = format(new Date(expense.date), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(expense);
      return groups;
    },
    {},
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "decimal",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate total spent per category
  const categorySpending = expenses.reduce(
    (acc, expense) => {
      if (expense.category) {
        acc[expense.category.id] =
          (acc[expense.category.id] || 0) + Math.abs(expense.amount);
      }
      return acc;
    },
    {} as Record<string, number>,
  );

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Summary Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 0,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Budget Summary
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h4">
            {format(selectedDate, "MMMM yyyy")}
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {budgets.map((budget) => {
            const spent = categorySpending[budget.categoryId] || 0;
            const remaining = budget.amount - spent;
            const progress = (spent / budget.amount) * 100;

            return (
              <Grid item xs={12} sm={6} md={4} key={budget.id}>
                <Box
                  sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    {budget.category?.name}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progress, 100)}
                      color={progress > 100 ? "error" : "primary"}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <Tooltip title="Amount Spent">
                      <Typography variant="body2" color="error">
                        {formatCurrency(spent)}
                      </Typography>
                    </Tooltip>
                    <Typography
                      variant="body2"
                      color={remaining < 0 ? "error" : "success.main"}
                      sx={{ fontWeight: "medium" }}
                    >
                      {formatCurrency(Math.abs(remaining))}{" "}
                      {remaining < 0 ? "over" : "left"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Transactions Section */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          borderRadius: 0,
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <Box
          sx={{
            p: 3,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">
              Transactions
              <Typography variant="body2" color="text.secondary">
                You had {filteredExpenses.length} expenses this month
              </Typography>
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => setCategoryMenuAnchor(e.currentTarget)}
                endIcon={<ArrowDownIcon />}
              >
                Category
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
              >
                Add
              </Button>
            </Box>
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {selectedCategories.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {selectedCategories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onDelete={() =>
                    setSelectedCategories((prev) =>
                      prev.filter((c) => c !== category),
                    )
                  }
                />
              ))}
            </Stack>
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 3,
            py: 2,
            width: "100%",
          }}
        >
          <List>
            {Object.entries(groupedExpenses).map(([date, dayExpenses]) => (
              <Box key={date}>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  {format(new Date(date), "EEEE, MMMM d")}
                </Typography>
                {dayExpenses.map((expense) => (
                  <ListItem
                    key={expense.id}
                    sx={{
                      borderRadius: 1,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <ListItemIcon>
                      {getCategoryIcon(expense.category?.name || "")}
                    </ListItemIcon>
                    <ListItemText
                      primary={expense.description}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {expense.category?.name}
                            {expense.subCategory && (
                              <> &rsaquo; {expense.subCategory.name}</>
                            )}
                          </Typography>
                          {expense.notes && (
                            <>
                              <br />
                              <Typography
                                variant="caption"
                                component="span"
                                color="text.secondary"
                              >
                                {expense.notes}
                              </Typography>
                            </>
                          )}
                        </>
                      }
                    />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="body2"
                        color="error"
                        sx={{ fontWeight: "medium" }}
                      >
                        {formatCurrency(Math.abs(expense.amount))}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingExpense(expense);
                          setEditDialogOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDeletingExpense(expense);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </Box>
            ))}
          </List>
        </Box>
      </Paper>

      {/* Menus */}
      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={() => setCategoryMenuAnchor(null)}
      >
        {categories.map((category) => (
          <MenuItem
            key={category.id}
            onClick={() => {
              setSelectedCategories((prev) =>
                prev.includes(category.name)
                  ? prev.filter((c) => c !== category.name)
                  : [...prev, category.name],
              );
              setCategoryMenuAnchor(null);
            }}
          >
            <ListItemIcon>{getCategoryIcon(category.name)}</ListItemIcon>
            <ListItemText primary={category.name} />
          </MenuItem>
        ))}
      </Menu>

      {/* Dialogs */}
      <ExpenseDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddExpense}
        categories={categories}
        mode="add"
      />

      <ExpenseDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleEditSave}
        categories={categories}
        mode="edit"
        initialExpense={editingExpense}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense?`}
      />

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
