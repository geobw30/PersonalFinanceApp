import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Icon, Text } from '@rneui/themed';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { getBudgetReport } from '../api/client';
import type { BudgetReportItem } from '../types';

const formatCurrency = (amount: number) => `USh ${amount.toLocaleString('en-UG')}`;

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [report, setReport] = useState<BudgetReportItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const { data } = await getBudgetReport(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
    setReport(data);
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

  const totals = useMemo(() => {
    const budget = report.reduce((sum, item) => sum + item.budgetAmount, 0);
    const spent = report.reduce((sum, item) => sum + item.totalAmount, 0);
    return { budget, spent, remaining: budget - spent };
  }, [report]);

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

      <View style={styles.summaryRow}>
        <Card containerStyle={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Budget</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totals.budget)}</Text>
        </Card>
        <Card containerStyle={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Spent</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totals.spent)}</Text>
        </Card>
      </View>

      <Card containerStyle={styles.summaryWideCard}>
        <Text style={styles.summaryLabel}>{totals.remaining >= 0 ? 'Remaining' : 'Over Budget'}</Text>
        <Text style={[styles.summaryValue, { color: totals.remaining >= 0 ? '#2e7d32' : '#d32f2f' }]}>
          {formatCurrency(Math.abs(totals.remaining))}
        </Text>
      </Card>

      {report.map((item) => {
        const usage = item.budgetAmount > 0 ? (item.totalAmount / item.budgetAmount) * 100 : 0;
        return (
          <Card key={item.categoryId} containerStyle={styles.categoryCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.categoryTitle}>{item.categoryName}</Text>
              <Text>{formatCurrency(item.totalAmount)}</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.min(Math.max(usage, 0), 100)}%`,
                    backgroundColor: usage > 100 ? '#d32f2f' : '#1976d2',
                  },
                ]}
              />
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.smallText}>Budget: {formatCurrency(item.budgetAmount)}</Text>
              <Text style={styles.smallText}>{usage.toFixed(0)}%</Text>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  monthText: { fontSize: 18, fontWeight: '700' },
  summaryRow: { flexDirection: 'row' },
  summaryCard: { flex: 1, borderRadius: 10 },
  summaryWideCard: { borderRadius: 10 },
  summaryLabel: { color: '#666', textAlign: 'center' },
  summaryValue: { textAlign: 'center', fontSize: 16, fontWeight: '700', marginTop: 6 },
  categoryCard: { borderRadius: 10 },
  categoryTitle: { fontSize: 16, fontWeight: '600' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  track: { height: 8, borderRadius: 8, backgroundColor: '#e0e0e0', marginTop: 8, marginBottom: 8 },
  fill: { height: '100%', borderRadius: 8 },
  smallText: { color: '#666', fontSize: 12 },
});
