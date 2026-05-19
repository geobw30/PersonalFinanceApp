import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Icon, Text } from '@rneui/themed';
import { format, startOfWeek } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { getBudgetReport, getExpensesByMonth } from '../api/client';
import type { BudgetReportItem, Expense } from '../types';

const formatCurrency = (amount: number) => `USh ${amount.toLocaleString('en-UG')}`;

export default function ReportsScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [report, setReport] = useState<BudgetReportItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const [budgetRes, expenseRes] = await Promise.all([
      getBudgetReport(year, month),
      getExpensesByMonth(year, month),
    ]);
    setReport(budgetRes.data);
    setExpenses(expenseRes.data);
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const weeklyByCategory = useMemo(() => {
    const bucket: Record<string, Record<string, number>> = {};
    expenses.forEach((expense) => {
      const week = format(startOfWeek(new Date(expense.date), { weekStartsOn: 1 }), 'dd MMM');
      const category = expense.category?.name || `Category ${expense.categoryId}`;
      if (!bucket[week]) bucket[week] = {};
      bucket[week][category] = (bucket[week][category] || 0) + expense.amount;
    });

    return Object.entries(bucket).map(([week, values]) => ({ week, values }));
  }, [expenses]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}>
          <Icon name='chevron-left' type='material' />
        </TouchableOpacity>
        <Text style={styles.monthText}>{format(selectedDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}>
          <Icon name='chevron-right' type='material' />
        </TouchableOpacity>
      </View>

      <Card containerStyle={styles.card}>
        <Text style={styles.sectionTitle}>Budget vs Actual</Text>
        {report.map((item) => (
          <View key={item.categoryId} style={styles.row}>
            <Text style={styles.name}>{item.categoryName}</Text>
            <Text style={styles.value}>{formatCurrency(item.totalAmount)} / {formatCurrency(item.budgetAmount)}</Text>
          </View>
        ))}
      </Card>

      <Card containerStyle={styles.card}>
        <Text style={styles.sectionTitle}>Weekly Breakdown by Category</Text>
        {weeklyByCategory.map((week) => (
          <View key={week.week} style={styles.weekBlock}>
            <Text style={styles.weekTitle}>Week of {week.week}</Text>
            {Object.entries(week.values)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => (
                <View key={category} style={styles.row}>
                  <Text style={styles.name}>{category}</Text>
                  <Text style={styles.value}>{formatCurrency(amount)}</Text>
                </View>
              ))}
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  monthText: { fontSize: 18, fontWeight: '700' },
  card: { borderRadius: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  weekBlock: { marginBottom: 12, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
  weekTitle: { fontWeight: '600', marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { flex: 1, color: '#333' },
  value: { color: '#111', fontWeight: '600' },
});
