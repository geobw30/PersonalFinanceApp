import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text } from '@rneui/themed';
import { format } from 'date-fns';
import { getMonthlySummary } from '../api/client';
import type { BudgetSummary } from '../types';

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