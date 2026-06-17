import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, FAB, Icon, Text } from "@rneui/themed";
import LoadingOverlay from "../components/LoadingOverlay";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { format } from "date-fns";
import { deleteExpense, getExpensesByMonth, getIncomesByMonth } from "../api/client";
import type { Expense, Income, RootStackParamList } from "../types";

const formatCurrency = (amount: number) =>
  `USh ${amount.toLocaleString("en-UG")}`;

type Nav = NativeStackNavigationProp<RootStackParamList>;

const confirmDelete = (label: string, onConfirm: () => void) =>
  Alert.alert("Confirm Delete", `Delete this ${label}?`, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: onConfirm },
  ]);

function groupExpensesByDate(expenses: Expense[]) {
  const groups: Record<string, { date: string; dateKey: string; expenses: Expense[] }> = {};
  expenses.forEach((expense) => {
    const dateKey = format(new Date(expense.date), "yyyy-MM-dd");
    const dateLabel = format(new Date(expense.date), "EEEE, dd MMM yyyy");
    if (!groups[dateKey]) {
      groups[dateKey] = { date: dateLabel, dateKey, expenses: [] };
    }
    groups[dateKey].expenses.push(expense);
  });
  const sorted = Object.values(groups).sort((a, b) =>
    b.dateKey.localeCompare(a.dateKey)
  );
  sorted.forEach(group => {
    group.expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  return sorted;
}

export default function ExpensesScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(
    async (showOverlay = true) => {
      if (showOverlay) setLoading(true);
      try {
        const [expensesRes, incomesRes] = await Promise.all([
          getExpensesByMonth(selectedDate.getFullYear(), selectedDate.getMonth() + 1),
          getIncomesByMonth(selectedDate.getFullYear(), selectedDate.getMonth() + 1),
        ]);
        setExpenses(expensesRes.data);
        setIncomes(incomesRes.data);
      } finally {
        if (showOverlay) setLoading(false);
      }
    },
    [selectedDate],
  );

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData(false);
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );

  const totalIncome = useMemo(
    () => incomes.reduce((sum, i) => sum + i.amount, 0),
    [incomes],
  );

  const remainingBalance = totalIncome - total;
  const groupedExpenses = useMemo(() => groupExpensesByDate(expenses), [expenses]);

  return (
    <View style={styles.container}>
      <View style={styles.monthSelector}>
        <TouchableOpacity
          onPress={() =>
            setSelectedDate(
              new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth() - 1,
                1,
              ),
            )
          }
        >
          <Icon name="chevron-left" type="material" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {format(selectedDate, "MMMM yyyy")}
        </Text>
        <TouchableOpacity
          onPress={() =>
            setSelectedDate(
              new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth() + 1,
                1,
              ),
            )
          }
        >
          <Icon name="chevron-right" type="material" />
        </TouchableOpacity>
      </View>

      <Card containerStyle={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Expenses</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
      </Card>

      <Card containerStyle={styles.remainingCard}>
        <Text style={styles.remainingLabel}>Remaining Balance</Text>
        <Text style={[styles.remainingValue, remainingBalance < 0 && styles.negative]}>
          {formatCurrency(remainingBalance)}
        </Text>
      </Card>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {groupedExpenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No expenses this month.</Text>
            <Text style={styles.emptyHint}>Tap the + button to add expenses</Text>
          </View>
        ) : (
          groupedExpenses.map((group) => {
            const dayTotal = group.expenses.reduce(
              (sum, e) => sum + e.amount,
              0,
            );
            return (
              <View key={group.dateKey}>
                <View style={styles.dateHeader}>
                  <Text style={styles.dateHeaderText}>{group.date}</Text>
                  <Text style={styles.dateHeaderDayTotal}>{formatCurrency(dayTotal)}</Text>
                </View>
                {group.expenses.map((expense) => (
                  <Card key={expense.id} containerStyle={styles.itemCard}>
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.title}>{expense.description}</Text>
                        <Text style={styles.meta}>
                          {expense.category?.name || "Uncategorized"}
                        </Text>
                        {expense.notes ? (
                          <Text style={styles.meta}>{expense.notes}</Text>
                        ) : null}
                      </View>
                      <View style={styles.actions}>
                        <Text style={styles.amount}>
                          {formatCurrency(expense.amount)}
                        </Text>
                        <View style={styles.actionRow}>
                          <TouchableOpacity
                            style={styles.btn}
                            onPress={() =>
                              navigation.navigate("EditExpense", { expense })
                            }
                          >
                            <Text style={styles.btnText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.btnDelete}
                            onPress={() =>
                              confirmDelete("expense", async () => {
                                await deleteExpense(expense.id);
                                await loadData();
                              })
                            }
                          >
                            <Text style={styles.btnTextDelete}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>

      <FAB
        icon={{ name: "add", color: "#fff" }}
        color="#1976d2"
        placement="right"
        onPress={() => navigation.navigate("AddExpense")}
      />
      <LoadingOverlay visible={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  monthText: { fontSize: 18, fontWeight: "700" },
  totalCard: { borderRadius: 10 },
  totalLabel: { textAlign: "center", color: "#666" },
  totalValue: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#d32f2f",
  },
  remainingCard: { borderRadius: 10, marginTop: 8 },
  remainingLabel: { textAlign: "center", color: "#666" },
  remainingValue: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#2e7d32",
  },
  negative: {
    color: "#d32f2f",
  },
  dateHeader: {
    backgroundColor: "#e8eaf6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1976d2",
  },
  dateHeaderDayTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#d32f2f",
  },
  itemCard: { borderRadius: 10 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  title: { fontSize: 16, fontWeight: "600" },
  meta: { marginTop: 4, fontSize: 12, color: "#777" },
  amount: { color: "#d32f2f", fontWeight: "700", textAlign: "right" },
  actions: { alignItems: "flex-end", gap: 8 },
  actionRow: { flexDirection: "row", gap: 8 },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 4,
    borderColor: "#1976d2",
    borderWidth: 1,
  },
  btnText: {
    color: "#1976d2",
    fontSize: 12,
    fontWeight: "600",
  },
  btnDelete: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 4,
    borderColor: "#d32f2f",
    borderWidth: 1,
  },
  btnTextDelete: {
    color: "#d32f2f",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: { alignItems: "center", marginTop: 32 },
  empty: { textAlign: "center", color: "#999", fontSize: 14 },
  emptyHint: { textAlign: "center", color: "#888", fontSize: 12, marginTop: 6 },
});