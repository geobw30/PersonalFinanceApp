import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Text, FAB, Icon } from '@rneui/themed';
import { format } from 'date-fns';
import { RootStackParamList } from '../types';
import { getBudgetsByMonth, deleteBudget } from '../api/client';
import type { Budget } from '../types';

type BudgetsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Budgets'>;

export default function BudgetsScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<BudgetsScreenNavigationProp>();

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await getBudgetsByMonth(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1
      );
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      fetchBudgets();
    }, [fetchBudgets])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBudgets();
    setRefreshing(false);
  }, [fetchBudgets]);

  const handleDelete = async (budgetId: number) => {
    try {
      await deleteBudget(budgetId);
      await fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handlePreviousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const formatCurrency = (amount: number) => {
    return `USh ${amount.toLocaleString('en-UG')}`;
  };

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={handlePreviousMonth}>
          <Icon name="chevron-left" type="material" />
        </TouchableOpacity>
        <Text h4>{format(selectedDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Icon name="chevron-right" type="material" />
        </TouchableOpacity>
      </View>

      {/* Total Budget */}
      <Card containerStyle={styles.totalCard}>
        <Card.Title>Total Budget</Card.Title>
        <Text h3 style={styles.totalAmount}>
          {formatCurrency(budgets.reduce((total, budget) => total + budget.amount, 0))}
        </Text>
      </Card>

      {/* Budget List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {budgets.map((budget) => (
          <Card key={budget.id} containerStyle={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text h4>{budget.category?.name}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditBudget', { budget })}
                  style={styles.actionButton}
                >
                  <Icon name="edit" type="material" size={20} color="#2196F3" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(budget.id)}
                  style={styles.actionButton}
                >
                  <Icon name="delete" type="material" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
            <Text h3 style={styles.amount}>
              {formatCurrency(budget.amount)}
            </Text>
            {budget.notes && (
              <Text style={styles.notes}>{budget.notes}</Text>
            )}
          </Card>
        ))}
      </ScrollView>

      {/* Add Budget FAB */}
      <FAB
        icon={{ name: 'add', color: 'white' }}
        color="#2196F3"
        placement="right"
        onPress={() => navigation.navigate('AddBudget')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  totalCard: {
    margin: 16,
    borderRadius: 8,
  },
  totalAmount: {
    textAlign: 'center',
    color: '#2196F3',
  },
  scrollView: {
    flex: 1,
  },
  budgetCard: {
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  amount: {
    color: '#2196F3',
    marginVertical: 8,
  },
  notes: {
    color: '#666',
    marginTop: 8,
  },
}); 