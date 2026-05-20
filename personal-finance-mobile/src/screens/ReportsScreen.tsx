import React, { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Divider, Icon, Text } from "@rneui/themed";
import { BarChart, PieChart } from "react-native-chart-kit";
import { format, startOfWeek } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";
import { getBudgetReport, getExpensesByMonth } from "../api/client";
import type { BudgetReportItem, Expense } from "../types";
import LoadingOverlay from "../components/LoadingOverlay";

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

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
  propsForBackgroundLines: {
    strokeDasharray: "4",
    stroke: "#e0e0e0",
  },
  barPercentage: 0.5,
};

const formatCurrency = (amount: number) => amount.toLocaleString("en-UG");

function getWeeklyBreakdown(expenses: Expense[], year: number, month: number) {
  const weeklyData: Record<string, { week: string; start: Date; total: number }> = {};

  expenses.forEach((exp) => {
    const expDate = new Date(exp.date);
    if (expDate.getFullYear() === year && expDate.getMonth() + 1 === month) {
      const start = startOfWeek(expDate, { weekStartsOn: 1 });
      const weekKey = format(start, "MMM dd");

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: `Week of ${weekKey}`,
          start,
          total: 0,
        };
      }
      weeklyData[weekKey].total += exp.amount;
    }
  });

  return Object.values(weeklyData).sort((a, b) => a.start.getTime() - b.start.getTime());
}

function getWeeklyByCategory(
  expenses: Expense[],
  year: number,
  month: number,
  categoryNamesById: Record<number, string>,
) {
  const weeklyData: Record<string, { week: string; start: Date; values: Record<string, number> }> = {};

  expenses.forEach((exp) => {
    const expDate = new Date(exp.date);
    if (expDate.getFullYear() === year && expDate.getMonth() + 1 === month) {
      const start = startOfWeek(expDate, { weekStartsOn: 1 });
      const weekKey = format(start, "MMM dd");
      const categoryName =
        exp.category?.name ||
        categoryNamesById[exp.categoryId] ||
        `Category ${exp.categoryId}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: `Week of ${weekKey}`,
          start,
          values: {},
        };
      }

      weeklyData[weekKey].values[categoryName] =
        (weeklyData[weekKey].values[categoryName] || 0) + exp.amount;
    }
  });

  return Object.values(weeklyData).sort((a, b) => a.start.getTime() - b.start.getTime());
}

export default function ReportsScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [report, setReport] = useState<BudgetReportItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const chartWidth = Math.max(280, Dimensions.get("window").width - 56);

  const loadData = useCallback(
    async (showOverlay = true) => {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      if (showOverlay) setLoading(true);
      try {
        setError("");
        const [budgetRes, expenseRes] = await Promise.all([
          getBudgetReport(year, month),
          getExpensesByMonth(year, month),
        ]);
        setReport(budgetRes.data);
        setExpenses(expenseRes.data);
      } catch {
        setError("Failed to load report data.");
        setReport([]);
        setExpenses([]);
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
    () => report.reduce((s, i) => s + i.budgetAmount, 0),
    [report],
  );

  const totalActual = useMemo(
    () => report.reduce((s, i) => s + i.totalAmount, 0),
    [report],
  );

  const totalVariance = totalBudget - totalActual;

  const topSubCategorySpending = useMemo(
    () =>
      report
        .flatMap((cat) =>
          cat.subCategories.map((sc) => ({
            name: `${cat.categoryName} > ${sc.subCategoryName}`,
            amount: sc.totalAmount,
          })),
        )
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10),
    [report],
  );

  const budgetChartData = useMemo(
    () => ({
      labels: report.slice(0, 6).map((item) => item.categoryName.slice(0, 8)),
      datasets: [
        {
          data: report.slice(0, 6).map((item) => Math.round(item.budgetAmount)),
        },
      ],
    }),
    [report],
  );

  const actualChartData = useMemo(
    () => ({
      labels: report.slice(0, 6).map((item) => item.categoryName.slice(0, 8)),
      datasets: [
        {
          data: report.slice(0, 6).map((item) => Math.round(item.totalAmount)),
        },
      ],
    }),
    [report],
  );

  const pieChartData = useMemo(
    () =>
      report
        .filter((item) => item.totalAmount > 0)
        .slice(0, 8)
        .map((item, idx) => ({
          name: item.categoryName,
          amount: item.totalAmount,
          color: COLORS[idx % COLORS.length],
          legendFontColor: "#333",
          legendFontSize: 11,
        })),
    [report],
  );

  const weeklyBreakdown = useMemo(
    () =>
      getWeeklyBreakdown(
        expenses,
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
      ),
    [expenses, selectedDate],
  );

  const weeklyChartData = useMemo(
    () => ({
      labels: weeklyBreakdown.slice(0, 6).map((w) => w.week.replace("Week of ", "")),
      datasets: [
        {
          data: weeklyBreakdown.slice(0, 6).map((w) => Math.round(w.total)),
        },
      ],
    }),
    [weeklyBreakdown],
  );

  const weeklyByCategory = useMemo(() => {
    const categoryNamesById = report.reduce(
      (acc, item) => {
        acc[item.categoryId] = item.categoryName;
        return acc;
      },
      {} as Record<number, string>,
    );

    return getWeeklyByCategory(
      expenses,
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      categoryNamesById,
    );
  }, [expenses, report, selectedDate]);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={previousMonth}>
            <Icon name="chevron-left" type="material" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{format(selectedDate, "MMMM yyyy")}</Text>
          <TouchableOpacity onPress={nextMonth}>
            <Icon name="chevron-right" type="material" />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.summaryRow}>
          <Card containerStyle={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Budget</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalBudget)}</Text>
          </Card>
          <Card containerStyle={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalActual)}</Text>
          </Card>
          <Card containerStyle={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{totalVariance >= 0 ? "Remaining" : "Over Budget"}</Text>
            <Text
              style={[
                styles.summaryValue,
                { color: totalVariance >= 0 ? "#2e7d32" : "#d32f2f" },
              ]}
            >
              {formatCurrency(Math.abs(totalVariance))}
            </Text>
          </Card>
        </View>

        <Card containerStyle={styles.card}>
          <Text style={styles.sectionTitle}>Budget vs Actual by Category</Text>
          {report.length > 0 ? (
            <>
              <Text style={styles.chartCaption}>Budget (top 6 categories)</Text>
              <BarChart
                data={budgetChartData}
                width={chartWidth}
                height={220}
                fromZero
                showValuesOnTopOfBars
                withHorizontalLabels
                withInnerLines
                chartConfig={chartConfig}
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix=""
              />
              <Text style={styles.chartCaption}>Actual Spent (top 6 categories)</Text>
              <BarChart
                data={actualChartData}
                width={chartWidth}
                height={220}
                fromZero
                showValuesOnTopOfBars
                withHorizontalLabels
                withInnerLines
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(211, 47, 47, ${opacity})`,
                }}
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix=""
              />
            </>
          ) : null}
          {report.length === 0 ? <Text style={styles.empty}>No data for this period.</Text> : null}
          {report.map((item, idx) => {
            const usagePct = item.budgetAmount > 0 ? Math.min((item.totalAmount / item.budgetAmount) * 100, 100) : 0;
            return (
              <View key={item.categoryId} style={styles.blockItem}>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemName}>{item.categoryName}</Text>
                  <Text style={styles.itemValue}>{formatCurrency(item.totalAmount)} / {formatCurrency(item.budgetAmount)}</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                          width: `${usagePct}%`,
                        backgroundColor: COLORS[idx % COLORS.length],
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </Card>

        <Card containerStyle={styles.card}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          {pieChartData.length > 0 ? (
            <PieChart
              data={pieChartData}
              width={chartWidth}
              height={230}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="8"
              absolute
            />
          ) : (
            <Text style={styles.empty}>No category spending data for this period.</Text>
          )}
        </Card>

        <Card containerStyle={styles.card}>
          <Text style={styles.sectionTitle}>Top Sub Category Spending</Text>
          {topSubCategorySpending.length === 0 ? <Text style={styles.empty}>No sub category data available.</Text> : null}
          {topSubCategorySpending.map((item) => (
            <View key={item.name} style={styles.rowBetweenLine}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemValue}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </Card>

        <Card containerStyle={styles.card}>
          <Text style={styles.sectionTitle}>Weekly Expense Breakdown</Text>
          {weeklyBreakdown.length > 0 ? (
            <BarChart
              data={weeklyChartData}
              width={chartWidth}
              height={220}
              fromZero
              showValuesOnTopOfBars
              withHorizontalLabels
              withInnerLines
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
              }}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
            />
          ) : null}
          {weeklyBreakdown.length === 0 ? <Text style={styles.empty}>No expense data for this period.</Text> : null}
          {weeklyBreakdown.map((week) => (
            <View key={week.week} style={styles.rowBetweenLine}>
              <Text style={styles.itemName}>{week.week}</Text>
              <Text style={styles.itemValue}>{formatCurrency(week.total)}</Text>
            </View>
          ))}
        </Card>

        <Card containerStyle={styles.card}>
          <Text style={styles.sectionTitle}>Budget vs Actual Detail</Text>
          {report.length === 0 ? <Text style={styles.empty}>No data for this period.</Text> : null}
          {report.map((item) => {
            const isOpen = !!expanded[item.categoryId];
            const hasSub = item.subCategories.length > 0;
            return (
              <View key={item.categoryId} style={styles.blockItem}>
                <TouchableOpacity
                  disabled={!hasSub}
                  style={styles.rowBetween}
                  onPress={() =>
                    setExpanded((prev) => ({ ...prev, [item.categoryId]: !prev[item.categoryId] }))
                  }
                >
                  <Text style={styles.itemName}>
                    {hasSub ? (isOpen ? "▼ " : "▶ ") : "• "}
                    {item.categoryName}
                  </Text>
                  <Text
                    style={[
                      styles.itemValue,
                      { color: item.remainingAmount < 0 ? "#d32f2f" : "#2e7d32" },
                    ]}
                  >
                    {item.remainingAmount < 0 ? "▲" : "▼"} {formatCurrency(Math.abs(item.remainingAmount))}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.itemSubValue}>
                  Budget: {formatCurrency(item.budgetAmount)} | Actual: {formatCurrency(item.totalAmount)}
                </Text>
                {isOpen && hasSub ? (
                  <View style={styles.subList}>
                    {item.subCategories.map((sc) => (
                      <View key={`${item.categoryId}-${sc.subCategoryId ?? "none"}`} style={styles.rowBetweenLine}>
                        <Text style={styles.subName}>{sc.subCategoryName}</Text>
                        <Text style={styles.subValue}>{formatCurrency(sc.totalAmount)}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                <Divider style={{ marginTop: 10 }} />
              </View>
            );
          })}
        </Card>

        <Card containerStyle={styles.card}>
          <Text style={styles.sectionTitle}>Weekly Breakdown by Category</Text>
          {weeklyByCategory.length === 0 ? <Text style={styles.empty}>No data for this period.</Text> : null}
          {weeklyByCategory.map((week) => (
            <View key={week.week} style={styles.weekBlock}>
              <Text style={styles.weekTitle}>{week.week}</Text>
              {Object.entries(week.values)
                .sort((a, b) => b[1] - a[1])
                .map(([category, amount]) => (
                  <View key={`${week.week}-${category}`} style={styles.rowBetweenLine}>
                    <Text style={styles.itemName}>{category}</Text>
                    <Text style={styles.itemValue}>{formatCurrency(amount)}</Text>
                  </View>
                ))}
            </View>
          ))}
        </Card>
      </ScrollView>

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
  summaryRow: { flexDirection: "row", flexWrap: "wrap" },
  summaryCard: { flexGrow: 1, minWidth: 110, margin: 6, borderRadius: 10 },
  summaryLabel: { textAlign: "center", color: "#666", fontSize: 12 },
  summaryValue: { textAlign: "center", fontSize: 16, fontWeight: "700", marginTop: 4 },
  card: { borderRadius: 10, marginHorizontal: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  chartCaption: { color: "#666", fontSize: 12, marginBottom: 6 },
  chart: { borderRadius: 8, marginBottom: 10 },
  empty: { textAlign: "center", color: "#888", marginVertical: 8 },
  error: { textAlign: "center", color: "#d32f2f", marginVertical: 12 },
  blockItem: { marginBottom: 10 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  rowBetweenLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  itemName: { flex: 1, color: "#333" },
  itemValue: { color: "#111", fontWeight: "700" },
  itemSubValue: { color: "#666", fontSize: 12, marginTop: 4 },
  progressTrack: {
    height: 6,
    backgroundColor: "#e3e3e3",
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: { height: 6, borderRadius: 3 },
  weekBlock: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    marginTop: 2,
    marginBottom: 8,
  },
  weekTitle: { fontWeight: "700", marginBottom: 6 },
  subList: { marginTop: 8, paddingLeft: 14 },
  subName: { flex: 1, color: "#666", fontSize: 12 },
  subValue: { color: "#333", fontSize: 12, fontWeight: "600" },
});
