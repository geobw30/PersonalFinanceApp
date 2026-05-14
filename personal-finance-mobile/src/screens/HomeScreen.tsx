import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, Text, Icon } from '@rneui/themed';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { getBudgetReport } from '../api/client';
import type { BudgetReportItem } from '../types';

export default function HomeScreen() {
  const [report, setReport] = useState<BudgetReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchReport = useCallback(async () => {
    try {
      const response = await getBudgetReport(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1
      );
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  React.useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReport();
    setRefreshing(false);
  }, [fetchReport]);

  const formatCurrency = (amount: number) => `USh ${amount.toLocaleString('en-UG')}`;

  const totalBudget = report.reduce((s, i) => s + i.budgetAmount, 0);
  const totalSpent = report.reduce((s, i) => s + i.totalAmount, 0);
  const totalRemaining = totalBudget - totalSpent;

  const handlePrevMonth = () =>
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <Icon name="chevron-left" type="material" size={28} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{format(selectedDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Icon name="chevron-right" type="material" size={28} />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <Card containerStyle={[styles.summaryCard, { borderTopColor: '#2196F3' }]}>
          <Text style={styles.summaryLabel}>Budget</Text>
          <Text style={[styles.summaryValue, { color: '#2196F3' }]}>{formatCurrency(totalBudget)}</Text>
        </Card>
        <Card containerStyle={[styles.summaryCard, { borderTopColor: '#F44336' }]}>
          <Text style={styles.summaryLabel}>Spent</Text>
          <Text style={[styles.summaryValue, { color: '#F44336' }]}>{formatCurrency(totalSpent)}</Text>
        </Card>
        <Card containerStyle={[styles.summaryCard, { borderTopColor: totalRemaining >= 0 ? '#4CAF50' : '#FF9800' }]}>
          <Text style={styles.summaryLabel}>{totalRemaining >= 0 ? 'Remaining' : 'Over'}</Text>
          <Text style={[styles.summaryValue, { color: totalRemaining >= 0 ? '#4CAF50' : '#FF9800' }]}>
            {formatCurrency(Math.abs(totalRemaining))}
          </Text>
        </Card>
      </View>

      {/* Category Breakdown */}
      {report.length === 0 ? (
        <Card containerStyle={styles.emptyCard}>
          <Text style={styles.emptyText}>No budget data for this period.</Text>
        </Card>
      ) : (
        report.map((item) => {
          const pct = item.budgetAmount > 0 ? Math.min((item.totalAmount / item.budgetAmount) * 100, 100) : 0;
          const over = item.totalAmount > item.budgetAmount;
          return (
            <Card key={item.categoryId} containerStyle={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{item.categoryName}</Text>
                <Text style={[styles.categoryAmount, { color: over ? '#F44336' : '#333' }]}>
                  {formatCurrency(item.totalAmount)}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: over ? '#F44336' : '#2196F3' }]} />
              </View>
              <View style={styles.categoryFooter}>
                <Text style={styles.footerText}>Budget: {formatCurrency(item.budgetAmount)}</Text>
                <Text style={[styles.footerText, { color: over ? '#F44336' : '#4CAF50' }]}>
                  {over ? '▲' : '▼'} {formatCurrency(Math.abs(item.remainingAmount))}
                </Text>
              </View>
              {item.subCategories.length > 0 && (
                <View style={styles.subCatContainer}>
                  {item.subCategories.map((sc) => (
                    <View key={sc.subCategoryId ?? 'u'} style={styles.subCatRow}>
                      <Text style={styles.subCatName}>• {sc.subCategoryName}</Text>
                      <Text style={styles.subCatAmount}>{formatCurrency(sc.totalAmount)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    elevation: 2,
  },
  monthText: { fontSize: 18, fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 4 },
  summaryCard: { flex: 1, margin: 4, padding: 8, borderTopWidth: 3, borderRadius: 8 },
  summaryLabel: { fontSize: 11, color: '#888', textAlign: 'center' },
  summaryValue: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginTop: 4 },
  categoryCard: { marginHorizontal: 12, marginVertical: 4, borderRadius: 8, padding: 12 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  categoryName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  categoryAmount: { fontSize: 16, fontWeight: 'bold' },
  progressBar: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 3 },
  categoryFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 12, color: '#666' },
  subCatContainer: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 6 },
  subCatRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  subCatName: { fontSize: 12, color: '#666' },
  subCatAmount: { fontSize: 12, color: '#333' },
  emptyCard: { margin: 16, borderRadius: 8, padding: 20 },
  emptyText: { textAlign: 'center', color: '#888', fontSize: 14 },
});


export default function HomeScreen() {
  const [summary, setSummary] = useState<BudgetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date();

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await getMonthlySummary(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1
      );
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `USh ${amount.toLocaleString('en-UG')}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.headerCard}>
        <Text h4 style={styles.monthText}>
          {format(currentDate, 'MMMM yyyy')}
        </Text>
      </Card>

      {summary.map((item) => (
        <Card key={item.categoryId} containerStyle={styles.summaryCard}>
          <Text h4>{item.categoryName}</Text>
          <View style={styles.budgetRow}>
            <Text>Budget:</Text>
            <Text style={styles.amount}>{formatCurrency(item.budgetAmount)}</Text>
          </View>
          <View style={styles.budgetRow}>
            <Text>Spent:</Text>
            <Text style={styles.amount}>{formatCurrency(item.spentAmount)}</Text>
          </View>
          <View style={styles.budgetRow}>
            <Text>Remaining:</Text>
            <Text style={[
              styles.amount,
              item.remainingAmount < 0 ? styles.negative : styles.positive
            ]}>
              {formatCurrency(item.remainingAmount)}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${Math.min(item.percentageUsed, 100)}%` },
                item.percentageUsed > 100 ? styles.overBudget : null
              ]} 
            />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  monthText: {
    textAlign: 'center',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  amount: {
    fontWeight: 'bold',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  overBudget: {
    backgroundColor: '#F44336',
  },
}); 