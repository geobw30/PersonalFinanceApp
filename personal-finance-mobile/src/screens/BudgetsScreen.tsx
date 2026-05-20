import React, { useCallback, useMemo, useState } from "react";
import {
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
import {
  deleteBudget,
  getBudgetsByMonth,
  getIncomesByMonth,
} from "../api/client";
import type { Budget, Income, RootStackParamList } from "../types";

const formatCurrency = (amount: number) =>
  `USh ${amount.toLocaleString("en-UG")}`;

const toNumber = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const normalizeBudget = (item: unknown): Budget => {
  const source = (item ?? {}) as Record<string, unknown>;
  return {
    id: toNumber(source.id ?? source.Id),
    name: String(source.name ?? source.Name ?? ""),
    categoryId: toNumber(source.categoryId ?? source.CategoryId),
    category: (source.category ?? source.Category) as Budget["category"],
    amount: toNumber(source.amount ?? source.Amount),
    startDate: String(source.startDate ?? source.StartDate ?? ""),
    endDate: String(source.endDate ?? source.EndDate ?? ""),
  };
};

const safeDateLabel = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }
  return format(parsed, "dd MMM");
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function BudgetsScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(
    async (showOverlay = true) => {
      if (showOverlay) setLoading(true);
      try {
        setError("");
        const [budgetRes, incomeRes] = await Promise.all([
          getBudgetsByMonth(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1,
          ),
          getIncomesByMonth(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1,
          ),
        ]);
        setBudgets((budgetRes.data ?? []).map(normalizeBudget));
        setIncomes(incomeRes.data);
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load budgets for this month.";
        setError(errorMsg);
        setBudgets([]);
        setIncomes([]);
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

  const previousMonth = () =>
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1),
    );

  const nextMonth = () =>
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1),
    );

  const totalBudget = useMemo(
    () => budgets.reduce((sum, b) => sum + b.amount, 0),
    [budgets],
  );

  const totalIncome = useMemo(
    () => incomes.reduce((sum, i) => sum + i.amount, 0),
    [incomes],
  );

  const runningBalance = totalIncome - totalBudget;

  return (
    <View style={styles.container}>
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={previousMonth}>
          <Icon name="chevron-left" type="material" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {format(selectedDate, "MMMM yyyy")}
        </Text>
        <TouchableOpacity onPress={nextMonth}>
          <Icon name="chevron-right" type="material" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <Card containerStyle={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={[styles.summaryValue, { color: "#2e7d32" }]}>
            {formatCurrency(totalIncome)}
          </Text>
        </Card>
        <Card containerStyle={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Budget</Text>
          <Text style={[styles.summaryValue, { color: "#1976d2" }]}>
            {formatCurrency(totalBudget)}
          </Text>
        </Card>
      </View>

      <Card containerStyle={styles.totalCard}>
        <Text style={styles.totalLabel}>
          {runningBalance >= 0 ? "Unbudgeted Amount" : "Overbudgeted Amount"}
        </Text>
        <Text
          style={[
            styles.totalValue,
            { color: runningBalance >= 0 ? "#2e7d32" : "#d32f2f" },
          ]}
        >
          {formatCurrency(Math.abs(runningBalance))}
        </Text>
      </Card>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!error && budgets.length === 0 ? (
          <Text style={styles.empty}>No budgets found for this month.</Text>
        ) : null}

        {budgets.map((budget, index) => (
          <Card key={budget.id || index} containerStyle={styles.itemCard}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  {budget.category?.name || budget.name}
                </Text>
                <Text style={styles.amount}>
                  {formatCurrency(budget.amount)}
                </Text>
                <Text style={styles.meta}>
                  {safeDateLabel(budget.startDate)} - {safeDateLabel(budget.endDate)}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => navigation.navigate("EditBudget", { budget })}
                >
                  <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnDelete}
                  onPress={async () => {
                    await deleteBudget(budget.id);
                    await loadData();
                  }}
                >
                  <Text style={styles.btnTextDelete}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon={{ name: "add", color: "#fff" }}
        color="#1976d2"
        placement="right"
        onPress={() => navigation.navigate("AddBudget")}
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
  summaryRow: { flexDirection: "row" },
  summaryCard: { flex: 1, margin: 6, borderRadius: 10 },
  summaryLabel: { textAlign: "center", color: "#666", fontSize: 12 },
  summaryValue: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  totalCard: { borderRadius: 10 },
  totalLabel: { textAlign: "center", color: "#666" },
  totalValue: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
  },
  itemCard: { borderRadius: 10 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "600" },
  amount: { marginTop: 4, fontSize: 16, color: "#1976d2", fontWeight: "700" },
  meta: { marginTop: 4, fontSize: 12, color: "#777" },
  empty: { textAlign: "center", color: "#999", marginTop: 32 },
  error: { textAlign: "center", color: "#d32f2f", marginTop: 18 },
  actions: {
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#1976d2",
    borderRadius: 4,
  },
  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  btnDelete: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#d32f2f",
    borderRadius: 4,
  },
  btnTextDelete: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
