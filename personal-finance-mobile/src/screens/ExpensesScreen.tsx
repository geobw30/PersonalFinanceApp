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
import { deleteExpense, getExpensesByMonth } from "../api/client";
import type { Expense, RootStackParamList } from "../types";

const formatCurrency = (amount: number) =>
  `USh ${amount.toLocaleString("en-UG")}`;

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ExpensesScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(
    async (showOverlay = true) => {
      if (showOverlay) setLoading(true);
      try {
        const { data } = await getExpensesByMonth(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
        );
        setExpenses(data);
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

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {expenses.map((expense) => (
          <Card key={expense.id} containerStyle={styles.itemCard}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{expense.description}</Text>
                <Text style={styles.meta}>
                  {expense.category?.name || "Uncategorized"}
                </Text>
                <Text style={styles.meta}>
                  {format(new Date(expense.date), "dd MMM yyyy")}
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
                    onPress={async () => {
                      await deleteExpense(expense.id);
                      await loadData();
                    }}
                  >
                    <Text style={styles.btnTextDelete}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Card>
        ))}
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
